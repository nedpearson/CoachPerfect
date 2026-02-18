const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const os = require('os');

// ═══════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════

const HTTP_PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 3579;
const PUBLIC_DIR = path.join(__dirname, 'public');

// ═══════════════════════════════════════════════════
// GET LOCAL IP
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
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

// ═══════════════════════════════════════════════════
// HTTP SERVER — Serves the PWA
// ═══════════════════════════════════════════════════

const httpServer = http.createServer((req, res) => {
  // CORS for local network
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API: Get server info (for sync discovery)
  if (req.url === '/api/info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      name: 'Coach Perfect Sync Server',
      ip: LOCAL_IP,
      wsPort: WS_PORT,
      httpPort: HTTP_PORT,
      version: '1.0.0',
      timestamp: Date.now()
    }));
    return;
  }

  // API: QR code data
  if (req.url === '/api/qr-data') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      installUrl: `http://${LOCAL_IP}:${HTTP_PORT}`,
      syncUrl: `ws://${LOCAL_IP}:${WS_PORT}`,
      ip: LOCAL_IP
    }));
    return;
  }

  // Serve static files
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(PUBLIC_DIR, filePath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // SPA fallback — serve index.html for all routes
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

    // Cache headers for PWA assets
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
// WEBSOCKET SYNC SERVER — Local WiFi P2P Sync
// ═══════════════════════════════════════════════════

const wss = new WebSocketServer({ port: WS_PORT });
const peers = new Map(); // deviceId -> ws
const dataStore = {}; // In-memory sync state

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  let deviceId = null;

  console.log(`[Sync] New connection from ${clientIp}`);

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      switch (msg.type) {
        case 'HELLO':
          deviceId = msg.deviceId;
          peers.set(deviceId, ws);
          console.log(`[Sync] Device registered: ${deviceId} (${peers.size} peers)`);

          // Send current state to new peer
          ws.send(JSON.stringify({
            type: 'FULL_STATE',
            stores: dataStore,
            deviceId: 'server'
          }));
          break;

        case 'SYNC_DATA':
          // Single record update — store and broadcast
          if (msg.store && msg.data) {
            if (!dataStore[msg.store]) dataStore[msg.store] = [];
            const idx = dataStore[msg.store].findIndex(d => d.id === msg.data.id);
            if (idx >= 0) {
              dataStore[msg.store][idx] = msg.data;
            } else {
              dataStore[msg.store].push(msg.data);
            }

            // Broadcast to all OTHER peers
            broadcast(msg, deviceId);
          }
          break;

        case 'SYNC_BATCH':
          // Batch of changes — store all and broadcast
          if (msg.changes) {
            for (const change of msg.changes) {
              if (!dataStore[change.store]) dataStore[change.store] = [];

              if (change.action === 'put') {
                const idx = dataStore[change.store].findIndex(d => d.id === change.data.id);
                if (idx >= 0) {
                  dataStore[change.store][idx] = change.data;
                } else {
                  dataStore[change.store].push(change.data);
                }
              } else if (change.action === 'delete') {
                dataStore[change.store] = dataStore[change.store].filter(d => d.id !== change.data.id);
              }
            }

            // Broadcast to all OTHER peers
            broadcast(msg, deviceId);
          }
          break;

        case 'FULL_STATE':
          // A device sent its full state — merge and broadcast
          if (msg.stores) {
            for (const [storeName, records] of Object.entries(msg.stores)) {
              if (!dataStore[storeName]) dataStore[storeName] = [];
              for (const record of records) {
                const idx = dataStore[storeName].findIndex(d => d.id === record.id);
                if (idx >= 0) {
                  // Merge: keep newer (by updatedAt or timestamp)
                  const existing = dataStore[storeName][idx];
                  if ((record.updatedAt || 0) > (existing.updatedAt || 0)) {
                    dataStore[storeName][idx] = record;
                  }
                } else {
                  dataStore[storeName].push(record);
                }
              }
            }

            // Broadcast merged state to all other peers
            broadcast({
              type: 'FULL_STATE',
              stores: dataStore,
              deviceId: 'server'
            }, deviceId);
          }
          break;

        case 'REQUEST_FULL_SYNC':
          // Send current server state to requester
          ws.send(JSON.stringify({
            type: 'FULL_STATE',
            stores: dataStore,
            deviceId: 'server'
          }));
          break;
      }
    } catch (e) {
      console.error('[Sync] Message error:', e);
    }
  });

  ws.on('close', () => {
    if (deviceId) {
      peers.delete(deviceId);
      console.log(`[Sync] Device disconnected: ${deviceId} (${peers.size} peers)`);
    }
  });

  ws.on('error', (err) => {
    console.error('[Sync] WebSocket error:', err.message);
  });
});

function broadcast(msg, excludeDeviceId) {
  const data = JSON.stringify(msg);
  for (const [id, ws] of peers) {
    if (id !== excludeDeviceId && ws.readyState === 1) {
      ws.send(data);
    }
  }
}

// ═══════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════

httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  ┌─────────────────────────────────────────────┐');
  console.log('  │                                             │');
  console.log('  │   🟠  Coach Perfect Mobile Server                │');
  console.log('  │                                             │');
  console.log(`  │   Local:   http://localhost:${HTTP_PORT}            │`);
  console.log(`  │   Network: http://${LOCAL_IP}:${HTTP_PORT}      │`);
  console.log(`  │   Sync:    ws://${LOCAL_IP}:${WS_PORT}       │`);
  console.log('  │                                             │');
  console.log('  │   📱 Scan QR code on dashboard to install   │');
  console.log('  │   📡 Devices on same WiFi sync auto         │');
  console.log('  │   📴 Works fully offline after first load   │');
  console.log('  │                                             │');
  console.log('  └─────────────────────────────────────────────┘');
  console.log('');
});
