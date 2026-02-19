// ═══════════════════════════════════════════════════
// WINS TAB — Win Journal + Habit Tracker (live API)
// ═══════════════════════════════════════════════════

import { useState } from "react";
import { Plus, CheckCircle, Flame } from "lucide-react";

import { C, winCatColors } from "./theme";
import { Card, SectionHeader, Badge } from "./ui";
import { useApi, Spinner, Empty, ApiError } from "../lib/useApi";
import api from "../lib/api";

const WIN_CATEGORIES = ["revenue", "growth", "people", "delivery", "client_win"];

// Last 7 calendar days — computed once per render
function getLast7() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      label: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][d.getDay()],
      iso: d.toISOString().slice(0, 10),
    };
  });
}

export default function WinsTab() {
  const {
    data: winsData, loading: winsLoading, error: winsError, refresh: refreshWins,
  } = useApi(() => api.getWins());
  const {
    data: habitsData, loading: habitsLoading, refresh: refreshHabits,
  } = useApi(() => api.getHabits());

  const [newWin, setNewWin]   = useState({ title: "", category: "revenue" });
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving]   = useState(false);

  const wins   = winsData?.wins   || [];
  const habits = habitsData?.habits || [];
  const last7  = getLast7();
  const todayIso = new Date().toISOString().slice(0, 10);

  const addWin = async () => {
    if (!newWin.title.trim() || saving) return;
    setSaving(true);
    try {
      await api.createWin(newWin);
      setNewWin({ title: "", category: "revenue" });
      setShowAdd(false);
      refreshWins();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStar = async (win) => {
    try {
      await api.updateWin(win.id, { starred: !win.starred });
      refreshWins();
    } catch {}
  };

  const toggleHabitToday = async (habit) => {
    try {
      await api.checkHabit(habit.id, todayIso);
      refreshHabits();
    } catch {}
  };

  // Weekly average: checks within the last 7 days per habit
  const weeklyAvg = habits.length
    ? Math.round(
        habits.reduce((sum, h) => {
          const checks = h.checks || [];
          const thisWeek = last7.filter(({ iso }) => checks.includes(iso)).length;
          return sum + thisWeek;
        }, 0) / habits.length,
      )
    : 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>
      {/* ── Win Journal ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Card>
          <SectionHeader
            title="Win Journal"
            sub={winsLoading ? "Loading…" : `${wins.length} win${wins.length !== 1 ? "s" : ""} logged`}
            action={
              <button
                onClick={() => setShowAdd((v) => !v)}
                style={{ background: C.accent, color: "#fff", border: "none", padding: "6px 13px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              >
                <Plus size={13} /> Log Win
              </button>
            }
          />

          {/* Add Form */}
          {showAdd && (
            <div style={{ marginBottom: 14, padding: 14, borderRadius: 8, background: C.surface, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  placeholder="Describe the win…"
                  value={newWin.title}
                  onChange={(e) => setNewWin((p) => ({ ...p, title: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addWin()}
                  style={{ flex: 1, padding: "8px 11px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 13, outline: "none" }}
                />
                <select
                  value={newWin.category}
                  onChange={(e) => setNewWin((p) => ({ ...p, category: e.target.value }))}
                  style={{ padding: "8px 10px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 12, color: C.muted }}
                >
                  {WIN_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                <button
                  onClick={addWin}
                  disabled={saving}
                  style={{ padding: "7px 16px", background: C.success, color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.6 : 1 }}
                >
                  {saving ? "Saving…" : "Save Win"}
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

          {/* Win List */}
          {winsLoading ? (
            <div style={{ textAlign: "center", padding: 32 }}><Spinner /></div>
          ) : winsError ? (
            <ApiError message={winsError.message} onRetry={refreshWins} />
          ) : wins.length === 0 ? (
            <Empty icon="🏆" message="No wins yet" sub="Log your first win to start building your journal." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {wins.map((w) => {
                const cat = winCatColors[w.category] || C.muted;
                return (
                  <div
                    key={w.id}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: w.starred ? `${C.accent}06` : "#fff" }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.primary, marginBottom: 2 }}>{w.title}</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 10.5, color: C.muted }}>
                          {new Date(w.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <Badge label={w.category.replace("_", " ")} color={cat} bg={`${cat}15`} />
                      </div>
                    </div>
                    <button
                      onClick={() => toggleStar(w)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, opacity: w.starred ? 1 : 0.3 }}
                    >
                      ⭐
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── Habit Tracker ── */}
      <Card>
        <SectionHeader
          title="Habit Tracker"
          sub="Daily practice streaks"
          action={<Flame size={16} color={C.warning} />}
        />

        {habitsLoading ? (
          <div style={{ textAlign: "center", padding: 32 }}><Spinner /></div>
        ) : habits.length === 0 ? (
          <Empty icon="🔥" message="No habits tracked" sub="Ask your admin to add habits via the Settings module." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {habits.map((h) => {
              const checks   = h.checks || [];
              const todayDone = checks.includes(todayIso);
              const streak    = h.streak ?? checks.length;

              return (
                <div
                  key={h.id}
                  style={{ padding: "12px 14px", borderRadius: 9, border: `1px solid ${C.border}`, background: todayDone ? `${C.success}05` : "#fff" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: C.primary }}>{h.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Flame size={13} color={C.warning} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.warning }}>{streak}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 5, justifyContent: "space-between" }}>
                    {last7.map(({ label, iso }) => {
                      const done    = checks.includes(iso);
                      const isToday = iso === todayIso;
                      return (
                        <div key={iso} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                          <div
                            onClick={() => isToday && toggleHabitToday(h)}
                            title={isToday ? (done ? "Mark incomplete" : "Mark complete") : undefined}
                            style={{
                              width: 26, height: 26, borderRadius: 6,
                              background: done ? C.success : `${C.muted}18`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              cursor: isToday ? "pointer" : "default",
                              outline: isToday ? `2px solid ${C.accent}50` : "none",
                              outlineOffset: 1,
                            }}
                          >
                            {done && <CheckCircle size={13} color="#fff" />}
                          </div>
                          <span style={{ fontSize: 9, color: C.muted }}>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {habits.length > 0 && (
          <div style={{ marginTop: 14, padding: "10px 12px", background: `${C.accent}08`, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: C.muted }}>Weekly average</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>{weeklyAvg}/7 days</span>
          </div>
        )}
      </Card>
    </div>
  );
}
