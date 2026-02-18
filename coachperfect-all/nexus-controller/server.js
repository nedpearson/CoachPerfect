const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const net = require('net');
const os = require('os');

// ═══════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════

const NEXUS_PORT = parseInt(process.env.NEXUS_PORT, 10) || 4000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const REGISTRY_FILE = path.join(__dirname, 'registry.json');

// ═══════════════════════════════════════════════════
// REGISTRY — JSON-file backed service registry
// ═══════════════════════════════════════════════════

function loadRegistry() {
  try {
    const raw = fs.readFileSync(REGISTRY_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { services: [] };
  }
}

function saveRegistry(data) {
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function getServices() {
  return loadRegistry().services;
}

function findService(id) {
  const reg = loadRegistry();
  return reg.services.find(s => s.id === id);
}

function upsertService(service) {
  const reg = loadRegistry();
  const idx = reg.services.findIndex(s => s.id === service.id);
  if (idx >= 0) {
    reg.services[idx] = { ...reg.services[idx], ...service };
  } else {
    reg.services.push(service);
  }
  saveRegistry(reg);
  return service;
}

function deleteService(id) {
  const reg = loadRegistry();
  reg.services = reg.services.filter(s => s.id !== id);
  saveRegistry(reg);
}

function generateId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ═══════════════════════════════════════════════════
// PROCESS MANAGER — launch/stop services
// ═══════════════════════════════════════════════════

const runningProcesses = new Map(); // id -> { proc, startedAt }

function isProcessRunning(id) {
  const entry = runningProcesses.get(id);
  if (!entry) return false;
  try {
    process.kill(entry.proc.pid, 0); // signal 0 = check existence
    return true;
  } catch {
    runningProcesses.delete(id);
    return false;
  }
}

function launchService(service) {
  if (isProcessRunning(service.id)) {
    return { ok: false, error: 'Already running' };
  }

  const cmd = service.command || 'npm start';
  const cwd = service.path || __dirname;
  const port = service.port;

  // Determine shell command parts
  const isWindows = os.platform() === 'win32';
  const shell = isWindows ? 'cmd' : '/bin/sh';
  const shellFlag = isWindows ? '/c' : '-c';

  // Inject PORT env so the child process uses the assigned port
  const env = { ...process.env, PORT: String(port) };

  const proc = spawn(shell, [shellFlag, cmd], {
    cwd,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  });

  const logLines = [];
  const maxLogLines = 200;

  proc.stdout.on('data', (chunk) => {
    const lines = chunk.toString().split('\n').filter(Boolean);
    for (const line of lines) {
      logLines.push({ t: Date.now(), stream: 'stdout', text: line });
      if (logLines.length > maxLogLines) logLines.shift();
    }
  });

  proc.stderr.on('data', (chunk) => {
    const lines = chunk.toString().split('\n').filter(Boolean);
    for (const line of lines) {
      logLines.push({ t: Date.now(), stream: 'stderr', text: line });
      if (logLines.length > maxLogLines) logLines.shift();
    }
  });

  proc.on('exit', (code) => {
    const entry = runningProcesses.get(service.id);
    if (entry) entry.exitCode = code;
  });

  proc.on('error', (err) => {
    logLines.push({ t: Date.now(), stream: 'stderr', text: `Process error: ${err.message}` });
  });

  runningProcesses.set(service.id, {
    proc,
    pid: proc.pid,
    startedAt: Date.now(),
    logLines,
    exitCode: null
  });

  return { ok: true, pid: proc.pid, port };
}

function stopService(id) {
  const entry = runningProcesses.get(id);
  if (!entry) return { ok: false, error: 'Not running' };

  try {
    process.kill(entry.proc.pid, 'SIGTERM');
    setTimeout(() => {
      try { process.kill(entry.proc.pid, 'SIGKILL'); } catch {}
    }, 3000);
    runningProcesses.delete(id);
    return { ok: true };
  } catch (err) {
    runningProcesses.delete(id);
    return { ok: false, error: err.message };
  }
}

function getServiceLogs(id) {
  const entry = runningProcesses.get(id);
  if (!entry) return [];
  return entry.logLines;
}

// ═══════════════════════════════════════════════════
// PORT UTILITIES
// ═══════════════════════════════════════════════════

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '0.0.0.0');
  });
}

async function findNextFreePort(startPort) {
  let port = startPort;
  while (port < startPort + 100) {
    if (await checkPort(port)) return port;
    port++;
  }
  return null;
}

async function resolveAllPorts() {
  const services = getServices();
  const portMap = new Map(); // port -> service id (first claim)
  const changes = [];

  for (const svc of services) {
    if (portMap.has(svc.port)) {
      // Conflict — this service needs a new port
      const newPort = await findNextFreePort(svc.port + 1);
      if (newPort) {
        const oldPort = svc.port;
        svc.port = newPort;
        upsertService(svc);
        portMap.set(newPort, svc.id);
        changes.push({ id: svc.id, name: svc.name, oldPort, newPort });
      }
    } else {
      // Check if port is actually free on the OS
      const free = await checkPort(svc.port);
      if (!free) {
        const newPort = await findNextFreePort(svc.port + 1);
        if (newPort) {
          const oldPort = svc.port;
          svc.port = newPort;
          upsertService(svc);
          portMap.set(newPort, svc.id);
          changes.push({ id: svc.id, name: svc.name, oldPort, newPort });
        }
      } else {
        portMap.set(svc.port, svc.id);
      }
    }
  }

  return changes;
}

// ═══════════════════════════════════════════════════
// HTTP HELPERS
// ═══════════════════════════════════════════════════

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

function json(res, data, status) {
  status = status || 200;
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// ═══════════════════════════════════════════════════
// MIME TYPES
// ═══════════════════════════════════════════════════

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

// ═══════════════════════════════════════════════════
// HTTP SERVER
// ═══════════════════════════════════════════════════

const httpServer = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // ─── API ROUTES ───

    // GET /api/services
    if (pathname === '/api/services' && req.method === 'GET') {
      const services = getServices().map(s => ({
        ...s,
        running: isProcessRunning(s.id),
        pid: runningProcesses.get(s.id)?.pid || null
      }));
      return json(res, { services });
    }

    // POST /api/services — register a new service
    if (pathname === '/api/services' && req.method === 'POST') {
      const body = await readBody(req);
      if (!body.name) return json(res, { error: 'name is required' }, 400);
      const id = body.id || generateId(body.name);
      const service = {
        id,
        name: body.name,
        port: body.port || 3000,
        command: body.command || 'npm start',
        path: body.path || '',
        createdAt: Date.now()
      };
      upsertService(service);
      return json(res, { ok: true, service }, 201);
    }

    // PUT /api/services/:id — update a service
    const putMatch = pathname.match(/^\/api\/services\/([^/]+)$/);
    if (putMatch && req.method === 'PUT') {
      const id = decodeURIComponent(putMatch[1]);
      const existing = findService(id);
      if (!existing) return json(res, { error: 'Not found' }, 404);
      const body = await readBody(req);
      const updated = { ...existing, ...body, id }; // id can't change
      upsertService(updated);
      return json(res, { ok: true, service: updated });
    }

    // DELETE /api/services/:id
    const delMatch = pathname.match(/^\/api\/services\/([^/]+)$/);
    if (delMatch && req.method === 'DELETE') {
      const id = decodeURIComponent(delMatch[1]);
      if (isProcessRunning(id)) stopService(id);
      deleteService(id);
      return json(res, { ok: true });
    }

    // POST /api/services/:id/launch
    const launchMatch = pathname.match(/^\/api\/services\/([^/]+)\/launch$/);
    if (launchMatch && req.method === 'POST') {
      const id = decodeURIComponent(launchMatch[1]);
      const svc = findService(id);
      if (!svc) return json(res, { error: 'Service not found' }, 404);

      // Check if the assigned port is free before launching
      const portFree = await checkPort(svc.port);
      if (!portFree) {
        // Auto-resolve: find next free port
        const newPort = await findNextFreePort(svc.port + 1);
        if (newPort) {
          const oldPort = svc.port;
          svc.port = newPort;
          upsertService(svc);
          const result = launchService(svc);
          return json(res, { ...result, portChanged: true, oldPort, newPort: svc.port });
        }
        return json(res, { ok: false, error: `Port ${svc.port} is occupied and no free port found nearby` }, 409);
      }

      const result = launchService(svc);
      return json(res, result);
    }

    // POST /api/services/:id/stop
    const stopMatch = pathname.match(/^\/api\/services\/([^/]+)\/stop$/);
    if (stopMatch && req.method === 'POST') {
      const id = decodeURIComponent(stopMatch[1]);
      const result = stopService(id);
      return json(res, result);
    }

    // GET /api/services/:id/logs
    const logsMatch = pathname.match(/^\/api\/services\/([^/]+)\/logs$/);
    if (logsMatch && req.method === 'GET') {
      const id = decodeURIComponent(logsMatch[1]);
      return json(res, { logs: getServiceLogs(id) });
    }

    // POST /api/resolve-ports — auto-resolve all port conflicts
    if (pathname === '/api/resolve-ports' && req.method === 'POST') {
      const changes = await resolveAllPorts();
      return json(res, { ok: true, changes });
    }

    // GET /api/ports — port allocation map
    if (pathname === '/api/ports' && req.method === 'GET') {
      const services = getServices();
      const ports = {};
      const conflicts = [];
      for (const svc of services) {
        if (ports[svc.port]) {
          conflicts.push({ port: svc.port, services: [ports[svc.port], svc.id] });
        }
        ports[svc.port] = svc.id;
      }
      return json(res, { ports, conflicts });
    }

    // GET /api/status — controller health
    if (pathname === '/api/status') {
      return json(res, {
        ok: true,
        version: '0.1.0',
        services: getServices().length,
        running: Array.from(runningProcesses.keys()).filter(id => isProcessRunning(id)).length,
        uptime: process.uptime()
      });
    }

    // ─── STATIC FILES ───
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(PUBLIC_DIR, filePath);

    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err2, data2) => {
            if (err2) { res.writeHead(404); res.end('Not Found'); return; }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data2);
          });
        } else {
          res.writeHead(500);
          res.end('Server Error');
        }
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    });

  } catch (err) {
    console.error('[Nexus] Request error:', err);
    json(res, { error: err.message }, 500);
  }
});

// ═══════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════

httpServer.listen(NEXUS_PORT, '0.0.0.0', () => {
  const serviceCount = getServices().length;
  console.log('');
  console.log('  ┌──────────────────────────────────────────────┐');
  console.log('  │                                              │');
  console.log('  │   ⚡ Local Nexus Controller v0.1.0           │');
  console.log('  │                                              │');
  console.log(`  │   Dashboard: http://localhost:${NEXUS_PORT}          │`);
  console.log(`  │   Registry:  JSON (${serviceCount} services)         │`);
  console.log('  │                                              │');
  console.log('  └──────────────────────────────────────────────┘');
  console.log('');
});

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Nexus] Port ${NEXUS_PORT} in use. Try: NEXUS_PORT=4001 node server.js`);
    process.exit(1);
  }
  console.error('[Nexus] Server error:', err);
  process.exit(1);
});

// Graceful shutdown — stop all child processes
process.on('SIGINT', () => {
  console.log('\n[Nexus] Shutting down — stopping all services...');
  for (const [id] of runningProcesses) {
    stopService(id);
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  for (const [id] of runningProcesses) {
    stopService(id);
  }
  process.exit(0);
});
