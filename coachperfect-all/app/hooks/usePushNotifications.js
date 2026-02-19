// ─── Web Push Notifications Hook ─────────────────────────────────────────────
// Usage:
//   const { supported, enabled, requesting, requestPermission, sendTest } = usePushNotifications(userId);
//
// Setup checklist (production):
//   1. Generate VAPID keys:  npx web-push generate-vapid-keys
//   2. Add to server/.env:   VAPID_PUBLIC_KEY=...  VAPID_PRIVATE_KEY=...  VAPID_EMAIL=mailto:...
//   3. Set REACT_APP_VAPID_KEY in frontend .env
//   4. Register service worker (public/sw.js handles push events)
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { api } from "./useAPI.js";

const VAPID_PUBLIC_KEY = typeof process !== "undefined"
  ? process.env?.REACT_APP_VAPID_KEY || ""
  : "";

// Convert VAPID base64 key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding  = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64   = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw      = window.atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export function usePushNotifications(userId) {
  const supported  = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
  const [perm,      setPerm]      = useState(supported ? Notification.permission : "unsupported");
  const [enabled,   setEnabled]   = useState(false);
  const [requesting, setRequesting] = useState(false);

  // On mount: check if already subscribed
  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => { setEnabled(!!sub); });
    }).catch(() => {});
  }, []);

  const requestPermission = async () => {
    if (!supported) return { error: "Push not supported in this browser" };
    setRequesting(true);
    try {
      const permission = await Notification.requestPermission();
      setPerm(permission);
      if (permission !== "granted") return { error: "Permission denied" };

      // Register or get service worker
      const reg = await navigator.serviceWorker.ready;

      // Subscribe to push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: VAPID_PUBLIC_KEY ? urlBase64ToUint8Array(VAPID_PUBLIC_KEY) : undefined,
      });

      // Send subscription to backend
      await api.post("/push/subscribe", { userId, subscription: sub.toJSON() });

      setEnabled(true);
      return { success: true };
    } catch (err) {
      return { error: err.message };
    } finally {
      setRequesting(false);
    }
  };

  const unsubscribe = async () => {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) { await sub.unsubscribe(); await api.del(`/push/subscribe/${userId}`); }
    setEnabled(false);
  };

  // Send a test notification via the API
  const sendTest = () => api.post("/push/test", { userId, title: "CoachPerfect", body: "Push notifications are working!" });

  return { supported, enabled, requesting, permission: perm, requestPermission, unsubscribe, sendTest };
}

// ─── Standalone helper: show an in-app banner asking to enable push ───────────
// Usage: <PushPromptBanner userId={user.id} />
export function PushPromptBanner({ userId }) {
  const { supported, enabled, requesting, requestPermission } = usePushNotifications(userId);
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem("cp_push_dismissed"));

  if (!supported || enabled || dismissed) return null;

  return (
    <div style={{
      position: "fixed", top: 16, right: 16, zIndex: 8888,
      background: "#1e3a5f", color: "#fff", borderRadius: 12,
      padding: "14px 18px", maxWidth: 320, boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>🔔 Stay notified</div>
        <button onClick={() => { setDismissed(true); localStorage.setItem("cp_push_dismissed", "1"); }}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 16, cursor: "pointer", lineHeight: 1 }}>✕</button>
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>
        Get instant alerts for new tasks, client uploads, and AI agent updates — even when the app isn't open.
      </div>
      <button onClick={requestPermission} disabled={requesting}
        style={{ padding: "8px 0", borderRadius: 8, background: "#c9a84c", color: "#1e3a5f", border: "none", fontSize: 12, fontWeight: 700, cursor: requesting ? "not-allowed" : "pointer" }}>
        {requesting ? "Enabling..." : "Enable Notifications"}
      </button>
    </div>
  );
}
