import { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { TrendingUp, TrendingDown, CheckCircle, AlertTriangle, FileText, Zap, Users, DollarSign, Target, Activity, Plus, BarChart3, Bell, ChevronRight } from "lucide-react";

const C = { primary: "#1B2A4A", accent: "#D4A853", success: "#2D8659", warning: "#C17A28", danger: "#B04040", surface: "#F7F5F0", muted: "#6B7280", border: "#E5E2DB" };

const kpis = [
  { name: "Revenue", value: "$847K", change: "+12.3%", up: true, icon: DollarSign, target: "$900K" },
  { name: "Active Clients", value: "34", change: "+3", up: true, icon: Users, target: "40" },
  { name: "Tasks Done", value: "127", change: "+18%", up: true, icon: CheckCircle, target: "150" },
  { name: "Health Score", value: "7.4", change: "+0.6", up: true, icon: Activity, target: "8.0" },
  { name: "Open Items", value: "23", change: "-5", up: false, icon: AlertTriangle, target: "<15" },
  { name: "Engagement", value: "89%", change: "+4%", up: true, icon: Target, target: "95%" },
];

const revenue = [
  { m: "Sep", rev: 62, tgt: 65 }, { m: "Oct", rev: 68, tgt: 70 }, { m: "Nov", rev: 71, tgt: 72 },
  { m: "Dec", rev: 74, tgt: 75 }, { m: "Jan", rev: 79, tgt: 78 }, { m: "Feb", rev: 85, tgt: 82 },
];

const diag = [
  { cat: "Leadership", s: 8.2 }, { cat: "Operations", s: 6.1 }, { cat: "Finance", s: 7.5 }, { cat: "People", s: 5.8 },
  { cat: "Sales", s: 7.0 }, { cat: "Strategy", s: 6.8 }, { cat: "Customer", s: 7.3 }, { cat: "Technology", s: 5.2 },
];

const tasks = [
  { t: "Complete Q1 financial review", p: "high", d: "Feb 20", s: "active", a: "ME" },
  { t: "Update employee onboarding SOP", p: "medium", d: "Feb 22", s: "pending", a: "Team" },
  { t: "Schedule CEO roundtable prep", p: "high", d: "Feb 18", s: "active", a: "ME" },
  { t: "Review client diagnostic results", p: "critical", d: "Feb 17", s: "pending", a: "ME" },
  { t: "Deploy marketing automation", p: "medium", d: "Feb 25", s: "pending", a: "Ned" },
];

const recs = [
  { t: "Implement Real-Time Financial Dashboard", type: "quick win", imp: 85, eff: 40, cat: "finance" },
  { t: "Document Top 20 Core Processes", type: "operational", imp: 70, eff: 50, cat: "operations" },
  { t: "Launch Employee Engagement Survey", type: "quick win", imp: 70, eff: 20, cat: "people" },
  { t: "Conduct Technology Stack Audit", type: "quick win", imp: 60, eff: 30, cat: "technology" },
];

const pipe = [
  { stage: "Leads", v: 48 }, { stage: "Qualified", v: 32 }, { stage: "Proposal", v: 18 }, { stage: "Closed", v: 8 },
];

const pColors = { critical: C.danger, high: C.warning, medium: C.primary, low: C.muted };
const pipeColors = ["#5B7BA5", "#1B2A4A", "#D4A853", "#2D8659"];

export default function BoldDash() {
  const [tab, setTab] = useState("overview");
  const tabs = ["overview", "diagnostics", "tasks", "documents", "workflows", "analytics", "coaching"];

  return (
    <div style={{ minHeight: "100vh", background: C.surface, fontFamily: "'Inter',-apple-system,system-ui,sans-serif" }}>
      <header style={{ background: C.primary, color: "#fff", padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: -0.5 }}><span style={{ color: C.accent }}>Bold</span>Dash</span>
          <nav style={{ display: "flex", gap: 1, marginLeft: 16 }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 14px", background: tab === t ? "rgba(255,255,255,0.12)" : "transparent", border: "none", color: tab === t ? "#fff" : "rgba(255,255,255,0.55)", borderRadius: 7, fontSize: 12.5, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>{t}</button>
            ))}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative" }}><Bell size={17} style={{ opacity: 0.65, cursor: "pointer" }} /><div style={{ position: "absolute", top: -2, right: -3, width: 7, height: 7, background: C.danger, borderRadius: "50%", border: `2px solid ${C.primary}` }} /></div>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>ME</div>
        </div>
      </header>

      <main style={{ maxWidth: 1360, margin: "0 auto", padding: "20px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.primary }}>Business Overview</h1>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: C.muted }}>Welcome back, Meredith. Here's your business at a glance.</p>
          </div>
          <select style={{ padding: "7px 12px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 12, color: C.muted, background: "#fff" }}>
            <option>This Month</option><option>This Quarter</option><option>YTD</option>
          </select>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", gap: 9, marginBottom: 18 }}>
          {[{ l: "Run Diagnostic", i: Activity, c: C.primary }, { l: "Create Workflow", i: Zap, c: C.accent }, { l: "Upload Document", i: FileText, c: C.success }, { l: "Add KPI", i: BarChart3, c: C.warning }].map(a => (
            <button key={a.l} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "14px 10px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = a.c; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; }}>
              <a.i size={18} color={a.c} /><span style={{ fontSize: 11.5, fontWeight: 600, color: C.primary }}>{a.l}</span>
            </button>
          ))}
        </div>

        {/* KPI Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14, marginBottom: 18 }}>
          {kpis.map(k => {
            const Icon = k.icon;
            return (
              <div key={k.name} style={{ background: "#fff", borderRadius: 11, padding: "17px 18px", border: `1px solid ${C.border}`, cursor: "pointer", transition: "box-shadow 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 3px 16px rgba(27,42,74,0.07)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 7, background: `${C.primary}10`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={16} color={C.primary} /></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 600, color: k.up && k.name !== "Open Items" ? C.success : !k.up && k.name === "Open Items" ? C.success : C.danger }}>
                    {k.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{k.change}
                  </div>
                </div>
                <div style={{ fontSize: 25, fontWeight: 700, color: C.primary, letterSpacing: -0.5 }}>{k.value}</div>
                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{k.name} · Target: {k.target}</div>
              </div>
            );
          })}
        </div>

        {/* Row 1: Diagnostic + Revenue */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={{ background: "#fff", borderRadius: 11, padding: 22, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div><h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.primary }}>Business Health Score</h3><p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted }}>8-category diagnostic</p></div>
              <div style={{ background: `${C.accent}20`, color: C.accent, padding: "3px 11px", borderRadius: 16, fontSize: 13, fontWeight: 700 }}>7.4 / 10</div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={diag}><PolarGrid stroke={C.border} /><PolarAngleAxis dataKey="cat" tick={{ fontSize: 10, fill: C.muted }} /><PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 9 }} /><Radar dataKey="s" stroke={C.primary} fill={C.primary} fillOpacity={0.12} strokeWidth={2} /></RadarChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
              {diag.filter(d => d.s < 6).map(d => (
                <span key={d.cat} style={{ background: `${C.danger}12`, color: C.danger, padding: "2px 9px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>⚠ {d.cat}: {d.s}</span>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 11, padding: 22, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div><h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.primary }}>Revenue vs Target</h3><p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted }}>6-month rolling ($K)</p></div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenue} barGap={3}><CartesianGrid strokeDasharray="3 3" stroke={C.border} /><XAxis dataKey="m" tick={{ fontSize: 11, fill: C.muted }} /><YAxis tick={{ fontSize: 10, fill: C.muted }} /><Tooltip formatter={v => `$${v}K`} /><Bar dataKey="rev" fill={C.primary} radius={[3, 3, 0, 0]} name="Revenue" /><Bar dataKey="tgt" fill={C.accent} radius={[3, 3, 0, 0]} name="Target" opacity={0.45} /></BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: Tasks + Recommendations + Pipeline */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {/* Tasks */}
          <div style={{ background: "#fff", borderRadius: 11, padding: 22, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.primary }}>Priority Tasks</h3>
              <button style={{ background: C.primary, color: "#fff", border: "none", padding: "5px 12px", borderRadius: 7, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}><Plus size={13} /> Add</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {tasks.map((tk, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 7, border: `1px solid ${C.border}`, cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.surface}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: pColors[tk.p], flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tk.t}</div>
                    <div style={{ fontSize: 10.5, color: C.muted, marginTop: 1 }}>{tk.a} · {tk.d}</div>
                  </div>
                  <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 8, background: tk.s === "active" ? `${C.accent}20` : `${C.muted}12`, color: tk.s === "active" ? C.accent : C.muted, fontWeight: 600, flexShrink: 0 }}>{tk.s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div style={{ background: "#fff", borderRadius: 11, padding: 22, border: `1px solid ${C.border}` }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: C.primary }}>Recommendations</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {recs.map((r, i) => (
                <div key={i} style={{ padding: "10px 12px", borderRadius: 7, background: C.surface, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, lineHeight: 1.3 }}>{r.t}</div>
                    <span style={{ fontSize: 9.5, padding: "1px 7px", borderRadius: 8, background: r.type === "quick win" ? `${C.success}12` : `${C.primary}10`, color: r.type === "quick win" ? C.success : C.primary, fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap" }}>{r.type}</span>
                  </div>
                  <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
                    <span style={{ fontSize: 10.5, color: C.muted }}>Impact: <b style={{ color: C.success }}>{r.imp}%</b></span>
                    <span style={{ fontSize: 10.5, color: C.muted }}>Effort: <b style={{ color: C.warning }}>{r.eff}%</b></span>
                    <span style={{ fontSize: 10.5, color: C.muted }}>{r.cat}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline */}
          <div style={{ background: "#fff", borderRadius: 11, padding: 22, border: `1px solid ${C.border}` }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: C.primary }}>Sales Pipeline</h3>
            <div style={{ display: "flex", gap: 7, alignItems: "flex-end", height: 200, paddingTop: 20 }}>
              {pipe.map((p, i) => {
                const h = (p.v / 48) * 150;
                return (
                  <div key={p.stage} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.primary }}>{p.v}</span>
                    <div style={{ width: "100%", height: h, background: pipeColors[i], borderRadius: "5px 5px 0 0", transition: "height 0.4s" }} />
                    <span style={{ fontSize: 10.5, color: C.muted, fontWeight: 600 }}>{p.stage}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 16, padding: "10px 12px", background: C.surface, borderRadius: 7, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: C.muted }}>Conversion Rate</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.success }}>16.7%</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
