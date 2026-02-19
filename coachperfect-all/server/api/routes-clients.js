// ─── COACHPERFECT — CLIENT ROUTES ───────────────────────────────────────────────
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, requireCoach, auditLog: makeAudit, JWT_SECRET } = require('./middleware');

module.exports = function clientRoutes(db) {
  const router = express.Router();
  const log = makeAudit(db);

  // ── POST /auth/login ─ Coach + Client login ──────────────────────────────
  router.post('/auth/login', (req, res) => {
    const { email, password, role = 'coach' } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const table = role === 'coach' ? 'coaches' : 'clients';
    const user = db.prepare(`SELECT * FROM ${table} WHERE email = ?`).get(email.toLowerCase());

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, role, plan: user.plan || 'free', name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    log(user.id, role, 'LOGIN', table, user.id, {}, req.ip);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, plan: user.plan, role } });
  });

  // ── GET /coaches/me ─ Current coach profile ──────────────────────────────
  router.get('/coaches/me', authMiddleware, requireCoach, (req, res) => {
    const coach = db.prepare('SELECT id, name, email, company, avatar, plan, plan_status, landing_page_url, created_at FROM coaches WHERE id = ?').get(req.user.id);
    if (!coach) return res.status(404).json({ error: 'Coach not found' });
    res.json(coach);
  });

  // ── GET /clients ─ All clients for coach ─────────────────────────────────
  router.get('/clients', authMiddleware, requireCoach, (req, res) => {
    const clients = db.prepare(`
      SELECT c.*,
        (SELECT COUNT(*) FROM tasks t WHERE t.client_id = c.id AND t.status NOT IN ('completed','overdue')) as open_tasks,
        (SELECT COUNT(*) FROM documents d WHERE d.client_id = c.id) as doc_count,
        (SELECT COUNT(*) FROM messages m WHERE m.client_id = c.id AND m.from_role = 'client' AND m.read = 0) as unread_msgs
      FROM clients c WHERE c.coach_id = ?
      ORDER BY c.created_at DESC
    `).all(req.user.id);
    res.json(clients);
  });

  // ── POST /clients ─ Create new client ────────────────────────────────────
  router.post('/clients', authMiddleware, requireCoach, (req, res) => {
    const { name, email, company, engagement, plan = 'starter', mrr = 0 } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'name and email required' });

    const id = uuidv4();
    const avatar = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const defaultPass = bcrypt.hashSync(uuidv4(), 10); // random temp password

    db.prepare(`
      INSERT INTO clients (id, coach_id, name, email, company, avatar, engagement, plan, mrr, password_hash, member_since)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%b %Y','now'))
    `).run(id, req.user.id, name, email.toLowerCase(), company || '', avatar, engagement || '1:1 Coaching', plan, mrr * 100, defaultPass);

    log(req.user.id, 'coach', 'CREATE_CLIENT', 'client', id, { name, email }, req.ip);

    // Auto-create welcome notification for client
    db.prepare(`
      INSERT INTO notifications (recipient_id, recipient_role, type, title, message, action_label)
      VALUES (?, 'client', 'system', 'Welcome to CoachPerfect!', 'Your coaching portal is ready. Your coach will be in touch soon.', 'View Portal')
    `).run(id);

    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    res.status(201).json(client);
  });

  // ── GET /clients/:id ─ Single client with full detail ────────────────────
  router.get('/clients/:id', authMiddleware, requireCoach, (req, res) => {
    const client = db.prepare('SELECT * FROM clients WHERE id = ? AND coach_id = ?').get(req.params.id, req.user.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const tasks = db.prepare('SELECT * FROM tasks WHERE client_id = ? ORDER BY created_at DESC LIMIT 10').all(req.params.id);
    const docs  = db.prepare('SELECT * FROM documents WHERE client_id = ? ORDER BY created_at DESC LIMIT 10').all(req.params.id);
    const goals = db.prepare('SELECT * FROM goals WHERE client_id = ? ORDER BY created_at DESC').all(req.params.id);
    const msgs  = db.prepare('SELECT * FROM messages WHERE client_id = ? ORDER BY created_at DESC LIMIT 20').all(req.params.id);

    res.json({ ...client, tasks, docs, goals, msgs });
  });

  // ── PATCH /clients/:id ─ Update client ───────────────────────────────────
  router.patch('/clients/:id', authMiddleware, requireCoach, (req, res) => {
    const { name, company, engagement, plan, mrr, health_score, status } = req.body;
    const client = db.prepare('SELECT id FROM clients WHERE id = ? AND coach_id = ?').get(req.params.id, req.user.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    db.prepare(`
      UPDATE clients SET
        name = COALESCE(?, name), company = COALESCE(?, company),
        engagement = COALESCE(?, engagement), plan = COALESCE(?, plan),
        mrr = COALESCE(?, mrr), health_score = COALESCE(?, health_score),
        status = COALESCE(?, status), updated_at = strftime('%s','now')
      WHERE id = ?
    `).run(name, company, engagement, plan, mrr ? mrr * 100 : null, health_score, status, req.params.id);

    log(req.user.id, 'coach', 'UPDATE_CLIENT', 'client', req.params.id, req.body, req.ip);
    res.json(db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id));
  });

  // ── DELETE /clients/:id ─ Remove client ──────────────────────────────────
  router.delete('/clients/:id', authMiddleware, requireCoach, (req, res) => {
    const client = db.prepare('SELECT id, name FROM clients WHERE id = ? AND coach_id = ?').get(req.params.id, req.user.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
    log(req.user.id, 'coach', 'DELETE_CLIENT', 'client', req.params.id, { name: client.name }, req.ip);
    res.json({ success: true });
  });

  return router;
};
