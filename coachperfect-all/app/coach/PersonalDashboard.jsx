import { C, PERSONAL_ALERTS, PERSONAL_TASKS, PERSONAL_SCHEDULE, PERSONAL_GOALS, alertTypeColors } from "./styles.js";
import { Card, CardTitle, KPICard, PriorityDot, ProgressBar } from "./components.jsx";

export function PersonalDashboard() {
  return (
    <>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 18 }}>
        <KPICard icon="🧘" label="Meditation Streak" value="26 days" subtext="Best: 34 days" trend={15} />
        <KPICard icon="💪" label="Workouts / Week" value="3 / 4" subtext="On track" trend={0} />
        <KPICard icon="📚" label="Books Read" value="3 / 12" subtext="This year" trend={25} />
        <KPICard icon="🍽️" label="Family Dinners" value="3 / 5" subtext="This week" trend={-10} />
        <KPICard icon="😊" label="Wellbeing Score" value="8.2" subtext="Out of 10" trend={5} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Personal tasks */}
          <Card>
            <CardTitle action={<button style={{ padding: "6px 14px", borderRadius: 7, background: C.gold, color: C.navy, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ Add Task</button>}>
              My Personal Tasks
            </CardTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {PERSONAL_TASKS.map(task => (
                <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, cursor: "pointer" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${C.border}`, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{task.text}</div>
                    <div style={{ fontSize: 10, color: C.text, marginTop: 1 }}>Due {task.due}</div>
                  </div>
                  <PriorityDot priority={task.priority} />
                </div>
              ))}
            </div>
          </Card>

          {/* Goals */}
          <Card>
            <CardTitle>Personal Goals</CardTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {PERSONAL_GOALS.map((goal, i) => (
                <div key={i} style={{ padding: 14, borderRadius: 10, background: C.cream, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 22 }}>{goal.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{goal.progress}%</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, marginBottom: 6 }}>{goal.name}</div>
                  <ProgressBar percent={goal.progress} color={goal.progress >= 75 ? C.success : goal.progress >= 50 ? C.gold : C.warning} />
                  <div style={{ fontSize: 10, color: C.text, marginTop: 4 }}>{goal.current}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Weekly reflection */}
          <Card>
            <CardTitle>Weekly Reflection</CardTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[{ label: "Energy", value: 7, emoji: "⚡" }, { label: "Stress", value: 4, emoji: "🌊" }, { label: "Fulfillment", value: 8, emoji: "✨" }].map((item, i) => (
                <div key={i} style={{ textAlign: "center", padding: 14, background: C.cream, borderRadius: 10 }}>
                  <div style={{ fontSize: 24 }}>{item.emoji}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: "4px 0" }}>{item.value}/10</div>
                  <div style={{ fontSize: 11, color: C.text }}>{item.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Personal alerts */}
          <Card style={{ borderTop: `3px solid ${C.info}` }}>
            <CardTitle>Personal Alerts</CardTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PERSONAL_ALERTS.map(a => (
                <div key={a.id} style={{ padding: 10, borderRadius: 8, background: C.cream, borderLeft: `3px solid ${alertTypeColors[a.type]}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: alertTypeColors[a.type] }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: C.text, margin: "3px 0 6px", lineHeight: 1.3 }}>{a.message}</div>
                  <button style={{ padding: "3px 10px", fontSize: 10, fontWeight: 700, background: alertTypeColors[a.type], color: C.white, border: "none", borderRadius: 4, cursor: "pointer" }}>{a.actionLabel}</button>
                </div>
              ))}
            </div>
          </Card>

          {/* Personal schedule */}
          <Card>
            <CardTitle>Today's Schedule</CardTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PERSONAL_SCHEDULE.map((s, i) => {
                const tc = { wellness: C.success, social: C.info, family: "#ec4899", personal: C.gold };
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}` }}>
                    <div style={{ width: 46, flexShrink: 0, textAlign: "center" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{s.time.split(" ")[0]}</div>
                      <div style={{ fontSize: 9, color: C.text }}>{s.time.split(" ")[1]}</div>
                    </div>
                    <div style={{ width: 2, height: 28, background: tc[s.type] || C.border, borderRadius: 1 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{s.title}</div>
                      <div style={{ fontSize: 10, color: C.text }}>{s.subtitle} · {s.duration}min</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Habit streaks */}
          <Card>
            <CardTitle>Habit Streaks</CardTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { name: "Meditation", streak: 26, icon: "🧘", color: C.success },
                { name: "Exercise", streak: 12, icon: "💪", color: C.info },
                { name: "Reading", streak: 8, icon: "📖", color: C.gold },
                { name: "Journaling", streak: 15, icon: "✍️", color: "#8b5cf6" },
              ].map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{h.icon}</span>
                  <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: C.navy }}>{h.name}</div>
                  <span style={{ fontSize: 14 }}>🔥</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: h.color }}>{h.streak}d</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
