// ─── COACHPERFECT — NOTIFICATION + TASK + MESSAGE ROUTES ────────────────────────
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, requireCoach, auditLog: makeAudit } = require('./middleware');

module.exports = function notificationRoutes(db, wsBroadcast) {
  const router = express.Router();
  const log = makeAudit(db);

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────

  // GET /notifications — for current user (coach or client)
  router.get('/notifications', authMiddleware, (req, res) => {
    const notifs = db.prepare(`
      SELECT * FROM notifications WHERE recipient_id = ?
      ORDER BY created_at DESC LIMIT 50
    `).all(req.user.id);
    res.json(notifs);
  });

  // PATCH /notifications/:id/read
  router.patch('/notifications/:id/read', authMiddleware, (req, res) => {
    db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND recipient_id = ?').run(req.params.id, req.user.id);
    res.json({ success: true });
  });

  // POST /notifications/read-all
  router.post('/notifications/read-all', authMiddleware, (req, res) => {
    db.prepare('UPDATE notifications SET read = 1 WHERE recipient_id = ?').run(req.user.id);
    res.json({ success: true });
  });

  // ── TASKS ─────────────────────────────────────────────────────────────────

  // GET /tasks — all tasks for coach's clients, or for a specific client
  router.get('/tasks', authMiddleware, requireCoach, (req, res) => {
    const { clientId, status } = req.query;
    let sql = 'SELECT t.*, c.name as client_name FROM tasks t JOIN clients c ON t.client_id = c.id WHERE c.coach_id = ?';
    const params = [req.user.id];
    if (clientId) { sql += ' AND t.client_id = ?'; params.push(clientId); }
    if (status)   { sql += ' AND t.status = ?';    params.push(status); }
    sql += ' ORDER BY t.created_at DESC';
    res.json(db.prepare(sql).all(...params));
  });

  // POST /tasks — push task to client
  router.post('/tasks', authMiddleware, requireCoach, (req, res) => {
    const { clientId, text, priority = 'medium', category, dueDate } = req.body;
    if (!clientId || !text) return res.status(400).json({ error: 'clientId and text required' });

    const client = db.prepare('SELECT id, name FROM clients WHERE id = ? AND coach_id = ?').get(clientId, req.user.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const id = uuidv4();
    db.prepare(`
      INSERT INTO tasks (id, client_id, coach_id, text, priority, category, due_date, status, from_coach)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 1)
    `).run(id, clientId, req.user.id, text, priority, category || null, dueDate || null);

    // Notify client
    db.prepare(`
      INSERT INTO notifications (recipient_id, recipient_role, type, title, message, action_label, ref_id)
      VALUES (?, 'client', 'task', 'New Task from Coach', ?, 'View Tasks', ?)
    `).run(clientId, text, id);

    if (wsBroadcast) wsBroadcast(clientId, { type: 'NEW_TASK', taskId: id });

    log(req.user.id, 'coach', 'CREATE_TASK', 'task', id, { clientId, text, priority }, req.ip);
    res.status(201).json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id));
  });

  // PATCH /tasks/:id — update task status
  router.patch('/tasks/:id', authMiddleware, (req, res) => {
    const { status, text, priority, dueDate } = req.body;
    db.prepare(`
      UPDATE tasks SET
        status = COALESCE(?, status), text = COALESCE(?, text),
        priority = COALESCE(?, priority), due_date = COALESCE(?, due_date),
        completed_at = CASE WHEN ? = 'completed' THEN strftime('%s','now') ELSE completed_at END
      WHERE id = ?
    `).run(status, text, priority, dueDate, status, req.params.id);
    res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id));
  });

  // ── MESSAGES ──────────────────────────────────────────────────────────────

  // GET /messages/:clientId — thread between coach and client
  router.get('/messages/:clientId', authMiddleware, (req, res) => {
    const msgs = db.prepare(`
      SELECT * FROM messages WHERE client_id = ?
      ORDER BY created_at ASC LIMIT 100
    `).all(req.params.clientId);

    // Auto-mark coach's incoming as read
    if (req.user.role === 'coach') {
      db.prepare("UPDATE messages SET read = 1 WHERE client_id = ? AND from_role = 'client' AND read = 0").run(req.params.clientId);
    }
    res.json(msgs);
  });

  // POST /messages — send a message
  router.post('/messages', authMiddleware, (req, res) => {
    const { clientId, text } = req.body;
    if (!clientId || !text?.trim()) return res.status(400).json({ error: 'clientId and text required' });

    const id = uuidv4();
    const fromRole = req.user.role;
    db.prepare('INSERT INTO messages (id, coach_id, client_id, from_role, text) VALUES (?, ?, ?, ?, ?)').run(
      id,
      fromRole === 'coach' ? req.user.id : db.prepare('SELECT coach_id FROM clients WHERE id = ?').get(clientId)?.coach_id,
      clientId, fromRole, text.trim()
    );

    const recipientId = fromRole === 'coach' ? clientId : db.prepare('SELECT coach_id FROM clients WHERE id = ?').get(clientId)?.coach_id;
    const recipientRole = fromRole === 'coach' ? 'client' : 'coach';

    db.prepare(`
      INSERT INTO notifications (recipient_id, recipient_role, type, title, message, action_label, ref_id)
      VALUES (?, ?, 'message', 'New Message', ?, 'Reply', ?)
    `).run(recipientId, recipientRole, text.trim().slice(0, 80), id);

    if (wsBroadcast) wsBroadcast(recipientId, { type: 'NEW_MESSAGE', messageId: id, clientId });

    res.status(201).json(db.prepare('SELECT * FROM messages WHERE id = ?').get(id));
  });

  // ── REMINDERS (push to client via notification) ───────────────────────────
  router.post('/reminders', authMiddleware, requireCoach, (req, res) => {
    const { clientId, message } = req.body;
    if (!clientId || !message) return res.status(400).json({ error: 'clientId and message required' });

    const client = db.prepare('SELECT id, name FROM clients WHERE id = ? AND coach_id = ?').get(clientId, req.user.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const id = uuidv4();
    db.prepare(`
      INSERT INTO notifications (id, recipient_id, recipient_role, type, title, message, action_label)
      VALUES (?, ?, 'client', 'reminder', 'Reminder from Coach', ?, 'Got It')
    `).run(id, clientId, message);

    if (wsBroadcast) wsBroadcast(clientId, { type: 'REMINDER', notifId: id });
    log(req.user.id, 'coach', 'SEND_REMINDER', 'client', clientId, { message }, req.ip);
    res.json({ success: true, notifId: id });
  });

  return router;
};
