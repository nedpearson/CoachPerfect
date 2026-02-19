// ═══════════════════════════════════════════════════
// DIAGNOSTICS TAB — Before/After Scorecard + Radar Overlay
// ═══════════════════════════════════════════════════

import {
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Tooltip,
} from "recharts";

import { C } from "./theme";
import { Card, SectionHeader, ProgressBar } from "./ui";
import { diag } from "./data";

export default function DiagnosticsTab() {
  const currentAvg = (diag.reduce((a, d) => a + d.s, 0) / diag.length).toFixed(1);
  const baselineAvg = (diag.reduce((a, d) => a + d.baseline, 0) / diag.length).toFixed(1);
  const gain = (currentAvg - baselineAvg).toFixed(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Summary Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Baseline Score", value: baselineAvg, sub: "First diagnostic",    color: C.muted },
          { label: "Current Score",  value: currentAvg,  sub: "Latest diagnostic",   color: C.primary },
          { label: "Total Gain",     value: `+${gain}`,  sub: "Overall improvement", color: C.success },
          { label: "Weakest Area",   value: "Technology", sub: "Score: 5.2 (base 3.8)", color: C.danger },
        ].map((s) => (
          <Card key={s.label} style={{ textAlign: "center", padding: "18px 14px" }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: s.color, letterSpacing: -1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.primary, marginTop: 4 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Before/After Scorecard */}
        <Card>
          <SectionHeader title="Before / After Scorecard" sub="Baseline vs current scores per category" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {diag.map((d) => {
              const delta = (d.s - d.baseline).toFixed(1);
              return (
                <div key={d.cat}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: C.primary, width: 100 }}>
                      {d.cat}
                    </span>
                    <div style={{ flex: 1, display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: C.muted, width: 28, textAlign: "right" }}>
                        {d.baseline}
                      </span>
                      <div style={{ flex: 1, position: "relative", height: 8, background: `${C.muted}18`, borderRadius: 99 }}>
                        {/* Baseline bar */}
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            height: "100%",
                            width: `${(d.baseline / 10) * 100}%`,
                            background: `${C.muted}50`,
                            borderRadius: 99,
                          }}
                        />
                        {/* Current bar */}
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            height: "100%",
                            width: `${(d.s / 10) * 100}%`,
                            background: d.s >= d.baseline ? C.success : C.danger,
                            borderRadius: 99,
                            opacity: 0.75,
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: C.primary, width: 28 }}>
                        {d.s}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: delta > 0 ? C.success : C.danger,
                        width: 38,
                        textAlign: "right",
                      }}
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14, padding: "10px 12px", background: C.surface, borderRadius: 8, display: "flex", gap: 16, fontSize: 11.5, color: C.muted }}>
            <span>Gray = baseline</span>
            <span style={{ color: C.success }}>Improved</span>
            <span style={{ color: C.danger }}>Declined</span>
          </div>
        </Card>

        {/* Radar Overlay */}
        <Card>
          <SectionHeader title="Radar Overlay" sub="Baseline (dashed) vs current" />
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={diag}>
              <PolarGrid stroke={C.border} />
              <PolarAngleAxis dataKey="cat" tick={{ fontSize: 10, fill: C.muted }} />
              <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 9 }} />
              <Radar
                dataKey="baseline"
                name="Baseline"
                stroke={`${C.muted}90`}
                fill={`${C.muted}10`}
                strokeDasharray="4 3"
                strokeWidth={1.5}
              />
              <Radar
                dataKey="s"
                name="Current"
                stroke={C.success}
                fill={C.success}
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", fontSize: 11, color: C.muted, marginTop: 8 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 20, borderTop: `2px dashed ${C.muted}`, display: "inline-block" }} />
              Baseline
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 20, borderTop: `2px solid ${C.success}`, display: "inline-block" }} />
              Current
            </span>
          </div>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <SectionHeader title="Category Breakdown" sub="Focus areas and improvement tracking" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {diag.map((d) => {
            const delta = (d.s - d.baseline).toFixed(1);
            const riskColor =
              d.s < 6 ? C.danger : d.s < 7.5 ? C.warning : C.success;
            return (
              <div
                key={d.cat}
                style={{ padding: 14, borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>{d.cat}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: riskColor }}>{d.s}</span>
                </div>
                <ProgressBar value={(d.s / 10) * 100} color={riskColor} />
                <div style={{ marginTop: 8, fontSize: 10.5, color: delta > 0 ? C.success : C.danger, fontWeight: 600 }}>
                  {delta > 0 ? `↑ +${delta}` : `↓ ${delta}`} vs baseline
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
