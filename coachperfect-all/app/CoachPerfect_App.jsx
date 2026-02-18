import { useState } from "react";
import CoachDashboard from "./CoachDashboard";
import ClientDashboard from "./ClientDashboard";

/**
 * CoachPerfect App Shell
 *
 * Top-level component that manages role-based view switching between:
 * - Coach Dashboard (with Personal/Business toggle)
 * - Client Dashboard (full client portal experience)
 *
 * In production, the active role would be determined by authentication.
 * This demo includes a role switcher for demonstration purposes.
 */

const C = {
  navy: "#1e3a5f",
  gold: "#c9a84c",
  cream: "#f4f1ea",
  text: "#4a5568",
  white: "#ffffff",
};

export default function CoachPerfectApp() {
  const [role, setRole] = useState("coach"); // "coach" | "client"

  return (
    <div style={{ position: "relative" }}>
      {/* Demo Role Switcher — In production this is determined by auth */}
      <div style={{
        position: "fixed", bottom: 20, left: 20, zIndex: 9999,
        background: C.navy, borderRadius: 12, padding: "8px 10px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", gap: 6,
      }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginRight: 4, fontWeight: 600 }}>VIEW AS:</span>
        {[
          { id: "coach", label: "Coach", icon: "👩‍💼" },
          { id: "client", label: "Client", icon: "👤" },
        ].map(r => (
          <button
            key={r.id}
            onClick={() => setRole(r.id)}
            style={{
              padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
              background: role === r.id ? C.gold : "rgba(255,255,255,0.08)",
              color: role === r.id ? C.navy : "rgba(255,255,255,0.7)",
              fontSize: 11, fontWeight: 700, transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            <span>{r.icon}</span>{r.label}
          </button>
        ))}
      </div>

      {/* Render active dashboard */}
      {role === "coach" ? <CoachDashboard /> : <ClientDashboard />}
    </div>
  );
}
