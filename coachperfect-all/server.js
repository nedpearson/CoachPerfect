const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ═══════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════

const PORT = process.env.PORT || 3008;
const WS_PORT = process.env.WS_PORT || 3579;
const PUBLIC_DIR = path.join(__dirname, 'app', 'public');

// ═══════════════════════════════════════════════════
// LOCAL IP
// ═══════════════════════════════════════════════════

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const LOCAL_IP = getLocalIP();

// ═══════════════════════════════════════════════════
// MIME TYPES
// ═══════════════════════════════════════════════════

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain',
};

// ═══════════════════════════════════════════════════
// HTTP SERVER
// ═══════════════════════════════════════════════════

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── /health — Nexus health check ──────────────────
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      app: 'CoachPerfect',
      port: PORT,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // ── /api/info ─────────────────────────────────────
  if (req.url === '/api/info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      name: 'Coach Perfect',
      ip: LOCAL_IP,
      port: PORT,
      wsPort: WS_PORT,
      version: '1.0.0',
      timestamp: Date.now()
    }));
    return;
  }

  // ── Static file serving ───────────────────────────
  let urlPath = req.url.split('?')[0]; // strip query string
  let filePath = urlPath === '/' ? '/index.html' : urlPath;
  filePath = path.join(PUBLIC_DIR, filePath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // SPA fallback — serve index.html
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err2, data2) => {
          if (err2) {
            res.writeHead(500);
            res.end('Server Error');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data2);
        });
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
      return;
    }

    if (ext === '.html') {
      res.setHeader('Cache-Control', 'no-cache');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

// ═══════════════════════════════════════════════════
// WEBSOCKET SYNC (optional — only if 'ws' is installed)
// ═══════════════════════════════════════════════════

let wss = null;
try {
  const { WebSocketServer } = require('ws');
  const peers = new Map();
  const dataStore = {};

  wss = new WebSocketServer({ port: WS_PORT });

  wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    let deviceId = null;
    console.log(`[Sync] Connection from ${clientIp}`);

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        switch (msg.type) {
          case 'HELLO':
            deviceId = msg.deviceId;
            peers.set(deviceId, ws);
            ws.send(JSON.stringify({ type: 'FULL_STATE', stores: dataStore, deviceId: 'server' }));
            break;
          case 'SYNC_DATA':
            if (msg.store && msg.data) {
              if (!dataStore[msg.store]) dataStore[msg.store] = [];
              const idx = dataStore[msg.store].findIndex(d => d.id === msg.data.id);
              if (idx >= 0) dataStore[msg.store][idx] = msg.data;
              else dataStore[msg.store].push(msg.data);
              broadcast(msg, deviceId, peers);
            }
            break;
          case 'REQUEST_FULL_SYNC':
            ws.send(JSON.stringify({ type: 'FULL_STATE', stores: dataStore, deviceId: 'server' }));
            break;
        }
      } catch (e) {
        console.error('[Sync] Message error:', e.message);
      }
    });

    ws.on('close', () => {
      if (deviceId) peers.delete(deviceId);
    });
  });

  console.log(`  WebSocket sync: ws://localhost:${WS_PORT}`);
} catch (e) {
  console.log('  WebSocket sync: disabled (run npm install to enable)');
}

function broadcast(msg, excludeId, peers) {
  const data = JSON.stringify(msg);
  for (const [id, ws] of peers) {
    if (id !== excludeId && ws.readyState === 1) ws.send(data);
  }
}

// ═══════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  ┌──────────────────────────────────────────────┐');
  console.log('  │                                              │');
  console.log('  │   CoachPerfect — Coaching Intelligence       │');
  console.log('  │                                              │');
  console.log(`  │   Local:    http://localhost:${PORT}             │`);
  console.log(`  │   Network:  http://${LOCAL_IP}:${PORT}       │`);
  console.log(`  │   Health:   http://localhost:${PORT}/health      │`);
  console.log('  │                                              │');
  console.log('  └──────────────────────────────────────────────┘');
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Set PORT env var to use a different port.`);
  } else {
    console.error('Server error:', err.message);
  }
  process.exit(1);
});
