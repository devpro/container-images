// Group A: Blue / Red / Blue
// Group B: Red  / Blue / Red
// This mirrors server/index.js defaultState().groupTracks
export const GROUP_TRACKS = [
  { A: "blue", B: "red"  },
  { A: "red",  B: "blue" },
  { A: "blue", B: "red"  },
];

export const GROUPS = ["A", "B"];

export const GROUP_META = {
  A: { label: "Group A", color: "orange", cssVar: "var(--orange)", icon: "⚔️" },
  B: { label: "Group B", color: "cyan",   cssVar: "var(--cyan)",   icon: "🛡️" },
};

export const TRACK_META = {
  blue: { label: "Blue Team", color: "#3b82f6", icon: "🔵", desc: "Defender" },
  red:  { label: "Red Team",  color: "#ef4444", icon: "🔴", desc: "Attacker" },
};

export const NUM_ROUNDS = 3;

// How often the frontend polls for state updates (ms)
export const POLL_INTERVAL = 5000;

// Session storage key for participant session (this is fine in localStorage —
// it's just the current user's name/group, not shared state)
export const SESSION_KEY = "ctf:session";
export const ADMIN_TOKEN_KEY = "ctf:adminToken";
