// ─── COACHPERFECT — PLUGIN ROUTES ────────────────────────────────────────────
// Handles plugin activation/deactivation per coach and per client.
// The PLUGIN_REGISTRY mirrors app/plugins/registry.js — single source of truth.
// Adding a new plugin: add to PLUGIN_REGISTRY + create app/plugins/<Name>.jsx
// ─────────────────────────────────────────────────────────────────────────────
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, requireCoach, auditLog: makeAudit } = require('./middleware');

// Mirror of app/plugins/registry.js — keep in sync when adding plugins
const PLUGIN_REGISTRY = {
  'forensic-cpa-ai':      { name: 'Forensic CPA AI',         priceCents: 4900, minPlan: 'professional', category: 'Financial' },
  'ai-financial-advisor': { name: 'AI Financial Advisor',     priceCents: 3900, minPlan: 'professional', category: 'Financial' },
  // Add new plugins here (copy entry from app/plugins/registry.js)
};

const PLAN_ORDER = ['free', 'starter', 'professional', 'business', 'enterprise'];
const meetsMinPlan = (userPlan, minPlan) =>
  PLAN_ORDER.indexOf(userPlan) >= PLAN_ORDER.indexOf(minPlan);

module.exports = function pluginRoutes(db) {
  const router = express.Router();
  const log    = makeAudit(db);

  // Ensure plugin_activations table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS plugin_activations (
      id          TEXT PRIMARY KEY,
      coach_id    TEXT NOT NULL,
      client_id   TEXT,
      plugin_id   TEXT NOT NULL,
      plugin_name TEXT NOT NULL,
      price_cents INTEGER NOT NULL DEFAULT 0,
      active      INTEGER NOT NULL DEFAULT 1,
      activated_at   INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      deactivated_at INTEGER,
      FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS client_onboarding (
      id          TEXT PRIMARY KEY,
      coach_id    TEXT NOT NULL,
      client_id   TEXT,
      name        TEXT, email TEXT, phone TEXT, title TEXT,
      company     TEXT, industry TEXT, revenue TEXT, employees TEXT,
      goals       TEXT,
      submitted_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );
  `);

  // ── GET /plugins ─ All plugins with activation status ────────────────────
  router.get('/plugins', authMiddleware, requireCoach, (req, res) => {
    const active = db.prepare(
      `SELECT plugin_id, client_id FROM plugin_activations WHERE coach_id = ? AND active = 1`
    ).all(req.user.id);

    const result = Object.entries(PLUGIN_REGISTRY).map(([id, cfg]) => ({
      id, ...cfg,
      available: meetsMinPlan(req.user.plan || 'free', cfg.minPlan),
      active:    active.some(a => a.plugin_id === id && !a.client_id),
      clientCount: active.filter(a => a.plugin_id === id && a.client_id).length,
    }));

    res.json(result);
  });

  // ── POST /plugins/:id/activate ─ Activate plugin ──────────────────────────
  router.post('/plugins/:id/activate', authMiddleware, requireCoach, (req, res) => {
    const { id } = req.params;
    const { clientId } = req.body;
    const cfg = PLUGIN_REGISTRY[id];
    if (!cfg) return res.status(404).json({ error: 'Unknown plugin' });

    if (!meetsMinPlan(req.user.plan || 'free', cfg.minPlan))
      return res.status(403).json({ error: `Requires ${cfg.minPlan} plan or higher` });

    const existing = db.prepare(
      `SELECT id FROM plugin_activations WHERE coach_id = ? AND plugin_id = ? AND client_id IS ? AND active = 1`
    ).get(req.user.id, id, clientId || null);
    if (existing) return res.status(409).json({ error: 'Plugin already active' });

    const activationId = uuidv4();
    db.prepare(`
      INSERT INTO plugin_activations (id, coach_id, client_id, plugin_id, plugin_name, price_cents)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(activationId, req.user.id, clientId || null, id, cfg.name, cfg.priceCents);

    log(req.user.id, 'coach', 'ACTIVATE_PLUGIN', 'plugin', activationId, { pluginId: id, clientId }, req.ip);

    // TODO: create Stripe subscription item here in production
    res.status(201).json({ success: true, pluginId: id, name: cfg.name, activationId });
  });

  // ── DELETE /plugins/:id ─ Deactivate plugin ───────────────────────────────
  router.delete('/plugins/:id', authMiddleware, requireCoach, (req, res) => {
    const { clientId } = req.query;
    db.prepare(`
      UPDATE plugin_activations SET active = 0, deactivated_at = strftime('%s','now')
      WHERE coach_id = ? AND plugin_id = ? AND client_id IS ? AND active = 1
    `).run(req.user.id, req.params.id, clientId || null);
    log(req.user.id, 'coach', 'DEACTIVATE_PLUGIN', 'plugin', req.params.id, { clientId }, req.ip);
    res.json({ success: true });
  });

  // ── GET /plugins/:id/clients ─ Clients with this plugin active ───────────
  router.get('/plugins/:id/clients', authMiddleware, requireCoach, (req, res) => {
    const rows = db.prepare(`
      SELECT pa.client_id, c.name, c.company, pa.activated_at
      FROM plugin_activations pa
      LEFT JOIN clients c ON c.id = pa.client_id
      WHERE pa.coach_id = ? AND pa.plugin_id = ? AND pa.active = 1 AND pa.client_id IS NOT NULL
    `).all(req.user.id, req.params.id);
    res.json(rows);
  });

  // ── POST /onboarding ─ Save client onboarding intake form ─────────────────
  router.post('/onboarding', (req, res) => {
    const { coachId, clientId, name, email, phone, title, company, industry, revenue, employees, goals } = req.body;
    if (!coachId || !name) return res.status(400).json({ error: 'coachId and name required' });
    const id = uuidv4();
    db.prepare(`
      INSERT INTO client_onboarding (id, coach_id, client_id, name, email, phone, title, company, industry, revenue, employees, goals)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, coachId, clientId || null, name, email, phone, title, company, industry, revenue, employees, JSON.stringify(goals || []));
    res.status(201).json({ success: true, id });
  });

  // ── GET /onboarding ─ Coach views all submitted intake forms ──────────────
  router.get('/onboarding', authMiddleware, requireCoach, (req, res) => {
    const rows = db.prepare(
      `SELECT * FROM client_onboarding WHERE coach_id = ? ORDER BY submitted_at DESC`
    ).all(req.user.id);
    res.json(rows.map(r => ({ ...r, goals: JSON.parse(r.goals || '[]') })));
  });

  return router;
};
