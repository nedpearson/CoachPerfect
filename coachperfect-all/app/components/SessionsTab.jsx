// ═══════════════════════════════════════════════════
// SESSIONS TAB — real API data + AI prep brief
// ═══════════════════════════════════════════════════

import { useState } from "react";
import { Plus, Zap, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";

import { C } from "./theme";
import { Card, SectionHeader, Badge } from "./ui";
import { useApi, Spinner, Empty, ApiError } from "../lib/useApi";
import api from "../lib/api";

const STATUS_COLORS = {
  attended:    C.success,
  no_show:     C.danger,
  late_cancel: C.warning,
  scheduled:   C.primary,
  confirmed:   C.accent,
};

const STATUS_ICONS = {
  attended:    <CheckCircle size={13} />,
  no_show:     <XCircle size={13} />,
  late_cancel: <Clock size={13} />,
  scheduled:   <Clock size={13} />,
};

function StatBox({ label, value, color }) {
  return (
    <div style={{ flex: 1, textAlign: "center", padding: "14px 10px", borderRadius: 10, border: `1px solid ${C.border}`, background: "#fff" }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || C.primary, letterSpacing: -0.5 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function SessionsTab() {
  const { data, loading, error, refresh } = useApi(() => api.getSessions());
  const { data: clientsData } = useApi(() => api.getClients());

  const [filter,     setFilter]     = useState("all");
  const [showAdd,    setShowAdd]    = useState(false);
  const [brief,      setBrief]      = useState({});       // { sessionId: { loading, data, error } }
  const [expanded,   setExpanded]   = useState({});       // expanded session rows
  const [form,       setForm]       = useState({ clientId: "", scheduledAt: "", durationMin: 60, sessionType: "coaching", notes: "" });
  const [saving,     setSaving]     = useState(false);
  const [statusSaving, setStatusSaving] = useState({});

  const sessions = data?.sessions || [];
  const clients  = clientsData?.clients || [];

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}><Spinner size={30} /></div>;
  if (error)   return <ApiError message={error} onRetry={refresh} />;

  // Stats
  const total      = sessions.length;
  const attended   = sessions.filter(s => s.status === "attended").length;
  const noShows    = sessions.filter(s => s.status === "no_show").length;
  const lateCancels= sessions.filter(s => s.status === "late_cancel").length;
  const attendRate = total > 0 ? Math.round(((attended) / total) * 100) : 100;

  const filtered = filter === "all" ? sessions : sessions.filter(s => s.status === filter);

  // Add session
  const addSession = async () => {
    if (!form.scheduledAt) return;
    setSaving(true);
    try {
      await api.createSession({
        clientId:    form.clientId || null,
        scheduledAt: form.scheduledAt,
        durationMin: parseInt(form.durationMin) || 60,
        sessionType: form.sessionType,
        notes:       form.notes || null,
      });
      setForm({ clientId: "", scheduledAt: "", durationMin: 60, sessionType: "coaching", notes: "" });
      setShowAdd(false);
      refresh();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  // Update session status
  const updateStatus = async (sessionId, newStatus) => {
    setStatusSaving(p => ({ ...p, [sessionId]: true }));
    try {
      await api.updateSession(sessionId, { status: newStatus });
      refresh();
    } catch (e) { alert(e.message); }
    finally { setStatusSaving(p => ({ ...p, [sessionId]: false })); }
  };

  // Generate AI prep brief
  const generateBrief = async (sessionId) => {
    setBrief(p => ({ ...p, [sessionId]: { loading: true, data: null, error: null } }));
    try {
      const result = await api.getPrepBrief(sessionId);
      setBrief(p => ({ ...p, [sessionId]: { loading: false, data: result.brief, error: null } }));
    } catch (e) {
      setBrief(p => ({ ...p, [sessionId]: { loading: false, data: null, error: e.message } }));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── STATS ── */}
      <Card>
        <SectionHeader
          title="Session Stats"
          sub={`${total} sessions total`}
          action={
            <button
              onClick={() => setShowAdd(v => !v)}
              style={{ background: C.primary, color: "#fff", border: "none", padding: "6px 13px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
            >
              <Plus size={13} /> Schedule Session
            </button>
          }
        />
        <div style={{ display: "flex", gap: 12 }}>
          <StatBox label="Attendance Rate"  value={`${attendRate}%`}   color={attendRate >= 85 ? C.success : C.warning} />
          <StatBox label="Attended"         value={attended}           color={C.success} />
          <StatBox label="No-Shows"         value={noShows}            color={C.danger} />
          <StatBox label="Late Cancels"     value={lateCancels}        color={C.warning} />
          <StatBox label="Total Sessions"   value={total}              color={C.primary} />
        </div>

        {/* Add Session Form */}
        {showAdd && (
          <div style={{ marginTop: 16, padding: 16, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: C.primary, marginBottom: 4 }}>Client</label>
                <select value={form.clientId} onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 12.5 }}>
                  <option value="">No client (personal)</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: C.primary, marginBottom: 4 }}>Date & Time *</label>
                <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 12.5 }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: C.primary, marginBottom: 4 }}>Type</label>
                <select value={form.sessionType} onChange={e => setForm(p => ({ ...p, sessionType: e.target.value }))}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 12.5 }}>
                  {["coaching", "strategy", "accountability", "review", "intake"].map(t =>
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: C.primary, marginBottom: 4 }}>Duration (min)</label>
                <input type="number" value={form.durationMin} onChange={e => setForm(p => ({ ...p, durationMin: e.target.value }))}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 12.5 }} />
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: C.primary, marginBottom: 4 }}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2}
                placeholder="Agenda or pre-session notes..."
                style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 12.5, resize: "vertical", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addSession} disabled={saving || !form.scheduledAt}
                style={{ padding: "7px 18px", background: saving ? C.muted : C.success, color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Saving…" : "Save Session"}
              </button>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: "7px 14px", background: "#fff", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 12, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* ── SESSION LOG ── */}
      <Card>
        <SectionHeader title="Session Log" sub={`${filtered.length} sessions`} action={
          <div style={{ display: "flex", gap: 4 }}>
            {["all", "scheduled", "attended", "no_show", "late_cancel"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: "4px 10px", borderRadius: 6, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer",
                  background: filter === f ? C.primary : `${C.muted}15`, color: filter === f ? "#fff" : C.muted }}>
                {f.replace("_", " ")}
              </button>
            ))}
          </div>
        } />

        {filtered.length === 0 ? (
          <Empty icon="📅" message="No sessions" sub={filter === "all" ? "Schedule your first session above" : `No ${filter.replace("_"," ")} sessions`} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 80px 90px 1fr 120px", gap: 8, padding: "6px 10px", borderBottom: `1px solid ${C.border}` }}>
              {["Date & Time", "Client", "Type", "Status", "Notes", "Actions"].map(h => (
                <div key={h} style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</div>
              ))}
            </div>

            {filtered.map(s => {
              const d    = new Date(s.scheduled_at);
              const bst  = brief[s.id];
              const exp  = expanded[s.id];
              const statusColor = STATUS_COLORS[s.status] || C.muted;

              return (
                <div key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 80px 90px 1fr 120px", gap: 8, padding: "10px 10px", alignItems: "center" }}>
                    {/* Date */}
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: C.primary }}>{d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} · {s.duration_min}m</div>
                    </div>
                    {/* Client */}
                    <div style={{ fontSize: 12.5, color: C.primary, fontWeight: s.client_name ? 600 : 400 }}>{s.client_name || <span style={{ color: C.muted, fontStyle: "italic" }}>No client</span>}</div>
                    {/* Type */}
                    <div style={{ fontSize: 11.5, color: C.muted, textTransform: "capitalize" }}>{s.session_type}</div>
                    {/* Status */}
                    <div>
                      <select value={s.status} disabled={statusSaving[s.id]}
                        onChange={e => updateStatus(s.id, e.target.value)}
                        style={{ fontSize: 11, padding: "3px 6px", borderRadius: 5, border: `1px solid ${statusColor}`, color: statusColor, background: `${statusColor}10`, cursor: "pointer", fontWeight: 600 }}>
                        {["scheduled", "confirmed", "attended", "no_show", "late_cancel"].map(st => (
                          <option key={st} value={st}>{st.replace("_"," ")}</option>
                        ))}
                      </select>
                    </div>
                    {/* Notes */}
                    <div style={{ fontSize: 11.5, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.notes || "—"}</div>
                    {/* Actions */}
                    <div style={{ display: "flex", gap: 5 }}>
                      <button
                        onClick={() => { generateBrief(s.id); setExpanded(p => ({ ...p, [s.id]: true })); }}
                        disabled={bst?.loading}
                        title="Generate AI Prep Brief"
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", fontSize: 11, fontWeight: 600, borderRadius: 6, border: "none", background: `${C.accent}15`, color: C.accent, cursor: bst?.loading ? "not-allowed" : "pointer" }}>
                        <Zap size={11} /> {bst?.loading ? "…" : "Brief"}
                      </button>
                      <button onClick={() => setExpanded(p => ({ ...p, [s.id]: !p[s.id] }))}
                        style={{ padding: "4px 8px", background: "none", border: `1px solid ${C.border}`, borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center" }}>
                        {exp ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {exp && (
                    <div style={{ padding: "0 10px 14px", background: `${C.surface}` }}>
                      {bst?.loading && <div style={{ padding: 12, textAlign: "center" }}><Spinner size={18} /><p style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>Generating AI prep brief…</p></div>}
                      {bst?.error && <div style={{ padding: "10px 12px", background: "#fff0f0", borderRadius: 8, color: C.danger, fontSize: 12 }}>⚠ {bst.error}</div>}
                      {bst?.data && (
                        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                            <Zap size={14} color={C.accent} /> AI Session Prep Brief
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Opening Questions</div>
                              {(bst.data.openingQuestions || []).map((q, i) => (
                                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12.5, color: C.primary }}>
                                  <span style={{ fontWeight: 700, color: C.accent, flexShrink: 0 }}>{i+1}.</span> {q}
                                </div>
                              ))}
                            </div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Probe Areas</div>
                              {(bst.data.probeAreas || []).map((a, i) => (
                                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12.5, color: C.primary }}>
                                  <span style={{ color: C.success, flexShrink: 0 }}>▸</span> {a}
                                </div>
                              ))}
                            </div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Session Focus</div>
                              <p style={{ margin: 0, fontSize: 12.5, color: C.primary, lineHeight: 1.5 }}>{bst.data.sessionFocus}</p>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Accountability Check</div>
                              <p style={{ margin: 0, fontSize: 12.5, color: C.primary, lineHeight: 1.5 }}>{bst.data.accountabilityCheck}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {!bst && (
                        <div style={{ padding: "10px 0" }}>
                          {s.session_summary && (
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", marginBottom: 4 }}>Session Summary</div>
                              <p style={{ margin: 0, fontSize: 12.5, color: C.primary }}>{s.session_summary}</p>
                            </div>
                          )}
                          {s.follow_up_actions && (
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", marginBottom: 4 }}>Follow-up Actions</div>
                              <p style={{ margin: 0, fontSize: 12.5, color: C.primary }}>{s.follow_up_actions}</p>
                            </div>
                          )}
                          {!s.session_summary && !s.follow_up_actions && (
                            <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>Click "Brief" to generate an AI-powered prep brief for this session.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
