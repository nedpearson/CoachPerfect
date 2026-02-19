// ─── COACHPERFECT — SUBSCRIPTION + ADD-ON ROUTES ────────────────────────────────
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, requireCoach, auditLog: makeAudit } = require('./middleware');

const PLANS = {
  free:         { maxClients: 1,   features: { aiPrep: false, documents: false, analytics: false } },
  starter:      { maxClients: 10,  features: { aiPrep: false, documents: true,  analytics: 'basic' } },
  professional: { maxClients: 25,  features: { aiPrep: true,  documents: true,  analytics: 'full'  } },
  business:     { maxClients: -1,  features: { aiPrep: true,  documents: true,  analytics: 'full', api: true  } },
  enterprise:   { maxClients: -1,  features: { aiPrep: true,  documents: true,  analytics: 'full', api: true, whitelabel: true } },
};

const ADDONS = {
  'bh-cert':       { name: 'Business Health Certificate', priceCents: 25000, minPlan: 'professional' },
  '360-feedback':  { name: '360° Feedback Extra Slots',   priceCents:  1900, minPlan: 'professional' },
  'industry-mod':  { name: 'Industry-Specific Module',    priceCents:  2900, minPlan: 'professional' },
  'coach-seat':    { name: 'Additional Coach Seat',       priceCents:  9900, minPlan: 'business' },
  'priority-support': { name: 'Priority Support',         priceCents:  4900, minPlan: 'starter' },
  'certification': { name: 'CoachPerfect Certification',  priceCents: 49500, minPlan: 'starter' },
  'featured-listing': { name: 'Featured Directory Listing', priceCents: 2900, minPlan: 'starter' },
  'exit-readiness':  { name: 'Exit Readiness Module',     priceCents:  9900, minPlan: 'business' },
};

module.exports = function subscriptionRoutes(db) {
  const router = express.Router();
  const log = makeAudit(db);

  // ── GET /subscriptions/plan ─ Current coach plan + features ──────────────
  router.get('/subscriptions/plan', authMiddleware, requireCoach, (req, res) => {
    const coach = db.prepare('SELECT plan, plan_status, trial_ends_at FROM coaches WHERE id = ?').get(req.user.id);
    if (!coach) return res.status(404).json({ error: 'Coach not found' });

    const planConfig = PLANS[coach.plan] || PLANS.free;
    const addons = db.prepare('SELECT * FROM addon_activations WHERE coach_id = ? AND active = 1').all(req.user.id);

    // MRR calculation
    const clientMRR = db.prepare('SELECT SUM(mrr) as total FROM clients WHERE coach_id = ?').get(req.user.id)?.total || 0;
    const addonMRR = addons.reduce((sum, a) => sum + a.price_cents, 0);

    res.json({
      plan: coach.plan,
      status: coach.plan_status,
      trialEndsAt: coach.trial_ends_at,
      features: planConfig.features,
      maxClients: planConfig.maxClients,
      activeAddons: addons,
      mrr: { clients: Math.round(clientMRR / 100), addons: Math.round(addonMRR / 100), total: Math.round((clientMRR + addonMRR) / 100) },
      arr: Math.round((clientMRR + addonMRR) * 12 / 100),
    });
  });

  // ── GET /subscriptions/addons ─ All available add-ons + activation status ─
  router.get('/subscriptions/addons', authMiddleware, requireCoach, (req, res) => {
    const active = db.prepare('SELECT addon_id FROM addon_activations WHERE coach_id = ? AND active = 1').all(req.user.id).map(a => a.addon_id);

    const list = Object.entries(ADDONS).map(([id, cfg]) => ({
      id, ...cfg,
      active: active.includes(id),
      available: (PLANS[req.user.plan]?.maxClients ?? 0) >= 0, // simplified
    }));

    res.json(list);
  });

  // ── POST /subscriptions/addons/:addonId ─ Activate add-on ────────────────
  router.post('/subscriptions/addons/:addonId', authMiddleware, requireCoach, (req, res) => {
    const { addonId } = req.params;
    const { clientId } = req.body;
    const addon = ADDONS[addonId];
    if (!addon) return res.status(404).json({ error: 'Unknown add-on' });

    // Check not already active
    const existing = db.prepare('SELECT id FROM addon_activations WHERE coach_id = ? AND addon_id = ? AND active = 1').get(req.user.id, addonId);
    if (existing) return res.status(409).json({ error: 'Add-on already active' });

    const id = uuidv4();
    db.prepare(`
      INSERT INTO addon_activations (id, coach_id, client_id, addon_id, addon_name, price_cents)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, req.user.id, clientId || null, addonId, addon.name, addon.priceCents);

    log(req.user.id, 'coach', 'ACTIVATE_ADDON', 'addon', id, { addonId, clientId }, req.ip);

    // In production: create Stripe subscription item here
    res.status(201).json({ success: true, addonId, name: addon.name, activationId: id });
  });

  // ── DELETE /subscriptions/addons/:addonId ─ Deactivate add-on ────────────
  router.delete('/subscriptions/addons/:addonId', authMiddleware, requireCoach, (req, res) => {
    db.prepare(`
      UPDATE addon_activations SET active = 0, deactivated_at = strftime('%s','now')
      WHERE coach_id = ? AND addon_id = ? AND active = 1
    `).run(req.user.id, req.params.addonId);
    log(req.user.id, 'coach', 'DEACTIVATE_ADDON', 'addon', req.params.addonId, {}, req.ip);
    res.json({ success: true });
  });

  // ── GET /subscriptions/clients ─ Revenue per client ──────────────────────
  router.get('/subscriptions/clients', authMiddleware, requireCoach, (req, res) => {
    const clients = db.prepare(`
      SELECT id, name, company, plan, mrr, status,
        (SELECT COUNT(*) FROM addon_activations a WHERE a.client_id = clients.id AND a.active = 1) as active_addons
      FROM clients WHERE coach_id = ? ORDER BY mrr DESC
    `).all(req.user.id);
    res.json(clients);
  });

  // ── POST /subscriptions/upgrade-prompt ─ Log upsell attempt ─────────────
  router.post('/subscriptions/upgrade-prompt', authMiddleware, requireCoach, (req, res) => {
    const { clientId, targetPlan } = req.body;
    log(req.user.id, 'coach', 'UPGRADE_PROMPT', 'client', clientId, { targetPlan }, req.ip);
    // In production: trigger upgrade email sequence
    res.json({ success: true });
  });

  return router;
};
