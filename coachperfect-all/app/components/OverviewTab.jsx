// ═══════════════════════════════════════════════════
// OVERVIEW TAB — KPIs, Radar, Revenue, Tasks, Recs, Pipeline
// ═══════════════════════════════════════════════════

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { TrendingUp, TrendingDown, Plus } from "lucide-react";

import { C, pColors, pipeColors } from "./theme";
import { Card, SectionHeader, Badge } from "./ui";
import { kpis, revenue, diag, tasks, recs, pipe } from "./data";

export default function OverviewTab() {
  return (
    <>
      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14, marginBottom: 18 }}>
        {kpis.map((k) => {
          const Icon = k.icon;
          const isGood =
            (k.up && k.name !== "Open Items") ||
            (!k.up && k.name === "Open Items");
          return (
            <Card key={k.name} style={{ padding: "17px 18px", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 7, background: `${C.primary}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={16} color={C.primary} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 600, color: isGood ? C.success : C.danger }}>
                  {k.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {k.change}
                </div>
              </div>
              <div style={{ fontSize: 25, fontWeight: 700, color: C.primary, letterSpacing: -0.5 }}>
                {k.value}
              </div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>
                {k.name} · Target: {k.target}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Radar + Revenue */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Business Health Radar */}
        <Card>
          <SectionHeader
            title="Business Health Score"
            sub="8-category diagnostic"
            action={<Badge label="7.4 / 10" color={C.accent} bg={`${C.accent}20`} />}
          />
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={diag}>
              <PolarGrid stroke={C.border} />
              <PolarAngleAxis dataKey="cat" tick={{ fontSize: 10, fill: C.muted }} />
              <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 9 }} />
              <Radar dataKey="baseline" stroke={`${C.muted}80`} fill="none" strokeDasharray="4 3" strokeWidth={1.5} name="Baseline" />
              <Radar dataKey="s" stroke={C.primary} fill={C.primary} fillOpacity={0.12} strokeWidth={2} name="Current" />
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", fontSize: 11, color: C.muted, marginTop: 6 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 20, borderTop: `2px dashed ${C.muted}`, display: "inline-block" }} />
              Baseline
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 20, borderTop: `2px solid ${C.primary}`, display: "inline-block" }} />
              Current
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {diag
              .filter((d) => d.s < 6)
              .map((d) => (
                <span key={d.cat} style={{ background: `${C.danger}12`, color: C.danger, padding: "2px 9px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
                  ⚠ {d.cat}: {d.s}
                </span>
              ))}
          </div>
        </Card>

        {/* Revenue vs Target */}
        <Card>
          <SectionHeader title="Revenue vs Target" sub="6-month rolling ($K)" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenue} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="m" tick={{ fontSize: 11, fill: C.muted }} />
              <YAxis tick={{ fontSize: 10, fill: C.muted }} />
              <Tooltip formatter={(v) => `$${v}K`} />
              <Bar dataKey="rev" fill={C.primary} radius={[3, 3, 0, 0]} name="Revenue" />
              <Bar dataKey="tgt" fill={C.accent} radius={[3, 3, 0, 0]} name="Target" opacity={0.45} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tasks + Recommendations + Pipeline */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {/* Tasks */}
        <Card>
          <SectionHeader
            title="Priority Tasks"
            action={
              <button style={{ background: C.primary, color: "#fff", border: "none", padding: "5px 12px", borderRadius: 7, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                <Plus size={13} /> Add
              </button>
            }
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {tasks.map((tk, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 7, border: `1px solid ${C.border}`, cursor: "pointer" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: pColors[tk.p], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {tk.t}
                  </div>
                  <div style={{ fontSize: 10.5, color: C.muted, marginTop: 1 }}>
                    {tk.a} · {tk.d}
                  </div>
                </div>
                <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 8, background: tk.s === "active" ? `${C.accent}20` : `${C.muted}12`, color: tk.s === "active" ? C.accent : C.muted, fontWeight: 600 }}>
                  {tk.s}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <SectionHeader title="AI Recommendations" />
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {recs.map((r, i) => (
              <div key={i} style={{ padding: "10px 12px", borderRadius: 7, background: C.surface, border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, lineHeight: 1.3 }}>
                    {r.t}
                  </div>
                  <Badge
                    label={r.type}
                    color={r.type === "quick win" ? C.success : C.primary}
                    bg={r.type === "quick win" ? `${C.success}12` : `${C.primary}10`}
                  />
                </div>
                <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
                  <span style={{ fontSize: 10.5, color: C.muted }}>Impact: <b style={{ color: C.success }}>{r.imp}%</b></span>
                  <span style={{ fontSize: 10.5, color: C.muted }}>Effort: <b style={{ color: C.warning }}>{r.eff}%</b></span>
                  <span style={{ fontSize: 10.5, color: C.muted }}>{r.cat}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pipeline */}
        <Card>
          <SectionHeader title="Sales Pipeline" />
          <div style={{ display: "flex", gap: 7, alignItems: "flex-end", height: 200, paddingTop: 20 }}>
            {pipe.map((p, i) => {
              const h = (p.v / 48) * 150;
              return (
                <div key={p.stage} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.primary }}>{p.v}</span>
                  <div style={{ width: "100%", height: h, background: pipeColors[i], borderRadius: "5px 5px 0 0" }} />
                  <span style={{ fontSize: 10.5, color: C.muted, fontWeight: 600 }}>{p.stage}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 16, padding: "10px 12px", background: C.surface, borderRadius: 7, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: C.muted }}>Conversion Rate</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.success }}>16.7%</span>
          </div>
        </Card>
      </div>
    </>
  );
}
