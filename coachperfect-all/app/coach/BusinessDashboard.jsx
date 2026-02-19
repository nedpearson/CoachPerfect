import { useState } from "react";
import {
  C, CLIENTS, BUSINESS_ALERTS, BUSINESS_TASKS,
  BUSINESS_SCHEDULE, ACTIVITY_FEED, DIAGNOSTIC_CATEGORIES, alertTypeColors
} from "./styles.js";
import {
  Card, CardTitle, KPICard, DiagnosticBar,
  HealthDot, PriorityDot, ProgressBar
} from "./components.jsx";

// ─── CLIENT DETAIL PANEL ────────────────────────────────────────────────────────
function ClientDetailPanel({ client, onClose, onPushTask, onSendReminder, onUploadDoc, onPushDoc }) {
  if (!client) return null;
  const completion = Math.round((client.tasksCompleted / client.totalTasks) * 100);
  const hColor = client.health === "green" ? C.success : client.health === "yellow" ? C.warning : C.danger;
  return (
    <Card style={{ borderLeft: `4px solid ${hColor}`, marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.navy, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>{client.avatar}</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.navy }}>{client.name}</div>
            <div style={{ fontSize: 12, color: C.text }}>{client.company} · {client.engagement} · <span style={{ color: C.gold, fontWeight: 600 }}>{client.subscription}</span></div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: C.text }}>✕</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, margin: "16px 0" }}>
        {[
          { label: "Health Score", value: client.diagnosticScore, color: client.diagnosticScore >= 70 ? C.success : client.diagnosticScore >= 50 ? C.warning : C.danger },
          { label: "Tasks Done", value: `${completion}%`, color: C.navy },
          { label: "Goal Progress", value: `${client.goalProgress}%`, color: C.gold },
          { label: "Overdue", value: client.overdueTasks, color: client.overdueTasks > 0 ? C.danger : C.success },
          { label: "MRR", value: `$${client.mrr}`, color: C.success },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center", padding: 10, background: C.cream, borderRadius: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: C.text }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: C.text, marginBottom: 3 }}>Task Completion</div>
          <ProgressBar percent={completion} color={completion >= 70 ? C.success : completion >= 50 ? C.warning : C.danger} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: C.text, marginBottom: 3 }}>Goal Progress</div>
          <ProgressBar percent={client.goalProgress} color={C.gold} />
        </div>
      </div>
      <div style={{ fontSize: 11, color: C.text, marginBottom: 14 }}>
        Last: <b style={{ color: C.navy }}>{client.lastSession}</b> &nbsp;·&nbsp; Next: <b style={{ color: C.navy }}>{client.nextSession}</b>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { label: "📋 Push Task", fn: () => onPushTask(client), bg: C.navy, color: C.white },
          { label: "🔔 Reminder", fn: () => onSendReminder(client), bg: C.gold, color: C.navy },
          { label: "⬆ Upload Doc", fn: () => onUploadDoc(client), bg: C.cream, color: C.navy },
          { label: "📤 Push Doc", fn: () => onPushDoc(client), bg: C.cream, color: C.navy },
        ].map((b, i) => (
          <button key={i} onClick={b.fn} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: b.bg, color: b.color, border: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{b.label}</button>
        ))}
      </div>
    </Card>
  );
}

// ─── BUSINESS DASHBOARD ──────────────────────────────────────────────────────────
export function BusinessDashboard({ onPushTask, onSendReminder, onUploadDoc, onPushDoc, onNewClient }) {
  const [selectedClientId, setSelectedClientId] = useState(null);
  const client = CLIENTS.find(c => c.id === selectedClientId);
  const activeClients = CLIENTS.filter(c => c.status === "active").length;
  const atRisk = CLIENTS.filter(c => c.health === "red").length;
  const totalOverdue = CLIENTS.reduce((s, c) => s + c.overdueTasks, 0);
  const totalMRR = CLIENTS.reduce((s, c) => s + c.mrr, 0);
  const planColors = { Starter: C.info, Professional: C.gold, Business: C.success };

  return (
    <>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 18 }}>
        <KPICard icon="👥" label="Active Clients" value={activeClients} subtext={`${atRisk} at risk`} trend={12} />
        <KPICard icon="📅" label="Sessions Today" value={BUSINESS_SCHEDULE.filter(s => s.type === "session").length} subtext="3 coaching · 2 admin" trend={8} />
        <KPICard icon="⚡" label="Overdue Items" value={totalOverdue} subtext="across all clients" trend={-15} />
        <KPICard icon="💰" label="MRR" value={`$${totalMRR.toLocaleString()}`} subtext="+$189 add-ons" trend={18} />
        <KPICard icon="🎯" label="Avg Health Score" value="66" subtext="out of 100" trend={5} />
      </div>

      {client && (
        <ClientDetailPanel client={client} onClose={() => setSelectedClientId(null)}
          onPushTask={onPushTask} onSendReminder={onSendReminder}
          onUploadDoc={onUploadDoc} onPushDoc={onPushDoc} />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Portfolio table */}
          <Card>
            <CardTitle action={
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => onPushTask(null)} style={{ padding: "6px 12px", borderRadius: 7, background: C.navy, color: C.white, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>📋 Push Task</button>
                <button onClick={onNewClient} style={{ padding: "6px 12px", borderRadius: 7, background: C.gold, color: C.navy, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ Add Client</button>
              </div>
            }>Client Portfolio</CardTitle>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                    {["Client","Plan","Health","Score","Tasks","Goals","Next","Actions"].map(h => (
                      <th key={h} style={{ textAlign: h === "Client" ? "left" : "center", fontSize: 10, fontWeight: 700, color: C.text, textTransform: "uppercase", padding: "8px 6px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CLIENTS.map(c => {
                    const comp = Math.round((c.tasksCompleted / c.totalTasks) * 100);
                    return (
                      <tr key={c.id} onClick={() => setSelectedClientId(selectedClientId === c.id ? null : c.id)}
                        style={{ borderBottom: `1px solid ${C.cream}`, cursor: "pointer", background: selectedClientId === c.id ? C.cream : "transparent", transition: "background 0.15s" }}>
                        <td style={{ padding: "9px 6px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.navy, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{c.avatar}</div>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{c.name}</div>
                              <div style={{ fontSize: 10, color: C.text }}>{c.company}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: "center", padding: "9px 6px" }}>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 8, background: `${planColors[c.subscription]}18`, color: planColors[c.subscription] }}>{c.subscription}</span>
                        </td>
                        <td style={{ textAlign: "center", padding: "9px 6px" }}><HealthDot health={c.health} /></td>
                        <td style={{ textAlign: "center", padding: "9px 6px" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: c.diagnosticScore >= 70 ? C.success : c.diagnosticScore >= 50 ? C.warning : C.danger }}>{c.diagnosticScore}</span>
                        </td>
                        <td style={{ textAlign: "center", padding: "9px 6px" }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>{comp}%</div>
                          {c.overdueTasks > 0 && <div style={{ fontSize: 9, color: C.danger, fontWeight: 700 }}>{c.overdueTasks} late</div>}
                        </td>
                        <td style={{ textAlign: "center", padding: "9px 6px" }}>
                          <div style={{ width: 44, margin: "0 auto 2px" }}><ProgressBar percent={c.goalProgress} color={C.gold} height={4} /></div>
                          <div style={{ fontSize: 9, color: C.text }}>{c.goalProgress}%</div>
                        </td>
                        <td style={{ textAlign: "center", fontSize: 11, color: C.text, padding: "9px 6px" }}>{c.nextSession}</td>
                        <td style={{ textAlign: "center", padding: "9px 6px" }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: 3, justifyContent: "center" }}>
                            <button onClick={() => onPushTask(c)} title="Push Task" style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${C.border}`, background: C.white, cursor: "pointer", fontSize: 11 }}>📋</button>
                            <button onClick={() => onSendReminder(c)} title="Reminder" style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${C.border}`, background: C.white, cursor: "pointer", fontSize: 11 }}>🔔</button>
                            <button onClick={() => onUploadDoc(c)} title="Upload Doc" style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${C.border}`, background: C.white, cursor: "pointer", fontSize: 11 }}>📁</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Diagnostics */}
          <Card>
            <CardTitle>Average Client Diagnostics</CardTitle>
            {DIAGNOSTIC_CATEGORIES.map(cat => <DiagnosticBar key={cat.name} {...cat} />)}
          </Card>

          {/* Tasks */}
          <Card>
            <CardTitle action={<button style={{ padding: "5px 12px", borderRadius: 7, background: C.gold, color: C.navy, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ New</button>}>
              My Tasks
            </CardTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {BUSINESS_TASKS.map(task => (
                <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: task.status === "overdue" ? `${C.danger}05` : C.white }}>
                  <PriorityDot priority={task.priority} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.text}</div>
                    <div style={{ fontSize: 10, color: C.text }}>{task.assignee} · Due {task.due}</div>
                  </div>
                  <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 8, fontWeight: 600, background: task.status === "overdue" ? `${C.danger}15` : task.status === "active" ? `${C.gold}20` : `${C.text}10`, color: task.status === "overdue" ? C.danger : task.status === "active" ? C.gold : C.text }}>{task.status}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Alerts */}
          <Card style={{ borderTop: `3px solid ${C.danger}` }}>
            <CardTitle>Alerts</CardTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {BUSINESS_ALERTS.slice(0, 5).map(a => (
                <div key={a.id} style={{ padding: 10, borderRadius: 8, background: C.cream, borderLeft: `3px solid ${alertTypeColors[a.type]}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: alertTypeColors[a.type] }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: C.text, margin: "3px 0 6px", lineHeight: 1.3 }}>{a.message}</div>
                  <button style={{ padding: "3px 10px", fontSize: 10, fontWeight: 700, background: alertTypeColors[a.type], color: C.white, border: "none", borderRadius: 4, cursor: "pointer" }}>{a.actionLabel}</button>
                </div>
              ))}
            </div>
          </Card>

          {/* Schedule */}
          <Card>
            <CardTitle>Today's Schedule</CardTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {BUSINESS_SCHEDULE.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}` }}>
                  <div style={{ width: 46, flexShrink: 0, textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{s.time.split(" ")[0]}</div>
                    <div style={{ fontSize: 9, color: C.text }}>{s.time.split(" ")[1]}</div>
                  </div>
                  <div style={{ width: 2, height: 28, background: s.type === "session" ? C.gold : C.border, borderRadius: 1 }} />
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
                <div key={i} style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{a.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: C.text, lineHeight: 1.3 }}>{a.text}</div>
                    <div style={{ fontSize: 10, color: `${C.text}66`, marginTop: 1 }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick actions */}
          <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, borderRadius: 14, padding: 20, color: C.white }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, fontFamily: "'DM Serif Display', Georgia, serif" }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                { icon: "📋", label: "Push Task to Client", fn: () => onPushTask(null) },
                { icon: "🔔", label: "Send Reminder", fn: () => onSendReminder(null) },
                { icon: "⬆", label: "Upload Document", fn: () => onUploadDoc(null) },
                { icon: "📤", label: "Push Document", fn: () => onPushDoc(null) },
                { icon: "👤", label: "Add New Client", fn: onNewClient },
              ].map((a, i) => (
                <button key={i} onClick={a.fn} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "none", color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                  <span>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
