// ═══════════════════════════════════════════════════
// COACH PERFECT — MOCK DATA
// ═══════════════════════════════════════════════════
// Replace with real API calls when backend is connected.

import {
  DollarSign, Users, CheckCircle, AlertTriangle, Target, Activity,
} from "lucide-react";

// ─── KPIs ─────────────────────────────────────────
export const kpis = [
  { name: "Revenue",        value: "$847K", change: "+12.3%", up: true,  icon: DollarSign,     target: "$900K" },
  { name: "Active Clients", value: "34",    change: "+3",     up: true,  icon: Users,          target: "40" },
  { name: "Tasks Done",     value: "127",   change: "+18%",   up: true,  icon: CheckCircle,    target: "150" },
  { name: "Health Score",   value: "7.4",   change: "+0.6",   up: true,  icon: Activity,       target: "8.0" },
  { name: "Open Items",     value: "23",    change: "-5",     up: false, icon: AlertTriangle,  target: "<15" },
  { name: "Engagement",     value: "89%",   change: "+4%",    up: true,  icon: Target,         target: "95%" },
];

// ─── REVENUE ──────────────────────────────────────
export const revenue = [
  { m: "Sep", rev: 62, tgt: 65 }, { m: "Oct", rev: 68, tgt: 70 },
  { m: "Nov", rev: 71, tgt: 72 }, { m: "Dec", rev: 74, tgt: 75 },
  { m: "Jan", rev: 79, tgt: 78 }, { m: "Feb", rev: 85, tgt: 82 },
];

// ─── DIAGNOSTICS (current + baseline) ─────────────
export const diag = [
  { cat: "Leadership",  s: 8.2, baseline: 6.5 },
  { cat: "Operations",  s: 6.1, baseline: 5.0 },
  { cat: "Finance",     s: 7.5, baseline: 5.8 },
  { cat: "People",      s: 5.8, baseline: 5.2 },
  { cat: "Sales",       s: 7.0, baseline: 6.0 },
  { cat: "Strategy",    s: 6.8, baseline: 6.1 },
  { cat: "Customer",    s: 7.3, baseline: 6.7 },
  { cat: "Technology",  s: 5.2, baseline: 3.8 },
];

// ─── TASKS ────────────────────────────────────────
export const tasks = [
  { t: "Complete Q1 financial review",     p: "high",     d: "Feb 20", s: "active",  a: "ME" },
  { t: "Update employee onboarding SOP",   p: "medium",   d: "Feb 22", s: "pending", a: "Team" },
  { t: "Schedule CEO roundtable prep",     p: "high",     d: "Feb 18", s: "active",  a: "ME" },
  { t: "Review client diagnostic results", p: "critical", d: "Feb 17", s: "pending", a: "ME" },
  { t: "Deploy marketing automation",      p: "medium",   d: "Feb 25", s: "pending", a: "Ned" },
];

// ─── RECOMMENDATIONS ──────────────────────────────
export const recs = [
  { t: "Implement Real-Time Financial Dashboard", type: "quick win",   imp: 85, eff: 40, cat: "finance" },
  { t: "Document Top 20 Core Processes",          type: "operational", imp: 70, eff: 50, cat: "operations" },
  { t: "Launch Employee Engagement Survey",       type: "quick win",   imp: 70, eff: 20, cat: "people" },
  { t: "Conduct Technology Stack Audit",          type: "quick win",   imp: 60, eff: 30, cat: "technology" },
];

// ─── PIPELINE ─────────────────────────────────────
export const pipe = [
  { stage: "Leads", v: 48 }, { stage: "Qualified", v: 32 },
  { stage: "Proposal", v: 18 }, { stage: "Closed", v: 8 },
];

// ─── SESSIONS (with no-show tracking) ─────────────
export const sessions = [
  { id: 1, client: "Chris Ciesielski",  date: "Feb 19", time: "9:00 AM",  type: "1:1",           status: "attended",    duration: 60, notes: "Discussed Q1 financial targets, progress on onboarding SOP." },
  { id: 2, client: "Delaine Henry",     date: "Feb 17", time: "11:00 AM", type: "CEO Roundtable", status: "attended",    duration: 90, notes: "Group session — leadership styles, delegation frameworks." },
  { id: 3, client: "Manville Borne",    date: "Feb 14", time: "2:00 PM",  type: "1:1",           status: "no_show",     duration: 60, notes: "" },
  { id: 4, client: "Chad Heiser",       date: "Feb 12", time: "10:00 AM", type: "Peer Group",    status: "attended",    duration: 90, notes: "Peer group: scaling challenges, hiring senior leadership." },
  { id: 5, client: "Sarah Rainwater",   date: "Feb 8",  time: "1:00 PM",  type: "RISE Program",  status: "late_cancel", duration: 60, notes: "" },
  { id: 6, client: "Chris Ciesielski",  date: "Feb 5",  time: "9:00 AM",  type: "1:1",           status: "attended",    duration: 60, notes: "Revenue milestone hit — celebrated win, set next 90-day stretch." },
];

// ─── WIN JOURNAL ──────────────────────────────────
export const initialWins = [
  { id: 1, date: "Feb 18", title: "Chris hit $847K revenue milestone",           category: "revenue",    starred: true },
  { id: 2, date: "Feb 14", title: "Closed new RISE Program cohort (5 seats)",    category: "growth",     starred: true },
  { id: 3, date: "Feb 10", title: "Chad's team NPS jumped from 42 to 61",        category: "people",     starred: false },
  { id: 4, date: "Feb 5",  title: "Delivered first CEO roundtable — great feedback", category: "delivery", starred: false },
  { id: 5, date: "Jan 28", title: "Manville closed $220K contract",              category: "client_win", starred: true },
];

// ─── GOALS ────────────────────────────────────────
export const initialGoals = [
  { id: 1, title: "Reach 40 active clients",      category: "growth",    progress: 85, target: "Q2 2026",  milestones: ["20 clients ✓", "30 clients ✓", "35 clients ✓", "40 clients"] },
  { id: 2, title: "Hit $10K MRR",                 category: "revenue",   progress: 43, target: "Q3 2026",  milestones: ["$2K ✓", "$5K ✓", "$8K", "$10K"] },
  { id: 3, title: "Launch Peer Group program",     category: "product",   progress: 70, target: "Mar 2026", milestones: ["Curriculum ✓", "5 members ✓", "Launch event", "Cohort 2"] },
  { id: 4, title: "Publish 12 LinkedIn articles",  category: "marketing", progress: 25, target: "Dec 2026", milestones: ["1 ✓", "3 ✓", "6", "12"] },
];

// ─── HABIT TRACKER ────────────────────────────────
const today = new Date();
export const last7Days = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(today);
  d.setDate(d.getDate() - (6 - i));
  return d.toLocaleDateString("en-US", { weekday: "short" });
});

export const initialHabits = [
  { id: 1, name: "Session notes logged",   streak: 12, checks: [true, true, true, true, false, true, true] },
  { id: 2, name: "Check client activity",  streak: 7,  checks: [true, true, false, true, true, true, true] },
  { id: 3, name: "LinkedIn post / engage", streak: 3,  checks: [false, false, false, true, true, false, true] },
  { id: 4, name: "Review weekly goals",    streak: 5,  checks: [true, false, true, true, false, true, true] },
];

// ─── ROI DATA ─────────────────────────────────────
export const roiClients = [
  { name: "Chris Ciesielski", revBefore: 720, revAfter: 847, fee: 18000, months: 8 },
  { name: "Chad Heiser",      revBefore: 340, revAfter: 440, fee: 12000, months: 6 },
  { name: "Manville Borne",   revBefore: 180, revAfter: 220, fee: 9000,  months: 5 },
  { name: "Delaine Henry",    revBefore: 480, revAfter: 540, fee: 9000,  months: 6 },
];
