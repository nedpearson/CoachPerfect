import { useState } from "react";
import { C, CLIENTS } from "../coach/styles.js";
import { Card, CardTitle, ProgressBar } from "../coach/components.jsx";

// Mock financial snapshots per client
const SNAPSHOTS = {
  1: { runway: 8.2, cashflow: 14200, burnRate: 31000, revenue: 45200, margin: 31, runway_trend: "up",   lastReport: "Feb 18", scenarios: [{ name: "Conservative", arr: "$485K" }, { name: "Base", arr: "$612K" }, { name: "Optimistic", arr: "$780K" }] },
  2: { runway: 14,  cashflow: 38000, burnRate: 12000, revenue: 50000, margin: 76, runway_trend: "up",   lastReport: "Feb 17", scenarios: [{ name: "Conservative", arr: "$580K" }, { name: "Base", arr: "$720K" }, { name: "Optimistic", arr: "$940K" }] },
  3: { runway: 3.1, cashflow: -4200, burnRate: 28000, revenue: 23800, margin: 15, runway_trend: "down", lastReport: "Feb 10", scenarios: [{ name: "Conservative", arr: "$220K" }, { name: "Base", arr: "$290K" }, { name: "Optimistic", arr: "$380K" }] },
  4: { runway: 11,  cashflow: 9100,  burnRate: 18000, revenue: 27100, margin: 34, runway_trend: "up",   lastReport: "Feb 15", scenarios: [{ name: "Conservative", arr: "$310K" }, { name: "Base", arr: "$390K" }, { name: "Optimistic", arr: "$470K" }] },
  5: { runway: 5.4, cashflow: 2800,  burnRate: 22000, revenue: 24800, margin: 11, runway_trend: "down", lastReport: "Feb 8",  scenarios: [{ name: "Conservative", arr: "$260K" }, { name: "Base", arr: "$330K" }, { name: "Optimistic", arr: "$420K" }] },
};

function RunwayBadge({ months }) {
  const color = months >= 12 ? "#10b981" : months >= 6 ? "#f59e0b" : "#ef4444";
  return (
    <span style={{ padding: "3px 10px", borderRadius: 8, background: `${color}18`, color, fontWeight: 700, fontSize: 12 }}>
      {months}mo runway
    </span>
  );
}

export function AIFinancialAdvisor() {
  const [clientId, setClientId] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState({});

  const client = CLIENTS.find(c => c.id === clientId);
  const snap   = SNAPSHOTS[clientId];

  const generate = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setGenerated(p => ({ ...p, [clientId]: true })); }, 1800);
  };

  const cf_color = snap.cashflow >= 0 ? "#10b981" : "#ef4444";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#1d4ed8,#1e3a5f)", borderRadius: 14, padding: "20px 24px", color: "#fff" }}>
        <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.7, marginBottom: 4 }}>ACTIVE PLUGIN</div>
        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Serif Display',Georgia,serif", marginBottom: 6 }}>📊 AI Financial Advisor</div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>Personalized financial roadmaps, forecasts, and branded advisor reports</div>
      </div>

      {/* Client tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {CLIENTS.map(c => {
          const s = SNAPSHOTS[c.id];
          const bad = s.runway < 6 || s.cashflow < 0;
          return (
            <button key={c.id} onClick={() => setClientId(c.id)}
              style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${bad ? "#ef444440" : C.border}`, fontSize: 11, fontWeight: 600, cursor: "pointer",
                background: clientId === c.id ? "#1d4ed8" : bad ? "#fef2f2" : C.cream, color: clientId === c.id ? "#fff" : bad ? "#ef4444" : C.text }}>
              {c.avatar} {c.name.split(" ")[0]}
              {bad && " ⚠️"}
            </button>
          );
        })}
      </div>

      {/* Snapshot cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { icon: "💵", label: "Monthly Revenue",  value: `$${snap.revenue.toLocaleString()}`,  color: "#10b981" },
          { icon: "🔥", label: "Burn Rate",         value: `$${snap.burnRate.toLocaleString()}`, color: "#ef4444" },
          { icon: "📈", label: "Net Cash Flow",     value: `${snap.cashflow >= 0 ? "+" : ""}$${snap.cashflow.toLocaleString()}`, color: cf_color },
          { icon: "📉", label: "Gross Margin",      value: `${snap.margin}%`,                    color: snap.margin >= 40 ? "#10b981" : "#f59e0b" },
        ].map((s, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: "14px 16px" }}>
            <div style={{ fontSize: 18 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color, margin: "4px 0 2px" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: C.text }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <CardTitle>{client?.name} — Financial Snapshot</CardTitle>
            <div style={{ fontSize: 10, color: C.text, marginTop: -8 }}>Last report: {snap.lastReport}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <RunwayBadge months={snap.runway} />
            <button onClick={generate} disabled={generating}
              style={{ padding: "7px 16px", borderRadius: 8, background: generating ? "#9ca3af" : "#1d4ed8", color: "#fff", border: "none", fontSize: 11, fontWeight: 700, cursor: generating ? "not-allowed" : "pointer" }}>
              {generating ? "Generating..." : generated[clientId] ? "↻ Refresh Report" : "📄 Generate Report"}
            </button>
          </div>
        </div>

        {/* Runway bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: C.text, marginBottom: 4 }}>Runway — {snap.runway} months</div>
          <ProgressBar percent={Math.min(100, (snap.runway / 24) * 100)} color={snap.runway >= 12 ? "#10b981" : snap.runway >= 6 ? "#f59e0b" : "#ef4444"} />
        </div>

        {/* Scenarios */}
        <div style={{ fontSize: 11, fontWeight: 700, color: C.navy, marginBottom: 8 }}>ARR Scenarios</div>
        <div style={{ display: "flex", gap: 10 }}>
          {snap.scenarios.map((sc, i) => (
            <div key={i} style={{ flex: 1, padding: "10px 12px", borderRadius: 8, background: C.cream, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: C.text, marginBottom: 4 }}>{sc.name}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: i === 1 ? "#1d4ed8" : C.navy }}>{sc.arr}</div>
            </div>
          ))}
        </div>

        {generated[clientId] && (
          <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 10, background: "#eff6ff", border: "1px solid #bfdbfe", fontSize: 12, color: "#1e40af" }}>
            ✅ AI report generated — <strong>push to client</strong> or download branded PDF.
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button style={{ padding: "5px 14px", borderRadius: 6, background: "#1d4ed8", color: "#fff", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>📤 Push to Client</button>
              <button style={{ padding: "5px 14px", borderRadius: 6, background: "transparent", border: "1px solid #bfdbfe", fontSize: 11, color: "#1d4ed8", cursor: "pointer" }}>⬇ Download PDF</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
