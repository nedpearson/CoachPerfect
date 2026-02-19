import { useState } from "react";

const C = {
  navy: "#1e3a5f", navyLight: "#2d5a8e", gold: "#c9a84c",
  cream: "#f4f1ea", white: "#ffffff", text: "#4a5568",
  border: "#e2d9c8", danger: "#ef4444",
};

const API = process.env.REACT_APP_API_URL || "http://localhost:3002/api";

export default function LoginScreen({ onLogin }) {
  const [role, setRole]       = useState("coach");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); return; }
      localStorage.setItem("cp_token", data.token);
      localStorage.setItem("cp_user",  JSON.stringify(data.user));
      onLogin(data.token, data.user);
    } catch {
      setError("Cannot reach server — is the API running?");
    } finally { setLoading(false); }
  };

  // Demo bypass — no server needed
  const demoLogin = (demoRole) => {
    const user = demoRole === "coach"
      ? { id: "demo-coach", name: "Meredith Eicher", email: "meredith@coachperfect.co", role: "coach", plan: "professional" }
      : { id: "demo-client", name: "Chris Ciesielski", email: "chris@nfp.com", role: "client", plan: "starter" };
    localStorage.setItem("cp_token", "demo-token");
    localStorage.setItem("cp_user",  JSON.stringify(user));
    onLogin("demo-token", user);
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Inter',system-ui,sans-serif" }}>
      <div style={{ width: 400, background: C.white, borderRadius: 20, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.35)" }}>

        {/* Logo strip */}
        <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, padding: "28px 32px 22px", textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, letterSpacing: 3, marginBottom: 4 }}>COACHPERFECT</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.white, fontFamily: "'DM Serif Display',Georgia,serif" }}>Welcome back</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>Sign in to your coaching platform</div>
        </div>

        <div style={{ padding: "28px 32px 32px" }}>
          {/* Role toggle */}
          <div style={{ display: "flex", background: C.cream, borderRadius: 10, padding: 3, marginBottom: 22 }}>
            {[{ id: "coach", label: "Coach", icon: "👩‍💼" }, { id: "client", label: "Client", icon: "👤" }].map(r => (
              <button key={r.id} onClick={() => setRole(r.id)}
                style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12,
                  background: role === r.id ? C.navy : "transparent", color: role === r.id ? C.white : C.text, transition: "all 0.2s" }}>
                {r.icon} {r.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.text, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder={role === "coach" ? "coach@yourfirm.com" : "client@company.com"}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.text, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy, outline: "none", boxSizing: "border-box" }} />
            </div>

            {error && <div style={{ padding: "9px 12px", borderRadius: 8, background: "#fef2f2", border: `1px solid ${C.danger}30`, fontSize: 12, color: C.danger }}>{error}</div>}

            <button type="submit" disabled={loading}
              style={{ padding: "11px 0", borderRadius: 10, background: loading ? "#9ca3af" : C.navy, color: C.white, border: "none", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
              {loading ? "Signing in..." : `Sign in as ${role === "coach" ? "Coach" : "Client"}`}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontSize: 11, color: C.text }}>or</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          {/* Demo buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => demoLogin("coach")} style={{ flex: 1, padding: "9px 0", borderRadius: 8, background: C.cream, border: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.navy, cursor: "pointer" }}>
              🎭 Demo — Coach
            </button>
            <button onClick={() => demoLogin("client")} style={{ flex: 1, padding: "9px 0", borderRadius: 8, background: C.cream, border: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.navy, cursor: "pointer" }}>
              🎭 Demo — Client
            </button>
          </div>

          <div style={{ marginTop: 16, textAlign: "center", fontSize: 10, color: `${C.text}88` }}>
            Demo mode runs without the API server · Data is local only
          </div>
        </div>
      </div>
    </div>
  );
}
