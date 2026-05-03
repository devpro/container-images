import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "./api.js";
import {
  GROUPS,
  GROUP_META,
  GROUP_TRACKS,
  TRACK_META,
  NUM_ROUNDS,
  POLL_INTERVAL,
  SESSION_KEY,
  ADMIN_TOKEN_KEY,
} from "./constants.js";

// ─── CSS ─────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@700;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:         #050a0a;
    --bg2:        #0a1414;
    --bg3:        #0f1e1e;
    --green:      #00ff88;
    --green-dim:  #00a855;
    --green-dark: #003322;
    --orange:     #f97316;
    --cyan:       #22d3ee;
    --blue:       #3b82f6;
    --red-track:  #ef4444;
    --red-ui:     #ff4444;
    --text:       #b0ffd8;
    --text-dim:   #4a8a6a;
    --border:     #0f3d2a;
    --glow:       0 0 12px #00ff8844;
    --glow-strong:0 0 24px #00ff8866;
  }

  body { background:var(--bg); color:var(--text); font-family:'Share Tech Mono',monospace; overflow-x:hidden; }

  .scanline {
    position:fixed; inset:0; pointer-events:none; z-index:9999;
    background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,136,0.015) 2px,rgba(0,255,136,0.015) 4px);
  }

  /* ── HEADER ── */
  .header {
    border-bottom:1px solid var(--border); padding:14px 28px;
    display:flex; align-items:center; justify-content:space-between;
    background:linear-gradient(180deg,#0a1a14 0%,var(--bg) 100%);
    position:sticky; top:0; z-index:100; backdrop-filter:blur(8px);
    flex-wrap:wrap; gap:10px;
  }
  .header-logo { display:flex; align-items:center; gap:12px; }
  .logo-mark {
    width:34px; height:34px; border:2px solid var(--green);
    display:flex; align-items:center; justify-content:center;
    font-family:'Orbitron',sans-serif; font-size:12px; font-weight:900;
    color:var(--green); position:relative; flex-shrink:0;
    animation:pulse-border 3s ease-in-out infinite;
  }
  @keyframes pulse-border { 0%,100%{box-shadow:0 0 8px #00ff8844}50%{box-shadow:0 0 20px #00ff8888} }
  .logo-mark::before { content:''; position:absolute; inset:3px; border:1px solid var(--green-dim); opacity:0.4; }
  .logo-text { font-family:'Orbitron',sans-serif; font-size:12px; font-weight:700; letter-spacing:3px; color:var(--green); }
  .logo-sub  { font-size:9px; color:var(--text-dim); letter-spacing:2px; margin-top:2px; }
  .header-nav { display:flex; gap:6px; flex-wrap:wrap; }
  .nav-btn {
    background:transparent; border:1px solid var(--border); color:var(--text-dim);
    padding:5px 13px; font-family:'Share Tech Mono',monospace; font-size:11px;
    letter-spacing:2px; cursor:pointer; transition:all 0.2s; text-transform:uppercase;
  }
  .nav-btn:hover,.nav-btn.active { border-color:var(--green); color:var(--green); box-shadow:var(--glow); }
  .nav-btn.danger { border-color:#3a1010; color:#884444; }
  .nav-btn.danger:hover { border-color:var(--red-ui); color:var(--red-ui); }

  /* ── PRIMITIVES ── */
  .section { max-width:1000px; margin:0 auto; padding:28px 20px 60px; }
  .card { background:var(--bg2); border:1px solid var(--border); padding:20px; margin-bottom:14px; position:relative; overflow:hidden; }
  .card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--green-dim),transparent); }
  .card-title { font-family:'Orbitron',sans-serif; font-size:10px; letter-spacing:3px; color:var(--green-dim); margin-bottom:14px; text-transform:uppercase; }

  .input { background:var(--bg3); border:1px solid var(--border); color:var(--text); padding:9px 13px; font-family:'Share Tech Mono',monospace; font-size:13px; width:100%; outline:none; transition:border-color 0.2s; }
  .input:focus { border-color:var(--green-dim); box-shadow:var(--glow); }
  .input::placeholder { color:var(--text-dim); }
  .input-label { font-size:10px; letter-spacing:2px; color:var(--text-dim); margin-bottom:6px; display:block; text-transform:uppercase; }

  .btn { background:transparent; border:1px solid var(--green-dim); color:var(--green); padding:9px 22px; font-family:'Share Tech Mono',monospace; font-size:12px; letter-spacing:2px; cursor:pointer; transition:all 0.2s; text-transform:uppercase; display:inline-flex; align-items:center; gap:8px; }
  .btn:hover { background:var(--green-dark); box-shadow:var(--glow-strong); }
  .btn:active { transform:scale(0.98); }
  .btn:disabled { opacity:0.4; cursor:not-allowed; }
  .btn-full { width:100%; justify-content:center; }
  .btn-sm { padding:5px 12px; font-size:11px; }
  .btn-red { border-color:var(--red-ui); color:var(--red-ui); }
  .btn-red:hover { background:#1a0000; }
  .btn-ghost { border-color:transparent; color:var(--text-dim); }
  .btn-ghost:hover { border-color:var(--border); color:var(--text); background:transparent; box-shadow:none; }

  .live-dot { width:6px; height:6px; background:var(--green); border-radius:50%; animation:blink 1s ease-in-out infinite; display:inline-block; }
  @keyframes blink { 0%,100%{opacity:1}50%{opacity:0.2} }

  /* ── SCOREBOARD (fullscreen) ── */
  .sb-page { min-height:100vh; display:flex; flex-direction:column; background:var(--bg); }

  .sb-header { text-align:center; padding:28px 24px 16px; border-bottom:1px solid var(--border); }
  .sb-event  { font-family:'Orbitron',sans-serif; font-size:10px; letter-spacing:5px; color:var(--text-dim); margin-bottom:6px; }
  .sb-title  { font-family:'Orbitron',sans-serif; font-size:clamp(20px,3.5vw,36px); font-weight:900; letter-spacing:6px; color:var(--green); text-shadow:0 0 30px #00ff8844; }
  .sb-live   { display:inline-flex; align-items:center; gap:8px; font-size:10px; letter-spacing:3px; color:var(--green-dim); margin-top:10px; }

  /* Big group totals */
  .sb-totals { display:grid; grid-template-columns:1fr 1fr; border-bottom:1px solid var(--border); }
  .sb-total  { padding:24px 36px; display:flex; align-items:center; gap:24px; position:relative; overflow:hidden; }
  .sb-total.orange { border-right:1px solid var(--border); background:linear-gradient(135deg,#0d0500 0%,var(--bg) 60%); }
  .sb-total.cyan   { background:linear-gradient(135deg,#00080d 0%,var(--bg) 60%); }
  .sb-total::after { content:''; position:absolute; bottom:0; left:0; right:0; height:3px; }
  .sb-total.orange::after { background:linear-gradient(90deg,transparent,var(--orange),transparent); }
  .sb-total.cyan::after   { background:linear-gradient(90deg,transparent,var(--cyan),transparent); }
  .sb-total-icon  { font-size:36px; flex-shrink:0; }
  .sb-total-body  { flex:1; min-width:0; }
  .sb-total-label { font-family:'Orbitron',sans-serif; font-size:11px; letter-spacing:4px; margin-bottom:6px; }
  .sb-total-label.orange { color:var(--orange); }
  .sb-total-label.cyan   { color:var(--cyan); }
  .sb-total-score { font-family:'Orbitron',sans-serif; line-height:1; }
  .sb-total-score.orange { font-size:clamp(52px,9vw,88px); color:var(--orange); text-shadow:0 0 40px #f9731655; }
  .sb-total-score.cyan   { font-size:clamp(52px,9vw,88px); color:var(--cyan);   text-shadow:0 0 40px #22d3ee55; }
  .sb-total-sub { font-size:11px; color:var(--text-dim); letter-spacing:1px; margin-top:6px; }

  /* Leader banner */
  .sb-leader { text-align:center; padding:10px; font-family:'Orbitron',sans-serif; font-size:11px; letter-spacing:4px; border-bottom:1px solid var(--border); background:var(--bg2); }
  .sb-leader.tied   { color:var(--text-dim); }
  .sb-leader.orange { color:var(--orange); background:#0a0500; }
  .sb-leader.cyan   { color:var(--cyan);   background:#00080d; }

  /* Per-round breakdown */
  .sb-rounds { padding:20px 28px 28px; flex:1; }
  .sb-rounds-title { font-family:'Orbitron',sans-serif; font-size:10px; letter-spacing:3px; color:var(--text-dim); margin-bottom:16px; text-align:center; }

  .sb-round-table { display:grid; grid-template-columns:auto repeat(${NUM_ROUNDS},1fr); gap:1px; background:var(--border); border:1px solid var(--border); }
  .sb-cell { background:var(--bg2); padding:12px 16px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; }
  .sb-cell.header-row { background:var(--bg3); }
  .sb-cell.group-col  { align-items:flex-start; min-width:120px; }

  .sb-cell-round-title { font-family:'Orbitron',sans-serif; font-size:10px; letter-spacing:2px; color:var(--text-dim); }
  .sb-cell-round-title.active { color:var(--green); }
  .sb-cell-track { font-size:9px; letter-spacing:1px; margin-top:2px; }

  .sb-cell-group-name { font-family:'Orbitron',sans-serif; font-size:11px; letter-spacing:2px; }
  .sb-cell-group-name.orange { color:var(--orange); }
  .sb-cell-group-name.cyan   { color:var(--cyan); }
  .sb-cell-group-sub { font-size:9px; color:var(--text-dim); }

  .sb-score { font-family:'Orbitron',sans-serif; font-size:28px; font-weight:700; line-height:1; }
  .sb-score.orange { color:var(--orange); text-shadow:0 0 16px #f9731644; }
  .sb-score.cyan   { color:var(--cyan);   text-shadow:0 0 16px #22d3ee44; }
  .sb-score.zero   { color:var(--text-dim); }
  .sb-score-sub { font-size:9px; color:var(--text-dim); letter-spacing:1px; }

  .sb-cell.future { opacity:0.35; }
  .sb-cell.active-round { outline:1px solid var(--green-dim); outline-offset:-2px; }

  /* ── ADMIN SCORE PANEL ── */
  .score-table { display:grid; grid-template-columns:auto repeat(${NUM_ROUNDS},1fr) auto; gap:10px; align-items:start; }
  .score-col-header { font-family:'Orbitron',sans-serif; font-size:10px; letter-spacing:2px; color:var(--text-dim); text-align:center; padding:6px 0; border-bottom:1px solid var(--border); cursor:pointer; transition:color 0.2s; user-select:none; }
  .score-col-header:hover { color:var(--green); }
  .score-col-header.active { color:var(--green); }
  .score-col-header.active::before { content:'▶ '; }
  .score-row-label { font-family:'Orbitron',sans-serif; font-size:11px; letter-spacing:2px; padding:8px 12px 0 0; }
  .score-row-label.orange { color:var(--orange); }
  .score-row-label.cyan   { color:var(--cyan); }
  .score-total-cell { padding:8px 0 0 8px; font-family:'Orbitron',sans-serif; font-size:22px; font-weight:700; }
  .score-total-cell.orange { color:var(--orange); }
  .score-total-cell.cyan   { color:var(--cyan); }

  .stepper { background:var(--bg3); border:1px solid var(--border); padding:10px 8px; display:flex; flex-direction:column; align-items:center; gap:6px; }
  .stepper.orange { border-color:#4a2010; }
  .stepper.cyan   { border-color:#0a3a50; }
  .stepper.active-round { outline:1px solid var(--green-dim); outline-offset:-2px; }
  .stepper-track { font-size:9px; letter-spacing:1px; color:var(--text-dim); }
  .stepper-val { font-family:'Orbitron',sans-serif; font-size:26px; font-weight:700; line-height:1; }
  .stepper-val.orange { color:var(--orange); }
  .stepper-val.cyan   { color:var(--cyan); }
  .stepper-val.zero   { color:var(--text-dim); }
  .stepper-max { font-size:9px; color:var(--text-dim); }
  .stepper-btns { display:flex; gap:4px; width:100%; }
  .stepper-btn { flex:1; border:1px solid var(--border); background:transparent; color:var(--text-dim); font-family:'Share Tech Mono',monospace; font-size:16px; cursor:pointer; padding:4px 0; transition:all 0.15s; text-align:center; }
  .stepper-btn:hover:not(:disabled) { border-color:var(--green-dim); color:var(--green); background:var(--green-dark); }
  .stepper-btn:active:not(:disabled) { transform:scale(0.95); }
  .stepper-btn:disabled { opacity:0.25; cursor:not-allowed; }

  /* ── PARTICIPANT VIEW ── */
  .p-header { text-align:center; padding:48px 24px 28px; }
  .p-title { font-family:'Orbitron',sans-serif; font-size:clamp(20px,5vw,38px); font-weight:900; letter-spacing:6px; color:var(--green); text-shadow:0 0 40px #00ff8855; margin-bottom:8px; line-height:1.1; }
  .p-sub   { font-size:10px; letter-spacing:4px; color:var(--text-dim); }

  .group-select { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin:14px 0; }
  .group-option { border:1px solid; padding:18px; text-align:center; cursor:pointer; transition:all 0.3s; background:var(--bg2); }
  .group-option.orange { border-color:#7a3a10; color:var(--text-dim); }
  .group-option.orange:hover,.group-option.orange.selected { border-color:var(--orange); color:var(--orange); background:#0f0800; box-shadow:0 0 20px #f9731633; }
  .group-option.cyan { border-color:#104a5a; color:var(--text-dim); }
  .group-option.cyan:hover,.group-option.cyan.selected { border-color:var(--cyan); color:var(--cyan); background:#00080f; box-shadow:0 0 20px #22d3ee33; }
  .group-icon { font-size:26px; margin-bottom:8px; }
  .group-name { font-family:'Orbitron',sans-serif; font-size:12px; letter-spacing:3px; }
  .group-count { font-size:10px; color:var(--text-dim); margin-top:6px; }

  /* Active round card */
  .round-card { border:1px solid var(--green-dim); padding:26px; text-align:center; position:relative; overflow:hidden; background:var(--bg2); margin:18px 0; }
  .round-card::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at center,#00ff8808 0%,transparent 70%); pointer-events:none; }
  .round-card-num   { font-family:'Orbitron',sans-serif; font-size:10px; letter-spacing:4px; color:var(--text-dim); margin-bottom:6px; }
  .round-card-title { font-family:'Orbitron',sans-serif; font-size:18px; font-weight:700; color:var(--green); margin-bottom:6px; text-shadow:0 0 20px #00ff8844; }
  .round-card-track { display:inline-flex; align-items:center; gap:8px; font-size:12px; letter-spacing:2px; padding:4px 12px; border:1px solid; margin-bottom:16px; }
  .round-card-track.blue { border-color:#3b82f6; color:#3b82f6; background:#050d1a; }
  .round-card-track.red  { border-color:#ef4444; color:#ef4444; background:#1a0505; }
  .round-card-desc { font-size:12px; color:var(--text-dim); margin-bottom:18px; line-height:1.6; }
  .track-link { display:inline-flex; align-items:center; gap:10px; border:1px solid var(--green); color:var(--green); background:var(--green-dark); padding:12px 24px; font-family:'Share Tech Mono',monospace; font-size:13px; letter-spacing:2px; text-decoration:none; text-transform:uppercase; transition:all 0.2s; }
  .track-link:hover { box-shadow:var(--glow-strong); background:#004422; }
  .no-url { color:var(--text-dim); font-size:12px; letter-spacing:2px; padding:14px; border:1px dashed var(--border); }
  .waiting { color:var(--text-dim); font-size:12px; letter-spacing:2px; padding:20px; border:1px dashed var(--border); text-align:center; }

  /* Mini scoreboard for participants */
  .mini-sb-grid { display:grid; grid-template-columns:auto repeat(${NUM_ROUNDS},1fr) auto; gap:6px; align-items:center; font-size:11px; }
  .mini-sb-label { color:var(--text-dim); font-size:9px; letter-spacing:2px; }
  .mini-sb-round-head { text-align:center; font-size:9px; letter-spacing:1px; color:var(--text-dim); padding-bottom:4px; border-bottom:1px solid var(--border); }
  .mini-sb-round-head.active { color:var(--green); }
  .mini-sb-group { font-family:'Orbitron',sans-serif; font-size:10px; letter-spacing:2px; padding-right:8px; }
  .mini-sb-group.orange { color:var(--orange); }
  .mini-sb-group.cyan   { color:var(--cyan); }
  .mini-sb-cell { text-align:center; font-family:'Orbitron',sans-serif; font-size:16px; padding:6px 4px; border:1px solid var(--border); }
  .mini-sb-cell.orange { border-color:#4a2010; color:var(--orange); background:#080400; }
  .mini-sb-cell.cyan   { border-color:#0a3a50; color:var(--cyan);   background:#00080d; }
  .mini-sb-cell.zero   { color:var(--text-dim); }
  .mini-sb-total { font-family:'Orbitron',sans-serif; font-size:20px; padding-left:10px; }
  .mini-sb-total.orange { color:var(--orange); }
  .mini-sb-total.cyan   { color:var(--cyan); }

  /* ── SETUP ── */
  .round-setup { border:1px solid var(--border); padding:16px; background:var(--bg2); margin-bottom:12px; }
  .round-setup-header { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
  .round-badge { font-family:'Orbitron',sans-serif; font-size:11px; color:var(--green); border:1px solid var(--green-dim); padding:3px 9px; flex-shrink:0; }
  .track-badge { font-size:9px; letter-spacing:1px; padding:2px 8px; border:1px solid; }
  .track-badge.blue { border-color:#3b82f6; color:#3b82f6; }
  .track-badge.red  { border-color:#ef4444; color:#ef4444; }
  .field-2col { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  @media(max-width:600px){.field-2col{grid-template-columns:1fr}}

  /* ── PARTICIPANTS TABLE ── */
  .table-wrap { overflow-x:auto; }
  .ptable { width:100%; border-collapse:collapse; min-width:340px; }
  .ptable th { font-size:10px; letter-spacing:2px; color:var(--text-dim); text-align:left; padding:7px 12px; border-bottom:1px solid var(--border); text-transform:uppercase; }
  .ptable td { padding:9px 12px; border-bottom:1px solid #0a1a14; font-size:12px; }
  .ptable tr:hover td { background:#0a1a14; }
  .gbadge { display:inline-block; padding:2px 8px; font-size:10px; letter-spacing:1px; border:1px solid; text-transform:uppercase; }
  .gbadge.orange { border-color:var(--orange); color:var(--orange); }
  .gbadge.cyan   { border-color:var(--cyan);   color:var(--cyan); }

  /* ── LOGIN ── */
  .login-screen { min-height:100vh; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:22px; padding:24px; }
  .login-title { font-family:'Orbitron',sans-serif; font-size:24px; letter-spacing:6px; color:var(--green); text-shadow:0 0 30px #00ff8866; text-align:center; }
  .login-sub { font-size:10px; letter-spacing:3px; color:var(--text-dim); }
  .login-form { display:flex; flex-direction:column; gap:10px; width:100%; max-width:280px; }

  /* ── TOAST ── */
  .toast { position:fixed; bottom:20px; right:20px; background:var(--bg3); border:1px solid var(--green-dim); color:var(--green); padding:10px 16px; font-size:12px; letter-spacing:1px; animation:slideIn 0.3s ease; z-index:10000; max-width:calc(100vw - 40px); }
  .toast.error { border-color:var(--red-ui); color:var(--red-ui); }
  @keyframes slideIn { from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1} }

  /* ── UTILS ── */
  .flex-between { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; }
  .gap-6 { display:flex; gap:6px; flex-wrap:wrap; }
  .mt-8  { margin-top:8px; }
  .mt-16 { margin-top:16px; }
  .mb-8  { margin-bottom:8px; }
  .mb-16 { margin-bottom:16px; }
  .text-dim { color:var(--text-dim); font-size:11px; }
`;

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  return { toast, show };
}

// Polls /api/state every POLL_INTERVAL ms and keeps appState fresh
function useAppState() {
  const [appState, setAppState] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const state = await api.getState();
      setAppState(state);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [refresh]);

  return { appState, setAppState, refresh, error };
}

// ─── Derived helpers ──────────────────────────────────────────────────────────
function groupTotal(scores, group) {
  return (scores[group] ?? []).reduce((s, n) => s + n, 0);
}

// Which track type is a group doing in a given round (0-indexed)
function trackForGroup(group, roundIdx) {
  return GROUP_TRACKS[roundIdx][group]; // "blue" | "red"
}

// URL for a group's track in a given round
function urlForGroup(rounds, group, roundIdx) {
  const track = trackForGroup(group, roundIdx);
  return rounds[roundIdx]?.[track === "blue" ? "blueUrl" : "redUrl"] ?? "";
}

// ─── Scoreboard (fullscreen projection view) ──────────────────────────────────
function ScoreboardPage({ appState }) {
  const { scores, rounds, activeRound, participants, event } = appState;

  const totals = {};
  GROUPS.forEach((g) => { totals[g] = groupTotal(scores, g); });

  let leaderClass = "tied";
  let leaderText = "GROUPS ARE TIED";
  if (totals.A > totals.B) { leaderClass = "orange"; leaderText = "GROUP A LEADING"; }
  else if (totals.B > totals.A) { leaderClass = "cyan"; leaderText = "GROUP B LEADING"; }

  return (
    <div className="sb-page">
      <div className="sb-header">
        <div className="sb-event">{event.name.toUpperCase()} · {event.date.toUpperCase()}</div>
        <div className="sb-title">SECURITY CTF</div>
        <div className="sb-live"><div className="live-dot" /> LIVE SCORES</div>
      </div>

      {/* Big totals */}
      <div className="sb-totals">
        {GROUPS.map((g) => {
          const meta = GROUP_META[g];
          const teamP = participants.filter((p) => p.group === g).length;
          return (
            <div key={g} className={`sb-total ${meta.color}`}>
              <div className="sb-total-icon">{meta.icon}</div>
              <div className="sb-total-body">
                <div className={`sb-total-label ${meta.color}`}>{meta.label.toUpperCase()}</div>
                <div className={`sb-total-score ${meta.color}`}>{totals[g]}</div>
                <div className="sb-total-sub">pts · {teamP} members</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`sb-leader ${leaderClass}`}>{leaderText}</div>

      {/* Per-round grid */}
      <div className="sb-rounds">
        <div className="sb-rounds-title">// ROUND BREAKDOWN</div>
        <div className="sb-round-table">
          {/* Header row */}
          <div className="sb-cell header-row group-col" />
          {rounds.map((r, i) => {
            const isActive = activeRound === i + 1;
            const isFuture = activeRound > 0 && i + 1 > activeRound;
            return (
              <div key={i} className={`sb-cell header-row ${isFuture ? "future" : ""}`}>
                <div className={`sb-cell-round-title ${isActive ? "active" : ""}`}>
                  {r.title || `Round ${i + 1}`}
                </div>
              </div>
            );
          })}

          {/* Group rows */}
          {GROUPS.map((g) => {
            const meta = GROUP_META[g];
            const teamP = participants.filter((p) => p.group === g).length;
            return (
              <>
                <div key={g + "-label"} className="sb-cell group-col">
                  <div className={`sb-cell-group-name ${meta.color}`}>{meta.icon} {meta.label}</div>
                  <div className="sb-cell-group-sub">{teamP} members</div>
                </div>
                {rounds.map((_, i) => {
                  const count = scores[g][i] ?? 0;
                  const isActive = activeRound === i + 1;
                  const isFuture = activeRound > 0 && i + 1 > activeRound;
                  const track = trackForGroup(g, i);
                  const tMeta = TRACK_META[track];
                  return (
                    <div key={g + "-" + i} className={`sb-cell ${isFuture ? "future" : ""} ${isActive ? "active-round" : ""}`}>
                      <div className={`sb-score ${count > 0 ? meta.color : "zero"}`}>{count}</div>
                      <div className="sb-score-sub">{tMeta.icon} {tMeta.label}</div>
                      {teamP > 0 && <div className="sb-score-sub">/ {teamP} members</div>}
                    </div>
                  );
                })}
              </>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Admin: score panel ───────────────────────────────────────────────────────
function AdminScores({ appState, token, onStateChange, showToast }) {
  const { scores, rounds, activeRound, participants } = appState;

  const handleSetScore = async (group, roundIdx, value) => {
    try {
      const next = await api.setScore(token, group, roundIdx, value);
      onStateChange(next);
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleSetActiveRound = async (round) => {
    try {
      const next = await api.setActiveRound(token, round);
      onStateChange(next);
      showToast(`Round ${round} is now live`);
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  return (
    <div className="section">
      {/* Totals summary */}
      <div className="card">
        <div className="card-title">// Group Totals</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {GROUPS.map((g) => {
            const meta = GROUP_META[g];
            const total = groupTotal(scores, g);
            const teamP = participants.filter((p) => p.group === g).length;
            return (
              <div key={g} style={{ border: `1px solid ${g === "A" ? "#7a3a10" : "#104a5a"}`, padding: 16, textAlign: "center", background: "var(--bg3)" }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: meta.cssVar, marginBottom: 6 }}>{meta.icon} {meta.label.toUpperCase()}</div>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 52, color: meta.cssVar, lineHeight: 1 }}>{total}</div>
                <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 6, letterSpacing: 1 }}>pts · {teamP} members</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stepper grid */}
      <div className="card">
        <div className="flex-between mb-8">
          <div className="card-title" style={{ marginBottom: 0 }}>// Points per Round — click round name to set active</div>
          <button className="btn btn-sm btn-ghost" onClick={() => handleSetActiveRound(0)}>Stop round</button>
        </div>

        <div className="score-table">
          {/* Header */}
          <div /> {/* empty group-label corner */}
          {rounds.map((r, i) => (
            <div
              key={i}
              className={`score-col-header ${activeRound === i + 1 ? "active" : ""}`}
              onClick={() => handleSetActiveRound(i + 1)}
              title="Click to set as active round"
            >
              {r.title || `Round ${i + 1}`}
            </div>
          ))}
          <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--text-dim)", textAlign: "center", paddingBottom: 4, borderBottom: "1px solid var(--border)" }}>TOTAL</div>

          {/* One row per group */}
          {GROUPS.map((g) => {
            const meta = GROUP_META[g];
            const teamP = participants.filter((p) => p.group === g).length;
            const total = groupTotal(scores, g);
            return (
              <>
                <div key={g + "-label"} className={`score-row-label ${meta.color}`}>{meta.icon} {meta.label}</div>
                {rounds.map((_, i) => {
                  const count = scores[g][i] ?? 0;
                  const track = trackForGroup(g, i);
                  const tMeta = TRACK_META[track];
                  const isActive = activeRound === i + 1;
                  return (
                    <div key={g + "-" + i} className={`stepper ${meta.color} ${isActive ? "active-round" : ""}`}>
                      <div className="stepper-track">{tMeta.icon} {tMeta.label}</div>
                      <div className={`stepper-val ${count > 0 ? meta.color : "zero"}`}>{count}</div>
                      <div className="stepper-max">/ {teamP > 0 ? teamP : "?"} members</div>
                      <div className="stepper-btns">
                        <button
                          className="stepper-btn"
                          onClick={() => handleSetScore(g, i, count - 1)}
                          disabled={count === 0}
                        >−</button>
                        <button
                          className="stepper-btn"
                          onClick={() => handleSetScore(g, i, count + 1)}
                          disabled={teamP > 0 && count >= teamP}
                        >+</button>
                      </div>
                    </div>
                  );
                })}
                <div key={g + "-total"} className={`score-total-cell ${meta.color}`}>{total}</div>
              </>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Admin: setup ─────────────────────────────────────────────────────────────
function AdminSetup({ appState, token, onStateChange, showToast }) {
  const [rounds, setRounds] = useState(appState.rounds);

  // Only re-sync from server when the number of rounds changes (e.g. after a
  // full reset). Do NOT sync on every poll — that would overwrite in-progress
  // edits before the user hits Save.
  const roundCount = appState.rounds.length;
  useEffect(() => {
    setRounds(appState.rounds);
  }, [roundCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = (i, field, value) => {
    setRounds((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  };

  const handleSave = async () => {
    try {
      const next = await api.saveRounds(token, rounds);
      onStateChange(next);
      showToast("Configuration saved");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset ALL data? This cannot be undone.")) return;
    try {
      const next = await api.reset(token);
      onStateChange(next);
      showToast("All data reset");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  return (
    <div className="section">
      <div className="card">
        <div className="card-title">// Track Configuration</div>
        <p className="text-dim mb-16">
          Each round has a Blue team track and a Red team track.<br />
          Group A: Blue→Red→Blue / Group B: Red→Blue→Red
        </p>
        {rounds.map((r, i) => (
          <div key={i} className="round-setup">
            <div className="round-setup-header">
              <div className="round-badge">R{i + 1}</div>
              <input
                className="input"
                style={{ flex: 1 }}
                placeholder={`Round ${i + 1} title`}
                value={r.title}
                onChange={(e) => updateField(i, "title", e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label className="input-label">Description (optional)</label>
              <input
                className="input"
                placeholder="What will participants do this round?"
                value={r.description}
                onChange={(e) => updateField(i, "description", e.target.value)}
              />
            </div>
            <div className="field-2col">
              <div>
                <label className="input-label">
                  <span className="track-badge blue" style={{ marginRight: 6 }}>🔵 Blue Team</span>
                  {" "}Instruqt URL
                  <span style={{ marginLeft: 8, fontSize: 9, color: "var(--text-dim)" }}>
                    (A: R{i + 1} · B: R{i === 0 ? 2 : i === 1 ? 1 : 2})
                  </span>
                </label>
                <input
                  className="input"
                  placeholder="https://play.instruqt.com/..."
                  value={r.blueUrl}
                  onChange={(e) => updateField(i, "blueUrl", e.target.value)}
                  spellCheck={false}
                />
              </div>
              <div>
                <label className="input-label">
                  <span className="track-badge red" style={{ marginRight: 6 }}>🔴 Red Team</span>
                  {" "}Instruqt URL
                </label>
                <input
                  className="input"
                  placeholder="https://play.instruqt.com/..."
                  value={r.redUrl}
                  onChange={(e) => updateField(i, "redUrl", e.target.value)}
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        ))}
        <button className="btn btn-full mt-16" onClick={handleSave}>▶ SAVE CONFIGURATION</button>
      </div>

      <div className="card">
        <div className="card-title">// Danger Zone</div>
        <p className="text-dim mb-16">Resets all scores, participants, and configuration.</p>
        <button className="btn btn-red btn-sm" onClick={handleReset}>⚠ RESET ALL DATA</button>
      </div>
    </div>
  );
}

// ─── Admin: participants ──────────────────────────────────────────────────────
function AdminParticipants({ appState, token, onStateChange, showToast }) {
  const { participants } = appState;
  const sorted = [...participants].sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));

  const handleRemove = async (name) => {
    try {
      const next = await api.removeParticipant(token, name);
      onStateChange(next);
      showToast("Participant removed");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  return (
    <div className="section">
      <div className="card">
        <div className="flex-between mb-8">
          <div className="card-title">// Participants ({participants.length})</div>
          <div className="gap-6">
            {GROUPS.map((g) => {
              const meta = GROUP_META[g];
              const n = participants.filter((p) => p.group === g).length;
              return <span key={g} style={{ fontSize: 11, color: meta.cssVar }}>{meta.icon} {n} {meta.label}</span>;
            })}
          </div>
        </div>
        {participants.length === 0 ? (
          <div className="no-url">No participants registered yet.</div>
        ) : (
          <div className="table-wrap">
            <table className="ptable">
              <thead><tr><th>Handle</th><th>Group</th><th>Joined</th><th /></tr></thead>
              <tbody>
                {sorted.map((p, i) => {
                  const meta = GROUP_META[p.group];
                  return (
                    <tr key={i}>
                      <td>{p.name}</td>
                      <td><span className={`gbadge ${meta.color}`}>{meta.label}</span></td>
                      <td style={{ color: "var(--text-dim)", fontSize: 11 }}>{new Date(p.joinedAt).toLocaleTimeString()}</td>
                      <td>
                        <button className="btn btn-red btn-sm" style={{ padding: "2px 8px", fontSize: 10 }} onClick={() => handleRemove(p.name)}>✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin login ──────────────────────────────────────────────────────────────
function AdminLoginView({ adminPw, setAdminPw, onLogin, onBack }) {
  return (
    <div className="login-screen">
      <div className="login-title">ADMIN ACCESS</div>
      <div className="login-sub">// SECURE TERMINAL</div>
      <div className="login-form">
        <label className="input-label">Password</label>
        <input
          className="input"
          type="password"
          placeholder="••••••••"
          value={adminPw}
          onChange={(e) => setAdminPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onLogin()}
          autoFocus
        />
        <button className="btn btn-full" onClick={onLogin}>▶ AUTHENTICATE</button>
        <button className="btn btn-full btn-ghost" onClick={onBack}>↩ Back</button>
      </div>
    </div>
  );
}

// ─── Participant: registration ────────────────────────────────────────────────
function RegistrationCard({ appState, name, setName, group, setGroup, onRegister }) {
  return (
    <div className="card">
      <div className="card-title">// Operator Registration</div>
      <label className="input-label">Your handle</label>
      <input
        className="input mb-8"
        placeholder="e.g. h4x0r42"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onRegister()}
        autoComplete="off"
        spellCheck={false}
        autoFocus
      />
      <label className="input-label" style={{ marginTop: 14 }}>Your group</label>
      <div className="group-select">
        {GROUPS.map((g) => {
          const meta = GROUP_META[g];
          const count = appState.participants.filter((p) => p.group === g).length;
          return (
            <div
              key={g}
              className={`group-option ${meta.color} ${group === g ? "selected" : ""}`}
              onClick={() => setGroup(g)}
              role="button" tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setGroup(g)}
            >
              <div className="group-icon">{meta.icon}</div>
              <div className="group-name">{meta.label}</div>
              <div className="group-count">{count} member{count !== 1 ? "s" : ""}</div>
            </div>
          );
        })}
      </div>
      <button className="btn btn-full mt-8" onClick={onRegister}>▶ JOIN THE BATTLE</button>
    </div>
  );
}

// ─── Participant: active view ─────────────────────────────────────────────────
function ActiveParticipantView({ appState, session, onLeave }) {
  const { scores, rounds, activeRound, participants } = appState;
  const meta = GROUP_META[session.group];

  const roundIdx = activeRound - 1; // 0-based, -1 if not started
  const currentRound = roundIdx >= 0 ? rounds[roundIdx] : null;
  const myTrack = roundIdx >= 0 ? trackForGroup(session.group, roundIdx) : null;
  const myUrl = currentRound ? urlForGroup(rounds, session.group, roundIdx) : "";
  const tMeta = myTrack ? TRACK_META[myTrack] : null;

  return (
    <>
      {/* Active challenge */}
      {activeRound === 0 ? (
        <div className="waiting">⏳ Waiting for the event to start…</div>
      ) : (
        <div className="round-card">
          <div className="round-card-num">// ROUND {activeRound} OF {NUM_ROUNDS}</div>
          <div className="round-card-title">{currentRound?.title || `Round ${activeRound}`}</div>
          {tMeta && (
            <div className={`round-card-track ${myTrack}`}>
              {tMeta.icon} {tMeta.label} — {tMeta.desc}
            </div>
          )}
          {currentRound?.description && (
            <div className="round-card-desc">{currentRound.description}</div>
          )}
          {myUrl ? (
            <a href={myUrl} target="_blank" rel="noreferrer" className="track-link">
              ⇒ OPEN INSTRUQT LAB
            </a>
          ) : (
            <div className="no-url">⏳ Track URL not configured yet — ask admin</div>
          )}
        </div>
      )}

      {/* Mini scoreboard */}
      <div className="card">
        <div className="card-title">// Live Standings</div>
        <div className="mini-sb-grid">
          {/* Header */}
          <div />
          {rounds.map((r, i) => (
            <div key={i} className={`mini-sb-round-head ${activeRound === i + 1 ? "active" : ""}`}>
              {r.title || `R${i + 1}`}
            </div>
          ))}
          <div style={{ fontSize: 9, letterSpacing: 2, color: "var(--text-dim)", textAlign: "center", paddingLeft: 10 }}>TOTAL</div>

          {/* Group rows */}
          {GROUPS.map((g) => {
            const gMeta = GROUP_META[g];
            const teamP = participants.filter((p) => p.group === g).length;
            const total = groupTotal(scores, g);
            return (
              <>
                <div key={g + "-label"} className={`mini-sb-group ${gMeta.color}`}>{gMeta.icon} {gMeta.label}</div>
                {rounds.map((_, i) => {
                  const count = scores[g][i] ?? 0;
                  return (
                    <div key={g + "-" + i} className={`mini-sb-cell ${count > 0 ? gMeta.color : "zero"}`}>
                      {count}
                    </div>
                  );
                })}
                <div key={g + "-total"} className={`mini-sb-total ${gMeta.color}`}>{total}</div>
              </>
            );
          })}
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <span className="text-dim" style={{ marginRight: 12 }}>
          {session.name} · <span style={{ color: meta.cssVar }}>{meta.label}</span>
        </span>
        <button className="btn btn-ghost btn-sm" onClick={onLeave}>↩ Switch player</button>
      </div>
    </>
  );
}

// ─── Participant page ─────────────────────────────────────────────────────────
function ParticipantView({ appState, session, name, setName, group, setGroup, onRegister, onLeave }) {
  const { event } = appState;
  return (
    <div>
      <div className="p-header">
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 10, letterSpacing: 3, color: "var(--green-dim)", marginBottom: 16 }}>
          <div className="live-dot" /> LIVE EVENT
        </div>
        <div className="p-title">SECURITY CTF</div>
        <div className="p-sub">{event.name.toUpperCase()} · {event.date.toUpperCase()}</div>
      </div>
      <div className="section" style={{ paddingTop: 0 }}>
        {!session ? (
          <RegistrationCard
            appState={appState}
            name={name} setName={setName}
            group={group} setGroup={setGroup}
            onRegister={onRegister}
          />
        ) : (
          <ActiveParticipantView appState={appState} session={session} onLeave={onLeave} />
        )}
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("participant"); // participant | scoreboard | admin-login | admin
  const [adminTab, setAdminTab] = useState("scores");
  const [token, setToken] = useState(() => sessionStorage.getItem(ADMIN_TOKEN_KEY) ?? null);
  const [adminPw, setAdminPw] = useState("");

  // Participant session (localStorage — just the current browser's identity)
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
  });
  const [name, setName] = useState(session?.name ?? "");
  const [group, setGroup] = useState(session?.group ?? "");

  const { appState, setAppState, error } = useAppState();
  const { toast, show: showToast } = useToast();

  // ── Admin auth ──
  const handleAdminLogin = useCallback(async () => {
    try {
      const { token: t } = await api.login(adminPw);
      setToken(t);
      sessionStorage.setItem(ADMIN_TOKEN_KEY, t);
      setView("admin");
      setAdminPw("");
    } catch {
      showToast("ACCESS DENIED", "error");
    }
  }, [adminPw, showToast]);

  const handleAdminLock = useCallback(() => {
    setToken(null);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setView("participant");
  }, []);

  // ── Participant registration ──
  const handleRegister = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) { showToast("Enter your handle", "error"); return; }
    if (!group)   { showToast("Select a group", "error"); return; }
    try {
      const next = await api.register(trimmed, group);
      setAppState(next);
      const sess = { name: trimmed, group };
      setSession(sess);
      localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
      showToast(`Welcome to ${GROUP_META[group].label}!`);
    } catch (e) {
      showToast(e.message, "error");
    }
  }, [name, group, setAppState, showToast]);

  const handleLeave = useCallback(() => {
    setSession(null);
    setName("");
    setGroup("");
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const goAdmin = (tab) => { setAdminTab(tab); setView("admin"); };

  // ── Loading / error ──
  if (!appState) {
    return (
      <>
        <style>{css}</style>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "'Share Tech Mono',monospace", color: "#00ff88", letterSpacing: 4 }}>
          {error
            ? <><div style={{ color: "#ff4444" }}>SERVER UNREACHABLE</div><div style={{ fontSize: 11, color: "#4a8a6a" }}>{error}</div></>
            : <div>CONNECTING...</div>
          }
        </div>
      </>
    );
  }

  const isAdmin = !!token;

  return (
    <>
      <style>{css}</style>
      <div className="scanline" aria-hidden="true" />

      {/* Header — hidden on scoreboard */}
      {view !== "scoreboard" && (
        <header className="header">
          <div className="header-logo">
            <div className="logo-mark" aria-hidden="true">CTF</div>
            <div>
              <div className="logo-text">SECURITY CTF</div>
              <div className="logo-sub">{appState.event.name}</div>
            </div>
          </div>
          <nav className="header-nav">
            <button className={`nav-btn ${view === "participant" ? "active" : ""}`} onClick={() => setView("participant")}>Participant</button>
            <button className={`nav-btn ${view === "scoreboard" ? "active" : ""}`} onClick={() => setView("scoreboard")}>📺 Scoreboard</button>
            {!isAdmin ? (
              <button className="nav-btn" onClick={() => setView("admin-login")}>Admin</button>
            ) : (
              <>
                <button className={`nav-btn ${view === "admin" && adminTab === "scores" ? "active" : ""}`} onClick={() => goAdmin("scores")}>Scores</button>
                <button className={`nav-btn ${view === "admin" && adminTab === "setup" ? "active" : ""}`} onClick={() => goAdmin("setup")}>Setup</button>
                <button className={`nav-btn ${view === "admin" && adminTab === "participants" ? "active" : ""}`} onClick={() => goAdmin("participants")}>Members</button>
                <button className="nav-btn danger" onClick={handleAdminLock}>Lock</button>
              </>
            )}
          </nav>
        </header>
      )}

      {/* Scoreboard — fullscreen */}
      {view === "scoreboard" && (
        <>
          <button
            onClick={() => setView("participant")}
            style={{ position: "fixed", top: 12, right: 12, zIndex: 200, background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text-dim)", padding: "4px 10px", fontFamily: "'Share Tech Mono',monospace", fontSize: 10, letterSpacing: 2, cursor: "pointer" }}
          >
            ✕ EXIT
          </button>
          <ScoreboardPage appState={appState} />
        </>
      )}

      <main>
        {view === "participant" && (
          <ParticipantView
            appState={appState} session={session}
            name={name} setName={setName}
            group={group} setGroup={setGroup}
            onRegister={handleRegister} onLeave={handleLeave}
          />
        )}
        {view === "admin-login" && (
          <AdminLoginView adminPw={adminPw} setAdminPw={setAdminPw} onLogin={handleAdminLogin} onBack={() => setView("participant")} />
        )}
        {view === "admin" && isAdmin && adminTab === "scores" && (
          <AdminScores appState={appState} token={token} onStateChange={setAppState} showToast={showToast} />
        )}
        {view === "admin" && isAdmin && adminTab === "setup" && (
          <AdminSetup appState={appState} token={token} onStateChange={setAppState} showToast={showToast} />
        )}
        {view === "admin" && isAdmin && adminTab === "participants" && (
          <AdminParticipants appState={appState} token={token} onStateChange={setAppState} showToast={showToast} />
        )}
      </main>

      {toast && <div role="alert" className={`toast ${toast.type === "error" ? "error" : ""}`}>{toast.msg}</div>}
    </>
  );
}
