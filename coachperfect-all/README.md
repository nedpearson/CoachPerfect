# Coach Perfect

**Coaching intelligence platform that turns business coaching into measurable, provable results.**

Business Health Score · AI Session Prep · ROI Reports · Offline-First PWA · WiFi Sync

---

## Structure

```
coachperfect/
├── app/                      # Frontend application
│   ├── public/
│   │   ├── index.html        # Landing page (coachperfect.io)
│   │   ├── diagnostic.html   # 48-question interactive diagnostic
│   │   └── dashboard.html    # Desktop dashboard with QR install
│   ├── CoachPerfect_Dashboard.jsx
│   └── coachperfect-dashboard.jsx
├── server/
│   ├── billing-server.js     # Stripe billing (5 tiers, webhooks, portal)
│   └── .env.example          # Environment variables template
├── emails/
│   ├── email-templates.js    # 8 branded email templates (Resend)
│   └── previews/             # HTML previews of all templates
├── mobile/
│   ├── server.js             # PWA server + WebSocket sync
│   ├── public/               # Offline-first mobile PWA
│   └── package.json
└── docs/
    ├── 01_BUSINESS_PLAN.md
    ├── 02_DIAGNOSTIC_AND_COACHING.md
    ├── 03_PITCH_AND_MARKETING.md
    ├── 04_ARCHITECTURE.md
    ├── 05_FEATURE_RECOMMENDATIONS.md
    ├── 06_COMPETITIVE_SEPARATION.md
    ├── 07_DRILLDOWN_PROOF_ARCHITECTURE.md
    ├── 08_GROWTH_AND_FINAL_LAYER.md
    ├── 09_FINAL_INNOVATION_LAYER.md
    ├── 10_PRICING_GTM_AND_OPERATIONS.md
    ├── MEREDITH_WEEK1_PLAYBOOK.md
    └── MOBILE_README.md
```

## Quick Start

```bash
# Landing page + diagnostic (static)
cd app && npx serve public

# Billing server
cd server && npm install stripe express cors dotenv && node billing-server.js

# Mobile PWA with offline sync
cd mobile && npm install && npm start

# Email previews
cd emails && node email-templates.js
```

## What's Inside

- **250+ features** mapped across 10 strategy documents
- **48-question diagnostic** with instant Business Health Score (0-100)
- **5-tier Stripe billing** (Free → $49 → $149 → $349 → $799+)
- **8 email templates** branded and ready for Resend
- **Offline-first PWA** with local WiFi sync
- **Meredith Week 1 Playbook** — day-by-day launch guide

## Tech Stack

React/Next.js · Node.js · PostgreSQL · Stripe · Resend · IndexedDB · WebSocket · Service Workers

---

© 2026 Coach Perfect. All rights reserved.
