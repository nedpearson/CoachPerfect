// ═══════════════════════════════════════════════════
// WINS TAB — Win Journal + Habit Tracker
// ═══════════════════════════════════════════════════

import { useState } from "react";
import { Plus, CheckCircle, Flame } from "lucide-react";

import { C, winCatColors } from "./theme";
import { Card, SectionHeader, Badge } from "./ui";
import { initialWins, initialHabits, last7Days } from "./data";

export default function WinsTab() {
  const [wins, setWins] = useState(initialWins);
  const [newWin, setNewWin] = useState({ title: "", category: "revenue" });
  const [showAdd, setShowAdd] = useState(false);

  const winCategories = ["revenue", "growth", "people", "delivery", "client_win"];

  const addWin = () => {
    if (!newWin.title.trim()) return;
    setWins((prev) => [
      {
        id: Date.now(),
        date: "Today",
        title: newWin.title,
        category: newWin.category,
        starred: false,
      },
      ...prev,
    ]);
    setNewWin({ title: "", category: "revenue" });
    setShowAdd(false);
  };

  const toggleStar = (id) => {
    setWins((prev) => prev.map((w) => (w.id === id ? { ...w, starred: !w.starred } : w)));
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>
      {/* Win Journal */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Card>
          <SectionHeader
            title="Win Journal"
            sub={`${wins.length} wins logged`}
            action={
              <button
                onClick={() => setShowAdd((v) => !v)}
                style={{
                  background: C.accent,
                  color: "#fff",
                  border: "none",
                  padding: "6px 13px",
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Plus size={13} /> Log Win
              </button>
            }
          />

          {/* Add Win Form */}
          {showAdd && (
            <div style={{ marginBottom: 14, padding: 14, borderRadius: 8, background: C.surface, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  placeholder="Describe the win..."
                  value={newWin.title}
                  onChange={(e) => setNewWin((p) => ({ ...p, title: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addWin()}
                  style={{
                    flex: 1,
                    padding: "8px 11px",
                    borderRadius: 7,
                    border: `1px solid ${C.border}`,
                    fontSize: 13,
                    outline: "none",
                  }}
                />
                <select
                  value={newWin.category}
                  onChange={(e) => setNewWin((p) => ({ ...p, category: e.target.value }))}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 7,
                    border: `1px solid ${C.border}`,
                    fontSize: 12,
                    color: C.muted,
                  }}
                >
                  {winCategories.map((c) => (
                    <option key={c} value={c}>
                      {c.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                <button
                  onClick={addWin}
                  style={{
                    padding: "7px 16px",
                    background: C.success,
                    color: "#fff",
                    border: "none",
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Save Win
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  style={{
                    padding: "7px 12px",
                    background: "#fff",
                    color: C.muted,
                    border: `1px solid ${C.border}`,
                    borderRadius: 7,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Win List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {wins.map((w) => {
              const cat = winCatColors[w.category] || C.muted;
              return (
                <div
                  key={w.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                    background: w.starred ? `${C.accent}06` : "#fff",
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.primary, marginBottom: 2 }}>
                      {w.title}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 10.5, color: C.muted }}>{w.date}</span>
                      <Badge label={w.category.replace("_", " ")} color={cat} bg={`${cat}15`} />
                    </div>
                  </div>
                  <button
                    onClick={() => toggleStar(w.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 16,
                      opacity: w.starred ? 1 : 0.3,
                    }}
                  >
                    ⭐
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Habit Tracker */}
      <Card>
        <SectionHeader
          title="Habit Tracker"
          sub="Daily practice streaks"
          action={<Flame size={16} color={C.warning} />}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {initialHabits.map((h) => {
            const todayDone = h.checks[6];
            return (
              <div
                key={h.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: 9,
                  border: `1px solid ${C.border}`,
                  background: todayDone ? `${C.success}05` : "#fff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: C.primary }}>
                    {h.name}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Flame size={13} color={C.warning} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.warning }}>
                      {h.streak}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 5, justifyContent: "space-between" }}>
                  {last7Days.map((day, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          background: h.checks[i] ? C.success : `${C.muted}18`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {h.checks[i] && <CheckCircle size={13} color="#fff" />}
                      </div>
                      <span style={{ fontSize: 9, color: C.muted }}>{day}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 14,
            padding: "10px 12px",
            background: `${C.accent}08`,
            borderRadius: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 12, color: C.muted }}>Weekly average</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>
            {Math.round(
              initialHabits.reduce((a, h) => a + h.checks.filter(Boolean).length, 0) /
                initialHabits.length
            )}
            /7 days
          </span>
        </div>
      </Card>
    </div>
  );
}
