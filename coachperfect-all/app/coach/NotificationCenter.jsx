import { useState } from "react";
import { C, BUSINESS_ALERTS, PERSONAL_ALERTS } from "./styles.js";
import { Card, CardTitle } from "./components.jsx";

// ─── EXTENDED NOTIFICATION DATA ───────────────────────────────────────────────
const ALL_NOTIFS = [
  ...BUSINESS_ALERTS.map(a => ({ ...a, mode: "business", read: false })),
  ...PERSONAL_ALERTS.map(a => ({ ...a, mode: "personal", read: false })),
  { id: 101, type: "document", icon: "📄", title: "Client Uploaded a File",        message: "Chris Ciesielski uploaded 'Q3 Financials.xlsx'. Review and file it in the vault.", time: "2h ago",   mode: "business", read: false, actionLabel: "View Document" },
  { id: 102, type: "ai",       icon: "🤖", title: "AI Agent Needs Review",         message: "Session Prep Agent completed a brief for Chris C. Review before approving send.", time: "3h ago",   mode: "business", read: true,  actionLabel: "Review Now" },
  { id: 103, type: "message",  icon: "💬", title: "New Message from Client",       message: "Chris Ciesielski: 'Should I bring the P&L or just the summary for Thursday?'",   time: "5h ago",   mode: "business", read: false, actionLabel: "Reply" },
  { id: 104, type: "billing",  icon: "💳", title: "Subscription Renewed",          message: "Your Professional plan renewed successfully. Next billing date: March 19.",       time: "1d ago",   mode: "business", read: true,  actionLabel: "View Receipt" },
  { id: 105, type: "at-risk",  icon: "🚨", title: "At-Risk Client Flagged",        message: "Sarah Rainwater: 34 days since last session, 4 overdue tasks, declining BHS.",   time: "4h ago",   mode: "business", read: false, actionLabel: "Contact Sarah" },
  { id: 106, type: "system",   icon: "⚙️", title: "New Feature Available",         message: "Exit Readiness Module is now available. Unlock for your Business-tier clients.", time: "2d ago",   mode: "business", read: true,  actionLabel: "Learn More" },
];

const TYPE_COLORS = {
  coaching: "#3b82f6", task: "#ef4444", reminder: "#c9a84c", document: "#8b5cf6",
  milestone: "#10b981", diagnostic: "#8b5cf6", message: "#1e3a5f", ai: "#10b981",
  billing: "#f59e0b", "at-risk": "#ef4444", system: "#6b7280",
};

const TYPE_FILTERS = ["all", "document", "task", "message", "ai", "at-risk", "billing", "system"];

export function NotificationCenter() {
  const [notifs, setNotifs] = useState(ALL_NOTIFS);
  const [typeFilter, setTypeFilter] = useState("all");
  const [showRead, setShowRead] = useState(false);

  const markRead = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id) => setNotifs(prev => prev.filter(n => n.id !== id));

  const filtered = notifs.filter(n => {
    if (typeFilter !== "all" && n.type !== typeFilter) return false;
    if (!showRead && n.read) return false;
    return true;
  });

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { icon: "🔔", label: "Total",    value: notifs.length,                          color: C.navy },
          { icon: "🔴", label: "Unread",   value: unread,                                  color: "#ef4444" },
          { icon: "🚨", label: "At-Risk",  value: notifs.filter(n => n.type === "at-risk").length, color: "#ef4444" },
          { icon: "🤖", label: "AI Items", value: notifs.filter(n => n.type === "ai").length,      color: "#10b981" },
        ].map((s, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: "14px 18px" }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: "4px 0 2px" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.text }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Card>
        {/* Header + controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display',Georgia,serif" }}>
            Notification Center {unread > 0 && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "#ef4444", color: "#fff", marginLeft: 6 }}>{unread} new</span>}
          </h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.text, cursor: "pointer" }}>
              <input type="checkbox" checked={showRead} onChange={e => setShowRead(e.target.checked)} />
              Show read
            </label>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ padding: "5px 12px", borderRadius: 6, background: C.cream, border: `1px solid ${C.border}`, fontSize: 11, fontWeight: 600, color: C.text, cursor: "pointer" }}>
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Type filter chips */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {TYPE_FILTERS.map(f => (
            <button key={f} onClick={() => setTypeFilter(f)}
              style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: typeFilter === f ? C.navy : C.cream, color: typeFilter === f ? C.white : C.text, fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
              {f}
            </button>
          ))}
        </div>

        {/* Notifications list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: C.text }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 13 }}>{showRead ? "No notifications." : "All caught up! Toggle 'Show read' to see past items."}</div>
            </div>
          )}
          {filtered.map(n => (
            <div key={n.id} style={{ padding: "12px 14px", borderRadius: 10, background: n.read ? C.cream : C.white, border: `1px solid ${n.read ? C.border : TYPE_COLORS[n.type] || C.border}`, borderLeft: `4px solid ${TYPE_COLORS[n.type] || C.border}`, transition: "all 0.15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ display: "flex", gap: 10, flex: 1 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{n.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{n.title}</span>
                      {!n.read && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />}
                      <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 4, background: `${TYPE_COLORS[n.type] || C.border}18`, color: TYPE_COLORS[n.type] || C.text, fontWeight: 600, textTransform: "uppercase" }}>{n.type}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.text, lineHeight: 1.4, marginBottom: 8 }}>{n.message}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button style={{ padding: "4px 12px", borderRadius: 6, background: TYPE_COLORS[n.type] || C.navy, color: "#fff", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{n.actionLabel}</button>
                      {!n.read && <button onClick={() => markRead(n.id)} style={{ padding: "4px 10px", borderRadius: 6, background: "transparent", border: `1px solid ${C.border}`, fontSize: 10, color: C.text, cursor: "pointer" }}>Mark read</button>}
                      <button onClick={() => dismiss(n.id)} style={{ padding: "4px 10px", borderRadius: 6, background: "transparent", border: `1px solid ${C.border}`, fontSize: 10, color: C.text, cursor: "pointer" }}>Dismiss</button>
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 10, color: `${C.text}88`, flexShrink: 0 }}>{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
