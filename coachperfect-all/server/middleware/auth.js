// ═══════════════════════════════════════════════════
// COACH PERFECT — AUTH MIDDLEWARE (local pg + JWT)
// ═══════════════════════════════════════════════════
//
// Verifies a JWT issued by /api/auth/login.
// Authorization: Bearer <access_token>
//
// Attaches to request:
//   req.user  — { id, email }
//   req.coach — coaches table row { id, plan, plan_status, ... }
//
// Usage:
//   app.get('/api/clients', requireAuth, handler)
//   app.get('/api/ai-prep', requireAuth, requirePlan('professional'), handler)

const { verifyToken } = require('../lib/auth-helpers');
const { query }       = require('../lib/db');

// ─── PLAN ORDER ───────────────────────────────────
const PLAN_ORDER = ['free', 'starter', 'professional', 'business', 'enterprise'];

// ─── requireAuth ──────────────────────────────────
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Missing or malformed Authorization header',
      code:  'MISSING_TOKEN',
    });
  }

  const token = authHeader.split(' ')[1];

  // Verify the JWT locally (no network round-trip)
  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    const code = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
    return res.status(401).json({ error: err.message, code });
  }

  // Reject refresh tokens used as access tokens
  if (payload.type === 'refresh') {
    return res.status(401).json({ error: 'Refresh token cannot be used here', code: 'WRONG_TOKEN_TYPE' });
  }

  // Load coach profile from local DB
  try {
    const { rows } = await query(
      `SELECT c.*, u.email AS user_email
         FROM coaches c
         JOIN users   u ON u.id = c.user_id
        WHERE c.user_id = $1
          AND c.archived_at IS NULL
        LIMIT 1`,
      [payload.sub]
    );

    if (!rows.length) {
      return res.status(404).json({
        error:  'Coach profile not found. Please complete registration.',
        code:   'PROFILE_NOT_FOUND',
        userId: payload.sub,
      });
    }

    req.user  = { id: payload.sub, email: rows[0].user_email };
    req.coach = rows[0];
    next();
  } catch (err) {
    console.error('[Auth] DB error during auth lookup:', err.message);
    return res.status(500).json({ error: 'Database error during auth', code: 'DB_ERROR' });
  }
}

// ─── requirePlan ──────────────────────────────────
// Gate routes behind a minimum plan tier.
// Always use AFTER requireAuth.
function requirePlan(minPlan) {
  return (req, res, next) => {
    const coachLevel    = PLAN_ORDER.indexOf(req.coach.plan);
    const requiredLevel = PLAN_ORDER.indexOf(minPlan);

    if (coachLevel === -1) {
      return res.status(400).json({ error: `Unknown plan: ${req.coach.plan}`, code: 'UNKNOWN_PLAN' });
    }

    if (coachLevel < requiredLevel) {
      return res.status(403).json({
        error:       'Plan upgrade required',
        code:        'PLAN_UPGRADE_REQUIRED',
        currentPlan: req.coach.plan,
        requiredPlan: minPlan,
        upgradeUrl:  `${process.env.FRONTEND_URL}/billing/upgrade`,
      });
    }

    next();
  };
}

module.exports = { requireAuth, requirePlan, PLAN_ORDER };
