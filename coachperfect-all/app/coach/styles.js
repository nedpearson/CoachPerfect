// ─── STYLE CONSTANTS & MOCK DATA ────────────────────────────────────────────────

export const C = {
  navy: "#1e3a5f",
  navyLight: "#2d5a8e",
  gold: "#c9a84c",
  cream: "#f4f1ea",
  border: "#e0dcd4",
  text: "#4a5568",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  purple: "#8b5cf6",
  pink: "#ec4899",
  cyan: "#06b6d4",
  white: "#ffffff",
};

export const priorityColors = { critical: C.danger, high: C.warning, medium: C.info, low: "#9ca3af" };
export const healthColors = { green: C.success, yellow: C.warning, red: C.danger };
export const alertTypeColors = { danger: C.danger, warning: C.warning, info: C.info, success: C.success };

export const LANDING_PAGE_URL = "/public/index.html";

export const COACH = { name: "Meredith Eicher", role: "Executive Coach", initials: "ME", email: "meredith@coachperfect.com" };

export const CLIENTS = [
  { id: 1, name: "Chris Ciesielski", company: "NFP", status: "active", health: "green", lastSession: "Feb 12", nextSession: "Feb 19", diagnosticScore: 74, overdueTasks: 0, engagement: "1:1 Coaching", tasksCompleted: 12, totalTasks: 14, goalProgress: 78, avatar: "CC", subscription: "Professional", mrr: 500 },
  { id: 2, name: "Delaine Henry", company: "Advanced Hospice Mgmt", status: "active", health: "green", lastSession: "Feb 10", nextSession: "Feb 24", diagnosticScore: 68, overdueTasks: 1, engagement: "CEO Roundtable", tasksCompleted: 8, totalTasks: 11, goalProgress: 65, avatar: "DH", subscription: "Business", mrr: 750 },
  { id: 3, name: "Manville Borne", company: "Borne Industries", status: "active", health: "yellow", lastSession: "Jan 28", nextSession: "Feb 20", diagnosticScore: 55, overdueTasks: 2, engagement: "1:1 Coaching", tasksCompleted: 5, totalTasks: 10, goalProgress: 42, avatar: "MB", subscription: "Starter", mrr: 350 },
  { id: 4, name: "Chad Heiser", company: "Heiser Group", status: "active", health: "green", lastSession: "Feb 14", nextSession: "Feb 28", diagnosticScore: 81, overdueTasks: 0, engagement: "Peer Group", tasksCompleted: 9, totalTasks: 9, goalProgress: 91, avatar: "CH", subscription: "Professional", mrr: 500 },
  { id: 5, name: "Sarah Rainwater", company: "SR Consulting", status: "at-risk", health: "red", lastSession: "Jan 15", nextSession: "—", diagnosticScore: 42, overdueTasks: 4, engagement: "RISE Program", tasksCompleted: 2, totalTasks: 8, goalProgress: 20, avatar: "SR", subscription: "Starter", mrr: 350 },
  { id: 6, name: "James Patterson", company: "Patterson Legal", status: "active", health: "green", lastSession: "Feb 15", nextSession: "Feb 22", diagnosticScore: 77, overdueTasks: 0, engagement: "1:1 Coaching", tasksCompleted: 11, totalTasks: 12, goalProgress: 85, avatar: "JP", subscription: "Business", mrr: 750 },
];

export const CLIENT_DOCUMENTS = {
  1: [
    { id: "d1", name: "Q4 Business Review.pdf", type: "pdf", size: "2.4 MB", uploaded: "Feb 10", pushedToClient: true, category: "Reports" },
    { id: "d2", name: "Leadership Assessment Results.xlsx", type: "spreadsheet", size: "340 KB", uploaded: "Feb 5", pushedToClient: true, category: "Diagnostics" },
    { id: "d3", name: "Coaching Agreement — NFP.pdf", type: "pdf", size: "180 KB", uploaded: "Sep 15", pushedToClient: false, category: "Contracts" },
    { id: "d4", name: "Session Notes — Feb 12.docx", type: "document", size: "45 KB", uploaded: "Feb 12", pushedToClient: false, category: "Session Notes" },
  ],
  2: [
    { id: "d5", name: "Hospice Industry Benchmarks.pdf", type: "pdf", size: "1.8 MB", uploaded: "Jan 20", pushedToClient: true, category: "Resources" },
    { id: "d6", name: "CEO Roundtable Prep.pptx", type: "presentation", size: "5.2 MB", uploaded: "Feb 8", pushedToClient: true, category: "Presentations" },
  ],
  3: [
    { id: "d7", name: "Financial Action Plan.xlsx", type: "spreadsheet", size: "520 KB", uploaded: "Jan 28", pushedToClient: true, category: "Action Plans" },
    { id: "d8", name: "Ops Process Map.pdf", type: "pdf", size: "890 KB", uploaded: "Jan 15", pushedToClient: false, category: "Operations" },
  ],
  4: [
    { id: "d9", name: "Q1 Goals Tracker.xlsx", type: "spreadsheet", size: "210 KB", uploaded: "Jan 5", pushedToClient: true, category: "Goals" },
  ],
  5: [
    { id: "d10", name: "Re-engagement Plan.pdf", type: "pdf", size: "320 KB", uploaded: "Feb 1", pushedToClient: false, category: "Action Plans" },
  ],
  6: [
    { id: "d11", name: "Legal Practice Growth Strategy.pdf", type: "pdf", size: "1.1 MB", uploaded: "Feb 14", pushedToClient: true, category: "Strategy" },
    { id: "d12", name: "Patterson Legal — Diagnostic.pdf", type: "pdf", size: "450 KB", uploaded: "Feb 10", pushedToClient: true, category: "Diagnostics" },
  ],
};

export const BUSINESS_ALERTS = [
  { id: 1, type: "danger", title: "Client At Risk", message: "Sarah Rainwater has not had a session in 34 days", time: "2h ago", clientId: 5, actionLabel: "Schedule Now" },
  { id: 2, type: "warning", title: "Overdue Tasks", message: "Manville Borne has 2 overdue action items", time: "4h ago", clientId: 3, actionLabel: "View Tasks" },
  { id: 3, type: "info", title: "Milestone Reached", message: "Chad Heiser completed all Q1 goals!", time: "6h ago", clientId: 4, actionLabel: "Celebrate" },
  { id: 4, type: "warning", title: "Session Prep", message: "Prep materials needed for Chris Ciesielski tomorrow", time: "8h ago", clientId: 1, actionLabel: "Prepare" },
  { id: 5, type: "success", title: "Diagnostic Complete", message: "James Patterson finished leadership diagnostic", time: "1d ago", clientId: 6, actionLabel: "Review" },
  { id: 6, type: "info", title: "AI Agent", message: "Auto-generated Q1 report for Chad Heiser is ready for review", time: "1d ago", clientId: 4, actionLabel: "Review" },
  { id: 7, type: "success", title: "Add-On Purchased", message: "Delaine Henry subscribed to Business Health Certificate", time: "2d ago", clientId: 2, actionLabel: "View" },
];

export const PERSONAL_ALERTS = [
  { id: 10, type: "info", title: "Morning Routine", message: "Meditation and journaling — 6:30 AM", time: "Today", actionLabel: "Done" },
  { id: 11, type: "warning", title: "Health Check", message: "Annual physical appointment next Monday", time: "5 days", actionLabel: "Confirm" },
  { id: 12, type: "info", title: "Family", message: "School pickup at 3:15 PM today", time: "Today", actionLabel: "Set Reminder" },
];

export const BUSINESS_TASKS = [
  { id: 1, text: "Complete Q1 financial review", priority: "high", due: "Feb 20", status: "active", assignee: "ME" },
  { id: 2, text: "Prep CEO Roundtable materials", priority: "high", due: "Feb 18", status: "active", assignee: "ME" },
  { id: 3, text: "Review Sarah Rainwater re-engagement plan", priority: "critical", due: "Feb 17", status: "overdue", assignee: "ME" },
  { id: 4, text: "Send follow-up resources to Chad Heiser", priority: "medium", due: "Feb 22", status: "pending", assignee: "ME" },
  { id: 5, text: "Update client onboarding workflow", priority: "medium", due: "Feb 25", status: "pending", assignee: "Team" },
  { id: 6, text: "Generate Q1 progress reports for all clients", priority: "low", due: "Mar 1", status: "pending", assignee: "ME" },
];

export const PERSONAL_TASKS = [
  { id: 20, text: "Book vacation flights for spring break", priority: "medium", due: "Feb 22", status: "pending", assignee: "ME" },
  { id: 21, text: "Schedule annual physical", priority: "high", due: "Feb 19", status: "active", assignee: "ME" },
  { id: 22, text: "Read 'Atomic Habits' — Chapter 7", priority: "low", due: "Feb 20", status: "active", assignee: "ME" },
  { id: 23, text: "Meal prep for the week", priority: "medium", due: "Feb 18", status: "pending", assignee: "ME" },
  { id: 24, text: "Call Mom", priority: "high", due: "Feb 18", status: "active", assignee: "ME" },
];

export const BUSINESS_SCHEDULE = [
  { time: "9:00 AM", title: "Chris Ciesielski", subtitle: "1:1 Coaching", duration: 60, type: "session" },
  { time: "11:00 AM", title: "Team — NFP Leadership", subtitle: "Team Coaching", duration: 90, type: "session" },
  { time: "1:00 PM", title: "Lunch & Review Prep", subtitle: "Admin Block", duration: 60, type: "admin" },
  { time: "2:00 PM", title: "Manville Borne", subtitle: "1:1 Coaching", duration: 60, type: "session" },
  { time: "4:00 PM", title: "CEO Roundtable Prep", subtitle: "Content Creation", duration: 45, type: "admin" },
];

export const PERSONAL_SCHEDULE = [
  { time: "6:30 AM", title: "Morning Meditation", subtitle: "Wellness", duration: 20, type: "wellness" },
  { time: "7:00 AM", title: "Gym — Strength Training", subtitle: "Fitness", duration: 60, type: "wellness" },
  { time: "12:30 PM", title: "Lunch with Sarah K.", subtitle: "Social", duration: 60, type: "social" },
  { time: "3:15 PM", title: "School Pickup", subtitle: "Family", duration: 30, type: "family" },
  { time: "6:00 PM", title: "Family Dinner", subtitle: "Family", duration: 60, type: "family" },
  { time: "8:30 PM", title: "Reading Time", subtitle: "Personal Development", duration: 45, type: "personal" },
];

export const PERSONAL_GOALS = [
  { name: "Read 12 Books This Year", progress: 25, current: "3/12", icon: "\u{1F4DA}" },
  { name: "Meditate Daily", progress: 87, current: "26/30 days", icon: "\u{1F9D8}" },
  { name: "Gym 4x/Week", progress: 75, current: "3/4 this week", icon: "\u{1F4AA}" },
  { name: "Family Dinner 5x/Week", progress: 60, current: "3/5 this week", icon: "\u{1F37D}\u{FE0F}" },
];

export const DIAGNOSTIC_CATEGORIES = [
  { name: "Leadership", avg: 76, color: "#8b5cf6" },
  { name: "Financial", avg: 68, color: "#c9a84c" },
  { name: "Operations", avg: 55, color: "#2d5a8e" },
  { name: "People", avg: 72, color: "#10b981" },
  { name: "Strategy", avg: 48, color: "#f59e0b" },
  { name: "Marketing", avg: 41, color: "#ef4444" },
  { name: "Technology", avg: 52, color: "#06b6d4" },
  { name: "Customer", avg: 73, color: "#ec4899" },
];

export const ACTIVITY_FEED = [
  { icon: "\u{1F4CB}", text: "Diagnostic completed by Chad Heiser", time: "2 hours ago" },
  { icon: "\u2705", text: "Chris Ciesielski completed 3 action items", time: "4 hours ago" },
  { icon: "\u{1F4C5}", text: "New session scheduled with Delaine Henry", time: "Yesterday" },
  { icon: "\u26A0\u{FE0F}", text: "Sarah Rainwater — no session in 34 days", time: "Yesterday" },
  { icon: "\u{1F4C4}", text: "Q4 Review uploaded for Manville Borne", time: "2 days ago" },
  { icon: "\u{1F3AF}", text: "James Patterson hit 85% goal completion", time: "2 days ago" },
  { icon: "\u{1F916}", text: "AI Agent auto-sent weekly pulse to 4 clients", time: "2 days ago" },
  { icon: "\u{1F4B3}", text: "Delaine Henry purchased Business Health Certificate add-on", time: "3 days ago" },
  { icon: "\u{1F4AC}", text: "Delaine Henry sent a message", time: "3 days ago" },
];

export const AI_AGENTS = [
  { id: 1, name: "Session Prep Agent", status: "active", description: "Auto-generates 1-page brief before each session with overdue tasks, KPI changes, diagnostic gaps", lastRun: "2h ago", nextRun: "Tomorrow 8 AM", clientsServed: 6, icon: "\u{1F4CB}" },
  { id: 2, name: "Weekly Pulse Agent", status: "active", description: "Sends automated check-in questions to clients between sessions, logs responses", lastRun: "Monday", nextRun: "Next Monday", clientsServed: 4, icon: "\u{1F4E1}" },
  { id: 3, name: "Progress Report Agent", status: "active", description: "Generates monthly progress reports with BHS trends, task completion, and ROI metrics", lastRun: "Feb 1", nextRun: "Mar 1", clientsServed: 6, icon: "\u{1F4CA}" },
  { id: 4, name: "At-Risk Detection Agent", status: "active", description: "Monitors engagement patterns and flags clients showing disengagement signals", lastRun: "1h ago", nextRun: "Continuous", clientsServed: 6, icon: "\u{1F6A8}" },
  { id: 5, name: "Smart Follow-Up Agent", status: "paused", description: "Sends personalized follow-up resources based on session notes and diagnostic results", lastRun: "3d ago", nextRun: "Paused", clientsServed: 0, icon: "\u{1F4E8}" },
  { id: 6, name: "Onboarding Agent", status: "active", description: "Automates new client setup — welcome email, diagnostic invite, portal access, calendar link", lastRun: "Feb 14", nextRun: "On trigger", clientsServed: 6, icon: "\u{1F680}" },
];

export const AI_QUEUE = [
  { id: 1, agent: "Session Prep Agent", action: "Generated session brief for Chris Ciesielski", status: "needs_review", time: "2h ago", clientId: 1 },
  { id: 2, agent: "At-Risk Detection Agent", action: "Flagged Sarah Rainwater — 34 days no session, 4 overdue tasks, declining scores", status: "needs_review", time: "4h ago", clientId: 5 },
  { id: 3, agent: "Progress Report Agent", action: "Q1 report draft ready for Chad Heiser", status: "needs_review", time: "1d ago", clientId: 4 },
  { id: 4, agent: "Weekly Pulse Agent", action: "Sent pulse check-in to 4 clients", status: "auto_completed", time: "2d ago", clientId: null },
  { id: 5, agent: "Smart Follow-Up Agent", action: "Suggested resources for Manville Borne based on financial diagnostic gap", status: "needs_review", time: "3d ago", clientId: 3 },
  { id: 6, agent: "Onboarding Agent", action: "Completed onboarding sequence for James Patterson", status: "auto_completed", time: "5d ago", clientId: 6 },
];

export const MESSAGES = {
  1: [
    { id: 1, from: "client", text: "Hey Meredith, just finished the Q4 financials review. A few questions for Thursday!", time: "2:14 PM", date: "Today", read: true },
    { id: 2, from: "coach", text: "Great timing! Write them down and we'll tackle them in order. Also review the action plan I uploaded.", time: "2:31 PM", date: "Today", read: true },
    { id: 3, from: "client", text: "Will do. Quick one — should I bring the P&L or just the summary?", time: "3:05 PM", date: "Today", read: false },
  ],
  2: [
    { id: 4, from: "coach", text: "Delaine, great work on the roundtable prep! Your framing of the growth thesis was sharp.", time: "9:20 AM", date: "Yesterday", read: true },
    { id: 5, from: "client", text: "Thank you! I felt more confident using the structure you taught. Can we do another mock run before the real thing?", time: "10:45 AM", date: "Yesterday", read: true },
  ],
  3: [
    { id: 6, from: "coach", text: "Manville — checking in on your overdue items. What's blocking you?", time: "11:00 AM", date: "Feb 17", read: true },
    { id: 7, from: "client", text: "Honestly been slammed. Will get to the SOPs by Friday I promise.", time: "4:22 PM", date: "Feb 17", read: true },
  ],
  5: [
    { id: 8, from: "coach", text: "Sarah, I'm a bit worried we haven't connected in a while. Want to schedule a quick 20-min check-in this week?", time: "8:00 AM", date: "Feb 15", read: false },
  ],
};

export const SUBSCRIPTION_ADDONS = [
  { id: "bh-cert", name: "Business Health Certificate", price: "$250-500/yr", description: "Branded certificate proving business health score — clients can display to investors, partners, lenders", icon: "\u{1F3C6}", available: "Professional+", purchased: 1 },
  { id: "360-feedback", name: "360\u00B0 Feedback Extra Slots", price: "$19/mo", description: "Additional 10-pack of 360 rater slots for deeper multi-rater assessments", icon: "\u{1F504}", available: "Professional+", purchased: 2 },
  { id: "industry-mod", name: "Industry-Specific Module", price: "$29/mo each", description: "Specialized diagnostic questions for Healthcare, Legal, Manufacturing, Tech, Retail", icon: "\u{1F3ED}", available: "Professional+", purchased: 0 },
  { id: "coach-seat", name: "Additional Coach Seat", price: "$99/mo", description: "Add another coach to your firm — share clients, templates, and analytics", icon: "\u{1F468}\u200D\u{1F4BC}", available: "Business+", purchased: 0 },
  { id: "priority-support", name: "Priority Support Upgrade", price: "$49/mo", description: "4-hour response time + phone support + dedicated success manager", icon: "\u{1F4DE}", available: "Starter+", purchased: 0 },
  { id: "certification", name: "CoachPerfect Certification", price: "$495 one-time", description: "Official certification program — featured in coach directory, badge on profile", icon: "\u{1F393}", available: "All", purchased: 0 },
  { id: "featured-listing", name: "Featured Directory Listing", price: "$29/mo", description: "Priority placement in CoachPerfect's coach directory with enhanced profile", icon: "\u2B50", available: "All", purchased: 0 },
  { id: "exit-readiness",       name: "Exit Readiness Module",   price: "$99/mo",  description: "Business valuation tools, exit planning frameworks, buyer readiness scoring", icon: "\u{1F680}", available: "Business+", purchased: 0 },
  { id: "forensic-cpa-ai",     name: "Forensic CPA AI",          price: "$49/mo",  description: "AI flags duplicate payments, unusual spikes, and cash-flow anomalies. Generates forensic summary for session use.", icon: "\u{1F50D}", available: "Professional+", purchased: 0 },
  { id: "ai-financial-advisor", name: "AI Financial Advisor",     price: "$39/mo",  description: "Cash-flow forecasts, P&L analysis, runway calculations, and branded advisor reports pushed to client.", icon: "\u{1F4CA}", available: "Professional+", purchased: 0 },
];
