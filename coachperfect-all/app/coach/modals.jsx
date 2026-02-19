import { useState, useRef } from "react";
import { C, CLIENTS, SUBSCRIPTION_ADDONS } from "./styles.js";
import { FileIcon } from "./components.jsx";

// ─── PUSH TASK / REMINDER MODAL ──────────────────────────────────────────────────
export function PushModal({ isOpen, onClose, clients, mode, preselectedClient }) {
  const [selectedClient, setSelectedClient] = useState(preselectedClient ? String(preselectedClient.id) : "");
  const [taskText, setTaskText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;
  const isReminder = mode === "reminder";

  const handleSend = () => {
    if (!selectedClient || !taskText) return;
    setSent(true);
    setTimeout(() => { setSent(false); setTaskText(""); setSelectedClient(""); setDueDate(""); onClose(); }, 1600);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
      <div style={{ position: "relative", width: 500, maxWidth: "92vw", background: C.white, borderRadius: 16, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "36px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>{isReminder ? "🔔" : "✅"}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display', Georgia, serif" }}>{isReminder ? "Reminder Sent!" : "Task Pushed!"}</div>
            <div style={{ fontSize: 13, color: C.text, marginTop: 6 }}>Client notified instantly.</div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display', Georgia, serif" }}>
                {isReminder ? "🔔 Send Reminder" : "📋 Push Task to Client"}
              </h2>
              <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.text }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>Client *</label>
                <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy, background: C.white }}>
                  <option value="">Select a client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} — {c.company}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>{isReminder ? "Message *" : "Task Description *"}</label>
                <textarea value={taskText} onChange={e => setTaskText(e.target.value)}
                  placeholder={isReminder ? "e.g., Don't forget to complete your weekly reflection before our session..." : "e.g., Complete leadership self-assessment — focus on delegation score..."}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy, minHeight: 90, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }} />
              </div>
              {!isReminder && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>Priority</label>
                    <select value={priority} onChange={e => setPriority(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy, background: C.white }}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>Due Date</label>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy }} />
                  </div>
                </div>
              )}
              <button onClick={handleSend} disabled={!selectedClient || !taskText}
                style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: "none", background: (!selectedClient || !taskText) ? "#d1d5db" : C.navy, color: C.white, fontSize: 14, fontWeight: 700, cursor: (!selectedClient || !taskText) ? "default" : "pointer", transition: "background 0.2s" }}>
                {isReminder ? "Send Reminder" : "Push Task to Client"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── DOCUMENT UPLOAD & PUSH MODAL ────────────────────────────────────────────────
export function DocumentModal({ isOpen, onClose, clients, mode, preselectedClient }) {
  const [selectedClient, setSelectedClient] = useState(preselectedClient ? String(preselectedClient.id) : "");
  const [docName, setDocName] = useState("");
  const [category, setCategory] = useState("Reports");
  const [pushNow, setPushNow] = useState(mode === "push");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [done, setDone] = useState(false);
  const fileRef = useRef();

  if (!isOpen) return null;
  const isUpload = mode === "upload";
  const isPush = mode === "push";

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setDocName(f.name); }
  };

  const handleAction = () => {
    if (isUpload && !file) return;
    if (isPush && !selectedClient) return;
    setDone(true);
    setTimeout(() => { setDone(false); setFile(null); setDocName(""); setMessage(""); onClose(); }, 1600);
  };

  const categories = ["Reports", "Diagnostics", "Action Plans", "Session Notes", "Contracts", "Resources", "Strategy", "Presentations", "Goals", "Operations"];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
      <div style={{ position: "relative", width: 520, maxWidth: "92vw", background: C.white, borderRadius: 16, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        {done ? (
          <div style={{ textAlign: "center", padding: "36px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>{isUpload ? "📁" : "📤"}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display', Georgia, serif" }}>
              {isUpload ? "Document Uploaded!" : "Document Sent!"}
            </div>
            <div style={{ fontSize: 13, color: C.text, marginTop: 6 }}>
              {pushNow || isPush ? "Client has been notified and can view it now." : "Saved to client file."}
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display', Georgia, serif" }}>
                {isUpload ? "📁 Upload Document" : "📤 Push Document to Client"}
              </h2>
              <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.text }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Client selector */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>Client File *</label>
                <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy, background: C.white }}>
                  <option value="">Select a client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} — {c.company}</option>)}
                </select>
              </div>

              {/* File drop zone */}
              {isUpload && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>File *</label>
                  <div
                    onClick={() => fileRef.current.click()}
                    style={{ border: `2px dashed ${file ? C.success : C.border}`, borderRadius: 10, padding: "22px 16px", textAlign: "center", cursor: "pointer", background: file ? `${C.success}06` : C.cream, transition: "all 0.2s" }}>
                    {file ? (
                      <div>
                        <div style={{ fontSize: 28 }}>✅</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginTop: 4 }}>{file.name}</div>
                        <div style={{ fontSize: 11, color: C.text }}>{(file.size / 1024).toFixed(0)} KB</div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 28 }}>📁</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginTop: 4 }}>Click to upload or drag & drop</div>
                        <div style={{ fontSize: 11, color: C.text, marginTop: 2 }}>PDF, Word, Excel, PowerPoint, Images — up to 50MB</div>
                      </div>
                    )}
                    <input ref={fileRef} type="file" onChange={handleFile} style={{ display: "none" }}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg" />
                  </div>
                </div>
              )}

              {/* Doc name override */}
              {file && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>Display Name</label>
                  <input value={docName} onChange={e => setDocName(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy }} />
                </div>
              )}

              {/* Category */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy, background: C.white }}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Push toggle */}
              {isUpload && (
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 12px", background: C.cream, borderRadius: 8 }}>
                  <input type="checkbox" checked={pushNow} onChange={e => setPushNow(e.target.checked)} style={{ width: 16, height: 16, cursor: "pointer" }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>Push to client immediately</div>
                    <div style={{ fontSize: 11, color: C.text }}>Client will receive an alert and can view this document</div>
                  </div>
                </label>
              )}

              {/* Optional message */}
              {(pushNow || isPush) && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>Message to client (optional)</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="e.g., Here's your Q4 review — please read before our session on Thursday..."
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy, minHeight: 70, resize: "none", fontFamily: "inherit" }} />
                </div>
              )}

              <button onClick={handleAction} disabled={isUpload ? !file || !selectedClient : !selectedClient}
                style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: "none", background: (isUpload ? !file || !selectedClient : !selectedClient) ? "#d1d5db" : C.navy, color: C.white, fontSize: 14, fontWeight: 700, cursor: (isUpload ? !file || !selectedClient : !selectedClient) ? "default" : "pointer" }}>
                {isUpload ? (pushNow ? "Upload & Push to Client" : "Upload to Client File") : "Push Document to Client"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── ADD-ON MODAL ────────────────────────────────────────────────────────────────
export function AddOnModal({ isOpen, onClose, addon, clientName }) {
  const [purchasing, setPurchasing] = useState(false);
  const [done, setDone] = useState(false);

  if (!isOpen || !addon) return null;

  const handlePurchase = () => {
    setPurchasing(true);
    setTimeout(() => { setPurchasing(false); setDone(true); }, 1200);
    setTimeout(() => { setDone(false); onClose(); }, 2800);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
      <div style={{ position: "relative", width: 460, maxWidth: "92vw", background: C.white, borderRadius: 16, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        {done ? (
          <div style={{ textAlign: "center", padding: "36px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display', Georgia, serif" }}>Add-On Activated!</div>
            <div style={{ fontSize: 13, color: C.text, marginTop: 6 }}>
              {clientName ? `${clientName} now has access to ${addon.name}.` : `${addon.name} is now active.`}
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 36 }}>{addon.icon}</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display', Georgia, serif" }}>{addon.name}</h2>
                  <div style={{ fontSize: 12, color: C.text, marginTop: 2 }}>Available for: {addon.available}</div>
                </div>
              </div>
              <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.text }}>✕</button>
            </div>

            <div style={{ padding: 16, background: C.cream, borderRadius: 10, marginBottom: 18 }}>
              <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.55 }}>{addon.description}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: C.text, fontWeight: 600, marginBottom: 2 }}>Pricing</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.navy }}>{addon.price}</div>
              </div>
              {addon.purchased > 0 && (
                <div style={{ padding: "4px 12px", background: `${C.success}15`, borderRadius: 20, fontSize: 11, fontWeight: 700, color: C.success }}>
                  ✓ {addon.purchased} Active
                </div>
              )}
            </div>

            {clientName && (
              <div style={{ padding: "10px 12px", background: `${C.info}10`, borderRadius: 8, marginBottom: 14, fontSize: 12, color: C.info, fontWeight: 600 }}>
                Activating for: {clientName}
              </div>
            )}

            <button onClick={handlePurchase} disabled={purchasing}
              style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: "none", background: purchasing ? C.text : C.gold, color: purchasing ? C.white : C.navy, fontSize: 14, fontWeight: 700, cursor: purchasing ? "default" : "pointer", transition: "all 0.2s" }}>
              {purchasing ? "Processing..." : `Add ${addon.name}`}
            </button>
            <button onClick={onClose} style={{ width: "100%", marginTop: 8, padding: "10px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── NEW CLIENT MODAL ────────────────────────────────────────────────────────────
export function NewClientModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", company: "", engagement: "1:1 Coaching", plan: "professional" });
  const [done, setDone] = useState(false);
  if (!isOpen) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = () => {
    setDone(true);
    setTimeout(() => { setDone(false); setStep(1); setForm({ name: "", email: "", company: "", engagement: "1:1 Coaching", plan: "professional" }); onClose(); }, 2000);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
      <div style={{ position: "relative", width: 500, maxWidth: "92vw", background: C.white, borderRadius: 16, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        {done ? (
          <div style={{ textAlign: "center", padding: "36px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🚀</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display', Georgia, serif" }}>Client Created!</div>
            <div style={{ fontSize: 13, color: C.text, marginTop: 6 }}>Welcome email, diagnostic invite, and portal access sent to {form.email}.</div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display', Georgia, serif" }}>
                👤 Add New Client
              </h2>
              <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.text }}>✕</button>
            </div>

            {/* Step indicator */}
            <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
              {["Profile", "Engagement", "Plan"].map((s, i) => (
                <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", height: 4, borderRadius: 2, background: step > i ? C.gold : step === i + 1 ? C.gold : C.border }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: step === i + 1 ? C.navy : C.text }}>{s}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {step === 1 && (
                <>
                  {[["Full Name", "name", "e.g., Chris Ciesielski"], ["Email Address", "email", "e.g., chris@nfp.com"], ["Company / Organization", "company", "e.g., NFP Insurance"]].map(([label, key, ph]) => (
                    <div key={key}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>{label} *</label>
                      <input value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy }} />
                    </div>
                  ))}
                  <button onClick={() => setStep(2)} disabled={!form.name || !form.email}
                    style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: (!form.name || !form.email) ? "#d1d5db" : C.navy, color: C.white, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                    Next →
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>Engagement Type</label>
                    <select value={form.engagement} onChange={e => set("engagement", e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy, background: C.white }}>
                      {["1:1 Coaching", "CEO Roundtable", "Peer Group", "RISE Program", "Team Coaching", "Group Workshop"].map(e => <option key={e}>{e}</option>)}
                    </select>
                  </div>
                  <div style={{ padding: 14, background: `${C.info}08`, borderRadius: 10, border: `1px solid ${C.info}20` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.info, marginBottom: 4 }}>🤖 AI Onboarding Agent will automatically:</div>
                    {["Send welcome email with portal access", "Send 48-question diagnostic invite", "Create client file in document vault", "Add to coaching calendar", "Set up weekly pulse check-in"].map(a => (
                      <div key={a} style={{ fontSize: 11, color: C.text, padding: "2px 0" }}>✓ {a}</div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setStep(1)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← Back</button>
                    <button onClick={() => setStep(3)} style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: C.navy, color: C.white, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Next →</button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 8 }}>Subscription Plan</label>
                    {[
                      { id: "starter", label: "Starter", price: "$49/mo", features: "Up to 10 clients, unlimited sessions" },
                      { id: "professional", label: "Professional", price: "$149/mo", features: "25 clients, AI prep, habit tracker, ROI reports" },
                      { id: "business", label: "Business", price: "$349/mo", features: "Unlimited clients, team diagnostics, API, email marketing" },
                    ].map(plan => (
                      <label key={plan.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: 10, border: `2px solid ${form.plan === plan.id ? C.gold : C.border}`, marginBottom: 8, cursor: "pointer", background: form.plan === plan.id ? `${C.gold}08` : C.white, transition: "all 0.15s" }}>
                        <input type="radio" name="plan" value={plan.id} checked={form.plan === plan.id} onChange={e => set("plan", e.target.value)} style={{ marginTop: 2 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{plan.label}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>{plan.price}</span>
                          </div>
                          <div style={{ fontSize: 11, color: C.text, marginTop: 2 }}>{plan.features}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setStep(2)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← Back</button>
                    <button onClick={handleCreate} style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: C.gold, color: C.navy, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                      Create Client & Launch Onboarding 🚀
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
