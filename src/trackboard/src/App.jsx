import { useState, useEffect, useCallback } from "react";
import { store } from "./storage.js";
import {
  TEAMS,
  TEAM_META,
  NUM_ROUNDS,
  ADMIN_PASSWORD,
  EVENT_NAME,
  EVENT_DATE,
  STORAGE_KEYS,
  makeDefaultState,
} from "./constants.js";

// ─── CSS ─────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@700;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #050a0a;
    --bg2: #0a1414;
    --bg3: #0f1e1e;
    --green: #00ff88;
    --green-dim: #00a855;
    --green-dark: #003322;
    --orange: #f97316;
    --cyan: #22d3ee;
    --red: #ff4444;
    --text: #b0ffd8;
    --text-dim: #4a8a6a;
    --border: #0f3d2a;
    --glow: 0 0 12px #00ff8844;
    --glow-strong: 0 0 24px #00ff8866;
  }

  body { background: var(--bg); color: var(--text); font-family: 'Share Tech Mono', monospace; overflow-x: hidden; }

  .scanline {
    position: fixed; inset: 0; pointer-events: none; z-index: 9999;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.015) 2px, rgba(0,255,136,0.015) 4px);
  }
  .noise {
    position: fixed; inset: 0; pointer-events: none; z-index: 9998; opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  .app { min-height: 100vh; padding: 0 0 60px; }

  .header {
    border-bottom: 1px solid var(--border);
    padding: 20px 32px;
    display: flex; align-items: center; justify-content: space-between;
    background: linear-gradient(180deg, #0a1a14 0%, var(--bg) 100%);
    position: sticky; top: 0; z-index: 100;
    backdrop-filter: blur(8px);
    flex-wrap: wrap; gap: 12px;
  }
  .header-logo { display: flex; align-items: center; gap: 14px; }
  .logo-mark {
    width: 40px; height: 40px; border: 2px solid var(--green);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Orbitron', sans-serif; font-size: 18px; font-weight: 900;
    color: var(--green); box-shadow: var(--glow); position: relative;
    animation: pulse-border 3s ease-in-out infinite; flex-shrink: 0;
  }
  @keyframes pulse-border {
    0%, 100% { box-shadow: 0 0 8px #00ff8844; }
    50% { box-shadow: 0 0 20px #00ff8888; }
  }
  .logo-mark::before { content: ''; position: absolute; inset: 3px; border: 1px solid var(--green-dim); opacity: 0.4; }
  .logo-text { font-family: 'Orbitron', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 3px; color: var(--green); }
  .logo-sub { font-size: 10px; color: var(--text-dim); letter-spacing: 2px; margin-top: 2px; }
  .header-nav { display: flex; gap: 8px; flex-wrap: wrap; }
  .nav-btn {
    background: transparent; border: 1px solid var(--border); color: var(--text-dim);
    padding: 6px 16px; font-family: 'Share Tech Mono', monospace; font-size: 11px;
    letter-spacing: 2px; cursor: pointer; transition: all 0.2s; text-transform: uppercase;
  }
  .nav-btn:hover, .nav-btn.active { border-color: var(--green); color: var(--green); box-shadow: var(--glow); }
  .nav-btn.danger { border-color: #3a1010; color: #884444; }
  .nav-btn.danger:hover { border-color: var(--red); color: var(--red); box-shadow: 0 0 12px #ff444444; }

  .section { max-width: 900px; margin: 0 auto; padding: 40px 24px; }

  .card {
    background: var(--bg2); border: 1px solid var(--border);
    padding: 24px; margin-bottom: 16px; position: relative; overflow: hidden;
  }
  .card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--green-dim), transparent);
  }
  .card-title { font-family: 'Orbitron', sans-serif; font-size: 11px; letter-spacing: 3px; color: var(--green-dim); margin-bottom: 16px; text-transform: uppercase; }

  .input {
    background: var(--bg3); border: 1px solid var(--border); color: var(--text);
    padding: 10px 14px; font-family: 'Share Tech Mono', monospace; font-size: 13px;
    width: 100%; outline: none; transition: border-color 0.2s;
  }
  .input:focus { border-color: var(--green-dim); box-shadow: var(--glow); }
  .input::placeholder { color: var(--text-dim); }
  .input-label { font-size: 10px; letter-spacing: 2px; color: var(--text-dim); margin-bottom: 6px; display: block; text-transform: uppercase; }

  .btn {
    background: transparent; border: 1px solid var(--green-dim); color: var(--green);
    padding: 10px 24px; font-family: 'Share Tech Mono', monospace; font-size: 12px;
    letter-spacing: 2px; cursor: pointer; transition: all 0.2s; text-transform: uppercase;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn:hover { background: var(--green-dark); box-shadow: var(--glow-strong); }
  .btn:active { transform: scale(0.98); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-full { width: 100%; justify-content: center; }
  .btn-sm { padding: 6px 14px; font-size: 11px; }
  .btn-red { border-color: var(--red); color: var(--red); }
  .btn-red:hover { background: #1a0000; box-shadow: 0 0 12px #ff444444; }
  .btn-ghost { border-color: transparent; color: var(--text-dim); }
  .btn-ghost:hover { border-color: var(--border); color: var(--text); background: transparent; box-shadow: none; }

  .scoreboard { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px; }
  .team-score { border: 1px solid; padding: 20px; text-align: center; position: relative; overflow: hidden; background: var(--bg2); }
  .team-score.orange { border-color: #7a3a10; }
  .team-score.cyan { border-color: #104a5a; }
  .team-score::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px; }
  .team-score.orange::after { background: linear-gradient(90deg, transparent, var(--orange), transparent); }
  .team-score.cyan::after { background: linear-gradient(90deg, transparent, var(--cyan), transparent); }
  .team-name { font-family: 'Orbitron', sans-serif; font-size: 12px; letter-spacing: 3px; margin-bottom: 12px; }
  .team-name.orange { color: var(--orange); }
  .team-name.cyan { color: var(--cyan); }
  .team-number { font-family: 'Orbitron', sans-serif; font-size: 48px; font-weight: 900; line-height: 1; }
  .team-number.orange { color: var(--orange); text-shadow: 0 0 30px #f9731666; }
  .team-number.cyan { color: var(--cyan); text-shadow: 0 0 30px #22d3ee66; }
  .team-label { font-size: 10px; color: var(--text-dim); letter-spacing: 2px; margin-top: 6px; }

  .mini-scores { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; margin-top: 6px; }
  .mini-cell { height: 28px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 10px; letter-spacing: 1px; transition: all 0.3s; }
  .mini-cell.done-orange { border-color: var(--orange); background: #1a0500; color: var(--orange); }
  .mini-cell.done-cyan { border-color: var(--cyan); background: #001215; color: var(--cyan); }

  .completion-header { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
  .completion-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 8px; align-items: center; }
  .check-btn { border: 1px solid; padding: 7px 12px; font-family: 'Share Tech Mono', monospace; font-size: 11px; cursor: pointer; transition: all 0.2s; text-align: center; letter-spacing: 1px; background: transparent; }
  .check-btn.done-orange { border-color: var(--orange); color: var(--orange); background: #1a0800; }
  .check-btn.done-cyan { border-color: var(--cyan); color: var(--cyan); background: #001015; }
  .check-btn.undone { border-color: var(--border); color: var(--text-dim); }
  .check-btn:hover { opacity: 0.75; }

  .participant-header { text-align: center; padding: 60px 24px 40px; }
  .event-title { font-family: 'Orbitron', sans-serif; font-size: clamp(24px, 5vw, 42px); font-weight: 900; letter-spacing: 6px; color: var(--green); text-shadow: 0 0 40px #00ff8855; margin-bottom: 8px; line-height: 1.1; }
  .event-sub { font-size: 11px; letter-spacing: 4px; color: var(--text-dim); }
  .live-indicator { display: inline-flex; align-items: center; gap: 8px; font-size: 10px; letter-spacing: 3px; color: var(--green-dim); margin-bottom: 24px; }
  .live-dot { width: 6px; height: 6px; background: var(--green); border-radius: 50%; animation: blink 1s ease-in-out infinite; }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }

  .team-select { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
  .team-option { border: 1px solid; padding: 20px; text-align: center; cursor: pointer; transition: all 0.3s; font-family: 'Share Tech Mono', monospace; background: var(--bg2); }
  .team-option.orange { border-color: #7a3a10; color: var(--text-dim); }
  .team-option.orange:hover, .team-option.orange.selected { border-color: var(--orange); color: var(--orange); background: #0f0800; box-shadow: 0 0 20px #f9731633; }
  .team-option.cyan { border-color: #104a5a; color: var(--text-dim); }
  .team-option.cyan:hover, .team-option.cyan.selected { border-color: var(--cyan); color: var(--cyan); background: #00080f; box-shadow: 0 0 20px #22d3ee33; }
  .team-icon { font-size: 28px; margin-bottom: 8px; }
  .team-opt-name { font-family: 'Orbitron', sans-serif; font-size: 13px; letter-spacing: 3px; }
  .team-count { font-size: 10px; color: var(--text-dim); margin-top: 6px; }

  .round-display { border: 1px solid var(--green-dim); padding: 32px; text-align: center; position: relative; overflow: hidden; background: var(--bg2); margin: 24px 0; }
  .round-display::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at center, #00ff8808 0%, transparent 70%); pointer-events: none; }
  .round-display-num { font-family: 'Orbitron', sans-serif; font-size: 11px; letter-spacing: 4px; color: var(--text-dim); margin-bottom: 8px; }
  .round-display-title { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--green); margin-bottom: 20px; text-shadow: 0 0 20px #00ff8844; }
  .round-display-desc { font-size: 13px; color: var(--text-dim); margin-bottom: 24px; line-height: 1.6; }
  .track-link-btn { display: inline-flex; align-items: center; gap: 10px; border: 1px solid var(--green); color: var(--green); background: var(--green-dark); padding: 14px 28px; font-family: 'Share Tech Mono', monospace; font-size: 13px; letter-spacing: 2px; cursor: pointer; transition: all 0.2s; text-decoration: none; text-transform: uppercase; }
  .track-link-btn:hover { box-shadow: var(--glow-strong); background: #004422; }
  .no-url { color: var(--text-dim); font-size: 12px; letter-spacing: 2px; padding: 16px; border: 1px dashed var(--border); }

  .setup-grid { display: grid; gap: 16px; }
  .round-setup { border: 1px solid var(--border); padding: 16px; background: var(--bg2); }
  .round-setup-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .round-num-badge { font-family: 'Orbitron', sans-serif; font-size: 12px; font-weight: 700; color: var(--green); border: 1px solid var(--green-dim); padding: 4px 10px; flex-shrink: 0; }
  .round-fields { display: grid; gap: 10px; }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  @media (max-width: 600px) { .field-row { grid-template-columns: 1fr; } }

  .table-wrapper { overflow-x: auto; }
  .participants-table { width: 100%; border-collapse: collapse; min-width: 400px; }
  .participants-table th { font-size: 10px; letter-spacing: 2px; color: var(--text-dim); text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--border); text-transform: uppercase; white-space: nowrap; }
  .participants-table td { padding: 10px 12px; border-bottom: 1px solid #0a1a14; font-size: 12px; }
  .participants-table tr:hover td { background: #0a1a14; }
  .team-badge { display: inline-block; padding: 2px 8px; font-size: 10px; letter-spacing: 1px; border: 1px solid; text-transform: uppercase; }
  .team-badge.orange { border-color: var(--orange); color: var(--orange); }
  .team-badge.cyan { border-color: var(--cyan); color: var(--cyan); }

  .login-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 24px; padding: 24px; }
  .login-title { font-family: 'Orbitron', sans-serif; font-size: 28px; letter-spacing: 6px; color: var(--green); text-shadow: 0 0 30px #00ff8866; text-align: center; }
  .login-sub { font-size: 11px; letter-spacing: 3px; color: var(--text-dim); }
  .login-form { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 320px; }

  .toast { position: fixed; bottom: 24px; right: 24px; background: var(--bg3); border: 1px solid var(--green-dim); color: var(--green); padding: 12px 20px; font-size: 12px; letter-spacing: 1px; animation: slideIn 0.3s ease; z-index: 10000; max-width: calc(100vw - 48px); }
  .toast.error { border-color: var(--red); color: var(--red); }
  @keyframes slideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

  .text-dim { color: var(--text-dim); font-size: 11px; }
  .text-green { color: var(--green); }
  .flex-between { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
  .gap-8 { display: flex; gap: 8px; flex-wrap: wrap; }
  .mt-8 { margin-top: 8px; }
  .mt-16 { margin-top: 16px; }
  .mb-8 { margin-bottom: 8px; }
  .mb-16 { margin-bottom: 16px; }
`;

// ─── Toast hook ───────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  return { toast, show };
}

// ─── Components (module level — NEVER define components inside another component)
// Defining a component inside a render function gives it a new identity every
// render, causing React to unmount + remount it, which destroys input focus.
// All components live here at the top level and receive what they need via props.
// ─────────────────────────────────────────────────────────────────────────────

function RegistrationCard({ appState, participantName, setParticipantName, participantTeam, setParticipantTeam, onRegister }) {
  return (
    <div className="card">
      <div className="card-title">// Operator Registration</div>
      <label className="input-label">Your handle</label>
      <input
        className="input mb-8"
        placeholder="e.g. h4x0r42"
        value={participantName}
        onChange={(e) => setParticipantName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onRegister()}
        autoComplete="off"
        spellCheck={false}
        autoFocus
      />
      <label className="input-label" style={{ marginTop: 16 }}>Choose your team</label>
      <div className="team-select">
        {TEAMS.map((t) => {
          const meta = TEAM_META[t];
          const count = appState.participants.filter((p) => p.team === t).length;
          return (
            <div
              key={t}
              className={`team-option ${meta.color} ${participantTeam === t ? "selected" : ""}`}
              onClick={() => setParticipantTeam(t)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setParticipantTeam(t)}
            >
              <div className="team-icon">{meta.icon}</div>
              <div className="team-opt-name">{t}</div>
              <div className="team-count">{count} member{count !== 1 ? "s" : ""}</div>
            </div>
          );
        })}
      </div>
      <button className="btn btn-full mt-8" onClick={onRegister}>
        ▶ JOIN THE BATTLE
      </button>
    </div>
  );
}

function ActivePlayerView({ appState, session, scoreOf, onLeave }) {
  const myMeta = TEAM_META[session.team];
  const currentRound = appState.rounds[appState.activeRound - 1];
  return (
    <>
      <div className="round-display">
        <div className="round-display-num">// ACTIVE CHALLENGE — ROUND {appState.activeRound}</div>
        <div className="round-display-title">
          {currentRound.title || `Challenge ${appState.activeRound}`}
        </div>
        {currentRound.description && (
          <div className="round-display-desc">{currentRound.description}</div>
        )}
        {currentRound.url ? (
          <a href={currentRound.url} target="_blank" rel="noreferrer" className="track-link-btn">
            ⇒ OPEN INSTRUQT LAB
          </a>
        ) : (
          <div className="no-url">⏳ Waiting for admin to configure this round…</div>
        )}
      </div>

      <div className="card">
        <div className="card-title">// Current Standings</div>
        <div className="scoreboard">
          {TEAMS.map((t) => {
            const meta = TEAM_META[t];
            return (
              <div key={t} className={`team-score ${meta.color}`}>
                <div className={`team-name ${meta.color}`}>{t}</div>
                <div className={`team-number ${meta.color}`}>{scoreOf(t)}</div>
                <div className="team-label">/ {NUM_ROUNDS} COMPLETED</div>
              </div>
            );
          })}
        </div>
        {TEAMS.map((t) => {
          const meta = TEAM_META[t];
          return (
            <div key={t} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: meta.cssVar, marginBottom: 6 }}>
                {t.toUpperCase()}
              </div>
              <div className="mini-scores">
                {Array.from({ length: NUM_ROUNDS }, (_, i) => (
                  <div key={i} className={`mini-cell ${appState.scores[t][i] ? `done-${meta.color}` : ""}`}>
                    {appState.scores[t][i] ? "✓" : `R${i + 1}`}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "center" }}>
        <span className="text-dim" style={{ marginRight: 12 }}>
          Operator: <span style={{ color: myMeta.cssVar }}>{session.name}</span> · {session.team}
        </span>
        <button className="btn btn-ghost btn-sm" onClick={onLeave}>↩ Switch player</button>
      </div>
    </>
  );
}

function ParticipantView({ appState, session, scoreOf, participantName, setParticipantName, participantTeam, setParticipantTeam, onRegister, onLeave }) {
  return (
    <div>
      <div className="participant-header">
        <div className="live-indicator"><div className="live-dot" /> LIVE EVENT</div>
        <div className="event-title">SECURITY CTF</div>
        <div className="event-sub">{EVENT_NAME.toUpperCase()} · {EVENT_DATE.toUpperCase()}</div>
      </div>
      <div className="section" style={{ paddingTop: 0 }}>
        {!session ? (
          <RegistrationCard
            appState={appState}
            participantName={participantName}
            setParticipantName={setParticipantName}
            participantTeam={participantTeam}
            setParticipantTeam={setParticipantTeam}
            onRegister={onRegister}
          />
        ) : (
          <ActivePlayerView
            appState={appState}
            session={session}
            scoreOf={scoreOf}
            onLeave={onLeave}
          />
        )}
      </div>
    </div>
  );
}

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

function AdminScoreboard({ appState, scoreOf, onSetActiveRound, onToggleScore }) {
  const currentRound = appState.rounds[appState.activeRound - 1];
  return (
    <div className="section">
      <div className="scoreboard">
        {TEAMS.map((t) => {
          const meta = TEAM_META[t];
          return (
            <div key={t} className={`team-score ${meta.color}`}>
              <div className={`team-name ${meta.color}`}>{t}</div>
              <div className={`team-number ${meta.color}`}>{scoreOf(t)}</div>
              <div className="team-label">/ {NUM_ROUNDS} ROUNDS</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8 }}>
                {appState.participants.filter((p) => p.team === t).length} members
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="flex-between mb-8">
          <div className="card-title">// Active Round</div>
          <div className="gap-8">
            {Array.from({ length: NUM_ROUNDS }, (_, i) => (
              <button
                key={i}
                className={`btn btn-sm ${appState.activeRound === i + 1 ? "" : "btn-ghost"}`}
                onClick={() => onSetActiveRound(i + 1)}
              >
                R{i + 1}
              </button>
            ))}
          </div>
        </div>
        <div className="text-dim">
          Round <span className="text-green">{appState.activeRound}</span>
          {" · "}{currentRound.title || `Challenge ${appState.activeRound}`}
          {currentRound.url && (
            <> · <span style={{ color: "var(--green-dim)" }}>
              {currentRound.url.length > 60 ? currentRound.url.slice(0, 60) + "…" : currentRound.url}
            </span></>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title">// Round Completions — click to toggle</div>
        <div className="completion-header">
          <div className="text-dim">ROUND</div>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--orange)" }}>PENTESTERS</div>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--cyan)" }}>DEFENDERS</div>
        </div>
        {appState.rounds.map((r, i) => (
          <div key={i} className="completion-row">
            <div style={{ fontSize: 12, color: appState.activeRound === i + 1 ? "var(--green)" : "var(--text-dim)" }}>
              {appState.activeRound === i + 1 ? "▶ " : "   "}R{i + 1}
              {r.title ? ` · ${r.title.slice(0, 18)}` : ""}
            </div>
            {TEAMS.map((t) => {
              const done = appState.scores[t][i];
              const meta = TEAM_META[t];
              return (
                <button
                  key={t}
                  className={`check-btn ${done ? `done-${meta.color}` : "undone"}`}
                  onClick={() => onToggleScore(t, i)}
                >
                  {done ? "✓ DONE" : "○ PENDING"}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminSetup({ appState, onUpdateRoundField, onSave, onReset }) {
  return (
    <div className="section">
      <div className="card">
        <div className="card-title">// Track Configuration</div>
        <p className="text-dim mb-16">
          Paste your Instruqt track URLs and titles. Changes are local until you click Save.
        </p>
        <div className="setup-grid">
          {appState.rounds.map((r, i) => (
            <div key={i} className="round-setup">
              <div className="round-setup-header">
                <div className="round-num-badge">R{i + 1}</div>
                <input
                  className="input"
                  style={{ flex: 1 }}
                  placeholder="Challenge title"
                  value={r.title}
                  onChange={(e) => onUpdateRoundField(i, "title", e.target.value)}
                />
              </div>
              <div className="round-fields">
                <div className="field-row">
                  <div>
                    <label className="input-label">Instruqt Track URL</label>
                    <input
                      className="input"
                      placeholder="https://play.instruqt.com/..."
                      value={r.url}
                      onChange={(e) => onUpdateRoundField(i, "url", e.target.value)}
                      spellCheck={false}
                    />
                  </div>
                  <div>
                    <label className="input-label">Short description (optional)</label>
                    <input
                      className="input"
                      placeholder="What will participants do?"
                      value={r.description}
                      onChange={(e) => onUpdateRoundField(i, "description", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn-full mt-16" onClick={onSave}>▶ SAVE CONFIGURATION</button>
      </div>

      <div className="card">
        <div className="card-title">// Danger Zone</div>
        <p className="text-dim mb-16">Resets all scores, participants, and configuration.</p>
        <button className="btn btn-red btn-sm" onClick={onReset}>⚠ RESET ALL DATA</button>
      </div>
    </div>
  );
}

function AdminParticipants({ appState, onRemove }) {
  const sorted = [...appState.participants].sort(
    (a, b) => a.team.localeCompare(b.team) || a.name.localeCompare(b.name)
  );
  return (
    <div className="section">
      <div className="card">
        <div className="flex-between mb-8">
          <div className="card-title">// Registered Participants ({appState.participants.length})</div>
          <div className="gap-8">
            {TEAMS.map((t) => {
              const meta = TEAM_META[t];
              const n = appState.participants.filter((p) => p.team === t).length;
              return (
                <span key={t} style={{ fontSize: 11, color: meta.cssVar }}>
                  {meta.icon} {n} {t}
                </span>
              );
            })}
          </div>
        </div>
        {appState.participants.length === 0 ? (
          <div className="no-url">No participants registered yet.</div>
        ) : (
          <div className="table-wrapper">
            <table className="participants-table">
              <thead>
                <tr>
                  <th>Handle</th>
                  <th>Team</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p, i) => {
                  const meta = TEAM_META[p.team];
                  return (
                    <tr key={i}>
                      <td>{p.name}</td>
                      <td><span className={`team-badge ${meta.color}`}>{p.team}</span></td>
                      <td style={{ color: "var(--text-dim)", fontSize: 11 }}>
                        {new Date(p.joinedAt).toLocaleTimeString()}
                      </td>
                      <td>
                        <button
                          className="btn btn-red btn-sm"
                          style={{ padding: "3px 8px", fontSize: 10 }}
                          onClick={() => onRemove(p.name)}
                        >
                          ✕
                        </button>
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

// ─── App — state only, no component definitions inside ───────────────────────
export default function App() {
  const [view, setView] = useState("participant");
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminTab, setAdminTab] = useState("scoreboard");
  const [adminPw, setAdminPw] = useState("");

  const [appState, setAppState] = useState(null);
  const [session, setSession] = useState(null);
  const [participantName, setParticipantName] = useState("");
  const [participantTeam, setParticipantTeam] = useState("");

  const { toast, show: showToast } = useToast();

  useEffect(() => {
    (async () => {
      const saved = await store.get(STORAGE_KEYS.STATE);
      setAppState(saved ?? makeDefaultState());
      const savedSession = await store.get(STORAGE_KEYS.SESSION);
      if (savedSession) {
        setSession(savedSession);
        setParticipantName(savedSession.name);
      }
    })();
  }, []);

  const save = useCallback(async (next) => {
    setAppState(next);
    await store.set(STORAGE_KEYS.STATE, next);
  }, []);

  const scoreOf = useCallback(
    (team) => (appState?.scores[team] ?? []).filter(Boolean).length,
    [appState]
  );

  const handleAdminLogin = useCallback(() => {
    if (adminPw === ADMIN_PASSWORD) {
      setAdminAuth(true);
      setView("admin");
      setAdminPw("");
    } else {
      showToast("ACCESS DENIED", "error");
    }
  }, [adminPw, showToast]);

  const handleAdminLock = useCallback(() => {
    setAdminAuth(false);
    setAdminPw("");
    setView("participant");
  }, []);

  const goAdmin = useCallback((tab) => {
    setAdminTab(tab);
    setView("admin");
  }, []);

  const handleRegister = useCallback(async () => {
    const name = participantName.trim();
    if (!name) { showToast("Enter your handle", "error"); return; }
    if (!participantTeam) { showToast("Select a team", "error"); return; }
    if (appState.participants.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      showToast("Handle already taken", "error"); return;
    }
    const next = {
      ...appState,
      participants: [...appState.participants, { name, team: participantTeam, joinedAt: new Date().toISOString() }],
    };
    await save(next);
    const sess = { name, team: participantTeam };
    setSession(sess);
    await store.set(STORAGE_KEYS.SESSION, sess);
    showToast(`Welcome to team ${participantTeam}!`);
  }, [participantName, participantTeam, appState, save, showToast]);

  const handleLeave = useCallback(async () => {
    setSession(null);
    setParticipantName("");
    setParticipantTeam("");
    await store.remove(STORAGE_KEYS.SESSION);
  }, []);

  const handleToggleScore = useCallback(async (team, roundIdx) => {
    const next = {
      ...appState,
      scores: {
        ...appState.scores,
        [team]: appState.scores[team].map((v, i) => (i === roundIdx ? !v : v)),
      },
    };
    await save(next);
  }, [appState, save]);

  const handleSetActiveRound = useCallback(async (n) => {
    await save({ ...appState, activeRound: n });
    showToast(`Round ${n} is now live`);
  }, [appState, save, showToast]);

  const handleUpdateRoundField = useCallback((idx, field, value) => {
    setAppState((prev) => ({
      ...prev,
      rounds: prev.rounds.map((r, i) => (i === idx ? { ...r, [field]: value } : r)),
    }));
  }, []);

  const handleSaveRounds = useCallback(async () => {
    await store.set(STORAGE_KEYS.STATE, appState);
    showToast("Configuration saved");
  }, [appState, showToast]);

  const handleReset = useCallback(async () => {
    if (!window.confirm("Reset ALL scores, participants and configuration? This cannot be undone.")) return;
    await store.clear();
    setAppState(makeDefaultState());
    setSession(null);
    setParticipantName("");
    setParticipantTeam("");
    showToast("All data reset");
  }, [showToast]);

  const handleRemoveParticipant = useCallback(async (name) => {
    await save({ ...appState, participants: appState.participants.filter((p) => p.name !== name) });
    showToast("Participant removed");
  }, [appState, save, showToast]);

  if (!appState) {
    return (
      <>
        <style>{css}</style>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Share Tech Mono', monospace", color: "#00ff88", letterSpacing: 4 }}>
          INITIALIZING...
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="scanline" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />
      <div className="app">
        <header className="header">
          <div className="header-logo">
            <div className="logo-mark" aria-hidden="true">CTF</div>
            <div>
              <div className="logo-text">SECURITY CTF</div>
              <div className="logo-sub">{EVENT_NAME}</div>
            </div>
          </div>
          <nav className="header-nav" aria-label="Main navigation">
            <button className={`nav-btn ${view === "participant" ? "active" : ""}`} onClick={() => setView("participant")}>
              Participant
            </button>
            {!adminAuth ? (
              <button className="nav-btn" onClick={() => setView("admin-login")}>Admin</button>
            ) : (
              <>
                <button className={`nav-btn ${adminTab === "scoreboard" ? "active" : ""}`} onClick={() => goAdmin("scoreboard")}>Scores</button>
                <button className={`nav-btn ${adminTab === "setup" ? "active" : ""}`} onClick={() => goAdmin("setup")}>Setup</button>
                <button className={`nav-btn ${adminTab === "participants" ? "active" : ""}`} onClick={() => goAdmin("participants")}>Members</button>
                <button className="nav-btn danger" onClick={handleAdminLock}>Lock</button>
              </>
            )}
          </nav>
        </header>

        <main>
          {view === "participant" && (
            <ParticipantView
              appState={appState}
              session={session}
              scoreOf={scoreOf}
              participantName={participantName}
              setParticipantName={setParticipantName}
              participantTeam={participantTeam}
              setParticipantTeam={setParticipantTeam}
              onRegister={handleRegister}
              onLeave={handleLeave}
            />
          )}
          {view === "admin-login" && (
            <AdminLoginView
              adminPw={adminPw}
              setAdminPw={setAdminPw}
              onLogin={handleAdminLogin}
              onBack={() => setView("participant")}
            />
          )}
          {view === "admin" && adminAuth && adminTab === "scoreboard" && (
            <AdminScoreboard
              appState={appState}
              scoreOf={scoreOf}
              onSetActiveRound={handleSetActiveRound}
              onToggleScore={handleToggleScore}
            />
          )}
          {view === "admin" && adminAuth && adminTab === "setup" && (
            <AdminSetup
              appState={appState}
              onUpdateRoundField={handleUpdateRoundField}
              onSave={handleSaveRounds}
              onReset={handleReset}
            />
          )}
          {view === "admin" && adminAuth && adminTab === "participants" && (
            <AdminParticipants
              appState={appState}
              onRemove={handleRemoveParticipant}
            />
          )}
        </main>

        {toast && (
          <div role="alert" className={`toast ${toast.type === "error" ? "error" : ""}`}>
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}
