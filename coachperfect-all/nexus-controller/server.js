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

function validatePort(port) {
  const p = parseInt(port, 10);
  if (!Number.isFinite(p) || p < 1 || p > 65535) return null;
  return p;
}

// Returns all ports a service uses (HTTP + WebSocket if applicable)
function getServicePorts(svc) {
  const ports = [svc.port];
  // Node servers using server.js typically open a WS port at HTTP + 579
  if (svc.command && svc.command.includes('server.js')) {
    ports.push(svc.port + 579);
  }
  return ports;
}

// ═══════════════════════════════════════════════════
// PROCESS MANAGER — launch/stop services
// ═══════════════════════════════════════════════════

const runningProcesses = new Map(); // id -> { proc, startedAt }

function isProcessRunning(id) {
  const entry = runningProcesses.get(id);
  if (!entry) return false;
  // If we already recorded an exit, it's dead
  if (entry.exitCode !== null) {
    runningProcesses.delete(id);
    return false;
  }
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

  // Validate working directory exists
  try {
    if (!fs.statSync(cwd).isDirectory()) {
      return { ok: false, error: `Path is not a directory: ${cwd}` };
    }
  } catch {
    return { ok: false, error: `Path does not exist: ${cwd}` };
  }

  const shell = '/bin/sh';
  const shellFlag = '-c';

  // Inject PORT env so the child process uses the assigned port
  const env = { ...process.env, PORT: String(port) };

  let proc;
  try {
    proc = spawn(shell, [shellFlag, cmd], {
      cwd,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true // create a process group so we can kill children too
    });
  } catch (err) {
    return { ok: false, error: `Spawn failed: ${err.message}` };
  }

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

  proc.unref(); // allow Nexus to exit without waiting for children

  runningProcesses.set(service.id, {
    proc,
    pid: proc.pid,
    port, // track the actual port we assigned
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
    // Kill the entire process GROUP (-pid) to catch subprocesses (e.g. WS server)
    process.kill(-entry.proc.pid, 'SIGTERM');
    setTimeout(() => {
      try { process.kill(-entry.proc.pid, 'SIGKILL'); } catch {}
    }, 3000);
  } catch {
    // Fallback to direct kill if group kill fails
    try { process.kill(entry.proc.pid, 'SIGTERM'); } catch {}
  }

  runningProcesses.delete(id);
  return { ok: true };
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

async function findNextFreePort(startPort, reserved) {
  reserved = reserved || new Set();
  let port = startPort;
  while (port < startPort + 100) {
    if (!reserved.has(port) && await checkPort(port)) return port;
    port++;
  }
  return null;
}

async function resolveAllPorts() {
  const services = getServices();
  const claimed = new Set(); // all claimed ports (HTTP + WS)
  const changes = [];

  // Reserve the Nexus Controller's own port
  claimed.add(NEXUS_PORT);

  for (const svc of services) {
    const allPorts = getServicePorts(svc);
    let needsReassign = false;

    // Check if any of this service's ports conflict with already-claimed ports or OS
    for (const p of allPorts) {
      if (claimed.has(p) || !(await checkPort(p))) {
        needsReassign = true;
        break;
      }
    }

    if (needsReassign) {
      // Find a candidate port where ALL service ports (HTTP + WS) are free
      let candidate = svc.port + 1;
      let found = false;
      while (candidate < svc.port + 100) {
        const candidatePorts = getServicePorts({ ...svc, port: candidate });
        let allFree = true;
        for (const cp of candidatePorts) {
          if (claimed.has(cp) || !(await checkPort(cp))) { allFree = false; break; }
        }
        if (allFree) {
          const oldPort = svc.port;
          svc.port = candidate;
          upsertService(svc);
          for (const cp of candidatePorts) claimed.add(cp);
          changes.push({ id: svc.id, name: svc.name, oldPort, newPort: candidate });
          found = true;
          break;
        }
        candidate++;
      }
      if (!found) {
        changes.push({ id: svc.id, name: svc.name, oldPort: svc.port, newPort: null, error: 'No free port found' });
      }
    } else {
      for (const p of allPorts) claimed.add(p);
    }
  }

  return changes;
}

// Wait for a service to actually start responding on a port
function waitForPort(port, timeoutMs) {
  timeoutMs = timeoutMs || 8000;
  const start = Date.now();
  return new Promise((resolve) => {
    function check() {
      if (Date.now() - start > timeoutMs) return resolve(false);
      const sock = net.createConnection({ port, host: '127.0.0.1' });
      sock.once('connect', () => { sock.destroy(); resolve(true); });
      sock.once('error', () => { setTimeout(check, 300); });
    }
    check();
  });
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
      const port = validatePort(body.port || 3000);
      if (port === null) return json(res, { error: 'Invalid port (must be 1-65535)' }, 400);
      const id = body.id || generateId(body.name);
      const service = {
        id,
        name: body.name,
        port,
        command: body.command || 'npm start',
        path: body.path || '',
        createdAt: Date.now()
      };
      upsertService(service);
      return json(res, { ok: true, service }, 201);
    }

    // PUT /api/services/:id — update a service
    if (req.method === 'PUT') {
      const m = pathname.match(/^\/api\/services\/([^/]+)$/);
      if (m) {
        const id = decodeURIComponent(m[1]);
        const existing = findService(id);
        if (!existing) return json(res, { error: 'Not found' }, 404);
        const body = await readBody(req);
        if (body.port !== undefined) {
          const p = validatePort(body.port);
          if (p === null) return json(res, { error: 'Invalid port (must be 1-65535)' }, 400);
          body.port = p;
        }
        const updated = { ...existing, ...body, id };
        upsertService(updated);
        return json(res, { ok: true, service: updated });
      }
    }

    // DELETE /api/services/:id
    if (req.method === 'DELETE') {
      const m = pathname.match(/^\/api\/services\/([^/]+)$/);
      if (m) {
        const id = decodeURIComponent(m[1]);
        if (isProcessRunning(id)) stopService(id);
        deleteService(id);
        return json(res, { ok: true });
      }
    }

    // POST /api/services/:id/launch
    if (req.method === 'POST') {
      const m = pathname.match(/^\/api\/services\/([^/]+)\/launch$/);
      if (m) {
        const id = decodeURIComponent(m[1]);
        const svc = findService(id);
        if (!svc) return json(res, { error: 'Service not found' }, 404);

        // Check ALL ports this service needs (HTTP + WS)
        const neededPorts = getServicePorts(svc);
        let allFree = true;
        for (const p of neededPorts) {
          if (!(await checkPort(p))) { allFree = false; break; }
        }

        let portChanged = false;
        let oldPort = svc.port;

        if (!allFree) {
          // Auto-resolve: find a port where ALL needed ports are free
          const reserved = new Set([NEXUS_PORT]);
          for (const [otherId] of runningProcesses) {
            const other = findService(otherId);
            if (other) for (const p of getServicePorts(other)) reserved.add(p);
          }

          let candidate = svc.port + 1;
          let found = false;
          while (candidate < svc.port + 100) {
            const cPorts = getServicePorts({ ...svc, port: candidate });
            let ok = true;
            for (const cp of cPorts) {
              if (reserved.has(cp) || !(await checkPort(cp))) { ok = false; break; }
            }
            if (ok) {
              svc.port = candidate;
              upsertService(svc);
              portChanged = true;
              found = true;
              break;
            }
            candidate++;
          }
          if (!found) {
            return json(res, { ok: false, error: `Port ${oldPort} is occupied and no free port found nearby` }, 409);
          }
        }

        const result = launchService(svc);
        if (!result.ok) return json(res, result, 500);

        // Wait for the service to actually bind to its port (up to 8s)
        const ready = await waitForPort(svc.port, 8000);

        // Verify process didn't crash during startup
        if (!isProcessRunning(id)) {
          const logs = getServiceLogs(id);
          const lastLog = logs.length > 0 ? logs[logs.length - 1].text : 'unknown error';
          return json(res, { ok: false, error: `Service crashed on startup: ${lastLog}` }, 500);
        }

        return json(res, {
          ...result,
          ready,
          portChanged,
          oldPort: portChanged ? oldPort : undefined,
          newPort: portChanged ? svc.port : undefined
        });
      }
    }

    // POST /api/services/:id/stop
    if (req.method === 'POST') {
      const m = pathname.match(/^\/api\/services\/([^/]+)\/stop$/);
      if (m) {
        const id = decodeURIComponent(m[1]);
        const result = stopService(id);
        return json(res, result);
      }
    }

    // GET /api/services/:id/logs
    if (req.method === 'GET') {
      const m = pathname.match(/^\/api\/services\/([^/]+)\/logs$/);
      if (m) {
        const id = decodeURIComponent(m[1]);
        return json(res, { logs: getServiceLogs(id) });
      }
    }

    // POST /api/launch-all — launch every registered service
    if (pathname === '/api/launch-all' && req.method === 'POST') {
      const services = getServices();
      const results = [];
      for (const svc of services) {
        if (isProcessRunning(svc.id)) {
          results.push({ id: svc.id, name: svc.name, ok: true, skipped: true });
          continue;
        }
        const neededPorts = getServicePorts(svc);
        let allFree = true;
        for (const p of neededPorts) {
          if (!(await checkPort(p))) { allFree = false; break; }
        }
        if (!allFree) {
          let candidate = svc.port + 1;
          let found = false;
          while (candidate < svc.port + 100) {
            const cPorts = getServicePorts({ ...svc, port: candidate });
            let ok = true;
            for (const cp of cPorts) { if (!(await checkPort(cp))) { ok = false; break; } }
            if (ok) { svc.port = candidate; upsertService(svc); found = true; break; }
            candidate++;
          }
          if (!found) { results.push({ id: svc.id, name: svc.name, ok: false, error: 'No free port' }); continue; }
        }
        const r = launchService(svc);
        const ready = await waitForPort(svc.port, 6000);
        results.push({ id: svc.id, name: svc.name, ...r, ready, port: svc.port });
      }
      return json(res, { ok: true, results });
    }

    // POST /api/stop-all — stop every running service
    if (pathname === '/api/stop-all' && req.method === 'POST') {
      const results = [];
      for (const [id] of runningProcesses) results.push({ id, ...stopService(id) });
      return json(res, { ok: true, results });
    }

    // POST /api/resolve-ports — auto-resolve all port conflicts
    if (pathname === '/api/resolve-ports' && req.method === 'POST') {
      const changes = await resolveAllPorts();
      return json(res, { ok: true, changes });
    }

    // GET /api/ports — port allocation map (includes WS ports)
    if (pathname === '/api/ports' && req.method === 'GET') {
      const services = getServices();
      const portToSvcs = new Map();
      const conflicts = [];

      for (const svc of services) {
        for (const p of getServicePorts(svc)) {
          if (!portToSvcs.has(p)) portToSvcs.set(p, []);
          portToSvcs.get(p).push(svc.id);
        }
      }
      portToSvcs.set(NEXUS_PORT, ['_nexus-controller']);

      for (const [port, ids] of portToSvcs) {
        if (ids.length > 1) conflicts.push({ port, services: ids });
      }

      const ports = {};
      for (const [port, ids] of portToSvcs) ports[port] = ids.join(', ');

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

// Graceful shutdown — kill all child process groups
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
