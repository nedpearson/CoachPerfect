// ═══════════════════════════════════════════════════
// COACH PERFECT — SHARED THEME CONSTANTS
// ═══════════════════════════════════════════════════

export const C = {
  primary: "#1B2A4A",
  accent: "#D4A853",
  success: "#2D8659",
  warning: "#C17A28",
  danger: "#B04040",
  surface: "#F7F5F0",
  muted: "#6B7280",
  border: "#E5E2DB",
};

export const pColors = {
  critical: C.danger,
  high: C.warning,
  medium: C.primary,
  low: C.muted,
};

export const pipeColors = ["#5B7BA5", "#1B2A4A", "#D4A853", "#2D8659"];

export const winCatColors = {
  revenue: C.success,
  growth: C.primary,
  people: "#7B5EA7",
  delivery: C.accent,
  client_win: C.warning,
};

export const goalCatColors = {
  growth: C.success,
  revenue: C.warning,
  product: C.primary,
  marketing: "#7B5EA7",
};

export const statusBadge = {
  attended:    { label: "Attended",    bg: `${C.success}15`, color: C.success },
  no_show:     { label: "No-Show",     bg: `${C.danger}15`,  color: C.danger },
  late_cancel: { label: "Late Cancel", bg: `${C.warning}18`, color: C.warning },
  rescheduled: { label: "Rescheduled", bg: `${C.muted}18`,   color: C.muted },
};
