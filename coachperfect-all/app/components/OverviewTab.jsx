// ═══════════════════════════════════════════════════
// OVERVIEW TAB — real API data
// ═══════════════════════════════════════════════════

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";

import { C } from "./theme";
import { Card, SectionHeader, Badge } from "./ui";
import { useApi, Spinner, Empty, ApiError } from "../lib/useApi";
import api from "../lib/api";

const CATEGORY_LABELS = {
  strategy: "Strategy", financial: "Financial", operations: "Operations",
  people: "People", marketing: "Marketing", leadership: "Leadership",
  innovation: "Innovation", systems: "Systems",
};

function KpiCard({ label, value, sub, color }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || C.primary, letterSpacing: -0.5, lineHeight: 1 }}>{value ?? "—"}</div>
      {sub && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

const priorityColor = (p) => p === "high" || p === "urgent" ? C.danger : p === "medium" ? C.warning : C.success;

export default function OverviewTab() {
  const { data: dash, loading, error, refresh } = useApi(() => api.getDashboard());
  const { data: rev } = useApi(() => api.getRevenue());

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}><Spinner size={30} /></div>;
  if (error)   return <ApiError message={error} onRetry={refresh} />;

  const kpis       = dash?.kpis || {};
  const tasks      = dash?.tasks || [];
  const recs       = dash?.recommendations || [];
  const latestDiag = dash?.latestDiag;
  const prevDiag   = dash?.prevDiag;
  const upcoming   = dash?.upcoming || [];

  // Radar data
  const radarData = latestDiag?.categories
    ? Object.entries(latestDiag.categories).map(([cat, score]) => ({
        subject:  CATEGORY_LABELS[cat] || cat,
        score,
        baseline: prevDiag?.categories?.[cat] ?? 0,
        fullMark: 100,
      }))
    : [];

  const revenueMonths = rev?.months || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── KPI CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12 }}>
        <KpiCard label="Active Clients"    value={kpis.activeClients}     sub={`${kpis.totalClients ?? 0} total`} />
        <KpiCard label="Sessions / Mo"     value={kpis.sessionsThisMonth} sub="this month" />
        <KpiCard label="Attendance Rate"   value={`${kpis.attendanceRate ?? 100}%`} color={kpis.attendanceRate >= 85 ? C.success : C.warning} sub="all time" />
        <KpiCard label="Avg Diag Score"    value={kpis.avgDiagScore ? `${kpis.avgDiagScore}` : "—"} sub="across clients" color={kpis.avgDiagScore >= 65 ? C.success : C.warning} />
        <KpiCard label="Open Tasks"        value={kpis.openTasks ?? 0}   sub="pending" color={kpis.openTasks > 5 ? C.warning : C.success} />
        <KpiCard label="Est. MRR"          value={kpis.mrr ? `$${kpis.mrr.toLocaleString()}` : "—"} sub="monthly revenue" color={C.accent} />
      </div>

      {/* ── CHARTS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16 }}>
        <Card>
          <SectionHeader title="Business Health Radar" sub={latestDiag ? `Current score: ${latestDiag.score}/100` : "No diagnostic data yet"} />
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke={C.border} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: C.muted }} />
                {prevDiag && (
                  <Radar name="Previous" dataKey="baseline" stroke={C.muted} fill={C.muted} fillOpacity={0.08} strokeDasharray="4 4" />
                )}
                <Radar name="Current" dataKey="score" stroke={C.accent} fill={C.accent} fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <Empty icon="🎯" message="No diagnostic data yet" sub="Send a diagnostic to a client or complete one yourself" />
          )}
        </Card>

        <Card>
          <SectionHeader title="Session Activity" sub="Last 6 months" />
          {revenueMonths.length > 0 && revenueMonths.some(m => m.sessions > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueMonths} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="sessions" name="Attended"  fill={C.primary} radius={[4,4,0,0]} maxBarSize={32} />
                <Bar dataKey="noShows"  name="No-shows"  fill={C.danger}  radius={[4,4,0,0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty icon="📊" message="No sessions yet" sub="Schedule sessions to see activity trends here" />
          )}
        </Card>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {/* Tasks */}
        <Card>
          <SectionHeader title="Priority Tasks" sub={`${tasks.length} open`} />
          {tasks.length === 0 ? (
            <Empty icon="✅" message="All caught up!" sub="No open tasks" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {tasks.slice(0, 7).map(t => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", borderRadius: 7, border: `1px solid ${C.border}`, background: "#fafafa" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: priorityColor(t.priority), flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: C.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                  {t.due_date && (
                    <span style={{ fontSize: 10, color: C.muted, flexShrink: 0 }}>
                      {new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recommendations */}
        <Card>
          <SectionHeader title="Focus Areas" sub="Based on latest diagnostic" />
          {recs.length === 0 ? (
            <Empty icon="💡" message="Complete a diagnostic" sub="Get personalised recommendations" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recs.map((r, i) => (
                <div key={i} style={{ padding: "10px 12px", borderRadius: 8, background: r.priority === "urgent" ? `${C.danger}08` : `${C.warning}08`, border: `1px solid ${r.priority === "urgent" ? C.danger : C.warning}25` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: C.primary }}>{r.icon} {r.label}</span>
                    <Badge label={`${r.score}%`} color={r.priority === "urgent" ? C.danger : C.warning} bg={`${r.priority === "urgent" ? C.danger : C.warning}15`} />
                  </div>
                  <p style={{ margin: 0, fontSize: 11.5, color: C.muted, lineHeight: 1.5 }}>{r.recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming */}
        <Card>
          <SectionHeader title="Upcoming Sessions" sub={`${upcoming.length} scheduled`} />
          {upcoming.length === 0 ? (
            <Empty icon="📅" message="Nothing scheduled" sub="Add sessions in the Sessions tab" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {upcoming.map(s => {
                const d = new Date(s.scheduled_at);
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 7, border: `1px solid ${C.border}` }}>
                    <div style={{ textAlign: "center", width: 38, background: `${C.primary}10`, borderRadius: 7, padding: "4px 0", flexShrink: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: C.primary, lineHeight: 1 }}>{d.getDate()}</div>
                      <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase" }}>{d.toLocaleDateString("en-US", { month: "short" })}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.client_name || "TBD"}</div>
                      <div style={{ fontSize: 10.5, color: C.muted }}>{d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} · {s.session_type}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
