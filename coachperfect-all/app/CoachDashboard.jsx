import { useState } from "react";

// ─── MOCK DATA ──────────────────────────────────────────────────────────────────

const COACH = { name: "Meredith Eicher", role: "Executive Coach", initials: "ME", email: "meredith@coachperfect.com" };

const CLIENTS = [
  { id: 1, name: "Chris Ciesielski", company: "NFP", status: "active", health: "green", lastSession: "Feb 12", nextSession: "Feb 19", diagnosticScore: 74, overdueTasks: 0, engagement: "1:1 Coaching", tasksCompleted: 12, totalTasks: 14, goalProgress: 78, avatar: "CC" },
  { id: 2, name: "Delaine Henry", company: "Advanced Hospice Mgmt", status: "active", health: "green", lastSession: "Feb 10", nextSession: "Feb 24", diagnosticScore: 68, overdueTasks: 1, engagement: "CEO Roundtable", tasksCompleted: 8, totalTasks: 11, goalProgress: 65, avatar: "DH" },
  { id: 3, name: "Manville Borne", company: "Borne Industries", status: "active", health: "yellow", lastSession: "Jan 28", nextSession: "Feb 20", diagnosticScore: 55, overdueTasks: 2, engagement: "1:1 Coaching", tasksCompleted: 5, totalTasks: 10, goalProgress: 42, avatar: "MB" },
  { id: 4, name: "Chad Heiser", company: "Heiser Group", status: "active", health: "green", lastSession: "Feb 14", nextSession: "Feb 28", diagnosticScore: 81, overdueTasks: 0, engagement: "Peer Group", tasksCompleted: 9, totalTasks: 9, goalProgress: 91, avatar: "CH" },
  { id: 5, name: "Sarah Rainwater", company: "SR Consulting", status: "at-risk", health: "red", lastSession: "Jan 15", nextSession: "—", diagnosticScore: 42, overdueTasks: 4, engagement: "RISE Program", tasksCompleted: 2, totalTasks: 8, goalProgress: 20, avatar: "SR" },
  { id: 6, name: "James Patterson", company: "Patterson Legal", status: "active", health: "green", lastSession: "Feb 15", nextSession: "Feb 22", diagnosticScore: 77, overdueTasks: 0, engagement: "1:1 Coaching", tasksCompleted: 11, totalTasks: 12, goalProgress: 85, avatar: "JP" },
];

const BUSINESS_ALERTS = [
  { id: 1, type: "danger", title: "Client At Risk", message: "Sarah Rainwater has not had a session in 34 days", time: "2h ago", clientId: 5, actionLabel: "Schedule Now" },
  { id: 2, type: "warning", title: "Overdue Tasks", message: "Manville Borne has 2 overdue action items", time: "4h ago", clientId: 3, actionLabel: "View Tasks" },
  { id: 3, type: "info", title: "Milestone Reached", message: "Chad Heiser completed all Q1 goals!", time: "6h ago", clientId: 4, actionLabel: "Celebrate" },
  { id: 4, type: "warning", title: "Session Prep", message: "Prep materials needed for Chris Ciesielski tomorrow", time: "8h ago", clientId: 1, actionLabel: "Prepare" },
  { id: 5, type: "success", title: "Diagnostic Complete", message: "James Patterson finished leadership diagnostic", time: "1d ago", clientId: 6, actionLabel: "Review" },
];

const PERSONAL_ALERTS = [
  { id: 10, type: "info", title: "Morning Routine", message: "Meditation and journaling — 6:30 AM", time: "Today", actionLabel: "Done" },
  { id: 11, type: "warning", title: "Health Check", message: "Annual physical appointment next Monday", time: "5 days", actionLabel: "Confirm" },
  { id: 12, type: "info", title: "Family", message: "School pickup at 3:15 PM today", time: "Today", actionLabel: "Set Reminder" },
];

const BUSINESS_TASKS = [
  { id: 1, text: "Complete Q1 financial review", priority: "high", due: "Feb 20", status: "active", assignee: "ME" },
  { id: 2, text: "Prep CEO Roundtable materials", priority: "high", due: "Feb 18", status: "active", assignee: "ME" },
  { id: 3, text: "Review Sarah Rainwater re-engagement plan", priority: "critical", due: "Feb 17", status: "overdue", assignee: "ME" },
  { id: 4, text: "Send follow-up resources to Chad Heiser", priority: "medium", due: "Feb 22", status: "pending", assignee: "ME" },
  { id: 5, text: "Update client onboarding workflow", priority: "medium", due: "Feb 25", status: "pending", assignee: "Team" },
  { id: 6, text: "Generate Q1 progress reports for all clients", priority: "low", due: "Mar 1", status: "pending", assignee: "ME" },
];

const PERSONAL_TASKS = [
  { id: 20, text: "Book vacation flights for spring break", priority: "medium", due: "Feb 22", status: "pending", assignee: "ME" },
  { id: 21, text: "Schedule annual physical", priority: "high", due: "Feb 19", status: "active", assignee: "ME" },
  { id: 22, text: "Read 'Atomic Habits' — Chapter 7", priority: "low", due: "Feb 20", status: "active", assignee: "ME" },
  { id: 23, text: "Meal prep for the week", priority: "medium", due: "Feb 18", status: "pending", assignee: "ME" },
  { id: 24, text: "Call Mom", priority: "high", due: "Feb 18", status: "active", assignee: "ME" },
];

const BUSINESS_SCHEDULE = [
  { time: "9:00 AM", title: "Chris Ciesielski", subtitle: "1:1 Coaching", duration: 60, type: "session" },
  { time: "11:00 AM", title: "Team — NFP Leadership", subtitle: "Team Coaching", duration: 90, type: "session" },
  { time: "1:00 PM", title: "Lunch & Review Prep", subtitle: "Admin Block", duration: 60, type: "admin" },
  { time: "2:00 PM", title: "Manville Borne", subtitle: "1:1 Coaching", duration: 60, type: "session" },
  { time: "4:00 PM", title: "CEO Roundtable Prep", subtitle: "Content Creation", duration: 45, type: "admin" },
];

const PERSONAL_SCHEDULE = [
  { time: "6:30 AM", title: "Morning Meditation", subtitle: "Wellness", duration: 20, type: "wellness" },
  { time: "7:00 AM", title: "Gym — Strength Training", subtitle: "Fitness", duration: 60, type: "wellness" },
  { time: "12:30 PM", title: "Lunch with Sarah K.", subtitle: "Social", duration: 60, type: "social" },
  { time: "3:15 PM", title: "School Pickup", subtitle: "Family", duration: 30, type: "family" },
  { time: "6:00 PM", title: "Family Dinner", subtitle: "Family", duration: 60, type: "family" },
  { time: "8:30 PM", title: "Reading Time", subtitle: "Personal Development", duration: 45, type: "personal" },
];

const PERSONAL_GOALS = [
  { name: "Read 12 Books This Year", progress: 25, current: "3/12", icon: "📚" },
  { name: "Meditate Daily", progress: 87, current: "26/30 days", icon: "🧘" },
  { name: "Gym 4x/Week", progress: 75, current: "3/4 this week", icon: "💪" },
  { name: "Family Dinner 5x/Week", progress: 60, current: "3/5 this week", icon: "🍽️" },
];

const DIAGNOSTIC_CATEGORIES = [
  { name: "Leadership", avg: 76, color: "#8b5cf6" },
  { name: "Financial", avg: 68, color: "#c9a84c" },
  { name: "Operations", avg: 55, color: "#2d5a8e" },
  { name: "People", avg: 72, color: "#10b981" },
  { name: "Strategy", avg: 48, color: "#f59e0b" },
  { name: "Marketing", avg: 41, color: "#ef4444" },
  { name: "Technology", avg: 52, color: "#06b6d4" },
  { name: "Customer", avg: 73, color: "#ec4899" },
];

const ACTIVITY_FEED = [
  { icon: "📋", text: "Diagnostic completed by Chad Heiser", time: "2 hours ago" },
  { icon: "✅", text: "Chris Ciesielski completed 3 action items", time: "4 hours ago" },
  { icon: "📅", text: "New session scheduled with Delaine Henry", time: "Yesterday" },
  { icon: "⚠️", text: "Sarah Rainwater — no session in 34 days", time: "Yesterday" },
  { icon: "📄", text: "Q4 Review uploaded for Manville Borne", time: "2 days ago" },
  { icon: "🎯", text: "James Patterson hit 85% goal completion", time: "2 days ago" },
  { icon: "💬", text: "Delaine Henry sent a message", time: "3 days ago" },
];

// ─── STYLE CONSTANTS ────────────────────────────────────────────────────────────

const C = {
  navy: "#1e3a5f",
  navyLight: "#2d5a8e",
  gold: "#c9a84c",
  cream: "#f4f1ea",
  border: "#e0dcd4",
  text: "#4a5568",
  textLight: "#4a5568",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  white: "#ffffff",
};

const priorityColors = { critical: C.danger, high: C.warning, medium: C.info, low: "#9ca3af" };
const healthColors = { green: C.success, yellow: C.warning, red: C.danger };
const alertTypeColors = { danger: C.danger, warning: C.warning, info: C.info, success: C.success };

// ─── REUSABLE COMPONENTS ────────────────────────────────────────────────────────

function ToggleSwitch({ isOn, onToggle, leftLabel, rightLabel }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: !isOn ? C.white : "rgba(255,255,255,0.5)", transition: "color 0.2s" }}>{leftLabel}</span>
      <button
        onClick={onToggle}
        style={{
          width: 52, height: 28, borderRadius: 14, border: "2px solid rgba(255,255,255,0.3)",
          background: isOn ? C.gold : "rgba(255,255,255,0.15)",
          position: "relative", cursor: "pointer", transition: "all 0.3s ease",
        }}
      >
        <div style={{
          width: 20, height: 20, borderRadius: "50%", background: C.white,
          position: "absolute", top: 2, left: isOn ? 26 : 4,
          transition: "left 0.3s ease", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }} />
      </button>
      <span style={{ fontSize: 12, fontWeight: 600, color: isOn ? C.gold : "rgba(255,255,255,0.5)", transition: "color 0.2s" }}>{rightLabel}</span>
    </div>
  );
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

function HealthDot({ health }) {
  return <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: healthColors[health] }} />;
}

function PriorityDot({ priority }) {
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: priorityColors[priority], flexShrink: 0 }} />;
}

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

function KPICard({ icon, label, value, subtext, trend, trendLabel }) {
  const trendColor = trend > 0 ? C.success : trend < 0 ? C.danger : "#9ca3af";
  return (
    <Card style={{ cursor: "pointer", transition: "box-shadow 0.2s, border-color 0.2s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        {trend !== undefined && (
          <span style={{ fontSize: 11, fontWeight: 700, color: trendColor }}>
            {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: C.navy, letterSpacing: -0.5 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginTop: 3 }}>{label}</div>
      {subtext && <div style={{ fontSize: 11, color: `${C.text}99`, marginTop: 2 }}>{subtext}</div>}
    </Card>
  );
}

function ProgressBar({ percent, color, height = 6 }) {
  return (
    <div style={{ width: "100%", height, background: `${C.cream}`, borderRadius: height / 2, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(percent, 100)}%`, height: "100%", background: color || C.gold, borderRadius: height / 2, transition: "width 0.5s ease" }} />
    </div>
  );
}

function DiagnosticBar({ name, avg, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <div style={{ width: 80, fontSize: 11, fontWeight: 600, color: C.text, textAlign: "right" }}>{name}</div>
      <div style={{ flex: 1, height: 20, background: C.cream, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ width: `${avg}%`, height: "100%", background: color, borderRadius: 10, transition: "width 0.7s ease", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: C.white }}>{avg}%</span>
        </div>
      </div>
    </div>
  );
}

// ─── NOTIFICATION DRAWER ────────────────────────────────────────────────────────

function NotificationDrawer({ alerts, isOpen, onClose, onAction }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
      <div style={{ position: "relative", width: 400, maxWidth: "90vw", background: C.white, height: "100%", boxShadow: "-4px 0 24px rgba(0,0,0,0.1)", overflowY: "auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display', Georgia, serif" }}>Notifications</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.text, padding: 4 }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {alerts.map(alert => (
            <div key={alert.id} style={{ padding: 14, borderRadius: 10, border: `1px solid ${C.border}`, borderLeft: `4px solid ${alertTypeColors[alert.type]}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: alertTypeColors[alert.type] }}>{alert.title}</span>
                <span style={{ fontSize: 10, color: `${C.text}88` }}>{alert.time}</span>
              </div>
              <p style={{ margin: "4px 0 10px", fontSize: 13, color: C.text, lineHeight: 1.4 }}>{alert.message}</p>
              <button
                onClick={() => onAction && onAction(alert)}
                style={{ padding: "5px 14px", fontSize: 11, fontWeight: 700, background: alertTypeColors[alert.type], color: C.white, border: "none", borderRadius: 6, cursor: "pointer" }}
              >{alert.actionLabel}</button>
            </div>
          ))}
          {alerts.length === 0 && <p style={{ textAlign: "center", color: `${C.text}88`, fontSize: 13, padding: 40 }}>No notifications</p>}
        </div>
      </div>
    </div>
  );
}

// ─── PUSH TASK / REMINDER MODAL ─────────────────────────────────────────────────

function PushModal({ isOpen, onClose, clients, mode }) {
  const [selectedClient, setSelectedClient] = useState("");
  const [taskText, setTaskText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!selectedClient || !taskText) return;
    setSent(true);
    setTimeout(() => { setSent(false); setTaskText(""); setSelectedClient(""); setDueDate(""); onClose(); }, 1500);
  };

  const isReminder = mode === "reminder";
  const title = isReminder ? "Send Reminder" : "Push Task to Client";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
      <div style={{ position: "relative", width: 480, maxWidth: "90vw", background: C.white, borderRadius: 16, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{isReminder ? "🔔" : "✅"}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{isReminder ? "Reminder Sent!" : "Task Pushed!"}</div>
            <div style={{ fontSize: 13, color: C.text, marginTop: 6 }}>Your client will be notified.</div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display', Georgia, serif" }}>{title}</h2>
              <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.text }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>Client</label>
                <select
                  value={selectedClient}
                  onChange={e => setSelectedClient(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy, background: C.white }}
                >
                  <option value="">Select a client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} — {c.company}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>{isReminder ? "Reminder Message" : "Task Description"}</label>
                <textarea
                  value={taskText}
                  onChange={e => setTaskText(e.target.value)}
                  placeholder={isReminder ? "e.g., Don't forget to complete your weekly reflection..." : "e.g., Complete leadership self-assessment by Friday..."}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy, minHeight: 80, resize: "vertical", fontFamily: "inherit" }}
                />
              </div>
              {!isReminder && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>Priority</label>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy, background: C.white }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy }}
                    />
                  </div>
                </div>
              )}
              <button
                onClick={handleSend}
                disabled={!selectedClient || !taskText}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 10, border: "none",
                  background: (!selectedClient || !taskText) ? "#ccc" : C.navy, color: C.white,
                  fontSize: 14, fontWeight: 700, cursor: (!selectedClient || !taskText) ? "default" : "pointer",
                  transition: "background 0.2s",
                }}
              >
                {isReminder ? "Send Reminder" : "Push Task"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── CLIENT DETAIL PANEL ────────────────────────────────────────────────────────

function ClientDetailPanel({ client, onClose, onPushTask, onSendReminder }) {
  if (!client) return null;
  const completionRate = Math.round((client.tasksCompleted / client.totalTasks) * 100);
  return (
    <Card style={{ borderLeft: `4px solid ${healthColors[client.health]}`, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.navy, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>{client.avatar}</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.navy }}>{client.name}</div>
            <div style={{ fontSize: 12, color: C.text }}>{client.company} · {client.engagement}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: C.text }}>✕</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, margin: "18px 0" }}>
        <div style={{ textAlign: "center", padding: 10, background: C.cream, borderRadius: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.navy }}>{client.diagnosticScore}</div>
          <div style={{ fontSize: 10, color: C.text }}>Health Score</div>
        </div>
        <div style={{ textAlign: "center", padding: 10, background: C.cream, borderRadius: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.navy }}>{completionRate}%</div>
          <div style={{ fontSize: 10, color: C.text }}>Tasks Done</div>
        </div>
        <div style={{ textAlign: "center", padding: 10, background: C.cream, borderRadius: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.navy }}>{client.goalProgress}%</div>
          <div style={{ fontSize: 10, color: C.text }}>Goal Progress</div>
        </div>
        <div style={{ textAlign: "center", padding: 10, background: C.cream, borderRadius: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: client.overdueTasks > 0 ? C.danger : C.success }}>{client.overdueTasks}</div>
          <div style={{ fontSize: 10, color: C.text }}>Overdue</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: C.text, marginBottom: 3 }}>Task Completion</div>
          <ProgressBar percent={completionRate} color={completionRate >= 70 ? C.success : completionRate >= 50 ? C.warning : C.danger} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: C.text, marginBottom: 3 }}>Goal Progress</div>
          <ProgressBar percent={client.goalProgress} color={C.gold} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, fontSize: 11, color: C.text, marginBottom: 14 }}>
        <span>Last Session: <b style={{ color: C.navy }}>{client.lastSession}</b></span>
        <span style={{ color: C.border }}>|</span>
        <span>Next Session: <b style={{ color: C.navy }}>{client.nextSession}</b></span>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onPushTask(client)} style={{ flex: 1, padding: "9px 14px", borderRadius: 8, background: C.navy, color: C.white, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Push Task</button>
        <button onClick={() => onSendReminder(client)} style={{ flex: 1, padding: "9px 14px", borderRadius: 8, background: C.gold, color: C.navy, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Send Reminder</button>
        <button style={{ padding: "9px 14px", borderRadius: 8, background: C.cream, color: C.navy, border: `1px solid ${C.border}`, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>View Full Profile</button>
      </div>
    </Card>
  );
}

// ─── BUSINESS MODE DASHBOARD ────────────────────────────────────────────────────

function BusinessDashboard({ onPushTask, onSendReminder }) {
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const client = CLIENTS.find(c => c.id === selectedClient);

  const businessTabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "clients", label: "Clients", icon: "👥" },
    { id: "sessions", label: "Schedule", icon: "📅" },
    { id: "tasks", label: "Tasks", icon: "⚡" },
    { id: "diagnostics", label: "Diagnostics", icon: "🔍" },
  ];

  const activeClients = CLIENTS.filter(c => c.status === "active").length;
  const atRiskClients = CLIENTS.filter(c => c.health === "red").length;
  const totalOverdue = CLIENTS.reduce((sum, c) => sum + c.overdueTasks, 0);

  return (
    <>
      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.white, borderRadius: 10, padding: 4, border: `1px solid ${C.border}` }}>
        {businessTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              background: activeTab === tab.id ? C.navy : "transparent",
              color: activeTab === tab.id ? C.white : C.text,
              fontSize: 12, fontWeight: 600, transition: "all 0.2s",
            }}
          >
            <span style={{ marginRight: 5 }}>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 18 }}>
        <KPICard icon="👥" label="Active Clients" value={activeClients} subtext={`${CLIENTS.length} total · ${atRiskClients} at risk`} trend={12} />
        <KPICard icon="📅" label="Sessions Today" value={BUSINESS_SCHEDULE.filter(s => s.type === "session").length} subtext="3 coaching, 2 admin" trend={8} />
        <KPICard icon="⚡" label="Overdue Items" value={totalOverdue} subtext="across all clients" trend={-15} />
        <KPICard icon="💰" label="Monthly Revenue" value="$4,250" subtext="MRR" trend={15} />
        <KPICard icon="🎯" label="Avg Client Score" value="64" subtext="out of 100" trend={5} />
      </div>

      {/* Client Detail Panel */}
      {client && (
        <ClientDetailPanel
          client={client}
          onClose={() => setSelectedClient(null)}
          onPushTask={() => onPushTask(client)}
          onSendReminder={() => onSendReminder(client)}
        />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Client Portfolio */}
          <Card>
            <CardTitle action={<button onClick={() => onPushTask()} style={{ padding: "6px 14px", borderRadius: 7, background: C.navy, color: C.white, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ Push Task</button>}>
              Client Portfolio
            </CardTitle>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                    {["Client", "Engagement", "Health", "Score", "Tasks", "Goals", "Next Session", "Actions"].map(h => (
                      <th key={h} style={{ textAlign: h === "Client" ? "left" : "center", fontSize: 10, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "0.05em", padding: "8px 6px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CLIENTS.map(c => {
                    const completion = Math.round((c.tasksCompleted / c.totalTasks) * 100);
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedClient(selectedClient === c.id ? null : c.id)}
                        style={{ borderBottom: `1px solid ${C.cream}`, cursor: "pointer", background: selectedClient === c.id ? C.cream : "transparent", transition: "background 0.15s" }}
                      >
                        <td style={{ padding: "10px 6px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.navy, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{c.avatar}</div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{c.name}</div>
                              <div style={{ fontSize: 10, color: C.text }}>{c.company}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: "center", padding: "10px 6px" }}>
                          <span style={{ fontSize: 10, background: C.cream, color: C.text, padding: "3px 8px", borderRadius: 4 }}>{c.engagement}</span>
                        </td>
                        <td style={{ textAlign: "center", padding: "10px 6px" }}><HealthDot health={c.health} /></td>
                        <td style={{ textAlign: "center", padding: "10px 6px" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: c.diagnosticScore >= 70 ? C.success : c.diagnosticScore >= 50 ? C.warning : C.danger }}>{c.diagnosticScore}</span>
                        </td>
                        <td style={{ textAlign: "center", padding: "10px 6px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>{completion}%</span>
                            {c.overdueTasks > 0 && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 8, background: `${C.danger}18`, color: C.danger, fontWeight: 700 }}>{c.overdueTasks} late</span>}
                          </div>
                        </td>
                        <td style={{ textAlign: "center", padding: "10px 6px" }}>
                          <div style={{ width: 40, margin: "0 auto" }}><ProgressBar percent={c.goalProgress} color={C.gold} height={4} /></div>
                          <div style={{ fontSize: 9, color: C.text, marginTop: 2 }}>{c.goalProgress}%</div>
                        </td>
                        <td style={{ textAlign: "center", fontSize: 12, color: C.text, padding: "10px 6px" }}>{c.nextSession}</td>
                        <td style={{ textAlign: "center", padding: "10px 6px" }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                            <button onClick={() => onPushTask(c)} title="Push Task" style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, cursor: "pointer", fontSize: 12 }}>📋</button>
                            <button onClick={() => onSendReminder(c)} title="Send Reminder" style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, cursor: "pointer", fontSize: 12 }}>🔔</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Diagnostics Overview */}
          <Card>
            <CardTitle>Average Client Diagnostics</CardTitle>
            {DIAGNOSTIC_CATEGORIES.map(cat => <DiagnosticBar key={cat.name} {...cat} />)}
          </Card>

          {/* Business Tasks */}
          <Card>
            <CardTitle action={<button onClick={() => onPushTask()} style={{ padding: "6px 14px", borderRadius: 7, background: C.gold, color: C.navy, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ New Task</button>}>
              My Tasks
            </CardTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {BUSINESS_TASKS.map(task => (
                <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, cursor: "pointer", transition: "background 0.1s", background: task.status === "overdue" ? `${C.danger}06` : C.white }}>
                  <PriorityDot priority={task.priority} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.text}</div>
                    <div style={{ fontSize: 10, color: C.text, marginTop: 1 }}>{task.assignee} · Due {task.due}</div>
                  </div>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, fontWeight: 600, background: task.status === "overdue" ? `${C.danger}15` : task.status === "active" ? `${C.gold}20` : `${C.text}10`, color: task.status === "overdue" ? C.danger : task.status === "active" ? C.gold : C.text }}>{task.status}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Alerts */}
          <Card style={{ borderTop: `3px solid ${C.danger}` }}>
            <CardTitle>Alerts</CardTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {BUSINESS_ALERTS.slice(0, 4).map(alert => (
                <div key={alert.id} style={{ padding: 10, borderRadius: 8, background: C.cream, borderLeft: `3px solid ${alertTypeColors[alert.type]}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: alertTypeColors[alert.type] }}>{alert.title}</div>
                  <div style={{ fontSize: 11, color: C.text, margin: "3px 0 6px", lineHeight: 1.3 }}>{alert.message}</div>
                  <button style={{ padding: "3px 10px", fontSize: 10, fontWeight: 700, background: alertTypeColors[alert.type], color: C.white, border: "none", borderRadius: 4, cursor: "pointer" }}>{alert.actionLabel}</button>
                </div>
              ))}
            </div>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardTitle>Today's Schedule</CardTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {BUSINESS_SCHEDULE.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}` }}>
                  <div style={{ textAlign: "center", width: 50, flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{s.time.split(" ")[0]}</div>
                    <div style={{ fontSize: 9, color: C.text }}>{s.time.split(" ")[1]}</div>
                  </div>
                  <div style={{ width: 2, height: 32, background: s.type === "session" ? C.gold : C.border, borderRadius: 1 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                    <div style={{ fontSize: 10, color: C.text }}>{s.subtitle} · {s.duration}min</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Activity Feed */}
          <Card>
            <CardTitle>Activity Feed</CardTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ACTIVITY_FEED.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{a.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: C.text, lineHeight: 1.3 }}>{a.text}</div>
                    <div style={{ fontSize: 10, color: `${C.text}66`, marginTop: 1 }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, borderRadius: 14, padding: 22, color: C.white }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, fontFamily: "'DM Serif Display', Georgia, serif" }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { icon: "📋", label: "Push Task to Client", action: () => onPushTask() },
                { icon: "🔔", label: "Send Reminder", action: () => onSendReminder() },
                { icon: "👤", label: "Add New Client", action: () => {} },
                { icon: "🔍", label: "Run Diagnostic", action: () => {} },
                { icon: "📊", label: "Generate Reports", action: () => {} },
              ].map((a, i) => (
                <button key={i} onClick={a.action} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "none", color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "left", transition: "background 0.15s" }}>
                  <span style={{ fontSize: 14 }}>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── PERSONAL MODE DASHBOARD ────────────────────────────────────────────────────

function PersonalDashboard() {
  return (
    <>
      {/* Personal KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 18 }}>
        <KPICard icon="🧘" label="Meditation Streak" value="26 days" subtext="Best: 34 days" trend={15} />
        <KPICard icon="💪" label="Workouts This Week" value="3 / 4" subtext="On track" trend={0} />
        <KPICard icon="📚" label="Books Read" value="3 / 12" subtext="This year" trend={25} />
        <KPICard icon="🍽️" label="Family Dinners" value="3 / 5" subtext="This week" trend={-10} />
        <KPICard icon="😊" label="Wellbeing Score" value="8.2" subtext="Out of 10" trend={5} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Personal Tasks */}
          <Card>
            <CardTitle action={<button style={{ padding: "6px 14px", borderRadius: 7, background: C.gold, color: C.navy, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ Add Task</button>}>
              My Personal Tasks
            </CardTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {PERSONAL_TASKS.map(task => (
                <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, cursor: "pointer" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${C.border}`, flexShrink: 0, cursor: "pointer" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{task.text}</div>
                    <div style={{ fontSize: 10, color: C.text, marginTop: 1 }}>Due {task.due}</div>
                  </div>
                  <PriorityDot priority={task.priority} />
                </div>
              ))}
            </div>
          </Card>

          {/* Goals */}
          <Card>
            <CardTitle>Personal Goals</CardTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {PERSONAL_GOALS.map((goal, i) => (
                <div key={i} style={{ padding: 14, borderRadius: 10, background: C.cream, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 22 }}>{goal.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{goal.progress}%</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, marginBottom: 4 }}>{goal.name}</div>
                  <ProgressBar percent={goal.progress} color={goal.progress >= 75 ? C.success : goal.progress >= 50 ? C.gold : C.warning} />
                  <div style={{ fontSize: 10, color: C.text, marginTop: 4 }}>{goal.current}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Weekly Reflection */}
          <Card>
            <CardTitle>Weekly Reflection</CardTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[
                { label: "Energy Level", value: 7, emoji: "⚡" },
                { label: "Stress Level", value: 4, emoji: "🌊" },
                { label: "Fulfillment", value: 8, emoji: "✨" },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: "center", padding: 14, background: C.cream, borderRadius: 10 }}>
                  <div style={{ fontSize: 24 }}>{item.emoji}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: "4px 0" }}>{item.value}/10</div>
                  <div style={{ fontSize: 11, color: C.text }}>{item.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Alerts */}
          <Card style={{ borderTop: `3px solid ${C.info}` }}>
            <CardTitle>Personal Alerts</CardTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PERSONAL_ALERTS.map(alert => (
                <div key={alert.id} style={{ padding: 10, borderRadius: 8, background: C.cream, borderLeft: `3px solid ${alertTypeColors[alert.type]}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: alertTypeColors[alert.type] }}>{alert.title}</div>
                  <div style={{ fontSize: 11, color: C.text, margin: "3px 0 6px", lineHeight: 1.3 }}>{alert.message}</div>
                  <button style={{ padding: "3px 10px", fontSize: 10, fontWeight: 700, background: alertTypeColors[alert.type], color: C.white, border: "none", borderRadius: 4, cursor: "pointer" }}>{alert.actionLabel}</button>
                </div>
              ))}
            </div>
          </Card>

          {/* Today's Personal Schedule */}
          <Card>
            <CardTitle>Today's Schedule</CardTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PERSONAL_SCHEDULE.map((s, i) => {
                const typeColors = { wellness: C.success, social: C.info, family: "#ec4899", personal: C.gold };
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}` }}>
                    <div style={{ textAlign: "center", width: 50, flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{s.time.split(" ")[0]}</div>
                      <div style={{ fontSize: 9, color: C.text }}>{s.time.split(" ")[1]}</div>
                    </div>
                    <div style={{ width: 2, height: 32, background: typeColors[s.type] || C.border, borderRadius: 1 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{s.title}</div>
                      <div style={{ fontSize: 10, color: C.text }}>{s.subtitle} · {s.duration}min</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Habit Tracker */}
          <Card>
            <CardTitle>Habit Streak</CardTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { name: "Meditation", streak: 26, icon: "🧘", color: C.success },
                { name: "Exercise", streak: 12, icon: "💪", color: C.info },
                { name: "Reading", streak: 8, icon: "📖", color: C.gold },
                { name: "Journaling", streak: 15, icon: "✍️", color: "#8b5cf6" },
              ].map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{h.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{h.name}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 14 }}>🔥</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: h.color }}>{h.streak}d</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

// ─── MAIN COACH DASHBOARD ───────────────────────────────────────────────────────

export default function CoachDashboard() {
  const [mode, setMode] = useState("business"); // "personal" | "business"
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [pushModalOpen, setPushModalOpen] = useState(false);
  const [pushModalMode, setPushModalMode] = useState("task");

  const isPersonal = mode === "personal";
  const alerts = isPersonal ? PERSONAL_ALERTS : BUSINESS_ALERTS;
  const greeting = isPersonal ? "Your personal day at a glance." : "Here's your coaching business at a glance.";

  const openPushTask = (client) => { setPushModalMode("task"); setPushModalOpen(true); };
  const openSendReminder = (client) => { setPushModalMode("reminder"); setPushModalOpen(true); };

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, color: C.white }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
            {/* Logo & Mode Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: -0.5, fontFamily: "'DM Serif Display', Georgia, serif" }}>
                <span style={{ color: C.gold }}>Coach</span>Perfect
              </h1>
              <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.15)" }} />
              <ToggleSwitch isOn={isPersonal} onToggle={() => setMode(isPersonal ? "business" : "personal")} leftLabel="Business" rightLabel="Personal" />
            </div>

            {/* Right side */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Search */}
              <div style={{ position: "relative" }}>
                <input
                  placeholder="Search clients, tasks..."
                  style={{ width: 200, padding: "7px 12px 7px 32px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: C.white, fontSize: 12, outline: "none" }}
                />
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, opacity: 0.5 }}>🔍</span>
              </div>

              {/* Notifications */}
              <button onClick={() => setNotificationsOpen(true)} style={{ position: "relative", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 8px", cursor: "pointer" }}>
                <span style={{ fontSize: 16 }}>🔔</span>
                <AlertBadge count={alerts.length} />
              </button>

              {/* Coach Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: C.navy }}>{COACH.initials}</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{COACH.name}</span>
                  <span style={{ fontSize: 10, opacity: 0.6 }}>{isPersonal ? "Personal Mode" : COACH.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Indicator Bar */}
        <div style={{ height: 3, background: isPersonal ? `linear-gradient(90deg, #ec4899, #8b5cf6)` : `linear-gradient(90deg, ${C.gold}, ${C.success})` }} />
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "22px 28px" }}>
        {/* Greeting */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display', Georgia, serif" }}>
              {isPersonal ? "Good Morning, Meredith" : "Business Dashboard"}
            </h2>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: C.text }}>{greeting}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {!isPersonal && (
              <>
                <button onClick={() => openPushTask()} style={{ padding: "8px 16px", borderRadius: 8, background: C.navy, color: C.white, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                  <span>📋</span> Push Task
                </button>
                <button onClick={() => openSendReminder()} style={{ padding: "8px 16px", borderRadius: 8, background: C.gold, color: C.navy, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                  <span>🔔</span> Send Reminder
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dashboard Content */}
        {isPersonal ? <PersonalDashboard /> : <BusinessDashboard onPushTask={openPushTask} onSendReminder={openSendReminder} />}
      </main>

      {/* Footer */}
      <footer style={{ marginTop: 40, padding: "16px 0", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 28px", display: "flex", justifyContent: "space-between", fontSize: 11, color: `${C.text}88` }}>
          <span>&copy; 2026 CoachPerfect. Bold Conversations. Bolder Data.</span>
          <span>v2.0.0 · Coach Dashboard</span>
        </div>
      </footer>

      {/* Modals */}
      <NotificationDrawer alerts={alerts} isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <PushModal isOpen={pushModalOpen} onClose={() => setPushModalOpen(false)} clients={CLIENTS} mode={pushModalMode} />
    </div>
  );
}
