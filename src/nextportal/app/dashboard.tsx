"use client";

import { useState, useEffect } from "react";
import type { DashboardData, Service, Activity, ServiceStatus, ActivityType } from "@/lib/data";

// ── Helpers ────────────────────────────────────────────────────────────────────

const accentColor: Record<string, string> = {
  blue:   "var(--accent)",
  green:  "var(--accent2)",
  red:    "var(--accent3)",
  purple: "#c084fc",
};

const statusColor: Record<ServiceStatus, string> = {
  operational: "var(--accent2)",
  degraded:    "#f59e0b",
  down:        "var(--accent3)",
};

const statusLabel: Record<ServiceStatus, string> = {
  operational: "Operational",
  degraded:    "Degraded",
  down:        "Down",
};

const activityColor: Record<ActivityType, string> = {
  ok:    "var(--accent2)",
  info:  "var(--accent)",
  warn:  "#f59e0b",
  error: "var(--accent3)",
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-GB", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.8rem", color: "var(--text-mid)", letterSpacing: "0.05em" }}>
      {time} UTC
    </span>
  );
}

function MiniBar({ color }: { color: string }) {
  // Deterministic heights — no Math.random() to avoid SSR mismatch
  const pts = Array.from({ length: 8 }, (_, i) =>
    Math.round(30 + Math.sin(i * 1.1) * 15 + Math.sin(i * 2.7) * 5)
  );
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 28 }}>
      {pts.map((h, i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: `${h}%`,
            background: color,
            borderRadius: 2,
            opacity: i === pts.length - 1 ? 1 : 0.35 + i * 0.08,
          }}
        />
      ))}
    </div>
  );
}

// ── Main Dashboard Client Component ───────────────────────────────────────────

export default function Dashboard({ data }: { data: DashboardData }) {
  const { metrics, services, activity, requestVolume } = data;
  const [activeTab, setActiveTab] = useState<"overview" | "services" | "logs">("overview");

  const card: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "20px 24px",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", padding: "0 0 48px" }}>

      {/* ── Top bar ── */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(13,15,20,0.85)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 56,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect width="22" height="22" rx="6" fill="var(--accent)" opacity="0.15"/>
            <path d="M5 11 L11 5 L17 11 L11 17 Z" stroke="var(--accent)" strokeWidth="1.5" fill="none"/>
            <circle cx="11" cy="11" r="2" fill="var(--accent)"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.04em", color: "var(--text)" }}>
            NEXUS
          </span>
          <span style={{
            marginLeft: 4, fontSize: "0.65rem",
            background: "rgba(79,124,255,0.15)", color: "var(--accent)",
            border: "1px solid rgba(79,124,255,0.3)", borderRadius: 4,
            padding: "1px 6px", fontWeight: 600, letterSpacing: "0.06em",
          }}>
            OPS
          </span>
        </div>

        <nav style={{ display: "flex", gap: 4 }}>
          {(["overview", "services", "logs"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "5px 14px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.02em",
              background: activeTab === tab ? "var(--muted)" : "transparent",
              color: activeTab === tab ? "var(--text)" : "var(--text-dim)",
              transition: "all 0.15s ease", textTransform: "capitalize",
            }}>
              {tab}
            </button>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <LiveClock />
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "var(--accent2)", boxShadow: "0 0 6px var(--accent2)",
          }} />
          <span style={{ fontSize: "0.75rem", color: "var(--text-mid)" }}>All systems live</span>
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>

        <div className="fade-up" style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
            Operations Dashboard
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--text-dim)" }}>
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            &nbsp;·&nbsp;Environment: <span style={{ color: "var(--accent)" }}>production</span>
          </p>
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
              {metrics.map((m, i) => {
                const c = accentColor[m.accent];
                return (
                  <div key={m.label} className={`fade-up fade-up-${i + 1}`} style={{ ...card, borderTop: `2px solid ${c}` }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 60, background: `linear-gradient(to bottom, ${c}12, transparent)`, pointerEvents: "none" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-dim)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{m.label}</p>
                        <p style={{ margin: "8px 0 4px", fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>{m.value}</p>
                        <span style={{ fontSize: "0.72rem", fontWeight: 600, color: m.up ? "var(--accent2)" : "var(--accent3)" }}>
                          {m.delta} <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>vs yesterday</span>
                        </span>
                      </div>
                      <MiniBar color={c} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
              {/* Bar chart */}
              <div className="fade-up fade-up-5" style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-dim)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Request Volume</p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.95rem", fontWeight: 600 }}>Last 24 Hours</p>
                  </div>
                  <div style={{ display: "flex", gap: 12, fontSize: "0.72rem", color: "var(--text-dim)" }}>
                    <span>Peak: <b style={{ color: "var(--text)" }}>{requestVolume.peak}</b></span>
                    <span>Avg: <b style={{ color: "var(--text)" }}>{requestVolume.avg}</b></span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120 }}>
                  {requestVolume.hours.map((v, i) => (
                    <div key={i} className="bar-animate" style={{
                      flex: 1, height: `${v}%`,
                      background: i >= requestVolume.hours.length - 4
                        ? "linear-gradient(to top, var(--accent), rgba(79,124,255,0.5))"
                        : "var(--muted)",
                      borderRadius: "3px 3px 0 0",
                      animationDelay: `${i * 0.02}s`,
                      cursor: "pointer",
                      transition: "opacity 0.15s",
                    }} title={`${(v * 0.98).toFixed(0)}k requests`} />
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: "0.65rem", color: "var(--text-dim)" }}>
                  <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
                </div>
              </div>

              {/* Activity */}
              <div className="fade-up fade-up-6" style={{ ...card, padding: "20px 20px" }}>
                <p style={{ margin: "0 0 16px", fontSize: "0.72rem", color: "var(--text-dim)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Recent Activity</p>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                  {activity.map((a, i) => (
                    <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: activityColor[a.type], marginTop: 5, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.event}</p>
                        <p style={{ margin: "1px 0 0", fontSize: "0.68rem", color: "var(--text-dim)" }}>{a.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}

        {/* ── SERVICES ── */}
        {activeTab === "services" && (
          <div className="fade-up" style={card}>
            <p style={{ margin: "0 0 20px", fontSize: "0.72rem", color: "var(--text-dim)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Service Health</p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {["Service", "Status", "Uptime (30d)", "Latency", "Health"].map((h) => (
                    <th key={h} style={{ textAlign: "left", paddingBottom: 12, fontWeight: 500, borderBottom: "1px solid var(--border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map((s: Service, i: number) => (
                  <tr key={s.name} style={{ borderBottom: i < services.length - 1 ? "1px solid var(--border)" : "none", fontSize: "0.83rem" }}>
                    <td style={{ padding: "14px 0", fontWeight: 500 }}>{s.name}</td>
                    <td>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600,
                        background: `${statusColor[s.status]}18`, color: statusColor[s.status],
                        border: `1px solid ${statusColor[s.status]}40`,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor[s.status] }} />
                        {statusLabel[s.status]}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-mid)" }}>{s.uptime}</td>
                    <td style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.78rem", color: "var(--text-mid)" }}>{s.latency}</td>
                    <td>
                      <div style={{ width: 80, height: 6, background: "var(--muted)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: s.status === "operational" ? "96%" : s.status === "degraded" ? "60%" : "0%",
                          background: statusColor[s.status], borderRadius: 3, transition: "width 0.6s ease",
                        }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── LOGS ── */}
        {activeTab === "logs" && (
          <div className="fade-up" style={{ ...card, fontFamily: "ui-monospace, monospace" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-dim)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Event Log</p>
              <span style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>Today · {activity.length} events</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {activity.map((a: Activity, i: number) => (
                <div key={i} style={{
                  display: "flex", gap: 16, padding: "10px 12px", borderRadius: 6,
                  background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
                  fontSize: "0.78rem", alignItems: "center",
                }}>
                  <span style={{ color: "var(--text-dim)", flexShrink: 0, minWidth: 40 }}>{a.time}</span>
                  <span style={{ flexShrink: 0, minWidth: 44, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", color: activityColor[a.type], textTransform: "uppercase" }}>{a.type}</span>
                  <span style={{ color: "var(--text-mid)" }}>{a.event}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
