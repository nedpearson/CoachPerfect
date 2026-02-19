// ═══════════════════════════════════════════════════
// GOALS TAB — Goal Tracker + ROI Calculator (live API)
// ═══════════════════════════════════════════════════

import { useState } from "react";
import { Plus } from "lucide-react";

import { C, goalCatColors } from "./theme";
import { Card, SectionHeader, Badge, ProgressBar } from "./ui";
import { useApi, Spinner, Empty, ApiError } from "../lib/useApi";
import api from "../lib/api";

const GOAL_CATEGORIES = ["growth", "revenue", "product", "marketing"];

export default function GoalsTab() {
  const {
    data: goalsData, loading: goalsLoading, error: goalsError, refresh: refreshGoals,
  } = useApi(() => api.getGoals());
  const {
    data: clientsData, loading: clientsLoading,
  } = useApi(() => api.getClients());

  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", category: "growth", target_value: "", target_date: "" });
  const [saving, setSaving]   = useState(false);

  const goals   = goalsData?.goals   || [];
  const clients = clientsData?.clients || [];

  // Only active clients with a fee set contribute to ROI
  const payingClients = clients.filter((c) => c.status === "active" && (c.monthly_fee || 0) > 0);
  const totalMRR      = payingClients.reduce((s, c) => s + (c.monthly_fee || 0), 0);
  const avgFee        = payingClients.length ? Math.round(totalMRR / payingClients.length) : 0;

  const pct = (g) => {
    if (!g.target_value || Number(g.target_value) === 0) return 0;
    return Math.min(100, Math.round((Number(g.current_value) / Number(g.target_value)) * 100));
  };

  const addGoal = async () => {
    if (!newGoal.title.trim() || saving) return;
    setSaving(true);
    try {
      await api.createGoal({
        ...newGoal,
        target_value: newGoal.target_value ? Number(newGoal.target_value) : null,
        target_date:  newGoal.target_date  || null,
      });
      setNewGoal({ title: "", category: "growth", target_value: "", target_date: "" });
      setShowAdd(false);
      refreshGoals();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Goal Tracker ── */}
      <Card>
        <SectionHeader
          title="Goal Tracker"
          sub="Your coaching business goals"
          action={
            <button
              onClick={() => setShowAdd((v) => !v)}
              style={{ background: C.primary, color: "#fff", border: "none", padding: "6px 13px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
            >
              <Plus size={13} /> Add Goal
            </button>
          }
        />

        {/* Add Form */}
        {showAdd && (
          <div style={{ marginBottom: 16, padding: 14, borderRadius: 8, background: C.surface, border: `1px solid ${C.border}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
              <input
                placeholder="Goal title…"
                value={newGoal.title}
                onChange={(e) => setNewGoal((p) => ({ ...p, title: e.target.value }))}
                style={{ padding: "8px 11px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 13, outline: "none" }}
              />
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal((p) => ({ ...p, category: e.target.value }))}
                style={{ padding: "8px 10px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 12 }}
              >
                {GOAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                type="number"
                placeholder="Target value"
                value={newGoal.target_value}
                onChange={(e) => setNewGoal((p) => ({ ...p, target_value: e.target.value }))}
                style={{ padding: "8px 11px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 13, outline: "none" }}
              />
              <input
                type="date"
                value={newGoal.target_date}
                onChange={(e) => setNewGoal((p) => ({ ...p, target_date: e.target.value }))}
                style={{ padding: "8px 11px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 13, outline: "none" }}
              />
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <button
                onClick={addGoal}
                disabled={saving}
                style={{ padding: "7px 16px", background: C.success, color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.6 : 1 }}
              >
                {saving ? "Saving…" : "Save Goal"}
              </button>
              <button
                onClick={() => setShowAdd(false)}
                style={{ padding: "7px 12px", background: "#fff", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 12, cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {goalsLoading ? (
          <div style={{ textAlign: "center", padding: 32 }}><Spinner /></div>
        ) : goalsError ? (
          <ApiError message={goalsError.message} onRetry={refreshGoals} />
        ) : goals.length === 0 ? (
          <Empty icon="🎯" message="No goals set" sub="Add your first coaching business goal to start tracking progress." />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {goals.map((g) => {
              const catColor     = goalCatColors[g.category] || C.muted;
              const progress     = pct(g);
              const progressColor = progress >= 75 ? C.success : progress >= 40 ? C.warning : C.danger;
              return (
                <div key={g.id} style={{ padding: 16, borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.primary, marginBottom: 3 }}>{g.title}</div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <Badge label={g.category} color={catColor} bg={`${catColor}18`} />
                        {g.target_date && (
                          <span style={{ fontSize: 10.5, color: C.muted }}>
                            By {new Date(g.target_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: progressColor, letterSpacing: -0.5 }}>{progress}%</div>
                      {g.target_value && (
                        <div style={{ fontSize: 10, color: C.muted }}>
                          {Number(g.current_value).toLocaleString()} / {Number(g.target_value).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <ProgressBar value={progress} color={progressColor} height={7} />
                  <div style={{ marginTop: 8 }}>
                    <Badge
                      label={g.status === "achieved" ? "✓ Achieved" : g.status === "paused" ? "Paused" : "Active"}
                      color={g.status === "achieved" ? C.success : g.status === "paused" ? C.muted : C.primary}
                      bg={g.status === "achieved" ? `${C.success}15` : g.status === "paused" ? `${C.muted}12` : `${C.primary}12`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ── ROI Dashboard ── */}
      <Card>
        <SectionHeader
          title="Coaching ROI Dashboard"
          sub="Active client revenue overview"
          action={
            payingClients.length > 0 && (
              <div style={{ background: `${C.success}15`, color: C.success, padding: "5px 14px", borderRadius: 20, fontSize: 13, fontWeight: 800 }}>
                ${totalMRR.toLocaleString()}/mo MRR
              </div>
            )
          }
        />

        {clientsLoading ? (
          <div style={{ textAlign: "center", padding: 24 }}><Spinner /></div>
        ) : payingClients.length === 0 ? (
          <Empty
            icon="💰"
            message="No active paying clients"
            sub="Add clients with monthly fees in the Clients tab to see ROI metrics here."
          />
        ) : (
          <>
            {/* KPI Strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 16 }}>
              {[
                { label: "Monthly Recurring Revenue", value: `$${totalMRR.toLocaleString()}`,      color: C.success },
                { label: "Active Paying Clients",     value: payingClients.length,                color: C.primary },
                { label: "Average Fee / Client",      value: `$${avgFee.toLocaleString()}/mo`,    color: C.accent  },
              ].map((m) => (
                <div key={m.label} style={{ padding: 14, borderRadius: 9, background: C.surface, border: `1px solid ${C.border}`, textAlign: "center" }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: m.color, letterSpacing: -0.5 }}>{m.value}</div>
                  <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Client Table */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Client", "Industry", "Start Date", "Monthly Fee", "Status"].map((h) => (
                    <th key={h} style={{ textAlign: "left", fontSize: 10.5, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, paddingBottom: 10, paddingRight: 12 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payingClients.map((c) => (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "10px 12px 10px 0", fontSize: 12.5, fontWeight: 600, color: C.primary }}>{c.name}</td>
                    <td style={{ padding: "10px 12px 10px 0", fontSize: 12, color: C.muted }}>{c.industry || "—"}</td>
                    <td style={{ padding: "10px 12px 10px 0", fontSize: 12, color: C.muted }}>
                      {c.coaching_start_date
                        ? new Date(c.coaching_start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                        : "—"}
                    </td>
                    <td style={{ padding: "10px 12px 10px 0", fontSize: 12, fontWeight: 700, color: C.success }}>
                      ${(c.monthly_fee || 0).toLocaleString()}/mo
                    </td>
                    <td style={{ padding: "10px 0 10px 0" }}>
                      <Badge label={c.status} color={C.success} bg={`${C.success}15`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Card>
    </div>
  );
}
