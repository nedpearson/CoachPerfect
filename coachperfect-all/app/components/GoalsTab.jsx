// ═══════════════════════════════════════════════════
// GOALS TAB — Goal Tracker + ROI Calculator
// ═══════════════════════════════════════════════════

import { useState } from "react";
import { Plus } from "lucide-react";

import { C, goalCatColors } from "./theme";
import { Card, SectionHeader, Badge, ProgressBar } from "./ui";
import { initialGoals, roiClients } from "./data";

export default function GoalsTab() {
  const [goals] = useState(initialGoals);

  const totalFees = roiClients.reduce((sum, c) => sum + c.fee, 0);
  const totalRevenueGain = roiClients.reduce(
    (sum, c) => sum + (c.revAfter - c.revBefore) * 1000,
    0
  );
  const totalROI = totalRevenueGain - totalFees;
  const roiPercent = Math.round((totalROI / totalFees) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Goal Tracker */}
      <Card>
        <SectionHeader
          title="Goal Tracker"
          sub="Your coaching business goals"
          action={
            <button
              style={{
                background: C.primary,
                color: "#fff",
                border: "none",
                padding: "6px 13px",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Plus size={13} /> Add Goal
            </button>
          }
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {goals.map((g) => {
            const catColor = goalCatColors[g.category] || C.muted;
            const progressColor =
              g.progress >= 75 ? C.success : g.progress >= 40 ? C.warning : C.danger;
            return (
              <div
                key={g.id}
                style={{
                  padding: 16,
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  background: C.surface,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: C.primary, marginBottom: 3 }}>
                      {g.title}
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <Badge label={g.category} color={catColor} bg={`${catColor}18`} />
                      <span style={{ fontSize: 10.5, color: C.muted }}>Target: {g.target}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: progressColor, letterSpacing: -0.5 }}>
                      {g.progress}%
                    </div>
                  </div>
                </div>
                <ProgressBar value={g.progress} color={progressColor} height={7} />
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  {g.milestones.map((m, i) => {
                    const done = m.includes("✓");
                    return (
                      <span
                        key={i}
                        style={{
                          fontSize: 10.5,
                          padding: "2px 8px",
                          borderRadius: 7,
                          background: done ? `${C.success}15` : `${C.muted}12`,
                          color: done ? C.success : C.muted,
                          fontWeight: done ? 700 : 400,
                        }}
                      >
                        {m}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ROI Calculator */}
      <Card>
        <SectionHeader
          title="Coaching ROI Dashboard"
          sub="Client revenue impact vs coaching investment"
          action={
            <div
              style={{
                background: `${C.success}15`,
                color: C.success,
                padding: "5px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              {roiPercent}% avg ROI
            </div>
          }
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 16 }}>
          {[
            { label: "Total Revenue Gained",   value: `$${totalRevenueGain.toLocaleString()}`, color: C.success },
            { label: "Total Coaching Fees",    value: `$${totalFees.toLocaleString()}`,         color: C.primary },
            { label: "Net Client Value Added", value: `$${totalROI.toLocaleString()}`,          color: C.accent },
          ].map((m) => (
            <div
              key={m.label}
              style={{
                padding: 14,
                borderRadius: 9,
                background: C.surface,
                border: `1px solid ${C.border}`,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 800, color: m.color, letterSpacing: -0.5 }}>
                {m.value}
              </div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* ROI Table */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Client", "Rev Before", "Rev After", "Gain", "Fees Paid", "Net ROI", "ROI Multiple"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: C.muted,
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                      paddingBottom: 10,
                      paddingRight: 12,
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {roiClients.map((c) => {
              const gain = (c.revAfter - c.revBefore) * 1000;
              const net = gain - c.fee;
              const multiple = (gain / c.fee).toFixed(1);
              return (
                <tr key={c.name} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "10px 12px 10px 0", fontSize: 12.5, fontWeight: 600, color: C.primary }}>
                    {c.name}
                  </td>
                  <td style={{ padding: "10px 12px 10px 0", fontSize: 12, color: C.muted }}>
                    ${c.revBefore.toLocaleString()}K
                  </td>
                  <td style={{ padding: "10px 12px 10px 0", fontSize: 12, color: C.muted }}>
                    ${c.revAfter.toLocaleString()}K
                  </td>
                  <td style={{ padding: "10px 12px 10px 0", fontSize: 12, fontWeight: 700, color: C.success }}>
                    +${gain.toLocaleString()}
                  </td>
                  <td style={{ padding: "10px 12px 10px 0", fontSize: 12, color: C.muted }}>
                    ${c.fee.toLocaleString()}
                  </td>
                  <td style={{ padding: "10px 12px 10px 0", fontSize: 12, fontWeight: 700, color: net > 0 ? C.success : C.danger }}>
                    ${net.toLocaleString()}
                  </td>
                  <td style={{ padding: "10px 0 10px 0" }}>
                    <Badge
                      label={`${multiple}x`}
                      color={parseFloat(multiple) >= 3 ? C.success : C.warning}
                      bg={parseFloat(multiple) >= 3 ? `${C.success}15` : `${C.warning}15`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer */}
        <div
          style={{
            marginTop: 14,
            padding: "12px 14px",
            background: `${C.success}08`,
            borderRadius: 8,
            border: `1px solid ${C.success}20`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 12.5, color: C.muted }}>
            Clients tracked: <b style={{ color: C.primary }}>{roiClients.length}</b>
            {" · "}
            Avg engagement:{" "}
            <b style={{ color: C.primary }}>
              {Math.round(roiClients.reduce((s, c) => s + c.months, 0) / roiClients.length)} months
            </b>
          </div>
          <button
            style={{
              padding: "7px 16px",
              background: C.primary,
              color: "#fff",
              border: "none",
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Export ROI Report
          </button>
        </div>
      </Card>
    </div>
  );
}
