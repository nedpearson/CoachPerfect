// ─── COACHPERFECT API MIDDLEWARE ────────────────────────────────────────────────
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod';
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '100');

// Ensure upload dir exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ─── JWT AUTH ────────────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  try {
    const token = header.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role: 'coach'|'client', plan }
    next();
  } catch {
    return res.status(401).json({ error: 'Token expired or invalid' });
  }
}

function requireCoach(req, res, next) {
  if (req.user?.role !== 'coach') return res.status(403).json({ error: 'Coach access required' });
  next();
}

function requirePlanLevel(minPlan) {
  const order = ['free', 'starter', 'professional', 'business', 'enterprise'];
  return (req, res, next) => {
    const level = order.indexOf(req.user?.plan || 'free');
    if (level < order.indexOf(minPlan)) {
      return res.status(403).json({ error: `${minPlan} plan required`, upgradeUrl: '/pricing' });
    }
    next();
  };
}

// ─── RATE LIMITERS ───────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '200'),
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many requests — please slow down.' },
});

const uploadLimiter = rateLimit({
  windowMs: 900000, max: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX || '20'),
  message: { error: 'Upload rate limit exceeded.' },
});

// ─── MULTER FILE STORAGE ─────────────────────────────────────────────────────
const ALLOWED_EXTS = new Set((process.env.ALLOWED_EXTENSIONS || 'pdf,docx,xlsx,pptx,doc,xls,ppt,png,jpg,jpeg,gif,mp3,mp4,mov,wav,txt,csv,md,zip').split(',').map(e => `.${e}`));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const clientId = req.body.clientId || req.params.clientId || 'shared';
    const dir = path.join(UPLOAD_DIR, req.user?.id || 'anon', clientId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTS.has(ext)) cb(null, true);
  else cb(new Error(`File type ${ext} not allowed`), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_MB * 1024 * 1024 },
});

// ─── AUDIT LOGGER ────────────────────────────────────────────────────────────
function auditLog(db) {
  return function logAction(actorId, actorRole, action, resource, resourceId, metadata = {}, ip = '') {
    try {
      db.prepare(`
        INSERT INTO audit_log (actor_id, actor_role, action, resource, resource_id, metadata, ip)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(actorId, actorRole, action, resource, resourceId, JSON.stringify(metadata), ip);
    } catch (e) { console.error('[AuditLog]', e.message); }
  };
}

// ─── FILE TYPE CLASSIFIER ────────────────────────────────────────────────────
function classifyFileType(mime) {
  if (mime.includes('pdf')) return 'pdf';
  if (mime.includes('spreadsheet') || mime.includes('excel') || mime.includes('csv')) return 'spreadsheet';
  if (mime.includes('presentation') || mime.includes('powerpoint')) return 'presentation';
  if (mime.includes('word') || mime.includes('document') || mime.includes('text')) return 'document';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('video/')) return 'video';
  return 'other';
}

module.exports = { authMiddleware, requireCoach, requirePlanLevel, apiLimiter, uploadLimiter, upload, auditLog, classifyFileType, JWT_SECRET };
