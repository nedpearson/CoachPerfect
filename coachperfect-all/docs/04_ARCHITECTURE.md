# Coach Perfect — Architecture Reference

## CODEBASE FILE TREE

```
coachperfect/
├── docs/
│   ├── 01_BUSINESS_PLAN.md          # Full business plan, pricing, revenue, splits, growth strategy
│   ├── 02_DIAGNOSTIC_AND_COACHING.md # Website diagnostic, SEO plan, coaching system, timeline, discovery
│   ├── 03_PITCH_AND_MARKETING.md    # Pitch deck, meeting script, marketing plan, onboarding workflow
│   └── 04_ARCHITECTURE.md           # This file
│
├── platform/
│   ├── backend/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   ├── prisma/
│   │   │   ├── schema.prisma        # Complete PostgreSQL schema (25 models)
│   │   │   └── seed.ts              # 48 diagnostic questions, 3 workflows, 5 templates
│   │   └── src/
│   │       ├── index.ts             # Express server entry point
│   │       ├── config/
│   │       │   └── index.ts         # Environment config, tier limits
│   │       ├── middleware/
│   │       │   ├── auth.ts          # JWT auth, role guards, feature access control
│   │       │   └── errorHandler.ts  # Global error handler, Zod validation
│   │       ├── api/routes/
│   │       │   ├── auth.ts          # POST register, login, logout; GET me
│   │       │   ├── clients.ts       # CRUD clients, client limit enforcement
│   │       │   ├── diagnostics.ts   # Start, submit, score, recommend
│   │       │   ├── dashboards.ts    # Coach dashboard, client dashboard, widgets
│   │       │   ├── sessions.ts      # CRUD, complete with action items
│   │       │   ├── tasks.ts         # CRUD, complete tasks
│   │       │   ├── documents.ts     # S3 upload, auto-classify, download, folders
│   │       │   ├── workflows.ts     # CRUD, trigger, instances
│   │       │   ├── templates.ts     # CRUD, render with client data
│   │       │   ├── analytics.ts     # Coach metrics, client metrics, KPI recording
│   │       │   ├── billing.ts       # Stripe checkout, portal, subscription status
│   │       │   ├── webhooks.ts      # Stripe webhook handler (4 event types)
│   │       │   ├── admin.ts         # Admin stats, users, subscriptions, partners
│   │       │   └── recommendations.ts # CRUD, accept → task, dismiss
│   │       ├── services/
│   │       │   ├── email.ts         # SMTP service, 4 branded email templates
│   │       │   └── workflowExecutor.ts # Step processor (email, task, notification, status)
│   │       └── utils/
│   │           ├── prisma.ts        # Prisma client singleton
│   │           └── logger.ts        # Winston logger
│   │
│   └── frontend/
│       ├── package.json
│       ├── tailwind.config.ts       # Brand colors, fonts
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx       # Root layout with DM Sans/Serif fonts
│       │   │   └── globals.css      # Tailwind + component classes
│       │   ├── lib/
│       │   │   └── api.ts           # Complete API client (40+ methods)
│       │   └── components/
│       │       └── dashboard/       # Dashboard UI components
│       └── public/
│
└── pitch/                           # Pitch materials (from docs/03)
```

## DATABASE SCHEMA SUMMARY (25 Models)

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| User | Authentication, profiles | → Organization, Subscription, CoachProfile, ClientProfile |
| OAuthAccount | Google OAuth tokens | → User |
| Organization | Multi-tenant branding | → Users, Clients, Dashboards, Templates, Workflows |
| Subscription | Stripe billing state | → User, Invoices, PartnerProfile (referrer) |
| Invoice | Payment records | → Subscription, PartnerPayout |
| PartnerProfile | Referral/reseller tracking | → User, Subscriptions (referred), Payouts |
| PartnerPayout | Commission payments | → PartnerProfile, Invoice |
| CoachProfile | Coach bio, specialties | → User, Clients, Sessions, Diagnostics |
| ClientProfile | Client company data, status | → User, Coach, Org, Diagnostics, Dashboards, Sessions, Tasks, KPIs, Recommendations, Workflows |
| Diagnostic | Assessment instance | → Client, Coach, Responses, Scores, Recommendations |
| DiagnosticResponse | Individual answers | → Diagnostic, DiagnosticQuestion |
| DiagnosticQuestion | Question bank (48 seeded) | → Responses |
| DiagnosticScore | Category scores/gaps | → Diagnostic |
| Dashboard | Widget container | → Client, Org, Widgets |
| DashboardWidget | Individual widget config | → Dashboard |
| KPI | Time-series metric data | → Client |
| Session | Coaching session records | → Client, Coach, Users, Tasks |
| Task | Action items with status | → Client, Session, Assignee, Creator |
| Document | S3-backed file storage | → Client, Org, Uploader, Versions |
| Workflow | Automation definition | → Org, Steps, Instances |
| WorkflowStep | Individual automation step | → Workflow |
| WorkflowInstance | Running workflow state | → Workflow, Client, Logs |
| WorkflowLog | Step execution log | → WorkflowInstance |
| Recommendation | AI-generated suggestions | → Client, Diagnostic |
| Template | Reusable content templates | → Organization |
| Notification | User alerts | → User |
| ActivityLog | Audit trail | → User |

## COMPLETE API ROUTE MAP

### Authentication
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | None | Create account + trial subscription |
| POST | /api/auth/login | None | Email/password login → JWT |
| GET | /api/auth/me | Required | Current user + subscription + profiles |
| POST | /api/auth/logout | Required | Clear session |

### Clients
| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | /api/clients | Required | Coach, Admin | List coach's clients with counts |
| POST | /api/clients | Required | Coach, Admin | Create client (checks tier limit) |
| GET | /api/clients/:id | Required | Any | Full client detail with nested data |
| PATCH | /api/clients/:id | Required | Coach, Admin | Update client fields |
| DELETE | /api/clients/:id | Required | Coach, Admin | Archive (soft delete) |

### Diagnostics
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/diagnostics/questions | Required | Get all questions grouped by category |
| POST | /api/diagnostics/:clientId/start | Required | Create new diagnostic for client |
| POST | /api/diagnostics/:id/submit | Required | Submit responses → score → recommend |
| GET | /api/diagnostics/:id | Required | Get diagnostic with scores and recs |
| GET | /api/diagnostics/client/:clientId | Required | All diagnostics for a client |

### Dashboards
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/dashboards/coach | Required | Coach command center (all clients, sessions, tasks) |
| GET | /api/dashboards/client/:clientId | Required | Client dashboard (KPIs, tasks, sessions, recs) |
| GET | /api/dashboards/widgets/:dashboardId | Required | Dashboard widget config |
| POST | /api/dashboards/widgets | Required | Add widget to dashboard |
| PATCH | /api/dashboards/widgets/:id | Required | Update widget |

### Sessions
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/sessions | Required | List sessions |
| POST | /api/sessions | Required | Schedule new session |
| GET | /api/sessions/:id | Required | Session detail |
| PATCH | /api/sessions/:id | Required | Update session |
| POST | /api/sessions/:id/complete | Required | Complete + create action items + trigger workflow |

### Tasks
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/tasks | Required | List tasks (filter by client, status, assignee) |
| POST | /api/tasks | Required | Create task |
| PATCH | /api/tasks/:id | Required | Update task |
| POST | /api/tasks/:id/complete | Required | Mark complete |

### Documents
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/documents | Required | List documents |
| POST | /api/documents/upload | Required | Upload to S3 + auto-classify |
| GET | /api/documents/:id/download | Required | Get signed S3 URL |
| DELETE | /api/documents/:id | Required | Delete from S3 + DB |
| GET | /api/documents/folders/:clientId | Required | List folder structure |

### Workflows
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/workflows | Required | List all workflows |
| POST | /api/workflows | Required | Create workflow with steps |
| PATCH | /api/workflows/:id | Required | Update workflow |
| POST | /api/workflows/:id/trigger | Required | Manually trigger workflow |
| GET | /api/workflows/:id/instances | Required | List workflow run history |

### Templates
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/templates | Required | List templates (filter by category/type) |
| POST | /api/templates | Required | Create template |
| GET | /api/templates/:id | Required | Get template |
| PATCH | /api/templates/:id | Required | Update template |
| DELETE | /api/templates/:id | Required | Delete template |
| POST | /api/templates/:id/render | Required | Render with client data |

### Analytics
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/analytics/coach | Required | Coach-level metrics (30-day trends) |
| GET | /api/analytics/client/:clientId | Required | Client KPI trends, session freq, task metrics |
| POST | /api/analytics/kpi | Required | Record single KPI data point |
| POST | /api/analytics/kpi/bulk | Required | Record multiple KPI data points |

### Billing
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/billing/create-checkout | Required | Stripe Checkout session → redirect URL |
| POST | /api/billing/create-portal | Required | Stripe Customer Portal → redirect URL |
| GET | /api/billing/subscription | Required | Current subscription + invoices |
| GET | /api/billing/invoices | Required | Invoice history |

### Webhooks
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/webhooks/stripe | Stripe Sig | checkout.session.completed, invoice.paid, subscription.updated, subscription.deleted |

### Admin
| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | /api/admin/stats | Required | Admin | Platform-wide metrics + MRR |
| GET | /api/admin/users | Required | Admin | Paginated user list |
| PATCH | /api/admin/users/:id | Required | Admin | Update user |
| GET | /api/admin/subscriptions | Required | Admin | All subscriptions |
| GET | /api/admin/partners | Required | Admin | Partner performance |
| GET | /api/admin/activity | Required | Admin | Activity log |

### Recommendations
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/recommendations/client/:clientId | Required | Client recommendations |
| PATCH | /api/recommendations/:id | Required | Update recommendation |
| POST | /api/recommendations/:id/accept | Required | Accept → create task |
| POST | /api/recommendations/:id/dismiss | Required | Dismiss recommendation |

## DASHBOARD UI/UX SPEC

### Design System
- **Primary:** Navy (#1e3a5f) — authority, trust, professionalism
- **Accent:** Gold (#c9a84c) — premium, achievement, warmth
- **Background:** Cream (#f4f1ea) — warm, approachable, not clinical
- **Cards:** White with cream-dark borders, 2xl rounded corners
- **Typography:** DM Serif Display (headings), DM Sans (body), JetBrains Mono (data)
- **Interactions:** Hover-lift cards, gold border accent on focus, 200ms transitions

### Coach Dashboard Layout (1440px max)
```
┌─────────────────────────────────────────────────────────────┐
│  Header: Logo | Coach Dashboard | 🔔(3) | Avatar + Name    │
│  Tabs: Overview | Clients | Sessions | Diagnostics | Docs   │
├─────────────────────────────────────────────────────────────┤
│  KPI Row: [Active Clients] [Sessions/Week] [Completion%] [MRR]  │
├────────────────────────────────────┬────────────────────────┤
│  Client Portfolio Table            │  Today's Sessions       │
│  [Name][Engagement][Health][Score] │  [9:00 AM — Chris C.]  │
│  [Tasks][Next Session]             │  [11:00 AM — NFP Team] │
│                                    │  [2:00 PM — Manville]  │
│                                    │  [+ Schedule Session]   │
├────────────────────────────────────┤                        │
│  Diagnostic Scores (Bar Chart)     │  Activity Feed          │
│  [Financial    ███████░░ 68%]      │  📋 Diagnostic done     │
│  [Operations   █████░░░░ 55%]      │  ✅ Tasks completed     │
│  [People       ███████░░ 72%]      │  📅 Session scheduled   │
│  [Strategy     ████░░░░░ 48%]      │  ⚠️  At-risk alert      │
│  [Leadership   ████████░ 76%]      │                        │
│  [Marketing    ████░░░░░ 41%]      │  Quick Actions          │
├────────────────────────────────────┤  [👤 Add Client]        │
│  AI Recommendations                │  [🔍 Run Diagnostic]    │
│  🔴 Sarah R. — Re-engage now      │  [📊 Generate Report]   │
│  🟡 Manville — Review financials   │  [📄 Template]         │
│  🔵 NFP Team — Health assessment   │  [⚡ Workflow]          │
└────────────────────────────────────┴────────────────────────┘
```

### Client Dashboard Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header: Client Name | Company | Engagement Type | Health    │
├─────────────────────────────────────────────────────────────┤
│  KPI Cards: [Revenue Trend] [Team Health] [Goal Progress] [Sessions] │
├────────────────────────────────────┬────────────────────────┤
│  Diagnostic Radar Chart            │  Action Items           │
│  6-axis visualization              │  ☐ Implement forecasting│
│  Current vs. Previous              │  ☐ Update SOPs          │
│                                    │  ☑ Hire operations lead │
├────────────────────────────────────┤  ☐ Review pricing       │
│  KPI Trending (Line Charts)        │                        │
│  Revenue / Margins / Engagement    │  Recommendations        │
│  12-month view with targets        │  AI-suggested next steps│
├────────────────────────────────────┤                        │
│  Session History                   │  Document Hub           │
│  Timeline with notes + outcomes    │  /intake  /sessions     │
│                                    │  /assessments /reports  │
└────────────────────────────────────┴────────────────────────┘
```

### Admin Portal Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Admin Header: Coach Perfect Admin | Platform Metrics             │
├─────────────────────────────────────────────────────────────┤
│  KPIs: [Total Users] [MRR] [Active Subs] [New This Month]   │
├────────────────────────────────────┬────────────────────────┤
│  Subscription Management           │  Partner Performance    │
│  User table with tier/status       │  Referrals, payouts     │
├────────────────────────────────────┤  commission tracking    │
│  Activity Log                      │                        │
│  Recent actions across platform    │  Revenue Chart          │
│                                    │  MRR growth over time   │
└────────────────────────────────────┴────────────────────────┘
```

## DEPLOYMENT REQUIREMENTS

### Infrastructure
| Component | Service | Monthly Cost |
|-----------|---------|-------------|
| API Server | Railway / Render / Fly.io | $20–$50 |
| PostgreSQL | Neon (free tier → $19 pro) | $0–$19 |
| Redis | Upstash (free tier) | $0–$10 |
| S3 Storage | AWS S3 / Cloudflare R2 | $5–$20 |
| Frontend | Vercel (free tier) | $0–$20 |
| Email | Resend / Postmark | $0–$25 |
| Domain | coachperfect.io | $12/yr |
| SSL | Included (Let's Encrypt) | $0 |
| **Total** | | **$37–$156/mo** |

### Environment Setup
```bash
# Backend
cd platform/backend
cp .env.example .env    # Fill in values
npm install
npx prisma db push      # Create tables
npx tsx prisma/seed.ts   # Seed data
npm run dev              # Start API on :3001

# Frontend
cd platform/frontend
npm install
npm run dev              # Start Next.js on :3000
```
