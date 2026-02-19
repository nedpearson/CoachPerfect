// ═══════════════════════════════════════════════════
// COACH PERFECT — SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════

import { C } from "./theme";

export function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 11,
        padding: 22,
        border: `1px solid ${C.border}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionHeader({ title, sub, action }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
      }}
    >
      <div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.primary }}>
          {title}
        </h3>
        {sub && (
          <p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted }}>{sub}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Badge({ label, color, bg }) {
  return (
    <span
      style={{
        fontSize: 10,
        padding: "2px 8px",
        borderRadius: 9,
        background: bg,
        color,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
}

export function ProgressBar({ value, color = C.primary, height = 6 }) {
  return (
    <div
      style={{
        background: `${color}18`,
        borderRadius: 99,
        overflow: "hidden",
        height,
      }}
    >
      <div
        style={{
          width: `${Math.min(100, value)}%`,
          height: "100%",
          background: color,
          borderRadius: 99,
          transition: "width 0.5s ease",
        }}
      />
    </div>
  );
}
