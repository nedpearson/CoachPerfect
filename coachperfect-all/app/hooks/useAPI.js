// ─── CoachPerfect API Utility ─────────────────────────────────────────────────
// Use as a plain utility:   import { api } from "./hooks/useAPI.js"
// Use as a React hook:      const { data, loading, error } = useAPI("/clients")
//
// All calls automatically attach the JWT from localStorage.
// On 401 → clears session and reloads to login screen.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";

const BASE = (typeof process !== "undefined" && process.env?.REACT_APP_API_URL)
  || "http://localhost:3002/api";

// ─── Token helpers ─────────────────────────────────────────────────────────
export const getToken = ()  => localStorage.getItem("cp_token");
export const getUser  = ()  => { try { return JSON.parse(localStorage.getItem("cp_user")); } catch { return null; } };
export const clearSession = () => { localStorage.removeItem("cp_token"); localStorage.removeItem("cp_user"); };

// ─── Core fetch wrapper ────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token && token !== "demo-token") headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  // Auto-logout on 401
  if (res.status === 401) { clearSession(); window.location.reload(); return null; }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

// ─── Named API methods ─────────────────────────────────────────────────────
export const api = {
  get:    (path)         => apiFetch(path),
  post:   (path, body)   => apiFetch(path, { method: "POST",   body: JSON.stringify(body) }),
  patch:  (path, body)   => apiFetch(path, { method: "PATCH",  body: JSON.stringify(body) }),
  put:    (path, body)   => apiFetch(path, { method: "PUT",    body: JSON.stringify(body) }),
  del:    (path)         => apiFetch(path, { method: "DELETE" }),
};

// ─── React hook: useAPI(path) ──────────────────────────────────────────────
// Fetches on mount and returns { data, loading, error, refetch }.
// Pass null as path to skip the initial fetch.
export function useAPI(path) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(!!path);
  const [error,   setError]   = useState(null);

  const fetch_ = async (p = path) => {
    if (!p) return;
    setLoading(true); setError(null);
    try   { setData(await api.get(p)); }
    catch (e) { setError(e.message); }
    finally   { setLoading(false); }
  };

  useEffect(() => { fetch_(); }, [path]);  // eslint-disable-line

  return { data, loading, error, refetch: () => fetch_() };
}

// ─── Clients ───────────────────────────────────────────────────────────────
export const clientsAPI = {
  list:    ()        => api.get("/clients"),
  get:     (id)      => api.get(`/clients/${id}`),
  create:  (body)    => api.post("/clients", body),
  update:  (id, b)   => api.patch(`/clients/${id}`, b),
  remove:  (id)      => api.del(`/clients/${id}`),
};

// ─── Documents ─────────────────────────────────────────────────────────────
export const docsAPI = {
  list:    (params = {}) => api.get(`/documents?${new URLSearchParams(params)}`),
  push:    (id, msg)     => api.post(`/documents/${id}/push`, { message: msg }),
  viewed:  (id)          => api.patch(`/documents/${id}/viewed`, {}),
  remove:  (id)          => api.del(`/documents/${id}`),
};

// ─── Notifications + tasks ─────────────────────────────────────────────────
export const notifAPI = {
  list:        ()          => api.get("/notifications"),
  markRead:    (id)        => api.patch(`/notifications/${id}/read`, {}),
  markAllRead: ()          => api.post("/notifications/read-all", {}),
  pushTask:    (body)      => api.post("/tasks", body),
  sendReminder:(body)      => api.post("/reminders", body),
};

// ─── Messages ──────────────────────────────────────────────────────────────
export const messagesAPI = {
  thread: (clientId)   => api.get(`/messages/${clientId}`),
  send:   (clientId, text) => api.post(`/messages`, { clientId, text }),
};

// ─── Subscriptions + plugins ───────────────────────────────────────────────
export const subsAPI = {
  plan:           ()         => api.get("/subscriptions/plan"),
  addons:         ()         => api.get("/subscriptions/addons"),
  activateAddon:  (id, opts) => api.post(`/subscriptions/addons/${id}`, opts || {}),
  deactivateAddon:(id)       => api.del(`/subscriptions/addons/${id}`),
  plugins:        ()         => api.get("/plugins"),
  activatePlugin: (id, opts) => api.post(`/plugins/${id}/activate`, opts || {}),
};
