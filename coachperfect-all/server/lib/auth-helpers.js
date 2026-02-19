// ═══════════════════════════════════════════════════
// COACH PERFECT — AUTH HELPERS (bcrypt + JWT)
// ═══════════════════════════════════════════════════

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  console.warn('[Auth] WARNING: Using insecure default JWT_SECRET. Set JWT_SECRET in .env');
  return 'dev-secret-change-me-in-production';
})();

const ACCESS_TOKEN_TTL  = process.env.JWT_ACCESS_TTL  || '15m';
const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_TTL || '7d';

// ─── PASSWORD ──────────────────────────────────────
async function hashPassword(plaintext) {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

async function verifyPassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash);
}

// ─── JWT ──────────────────────────────────────────
/**
 * Generate a short-lived access token.
 * Payload: { sub: userId, coachId, plan, email }
 */
function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

/**
 * Generate a long-lived refresh token.
 * Payload: { sub: userId, type: 'refresh' }
 */
function signRefreshToken(userId) {
  return jwt.sign({ sub: userId, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_TTL });
}

/**
 * Verify and decode a JWT.
 * Returns decoded payload or throws.
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyToken,
};
