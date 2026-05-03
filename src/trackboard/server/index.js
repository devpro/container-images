/**
 * CTF Companion — Express API server
 *
 * Serves:
 *   - GET/POST /api/*  — JSON state API backed by a JSON file on disk
 *   - /*               — static React build (in production)
 *
 * The entire app state lives in DATA_FILE (one JSON object).
 * For a 30-person event this is perfectly sufficient and trivially backed
 * by a Kubernetes PersistentVolumeClaim.
 *
 * Start dev:  node server/index.js
 * Start prod: NODE_ENV=production node server/index.js
 */

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

// ── Config ────────────────────────────────────────────────────────────────────
const PORT      = Number(process.env.PORT      ?? 3000);
const DATA_FILE = process.env.DATA_FILE ?? path.join(ROOT, "data", "state.json");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "devopsday2026";

// ── Default state ─────────────────────────────────────────────────────────────
//
// rounds[i].tracks:
//   groupA: "blue" | "red"   ← which track type group A does this round
//   groupB is always the opposite
//
// scores[groupId][roundIndex] = number of completions (set by admin)
//
function defaultState() {
  return {
    event: {
      name: process.env.EVENT_NAME ?? "DevOpsDay Geneva",
      date: process.env.EVENT_DATE ?? "May 2026",
    },
    activeRound: 0, // 0 = not started, 1-3 = active round index
    rounds: [
      { id: 1, title: "Round 1", blueUrl: "", redUrl: "", description: "" },
      { id: 2, title: "Round 2", blueUrl: "", redUrl: "", description: "" },
      { id: 3, title: "Round 3", blueUrl: "", redUrl: "", description: "" },
    ],
    // Group A: Blue / Red / Blue
    // Group B: Red  / Blue / Red
    groupTracks: [
      { A: "blue", B: "red"  },
      { A: "red",  B: "blue" },
      { A: "blue", B: "red"  },
    ],
    scores: {
      A: [0, 0, 0],
      B: [0, 0, 0],
    },
    participants: [], // { name, group, joinedAt }
  };
}

// ── File I/O ──────────────────────────────────────────────────────────────────
function readState() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return defaultState();
  }
}

function writeState(state) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), "utf8");
}

// ── Express app ───────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());

// CORS — allow Vite dev server (port 5173) to talk to the API (port 3000)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Simple token auth for write endpoints
function requireAdmin(req, res, next) {
  const auth = req.headers["authorization"] ?? "";
  const token = auth.replace("Bearer ", "");
  if (token !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// ── API routes ────────────────────────────────────────────────────────────────

// Full state (used by frontend on load and via polling)
app.get("/api/state", (req, res) => {
  res.json(readState());
});

// Admin login — just validates the password, returns it as a token
app.post("/api/auth", (req, res) => {
  const { password } = req.body ?? {};
  if (password === ADMIN_PASSWORD) {
    res.json({ token: ADMIN_PASSWORD });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

// Update scores for one group, one round
// Body: { group: "A"|"B", roundIndex: 0|1|2, value: number }
app.put("/api/scores", requireAdmin, (req, res) => {
  const { group, roundIndex, value } = req.body;
  if (!["A", "B"].includes(group) || roundIndex < 0 || roundIndex > 2 || typeof value !== "number") {
    return res.status(400).json({ error: "Invalid payload" });
  }
  const state = readState();
  state.scores[group][roundIndex] = Math.max(0, value);
  writeState(state);
  res.json(state);
});

// Set active round
// Body: { round: 0|1|2|3 }
app.put("/api/active-round", requireAdmin, (req, res) => {
  const { round } = req.body;
  if (typeof round !== "number" || round < 0 || round > 3) {
    return res.status(400).json({ error: "Invalid round" });
  }
  const state = readState();
  state.activeRound = round;
  writeState(state);
  res.json(state);
});

// Update round config (URLs, title, description)
// Body: rounds array
app.put("/api/rounds", requireAdmin, (req, res) => {
  const { rounds } = req.body;
  if (!Array.isArray(rounds) || rounds.length !== 3) {
    return res.status(400).json({ error: "Invalid rounds" });
  }
  const state = readState();
  state.rounds = rounds;
  writeState(state);
  res.json(state);
});

// Register participant
// Body: { name, group }
app.post("/api/participants", (req, res) => {
  const { name, group } = req.body ?? {};
  if (!name?.trim() || !["A", "B"].includes(group)) {
    return res.status(400).json({ error: "name and group (A or B) are required" });
  }
  const state = readState();
  const trimmed = name.trim();
  if (state.participants.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
    return res.status(409).json({ error: "Handle already taken" });
  }
  state.participants.push({ name: trimmed, group, joinedAt: new Date().toISOString() });
  writeState(state);
  res.status(201).json(state);
});

// Remove participant (admin only)
app.delete("/api/participants/:name", requireAdmin, (req, res) => {
  const state = readState();
  state.participants = state.participants.filter(
    (p) => p.name.toLowerCase() !== req.params.name.toLowerCase()
  );
  writeState(state);
  res.json(state);
});

// Reset everything
app.post("/api/reset", requireAdmin, (req, res) => {
  const fresh = defaultState();
  writeState(fresh);
  res.json(fresh);
});

// Health check
app.get("/healthz", (req, res) => res.send("ok"));

// ── Static frontend (production) ──────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  const distDir = path.join(ROOT, "dist");
  app.use(express.static(distDir));
  // SPA fallback
  app.get("*", (req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`CTF server running on port ${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
  console.log(`Environment: ${process.env.NODE_ENV ?? "development"}`);
});
