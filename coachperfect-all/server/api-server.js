// ═══════════════════════════════════════════════════════════════════════════════
// COACHPERFECT — MAIN API SERVER
// ═══════════════════════════════════════════════════════════════════════════════
// Setup:
//   1. cd server && npm install
//   2. cp .env.example .env (fill in values)
//   3. node api-server.js
//
// Ports: API = 3002, WebSocket = 3579 (configurable via .env)
// ═══════════════════════════════════════════════════════════════════════════════

require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const http      = require('http');
const path      = require('path');
const fs        = require('fs');
const { WebSocketServer } = require('ws');
const Database  = require('better-sqlite3');
const { apiLimiter } = require('./api/middleware');

// ─── DATABASE INIT ────────────────────────────────────────────────────────────
const DB_PATH = process.env.DB_PATH || './data/coachperfect.db';
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Run schema migrations
const schema = fs.readFileSync(path.join(__dirname, 'db-schema.sql'), 'utf8');
db.exec(schema);

// ─── EXPRESS SETUP ────────────────────────────────────────────────────────────
const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(apiLimiter);

// Serve uploaded files (coach/client only — download route enforces auth)
app.use('/files', express.static(process.env.UPLOAD_DIR || './uploads'));

// ─── WEBSOCKET SERVER (real-time notifications) ───────────────────────────────
const httpServer = http.createServer(app);
const wss = new WebSocketServer({ port: parseInt(process.env.WS_PORT || '3579') });

const wsClients = new Map(); // userId → Set<WebSocket>

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'ws://localhost');
  const userId = url.searchParams.get('userId');
  if (!userId) return ws.close();

  if (!wsClients.has(userId)) wsClients.set(userId, new Set());
  wsClients.get(userId).add(ws);

  const heartbeat = setInterval(() => { if (ws.readyState === ws.OPEN) ws.ping(); }, parseInt(process.env.WS_HEARTBEAT_MS || '30000'));
  ws.on('close', () => { clearInterval(heartbeat); wsClients.get(userId)?.delete(ws); });
  ws.on('error', () => ws.terminate());
});

function wsBroadcast(userId, data) {
  const sockets = wsClients.get(userId);
  if (!sockets) return;
  const payload = JSON.stringify(data);
  sockets.forEach(ws => { if (ws.readyState === ws.OPEN) ws.send(payload); });
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────
const clientRoutes       = require('./api/routes-clients')(db);
const documentRoutes     = require('./api/routes-documents')(db);
const notificationRoutes = require('./api/routes-notifications')(db, wsBroadcast);
const aiRoutes           = require('./api/routes-ai')(db);
const subscriptionRoutes = require('./api/routes-subscriptions')(db);

app.use('/api', clientRoutes);
app.use('/api', documentRoutes);
app.use('/api', notificationRoutes);
app.use('/api', aiRoutes);
app.use('/api', subscriptionRoutes);

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok', service: 'coachperfect-api', version: '1.0.0',
    db: DB_PATH, ws: `ws://localhost:${process.env.WS_PORT || 3579}`,
    uptime: Math.floor(process.uptime()),
  });
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File too large' });
  console.error('[API Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3002');
httpServer.listen(PORT, () => {
  console.log(`\n  🟠 CoachPerfect API Server`);
  console.log(`  → API:       http://localhost:${PORT}/api`);
  console.log(`  → WebSocket: ws://localhost:${process.env.WS_PORT || 3579}`);
  console.log(`  → Database:  ${DB_PATH}`);
  console.log(`  → Uploads:   ${path.resolve(process.env.UPLOAD_DIR || './uploads')}`);
  console.log('');
});

module.exports = { app, db, wsBroadcast };
