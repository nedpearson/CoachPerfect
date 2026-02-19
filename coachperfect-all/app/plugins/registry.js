// ─── PLUGIN REGISTRY ──────────────────────────────────────────────────────────
// This is the ONLY file that changes when adding a new plugin.
// Each plugin entry is self-contained — ID, metadata, pricing, plan gate.
// The PluginMarketplace + PluginLoader read this array automatically.
// ─────────────────────────────────────────────────────────────────────────────

export const PLUGINS = [
  {
    id:           "forensic-cpa-ai",
    name:         "Forensic CPA AI",
    icon:         "🔍",
    tagline:      "AI-powered forensic accounting analysis",
    description:  "Automatically flags financial anomalies, irregular transactions, and cash-flow inconsistencies in client documents. Generates a forensic summary the coach can discuss in session.",
    category:     "Financial",
    price:        "$49/mo",
    priceCents:   4900,
    minPlan:      "professional",
    coachBenefit: "Activate per client — adds $49/mo to your practice MRR",
    badge:        "NEW",
    color:        "#0f766e",        // teal
    component:    "ForensicCPA",
  },
  {
    id:           "ai-financial-advisor",
    name:         "AI Financial Advisor",
    icon:         "📊",
    tagline:      "Personalized financial roadmaps for business clients",
    description:  "Generates cash-flow forecasts, P&L analysis, runway calculations, and scenario modelling from client-uploaded financials. Delivers a branded advisor report to the client.",
    category:     "Financial",
    price:        "$39/mo",
    priceCents:   3900,
    minPlan:      "professional",
    coachBenefit: "Activate per client — adds $39/mo. Bundle with Forensic CPA for $79/mo",
    badge:        "NEW",
    color:        "#1d4ed8",        // blue
    component:    "AIFinancialAdvisor",
  },
  // ── Future plugins: add entries here, nothing else changes ──────────────────
  // { id: "exit-readiness-ai", name: "Exit Readiness AI", ... }
  // { id: "leadership-360-ai", name: "Leadership 360 AI", ... }
];

// Lookup helpers
export const pluginById  = (id)  => PLUGINS.find(p => p.id === id) || null;
export const pluginsByCategory = () =>
  PLUGINS.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});
