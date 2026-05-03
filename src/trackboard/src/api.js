/**
 * API client — thin wrappers around fetch.
 * All functions return the updated full state object on success,
 * and throw an Error with a human-readable message on failure.
 */

const BASE = "/api";

async function request(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data;
}

export const api = {
  // Full state — polled by all clients
  getState: () => request("GET", "/state"),

  // Admin auth — returns { token }
  login: (password) => request("POST", "/auth", { password }),

  // Score update — returns full updated state
  setScore: (token, group, roundIndex, value) =>
    request("PUT", "/scores", { group, roundIndex, value }, token),

  // Set active round (0 = not started)
  setActiveRound: (token, round) =>
    request("PUT", "/active-round", { round }, token),

  // Save round config (URLs, titles, descriptions)
  saveRounds: (token, rounds) =>
    request("PUT", "/rounds", { rounds }, token),

  // Participant registration
  register: (name, group) =>
    request("POST", "/participants", { name, group }),

  // Remove participant (admin)
  removeParticipant: (token, name) =>
    request("DELETE", `/participants/${encodeURIComponent(name)}`, undefined, token),

  // Full reset (admin)
  reset: (token) => request("POST", "/reset", {}, token),
};
