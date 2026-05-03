# Track board — CTF Events Companion

A lightweight, production-grade web app for running a an event using tracks.

**Stack:** React + Vite (frontend) · Express (API) · JSON file on a PVC (state)

## Event structure

Round | Group A track | Group B track
------|---------------|--------------
1     | 🔵 Blue Team  | 🔴 Red Team
2     | 🔴 Red Team   | 🔵 Blue Team
3     | 🔵 Blue Team  | 🔴 Red Team

**Score** = number of participants who completed their track per round (entered manually by admin from the Instruqt dashboard).
The scoreboard shows per-round counts and cumulative totals for Group A vs Group B.

## Project structure

```txt
├── server/
│   └── index.js          # Express API — state, scores, participants
├── src/
│   ├── main.jsx           # React entry point
│   ├── index.css          # Global reset
│   ├── App.jsx            # All views: participant, scoreboard, admin
│   ├── api.js             # Fetch wrappers for /api/*
│   └── constants.js       # Group/track config, poll interval
├── data/
│   └── state.json         # Runtime state (gitignored, mounted via PVC)
├── Dockerfile             # Multi-stage: deps → build → node:alpine runtime
└── vite.config.js         # Proxies /api → localhost:3000 in dev
```

## Local development

Install packages:

```bash
npm install
```

Starts local development server — Concurrent run with Express (port 3000) and Vite dev server (port 5173):

```bash
npm run dev
```

> [!INFO]
> Vite proxies `/api` requests to the Express server automatically.

Open [http://localhost:5173](http://localhost:5173).

### Environment variables (server)

Set these in your shell or a `.env` file (never committed):

Variable         | Default             | Description
-----------------|---------------------|---------------------------------------
`PORT`           | `3000`              | Express listen port
`DATA_FILE`      | `./data/state.json` | Path to JSON state file
`ADMIN_PASSWORD` | `devopsday2026`     | Admin panel password — **change this**
`EVENT_NAME`     | `DevOpsDay Geneva`  | Shown in UI
`EVENT_DATE`     | `May 2026`          | Shown in UI

## Packaging

Build a new container image:

```bash
docker build -t ghcr.io/devpro/trackboard:1.0.0 .
```

Test the image:

```bash
docker run --rm -p 3000:3000 \
  -e ADMIN_PASSWORD=mysecretpassword \
  -v $(pwd)/data:/app/data \
  ghcr.io/devpro/trackboard:1.0.0
```

> [!INFO]
> The `-v $(pwd)/data:/app/data` mount persists state across container restarts.
> In Kubernetes this is a PVC (see below).

Open [localhost:3000](http://localhost:3000).

## Before the event checklist

- [ ] Set `ADMIN_PASSWORD` in the K8s Secret
- [ ] Deploy and open the app
- [ ] Admin → Setup: paste all 6 Instruqt track URLs (Blue + Red per round) and titles
- [ ] Open `📺 Scoreboard` in a browser tab and put it fullscreen on the room projector
- [ ] Keep Admin → Scores open on your laptop
- [ ] As each round completes, check Instruqt dashboard for completion counts and enter them with the +/− steppers
