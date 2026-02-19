import { useState } from "react";
import { C, CLIENT_DOCUMENTS, CLIENTS } from "./styles.js";
import { Card, CardTitle, FileIcon } from "./components.jsx";

export function DocumentsPanel({ onUpload, onPush }) {
  const [selectedClientId, setSelectedClientId] = useState(1);
  const [filterCategory, setFilterCategory] = useState("All");

  const docs = CLIENT_DOCUMENTS[selectedClientId] || [];
  const categories = ["All", ...new Set(docs.map(d => d.category))];
  const filtered = filterCategory === "All" ? docs : docs.filter(d => d.category === filterCategory);
  const client = CLIENTS.find(c => c.id === selectedClientId);

  const totalDocs = Object.values(CLIENT_DOCUMENTS).flat().length;
  const totalPushed = Object.values(CLIENT_DOCUMENTS).flat().filter(d => d.pushedToClient).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { icon: "📁", label: "Total Documents", value: totalDocs },
          { icon: "📤", label: "Pushed to Clients", value: totalPushed },
          { icon: "👥", label: "Clients with Files", value: Object.keys(CLIENT_DOCUMENTS).length },
        ].map((s, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: "16px 18px", textAlign: "center" }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.navy, margin: "4px 0 2px" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.text }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Card>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display', Georgia, serif" }}>Client Document Vault</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onUpload(client)}
              style={{ padding: "7px 14px", borderRadius: 8, background: C.navy, color: C.white, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              ⬆ Upload
            </button>
            <button onClick={() => onPush(client)}
              style={{ padding: "7px 14px", borderRadius: 8, background: C.gold, color: C.navy, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              📤 Push to Client
            </button>
          </div>
        </div>

        {/* Client selector */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {CLIENTS.map(c => (
            <button key={c.id} onClick={() => { setSelectedClientId(c.id); setFilterCategory("All"); }}
              style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${selectedClientId === c.id ? C.navy : C.border}`, background: selectedClientId === c.id ? C.navy : C.white, color: selectedClientId === c.id ? C.white : C.text, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
              {c.avatar} {c.name.split(" ")[0]}
              <span style={{ marginLeft: 5, padding: "1px 6px", borderRadius: 8, fontSize: 9, background: selectedClientId === c.id ? "rgba(255,255,255,0.2)" : `${C.text}15`, color: selectedClientId === c.id ? C.white : C.text }}>
                {(CLIENT_DOCUMENTS[c.id] || []).length}
              </span>
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 2 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCategory(cat)}
              style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: filterCategory === cat ? C.gold : C.cream, color: filterCategory === cat ? C.navy : C.text, fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Document list */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.text }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>No documents yet</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Upload a file to start building this client's vault.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(doc => (
              <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, transition: "background 0.1s" }}>
                <FileIcon type={doc.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 3, fontSize: 10, color: C.text }}>
                    <span>{doc.size}</span>
                    <span>·</span>
                    <span>{doc.category}</span>
                    <span>·</span>
                    <span>Uploaded {doc.uploaded}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                  {doc.pushedToClient ? (
                    <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 8, background: `${C.success}15`, color: C.success, fontWeight: 700 }}>✓ Sent to client</span>
                  ) : (
                    <button onClick={() => onPush(client)}
                      style={{ fontSize: 10, padding: "4px 10px", borderRadius: 6, background: `${C.gold}20`, color: C.gold, border: "none", fontWeight: 700, cursor: "pointer" }}>
                      📤 Push
                    </button>
                  )}
                  <button style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, cursor: "pointer", fontSize: 13 }}>⬇</button>
                  <button style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, cursor: "pointer", fontSize: 13 }}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
