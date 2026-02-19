// ─── CLIENT-SIDE DATA ────────────────────────────────────────────────────────────

export const C = {
  navy: "#1e3a5f", navyLight: "#2d5a8e", gold: "#c9a84c",
  cream: "#f4f1ea", border: "#e0dcd4", text: "#4a5568",
  success: "#10b981", warning: "#f59e0b", danger: "#ef4444",
  info: "#3b82f6", purple: "#8b5cf6", white: "#ffffff",
};

export const CLIENT = {
  name: "Chris Ciesielski", company: "NFP", avatar: "CC",
  coachName: "Meredith Eicher", coachAvatar: "ME",
  engagement: "1:1 Coaching", memberSince: "Sep 2025", plan: "Professional",
};

export const CLIENT_HEALTH = {
  overall: 74,
  categories: [
    { name: "Leadership", score: 82, prev: 76, icon: "👑" },
    { name: "Financial",  score: 71, prev: 65, icon: "💰" },
    { name: "Operations", score: 68, prev: 70, icon: "⚙️" },
    { name: "People",     score: 79, prev: 72, icon: "👥" },
    { name: "Strategy",   score: 65, prev: 58, icon: "🎯" },
    { name: "Marketing",  score: 72, prev: 68, icon: "📢" },
    { name: "Technology", score: 60, prev: 55, icon: "💻" },
    { name: "Customer",   score: 78, prev: 74, icon: "🤝" },
  ],
};

export const CLIENT_GOALS = [
  { id: 1, name: "Increase Revenue 20% by Q3", progress: 45, milestones: ["Q1 Review", "Hire 2 reps", "Launch campaign"], completed: 1, icon: "📈", dueDate: "Sep 30" },
  { id: 2, name: "Build Leadership Team",        progress: 65, milestones: ["Define roles", "Interview candidates", "Onboard VP Ops", "Onboard VP Sales"], completed: 2, icon: "👥", dueDate: "Jun 30" },
  { id: 3, name: "Systematize Core Processes",   progress: 30, milestones: ["Document top 10 SOPs", "Train team", "Implement QA"], completed: 0, icon: "📋", dueDate: "Aug 31" },
  { id: 4, name: "Improve NPS to 70+",           progress: 80, milestones: ["Survey customers", "Identify gaps", "Action plan", "Re-survey"], completed: 3, icon: "⭐", dueDate: "Apr 30" },
];

export const CLIENT_TASKS = [
  { id: 1, text: "Complete leadership self-assessment", priority: "high",   due: "Feb 20", status: "active",  fromCoach: true,  category: "Leadership" },
  { id: 2, text: "Review Q4 financial statements",       priority: "high",   due: "Feb 22", status: "active",  fromCoach: true,  category: "Financial" },
  { id: 3, text: "Schedule 1:1 with VP Ops candidates",  priority: "medium", due: "Feb 25", status: "pending", fromCoach: false, category: "People" },
  { id: 4, text: "Draft SOP for client onboarding",      priority: "medium", due: "Feb 28", status: "pending", fromCoach: true,  category: "Operations" },
  { id: 5, text: "Send follow-up to top 5 clients",      priority: "low",    due: "Feb 19", status: "active",  fromCoach: false, category: "Customer" },
  { id: 6, text: "Prepare board meeting talking points", priority: "critical",due:"Feb 18", status: "overdue", fromCoach: true,  category: "Strategy" },
  { id: 7, text: "Complete weekly reflection journal",   priority: "medium", due: "Feb 18", status: "active",  fromCoach: true,  category: "Growth" },
];

export const CLIENT_CALENDAR = [
  { date: "Today", events: [
    { time: "9:00 AM", title: "Coaching Session with Meredith", type: "coaching", duration: 60 },
    { time: "11:00 AM", title: "Team Standup", type: "meeting", duration: 30 },
    { time: "2:00 PM", title: "Board Prep Call", type: "meeting", duration: 45 },
  ]},
  { date: "Tomorrow", events: [
    { time: "10:00 AM", title: "VP Ops Interview — Candidate A", type: "interview", duration: 60 },
    { time: "1:00 PM", title: "Client Lunch — Acme Corp", type: "meeting", duration: 90 },
  ]},
  { date: "Feb 21", events: [
    { time: "9:00 AM", title: "Leadership Self-Assessment Due", type: "deadline", duration: 0 },
    { time: "3:00 PM", title: "Peer Group Session", type: "coaching", duration: 90 },
  ]},
];

export const CLIENT_ALERTS = [
  { id: 1, type: "coaching",   icon: "📅", title: "Coaching Session Today",    message: "Your 1:1 with Meredith is at 9:00 AM. Prep materials are ready.",             time: "30 min",   actionLabel: "View Prep" },
  { id: 2, type: "task",       icon: "⚠️", title: "Overdue Task",              message: "Board meeting talking points were due yesterday — please complete ASAP.",       time: "1d overdue",actionLabel: "Complete Now" },
  { id: 3, type: "reminder",   icon: "💬", title: "Coach Reminder",            message: "Meredith says: Don't forget to review the Q4 financials before our session!", time: "Yesterday", actionLabel: "Got It" },
  { id: 4, type: "document",   icon: "📄", title: "New Document from Coach",   message: "Meredith shared 'Q4 Business Review.pdf' with a note: Review before Thursday.", time: "2h ago",   actionLabel: "View Now" },
  { id: 5, type: "milestone",  icon: "🎉", title: "Goal Milestone Reached!",   message: "You're 80% to your NPS goal — one more milestone to go.",                      time: "2d ago",   actionLabel: "View Goal" },
  { id: 6, type: "diagnostic", icon: "📋", title: "New Diagnostic Available",  message: "Monthly leadership pulse check is ready to complete.",                         time: "3d ago",   actionLabel: "Start Now" },
];

export const CLIENT_DOCUMENTS = [
  { id: "d1", name: "Q4 Business Review.pdf",           type: "pdf",         size: "2.4 MB",  received: "Feb 10", pushedBy: "Meredith", category: "Reports",      viewed: true,  message: "Please review before our session Thursday." },
  { id: "d2", name: "Leadership Assessment Results.xlsx",type: "spreadsheet", size: "340 KB",  received: "Feb 5",  pushedBy: "Meredith", category: "Diagnostics",  viewed: true,  message: "Your leadership scores — talk through these." },
  { id: "d3", name: "Coaching Agreement — NFP.pdf",     type: "pdf",         size: "180 KB",  received: "Sep 15", pushedBy: "Meredith", category: "Contracts",    viewed: true,  message: null },
  { id: "d4", name: "CEO Roundtable Prep Guide.pdf",    type: "pdf",         size: "1.1 MB",  received: "Feb 14", pushedBy: "Meredith", category: "Resources",    viewed: false, message: "New! Framework for your upcoming roundtable." },
  { id: "d5", name: "Financial Action Plan.xlsx",       type: "spreadsheet", size: "520 KB",  received: "Jan 28", pushedBy: "Meredith", category: "Action Plans", viewed: true,  message: "90-day plan we built together — track weekly." },
];

export const CLIENT_WINS = [
  { text: "Closed biggest client deal of the quarter — $120K", date: "Feb 14", icon: "🏆" },
  { text: "Team engagement score improved 15 points",          date: "Feb 10", icon: "📈" },
  { text: "Completed all leadership module assignments",        date: "Feb 5",  icon: "✅" },
  { text: "NPS score hit 68 — approaching 70 target",          date: "Jan 28", icon: "⭐" },
];

export const SESSION_HISTORY = [
  { date: "Feb 12", focus: "Q1 Revenue Strategy",     notes: "Discussed pipeline gaps. Action: hire 2 sales reps by March.", outcome: "positive" },
  { date: "Jan 29", focus: "Leadership Team Build",   notes: "Reviewed VP Ops candidates. Shortlisted 3.",                  outcome: "positive" },
  { date: "Jan 15", focus: "Financial Review",        notes: "Cash flow concerns. Created 90-day action plan.",             outcome: "neutral" },
  { date: "Jan 2",  focus: "Q1 Goal Setting",         notes: "Set 4 primary goals. Established tracking cadence.",          outcome: "positive" },
];

export const alertIconBg = {
  coaching: "#3b82f6", task: "#ef4444", reminder: "#c9a84c",
  document: "#8b5cf6", milestone: "#10b981", diagnostic: "#8b5cf6",
};
