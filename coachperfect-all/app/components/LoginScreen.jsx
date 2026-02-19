// ═══════════════════════════════════════════════════
// COACH PERFECT — LOGIN / REGISTER SCREEN
// ═══════════════════════════════════════════════════

import { useState } from "react";
import api from "../lib/api";
import { C } from "./theme";

export default function LoginScreen({ onAuth }) {
  const [mode, setMode]       = useState("login"); // "login" | "register"
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [name, setName]       = useState("");
  const [biz, setBiz]         = useState("");
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let data;
      if (mode === "login") {
        data = await api.login(email, password);
      } else {
        if (!name.trim()) { setError("Name is required"); setLoading(false); return; }
        data = await api.register(email, password, name, biz);
      }
      onAuth(data.coach);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.surface,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter',-apple-system,system-ui,sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 14,
          border: `1px solid ${C.border}`,
          padding: "36px 32px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: C.primary, letterSpacing: -0.5 }}>
            <span style={{ color: C.accent }}>Coach</span>Perfect
          </span>
          <p style={{ margin: "6px 0 0", fontSize: 13.5, color: C.muted }}>
            {mode === "login" ? "Sign in to your account" : "Create your coach account"}
          </p>
        </div>

        {/* Tab toggle */}
        <div
          style={{
            display: "flex",
            background: C.surface,
            borderRadius: 8,
            padding: 3,
            marginBottom: 22,
            border: `1px solid ${C.border}`,
          }}
        >
          {["login", "register"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); }}
              style={{
                flex: 1,
                padding: "7px 0",
                border: "none",
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
                background: mode === m ? "#fff" : "transparent",
                color: mode === m ? C.primary : C.muted,
                boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
              }}
            >
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {mode === "register" && (
            <>
              <Field label="Your Name" value={name} onChange={setName} placeholder="Jane Smith" required />
              <Field label="Business Name (optional)" value={biz} onChange={setBiz} placeholder="Acme Coaching" />
            </>
          )}
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
          <Field label="Password" type="password" value={password} onChange={setPass} placeholder="••••••••" required />

          {error && (
            <div
              style={{
                padding: "9px 12px",
                borderRadius: 7,
                background: `${C.danger}10`,
                border: `1px solid ${C.danger}30`,
                fontSize: 12.5,
                color: C.danger,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              padding: "11px 0",
              background: loading ? C.muted : C.primary,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: 0.1,
            }}
          >
            {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {mode === "login" && (
          <p style={{ textAlign: "center", fontSize: 11.5, color: C.muted, marginTop: 18 }}>
            Don't have an account?{" "}
            <button
              onClick={() => { setMode("register"); setError(null); }}
              style={{ background: "none", border: "none", color: C.accent, fontSize: 11.5, fontWeight: 600, cursor: "pointer", padding: 0 }}
            >
              Sign up free
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, placeholder, required }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 5 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          width: "100%",
          padding: "9px 11px",
          borderRadius: 7,
          border: `1px solid ${C.border}`,
          fontSize: 13,
          outline: "none",
          boxSizing: "border-box",
          color: C.primary,
        }}
      />
    </div>
  );
}
