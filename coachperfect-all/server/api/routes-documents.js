// ─── COACHPERFECT — DOCUMENT ROUTES ─────────────────────────────────────────────
const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, requireCoach, upload, uploadLimiter, auditLog: makeAudit, classifyFileType } = require('./middleware');

module.exports = function documentRoutes(db) {
  const router = express.Router();
  const log = makeAudit(db);

  // ── GET /documents ─ List docs (filtered by client, category, uploader) ──
  router.get('/documents', authMiddleware, requireCoach, (req, res) => {
    const { clientId, category, fileType, pushed } = req.query;
    let sql = 'SELECT * FROM documents WHERE coach_id = ?';
    const params = [req.user.id];

    if (clientId)  { sql += ' AND client_id = ?';         params.push(clientId); }
    if (category)  { sql += ' AND category = ?';          params.push(category); }
    if (fileType)  { sql += ' AND file_type = ?';         params.push(fileType); }
    if (pushed !== undefined) { sql += ' AND pushed_to_client = ?'; params.push(pushed === 'true' ? 1 : 0); }

    sql += ' ORDER BY created_at DESC';
    res.json(db.prepare(sql).all(...params));
  });

  // ── POST /documents/upload ─ Upload any file to client vault ─────────────
  router.post('/documents/upload', authMiddleware, requireCoach, uploadLimiter,
    upload.single('file'), async (req, res) => {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      const { clientId, category = 'Uncategorized', displayName, pushNow = 'false', pushMessage = '' } = req.body;
      if (!clientId) return res.status(400).json({ error: 'clientId required' });

      // Verify client belongs to coach
      const client = db.prepare('SELECT id, name FROM clients WHERE id = ? AND coach_id = ?').get(clientId, req.user.id);
      if (!client) return res.status(404).json({ error: 'Client not found' });

      const fileType = classifyFileType(req.file.mimetype);
      const id = uuidv4();
      const shouldPush = pushNow === 'true' || pushNow === true;

      db.prepare(`
        INSERT INTO documents (id, coach_id, client_id, uploaded_by, name, original_name, file_path, file_size, mime_type, file_type, category, pushed_to_client, push_message)
        VALUES (?, ?, ?, 'coach', ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, req.user.id, clientId, displayName || req.file.originalname, req.file.originalname, req.file.path, req.file.size, req.file.mimetype, fileType, category, shouldPush ? 1 : 0, pushMessage);

      log(req.user.id, 'coach', 'UPLOAD_DOC', 'document', id, { clientId, fileName: req.file.originalname, pushed: shouldPush }, req.ip);

      // If pushed — create client notification
      if (shouldPush) {
        db.prepare(`
          INSERT INTO notifications (recipient_id, recipient_role, type, title, message, action_label, action_url, ref_id)
          VALUES (?, 'client', 'document', 'New Document from Coach', ?, 'View Now', '/documents', ?)
        `).run(clientId, pushMessage || `Your coach shared "${displayName || req.file.originalname}". Tap to view.`, id);
      }

      const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(id);
      res.status(201).json(doc);
    }
  );

  // ── POST /documents/:id/push ─ Push existing doc to client ───────────────
  router.post('/documents/:id/push', authMiddleware, requireCoach, (req, res) => {
    const { message = '' } = req.body;
    const doc = db.prepare('SELECT * FROM documents WHERE id = ? AND coach_id = ?').get(req.params.id, req.user.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    db.prepare('UPDATE documents SET pushed_to_client = 1, push_message = ?, updated_at = strftime(\'%s\',\'now\') WHERE id = ?').run(message, req.params.id);

    db.prepare(`
      INSERT INTO notifications (recipient_id, recipient_role, type, title, message, action_label, action_url, ref_id)
      VALUES (?, 'client', 'document', 'New Document from Coach', ?, 'View Now', '/documents', ?)
    `).run(doc.client_id, message || `Your coach shared "${doc.name}".`, doc.id);

    log(req.user.id, 'coach', 'PUSH_DOC', 'document', doc.id, { clientId: doc.client_id, message }, req.ip);
    res.json({ success: true });
  });

  // ── PATCH /documents/:id/viewed ─ Client marks doc as viewed ─────────────
  router.patch('/documents/:id/viewed', authMiddleware, (req, res) => {
    db.prepare('UPDATE documents SET client_viewed = 1, updated_at = strftime(\'%s\',\'now\') WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // ── GET /documents/:id/download ─ Serve file ─────────────────────────────
  router.get('/documents/:id/download', authMiddleware, (req, res) => {
    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    // Permission: coach owns it, or client is the recipient
    const isCoach = req.user.role === 'coach' && doc.coach_id === req.user.id;
    const isClient = req.user.role === 'client' && doc.client_id === req.user.id && doc.pushed_to_client;
    if (!isCoach && !isClient) return res.status(403).json({ error: 'Access denied' });

    if (!fs.existsSync(doc.file_path)) return res.status(404).json({ error: 'File not found on server' });

    log(req.user.id, req.user.role, 'DOWNLOAD_DOC', 'document', doc.id, {}, req.ip);
    res.download(doc.file_path, doc.original_name);
  });

  // ── DELETE /documents/:id ─ Remove doc + file ────────────────────────────
  router.delete('/documents/:id', authMiddleware, requireCoach, (req, res) => {
    const doc = db.prepare('SELECT * FROM documents WHERE id = ? AND coach_id = ?').get(req.params.id, req.user.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    try { if (fs.existsSync(doc.file_path)) fs.unlinkSync(doc.file_path); } catch {}
    db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
    log(req.user.id, 'coach', 'DELETE_DOC', 'document', doc.id, { name: doc.name }, req.ip);
    res.json({ success: true });
  });

  // ── POST /documents/upload-client ─ Client uploads doc ───────────────────
  router.post('/documents/upload-client', authMiddleware, uploadLimiter,
    upload.single('file'), (req, res) => {
      if (req.user.role !== 'client') return res.status(403).json({ error: 'Clients only' });
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.user.id);
      if (!client) return res.status(404).json({ error: 'Client not found' });

      const fileType = classifyFileType(req.file.mimetype);
      const id = uuidv4();
      const { category = 'Client Upload', displayName } = req.body;

      db.prepare(`
        INSERT INTO documents (id, coach_id, client_id, uploaded_by, name, original_name, file_path, file_size, mime_type, file_type, category)
        VALUES (?, ?, ?, 'client', ?, ?, ?, ?, ?, ?, ?)
      `).run(id, client.coach_id, client.id, displayName || req.file.originalname, req.file.originalname, req.file.path, req.file.size, req.file.mimetype, fileType, category);

      // Notify coach
      db.prepare(`
        INSERT INTO notifications (recipient_id, recipient_role, type, title, message, action_label, ref_id)
        VALUES (?, 'coach', 'document', 'Client Uploaded a File', ?, 'View Document', ?)
      `).run(client.coach_id, `${client.name} uploaded "${displayName || req.file.originalname}"`, id);

      log(req.user.id, 'client', 'UPLOAD_DOC', 'document', id, { fileName: req.file.originalname }, req.ip);
      res.status(201).json(db.prepare('SELECT * FROM documents WHERE id = ?').get(id));
    }
  );

  return router;
};
