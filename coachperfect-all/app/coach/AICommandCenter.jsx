import { useState } from "react";
import { C, AI_AGENTS, AI_QUEUE } from "./styles.js";
import { Card, CardTitle } from "./components.jsx";

export function AICommandCenter() {
  const [agents, setAgents] = useState(AI_AGENTS);
  const [queue, setQueue] = useState(AI_QUEUE);

  const toggleAgent = (id) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status: a.status === "active" ? "paused" : "active" } : a));
  };

  const approveItem = (id) => setQueue(prev => prev.map(i => i.id === id ? { ...i, status: "approved" } : i));
  const dismissItem = (id) => setQueue(prev => prev.filter(i => i.id !== id));

  const pending = queue.filter(i => i.status === "needs_review");
  const completed = queue.filter(i => i.status !== "needs_review");
  const activeCount = agents.filter(a => a.status === "active").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Header stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { icon: "🤖", label: "Active Agents", value: activeCount, color: C.success },
          { icon: "🔍", label: "Needs Review", value: pending.length, color: C.warning },
          { icon: "✅", label: "Auto-Completed", value: completed.filter(i => i.status === "auto_completed").length, color: C.info },
        ].map((s, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: "16px 18px", textAlign: "center" }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, margin: "4px 0 2px" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.text }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Human Review Queue */}
      {pending.length > 0 && (
        <Card style={{ borderTop: `3px solid ${C.warning}` }}>
          <CardTitle>
            <span>⚠️ Needs Your Review ({pending.length})</span>
          </CardTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pending.map(item => (
              <div key={item.id} style={{ padding: 14, borderRadius: 10, background: `${C.warning}06`, border: `1px solid ${C.warning}25` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.warning, background: `${C.warning}15`, padding: "2px 7px", borderRadius: 4 }}>{item.agent}</span>
                    <span style={{ fontSize: 10, color: C.text, marginLeft: 8 }}>{item.time}</span>
                  </div>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 13, color: C.navy, fontWeight: 500, lineHeight: 1.4 }}>{item.action}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => approveItem(item.id)}
                    style={{ padding: "6px 14px", borderRadius: 7, background: C.success, color: C.white, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    ✓ Approve & Send
                  </button>
                  <button style={{ padding: "6px 14px", borderRadius: 7, background: C.navy, color: C.white, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    ✏ Edit First
                  </button>
                  <button onClick={() => dismissItem(item.id)}
                    style={{ padding: "6px 14px", borderRadius: 7, background: "transparent", color: C.text, border: `1px solid ${C.border}`, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Agent Grid */}
      <Card>
        <CardTitle>
          <span>🤖 AI Agents</span>
        </CardTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {agents.map(agent => (
            <div key={agent.id} style={{ padding: 16, borderRadius: 12, border: `1px solid ${agent.status === "active" ? `${C.success}40` : C.border}`, background: agent.status === "active" ? `${C.success}04` : C.cream }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{agent.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{agent.name}</div>
                    <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 8, background: agent.status === "active" ? `${C.success}15` : `${C.text}12`, color: agent.status === "active" ? C.success : C.text, fontWeight: 700 }}>
                      {agent.status === "active" ? "● RUNNING" : "❙❙ PAUSED"}
                    </span>
                  </div>
                </div>
                {/* Toggle */}
                <button onClick={() => toggleAgent(agent.id)}
                  style={{ width: 38, height: 22, borderRadius: 11, border: "none", background: agent.status === "active" ? C.success : "#d1d5db", position: "relative", cursor: "pointer", flexShrink: 0, transition: "background 0.2s" }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.white, position: "absolute", top: 3, left: agent.status === "active" ? 19 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </button>
              </div>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: C.text, lineHeight: 1.4 }}>{agent.description}</p>
              <div style={{ fontSize: 10, color: `${C.text}88`, display: "flex", gap: 10 }}>
                <span>Last: {agent.lastRun}</span>
                <span>Next: {agent.nextRun}</span>
              </div>
              <div style={{ fontSize: 10, color: C.info, marginTop: 3 }}>
                Serving {agent.clientsServed} clients
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Completed log */}
      <Card>
        <CardTitle>
          <span>📋 Recent Agent Activity</span>
        </CardTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[...completed, ...queue.filter(i => i.status === "approved")].map(item => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: C.cream }}>
              <span style={{ fontSize: 14 }}>{item.status === "auto_completed" ? "🤖" : "✅"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{item.action}</div>
                <div style={{ fontSize: 10, color: C.text }}>{item.agent} · {item.time}</div>
              </div>
              <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 6, fontWeight: 700, background: item.status === "auto_completed" ? `${C.info}15` : `${C.success}15`, color: item.status === "auto_completed" ? C.info : C.success }}>
                {item.status === "auto_completed" ? "Auto" : "Approved"}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
