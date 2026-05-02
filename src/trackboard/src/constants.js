/**
 * All app-level constants.
 *
 * Runtime configuration is read from Vite env variables so the same
 * Docker image can be used across environments without a rebuild
 * (values are baked in at build time — see README for the K8s
 * ConfigMap / Secret pattern to supply them).
 *
 * Prefix VITE_ makes variables available in the browser bundle.
 * Never put secrets in VITE_ vars; they are public.
 * The admin password is hashed at runtime (see useAdminAuth hook).
 */

export const NUM_ROUNDS = Number(import.meta.env.VITE_NUM_ROUNDS ?? 6);

export const TEAMS = ["Pentesters", "Defenders"];

export const TEAM_META = {
  Pentesters: { color: "orange", cssVar: "var(--orange)", icon: "⚔️" },
  Defenders:  { color: "cyan",   cssVar: "var(--cyan)",   icon: "🛡️" },
};

/**
 * Admin password.
 *
 * Set VITE_ADMIN_PASSWORD at build time via a K8s Secret + build arg,
 * OR keep the default and change it before building your image.
 * See docs/configuration.md for the recommended Secret pattern.
 */
export const ADMIN_PASSWORD =
  import.meta.env.VITE_ADMIN_PASSWORD ?? "devopsday2026";

export const EVENT_NAME =
  import.meta.env.VITE_EVENT_NAME ?? "DevOpsDay Geneva";

export const EVENT_DATE =
  import.meta.env.VITE_EVENT_DATE ?? "May 2026";

/** localStorage keys */
export const STORAGE_KEYS = {
  STATE:   "ctf-state",
  SESSION: "ctf-session",
};

/** Default per-round shape */
export function makeDefaultRounds(n = NUM_ROUNDS) {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    title: `Challenge ${i + 1}`,
    url: "",
    description: "",
  }));
}

/** Full default application state */
export function makeDefaultState() {
  return {
    rounds: makeDefaultRounds(),
    activeRound: 1,
    scores: Object.fromEntries(TEAMS.map((t) => [t, Array(NUM_ROUNDS).fill(false)])),
    participants: [],
  };
}
