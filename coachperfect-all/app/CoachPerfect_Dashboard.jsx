// ═══════════════════════════════════════════════════
// COACH PERFECT — MAIN DASHBOARD
// ═══════════════════════════════════════════════════
//
// Auth gate: shows LoginScreen until user is authenticated.
// After login, renders the full dashboard with the coach's
// name and plan displayed in the header.
//
// Tab components:
//   - OverviewTab:    KPIs, radar chart, revenue, tasks, recs, pipeline
//   - SessionsTab:    No-show tracker, session prep brief, session log
//   - DiagnosticsTab: Before/after scorecard, radar overlay, category breakdown
//   - WinsTab:        Win journal + habit tracker with streaks
//   - GoalsTab:       Goal tracker + ROI calculator
//

import { useState, useEffect } from "react";
import {
  BarChart3, Calendar, Activity, Award, Target, FileText, Zap, Bell, LogOut, Users,
} from "lucide-react";

import { C } from "./components/theme";
import { Card } from "./components/ui";
import LoginScreen from "./components/LoginScreen";
import api, { getToken } from "./lib/api";

import OverviewTab from "./components/OverviewTab";
import SessionsTab from "./components/SessionsTab";
import DiagnosticsTab from "./components/DiagnosticsTab";
import WinsTab from "./components/WinsTab";
import GoalsTab from "./components/GoalsTab";
import ClientsTab from "./components/ClientsTab";

// ─── TAB CONFIGURATION ───────────────────────────────────────────────────────
const tabs = [
  { id: "overview",    label: "Overview",      icon: BarChart3 },
  { id: "sessions",    label: "Sessions",      icon: Calendar },
  { id: "clients",     label: "Clients",       icon: Users },
  { id: "diagnostics", label: "Diagnostics",   icon: Activity },
  { id: "wins",        label: "Wins & Habits", icon: Award },
  { id: "goals",       label: "Goals & ROI",   icon: Target },
  { id: "documents",   label: "Documents",     icon: FileText },
  { id: "workflows",   label: "Workflows",     icon: Zap },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function CoachPerfectDash() {
  const [tab, setTab]     = useState("overview");
  const [coach, setCoach] = useState(null);   // null = not authenticated yet
  const [checked, setChecked] = useState(false); // true once we've checked token

  // On mount, restore session from localStorage token
  useEffect(() => {
    if (getToken()) {
      // Token exists — restore minimal coach state from localStorage
      const saved = localStorage.getItem("cp_coach");
      if (saved) {
        try { setCoach(JSON.parse(saved)); } catch {}
      }
    }
    setChecked(true);

    // Listen for forced logout (e.g. expired refresh token)
    const onLogout = () => { setCoach(null); localStorage.removeItem("cp_coach"); };
    window.addEventListener("cp:logout", onLogout);
    return () => window.removeEventListener("cp:logout", onLogout);
  }, []);

  const handleAuth = (coachData) => {
    setCoach(coachData);
    localStorage.setItem("cp_coach", JSON.stringify(coachData));
  };

  const handleLogout = () => {
    api.logout();
    setCoach(null);
    localStorage.removeItem("cp_coach");
  };

  // Spinner while checking stored token
  if (!checked) {
    return (
      <div style={{ minHeight: "100vh", background: C.surface, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 13, color: C.muted }}>Loading…</span>
      </div>
    );
  }

  // Auth gate
  if (!coach) {
    return <LoginScreen onAuth={handleAuth} />;
  }

  // ─── Initials for avatar ───
  const initials = (coach.name || "Me")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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

          {/* Plan badge */}
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 20,
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {coach.plan || "free"}
          </span>

          {/* Avatar */}
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: C.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              title: coach.name,
            }}
          >
            {initials}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.55)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: 0,
            }}
          >
            <LogOut size={15} />
          </button>
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
              Welcome back, {coach.name?.split(" ")[0] || "Coach"}. Here&rsquo;s your business at a glance.
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
        {tab === "clients"     && <ClientsTab />}
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
