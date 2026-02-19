// ═══════════════════════════════════════════════════
// COACH PERFECT — API CLIENT
// ═══════════════════════════════════════════════════
//
// Usage:
//   import api from './lib/api';
//   const { clients } = await api.getClients();
//   const { coach }   = await api.login(email, password);

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// ─── TOKEN STORAGE ────────────────────────────────
const TOKEN_KEY   = 'cp_access_token';
const REFRESH_KEY = 'cp_refresh_token';

export function getToken()         { return localStorage.getItem(TOKEN_KEY); }
export function getRefreshToken()  { return localStorage.getItem(REFRESH_KEY); }
export function setTokens(access, refresh) {
  localStorage.setItem(TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}
export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// ─── CORE REQUEST ─────────────────────────────────
let _refreshPromise = null;

async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Auto-refresh on 401 TOKEN_EXPIRED
  if (res.status === 401) {
    const body = await res.json().catch(() => ({}));
    if (body.code === 'TOKEN_EXPIRED' && getRefreshToken()) {
      if (!_refreshPromise) {
        _refreshPromise = refreshAccessToken().finally(() => { _refreshPromise = null; });
      }
      await _refreshPromise;
      // Retry once with new token
      return request(path, options);
    }
    // Unrecoverable 401 — force logout
    clearTokens();
    window.dispatchEvent(new Event('cp:logout'));
    throw Object.assign(new Error(body.error || 'Unauthorized'), { status: 401, code: body.code });
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error || `HTTP ${res.status}`), { status: res.status });
  }

  return res.json();
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');
  const data = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  }).then(r => r.json());
  if (data.accessToken) setTokens(data.accessToken, null);
  else throw new Error('Refresh failed');
}

// ─── AUTH ─────────────────────────────────────────
async function register(email, password, name, businessName) {
  const data = await request('/api/auth/register', {
    method: 'POST',
    body: { email, password, name, businessName },
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

async function login(email, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

function logout() {
  clearTokens();
  window.dispatchEvent(new Event('cp:logout'));
}

// ─── DASHBOARD ────────────────────────────────────
const getDashboard = () => request('/api/dashboard');

// ─── CLIENTS ──────────────────────────────────────
const getClients    = ()       => request('/api/clients');
const createClient  = (data)   => request('/api/clients',     { method: 'POST', body: data });
const updateClient  = (id, d)  => request(`/api/clients/${id}`, { method: 'PUT', body: d });
const deleteClient  = (id)     => request(`/api/clients/${id}`, { method: 'DELETE' });

// ─── SESSIONS ─────────────────────────────────────
const getSessions   = ()       => request('/api/sessions');
const createSession = (data)   => request('/api/sessions',     { method: 'POST', body: data });
const updateSession = (id, d)  => request(`/api/sessions/${id}`, { method: 'PUT', body: d });
const getPrepBrief  = (id)     => request(`/api/sessions/${id}/prep-brief`);

// ─── TASKS ────────────────────────────────────────
const getTasks      = ()       => request('/api/tasks');
const createTask    = (data)   => request('/api/tasks',       { method: 'POST', body: data });
const updateTask    = (id, d)  => request(`/api/tasks/${id}`, { method: 'PUT', body: d });
const deleteTask    = (id)     => request(`/api/tasks/${id}`, { method: 'DELETE' });

// ─── WINS ─────────────────────────────────────────
const getWins       = ()       => request('/api/wins');
const createWin     = (data)   => request('/api/wins',        { method: 'POST', body: data });
const updateWin     = (id, d)  => request(`/api/wins/${id}`,  { method: 'PUT', body: d });
const deleteWin     = (id)     => request(`/api/wins/${id}`,  { method: 'DELETE' });

// ─── GOALS ────────────────────────────────────────
const getGoals      = ()       => request('/api/goals');
const createGoal    = (data)   => request('/api/goals',       { method: 'POST', body: data });
const updateGoal    = (id, d)  => request(`/api/goals/${id}`, { method: 'PUT', body: d });

// ─── HABITS ───────────────────────────────────────
const getHabits     = ()       => request('/api/habits');
const createHabit   = (data)   => request('/api/habits',               { method: 'POST', body: data });
const checkHabit    = (id, date) => request(`/api/habits/${id}/check`, { method: 'POST', body: { date } });

// ─── DIAGNOSTICS ──────────────────────────────────
const getDiagnostics  = ()     => request('/api/diagnostics');
const getDiagnostic   = (id)   => request(`/api/diagnostics/${id}`);

// Public — no auth required
async function submitPublicDiagnostic(email, name, businessName, answers) {
  return fetch(`${BASE_URL}/api/diagnostics/public/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, businessName, answers }),
  }).then(async r => {
    const body = await r.json();
    if (!r.ok) throw new Error(body.error || `HTTP ${r.status}`);
    return body;
  });
}

// ─── WAITLIST ─────────────────────────────────────
async function joinWaitlist(email, name, businessType, referralSource) {
  return fetch(`${BASE_URL}/api/waitlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, businessType, referralSource }),
  }).then(r => r.json());
}

// ─── DEFAULT EXPORT ───────────────────────────────
const api = {
  // auth
  register, login, logout,
  getToken, setTokens, clearTokens,
  // dashboard
  getDashboard,
  // clients
  getClients, createClient, updateClient, deleteClient,
  // sessions
  getSessions, createSession, updateSession, getPrepBrief,
  // tasks
  getTasks, createTask, updateTask, deleteTask,
  // wins
  getWins, createWin, updateWin, deleteWin,
  // goals
  getGoals, createGoal, updateGoal,
  // habits
  getHabits, createHabit, checkHabit,
  // diagnostics
  getDiagnostics, getDiagnostic, submitPublicDiagnostic,
  // waitlist
  joinWaitlist,
};

export default api;
