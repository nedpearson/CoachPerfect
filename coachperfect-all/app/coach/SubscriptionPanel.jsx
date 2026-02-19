import { useState } from "react";
import { C, CLIENTS, SUBSCRIPTION_ADDONS } from "./styles.js";
import { Card, CardTitle, ProgressBar } from "./components.jsx";

export function SubscriptionPanel({ onOpenAddon }) {
  const [selectedAddon, setSelectedAddon] = useState(null);

  const totalMRR = CLIENTS.reduce((s, c) => s + c.mrr, 0);
  const addonRevenue = 189; // mock add-on monthly revenue

  const planColors = { Starter: C.info, Professional: C.gold, Business: C.success, Enterprise: C.purple };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Revenue stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { icon: "💰", label: "Base MRR", value: `$${totalMRR.toLocaleString()}`, sub: "coaching subscriptions" },
          { icon: "➕", label: "Add-On MRR", value: `$${addonRevenue}`, sub: "2 active add-ons" },
          { icon: "📈", label: "Total MRR", value: `$${(totalMRR + addonRevenue).toLocaleString()}`, sub: "+18% vs last month" },
          { icon: "🎯", label: "ARR Projection", value: `$${((totalMRR + addonRevenue) * 12).toLocaleString()}`, sub: "annualized" },
        ].map((s, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: "16px 18px" }}>
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: "6px 0 2px" }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{s.label}</div>
            <div style={{ fontSize: 10, color: `${C.text}88` }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Client subscriptions */}
      <Card>
        <CardTitle action={
          <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: `${C.success}15`, color: C.success, fontWeight: 700 }}>
            {CLIENTS.length} active clients
          </span>
        }>
          Client Subscriptions
        </CardTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                {["Client", "Plan", "MRR", "Status", "Upgrade Opportunity"].map(h => (
                  <th key={h} style={{ textAlign: h === "Client" ? "left" : "center", fontSize: 10, fontWeight: 700, color: C.text, textTransform: "uppercase", padding: "8px 10px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CLIENTS.map(c => {
                const upgrade = c.subscription === "Starter" ? "Professional ($149/mo)" : c.subscription === "Professional" ? "Business ($349/mo)" : null;
                return (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${C.cream}` }}>
                    <td style={{ padding: "10px 10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.navy, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{c.avatar}</div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{c.name}</div>
                          <div style={{ fontSize: 10, color: C.text }}>{c.company}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "center", padding: "10px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12, background: `${planColors[c.subscription]}18`, color: planColors[c.subscription] }}>
                        {c.subscription}
                      </span>
                    </td>
                    <td style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: C.success, padding: "10px" }}>
                      ${c.mrr}/mo
                    </td>
                    <td style={{ textAlign: "center", padding: "10px" }}>
                      <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 6, background: `${C.success}15`, color: C.success, fontWeight: 700 }}>Active</span>
                    </td>
                    <td style={{ textAlign: "center", padding: "10px" }}>
                      {upgrade ? (
                        <button style={{ fontSize: 10, padding: "4px 10px", borderRadius: 6, background: `${C.gold}20`, color: C.gold, border: "none", fontWeight: 700, cursor: "pointer" }}>
                          ↑ {upgrade}
                        </button>
                      ) : (
                        <span style={{ fontSize: 10, color: `${C.text}66` }}>Top tier ✓</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add-On Marketplace */}
      <Card>
        <CardTitle>
          <span>🛒 Add-On Marketplace</span>
        </CardTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {SUBSCRIPTION_ADDONS.map(addon => (
            <div key={addon.id}
              style={{ padding: 16, borderRadius: 12, border: `2px solid ${addon.purchased > 0 ? `${C.success}40` : C.border}`, background: addon.purchased > 0 ? `${C.success}04` : C.white, transition: "border-color 0.15s, box-shadow 0.15s", cursor: "pointer" }}
              onClick={() => onOpenAddon(addon)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 22 }}>{addon.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, lineHeight: 1.2 }}>{addon.name}</div>
                    <div style={{ fontSize: 10, color: C.text }}>{addon.available}</div>
                  </div>
                </div>
                {addon.purchased > 0 && (
                  <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 8, background: `${C.success}15`, color: C.success, fontWeight: 700, flexShrink: 0 }}>
                    ✓ {addon.purchased} active
                  </span>
                )}
              </div>
              <p style={{ margin: "0 0 10px", fontSize: 11, color: C.text, lineHeight: 1.4 }}>{addon.description}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.gold }}>{addon.price}</span>
                <button onClick={e => { e.stopPropagation(); onOpenAddon(addon); }}
                  style={{ padding: "5px 12px", borderRadius: 6, background: addon.purchased > 0 ? `${C.success}15` : C.navy, color: addon.purchased > 0 ? C.success : C.white, border: "none", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                  {addon.purchased > 0 ? "Manage" : "Add →"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Upgrade prompt */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, borderRadius: 14, padding: 22, color: C.white }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'DM Serif Display', Georgia, serif", marginBottom: 4 }}>
              🚀 2 clients are ready for upgrades
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
              Manville Borne and Sarah Rainwater are on Starter — upgrading could unlock AI prep, habit tracking, and deeper diagnostics to accelerate their results.
            </div>
          </div>
          <button style={{ marginLeft: 20, padding: "10px 20px", borderRadius: 10, background: C.gold, color: C.navy, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
            Review Upgrades
          </button>
        </div>
      </div>
    </div>
  );
}
