import { useState } from "react";
import { C, CLIENTS } from "./styles.js";
import { Card, CardTitle } from "./components.jsx";

// ─── MOCK AUDIT DATA ──────────────────────────────────────────────────────────
const MOCK_AUDIT = [
  { id: 1,  actor: "Meredith Eicher", role: "coach", action: "UPLOAD_DOC",       resource: "document", label: "Q4 Business Review.pdf",             client: "Chris Ciesielski", time: "Today 3:14 PM",    icon: "📤" },
  { id: 2,  actor: "Meredith Eicher", role: "coach", action: "PUSH_DOC",         resource: "document", label: "CEO Roundtable Prep Guide.pdf",        client: "Delaine Calder",  time: "Today 2:01 PM",    icon: "📩" },
  { id: 3,  actor: "Meredith Eicher", role: "coach", action: "CREATE_TASK",      resource: "task",     label: "Complete leadership self-assessment",   client: "Chris Ciesielski", time: "Today 1:45 PM",    icon: "📋" },
  { id: 4,  actor: "System (AI)",     role: "ai",    action: "RUN_AGENT",        resource: "ai_agent", label: "At-Risk Detection flagged Sarah R.",    client: "Sarah Rainwater", time: "Today 10:22 AM",   icon: "🤖" },
  { id: 5,  actor: "Chris Ciesielski",role: "client",action: "UPLOAD_DOC",       resource: "document", label: "Q3 Financials (client upload).xlsx",    client: "Chris Ciesielski", time: "Yesterday 4:12 PM", icon: "⬆" },
  { id: 6,  actor: "Meredith Eicher", role: "coach", action: "SEND_REMINDER",    resource: "client",   label: "Don't forget Q4 review before session", client: "Chris Ciesielski", time: "Yesterday 2:30 PM", icon: "🔔" },
  { id: 7,  actor: "System (AI)",     role: "ai",    action: "RUN_AGENT",        resource: "ai_agent", label: "Session Prep Brief generated — Chris C.", client: "Chris Ciesielski", time: "Feb 17 9:00 AM",   icon: "🧠" },
  { id: 8,  actor: "Meredith Eicher", role: "coach", action: "ACTIVATE_ADDON",   resource: "addon",    label: "Business Health Certificate activated",  client: null,              time: "Feb 16 3:00 PM",   icon: "🏆" },
  { id: 9,  actor: "Meredith Eicher", role: "coach", action: "CREATE_CLIENT",    resource: "client",   label: "James Patterson — NFP",                  client: null,              time: "Feb 15 11:00 AM",  icon: "👤" },
  { id: 10, actor: "Delaine Calder",  role: "client",action: "DOWNLOAD_DOC",     resource: "document", label: "CEO Roundtable Prep Guide.pdf",          client: "Delaine Calder",  time: "Feb 15 10:15 AM",  icon: "⬇" },
  { id: 11, actor: "Meredith Eicher", role: "coach", action: "LOGIN",            resource: "auth",     label: "Coach portal login",                     client: null,              time: "Feb 14 8:02 AM",   icon: "🔐" },
  { id: 12, actor: "System (AI)",     role: "ai",    action: "AI_APPROVE",       resource: "ai_agent", label: "Progress Report approved — Chad Heiser",  client: "Chad Heiser",     time: "Feb 13 2:00 PM",   icon: "✅" },
];

const ACTION_COLORS = {
  UPLOAD_DOC: "#3b82f6", PUSH_DOC: "#8b5cf6", CREATE_TASK: "#f59e0b",
  SEND_REMINDER: "#c9a84c", RUN_AGENT: "#10b981", AI_APPROVE: "#10b981",
  ACTIVATE_ADDON: "#ec4899", CREATE_CLIENT: "#1e3a5f", LOGIN: "#6b7280",
  DOWNLOAD_DOC: "#3b82f6", DELETE_DOC: "#ef4444", DELETE_CLIENT: "#ef4444",
};

const ROLE_COLORS = { coach: "#1e3a5f", client: "#3b82f6", ai: "#10b981", system: "#8b5cf6" };

export function AuditLog() {
  const [filter, setFilter] = useState("all"); // all | coach | client | ai
  const [resourceFilter, setResourceFilter] = useState("all");
  const [search, setSearch] = useState("");

  const resources = ["all", ...new Set(MOCK_AUDIT.map(a => a.resource))];
  const filtered = MOCK_AUDIT.filter(a => {
    if (filter !== "all" && a.role !== filter) return false;
    if (resourceFilter !== "all" && a.resource !== resourceFilter) return false;
    if (search && !a.label.toLowerCase().includes(search.toLowerCase()) && !(a.client || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { icon: "📋", label: "Total Events", value: MOCK_AUDIT.length, color: "#1e3a5f" },
          { icon: "🤖", label: "AI Actions",   value: MOCK_AUDIT.filter(a => a.role === "ai").length,     color: "#10b981" },
          { icon: "👤", label: "Client Actions", value: MOCK_AUDIT.filter(a => a.role === "client").length, color: "#3b82f6" },
          { icon: "📤", label: "Doc Events",   value: MOCK_AUDIT.filter(a => a.resource === "document").length, color: "#8b5cf6" },
        ].map((s, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: "14px 18px" }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: "4px 0 2px" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.text }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Card>
        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..."
            style={{ flex: 1, minWidth: 160, padding: "7px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, color: C.navy, outline: "none" }} />

          <div style={{ display: "flex", gap: 6 }}>
            {["all", "coach", "client", "ai"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: filter === f ? C.navy : C.cream, color: filter === f ? C.white : C.text, fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
                {f}
              </button>
            ))}
          </div>

          <select value={resourceFilter} onChange={e => setResourceFilter(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 11, color: C.navy, background: C.white }}>
            {resources.map(r => <option key={r} value={r}>{r === "all" ? "All Resources" : r}</option>)}
          </select>
        </div>

        {/* Event list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map(event => (
            <div key={event.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, background: C.cream, borderLeft: `3px solid ${ACTION_COLORS[event.action] || C.border}` }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{event.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 4, background: `${ROLE_COLORS[event.role]}15`, color: ROLE_COLORS[event.role] }}>{event.actor}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: ACTION_COLORS[event.action] || C.text }}>{event.action.replace(/_/g, " ")}</span>
                </div>
                <div style={{ fontSize: 12, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.label}</div>
                {event.client && <div style={{ fontSize: 10, color: C.text }}>Client: {event.client}</div>}
              </div>
              <div style={{ fontSize: 10, color: `${C.text}88`, flexShrink: 0, textAlign: "right" }}>{event.time}</div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: C.text }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 13 }}>No events match your filters.</div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
