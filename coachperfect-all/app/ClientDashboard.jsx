import { useState, useEffect } from "react";
import {
  C, CLIENT, CLIENT_HEALTH, CLIENT_GOALS, CLIENT_TASKS,
  CLIENT_CALENDAR, CLIENT_ALERTS, CLIENT_DOCUMENTS,
  CLIENT_WINS, SESSION_HISTORY, alertIconBg,
} from "./client/clientData.js";
import { ClientOnboarding } from "./plugins/ClientOnboarding.jsx";
import { api } from "./hooks/useAPI.js";

// ─── PRIMITIVES ──────────────────────────────────────────────────────────────────
function Card({ children, style }) {
  return <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: 22, ...style }}>{children}</div>;
}
function CardTitle({ children, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display',Georgia,serif" }}>{children}</h3>
      {action}
    </div>
  );
}
function ProgressBar({ percent, color, height = 6 }) {
  return (
    <div style={{ width: "100%", height, background: C.cream, borderRadius: height / 2, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(percent, 100)}%`, height: "100%", background: color || C.gold, borderRadius: height / 2, transition: "width 0.5s" }} />
    </div>
  );
}
function FileIcon({ type }) {
  const map = { pdf: "📄", spreadsheet: "📊", document: "📝", presentation: "📽️" };
  const col = { pdf: C.danger, spreadsheet: C.success, document: C.info, presentation: C.warning };
  return (
    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${col[type] || C.text}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
      {map[type] || "📎"}
    </div>
  );
}

// ─── NOTIFICATION DRAWER ─────────────────────────────────────────────────────────
function NotifDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
      <div style={{ position: "relative", width: 400, maxWidth: "90vw", background: C.white, height: "100%", boxShadow: "-4px 0 24px rgba(0,0,0,0.12)", overflowY: "auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display',Georgia,serif" }}>Notifications</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.text }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {CLIENT_ALERTS.map(a => (
            <div key={a.id} style={{ padding: 14, borderRadius: 10, border: `1px solid ${C.border}`, borderLeft: `4px solid ${alertIconBg[a.type]}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 15 }}>{a.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{a.title}</span>
                </div>
                <span style={{ fontSize: 10, color: `${C.text}88` }}>{a.time}</span>
              </div>
              <p style={{ margin: "4px 0 10px", fontSize: 13, color: C.text, lineHeight: 1.4, paddingLeft: 22 }}>{a.message}</p>
              <div style={{ paddingLeft: 22 }}>
                <button style={{ padding: "5px 14px", fontSize: 11, fontWeight: 700, background: alertIconBg[a.type], color: C.white, border: "none", borderRadius: 6, cursor: "pointer" }}>{a.actionLabel}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── HEALTH GAUGE ────────────────────────────────────────────────────────────────
function HealthGauge({ score }) {
  const color = score >= 70 ? C.success : score >= 50 ? C.warning : C.danger;
  const label = score >= 70 ? "Healthy" : score >= 50 ? "Needs Attention" : "At Risk";
  const circ = 2 * Math.PI * 60;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={150} height={150} viewBox="0 0 150 150">
        <circle cx="75" cy="75" r="60" fill="none" stroke={C.cream} strokeWidth="12" />
        <circle cx="75" cy="75" r="60" fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={circ - (score / 100) * circ}
          strokeLinecap="round" transform="rotate(-90 75 75)" style={{ transition: "stroke-dashoffset 1s" }} />
        <text x="75" y="68" textAnchor="middle" style={{ fontSize: 32, fontWeight: 700, fill: C.navy }}>{score}</text>
        <text x="75" y="88" textAnchor="middle" style={{ fontSize: 11, fill: C.text, fontWeight: 600 }}>/100</text>
      </svg>
      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 12, background: `${color}18`, color }}>{label}</span>
    </div>
  );
}

// ─── DOCUMENTS SECTION ───────────────────────────────────────────────────────────
function DocumentsSection() {
  const unread = CLIENT_DOCUMENTS.filter(d => !d.viewed).length;
  return (
    <Card>
      <CardTitle action={unread > 0 && (
        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: `${C.purple}15`, color: C.purple }}>
          {unread} new
        </span>
      )}>
        Documents from Coach
      </CardTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {CLIENT_DOCUMENTS.map(doc => (
          <div key={doc.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 12px", borderRadius: 10, border: `1px solid ${doc.viewed ? C.border : C.purple}`, background: doc.viewed ? C.white : `${C.purple}05` }}>
            <FileIcon type={doc.type} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</div>
                {!doc.viewed && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 6, background: C.purple, color: C.white, fontWeight: 700, flexShrink: 0 }}>NEW</span>}
              </div>
              {doc.message && <div style={{ fontSize: 11, color: C.info, marginTop: 2, fontStyle: "italic" }}>"{doc.message}"</div>}
              <div style={{ fontSize: 10, color: C.text, marginTop: 2 }}>{doc.size} · {doc.category} · Received {doc.received}</div>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button style={{ padding: "5px 12px", borderRadius: 6, background: doc.viewed ? C.cream : C.purple, color: doc.viewed ? C.navy : C.white, border: "none", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                {doc.viewed ? "Open" : "View Now"}
              </button>
              <button style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, cursor: "pointer", fontSize: 12 }}>⬇</button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── TASKS SECTION ───────────────────────────────────────────────────────────────
function TasksSection() {
  const [filter, setFilter] = useState("all");
  const filters = ["all", "from coach", "my tasks", "overdue"];
  const filtered = CLIENT_TASKS.filter(t => {
    if (filter === "from coach") return t.fromCoach;
    if (filter === "my tasks") return !t.fromCoach;
    if (filter === "overdue") return t.status === "overdue";
    return true;
  });
  const pColors = { critical: C.danger, high: C.warning, medium: C.info, low: "#9ca3af" };
  return (
    <Card>
      <CardTitle action={<span style={{ fontSize: 11, color: C.text }}>{CLIENT_TASKS.filter(t => t.status !== "completed").length} active</span>}>
        Tasks & Action Items
      </CardTitle>
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", background: filter === f ? C.navy : C.cream, color: filter === f ? C.white : C.text, fontSize: 11, fontWeight: 600, textTransform: "capitalize" }}>
            {f}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.map(task => (
          <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: task.status === "overdue" ? `${C.danger}05` : C.white }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${task.status === "overdue" ? C.danger : C.border}`, flexShrink: 0 }} />
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: pColors[task.priority], flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.text}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                <span style={{ fontSize: 10, color: C.text }}>Due {task.due}</span>
                <span style={{ fontSize: 10, color: C.text, background: C.cream, padding: "0 5px", borderRadius: 3 }}>{task.category}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
              <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 6, fontWeight: 700, background: task.status === "overdue" ? `${C.danger}15` : task.status === "active" ? `${C.gold}20` : `${C.text}10`, color: task.status === "overdue" ? C.danger : task.status === "active" ? C.gold : C.text }}>
                {task.status}
              </span>
              {task.fromCoach && <span style={{ fontSize: 9, color: C.info, fontWeight: 600 }}>From Coach</span>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── GOALS SECTION ───────────────────────────────────────────────────────────────
function GoalsSection() {
  return (
    <Card>
      <CardTitle action={<span style={{ fontSize: 11, color: C.text }}>{CLIENT_GOALS.length} active goals</span>}>My Goals</CardTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {CLIENT_GOALS.map(goal => (
          <div key={goal.id} style={{ padding: 14, borderRadius: 10, border: `1px solid ${C.border}` }}>
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
            <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
              {goal.milestones.map((m, i) => (
                <span key={i} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, fontWeight: 600, background: i < goal.completed ? `${C.success}15` : C.cream, color: i < goal.completed ? C.success : C.text, textDecoration: i < goal.completed ? "line-through" : "none" }}>
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

// ─── CALENDAR SECTION ────────────────────────────────────────────────────────────
function CalendarSection() {
  const tColors = { coaching: C.gold, meeting: C.info, interview: C.purple, deadline: C.danger };
  const tIcons  = { coaching: "🎯", meeting: "💼", interview: "🤝", deadline: "⏰" };
  return (
    <Card>
      <CardTitle>Upcoming Schedule</CardTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {CLIENT_CALENDAR.map((day, di) => (
          <div key={di}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 8, paddingBottom: 4, borderBottom: `1px solid ${C.cream}` }}>{day.date}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {day.events.map((ev, ei) => (
                <div key={ei} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, borderLeft: `3px solid ${tColors[ev.type]}` }}>
                  <span style={{ fontSize: 14 }}>{tIcons[ev.type]}</span>
                  <div style={{ textAlign: "center", width: 50, flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{ev.time.split(" ")[0]}</div>
                    <div style={{ fontSize: 9, color: C.text }}>{ev.time.split(" ")[1]}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{ev.title}</div>
                    {ev.duration > 0 && <div style={{ fontSize: 10, color: C.text }}>{ev.duration} min</div>}
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

// ─── WINS SECTION ────────────────────────────────────────────────────────────────
function WinsSection() {
  return (
    <Card style={{ borderTop: `3px solid ${C.success}` }}>
      <CardTitle>Recent Wins</CardTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {CLIENT_WINS.map((w, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: 10, borderRadius: 8, background: `${C.success}06` }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{w.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, lineHeight: 1.3 }}>{w.text}</div>
              <div style={{ fontSize: 10, color: C.text, marginTop: 2 }}>{w.date}</div>
            </div>
          </div>
        ))}
      </div>
      <button style={{ width: "100%", marginTop: 12, padding: "9px", borderRadius: 8, border: `1px solid ${C.success}`, background: "transparent", color: C.success, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Log a Win</button>
    </Card>
  );
}

// ─── SESSIONS SECTION ────────────────────────────────────────────────────────────
function SessionsSection() {
  const oColors = { positive: C.success, neutral: C.gold, negative: C.danger };
  return (
    <Card>
      <CardTitle>Session History</CardTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SESSION_HISTORY.map((s, i) => (
          <div key={i} style={{ padding: 12, borderRadius: 8, border: `1px solid ${C.border}`, borderLeft: `3px solid ${oColors[s.outcome]}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
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

// ─── ALERTS SIDEBAR CARD ─────────────────────────────────────────────────────────
function AlertsCard() {
  return (
    <Card style={{ borderTop: `3px solid ${C.gold}` }}>
      <CardTitle>Alerts & Reminders</CardTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {CLIENT_ALERTS.slice(0, 5).map(a => (
          <div key={a.id} style={{ padding: 10, borderRadius: 8, background: C.cream, borderLeft: `3px solid ${alertIconBg[a.type]}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 13 }}>{a.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>{a.title}</span>
            </div>
            <div style={{ fontSize: 11, color: C.text, lineHeight: 1.3, marginBottom: 6, paddingLeft: 20 }}>{a.message}</div>
            <div style={{ paddingLeft: 20 }}>
              <button style={{ padding: "3px 10px", fontSize: 10, fontWeight: 700, background: alertIconBg[a.type], color: C.white, border: "none", borderRadius: 4, cursor: "pointer" }}>{a.actionLabel}</button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── BIG PICTURE CARD ────────────────────────────────────────────────────────────
function BigPictureCard() {
  return (
    <Card>
      <CardTitle>Business Health Overview</CardTitle>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "center" }}>
        <HealthGauge score={CLIENT_HEALTH.overall} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
          {CLIENT_HEALTH.categories.map(cat => {
            const diff = cat.score - cat.prev;
            const c = diff > 0 ? C.success : diff < 0 ? C.danger : C.text;
            return (
              <div key={cat.name} style={{ padding: 10, borderRadius: 8, background: C.cream, textAlign: "center" }}>
                <span style={{ fontSize: 18 }}>{cat.icon}</span>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, margin: "2px 0" }}>{cat.score}</div>
                <div style={{ fontSize: 9, color: C.text, marginBottom: 1 }}>{cat.name}</div>
                <span style={{ fontSize: 9, fontWeight: 700, color: c }}>{diff > 0 ? "↑" : diff < 0 ? "↓" : "→"}{Math.abs(diff)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// ─── KPI BAR ─────────────────────────────────────────────────────────────────────
function ClientKPIs() {
  const overdue = CLIENT_TASKS.filter(t => t.status === "overdue").length;
  const active = CLIENT_TASKS.filter(t => t.status !== "completed").length;
  const onTrack = CLIENT_GOALS.filter(g => g.progress >= 40).length;
  const unread = CLIENT_DOCUMENTS.filter(d => !d.viewed).length;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 18 }}>
      {[
        { icon: "📊", label: "Health Score", value: CLIENT_HEALTH.overall, sub: "/ 100" },
        { icon: "⚡", label: "Active Tasks", value: active, sub: `${overdue} overdue`, color: overdue > 0 ? C.danger : undefined },
        { icon: "🎯", label: "Goals On Track", value: `${onTrack}/${CLIENT_GOALS.length}`, sub: "active goals" },
        { icon: "📄", label: "New Docs", value: unread, sub: "from coach", color: unread > 0 ? C.purple : undefined },
        { icon: "📅", label: "Next Session", value: "Today", sub: "9:00 AM" },
        { icon: "🔥", label: "Streak", value: "8 wks", sub: "consecutive" },
      ].map((k, i) => (
        <Card key={i} style={{ padding: 14, textAlign: "center" }}>
          <span style={{ fontSize: 20 }}>{k.icon}</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: k.color || C.navy, margin: "4px 0 2px" }}>{k.value}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{k.label}</div>
          <div style={{ fontSize: 10, color: `${C.text}88` }}>{k.sub}</div>
        </Card>
      ))}
    </div>
  );
}

// ─── MESSAGE COACH MODAL ─────────────────────────────────────────────────────────
function MessageCoachModal({ isOpen, onClose }) {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  if (!isOpen) return null;
  const send = () => {
    if (!msg.trim()) return;
    setSent(true);
    setTimeout(() => { setSent(false); setMsg(""); onClose(); }, 1600);
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
      <div style={{ position: "relative", width: 460, maxWidth: "92vw", background: C.white, borderRadius: 16, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "36px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>✅</div>
            <div style={{ fontSize: 19, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display',Georgia,serif" }}>Message Sent!</div>
            <div style={{ fontSize: 13, color: C.text, marginTop: 6 }}>{CLIENT.coachName} will reply soon.</div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.navy, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{CLIENT.coachAvatar}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Message {CLIENT.coachName}</div>
                  <div style={{ fontSize: 11, color: C.text }}>Executive Coach · Usually replies within 24 hours</div>
                </div>
              </div>
              <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.text }}>✕</button>
            </div>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type your message..."
              style={{ width: "100%", minHeight: 120, padding: 12, borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy, fontFamily: "inherit", resize: "vertical", lineHeight: 1.5, marginBottom: 14 }} />
            <button onClick={send} disabled={!msg.trim()}
              style={{ width: "100%", padding: 13, borderRadius: 10, border: "none", background: msg.trim() ? C.navy : "#d1d5db", color: C.white, fontSize: 14, fontWeight: 700, cursor: msg.trim() ? "pointer" : "default" }}>
              Send Message
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── MAIN CLIENT DASHBOARD ───────────────────────────────────────────────────────
export default function ClientDashboard() {
  // ── All hooks first (Rules of Hooks) ──────────────────────────────────────
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const triggered = params.get("onboard") === "1" || params.get("newClient") === "1";
    return triggered && !localStorage.getItem("cp_onboarded");
  });
  const [tab, setTab] = useState("overview");
  const [notifOpen, setNotifOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const unreadDocs = CLIENT_DOCUMENTS.filter(d => !d.viewed).length;
  const urgentCount = CLIENT_ALERTS.filter(a => a.type === "task" || a.type === "document").length;

  const tabs = [
    { id: "overview",   label: "Overview",  icon: "📊" },
    { id: "tasks",      label: "Tasks",     icon: "⚡" },
    { id: "goals",      label: "Goals",     icon: "🎯" },
    { id: "calendar",   label: "Calendar",  icon: "📅" },
    { id: "documents",  label: "Documents", icon: "📁", badge: unreadDocs },
    { id: "sessions",   label: "Sessions",  icon: "💬" },
  ];

  const handleOnboardingComplete = async (form) => {
    try { await api.post("/onboarding", { ...form, coachId: CLIENT.coachId }); } catch (_) {}
    localStorage.setItem("cp_onboarded", "1");
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return (
      <ClientOnboarding
        coachName={CLIENT.coachName || "Your Coach"}
        clientName={CLIENT.name}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'DM Sans','Inter',system-ui,sans-serif" }}>
      {/* Header */}
      <header style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, color: C.white }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, fontFamily: "'DM Serif Display',Georgia,serif" }}>
                <span style={{ color: C.gold }}>Coach</span>Perfect
              </h1>
              <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.15)" }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Client Portal</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setNotifOpen(true)}
                style={{ position: "relative", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 9px", cursor: "pointer" }}>
                <span style={{ fontSize: 16 }}>🔔</span>
                {CLIENT_ALERTS.length > 0 && (
                  <span style={{ position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, background: C.danger, borderRadius: 9, fontSize: 10, fontWeight: 700, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", border: `2px solid ${C.navy}` }}>
                    {CLIENT_ALERTS.length}
                  </span>
                )}
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.gold, color: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{CLIENT.avatar}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{CLIENT.name}</div>
                  <div style={{ fontSize: 10, opacity: 0.6 }}>{CLIENT.company} · {CLIENT.plan}</div>
                </div>
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 2 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ position: "relative", padding: "9px 16px", borderRadius: "8px 8px 0 0", border: "none", cursor: "pointer", background: tab === t.id ? C.cream : "transparent", color: tab === t.id ? C.navy : "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, transition: "all 0.2s" }}>
                <span style={{ marginRight: 5 }}>{t.icon}</span>{t.label}
                {t.badge > 0 && (
                  <span style={{ marginLeft: 5, padding: "0 5px", borderRadius: 8, fontSize: 9, fontWeight: 700, background: C.purple, color: C.white }}>
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: 3, background: `linear-gradient(90deg,${C.gold},${C.success})` }} />
      </header>

      {/* Urgent banner */}
      {urgentCount > 0 && (
        <div style={{ background: `${C.danger}08`, borderBottom: `1px solid ${C.danger}20`, padding: "10px 0" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", gap: 10 }}>
            <span>⚠️</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.danger }}>{urgentCount} item{urgentCount > 1 ? "s" : ""} need your attention</span>
            <div style={{ flex: 1 }} />
            <button onClick={() => setNotifOpen(true)} style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${C.danger}`, background: "transparent", color: C.danger, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>View All</button>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "22px 28px" }}>
        {/* Welcome row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display',Georgia,serif" }}>
              Welcome back, {CLIENT.name.split(" ")[0]}
            </h2>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: C.text }}>
              Your coaching journey with {CLIENT.coachName} · {CLIENT.engagement} · Member since {CLIENT.memberSince}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, background: C.white, border: `1px solid ${C.border}` }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.navy, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{CLIENT.coachAvatar}</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Your Coach</div>
                <div style={{ fontSize: 10, color: C.text }}>{CLIENT.coachName}</div>
              </div>
            </div>
            <button onClick={() => setMsgOpen(true)} style={{ padding: "8px 14px", borderRadius: 8, background: C.navy, color: C.white, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>💬 Message</button>
          </div>
        </div>

        <ClientKPIs />

        {/* Tab content */}
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <BigPictureCard />
              <DocumentsSection />
              <TasksSection />
              <GoalsSection />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <AlertsCard />
              <CalendarSection />
              <WinsSection />
              <SessionsSection />
            </div>
          </div>
        )}

        {tab === "tasks" && (
          <div style={{ maxWidth: 760 }}><TasksSection /></div>
        )}

        {tab === "goals" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
            <GoalsSection />
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}><BigPictureCard /><WinsSection /></div>
          </div>
        )}

        {tab === "calendar" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
            <CalendarSection />
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}><AlertsCard /><TasksSection /></div>
          </div>
        )}

        {tab === "documents" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
            <DocumentsSection />
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}><AlertsCard /><WinsSection /></div>
          </div>
        )}

        {tab === "sessions" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
            <SessionsSection />
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Card>
                <CardTitle>Your Coach</CardTitle>
                <div style={{ textAlign: "center", padding: 14 }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", background: C.navy, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, margin: "0 auto 10px" }}>{CLIENT.coachAvatar}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{CLIENT.coachName}</div>
                  <div style={{ fontSize: 12, color: C.text, marginTop: 2 }}>Executive Coach</div>
                  <button onClick={() => setMsgOpen(true)} style={{ marginTop: 14, padding: "9px 22px", borderRadius: 8, background: C.navy, color: C.white, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>💬 Message Coach</button>
                </div>
              </Card>
              <WinsSection />
            </div>
          </div>
        )}
      </main>

      <footer style={{ marginTop: 40, padding: "16px 0", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 28px", display: "flex", justifyContent: "space-between", fontSize: 11, color: `${C.text}88` }}>
          <span>© 2026 CoachPerfect. Your coaching ecosystem.</span>
          <span>v2.1.0 · Client Portal</span>
        </div>
      </footer>

      <NotifDrawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
      <MessageCoachModal isOpen={msgOpen} onClose={() => setMsgOpen(false)} />
    </div>
  );
}
