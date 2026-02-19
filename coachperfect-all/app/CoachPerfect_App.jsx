import { useState } from "react";
import CoachDashboard from "./CoachDashboard";
import ClientDashboard from "./ClientDashboard";
import LoginScreen from "./LoginScreen";
import { getUser, clearSession } from "./hooks/useAPI.js";

const C = {
  navy: "#1e3a5f", gold: "#c9a84c",
  cream: "#f4f1ea", text: "#4a5568", white: "#ffffff",
};

export default function CoachPerfectApp() {
  // Restore session from localStorage on first render
  const [user, setUser]     = useState(() => getUser());
  const [demoRole, setDemoRole] = useState(null); // demo view-as override

  const handleLogin  = (_token, loggedInUser) => setUser(loggedInUser);
  const handleLogout = () => { clearSession(); setUser(null); setDemoRole(null); };

  // Not authenticated → show login
  if (!user) return <LoginScreen onLogin={handleLogin} />;

  const effectiveRole = demoRole || user.role || "coach";

  return (
    <div style={{ position: "relative" }}>

      {/* ── Demo / Dev role switcher ────────────────────────────────────── */}
      <div style={{
        position: "fixed", bottom: 20, left: 20, zIndex: 9999,
        background: C.navy, borderRadius: 12, padding: "8px 10px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", gap: 6,
      }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginRight: 2 }}>VIEW AS:</span>

        {[{ id: "coach", icon: "👩‍💼" }, { id: "client", icon: "👤" }].map(r => (
          <button key={r.id} onClick={() => setDemoRole(r.id)}
            style={{
              padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
              background: effectiveRole === r.id ? C.gold : "rgba(255,255,255,0.08)",
              color: effectiveRole === r.id ? C.navy : "rgba(255,255,255,0.7)",
              fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4,
            }}>
            <span>{r.icon}</span>{r.id.charAt(0).toUpperCase() + r.id.slice(1)}
          </button>
        ))}

        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.15)", margin: "0 2px" }} />
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user.name?.split(" ")[0]}
        </span>
        <button onClick={handleLogout}
          style={{ padding: "5px 10px", borderRadius: 7, border: "none", background: "rgba(239,68,68,0.2)", color: "#fca5a5", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
          ⏏ Out
        </button>
      </div>

      {/* ── Active dashboard ─────────────────────────────────────────────── */}
      {effectiveRole === "coach"
        ? <CoachDashboard user={user} onLogout={handleLogout} />
        : <ClientDashboard user={user} />}
    </div>
  );
}
