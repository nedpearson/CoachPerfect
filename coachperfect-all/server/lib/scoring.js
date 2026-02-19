// ═══════════════════════════════════════════════════
// COACH PERFECT — DIAGNOSTIC SCORING ENGINE
// ═══════════════════════════════════════════════════
//
// Mirrors the calculateScores() logic in diagnostic.html exactly.
// All score computation happens server-side here; client results
// are NEVER trusted.
//
// 48 questions across 8 categories, 6 questions each.
// Answers are 0-indexed (0-4) mapping to scores 1-5.
// Category score = (sum of scores / max possible) * 100
// Overall score = average of all category scores
//

// ─── CATEGORY MAPPING ─────────────────────────────
// Maps question index (0-47) to its category name.
// 6 questions per category, in this sequence.
const CATEGORY_SEQUENCE = [
  'strategy',    'strategy',    'strategy',    'strategy',    'strategy',    'strategy',    // 0-5
  'financial',   'financial',   'financial',   'financial',   'financial',   'financial',   // 6-11
  'operations',  'operations',  'operations',  'operations',  'operations',  'operations',  // 12-17
  'people',      'people',      'people',      'people',      'people',      'people',      // 18-23
  'marketing',   'marketing',   'marketing',   'marketing',   'marketing',   'marketing',   // 24-29
  'leadership',  'leadership',  'leadership',  'leadership',  'leadership',  'leadership',  // 30-35
  'innovation',  'innovation',  'innovation',  'innovation',  'innovation',  'innovation',  // 36-41
  'systems',     'systems',     'systems',     'systems',     'systems',     'systems',     // 42-47
];

const CATEGORIES = ['strategy', 'financial', 'operations', 'people', 'marketing', 'leadership', 'innovation', 'systems'];

const CATEGORY_ICONS = {
  strategy:   '🎯',
  financial:  '💰',
  operations: '⚙️',
  people:     '👥',
  marketing:  '📣',
  leadership: '🧭',
  innovation: '🚀',
  systems:    '🔧',
};

const CATEGORY_LABELS = {
  strategy:   'Strategy',
  financial:  'Financial',
  operations: 'Operations',
  people:     'People & Culture',
  marketing:  'Marketing & Sales',
  leadership: 'Leadership',
  innovation: 'Innovation',
  systems:    'Systems & Tech',
};

// ─── SCORE THRESHOLDS ─────────────────────────────
const SCORE_LABEL = (score) => {
  if (score >= 80) return { label: 'Thriving',    color: '#2D8659' };
  if (score >= 65) return { label: 'Growing',     color: '#C17A28' };
  if (score >= 50) return { label: 'Developing',  color: '#C17A28' };
  return               { label: 'Needs Focus',  color: '#B04040' };
};

// ─── RECOMMENDATIONS ──────────────────────────────
const CATEGORY_RECS = {
  strategy: (score) =>
    score < 50
      ? 'Define a clear 90-day plan with 3 measurable priorities. Run a SWOT session this week.'
      : 'Strengthen your strategic planning cadence — monthly reviews, quarterly pivots.',
  financial: (score) =>
    score < 50
      ? 'Set up a real-time financial dashboard. Review P&L weekly, not quarterly.'
      : 'Build a 12-month cash flow forecast and review it monthly.',
  operations: (score) =>
    score < 50
      ? 'Document your top 5 core processes this week. Identify the one bottleneck costing the most time.'
      : 'Build a Standard Operating Procedures library and assign process owners.',
  people: (score) =>
    score < 50
      ? 'Run an anonymous employee engagement survey. Schedule 1:1s with each team member this month.'
      : 'Build a structured onboarding experience and career development roadmap.',
  marketing: (score) =>
    score < 50
      ? 'Identify your top 2 lead sources and double down. Track leads weekly in a simple CRM.'
      : 'Build a referral program and a content calendar to drive inbound leads consistently.',
  leadership: (score) =>
    score < 50
      ? 'Audit your calendar — are you spending time on the right priorities? Block time for deep work.'
      : 'Develop your leadership team\'s autonomy. Delegate a key decision to a direct report this week.',
  innovation: (score) =>
    score < 50
      ? 'Schedule a monthly "What could we do differently?" meeting with your team.'
      : 'Build a structured innovation pipeline — collect ideas, test small, scale what works.',
  systems: (score) =>
    score < 50
      ? 'Audit your tech stack. Remove unused tools. Standardize the 3 tools your team uses most.'
      : 'Automate your most repetitive process. Start with customer onboarding or invoicing.',
};

// ─── computeDiagnosticScores ──────────────────────
/**
 * Computes per-category and overall scores from 48 answer indices.
 *
 * @param {number[]} answerIndices — array of 48 integers (0-4)
 * @returns {{ overall: number, categories: Record<string, number> }}
 */
function computeDiagnosticScores(answerIndices) {
  if (!Array.isArray(answerIndices) || answerIndices.length !== 48) {
    throw new Error(`Expected 48 answers, got ${answerIndices?.length ?? 'undefined'}`);
  }

  const totals = {};
  const counts = {};

  answerIndices.forEach((answerIndex, i) => {
    const category = CATEGORY_SEQUENCE[i];
    const score = Math.max(1, Math.min(5, Math.round(answerIndex) + 1));
    totals[category] = (totals[category] || 0) + score;
    counts[category] = (counts[category] || 0) + 1;
  });

  const categories = {};
  for (const cat of CATEGORIES) {
    const total = totals[cat] || 0;
    const count = counts[cat] || 6;
    categories[cat] = Math.round((total / (count * 5)) * 100);
  }

  const overall = Math.round(
    Object.values(categories).reduce((sum, s) => sum + s, 0) / CATEGORIES.length
  );

  return { overall, categories };
}

// ─── buildResponseRows ────────────────────────────
/**
 * Converts answer array into rows ready for the diagnostic_responses table.
 */
function buildResponseRows(diagnosticId, answerIndices) {
  return answerIndices.map((answerIndex, questionIndex) => ({
    diagnostic_id:  diagnosticId,
    question_index: questionIndex,
    category:       CATEGORY_SEQUENCE[questionIndex],
    answer_index:   answerIndex,
    score:          Math.max(1, Math.min(5, Math.round(answerIndex) + 1)),
  }));
}

// ─── buildScoreRows ───────────────────────────────
/**
 * Converts category scores into rows for the diagnostic_scores table.
 */
function buildScoreRows(diagnosticId, categoryScores) {
  return Object.entries(categoryScores).map(([category, score]) => ({
    diagnostic_id: diagnosticId,
    category,
    score,
  }));
}

// ─── getRecommendations ───────────────────────────
/**
 * Returns top 3 weakest areas with actionable recommendations.
 */
function getRecommendations(categoryScores) {
  return Object.entries(categoryScores)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3)
    .map(([cat, score]) => ({
      category:       cat,
      label:          CATEGORY_LABELS[cat],
      icon:           CATEGORY_ICONS[cat],
      score,
      priority:       score < 50 ? 'urgent' : 'high',
      recommendation: CATEGORY_RECS[cat]?.(score) || `Focus on improving ${cat}.`,
    }));
}

// ─── getSummaryStats ─────────────────────────────
function getSummaryStats(categoryScores) {
  const entries = Object.entries(categoryScores);
  const sorted = [...entries].sort(([, a], [, b]) => a - b);
  return {
    weakest:  { category: sorted[0][0],    label: CATEGORY_LABELS[sorted[0][0]],    score: sorted[0][1] },
    strongest:{ category: sorted.at(-1)[0], label: CATEGORY_LABELS[sorted.at(-1)[0]], score: sorted.at(-1)[1] },
    atRisk:   sorted.filter(([, s]) => s < 50).map(([c]) => c),
  };
}

module.exports = {
  CATEGORY_SEQUENCE,
  CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  SCORE_LABEL,
  computeDiagnosticScores,
  buildResponseRows,
  buildScoreRows,
  getRecommendations,
  getSummaryStats,
};
