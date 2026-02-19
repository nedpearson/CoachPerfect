import { useRef, useEffect, useState } from "react";
import { C, CLIENTS } from "./styles.js";
import { generateQR } from "./qr-utils.js";

// ─── CLIENT QR MODAL ─────────────────────────────────────────────────────────
// Shows a scannable QR code for each client's portal URL.
// Coach can share this with clients to give them instant access.

export function ClientQRModal({ isOpen, onClose, client: preselected }) {
  const canvasRef = useRef(null);
  const [selected, setSelected] = useState(preselected);
  const [copied, setCopied]     = useState(false);

  // Sync prop changes (e.g. opening for a different client)
  useEffect(() => { setSelected(preselected); }, [preselected?.id]);

  const base    = typeof window !== "undefined" ? window.location.origin : "";
  const coachUrl  = base;
  const clientUrl = (id) => `${base}/?mode=client&clientId=${id}`;

  const displayUrl = selected ? clientUrl(selected.id) : coachUrl;

  // Redraw QR whenever the displayed URL changes
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    generateQR(canvasRef.current, displayUrl, 220);
  }, [isOpen, displayUrl]);

  const copyUrl = async () => {
    try { await navigator.clipboard.writeText(displayUrl); } catch (_) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />

      {/* Panel */}
      <div style={{ position: "relative", background: C.white, borderRadius: 18, width: 360, padding: "26px 24px", boxShadow: "0 24px 64px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display',Georgia,serif" }}>
            📱 Share Client Portal
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: C.text }}>✕</button>
        </div>

        {/* Client selector */}
        <div>
          <div style={{ fontSize: 11, color: C.text, fontWeight: 600, marginBottom: 6 }}>SELECT CLIENT</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <button onClick={() => setSelected(null)}
              style={{ padding: "5px 12px", borderRadius: 6, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer", background: !selected ? C.navy : C.cream, color: !selected ? C.white : C.text }}>
              🏠 Coach (Main)
            </button>
            {CLIENTS.map(c => (
              <button key={c.id} onClick={() => setSelected(c)}
                style={{ padding: "5px 12px", borderRadius: 6, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer", background: selected?.id === c.id ? C.navy : C.cream, color: selected?.id === c.id ? C.white : C.text }}>
                {c.avatar} {c.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* QR Canvas */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ padding: 12, background: C.cream, borderRadius: 14, border: `1px solid ${C.border}` }}>
            <canvas ref={canvasRef} width={220} height={220} style={{ display: "block", borderRadius: 8 }} />
          </div>
        </div>

        {/* Context label */}
        <div style={{ textAlign: "center", padding: "6px 12px", background: C.cream, borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 2 }}>
            {selected ? `${selected.name} — Client Portal` : "Coach Dashboard — Install Link"}
          </div>
          <div style={{ fontSize: 10, color: C.text, wordBreak: "break-all", fontFamily: "monospace" }}>{displayUrl}</div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={copyUrl}
            style={{ flex: 1, padding: "9px 0", borderRadius: 8, background: copied ? "#10b981" : C.navy, color: C.white, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {copied ? "✓ Copied!" : "📋 Copy URL"}
          </button>
          <button onClick={onClose}
            style={{ padding: "9px 18px", borderRadius: 8, background: C.cream, border: `1px solid ${C.border}`, fontSize: 12, fontWeight: 600, color: C.text, cursor: "pointer" }}>
            Done
          </button>
        </div>

        <div style={{ fontSize: 10, color: C.text, textAlign: "center" }}>
          Client scans to open their portal · No login needed · Installs as PWA
        </div>
      </div>
    </div>
  );
}
