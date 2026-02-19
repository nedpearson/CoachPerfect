import { C, priorityColors, healthColors, alertTypeColors } from "./styles.js";

// ─── TOGGLE SWITCH ───────────────────────────────────────────────────────────────
export function ToggleSwitch({ isOn, onToggle, leftLabel, rightLabel }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: !isOn ? C.white : "rgba(255,255,255,0.45)", transition: "color 0.2s" }}>{leftLabel}</span>
      <button onClick={onToggle} style={{ width: 52, height: 28, borderRadius: 14, border: "2px solid rgba(255,255,255,0.3)", background: isOn ? C.gold : "rgba(255,255,255,0.15)", position: "relative", cursor: "pointer", transition: "all 0.3s ease" }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.white, position: "absolute", top: 2, left: isOn ? 26 : 4, transition: "left 0.3s ease", boxShadow: "0 1px 4px rgba(0,0,0,0.25)" }} />
      </button>
      <span style={{ fontSize: 12, fontWeight: 600, color: isOn ? C.gold : "rgba(255,255,255,0.45)", transition: "color 0.2s" }}>{rightLabel}</span>
    </div>
  );
}

// ─── ALERT BADGE ─────────────────────────────────────────────────────────────────
export function AlertBadge({ count, borderColor }) {
  if (!count) return null;
  return (
    <span style={{ position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, background: C.danger, borderRadius: 9, fontSize: 10, fontWeight: 700, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", border: `2px solid ${borderColor || C.navy}` }}>
      {count}
    </span>
  );
}

// ─── HEALTH DOT ──────────────────────────────────────────────────────────────────
export function HealthDot({ health }) {
  return <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: healthColors[health] }} />;
}

// ─── PRIORITY DOT ────────────────────────────────────────────────────────────────
export function PriorityDot({ priority }) {
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: priorityColors[priority], flexShrink: 0 }} />;
}

// ─── CARD ────────────────────────────────────────────────────────────────────────
export function Card({ children, style }) {
  return (
    <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: 22, ...style }}>
      {children}
    </div>
  );
}

// ─── CARD TITLE ──────────────────────────────────────────────────────────────────
export function CardTitle({ children, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display', Georgia, serif" }}>{children}</h3>
      {action}
    </div>
  );
}

// ─── KPI CARD ────────────────────────────────────────────────────────────────────
export function KPICard({ icon, label, value, subtext, trend }) {
  const trendColor = trend > 0 ? C.success : trend < 0 ? C.danger : "#9ca3af";
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        {trend !== undefined && (
          <span style={{ fontSize: 11, fontWeight: 700, color: trendColor }}>
            {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: C.navy, letterSpacing: -0.5 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginTop: 3 }}>{label}</div>
      {subtext && <div style={{ fontSize: 11, color: `${C.text}99`, marginTop: 2 }}>{subtext}</div>}
    </Card>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────────
export function ProgressBar({ percent, color, height = 6 }) {
  return (
    <div style={{ width: "100%", height, background: C.cream, borderRadius: height / 2, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(percent, 100)}%`, height: "100%", background: color || C.gold, borderRadius: height / 2, transition: "width 0.5s ease" }} />
    </div>
  );
}

// ─── DIAGNOSTIC BAR ──────────────────────────────────────────────────────────────
export function DiagnosticBar({ name, avg, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <div style={{ width: 82, fontSize: 11, fontWeight: 600, color: C.text, textAlign: "right" }}>{name}</div>
      <div style={{ flex: 1, height: 20, background: C.cream, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ width: `${avg}%`, height: "100%", background: color, borderRadius: 10, transition: "width 0.7s ease", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: C.white }}>{avg}%</span>
        </div>
      </div>
    </div>
  );
}

// ─── FILE TYPE ICON ───────────────────────────────────────────────────────────────
export function FileIcon({ type }) {
  const icons = { pdf: "📄", spreadsheet: "📊", document: "📝", presentation: "📽️", image: "🖼️", video: "🎥" };
  const colors = { pdf: C.danger, spreadsheet: C.success, document: C.info, presentation: C.warning, image: C.purple, video: C.pink };
  return (
    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${colors[type] || C.text}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
      {icons[type] || "📎"}
    </div>
  );
}

// ─── NOTIFICATION DRAWER ────────────────────────────────────────────────────────
export function NotificationDrawer({ alerts, isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
      <div style={{ position: "relative", width: 400, maxWidth: "90vw", background: C.white, height: "100%", boxShadow: "-4px 0 24px rgba(0,0,0,0.12)", overflowY: "auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display', Georgia, serif" }}>Notifications</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.text }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {alerts.map(alert => (
            <div key={alert.id} style={{ padding: 14, borderRadius: 10, border: `1px solid ${C.border}`, borderLeft: `4px solid ${alertTypeColors[alert.type]}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: alertTypeColors[alert.type] }}>{alert.title}</span>
                <span style={{ fontSize: 10, color: `${C.text}88` }}>{alert.time}</span>
              </div>
              <p style={{ margin: "4px 0 10px", fontSize: 13, color: C.text, lineHeight: 1.4 }}>{alert.message}</p>
              <button style={{ padding: "5px 14px", fontSize: 11, fontWeight: 700, background: alertTypeColors[alert.type], color: C.white, border: "none", borderRadius: 6, cursor: "pointer" }}>{alert.actionLabel}</button>
            </div>
          ))}
          {alerts.length === 0 && <p style={{ textAlign: "center", color: `${C.text}88`, fontSize: 13, padding: 40 }}>All clear!</p>}
        </div>
      </div>
    </div>
  );
}
