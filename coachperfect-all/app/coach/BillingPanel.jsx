// ─── CoachPerfect — Billing & Plan Management ─────────────────────────────────
import { useState } from "react";
import { C } from "./styles.js";
import { api } from "../hooks/useAPI.js";

const PLANS = [
  {
    id: "free", label: "Free", monthlyPrice: 0, annualPrice: 0,
    features: ["1 active client", "Basic diagnostics", "Task management", "Client portal"],
    color: C.text,
  },
  {
    id: "starter", label: "Starter", monthlyPrice: 49, annualPrice: 39,
    features: ["Up to 10 clients", "At-Risk detection agent", "Weekly Pulse agent", "File sharing", "QR onboarding"],
    color: C.info,
  },
  {
    id: "professional", label: "Professional", monthlyPrice: 99, annualPrice: 79,
    features: ["Up to 30 clients", "All Starter features", "Session Prep agent", "Progress Report agent", "Smart Follow-Up agent", "Plugin marketplace"],
    color: C.gold,
    popular: true,
  },
  {
    id: "business", label: "Business", monthlyPrice: 199, annualPrice: 159,
    features: ["Up to 100 clients", "All Professional features", "Onboarding agent", "API access", "White-label portal", "Priority support"],
    color: C.success,
  },
  {
    id: "enterprise", label: "Enterprise", monthlyPrice: null, annualPrice: null,
    features: ["Unlimited clients", "All Business features", "Custom integrations", "Dedicated CSM", "SLA guarantee", "SSO / SAML"],
    color: "#7c3aed",
  },
];

const ADDONS = [
  { label: "Forensic CPA AI",       price: 79,  active: true },
  { label: "AI Financial Advisor",  price: 49,  active: true },
  { label: "White-Label Portal",    price: 99,  active: false },
  { label: "API Access Pack",       price: 149, active: false },
];

export function BillingPanel({ currentPlan = "starter" }) {
  const [billing, setBilling] = useState("monthly");
  const [loading, setLoading] = useState(null);

  const checkout = async (planId) => {
    setLoading(planId);
    try {
      const data = await api.post("/billing/checkout", { plan: planId, billing });
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      alert("Checkout unavailable: " + (err?.message || "Please try again."));
    } finally { setLoading(null); }
  };

  const portal = async () => {
    setLoading("portal");
    try {
      const data = await api.post("/billing/portal", {});
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      alert("Billing portal unavailable: " + (err?.message || "Please try again."));
    } finally { setLoading(null); }
  };

  const isCurrent = (id) => id === currentPlan;
  const addonMRR = ADDONS.filter(a => a.active).reduce((s, a) => s + a.price, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Billing toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Billing cycle:</span>
        {["monthly", "annual"].map(b => (
          <button key={b} onClick={() => setBilling(b)}
            style={{ padding: "5px 16px", borderRadius: 20, border: `1.5px solid ${billing === b ? C.gold : C.border}`, background: billing === b ? C.gold : C.white, color: billing === b ? C.navy : C.text, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {b === "annual" ? "Annual (save ~20%)" : "Monthly"}
          </button>
        ))}
        <button onClick={portal} disabled={loading === "portal"}
          style={{ marginLeft: "auto", padding: "6px 16px", borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.white, color: C.navy, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          {loading === "portal" ? "Opening…" : "⚙️ Manage Billing"}
        </button>
      </div>

      {/* Plan cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {PLANS.map(plan => {
          const price = billing === "annual" ? plan.annualPrice : plan.monthlyPrice;
          const current = isCurrent(plan.id);
          return (
            <div key={plan.id} style={{ background: C.white, borderRadius: 14, border: `2px solid ${current ? plan.color : C.border}`, padding: "18px 14px", display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
              {plan.popular && <span style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: C.gold, color: C.navy, fontSize: 9, fontWeight: 800, padding: "2px 10px", borderRadius: 20 }}>MOST POPULAR</span>}
              {current && <span style={{ position: "absolute", top: 10, right: 10, background: plan.color, color: C.white, fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20 }}>CURRENT</span>}
              <div style={{ fontSize: 15, fontWeight: 800, color: plan.color }}>{plan.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>
                {price === null ? "Custom" : price === 0 ? "Free" : `$${price}/mo`}
              </div>
              <ul style={{ margin: 0, padding: "0 0 0 14px", fontSize: 11, color: C.text, lineHeight: 1.7 }}>
                {plan.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
              <button onClick={() => checkout(plan.id)} disabled={current || loading === plan.id}
                style={{ marginTop: "auto", padding: "8px 0", borderRadius: 8, border: "none", background: current ? C.cream : plan.color, color: current ? C.text : plan.id === "free" ? C.text : "#fff", fontSize: 12, fontWeight: 700, cursor: current ? "default" : "pointer", opacity: loading === plan.id ? 0.6 : 1 }}>
                {loading === plan.id ? "Loading…" : current ? "Current Plan" : plan.monthlyPrice === null ? "Contact Sales" : "Upgrade"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Add-on strip */}
      <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: "14px 18px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 10 }}>Add-Ons · ${addonMRR}/mo active</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {ADDONS.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: a.active ? `${C.gold}22` : C.cream, border: `1px solid ${a.active ? C.gold : C.border}`, fontSize: 11 }}>
              <span>{a.active ? "✅" : "○"}</span>
              <span style={{ fontWeight: 600, color: C.navy }}>{a.label}</span>
              <span style={{ color: C.text }}>${a.price}/mo</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
