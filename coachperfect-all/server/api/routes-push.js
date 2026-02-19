// ─── COACHPERFECT — WEB PUSH ROUTES ──────────────────────────────────────────
// Requires: npm install web-push
// Setup:    npx web-push generate-vapid-keys → add to .env
//
// Endpoints:
//   POST   /push/subscribe        — save/update subscription for a user
//   DELETE /push/subscribe/:id    — remove subscription
//   POST   /push/test             — send test push to requesting user
//   POST   /push/send             — internal: send push to any userId
// ─────────────────────────────────────────────────────────────────────────────
const express = require('express');
const { authMiddleware } = require('./middleware');

let webpush = null;
try {
  webpush = require('web-push');
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL || 'mailto:admin@coachperfect.co',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } else {
    webpush = null; // VAPID keys not configured — disable silently
  }
} catch (_) { /* web-push not installed yet */ }

module.exports = function pushRoutes(db) {
  const router = express.Router();

  // Auto-create table
  db.exec(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      subscription TEXT NOT NULL,
      created_at  INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      UNIQUE(user_id)
    );
  `);

  // ── POST /push/subscribe — save or update subscription ─────────────────────
  router.post('/push/subscribe', authMiddleware, (req, res) => {
    const { subscription } = req.body;
    if (!subscription) return res.status(400).json({ error: 'subscription required' });

    db.prepare(`
      INSERT INTO push_subscriptions (id, user_id, subscription)
      VALUES (lower(hex(randomblob(16))), ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET subscription = excluded.subscription
    `).run(req.user.id, JSON.stringify(subscription));

    res.json({ success: true });
  });

  // ── DELETE /push/subscribe/:userId — remove subscription ───────────────────
  router.delete('/push/subscribe/:userId', authMiddleware, (req, res) => {
    // Only allow users to delete their own subscription
    if (req.user.id !== req.params.userId && req.user.role !== 'coach')
      return res.status(403).json({ error: 'Forbidden' });
    db.prepare('DELETE FROM push_subscriptions WHERE user_id = ?').run(req.params.userId);
    res.json({ success: true });
  });

  // ── POST /push/test — send a test notification to self ─────────────────────
  router.post('/push/test', authMiddleware, async (req, res) => {
    if (!webpush) return res.status(503).json({ error: 'Push not configured — set VAPID keys in .env' });

    const row = db.prepare('SELECT subscription FROM push_subscriptions WHERE user_id = ?').get(req.user.id);
    if (!row) return res.status(404).json({ error: 'No subscription found for this user' });

    try {
      await webpush.sendNotification(JSON.parse(row.subscription), JSON.stringify({
        title: 'CoachPerfect',
        body:  'Push notifications are working! 🎉',
        url:   '/',
        icon:  '/icon-192.png',
      }));
      res.json({ success: true });
    } catch (err) {
      if (err.statusCode === 410) {
        db.prepare('DELETE FROM push_subscriptions WHERE user_id = ?').run(req.user.id);
        return res.status(410).json({ error: 'Subscription expired — please re-subscribe' });
      }
      res.status(500).json({ error: err.message });
    }
  });

  // ── POST /push/send — internal helper (called by other routes) ─────────────
  // Body: { userId, title, body, url, tag }
  router.post('/push/send', authMiddleware, async (req, res) => {
    if (!webpush) return res.json({ skipped: 'push not configured' });
    const { userId, title, body, url = '/', tag } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const rows = db.prepare('SELECT subscription FROM push_subscriptions WHERE user_id = ?').all(userId);
    if (!rows.length) return res.json({ skipped: 'no subscription' });

    const payload = JSON.stringify({ title: title || 'CoachPerfect', body: body || '', url, tag, icon: '/icon-192.png' });
    const results = await Promise.allSettled(rows.map(r => webpush.sendNotification(JSON.parse(r.subscription), payload)));
    res.json({ sent: results.filter(r => r.status === 'fulfilled').length, total: rows.length });
  });

  // ── GET /push/vapid-public-key — frontend needs this to subscribe ──────────
  router.get('/push/vapid-public-key', (_req, res) => {
    if (!process.env.VAPID_PUBLIC_KEY) return res.status(503).json({ error: 'VAPID not configured' });
    res.json({ key: process.env.VAPID_PUBLIC_KEY });
  });

  return router;
};
