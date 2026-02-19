import { useState } from "react";
import { C, COACH, CLIENTS, BUSINESS_ALERTS, PERSONAL_ALERTS, LANDING_PAGE_URL, MESSAGES } from "./coach/styles.js";
import { ToggleSwitch, AlertBadge, NotificationDrawer } from "./coach/components.jsx";
import { PushModal, DocumentModal, AddOnModal, NewClientModal } from "./coach/modals.jsx";
import { BusinessDashboard } from "./coach/BusinessDashboard.jsx";
import { PersonalDashboard } from "./coach/PersonalDashboard.jsx";
import { DocumentsPanel } from "./coach/DocumentsPanel.jsx";
import { AICommandCenter } from "./coach/AICommandCenter.jsx";
import { SubscriptionPanel } from "./coach/SubscriptionPanel.jsx";
import { MessagesPanel } from "./coach/MessagesPanel.jsx";
import { NotificationCenter } from "./coach/NotificationCenter.jsx";
import { ClientUploadsPanel } from "./coach/ClientUploadsPanel.jsx";
import { AuditLog } from "./coach/AuditLog.jsx";
import { ClientQRModal } from "./coach/ClientQRModal.jsx";
import { PluginMarketplace } from "./coach/PluginMarketplace.jsx";
import { BillingPanel } from "./coach/BillingPanel.jsx";

export default function CoachDashboard() {
  const [mode, setMode] = useState("business");      // "business" | "personal"
  const [activeTab, setActiveTab] = useState("overview");

  // Modals
  const [notifOpen, setNotifOpen] = useState(false);
  const [pushModal, setPushModal] = useState({ open: false, mode: "task", client: null });
  const [docModal, setDocModal] = useState({ open: false, mode: "upload", client: null });
  const [addonModal, setAddonModal] = useState({ open: false, addon: null, clientName: null });
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [qrModal, setQrModal] = useState({ open: false, client: null });

  const isPersonal = mode === "personal";
  const alerts = isPersonal ? PERSONAL_ALERTS : BUSINESS_ALERTS;
  const unreadMsgs = Object.values(MESSAGES).flat().filter(m => !m.read && m.from === "client").length;
  const unreadNotifs = BUSINESS_ALERTS.length; // live count from notification center
  const newUploads = 2; // client uploads pending review

  // Handler helpers
  const openTask = (client) => setPushModal({ open: true, mode: "task", client });
  const openReminder = (client) => setPushModal({ open: true, mode: "reminder", client });
  const openUpload = (client) => setDocModal({ open: true, mode: "upload", client });
  const openPushDoc = (client) => setDocModal({ open: true, mode: "push", client });
  const openAddon = (addon, clientName = null) => setAddonModal({ open: true, addon, clientName });
  const openQR    = (client) => setQrModal({ open: true, client });

  const bizTabs = [
    { id: "overview",        label: "Overview",        icon: "📊" },
    { id: "documents",       label: "Documents",       icon: "📁" },
    { id: "client-uploads",  label: "Client Uploads",  icon: "⬆",  badge: newUploads },
    { id: "messages",        label: "Messages",        icon: "💬",  badge: unreadMsgs },
    { id: "notifications",   label: "Notifications",   icon: "🔔",  badge: unreadNotifs },
    { id: "ai",              label: "AI Agents",       icon: "🤖" },
    { id: "subscriptions",   label: "Subscriptions",   icon: "💳" },
    { id: "billing",         label: "Billing",         icon: "💰" },
    { id: "plugins",         label: "Plugins",         icon: "🔌", badge: 2 },
    { id: "audit",           label: "Audit Log",       icon: "📋" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'DM Sans','Inter',system-ui,sans-serif" }}>

      {/* ── HEADER ── */}
      <header style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, color: C.white }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>

            {/* Left: logo + toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: -0.5, fontFamily: "'DM Serif Display',Georgia,serif" }}>
                <span style={{ color: C.gold }}>Coach</span>Perfect
              </h1>
              <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.15)" }} />
              <ToggleSwitch isOn={isPersonal} onToggle={() => { setMode(isPersonal ? "business" : "personal"); setActiveTab("overview"); }} leftLabel="Business" rightLabel="Personal" />
            </div>

            {/* Right: search + web button + notifications + avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <input placeholder="Search clients, tasks..."
                  style={{ width: 200, padding: "7px 12px 7px 32px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: C.white, fontSize: 12, outline: "none" }} />
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, opacity: 0.5 }}>🔍</span>
              </div>

              {/* Web / Landing Page Button */}
              <a href={LANDING_PAGE_URL} target="_blank" rel="noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: C.white, fontSize: 12, fontWeight: 600, textDecoration: "none", transition: "background 0.15s" }}>
                🌐 Website
              </a>

              {/* Notifications */}
              <button onClick={() => setNotifOpen(true)}
                style={{ position: "relative", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 9px", cursor: "pointer" }}>
                <span style={{ fontSize: 16 }}>🔔</span>
                <AlertBadge count={alerts.length} />
              </button>

              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: C.navy }}>{COACH.initials}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{COACH.name}</div>
                  <div style={{ fontSize: 10, opacity: 0.6 }}>{isPersonal ? "Personal Mode" : COACH.role}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-tab nav — only in business mode */}
          {!isPersonal && (
            <div style={{ display: "flex", gap: 2 }}>
              {bizTabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ position: "relative", padding: "9px 18px", borderRadius: "8px 8px 0 0", border: "none", cursor: "pointer", background: activeTab === tab.id ? C.cream : "transparent", color: activeTab === tab.id ? C.navy : "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, transition: "all 0.2s" }}>
                  <span style={{ marginRight: 5 }}>{tab.icon}</span>{tab.label}
                  {tab.badge > 0 && (
                    <span style={{ marginLeft: 5, padding: "0 5px", borderRadius: 8, fontSize: 9, fontWeight: 700, background: C.danger, color: C.white }}>{tab.badge}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mode accent bar */}
        <div style={{ height: 3, background: isPersonal ? `linear-gradient(90deg,#ec4899,#8b5cf6)` : `linear-gradient(90deg,${C.gold},${C.success})` }} />
      </header>

      {/* ── MAIN ── */}
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "22px 28px" }}>

        {/* Page greeting row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.navy, fontFamily: "'DM Serif Display',Georgia,serif" }}>
              {isPersonal ? "Good Morning, Meredith" : activeTab === "overview" ? "Business Dashboard" : activeTab === "documents" ? "Document Vault" : activeTab === "client-uploads" ? "Client Uploads" : activeTab === "messages" ? "Client Messages" : activeTab === "notifications" ? "Notification Center" : activeTab === "ai" ? "AI Command Center" : activeTab === "audit" ? "Audit Log" : activeTab === "plugins" ? "Plugin Store" : activeTab === "billing" ? "Billing & Plan" : "Subscriptions & Add-Ons"}
            </h2>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: C.text }}>
              {isPersonal ? "Your personal day at a glance." : activeTab === "overview" ? "Full view of your coaching practice." : activeTab === "documents" ? "Upload, store, and push documents to individual clients." : activeTab === "client-uploads" ? "Review and file documents your clients have uploaded." : activeTab === "messages" ? "Direct messaging with all clients in one place." : activeTab === "notifications" ? "All alerts, at-risk flags, AI items, and system messages." : activeTab === "ai" ? "Automated agents handling your coaching workflows." : activeTab === "audit" ? "Complete activity trail — every action by coach, client, and AI." : activeTab === "plugins" ? "Extend CoachPerfect with specialist AI tools — each adds value for clients and revenue for you." : activeTab === "billing" ? "Manage your CoachPerfect plan and Stripe billing." : "Client subscription plans and add-on marketplace."}
            </p>
          </div>

          {!isPersonal && activeTab === "overview" && (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => openTask(null)} style={{ padding: "8px 16px", borderRadius: 8, background: C.navy, color: C.white, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📋 Push Task</button>
              <button onClick={() => openReminder(null)} style={{ padding: "8px 16px", borderRadius: 8, background: C.gold, color: C.navy, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🔔 Send Reminder</button>
              <button onClick={() => openUpload(null)} style={{ padding: "8px 16px", borderRadius: 8, background: C.white, color: C.navy, border: `1px solid ${C.border}`, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>⬆ Upload Doc</button>
            </div>
          )}

          {!isPersonal && activeTab === "documents" && (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => openUpload(null)} style={{ padding: "8px 16px", borderRadius: 8, background: C.navy, color: C.white, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>⬆ Upload Document</button>
              <button onClick={() => openPushDoc(null)} style={{ padding: "8px 16px", borderRadius: 8, background: C.gold, color: C.navy, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📤 Push to Client</button>
            </div>
          )}
        </div>

        {/* ── CONTENT ── */}
        {isPersonal && <PersonalDashboard />}

        {!isPersonal && activeTab === "overview" && (
          <BusinessDashboard
            onPushTask={openTask} onSendReminder={openReminder}
            onUploadDoc={openUpload} onPushDoc={openPushDoc}
            onNewClient={() => setNewClientOpen(true)} onShowQR={openQR} />
        )}

        {!isPersonal && activeTab === "documents" && (
          <DocumentsPanel onUpload={openUpload} onPush={openPushDoc} />
        )}

        {!isPersonal && activeTab === "client-uploads" && (
          <ClientUploadsPanel />
        )}

        {!isPersonal && activeTab === "messages" && (
          <MessagesPanel />
        )}

        {!isPersonal && activeTab === "notifications" && (
          <NotificationCenter />
        )}

        {!isPersonal && activeTab === "ai" && (
          <AICommandCenter />
        )}

        {!isPersonal && activeTab === "subscriptions" && (
          <SubscriptionPanel onOpenAddon={addon => openAddon(addon)} />
        )}

        {!isPersonal && activeTab === "billing" && (
          <BillingPanel currentPlan="starter" />
        )}

        {!isPersonal && activeTab === "plugins" && (
          <PluginMarketplace />
        )}

        {!isPersonal && activeTab === "audit" && (
          <AuditLog />
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ marginTop: 40, padding: "16px 0", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 28px", display: "flex", justifyContent: "space-between", fontSize: 11, color: `${C.text}88` }}>
          <span>© 2026 CoachPerfect. Bold Conversations. Bolder Data.</span>
          <div style={{ display: "flex", gap: 16 }}>
            <a href={LANDING_PAGE_URL} target="_blank" rel="noreferrer" style={{ color: C.gold, fontWeight: 600, textDecoration: "none" }}>🌐 View Website</a>
            <span>v2.1.0 · Coach Dashboard</span>
          </div>
        </div>
      </footer>

      {/* ── OVERLAYS ── */}
      <NotificationDrawer alerts={alerts} isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

      <PushModal
        isOpen={pushModal.open} onClose={() => setPushModal(p => ({ ...p, open: false }))}
        clients={CLIENTS} mode={pushModal.mode} preselectedClient={pushModal.client} />

      <DocumentModal
        isOpen={docModal.open} onClose={() => setDocModal(p => ({ ...p, open: false }))}
        clients={CLIENTS} mode={docModal.mode} preselectedClient={docModal.client} />

      <AddOnModal
        isOpen={addonModal.open} onClose={() => setAddonModal(p => ({ ...p, open: false }))}
        addon={addonModal.addon} clientName={addonModal.clientName} />

      <NewClientModal isOpen={newClientOpen} onClose={() => setNewClientOpen(false)} />

      <ClientQRModal
        isOpen={qrModal.open} onClose={() => setQrModal(p => ({ ...p, open: false }))}
        client={qrModal.client} />
    </div>
  );
}
