import { useState } from "react";

// ─── MOCK DATA FLAG ───────────────────────────────────────────────────────────
// Set USE_MOCK_DATA = false and replace MOCK_DATA with real API calls before
// deploying to production.
const USE_MOCK_DATA = true;
if (USE_MOCK_DATA) {
  console.warn('[CoachPerfect] Dashboard is displaying MOCK data. Set USE_MOCK_DATA = false to connect a real API.');
}

const MOCK_DATA = {
  coach: { name: "Meredith Eicher", role: "Executive Coach" },
  summary: {
    totalClients: 18,
    activeClients: 15,
    sessionsThisWeek: 7,
    overdueTasks: 3,
    retentionRate: 85,
    mrr: 4250,
    nps: 72,
    diagnosticsCompleted: 12,
  },
  clients: [
    { id: 1, name: "Chris Ciesielski", company: "NFP", status: "active", health: "green", lastSession: "Feb 12", nextSession: "Feb 19", diagnosticScore: 74, overdueTasks: 0, engagement: "1:1 Coaching" },
    { id: 2, name: "Delaine Henry", company: "Advanced Hospice Mgmt", status: "active", health: "green", lastSession: "Feb 10", nextSession: "Feb 24", diagnosticScore: 68, overdueTasks: 1, engagement: "CEO Roundtable" },
    { id: 3, name: "Manville Borne", company: "Borne Industries", status: "active", health: "yellow", lastSession: "Jan 28", nextSession: "Feb 20", diagnosticScore: 55, overdueTasks: 2, engagement: "1:1 Coaching" },
    { id: 4, name: "Chad Heiser", company: "Heiser Group", status: "active", health: "green", lastSession: "Feb 14", nextSession: "Feb 28", diagnosticScore: 81, overdueTasks: 0, engagement: "Peer Group" },
    { id: 5, name: "Sarah Rainwater", company: "SR Consulting", status: "active", health: "red", lastSession: "Jan 15", nextSession: "—", diagnosticScore: 42, overdueTasks: 4, engagement: "RISE Program" },
  ],
  upcomingSessions: [
    { time: "9:00 AM", client: "Chris Ciesielski", type: "1:1 Coaching", duration: 60 },
    { time: "11:00 AM", client: "Team — NFP Leadership", type: "Team Coaching", duration: 90 },
    { time: "2:00 PM", client: "Manville Borne", type: "1:1 Coaching", duration: 60 },
  ],
  diagnosticCategories: [
    { name: "Financial", avg: 68, color: "#c9a84c" },
    { name: "Operations", avg: 55, color: "#2d5a8e" },
    { name: "People", avg: 72, color: "#10b981" },
    { name: "Strategy", avg: 48, color: "#f59e0b" },
    { name: "Leadership", avg: 76, color: "#8b5cf6" },
    { name: "Marketing", avg: 41, color: "#ef4444" },
  ],
  recentActivity: [
    { icon: "📋", text: "Diagnostic completed by Chad Heiser", time: "2 hours ago" },
    { icon: "✅", text: "Chris Ciesielski completed 3 action items", time: "4 hours ago" },
    { icon: "📅", text: "New session scheduled with Delaine Henry", time: "Yesterday" },
    { icon: "⚠️", text: "Sarah Rainwater — no session in 34 days", time: "Yesterday" },
    { icon: "📄", text: "Q4 Review uploaded for Manville Borne", time: "2 days ago" },
  ],
  recommendations: [
    { client: "Sarah Rainwater", rec: "Schedule re-engagement session immediately", priority: "urgent", category: "Retention" },
    { client: "Manville Borne", rec: "Review overdue financial action items", priority: "high", category: "Financial" },
    { client: "Team NFP", rec: "Schedule quarterly team health assessment", priority: "medium", category: "People" },
  ],
};

function KPICard({ label, value, subtext, trend, icon }) {
  const trendColor = trend > 0 ? "text-emerald-600" : trend < 0 ? "text-red-500" : "text-gray-400";
  return (
    <div className="bg-white rounded-2xl border border-[#e0dcd4] p-5 hover:shadow-lg hover:border-[#c9a84c]/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {trend !== undefined && (
          <span className={`text-xs font-semibold ${trendColor}`}>
            {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-[#1e3a5f] font-serif">{value}</div>
      <div className="text-sm font-medium text-[#4a5568] mt-1">{label}</div>
      {subtext && <div className="text-xs text-[#4a5568]/60 mt-0.5">{subtext}</div>}
    </div>
  );
}

function HealthDot({ health }) {
  const colors = { green: "bg-emerald-400", yellow: "bg-amber-400", red: "bg-red-400" };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[health]}`} />;
}

function DiagnosticBar({ name, avg, color }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-24 text-xs font-medium text-[#4a5568] text-right">{name}</div>
      <div className="flex-1 bg-[#f4f1ea] rounded-full h-5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
          style={{ width: `${avg}%`, backgroundColor: color }}
        >
          <span className="text-[10px] font-bold text-white">{avg}%</span>
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    urgent: "bg-red-100 text-red-700 border-red-200",
    high: "bg-amber-100 text-amber-700 border-amber-200",
    medium: "bg-blue-100 text-blue-700 border-blue-200",
    low: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border ${styles[priority]}`}>
      {priority}
    </span>
  );
}

export default function CoachDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedClient, setSelectedClient] = useState(null);
  const d = MOCK_DATA;

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "clients", label: "Clients", icon: "👥" },
    { id: "sessions", label: "Sessions", icon: "📅" },
    { id: "diagnostics", label: "Diagnostics", icon: "🔍" },
    { id: "documents", label: "Documents", icon: "📁" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f1ea]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] text-white">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              <span className="text-[#c9a84c]">Bold</span>Edge
            </h1>
            <span className="text-white/40">|</span>
            <span className="text-sm text-white/70">Coach Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
              <span className="text-lg">🔔</span>
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#c9a84c] flex items-center justify-center text-[#1e3a5f] font-bold text-sm">ME</div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold">{d.coach.name}</div>
                <div className="text-xs text-white/60">{d.coach.role}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex gap-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-[#f4f1ea] text-[#1e3a5f]"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KPICard icon="👥" label="Active Clients" value={d.summary.activeClients} subtext={`${d.summary.totalClients} total`} trend={12} />
          <KPICard icon="📅" label="Sessions This Week" value={d.summary.sessionsThisWeek} subtext="3 today" trend={8} />
          <KPICard icon="⚡" label="Task Completion" value={`${d.summary.retentionRate}%`} subtext={`${d.summary.overdueTasks} overdue`} trend={-2} />
          <KPICard icon="💰" label="Monthly Revenue" value={`$${d.summary.mrr.toLocaleString()}`} subtext="MRR" trend={15} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column — Client List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Health Overview */}
            <div className="bg-white rounded-2xl border border-[#e0dcd4] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#1e3a5f]" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>Client Portfolio</h2>
                <button className="text-sm font-semibold text-[#c9a84c] hover:text-[#1e3a5f] transition-colors">+ Add Client</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e0dcd4]">
                      <th className="text-left text-xs font-semibold text-[#4a5568] uppercase tracking-wider pb-3">Client</th>
                      <th className="text-left text-xs font-semibold text-[#4a5568] uppercase tracking-wider pb-3 hidden md:table-cell">Engagement</th>
                      <th className="text-center text-xs font-semibold text-[#4a5568] uppercase tracking-wider pb-3">Health</th>
                      <th className="text-center text-xs font-semibold text-[#4a5568] uppercase tracking-wider pb-3 hidden sm:table-cell">Score</th>
                      <th className="text-center text-xs font-semibold text-[#4a5568] uppercase tracking-wider pb-3">Tasks</th>
                      <th className="text-right text-xs font-semibold text-[#4a5568] uppercase tracking-wider pb-3 hidden md:table-cell">Next Session</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.clients.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedClient(selectedClient === c.id ? null : c.id)}
                        className={`border-b border-[#f4f1ea] cursor-pointer transition-colors ${selectedClient === c.id ? "bg-[#f4f1ea]" : "hover:bg-[#f4f1ea]/50"}`}
                      >
                        <td className="py-3">
                          <div className="font-semibold text-sm text-[#1e3a5f]">{c.name}</div>
                          <div className="text-xs text-[#4a5568]">{c.company}</div>
                        </td>
                        <td className="py-3 hidden md:table-cell">
                          <span className="text-xs bg-[#f4f1ea] text-[#4a5568] px-2 py-1 rounded-md">{c.engagement}</span>
                        </td>
                        <td className="py-3 text-center"><HealthDot health={c.health} /></td>
                        <td className="py-3 text-center hidden sm:table-cell">
                          <span className={`text-sm font-bold ${c.diagnosticScore >= 70 ? "text-emerald-600" : c.diagnosticScore >= 50 ? "text-amber-600" : "text-red-500"}`}>
                            {c.diagnosticScore}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          {c.overdueTasks > 0 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold">{c.overdueTasks}</span>
                          ) : (
                            <span className="text-emerald-500">✓</span>
                          )}
                        </td>
                        <td className="py-3 text-right text-sm text-[#4a5568] hidden md:table-cell">{c.nextSession}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Diagnostic Overview */}
            <div className="bg-white rounded-2xl border border-[#e0dcd4] p-6">
              <h2 className="text-lg font-bold text-[#1e3a5f] mb-4" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                Average Diagnostic Scores (All Clients)
              </h2>
              <div className="space-y-1">
                {d.diagnosticCategories.map((cat) => (
                  <DiagnosticBar key={cat.name} {...cat} />
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[#e0dcd4] flex items-center justify-between">
                <span className="text-xs text-[#4a5568]">Based on {d.summary.diagnosticsCompleted} completed diagnostics</span>
                <button className="text-xs font-semibold text-[#c9a84c] hover:text-[#1e3a5f]">View Details →</button>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl border border-[#e0dcd4] p-6">
              <h2 className="text-lg font-bold text-[#1e3a5f] mb-4" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                AI Recommendations
              </h2>
              <div className="space-y-3">
                {d.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#f4f1ea]/60 hover:bg-[#f4f1ea] transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-[#1e3a5f]">{rec.client}</span>
                        <PriorityBadge priority={rec.priority} />
                        <span className="text-[10px] text-[#4a5568] bg-white px-1.5 py-0.5 rounded">{rec.category}</span>
                      </div>
                      <p className="text-sm text-[#4a5568]">{rec.rec}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button className="px-3 py-1.5 text-xs font-semibold bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d5a8e] transition-colors">Act</button>
                      <button className="px-3 py-1.5 text-xs font-semibold text-[#4a5568] rounded-lg hover:bg-[#e0dcd4] transition-colors">Dismiss</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column — Sidebar */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <div className="bg-white rounded-2xl border border-[#e0dcd4] p-6">
              <h2 className="text-lg font-bold text-[#1e3a5f] mb-4" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                Today's Sessions
              </h2>
              <div className="space-y-3">
                {d.upcomingSessions.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[#e0dcd4] hover:border-[#c9a84c]/40 transition-colors">
                    <div className="text-center shrink-0 w-14">
                      <div className="text-sm font-bold text-[#1e3a5f]">{s.time.split(" ")[0]}</div>
                      <div className="text-[10px] text-[#4a5568]">{s.time.split(" ")[1]}</div>
                    </div>
                    <div className="w-px h-10 bg-[#c9a84c]" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#1e3a5f] truncate">{s.client}</div>
                      <div className="text-xs text-[#4a5568]">{s.type} · {s.duration}min</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 py-2.5 text-sm font-semibold text-[#c9a84c] border border-[#c9a84c] rounded-xl hover:bg-[#c9a84c] hover:text-[#1e3a5f] transition-all">
                + Schedule Session
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-[#e0dcd4] p-6">
              <h2 className="text-lg font-bold text-[#1e3a5f] mb-4" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                Activity Feed
              </h2>
              <div className="space-y-3">
                {d.recentActivity.map((a, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-base shrink-0 mt-0.5">{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#4a5568] leading-snug">{a.text}</p>
                      <p className="text-[11px] text-[#4a5568]/50 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] rounded-2xl p-6 text-white">
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                Quick Actions
              </h2>
              <div className="space-y-2">
                {[
                  { icon: "👤", label: "Add New Client" },
                  { icon: "🔍", label: "Run Diagnostic" },
                  { icon: "📊", label: "Generate Report" },
                  { icon: "📄", label: "Create from Template" },
                  { icon: "⚡", label: "Trigger Workflow" },
                ].map((action, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/90 hover:bg-white/10 transition-colors text-left"
                  >
                    <span>{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 py-4 border-t border-[#e0dcd4]">
        <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between text-xs text-[#4a5568]/60">
          <span>© 2026 Coach Perfect. Bold Conversations. Bolder Data.</span>
          <span>v1.0.0</span>
        </div>
      </footer>
    </div>
  );
}
