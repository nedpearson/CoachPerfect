import { useState } from "react";
import { C, CLIENTS } from "../coach/styles.js";
import { Card, CardTitle } from "../coach/components.jsx";

// Mock forensic findings per client
const FINDINGS = {
  1: [
    { id: 1, severity: "high",   flag: "Duplicate vendor payment",   amount: "$4,200", date: "Jan 12", status: "review" },
    { id: 2, severity: "medium", flag: "Unusual expense spike (+340%)", amount: "$18,500", date: "Feb 3", status: "review" },
    { id: 3, severity: "low",    flag: "Missing receipt documentation", amount: "$890",   date: "Feb 15", status: "cleared" },
  ],
  2: [
    { id: 4, severity: "high", flag: "Unmatched bank transfer", amount: "$22,000", date: "Jan 28", status: "review" },
  ],
  3: [], 4: [], 5: [],
};

const SEV = {
  high:   { color: "#ef4444", bg: "#fef2f2", label: "High" },
  medium: { color: "#f59e0b", bg: "#fffbeb", label: "Medium" },
  low:    { color: "#6b7280", bg: "#f9fafb", label: "Low" },
};

export function ForensicCPA() {
  const [clientId, setClientId] = useState(1);
  const [findings, setFindings] = useState(FINDINGS);

  const client   = CLIENTS.find(c => c.id === clientId);
  const items    = findings[clientId] || [];
  const open     = items.filter(f => f.status === "review");
  const cleared  = items.filter(f => f.status === "cleared");

  const clear = (id) =>
    setFindings(prev => ({
      ...prev,
      [clientId]: prev[clientId].map(f => f.id === id ? { ...f, status: "cleared" } : f),
    }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0f766e,#134e4a)", borderRadius: 14, padding: "20px 24px", color: "#fff" }}>
        <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.7, marginBottom: 4 }}>ACTIVE PLUGIN</div>
        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Serif Display',Georgia,serif", marginBottom: 6 }}>🔍 Forensic CPA AI</div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>AI-powered financial anomaly detection for your client portfolio</div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { icon: "🚩", label: "Open Flags",   value: Object.values(findings).flat().filter(f => f.status === "review").length,  color: "#ef4444" },
          { icon: "✅", label: "Cleared",       value: Object.values(findings).flat().filter(f => f.status === "cleared").length, color: "#10b981" },
          { icon: "👥", label: "Clients Scanned", value: CLIENTS.length, color: C.navy },
          { icon: "💰", label: "Flagged $",     value: "$45K+",                                                                    color: "#f59e0b" },
        ].map((s, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: "14px 16px" }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color, margin: "4px 0 2px" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: C.text }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Card>
        {/* Client selector */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {CLIENTS.map(c => {
            const cnt = (findings[c.id] || []).filter(f => f.status === "review").length;
            return (
              <button key={c.id} onClick={() => setClientId(c.id)}
                style={{ padding: "6px 14px", borderRadius: 8, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer",
                  background: clientId === c.id ? "#0f766e" : C.cream, color: clientId === c.id ? "#fff" : C.text }}>
                {c.avatar} {c.name.split(" ")[0]}
                {cnt > 0 && <span style={{ marginLeft: 6, padding: "1px 5px", borderRadius: 8, background: "#ef4444", color: "#fff", fontSize: 9 }}>{cnt}</span>}
              </button>
            );
          })}
        </div>

        <CardTitle>{client?.name} — Forensic Findings</CardTitle>

        {open.length === 0 && cleared.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0", color: C.text }}>
            <div style={{ fontSize: 28 }}>✅</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>No anomalies detected for this client.</div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map(f => (
            <div key={f.id} style={{ padding: "12px 14px", borderRadius: 10, background: SEV[f.severity].bg, borderLeft: `4px solid ${SEV[f.severity].color}`, opacity: f.status === "cleared" ? 0.55 : 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: SEV[f.severity].color, color: "#fff" }}>{SEV[f.severity].label.toUpperCase()}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{f.flag}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.text }}>{f.amount} · {f.date}</div>
                </div>
                {f.status === "review" && (
                  <button onClick={() => clear(f.id)} style={{ padding: "5px 12px", borderRadius: 6, background: "#10b981", color: "#fff", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    Clear ✓
                  </button>
                )}
                {f.status === "cleared" && <span style={{ fontSize: 10, color: "#10b981", fontWeight: 700 }}>CLEARED</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
