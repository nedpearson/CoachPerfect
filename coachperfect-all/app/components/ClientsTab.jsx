// ═══════════════════════════════════════════════════
// CLIENTS TAB — Full Client Management UI (live API)
// ═══════════════════════════════════════════════════

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, X, Check } from "lucide-react";

import { C } from "./theme";
import { Card, SectionHeader, Badge } from "./ui";
import { useApi, Spinner, Empty, ApiError } from "../lib/useApi";
import api from "../lib/api";

const STATUS_OPTIONS = ["active", "paused", "completed", "prospect"];

const STATUS_STYLE = {
  active:    { color: C.success,  bg: `${C.success}15`  },
  paused:    { color: C.warning,  bg: `${C.warning}15`  },
  completed: { color: C.muted,    bg: `${C.muted}12`    },
  prospect:  { color: C.primary,  bg: `${C.primary}12`  },
};

const EMPTY_FORM = {
  name: "", email: "", phone: "", industry: "", notes: "", monthly_fee: "", status: "active",
};

// ── Shared input style helper ──
const inp = {
  padding: "8px 11px",
  borderRadius: 7,
  border: `1px solid ${C.border}`,
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

export default function ClientsTab() {
  const { data, loading, error, refresh } = useApi(() => api.getClients());

  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const clients  = data?.clients || [];

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || c.name.toLowerCase().includes(q)
      || (c.email || "").toLowerCase().includes(q)
      || (c.industry || "").toLowerCase().includes(q);
    const matchFilter = filter === "all" || c.status === filter;
    return matchSearch && matchFilter;
  });

  // ── Summary counts ──
  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = clients.filter((c) => c.status === s).length;
    return acc;
  }, {});
  const totalMRR = clients
    .filter((c) => c.status === "active")
    .reduce((s, c) => s + (c.monthly_fee || 0), 0);

  // ── Form helpers ──
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (c) => {
    setForm({
      name: c.name, email: c.email || "", phone: c.phone || "",
      industry: c.industry || "", notes: c.notes || "",
      monthly_fee: c.monthly_fee ?? "", status: c.status,
    });
    setEditId(c.id);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditId(null);
  };

  const saveClient = async () => {
    if (!form.name.trim() || saving) return;
    setSaving(true);
    try {
      const payload = { ...form, monthly_fee: form.monthly_fee !== "" ? Number(form.monthly_fee) : 0 };
      if (editId) {
        await api.updateClient(editId, payload);
      } else {
        await api.createClient(payload);
      }
      cancelForm();
      refresh();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (id) => {
    try {
      await api.deleteClient(id);
      setDeleteId(null);
      refresh();
    } catch (e) {
      alert(e.message);
    }
  };

  const f = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Summary Strip ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
        {[
          { label: "Total",      value: clients.length,               color: C.primary  },
          { label: "Active",     value: counts.active    ?? 0,        color: C.success  },
          { label: "Prospects",  value: counts.prospect  ?? 0,        color: C.accent   },
          { label: "Paused",     value: counts.paused    ?? 0,        color: C.warning  },
          { label: "MRR",        value: `$${totalMRR.toLocaleString()}`, color: C.success },
        ].map((s) => (
          <Card key={s.label} style={{ textAlign: "center", padding: "14px 10px" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: -1 }}>{s.value}</div>
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* ── Main Card ── */}
      <Card>
        <SectionHeader
          title="Client Roster"
          sub={`${filtered.length} of ${clients.length} client${clients.length !== 1 ? "s" : ""}`}
          action={
            <button
              onClick={openAdd}
              style={{ background: C.primary, color: "#fff", border: "none", padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
            >
              <Plus size={13} /> Add Client
            </button>
          }
        />

        {/* ── Search + Filter Bar ── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.muted, pointerEvents: "none" }} />
            <input
              placeholder="Search by name, email, or industry…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inp, paddingLeft: 30, fontSize: 12 }}
            />
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["all", ...STATUS_OPTIONS].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: "7px 12px",
                  borderRadius: 7,
                  border: `1px solid ${filter === s ? C.primary : C.border}`,
                  background: filter === s ? C.primary : "#fff",
                  color: filter === s ? "#fff" : C.muted,
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Add / Edit Form ── */}
        {showForm && (
          <div style={{ marginBottom: 16, padding: 16, borderRadius: 9, background: C.surface, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 12 }}>
              {editId ? "Edit Client" : "New Client"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
              <input placeholder="Full name *" value={form.name}       onChange={f("name")}       style={inp} />
              <input placeholder="Email"       value={form.email}      onChange={f("email")}      style={inp} type="email" />
              <input placeholder="Phone"       value={form.phone}      onChange={f("phone")}      style={inp} type="tel" />
              <input placeholder="Industry"    value={form.industry}   onChange={f("industry")}   style={inp} />
              <input placeholder="Monthly fee ($)" value={form.monthly_fee} onChange={f("monthly_fee")} style={inp} type="number" min="0" />
              <select value={form.status} onChange={f("status")} style={{ ...inp, color: C.primary }}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Notes…"
              value={form.notes}
              onChange={f("notes")}
              rows={2}
              style={{ ...inp, resize: "vertical", marginBottom: 10, fontFamily: "inherit" }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={saveClient}
                disabled={saving}
                style={{ padding: "7px 18px", background: C.success, color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.6 : 1, display: "flex", alignItems: "center", gap: 5 }}
              >
                <Check size={13} /> {saving ? "Saving…" : editId ? "Save Changes" : "Add Client"}
              </button>
              <button
                onClick={cancelForm}
                style={{ padding: "7px 14px", background: "#fff", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
              >
                <X size={13} /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Table ── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}><Spinner size={32} /></div>
        ) : error ? (
          <ApiError message={error.message} onRetry={refresh} />
        ) : filtered.length === 0 ? (
          <Empty
            icon="👤"
            message={clients.length === 0 ? "No clients yet" : "No results found"}
            sub={clients.length === 0 ? "Click 'Add Client' to get started." : "Try adjusting your search or filter."}
          />
        ) : (
          <div>
            {/* Table Header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.8fr 1fr 1.1fr 1fr 88px", gap: 10, padding: "8px 10px", background: C.surface, borderRadius: 7, marginBottom: 4 }}>
              {["Name", "Contact", "Industry", "Monthly Fee", "Status", "Actions"].map((h) => (
                <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</span>
              ))}
            </div>

            {/* Rows */}
            {filtered.map((c) => {
              const st        = STATUS_STYLE[c.status] || STATUS_STYLE.prospect;
              const isDeleting = deleteId === c.id;
              return (
                <div
                  key={c.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1.8fr 1fr 1.1fr 1fr 88px",
                    gap: 10,
                    padding: "11px 10px",
                    borderBottom: `1px solid ${C.border}`,
                    alignItems: "center",
                  }}
                >
                  {/* Name + notes */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.primary }}>{c.name}</div>
                    {c.notes && (
                      <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
                        {c.notes}
                      </div>
                    )}
                  </div>

                  {/* Contact */}
                  <div>
                    {c.email && <div style={{ fontSize: 11.5, color: C.muted }}>{c.email}</div>}
                    {c.phone && <div style={{ fontSize: 11, color: C.muted }}>{c.phone}</div>}
                    {!c.email && !c.phone && <span style={{ fontSize: 11, color: C.muted }}>—</span>}
                  </div>

                  {/* Industry */}
                  <div style={{ fontSize: 12, color: C.muted }}>{c.industry || "—"}</div>

                  {/* Fee */}
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: (c.monthly_fee || 0) > 0 ? C.success : C.muted }}>
                    {(c.monthly_fee || 0) > 0 ? `$${c.monthly_fee.toLocaleString()}/mo` : "—"}
                  </div>

                  {/* Status */}
                  <Badge label={c.status} color={st.color} bg={st.bg} />

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 5 }}>
                    {isDeleting ? (
                      <>
                        <button
                          onClick={() => confirmDelete(c.id)}
                          style={{ padding: "4px 9px", background: C.danger, color: "#fff", border: "none", borderRadius: 5, fontSize: 11, cursor: "pointer", fontWeight: 600 }}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          style={{ padding: "4px 8px", background: "#fff", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 5, fontSize: 11, cursor: "pointer" }}
                        >
                          No
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => openEdit(c)}
                          title="Edit client"
                          style={{ padding: 5, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center" }}
                        >
                          <Edit2 size={12} color={C.muted} />
                        </button>
                        <button
                          onClick={() => setDeleteId(c.id)}
                          title="Delete client"
                          style={{ padding: 5, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center" }}
                        >
                          <Trash2 size={12} color={C.danger} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
