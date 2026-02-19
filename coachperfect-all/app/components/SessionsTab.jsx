// ═══════════════════════════════════════════════════
// SESSIONS TAB — No-Show Tracker + Session Prep Brief
// ═══════════════════════════════════════════════════

import { useState } from "react";

import { C, statusBadge } from "./theme";
import { Card, SectionHeader, Badge, ProgressBar } from "./ui";
import { sessions } from "./data";

export default function SessionsTab() {
  const [filter, setFilter] = useState("all");

  const noShowCount = sessions.filter((s) => s.status === "no_show").length;
  const lateCancelCount = sessions.filter((s) => s.status === "late_cancel").length;
  const attendedCount = sessions.filter((s) => s.status === "attended").length;
  const attendanceRate = Math.round((attendedCount / sessions.length) * 100);
  const filtered = filter === "all" ? sessions : sessions.filter((s) => s.status === filter);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
      {/* Attendance Stats */}
      <Card style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
          Attendance Rate
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: attendanceRate >= 80 ? C.success : C.warning, letterSpacing: -1 }}>
          {attendanceRate}%
        </div>
        <ProgressBar
          value={attendanceRate}
          color={attendanceRate >= 80 ? C.success : C.warning}
          height={5}
        />
        <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.danger }}>{noShowCount}</div>
            <div style={{ fontSize: 10.5, color: C.muted }}>No-Shows</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.warning }}>{lateCancelCount}</div>
            <div style={{ fontSize: 10.5, color: C.muted }}>Late Cancels</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.success }}>{attendedCount}</div>
            <div style={{ fontSize: 10.5, color: C.muted }}>Attended</div>
          </div>
        </div>
      </Card>

      {/* Session Prep Brief */}
      <Card style={{ gridColumn: "2 / 4" }}>
        <SectionHeader title="Session Prep Brief" sub="Next session: Feb 19 · Chris Ciesielski · 9:00 AM" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
          {[
            { label: "Business Health Score", value: "7.4 → 7.8 (+0.4)", icon: "📈", color: C.success },
            { label: "Overdue Action Items",  value: "0 open · 3 completed", icon: "✅", color: C.success },
            { label: "Last Session Focus",    value: "Q1 Financial Review",  icon: "📋", color: C.primary },
          ].map((item, i) => (
            <div key={i} style={{ padding: "10px 12px", borderRadius: 8, background: C.surface, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 14px", borderRadius: 8, background: `${C.accent}08`, border: `1px solid ${C.accent}30` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 5 }}>
            AI COACHING PROMPTS
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, color: C.muted, fontSize: 12.5, lineHeight: 1.8 }}>
            <li>Revenue milestone hit — open with celebration before pivoting to next 90-day stretch.</li>
            <li>Finance category score is lowest (5.2) — consider direct but supportive inquiry into cash flow visibility.</li>
            <li>Chris has not addressed leadership delegation in 3 sessions — flag pattern gently.</li>
          </ul>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button style={{ flex: 1, padding: "9px", borderRadius: 8, background: C.primary, color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Open Session Notes
          </button>
          <button style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#fff", color: C.primary, border: `1px solid ${C.border}`, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Regenerate Brief
          </button>
        </div>
      </Card>

      {/* Session Log Table */}
      <Card style={{ gridColumn: "1 / 4" }}>
        <SectionHeader
          title="Session Log"
          sub={`${sessions.length} sessions tracked`}
          action={
            <div style={{ display: "flex", gap: 6 }}>
              {["all", "attended", "no_show", "late_cancel"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: `1px solid ${C.border}`,
                    background: filter === f ? C.primary : "#fff",
                    color: filter === f ? "#fff" : C.muted,
                  }}
                >
                  {f === "all" ? "All" : f === "no_show" ? "No-Show" : f === "late_cancel" ? "Late Cancel" : "Attended"}
                </button>
              ))}
            </div>
          }
        />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Date", "Client", "Type", "Duration", "Status", "Notes"].map((h) => (
                <th key={h} style={{ textAlign: "left", fontSize: 10.5, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, paddingBottom: 10, paddingRight: 12 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const badge = statusBadge[s.status];
              return (
                <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "10px 12px 10px 0", fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>
                    {s.date} · {s.time}
                  </td>
                  <td style={{ padding: "10px 12px 10px 0", fontSize: 12.5, fontWeight: 600, color: C.primary }}>
                    {s.client}
                  </td>
                  <td style={{ padding: "10px 12px 10px 0", fontSize: 12, color: C.muted }}>{s.type}</td>
                  <td style={{ padding: "10px 12px 10px 0", fontSize: 12, color: C.muted }}>{s.duration}min</td>
                  <td style={{ padding: "10px 12px 10px 0" }}>
                    <Badge label={badge.label} color={badge.color} bg={badge.bg} />
                  </td>
                  <td style={{ padding: "10px 0", fontSize: 11.5, color: C.muted, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.notes || <span style={{ color: `${C.muted}60`, fontStyle: "italic" }}>No notes</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
