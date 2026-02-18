import { useState } from "react";

// ─── MOCK DATA (Client Perspective) ─────────────────────────────────────────────

const CLIENT = {
  name: "Chris Ciesielski",
  company: "NFP",
  avatar: "CC",
  coachName: "Meredith Eicher",
  coachAvatar: "ME",
  engagement: "1:1 Coaching",
  memberSince: "Sep 2025",
};

const CLIENT_HEALTH = {
  overall: 74,
  categories: [
    { name: "Leadership", score: 82, prev: 76, icon: "👑" },
    { name: "Financial", score: 71, prev: 65, icon: "💰" },
    { name: "Operations", score: 68, prev: 70, icon: "⚙️" },
    { name: "People", score: 79, prev: 72, icon: "👥" },
    { name: "Strategy", score: 65, prev: 58, icon: "🎯" },
    { name: "Marketing", score: 72, prev: 68, icon: "📢" },
    { name: "Technology", score: 60, prev: 55, icon: "💻" },
    { name: "Customer", score: 78, prev: 74, icon: "🤝" },
  ],
};

const CLIENT_GOALS = [
  { id: 1, name: "Increase Revenue 20% by Q3", progress: 45, milestones: ["Q1 Review", "Hire 2 reps", "Launch campaign"], completed: 1, icon: "📈", dueDate: "Sep 30" },
  { id: 2, name: "Build Leadership Team", progress: 65, milestones: ["Define roles", "Interview candidates", "Onboard VP Ops", "Onboard VP Sales"], completed: 2, icon: "👥", dueDate: "Jun 30" },
  { id: 3, name: "Systematize Core Processes", progress: 30, milestones: ["Document top 10 SOPs", "Train team", "Implement QA"], completed: 0, icon: "📋", dueDate: "Aug 31" },
  { id: 4, name: "Improve NPS to 70+", progress: 80, milestones: ["Survey customers", "Identify gaps", "Action plan", "Re-survey"], completed: 3, icon: "⭐", dueDate: "Apr 30" },
];

const CLIENT_TASKS = [
  { id: 1, text: "Complete leadership self-assessment", priority: "high", due: "Feb 20", status: "active", fromCoach: true, category: "Leadership" },
  { id: 2, text: "Review Q4 financial statements", priority: "high", due: "Feb 22", status: "active", fromCoach: true, category: "Financial" },
  { id: 3, text: "Schedule 1:1 with VP of Ops candidates", priority: "medium", due: "Feb 25", status: "pending", fromCoach: false, category: "People" },
  { id: 4, text: "Draft SOP for client onboarding process", priority: "medium", due: "Feb 28", status: "pending", fromCoach: true, category: "Operations" },
  { id: 5, text: "Send follow-up thank you to top 5 clients", priority: "low", due: "Feb 19", status: "active", fromCoach: false, category: "Customer" },
  { id: 6, text: "Prepare talking points for board meeting", priority: "critical", due: "Feb 18", status: "overdue", fromCoach: true, category: "Strategy" },
  { id: 7, text: "Complete weekly reflection journal", priority: "medium", due: "Feb 18", status: "active", fromCoach: true, category: "Growth" },
];

const CLIENT_CALENDAR = [
  { date: "Today", events: [
    { time: "9:00 AM", title: "Coaching Session with Meredith", type: "coaching", duration: 60 },
    { time: "11:00 AM", title: "Team Standup", type: "meeting", duration: 30 },
    { time: "2:00 PM", title: "Board Prep Call", type: "meeting", duration: 45 },
  ]},
  { date: "Tomorrow", events: [
    { time: "10:00 AM", title: "VP Ops Interview — Candidate A", type: "interview", duration: 60 },
    { time: "1:00 PM", title: "Client Lunch — Acme Corp", type: "meeting", duration: 90 },
  ]},
  { date: "Feb 21", events: [
    { time: "9:00 AM", title: "Leadership Self-Assessment Due", type: "deadline", duration: 0 },
    { time: "3:00 PM", title: "Peer Group Session", type: "coaching", duration: 90 },
  ]},
];

const CLIENT_ALERTS = [
  { id: 1, type: "coaching", title: "Coaching Session Today", message: "Your 1:1 with Meredith is at 9:00 AM. Session prep materials are ready.", time: "30 min", icon: "📅", actionLabel: "View Prep" },
  { id: 2, type: "task", title: "Overdue Task", message: "Board meeting talking points were due yesterday. Please complete ASAP.", time: "1d overdue", icon: "⚠️", actionLabel: "Complete Now" },
  { id: 3, type: "reminder", title: "Coach Reminder", message: "Meredith says: Don't forget to review the Q4 financials before our session!", time: "Yesterday", icon: "💬", actionLabel: "Got It" },
  { id: 4, type: "milestone", title: "Goal Milestone", message: "You're 80% to your NPS goal! One more milestone to go.", time: "2d ago", icon: "🎉", actionLabel: "View Goal" },
  { id: 5, type: "diagnostic", title: "New Diagnostic Available", message: "Monthly leadership pulse check is ready to complete.", time: "3d ago", icon: "📋", actionLabel: "Start Now" },
];

const CLIENT_WINS = [
  { text: "Closed biggest client deal of the quarter — $120K", date: "Feb 14", icon: "🏆" },
  { text: "Team engagement score improved 15 points", date: "Feb 10", icon: "📈" },
  { text: "Completed all leadership module assignments", date: "Feb 5", icon: "✅" },
  { text: "NPS score hit 68 — approaching 70 target", date: "Jan 28", icon: "⭐" },
];

const SESSION_HISTORY = [
  { date: "Feb 12", focus: "Q1 Revenue Strategy", notes: "Discussed pipeline gaps. Action: hire 2 sales reps by March.", outcome: "positive" },
  { date: "Jan 29", focus: "Leadership Team Build", notes: "Reviewed VP Ops candidates. Shortlisted 3.", outcome: "positive" },
  { date: "Jan 15", focus: "Financial Review", notes: "Cash flow concerns addressed. Created 90-day plan.", outcome: "neutral" },
  { date: "Jan 2", focus: "Goal Setting for Q1", notes: "Set 4 primary goals. Established tracking cadence.", outcome: "positive" },
];

// ─── STYLE CONSTANTS ────────────────────────────────────────────────────────────

const C = {
  navy: "#1e3a5f",
  navyLight: "#2d5a8e",
  gold: "#c9a84c",
  cream: "#f4f1ea",
  border: "#e0dcd4",
  text: "#4a5568",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  white: "#ffffff",
};

const priorityColors = { critical: C.danger, high: C.warning, medium: C.info, low: "#9ca3af" };
const alertIconBg = { coaching: C.info, task: C.danger, reminder: C.gold, milestone: C.success, diagnostic: "#8b5cf6" };

// ─── REUSABLE COMPONENTS ────────────────────────────────────────────────────────

function Card({ children, style }) {
  return (
    <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: 22, ...style }}>
      {children}
    </div>
  );
}

function CardTitle({ children, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display', Georgia, serif" }}>{children}</h3>
      {action}
    </div>
  );
}

function ProgressBar({ percent, color, height = 6 }) {
  return (
    <div style={{ width: "100%", height, background: C.cream, borderRadius: height / 2, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(percent, 100)}%`, height: "100%", background: color || C.gold, borderRadius: height / 2, transition: "width 0.6s ease" }} />
    </div>
  );
}

function PriorityDot({ priority }) {
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: priorityColors[priority], flexShrink: 0 }} />;
}

function AlertBadge({ count }) {
  if (!count) return null;
  return (
    <span style={{
      position: "absolute", top: -4, right: -4, minWidth: 18, height: 18,
      background: C.danger, borderRadius: 9, fontSize: 10, fontWeight: 700,
      color: C.white, display: "flex", alignItems: "center", justifyContent: "center",
      padding: "0 4px", border: `2px solid ${C.navy}`,
    }}>{count}</span>
  );
}

function NotificationDrawer({ alerts, isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
      <div style={{ position: "relative", width: 400, maxWidth: "90vw", background: C.white, height: "100%", boxShadow: "-4px 0 24px rgba(0,0,0,0.1)", overflowY: "auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display', Georgia, serif" }}>Notifications</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.text }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {alerts.map(alert => (
            <div key={alert.id} style={{ padding: 14, borderRadius: 10, border: `1px solid ${C.border}`, borderLeft: `4px solid ${alertIconBg[alert.type]}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 16 }}>{alert.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{alert.title}</span>
                </div>
                <span style={{ fontSize: 10, color: `${C.text}88` }}>{alert.time}</span>
              </div>
              <p style={{ margin: "4px 0 10px", fontSize: 13, color: C.text, lineHeight: 1.4, paddingLeft: 26 }}>{alert.message}</p>
              <div style={{ paddingLeft: 26 }}>
                <button style={{ padding: "5px 14px", fontSize: 11, fontWeight: 700, background: alertIconBg[alert.type], color: C.white, border: "none", borderRadius: 6, cursor: "pointer" }}>{alert.actionLabel}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── HEALTH SCORE GAUGE ─────────────────────────────────────────────────────────

function HealthScoreGauge({ score }) {
  const color = score >= 70 ? C.success : score >= 50 ? C.warning : C.danger;
  const label = score >= 70 ? "Healthy" : score >= 50 ? "Needs Attention" : "At Risk";
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ textAlign: "center" }}>
      <svg width={150} height={150} viewBox="0 0 150 150">
        <circle cx="75" cy="75" r="60" fill="none" stroke={C.cream} strokeWidth="12" />
        <circle
          cx="75" cy="75" r="60" fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 75 75)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text x="75" y="68" textAnchor="middle" style={{ fontSize: 32, fontWeight: 700, fill: C.navy }}>{score}</text>
        <text x="75" y="88" textAnchor="middle" style={{ fontSize: 11, fill: C.text, fontWeight: 600 }}>/100</text>
      </svg>
      <div style={{ marginTop: 4 }}>
        <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 12, fontSize: 11, fontWeight: 700, background: `${color}18`, color }}>{label}</span>
      </div>
    </div>
  );
}

// ─── BIG PICTURE SECTION ────────────────────────────────────────────────────────

function BigPictureSection() {
  return (
    <Card>
      <CardTitle>Big Picture</CardTitle>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "center" }}>
        <HealthScoreGauge score={CLIENT_HEALTH.overall} />
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {CLIENT_HEALTH.categories.map(cat => {
              const diff = cat.score - cat.prev;
              const color = diff > 0 ? C.success : diff < 0 ? C.danger : C.text;
              return (
                <div key={cat.name} style={{ padding: 10, borderRadius: 8, background: C.cream, textAlign: "center" }}>
                  <span style={{ fontSize: 18 }}>{cat.icon}</span>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, margin: "2px 0" }}>{cat.score}</div>
                  <div style={{ fontSize: 10, color: C.text, marginBottom: 2 }}>{cat.name}</div>
                  <span style={{ fontSize: 9, fontWeight: 700, color }}>{diff > 0 ? "↑" : diff < 0 ? "↓" : "→"}{Math.abs(diff)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── GOALS SECTION ──────────────────────────────────────────────────────────────

function GoalsSection() {
  return (
    <Card>
      <CardTitle action={<span style={{ fontSize: 11, color: C.text }}>{CLIENT_GOALS.length} active goals</span>}>
        My Goals
      </CardTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {CLIENT_GOALS.map(goal => (
          <div key={goal.id} style={{ padding: 14, borderRadius: 10, border: `1px solid ${C.border}`, background: C.white }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>{goal.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{goal.name}</div>
                  <div style={{ fontSize: 10, color: C.text }}>Due: {goal.dueDate}</div>
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: goal.progress >= 70 ? C.success : goal.progress >= 40 ? C.gold : C.warning }}>{goal.progress}%</span>
            </div>
            <ProgressBar percent={goal.progress} color={goal.progress >= 70 ? C.success : goal.progress >= 40 ? C.gold : C.warning} height={8} />
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              {goal.milestones.map((m, i) => (
                <span key={i} style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 6, fontWeight: 600,
                  background: i < goal.completed ? `${C.success}15` : C.cream,
                  color: i < goal.completed ? C.success : C.text,
                  textDecoration: i < goal.completed ? "line-through" : "none",
                }}>
                  {i < goal.completed ? "✓ " : ""}{m}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── TASKS SECTION ──────────────────────────────────────────────────────────────

function TasksSection() {
  const [filter, setFilter] = useState("all");
  const filters = ["all", "from coach", "my tasks", "overdue"];
  const filtered = CLIENT_TASKS.filter(t => {
    if (filter === "from coach") return t.fromCoach;
    if (filter === "my tasks") return !t.fromCoach;
    if (filter === "overdue") return t.status === "overdue";
    return true;
  });

  return (
    <Card>
      <CardTitle action={<span style={{ fontSize: 11, color: C.text }}>{CLIENT_TASKS.filter(t => t.status !== "completed").length} active</span>}>
        Tasks & Action Items
      </CardTitle>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer",
              background: filter === f ? C.navy : C.cream, color: filter === f ? C.white : C.text,
              fontSize: 11, fontWeight: 600, textTransform: "capitalize", transition: "all 0.2s",
            }}
          >{f}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.map(task => (
          <div key={task.id} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
            border: `1px solid ${C.border}`, cursor: "pointer", transition: "background 0.1s",
            background: task.status === "overdue" ? `${C.danger}06` : C.white,
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
              border: `2px solid ${task.status === "overdue" ? C.danger : C.border}`,
            }} />
            <PriorityDot priority={task.priority} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.text}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                <span style={{ fontSize: 10, color: C.text }}>Due {task.due}</span>
                <span style={{ fontSize: 10, color: C.text, background: C.cream, padding: "0 5px", borderRadius: 3 }}>{task.category}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
              <span style={{
                fontSize: 9, padding: "2px 7px", borderRadius: 6, fontWeight: 700,
                background: task.status === "overdue" ? `${C.danger}15` : task.status === "active" ? `${C.gold}20` : `${C.text}10`,
                color: task.status === "overdue" ? C.danger : task.status === "active" ? C.gold : C.text,
              }}>{task.status}</span>
              {task.fromCoach && (
                <span style={{ fontSize: 9, color: C.info, fontWeight: 600 }}>From Coach</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── CALENDAR SECTION ───────────────────────────────────────────────────────────

function CalendarSection() {
  const typeColors = { coaching: C.gold, meeting: C.info, interview: "#8b5cf6", deadline: C.danger };
  const typeIcons = { coaching: "🎯", meeting: "💼", interview: "🤝", deadline: "⏰" };

  return (
    <Card>
      <CardTitle>Upcoming Schedule</CardTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {CLIENT_CALENDAR.map((day, di) => (
          <div key={di}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 8, padding: "4px 0", borderBottom: `1px solid ${C.cream}` }}>{day.date}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {day.events.map((event, ei) => (
                <div key={ei} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, borderLeft: `3px solid ${typeColors[event.type]}` }}>
                  <span style={{ fontSize: 14 }}>{typeIcons[event.type]}</span>
                  <div style={{ textAlign: "center", width: 50, flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{event.time.split(" ")[0]}</div>
                    <div style={{ fontSize: 9, color: C.text }}>{event.time.split(" ")[1]}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{event.title}</div>
                    {event.duration > 0 && <div style={{ fontSize: 10, color: C.text }}>{event.duration} min</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── WINS JOURNAL ───────────────────────────────────────────────────────────────

function WinsSection() {
  return (
    <Card style={{ borderTop: `3px solid ${C.success}` }}>
      <CardTitle>Recent Wins</CardTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {CLIENT_WINS.map((win, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: 10, borderRadius: 8, background: `${C.success}06` }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{win.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, lineHeight: 1.3 }}>{win.text}</div>
              <div style={{ fontSize: 10, color: C.text, marginTop: 2 }}>{win.date}</div>
            </div>
          </div>
        ))}
      </div>
      <button style={{ width: "100%", marginTop: 12, padding: "9px 14px", borderRadius: 8, border: `1px solid ${C.success}`, background: "transparent", color: C.success, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
        + Log a Win
      </button>
    </Card>
  );
}

// ─── SESSION HISTORY ────────────────────────────────────────────────────────────

function SessionHistorySection() {
  const outcomeColors = { positive: C.success, neutral: C.gold, negative: C.danger };
  return (
    <Card>
      <CardTitle>Session History</CardTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SESSION_HISTORY.map((s, i) => (
          <div key={i} style={{ padding: 12, borderRadius: 8, border: `1px solid ${C.border}`, borderLeft: `3px solid ${outcomeColors[s.outcome]}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{s.focus}</span>
              <span style={{ fontSize: 10, color: C.text }}>{s.date}</span>
            </div>
            <p style={{ margin: 0, fontSize: 11, color: C.text, lineHeight: 1.4 }}>{s.notes}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── CLIENT PROGRESS KPIs ───────────────────────────────────────────────────────

function ClientKPIs() {
  const tasksCompleted = CLIENT_TASKS.filter(t => t.status === "completed").length;
  const taskActive = CLIENT_TASKS.filter(t => t.status !== "completed").length;
  const overdue = CLIENT_TASKS.filter(t => t.status === "overdue").length;
  const goalsOnTrack = CLIENT_GOALS.filter(g => g.progress >= 40).length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 18 }}>
      {[
        { icon: "📊", label: "Health Score", value: CLIENT_HEALTH.overall, sub: "out of 100", color: C.success },
        { icon: "✅", label: "Tasks Active", value: taskActive, sub: `${overdue} overdue`, color: overdue > 0 ? C.danger : C.success },
        { icon: "🎯", label: "Goals On Track", value: `${goalsOnTrack}/${CLIENT_GOALS.length}`, sub: "active goals", color: C.gold },
        { icon: "📅", label: "Next Session", value: "Today", sub: "9:00 AM", color: C.info },
        { icon: "🔥", label: "Session Streak", value: "8", sub: "consecutive weeks", color: C.warning },
        { icon: "🏆", label: "Wins This Month", value: CLIENT_WINS.length, sub: "logged", color: C.success },
      ].map((kpi, i) => (
        <Card key={i} style={{ textAlign: "center", padding: 16 }}>
          <span style={{ fontSize: 20 }}>{kpi.icon}</span>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.navy, margin: "4px 0 2px" }}>{kpi.value}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{kpi.label}</div>
          <div style={{ fontSize: 10, color: `${C.text}88`, marginTop: 1 }}>{kpi.sub}</div>
        </Card>
      ))}
    </div>
  );
}

// ─── MAIN CLIENT DASHBOARD ──────────────────────────────────────────────────────

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "tasks", label: "Tasks", icon: "⚡" },
    { id: "goals", label: "Goals", icon: "🎯" },
    { id: "calendar", label: "Calendar", icon: "📅" },
    { id: "sessions", label: "Sessions", icon: "💬" },
  ];

  const urgentAlerts = CLIENT_ALERTS.filter(a => a.type === "task" || a.type === "coaching");

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, color: C.white }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: -0.5, fontFamily: "'DM Serif Display', Georgia, serif" }}>
                <span style={{ color: C.gold }}>Coach</span>Perfect
              </h1>
              <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.15)" }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Client Portal</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Notifications */}
              <button onClick={() => setNotificationsOpen(true)} style={{ position: "relative", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 8px", cursor: "pointer" }}>
                <span style={{ fontSize: 16 }}>🔔</span>
                <AlertBadge count={CLIENT_ALERTS.length} />
              </button>

              {/* Client Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: C.navy }}>{CLIENT.avatar}</div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600, display: "block" }}>{CLIENT.name}</span>
                  <span style={{ fontSize: 10, opacity: 0.6 }}>{CLIENT.company}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: "flex", gap: 2 }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "10px 16px", borderRadius: "8px 8px 0 0", border: "none", cursor: "pointer",
                  background: activeTab === tab.id ? C.cream : "transparent",
                  color: activeTab === tab.id ? C.navy : "rgba(255,255,255,0.6)",
                  fontSize: 12, fontWeight: 600, transition: "all 0.2s",
                }}
              >
                <span style={{ marginRight: 5 }}>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${C.gold}, ${C.success})` }} />
      </header>

      {/* Urgent Alert Banner */}
      {urgentAlerts.length > 0 && (
        <div style={{ background: `${C.danger}08`, borderBottom: `1px solid ${C.danger}20`, padding: "10px 0" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14 }}>⚠️</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.danger }}>{urgentAlerts.length} item{urgentAlerts.length > 1 ? "s" : ""} need your attention</span>
            <div style={{ flex: 1 }} />
            <button onClick={() => setNotificationsOpen(true)} style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${C.danger}`, background: "transparent", color: C.danger, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>View All</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "22px 28px" }}>
        {/* Welcome */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Welcome back, {CLIENT.name.split(" ")[0]}
            </h2>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: C.text }}>Your coaching journey with {CLIENT.coachName} · {CLIENT.engagement}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, background: C.white, border: `1px solid ${C.border}` }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.navy, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{CLIENT.coachAvatar}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Your Coach</div>
              <div style={{ fontSize: 10, color: C.text }}>{CLIENT.coachName}</div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <ClientKPIs />

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <BigPictureSection />
              <TasksSection />
              <GoalsSection />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Alerts Card */}
              <Card style={{ borderTop: `3px solid ${C.gold}` }}>
                <CardTitle>Alerts & Reminders</CardTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {CLIENT_ALERTS.slice(0, 4).map(alert => (
                    <div key={alert.id} style={{ padding: 10, borderRadius: 8, background: C.cream, borderLeft: `3px solid ${alertIconBg[alert.type]}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 13 }}>{alert.icon}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>{alert.title}</span>
                      </div>
                      <div style={{ fontSize: 11, color: C.text, lineHeight: 1.3, marginBottom: 6, paddingLeft: 22 }}>{alert.message}</div>
                      <div style={{ paddingLeft: 22 }}>
                        <button style={{ padding: "3px 10px", fontSize: 10, fontWeight: 700, background: alertIconBg[alert.type], color: C.white, border: "none", borderRadius: 4, cursor: "pointer" }}>{alert.actionLabel}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <CalendarSection />
              <WinsSection />
              <SessionHistorySection />
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div style={{ maxWidth: 800 }}>
            <TasksSection />
          </div>
        )}

        {activeTab === "goals" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
            <GoalsSection />
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <BigPictureSection />
              <WinsSection />
            </div>
          </div>
        )}

        {activeTab === "calendar" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
            <CalendarSection />
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Card style={{ borderTop: `3px solid ${C.gold}` }}>
                <CardTitle>Alerts & Reminders</CardTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {CLIENT_ALERTS.filter(a => a.type === "coaching" || a.type === "deadline").map(alert => (
                    <div key={alert.id} style={{ padding: 10, borderRadius: 8, background: C.cream, borderLeft: `3px solid ${alertIconBg[alert.type]}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 13 }}>{alert.icon}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>{alert.title}</span>
                      </div>
                      <div style={{ fontSize: 11, color: C.text, marginBottom: 6, paddingLeft: 22 }}>{alert.message}</div>
                    </div>
                  ))}
                </div>
              </Card>
              <TasksSection />
            </div>
          </div>
        )}

        {activeTab === "sessions" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
            <SessionHistorySection />
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Card>
                <CardTitle>Your Coach</CardTitle>
                <div style={{ textAlign: "center", padding: 16 }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.navy, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, margin: "0 auto 10px" }}>{CLIENT.coachAvatar}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{CLIENT.coachName}</div>
                  <div style={{ fontSize: 12, color: C.text, marginTop: 2 }}>Executive Coach</div>
                  <div style={{ fontSize: 11, color: `${C.text}88`, marginTop: 2 }}>Member since {CLIENT.memberSince}</div>
                  <button style={{ marginTop: 14, padding: "9px 20px", borderRadius: 8, background: C.navy, color: C.white, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Message Coach</button>
                </div>
              </Card>
              <WinsSection />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ marginTop: 40, padding: "16px 0", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 28px", display: "flex", justifyContent: "space-between", fontSize: 11, color: `${C.text}88` }}>
          <span>&copy; 2026 CoachPerfect. Your coaching ecosystem.</span>
          <span>v2.0.0 · Client Portal</span>
        </div>
      </footer>

      {/* Notification Drawer */}
      <NotificationDrawer alerts={CLIENT_ALERTS} isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}
