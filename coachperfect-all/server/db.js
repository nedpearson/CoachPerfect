// ═══════════════════════════════════════════════════
// COACH PERFECT — JSON FILE DATABASE
// ═══════════════════════════════════════════════════
// Lightweight persistence using an atomic JSON file write.
// Good enough for MVP; swap for PostgreSQL/Prisma when ready.
//
// Data file: server/data/coaches.json
//
// Schema:
//   coaches        — keyed by coachId
//   customerIndex  — maps Stripe customerId → coachId

const fs   = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE  = path.join(DATA_DIR, 'coaches.json');

// ─── INTERNAL: LOAD / SAVE ───────────────────────────────────────────────────

function load() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_FILE))  return { coaches: {}, customerIndex: {} };
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    console.error('[DB] Failed to load database:', err.message);
    return { coaches: {}, customerIndex: {} };
  }
}

function save(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    // Atomic write: write to .tmp then rename to avoid partial-write corruption
    const tmp = DB_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, DB_FILE);
  } catch (err) {
    console.error('[DB] Failed to save database:', err.message);
  }
}

// ─── PUBLIC API ──────────────────────────────────────────────────────────────

/**
 * Returns the coach record for the given coachId, or null if not found.
 */
function getCoach(coachId) {
  const data = load();
  return data.coaches[coachId] || null;
}

/**
 * Creates or updates a coach record, merging `fields` into any existing data.
 * Also keeps the customerIndex in sync when stripeCustomerId is provided.
 */
function upsertCoach(coachId, fields) {
  const data = load();
  const existing = data.coaches[coachId] || { id: coachId, createdAt: new Date().toISOString() };
  const updated  = { ...existing, ...fields, updatedAt: new Date().toISOString() };

  data.coaches[coachId] = updated;

  if (fields.stripeCustomerId) {
    data.customerIndex[fields.stripeCustomerId] = coachId;
  }

  save(data);
  return updated;
}

/**
 * Looks up a coach by their Stripe customer ID.
 * Returns the coach record or null.
 */
function getCoachByCustomerId(customerId) {
  const data    = load();
  const coachId = data.customerIndex[customerId];
  return coachId ? data.coaches[coachId] : null;
}

module.exports = { getCoach, upsertCoach, getCoachByCustomerId };
