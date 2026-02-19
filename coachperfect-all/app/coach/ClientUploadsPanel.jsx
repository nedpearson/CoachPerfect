import { useState } from "react";
import { C, CLIENTS } from "./styles.js";
import { Card, CardTitle, FileIcon } from "./components.jsx";

// ─── CLIENT UPLOAD MOCK DATA ──────────────────────────────────────────────────
const CLIENT_UPLOADS = [
  { id: "cu1", clientId: 1, clientName: "Chris Ciesielski", company: "NFP",              name: "Q3 Financials.xlsx",              type: "spreadsheet", size: "640 KB",  date: "Today 4:12 PM",    status: "new",    category: null,          note: "Hey Meredith — here are the Q3 numbers. Let me know what you think." },
  { id: "cu2", clientId: 2, clientName: "Delaine Calder",   company: "Calder Advisory",  name: "Board Meeting Deck v2.pptx",      type: "presentation",size: "4.2 MB",  date: "Yesterday 10:30 AM",status: "new",    category: null,          note: "Updated deck — incorporated your feedback on slide 8." },
  { id: "cu3", clientId: 3, clientName: "Manville Borne",   company: "Borne Industries", name: "SOP Draft - Client Onboarding.docx",type: "document",  size: "220 KB",  date: "Feb 17 2:00 PM",   status: "filed",  category: "Operations",  note: null },
  { id: "cu4", clientId: 4, clientName: "Chad Heiser",      company: "Heiser Group",     name: "Employee Survey Results Q1.xlsx",  type: "spreadsheet",size: "890 KB",  date: "Feb 16 9:15 AM",   status: "filed",  category: "Diagnostics", note: "Survey results from my team." },
  { id: "cu5", clientId: 1, clientName: "Chris Ciesielski", company: "NFP",              name: "Leadership Reflection - Week 6.pdf",type: "pdf",       size: "112 KB",  date: "Feb 15 6:00 PM",   status: "new",    category: null,          note: "Weekly reflection as assigned. Struggled with the delegation section." },
  { id: "cu6", clientId: 5, clientName: "Sarah Rainwater",  company: "Rainwater Realty", name: "Cash Flow Model (updated).xlsx",   type: "spreadsheet",size: "1.1 MB",  date: "Feb 10 3:30 PM",   status: "filed",  category: "Financial",   note: null },
];

const CATEGORIES = ["Reports", "Diagnostics", "Action Plans", "Operations", "Financial", "Strategy", "Leadership", "Marketing", "People", "Customer", "Other"];

export function ClientUploadsPanel() {
  const [uploads, setUploads] = useState(CLIENT_UPLOADS);
  const [selectedClient, setSelectedClient] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // all | new | filed
  const [filing, setFiling] = useState(null); // { id, category }

  const filtered = uploads.filter(u => {
    if (selectedClient !== "all" && String(u.clientId) !== selectedClient) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    return true;
  });

  const newCount = uploads.filter(u => u.status === "new").length;

  const fileUpload = (id, category) => {
    setUploads(prev => prev.map(u => u.id === id ? { ...u, status: "filed", category } : u));
    setFiling(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {[
          { icon: "⬆", label: "Total Client Uploads", value: uploads.length, color: C.navy },
          { icon: "🆕", label: "New — Needs Review",   value: newCount,       color: "#f59e0b" },
          { icon: "✅", label: "Filed in Vault",        value: uploads.filter(u => u.status === "filed").length, color: "#10b981" },
        ].map((s, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: "16px 18px", textAlign: "center" }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, margin: "4px 0 2px" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.text }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Card>
        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)}
            style={{ padding: "7px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, color: C.navy, background: C.white }}>
            <option value="all">All Clients</option>
            {CLIENTS.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>

          <div style={{ display: "flex", gap: 6 }}>
            {["all", "new", "filed"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: statusFilter === s ? C.navy : C.cream, color: statusFilter === s ? C.white : C.text, fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
                {s === "new" && newCount > 0 ? `New (${newCount})` : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Upload list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: C.text }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
              <div style={{ fontSize: 13 }}>No uploads match your filters.</div>
            </div>
          )}
          {filtered.map(upload => (
            <div key={upload.id} style={{ padding: "12px 14px", borderRadius: 10, border: `1px solid ${upload.status === "new" ? "#f59e0b40" : C.border}`, background: upload.status === "new" ? `#f59e0b04` : C.white, borderLeft: `4px solid ${upload.status === "new" ? "#f59e0b" : "#10b981"}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <FileIcon type={upload.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{upload.name}</span>
                    <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 6, background: upload.status === "new" ? "#f59e0b18" : "#10b98118", color: upload.status === "new" ? "#f59e0b" : "#10b981", fontWeight: 700 }}>{upload.status === "new" ? "NEW" : "FILED"}</span>
                    {upload.category && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 6, background: `${C.navy}12`, color: C.navy, fontWeight: 600 }}>{upload.category}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: C.text, marginBottom: 4 }}>
                    <strong>{upload.clientName}</strong> · {upload.company} · {upload.size} · {upload.date}
                  </div>
                  {upload.note && (
                    <div style={{ fontSize: 11, color: C.text, fontStyle: "italic", padding: "6px 10px", background: C.cream, borderRadius: 6, marginBottom: 6, borderLeft: `2px solid ${C.border}` }}>
                      "{upload.note}"
                    </div>
                  )}

                  {/* File-to-vault picker */}
                  {filing?.id === upload.id ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                      <select value={filing.category} onChange={e => setFiling(f => ({ ...f, category: e.target.value }))}
                        style={{ flex: 1, padding: "6px 8px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 11, color: C.navy, background: C.white }}>
                        <option value="">Select category...</option>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <button onClick={() => fileUpload(upload.id, filing.category)} disabled={!filing.category}
                        style={{ padding: "6px 14px", borderRadius: 6, background: filing.category ? "#10b981" : "#d1d5db", color: "#fff", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                        File It ✓
                      </button>
                      <button onClick={() => setFiling(null)}
                        style={{ padding: "6px 10px", borderRadius: 6, background: "transparent", border: `1px solid ${C.border}`, fontSize: 10, color: C.text, cursor: "pointer" }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      <button style={{ padding: "5px 12px", borderRadius: 6, background: C.navy, color: C.white, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>⬇ Download</button>
                      {upload.status === "new" && (
                        <button onClick={() => setFiling({ id: upload.id, category: "" })}
                          style={{ padding: "5px 12px", borderRadius: 6, background: "#f59e0b18", color: "#f59e0b", border: `1px solid #f59e0b40`, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                          📁 File in Vault
                        </button>
                      )}
                      <button style={{ padding: "5px 12px", borderRadius: 6, background: C.cream, color: C.text, border: `1px solid ${C.border}`, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>📤 Push Back</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
