import { useState } from "react";
import { C } from "./styles.js";
import { Card, CardTitle } from "./components.jsx";
import { PLUGINS, pluginsByCategory } from "../plugins/registry.js";
import { ForensicCPA } from "../plugins/ForensicCPA.jsx";
import { AIFinancialAdvisor } from "../plugins/AIFinancialAdvisor.jsx";

// Map component key → actual component (add new entries as plugins are created)
const COMPONENTS = {
  ForensicCPA,
  AIFinancialAdvisor,
};

const PLAN_ORDER = ["free", "starter", "professional", "business", "enterprise"];
const currentPlan = "professional"; // TODO: wire to real auth

function meetsMinPlan(minPlan) {
  return PLAN_ORDER.indexOf(currentPlan) >= PLAN_ORDER.indexOf(minPlan);
}

export function PluginMarketplace() {
  const [active, setActive]     = useState({}); // { pluginId: true }
  const [viewing, setViewing]   = useState(null); // plugin id currently open
  const categories              = pluginsByCategory();

  const toggle = (id) => setActive(prev => ({ ...prev, [id]: !prev[id] }));

  // If a plugin panel is open, render it
  if (viewing) {
    const plugin    = PLUGINS.find(p => p.id === viewing);
    const PanelComp = COMPONENTS[plugin?.component];
    return (
      <div>
        <button onClick={() => setViewing(null)}
          style={{ marginBottom: 16, padding: "6px 14px", borderRadius: 8, background: C.cream, border: `1px solid ${C.border}`, fontSize: 12, fontWeight: 600, color: C.navy, cursor: "pointer" }}>
          ← Back to Plugin Store
        </button>
        {PanelComp ? <PanelComp /> : <div style={{ color: C.text, padding: 40, textAlign: "center" }}>Panel coming soon.</div>}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${C.navy},${C.navyLight})`, borderRadius: 14, padding: "22px 24px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'DM Serif Display',Georgia,serif", marginBottom: 4 }}>🛒 Plugin Store</div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>Extend CoachPerfect with specialist AI tools — each adds value for clients and revenue for you.</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.gold }}>{Object.values(active).filter(Boolean).length}</div>
          <div style={{ fontSize: 10, opacity: 0.7 }}>Active plugins</div>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {[
          { icon: "🔌", label: "Available Plugins",   value: PLUGINS.length },
          { icon: "✅", label: "Active",               value: Object.values(active).filter(Boolean).length },
          { icon: "💰", label: "Add-On MRR Potential", value: `$${PLUGINS.filter(p => active[p.id]).reduce((s, p) => s + p.priceCents / 100, 0)}/mo` },
        ].map((s, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: "14px 18px", textAlign: "center" }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.navy, margin: "4px 0 2px" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: C.text }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Plugin cards by category */}
      {Object.entries(categories).map(([cat, plugins]) => (
        <Card key={cat}>
          <CardTitle>{cat} Plugins</CardTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {plugins.map(p => {
              const isOn       = !!active[p.id];
              const canActivate = meetsMinPlan(p.minPlan);
              return (
                <div key={p.id} style={{ padding: 16, borderRadius: 12, border: `2px solid ${isOn ? `${p.color}50` : C.border}`, background: isOn ? `${p.color}06` : C.white, transition: "all 0.15s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 26 }}>{p.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, display: "flex", gap: 6, alignItems: "center" }}>
                          {p.name}
                          {p.badge && <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, background: p.color, color: "#fff", fontWeight: 700 }}>{p.badge}</span>}
                        </div>
                        <div style={{ fontSize: 10, color: C.text }}>{p.tagline}</div>
                      </div>
                    </div>
                  </div>
                  <p style={{ margin: "0 0 10px", fontSize: 11, color: C.text, lineHeight: 1.4 }}>{p.description}</p>
                  <div style={{ fontSize: 10, color: p.color, fontWeight: 600, marginBottom: 10 }}>💡 {p.coachBenefit}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.gold }}>{p.price}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      {isOn && (
                        <button onClick={() => setViewing(p.id)} style={{ padding: "5px 12px", borderRadius: 6, background: p.color, color: "#fff", border: "none", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                          Open →
                        </button>
                      )}
                      <button onClick={() => canActivate && toggle(p.id)}
                        style={{ padding: "5px 12px", borderRadius: 6, background: !canActivate ? "#e5e7eb" : isOn ? `${p.color}15` : p.color, color: !canActivate ? "#9ca3af" : isOn ? p.color : "#fff", border: "none", fontSize: 10, fontWeight: 700, cursor: canActivate ? "pointer" : "not-allowed" }}>
                        {!canActivate ? `Needs ${p.minPlan}` : isOn ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
