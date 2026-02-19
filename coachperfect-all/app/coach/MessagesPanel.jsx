import { useState } from "react";
import { C, CLIENTS, MESSAGES } from "./styles.js";
import { Card } from "./components.jsx";

// ─── MESSAGES PANEL ──────────────────────────────────────────────────────────────
export function MessagesPanel() {
  const [selectedId, setSelectedId] = useState(1);
  const [draft, setDraft] = useState("");
  const [threads, setThreads] = useState(MESSAGES);

  const client = CLIENTS.find(c => c.id === selectedId);
  const msgs = threads[selectedId] || [];
  const unreadFor = (id) => (MESSAGES[id] || []).filter(m => !m.read && m.from === "client").length;
  const totalUnread = CLIENTS.reduce((s, c) => s + unreadFor(c.id), 0);

  const sendMessage = () => {
    if (!draft.trim()) return;
    const newMsg = { id: Date.now(), from: "coach", text: draft.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), date: "Today", read: true };
    setThreads(prev => ({ ...prev, [selectedId]: [...(prev[selectedId] || []), newMsg] }));
    setDraft("");
  };

  const markRead = (id) => {
    setThreads(prev => ({ ...prev, [id]: (prev[id] || []).map(m => ({ ...m, read: true })) }));
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 18, height: "calc(100vh - 220px)", minHeight: 500 }}>

      {/* ── SIDEBAR ── */}
      <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display',Georgia,serif" }}>Messages</h3>
            {totalUnread > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: C.danger, color: C.white }}>{totalUnread} new</span>
            )}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {CLIENTS.map(c => {
            const lastMsg = (threads[c.id] || []).slice(-1)[0];
            const unread = unreadFor(c.id);
            const isSelected = selectedId === c.id;
            return (
              <div key={c.id} onClick={() => { setSelectedId(c.id); markRead(c.id); }}
                style={{ display: "flex", gap: 10, padding: "12px 16px", cursor: "pointer", background: isSelected ? `${C.navy}08` : "transparent", borderLeft: `3px solid ${isSelected ? C.gold : "transparent"}`, borderBottom: `1px solid ${C.cream}`, transition: "all 0.15s" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.navy, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, position: "relative" }}>
                  {c.avatar}
                  {unread > 0 && <span style={{ position: "absolute", top: -2, right: -2, width: 12, height: 12, background: C.danger, borderRadius: "50%", border: `2px solid ${C.white}` }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{c.name.split(" ")[0]} {c.name.split(" ")[1][0]}.</span>
                    <span style={{ fontSize: 9, color: `${C.text}88` }}>{lastMsg?.date || "—"}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {lastMsg ? `${lastMsg.from === "coach" ? "You: " : ""}${lastMsg.text}` : "No messages yet"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CHAT AREA ── */}
      <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Chat header */}
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.navy, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{client?.avatar}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{client?.name}</div>
            <div style={{ fontSize: 11, color: C.text }}>{client?.company} · {client?.engagement}</div>
          </div>
          <div style={{ flex: 1 }} />
          <button style={{ padding: "6px 14px", borderRadius: 8, background: C.cream, border: `1px solid ${C.border}`, fontSize: 11, fontWeight: 600, color: C.navy, cursor: "pointer" }}>📋 Push Task</button>
          <button style={{ padding: "6px 14px", borderRadius: 8, background: C.cream, border: `1px solid ${C.border}`, fontSize: 11, fontWeight: 600, color: C.navy, cursor: "pointer" }}>📤 Send Doc</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {msgs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: `${C.text}88` }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
              <div style={{ fontSize: 13 }}>No messages with {client?.name.split(" ")[0]} yet.</div>
            </div>
          ) : msgs.map(msg => {
            const isCoach = msg.from === "coach";
            return (
              <div key={msg.id} style={{ display: "flex", justifyContent: isCoach ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "70%" }}>
                  <div style={{ padding: "10px 14px", borderRadius: isCoach ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: isCoach ? C.navy : C.cream, color: isCoach ? C.white : C.navy, fontSize: 13, lineHeight: 1.45 }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: 9, color: `${C.text}66`, marginTop: 3, textAlign: isCoach ? "right" : "left" }}>
                    {msg.time} · {msg.date}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea value={draft} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={`Message ${client?.name.split(" ")[0]}... (Enter to send)`}
            style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy, minHeight: 42, maxHeight: 100, resize: "none", fontFamily: "inherit", lineHeight: 1.4, outline: "none" }} />
          <button onClick={sendMessage} disabled={!draft.trim()}
            style={{ padding: "10px 18px", borderRadius: 10, background: draft.trim() ? C.navy : "#d1d5db", color: C.white, border: "none", fontSize: 13, fontWeight: 700, cursor: draft.trim() ? "pointer" : "default", transition: "background 0.15s", flexShrink: 0 }}>
            Send ↑
          </button>
        </div>
      </div>
    </div>
  );
}
