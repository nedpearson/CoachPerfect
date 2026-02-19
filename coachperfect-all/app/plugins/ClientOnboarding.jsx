import { useState } from "react";

const C = {
  navy: "#1e3a5f", navyLight: "#2d5a8e", gold: "#c9a84c",
  cream: "#f4f1ea", white: "#ffffff", text: "#4a5568",
  border: "#e2d9c8", success: "#10b981",
};

const GOALS = ["Revenue Growth", "Leadership Development", "Team Building", "Exit Planning", "Operational Efficiency", "Customer Acquisition", "Financial Health", "Work-Life Balance", "Strategic Clarity", "Accountability"];

const INDUSTRIES = ["Technology", "Healthcare", "Financial Services", "Manufacturing", "Real Estate", "Retail", "Professional Services", "Construction", "Nonprofit", "Other"];

const STEPS = ["Welcome", "Your Profile", "Your Business", "Your Goals", "You're In!"];

// ─── FIELD component ──────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = { padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy, outline: "none", background: C.white };

// ─── CLIENT ONBOARDING ───────────────────────────────────────────────────────
export function ClientOnboarding({ coachName = "Your Coach", clientName = "there", onComplete }) {
  const [step, setStep]     = useState(0);
  const [form, setForm]     = useState({ name: clientName === "there" ? "" : clientName, email: "", phone: "", title: "", company: "", industry: "", revenue: "", employees: "", goals: [] });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const toggleGoal = (g) => set("goals", form.goals.includes(g) ? form.goals.filter(x => x !== g) : [...form.goals, g]);
  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));
  const pct  = Math.round(((step) / (STEPS.length - 1)) * 100);

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Inter',system-ui,sans-serif", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 480, background: C.white, borderRadius: 20, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.3)" }}>

        {/* Progress bar */}
        <div style={{ height: 4, background: C.cream }}>
          <div style={{ height: "100%", width: `${pct}%`, background: C.gold, transition: "width 0.4s" }} />
        </div>

        {/* Step header */}
        <div style={{ padding: "24px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: 1 }}>STEP {step + 1} OF {STEPS.length}</div>
          <div style={{ fontSize: 11, color: C.text }}>{STEPS[step]}</div>
        </div>

        <div style={{ padding: "18px 28px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ─ STEP 0: WELCOME ─ */}
          {step === 0 && (
            <>
              <div>
                <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display',Georgia,serif" }}>Welcome, {form.name || "let's get started"}!</h2>
                <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.5 }}>
                  <strong style={{ color: C.navy }}>{coachName}</strong> has invited you to their coaching platform. This takes 2 minutes and unlocks your personal client portal.
                </p>
              </div>
              <Field label="Your Name">
                <input style={inputStyle} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Full name" />
              </Field>
              <Field label="Email Address">
                <input style={inputStyle} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@company.com" />
              </Field>
            </>
          )}

          {/* ─ STEP 1: PROFILE ─ */}
          {step === 1 && (
            <>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display',Georgia,serif" }}>Your Profile</h2>
              <Field label="Phone (optional)">
                <input style={inputStyle} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+1 555 000 0000" />
              </Field>
              <Field label="Your Title / Role">
                <input style={inputStyle} value={form.title} onChange={e => set("title", e.target.value)} placeholder="CEO, President, Owner..." />
              </Field>
            </>
          )}

          {/* ─ STEP 2: BUSINESS ─ */}
          {step === 2 && (
            <>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display',Georgia,serif" }}>Your Business</h2>
              <Field label="Company Name">
                <input style={inputStyle} value={form.company} onChange={e => set("company", e.target.value)} placeholder="Acme Corp" />
              </Field>
              <Field label="Industry">
                <select style={{ ...inputStyle, cursor: "pointer" }} value={form.industry} onChange={e => set("industry", e.target.value)}>
                  <option value="">Select industry...</option>
                  {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                </select>
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Annual Revenue">
                  <select style={{ ...inputStyle, cursor: "pointer" }} value={form.revenue} onChange={e => set("revenue", e.target.value)}>
                    <option value="">Revenue...</option>
                    {["<$500K","$500K–$1M","$1M–$5M","$5M–$20M","$20M+"].map(r => <option key={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Employees">
                  <select style={{ ...inputStyle, cursor: "pointer" }} value={form.employees} onChange={e => set("employees", e.target.value)}>
                    <option value="">Size...</option>
                    {["1–5","6–25","26–100","101–500","500+"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
            </>
          )}

          {/* ─ STEP 3: GOALS ─ */}
          {step === 3 && (
            <>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display',Georgia,serif" }}>Top Priorities</h2>
              <p style={{ margin: 0, fontSize: 12, color: C.text }}>Select the areas you most want to work on. Pick up to 3.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {GOALS.map(g => {
                  const on = form.goals.includes(g);
                  const maxed = form.goals.length >= 3 && !on;
                  return (
                    <button key={g} onClick={() => !maxed && toggleGoal(g)} disabled={maxed}
                      style={{ padding: "7px 14px", borderRadius: 8, border: `2px solid ${on ? C.gold : C.border}`, background: on ? `${C.gold}18` : maxed ? "#f9fafb" : C.white, color: on ? C.navy : maxed ? "#9ca3af" : C.text, fontSize: 12, fontWeight: on ? 700 : 500, cursor: maxed ? "not-allowed" : "pointer" }}>
                      {on ? "✓ " : ""}{g}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ─ STEP 4: DONE ─ */}
          {step === 4 && (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
              <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display',Georgia,serif" }}>You're all set!</h2>
              <p style={{ margin: "0 0 20px", fontSize: 13, color: C.text, lineHeight: 1.5 }}>
                Your profile has been sent to <strong>{coachName}</strong>. Your coaching portal is ready — tasks, documents, and session notes will appear here.
              </p>
              <button onClick={() => onComplete && onComplete(form)}
                style={{ padding: "12px 28px", borderRadius: 10, background: C.navy, color: C.white, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Open My Portal →
              </button>
            </div>
          )}

          {/* Nav buttons */}
          {step < 4 && (
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 4 }}>
              {step > 0
                ? <button onClick={back} style={{ padding: "10px 20px", borderRadius: 8, background: C.cream, border: `1px solid ${C.border}`, fontSize: 12, fontWeight: 600, color: C.text, cursor: "pointer" }}>← Back</button>
                : <div />}
              <button onClick={next} disabled={step === 0 && (!form.name || !form.email)}
                style={{ flex: 1, maxWidth: 180, padding: "10px 0", borderRadius: 8, background: (step === 0 && (!form.name || !form.email)) ? "#9ca3af" : C.navy, color: C.white, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                {step === 3 ? "Finish →" : "Continue →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
