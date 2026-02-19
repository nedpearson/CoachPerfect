// ═══════════════════════════════════════════════════
// COACH PERFECT — MAIN DASHBOARD
// ═══════════════════════════════════════════════════
//
// Modular layout that imports each tab from ./components/
//   - OverviewTab:    KPIs, radar chart, revenue, tasks, recs, pipeline
//   - SessionsTab:    No-show tracker, session prep brief, session log
//   - DiagnosticsTab: Before/after scorecard, radar overlay, category breakdown
//   - WinsTab:        Win journal + habit tracker with streaks
//   - GoalsTab:       Goal tracker + ROI calculator
//

import { useState } from "react";
import {
  BarChart3, Calendar, Activity, Award, Target, FileText, Zap, Bell,
} from "lucide-react";

import { C } from "./components/theme";
import { Card } from "./components/ui";

import OverviewTab from "./components/OverviewTab";
import SessionsTab from "./components/SessionsTab";
import DiagnosticsTab from "./components/DiagnosticsTab";
import WinsTab from "./components/WinsTab";
import GoalsTab from "./components/GoalsTab";

// ─── TAB CONFIGURATION ───────────────────────────────────────────────────────
const tabs = [
  { id: "overview",    label: "Overview",      icon: BarChart3 },
  { id: "sessions",    label: "Sessions",      icon: Calendar },
  { id: "diagnostics", label: "Diagnostics",   icon: Activity },
  { id: "wins",        label: "Wins & Habits", icon: Award },
  { id: "goals",       label: "Goals & ROI",   icon: Target },
  { id: "documents",   label: "Documents",     icon: FileText },
  { id: "workflows",   label: "Workflows",     icon: Zap },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function CoachPerfectDash() {
  const [tab, setTab] = useState("overview");

  return (
    <div style={{ minHeight: "100vh", background: C.surface, fontFamily: "'Inter',-apple-system,system-ui,sans-serif" }}>
      {/* ─── HEADER ─── */}
      <header
        style={{
          background: C.primary,
          color: "#fff",
          padding: "0 28px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: -0.5 }}>
            <span style={{ color: C.accent }}>Coach</span>Perfect
          </span>
          <nav style={{ display: "flex", gap: 1, marginLeft: 12 }}>
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    padding: "7px 13px",
                    background: tab === t.id ? "rgba(255,255,255,0.12)" : "transparent",
                    border: "none",
                    color: tab === t.id ? "#fff" : "rgba(255,255,255,0.55)",
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Icon size={13} />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative" }}>
            <Bell size={17} style={{ opacity: 0.65, cursor: "pointer" }} />
            <div
              style={{
                position: "absolute",
                top: -2,
                right: -3,
                width: 7,
                height: 7,
                background: C.danger,
                borderRadius: "50%",
                border: `2px solid ${C.primary}`,
              }}
            />
          </div>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: C.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ME
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main style={{ maxWidth: 1380, margin: "0 auto", padding: "20px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.primary }}>
              {tabs.find((t) => t.id === tab)?.label}
            </h1>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: C.muted }}>
              Welcome back, Meredith. Here's your business at a glance.
            </p>
          </div>
          <select
            style={{
              padding: "7px 12px",
              borderRadius: 7,
              border: `1px solid ${C.border}`,
              fontSize: 12,
              color: C.muted,
              background: "#fff",
            }}
          >
            <option>This Month</option>
            <option>This Quarter</option>
            <option>YTD</option>
          </select>
        </div>

        {/* ─── TAB PANELS ─── */}
        {tab === "overview"    && <OverviewTab />}
        {tab === "sessions"    && <SessionsTab />}
        {tab === "diagnostics" && <DiagnosticsTab />}
        {tab === "wins"        && <WinsTab />}
        {tab === "goals"       && <GoalsTab />}
        {tab === "documents"   && (
          <Card>
            <p style={{ color: C.muted, margin: 0 }}>
              Documents module — coming soon. Upload session notes, proposals, and client agreements here.
            </p>
          </Card>
        )}
        {tab === "workflows"   && (
          <Card>
            <p style={{ color: C.muted, margin: 0 }}>
              Workflow automation — coming soon. Build triggered sequences for onboarding, follow-ups, and diagnostic invites.
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
