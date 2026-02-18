# Coach Perfect — Pricing, Go-To-Market & Operations
## Document 10: The Execution Layer

---

## BLUF

Docs 01-09 covered WHAT to build. This doc covers HOW to sell it, WHO buys it, HOW to launch it, and WHAT keeps it running. Includes specific pricing with feature gates, a week-by-week launch sequence, multi-coach firm architecture, corporate buyer workflows, infrastructure decisions, and legal templates.

---

## 1. PRICING & PACKAGING — FINAL SPECIFICATION

### Tier Architecture

| | **Free** | **Starter** | **Professional** | **Business** | **Enterprise** |
|---|---|---|---|---|---|
| **Price** | $0/forever | $49/mo ($39/mo annual) | $149/mo ($119/mo annual) | $349/mo ($279/mo annual) | $799+/mo (custom) |
| **Annual Savings** | — | $120/yr (20%) | $360/yr (20%) | $840/yr (20%) | Negotiated |
| **Target** | Tire-kickers, new coaches | Solo coach, <10 clients | Established coach, 10-25 clients | Coaching firm, 25+ clients | Multi-coach firm, corporate |

### Feature Gates — Detailed

**CLIENT MANAGEMENT**

| Feature | Free | Starter | Professional | Business | Enterprise |
|---------|------|---------|-------------|----------|------------|
| Active clients | 1 | 10 | 25 | Unlimited | Unlimited |
| Client dashboard | Basic | Full | Full | Full | Full + custom |
| Client portal (branded) | ✗ | ✗ | ✓ | ✓ | ✓ |
| Client data export | ✗ | CSV | CSV + PDF | CSV + PDF + API | Full |

**DIAGNOSTIC ENGINE**

| Feature | Free | Starter | Professional | Business | Enterprise |
|---------|------|---------|-------------|----------|------------|
| Core diagnostic (48 questions) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Business Health Score | ✓ | ✓ | ✓ | ✓ | ✓ |
| Radar chart | ✓ | ✓ | ✓ | ✓ | ✓ |
| Benchmarking (industry) | ✗ | Basic (top/mid/low) | Full percentile | Full + regional | Full + custom |
| Re-diagnostic (before/after) | ✗ | ✓ | ✓ | ✓ | ✓ |
| Industry-specific modules | ✗ | ✗ | 2 included | All included | All + custom |
| Custom diagnostic questions | ✗ | ✗ | ✗ | 10 custom Qs | Unlimited |
| 360° feedback | ✗ | ✗ | ✓ (5 raters/client) | ✓ (15 raters) | Unlimited |
| Team diagnostic | ✗ | ✗ | ✗ | ✓ | ✓ |

**SESSION MANAGEMENT**

| Feature | Free | Starter | Professional | Business | Enterprise |
|---------|------|---------|-------------|----------|------------|
| Session scheduling | Manual | Manual + calendar link | Calendar integration | Calendar + auto-schedule | Full |
| Session notes | 3 total | Unlimited | Unlimited | Unlimited | Unlimited |
| Session prep AI brief | ✗ | ✗ | ✓ | ✓ | ✓ |
| Pre-session self-assessment | ✗ | ✓ | ✓ | ✓ | ✓ |
| Post-session workflow | ✗ | Basic email | Full workflow | Full + custom | Full + custom |
| Voice-to-text notes | ✗ | ✗ | ✓ | ✓ | ✓ |

**TASKS & ACCOUNTABILITY**

| Feature | Free | Starter | Professional | Business | Enterprise |
|---------|------|---------|-------------|----------|------------|
| Task assignment | ✗ | ✓ | ✓ | ✓ | ✓ |
| Task tracking | ✗ | ✓ | ✓ | ✓ | ✓ |
| Habit tracker | ✗ | ✗ | ✓ | ✓ | ✓ |
| Win journal | ✗ | ✓ | ✓ | ✓ | ✓ |
| Weekly pulse check-in | ✗ | ✗ | ✓ | ✓ | ✓ |
| Gamification (levels/streaks) | ✗ | ✗ | ✓ | ✓ | ✓ |

**ANALYTICS & ROI**

| Feature | Free | Starter | Professional | Business | Enterprise |
|---------|------|---------|-------------|----------|------------|
| Basic KPI tracking | ✗ | 5 KPIs | 15 KPIs | Unlimited | Unlimited |
| ROI calculator | ✗ | ✗ | ✓ | ✓ | ✓ |
| ROI report (exportable) | ✗ | ✗ | ✓ | ✓ (branded) | ✓ (white-label) |
| Client progress report | ✗ | Basic | Full | Full + custom | Full + custom |
| Coaching effectiveness metrics | ✗ | ✗ | ✓ | ✓ | ✓ |
| Financial modeling suite | ✗ | ✗ | ✗ | ✓ | ✓ |
| AI Quarterly Business Review | ✗ | ✗ | ✗ | ✓ | ✓ |

**AI INTELLIGENCE**

| Feature | Free | Starter | Professional | Business | Enterprise |
|---------|------|---------|-------------|----------|------------|
| AI recommendations | ✗ | Basic (3 per diagnostic) | Full (prioritized) | Full + custom | Full + custom |
| Pattern recognition | ✗ | ✗ | ✓ | ✓ | ✓ |
| AI coaching debrief | ✗ | ✗ | ✗ | ✓ | ✓ |
| Predictive alerts | ✗ | ✗ | ✓ | ✓ | ✓ |
| Natural language KPI entry | ✗ | ✗ | ✓ | ✓ | ✓ |

**BUSINESS TOOLS**

| Feature | Free | Starter | Professional | Business | Enterprise |
|---------|------|---------|-------------|----------|------------|
| Templates | 5 | 15 | All | All + custom | All + custom |
| Proposal / Deal Room | ✗ | ✗ | ✓ | ✓ | ✓ |
| CRM / Pipeline | ✗ | ✗ | Basic | Full | Full + integrations |
| Email marketing | ✗ | ✗ | ✗ | ✓ (500 emails/mo) | Unlimited |
| Testimonial collection | ✗ | ✗ | ✓ | ✓ | ✓ |
| Package builder | ✗ | ✗ | ✓ | ✓ | ✓ |
| Time tracking | ✗ | ✗ | ✓ | ✓ | ✓ |

**BRANDING & INTEGRATIONS**

| Feature | Free | Starter | Professional | Business | Enterprise |
|---------|------|---------|-------------|----------|------------|
| Coach Perfect branding | Required | Required | Removable | Removable | Removable |
| Custom branding | ✗ | Logo only | Logo + colors | Full brand | Full white-label |
| Custom domain | ✗ | ✗ | ✗ | ✗ | ✓ |
| Zapier integration | ✗ | ✗ | ✗ | ✓ | ✓ |
| API access | ✗ | ✗ | ✗ | Read-only | Full read/write |
| Embeddable diagnostic | ✗ | ✓ (Coach Perfect branded) | ✓ (co-branded) | ✓ (coach branded) | ✓ (white-label) |
| Webhooks | ✗ | ✗ | ✗ | ✓ | ✓ |

**SUPPORT**

| Feature | Free | Starter | Professional | Business | Enterprise |
|---------|------|---------|-------------|----------|------------|
| Support | Community forum | Email (48hr) | Email (24hr) + chat | Priority (4hr) + phone | Dedicated CSM |
| Onboarding | Self-serve | Video library | 1:1 setup call (30 min) | 1:1 onboarding (2 hrs) | Custom implementation |
| Training | Docs | Docs + video | Docs + video + webinar | All + private training | All + custom |

### Pricing Psychology — Why These Numbers

- **$49 Starter** → Price of lunch once a week. De-risks decision. Below "approval threshold" for most solo coaches.
- **$149 Professional** → The "real" tier. This is where 60-70% of paying coaches land. Session prep AI brief is the killer feature that justifies the jump. A coach billing $300/hr who saves 20 min/session pays for the entire month in one session prep.
- **$349 Business** → For coaches running a real business. Financial modeling, email marketing, API, and team diagnostics justify the jump. At 25+ clients billing $500/mo avg, this is <3% of revenue.
- **$799+ Enterprise** → White-label, multi-coach, custom everything. Priced on value, not cost. A 5-coach firm billing $50K/mo pays 1.6% for their entire technology stack.

### Revenue Math

| Scenario | Coaches | Mix | MRR | ARR |
|----------|---------|-----|-----|-----|
| Year 1 (Month 12) | 50 paying | 30% Starter, 50% Pro, 15% Biz, 5% Ent | $6,080 | $72,960 |
| Year 2 (Month 24) | 200 paying | 25% Starter, 50% Pro, 20% Biz, 5% Ent | $27,600 | $331,200 |
| Year 3 (Month 36) | 500 paying | 20% Starter, 45% Pro, 25% Biz, 10% Ent | $82,050 | $984,600 |

**Assumptions:** Avg revenue per coach: Starter $49, Pro $149, Business $349, Enterprise $899. Weighted average ~$164/mo at scale.

### Add-On Revenue Streams

| Add-On | Price | Available To |
|--------|-------|-------------|
| Additional industry module | $29/mo each | Professional+ |
| Business Health Certificate | $250-500/year (client pays) | Professional+ |
| Extra 360° rater slots (10-pack) | $19/mo | Professional+ |
| Additional coach seat (firm) | $99/mo per seat | Business+ |
| Data export API calls (over limit) | $0.10/call | Business+ |
| Priority support upgrade | $49/mo | Starter/Professional |
| Certification program enrollment | $495 one-time | All tiers |
| Coach directory featured listing | $29/mo | All tiers |

---

## 2. GO-TO-MARKET LAUNCH SEQUENCE

### Phase 0: Pre-Launch (Weeks -8 to -1)

**Week -8 to -6: Foundation**
- [ ] Domain registration + landing page live (coachperfect.io)
- [ ] Email capture: "Get early access" with value prop + 3 screenshots
- [ ] LinkedIn personal posts from Ned (3x/week): "Building something for coaches"
- [ ] Identify 20 target beta coaches (Meredith's network + LinkedIn outreach)
- [ ] Create "founding members" positioning: first 20 coaches get lifetime 30% discount

**Week -5 to -3: Content & Community**
- [ ] Publish "Why Coaching Needs a Data Revolution" blog post
- [ ] Create free "Coach Health Check" diagnostic (standalone, works without platform)
- [ ] Share Coach Health Check on LinkedIn: "Take a free diagnostic of your coaching business"
- [ ] Goal: 100 email subscribers, 50 diagnostic completions
- [ ] Reach out personally to 20 target coaches with personalized messages
- [ ] Create demo video (3 min): "What Coach Perfect looks like with a real client"

**Week -2 to -1: Beta Prep**
- [ ] Platform feature-complete for MVP (core diagnostic + dashboard + sessions + tasks)
- [ ] Meredith fully onboarded with 2-3 real clients
- [ ] Meredith provides video testimonial + case study data
- [ ] Onboarding flow tested and polished
- [ ] Support documentation ready (help center + FAQ)
- [ ] Stripe billing integration tested

### Phase 1: Private Beta (Weeks 1-4)

**Week 1: Meredith + 5 Coaches**
- [ ] Meredith live with 3+ clients (existing from pre-beta)
- [ ] 5 hand-selected coaches invited (Meredith's referrals preferred)
- [ ] Daily check-ins with beta coaches (Slack channel or text)
- [ ] Track: time to first client added, time to first diagnostic sent, feature usage
- [ ] Fix critical bugs immediately
- [ ] Coach feedback form: "What's missing? What's confusing? What's magic?"

**Week 2: Expand to 15 Coaches**
- [ ] 10 more coaches from waitlist (prioritize those who completed Coach Health Check)
- [ ] First "Coach Perfect Weekly" email to beta group (tips, updates, feature highlights)
- [ ] Collect first 3 testimonials
- [ ] Identify power users → recruit as "Founding Coaches" for future content

**Week 3: Polish & Iterate**
- [ ] Implement top 3 feedback items from beta coaches
- [ ] Create 5 "how to" videos based on most common support questions
- [ ] A/B test onboarding flow (with vs without personal diagnostic step)
- [ ] Ensure all 15 coaches have sent at least 1 diagnostic

**Week 4: Beta Graduation**
- [ ] Convert beta coaches to paid plans (founding member discount: 30% for life)
- [ ] Target: 10 of 15 convert to paid = $1,000-$1,500 MRR
- [ ] Collect case study data: "Coach X improved client retention by Y%"
- [ ] Prepare public launch materials
- [ ] Beta coaches become referral partners (10% commission for 6 months)

### Phase 2: Public Launch (Weeks 5-8)

**Week 5: Soft Launch**
- [ ] Open registration to waitlist (expected 50-100 signups)
- [ ] "Coach Perfect is live" email to full list
- [ ] LinkedIn announcement from Ned + Meredith + beta coaches (coordinated same day)
- [ ] Free Coach Health Check promoted heavily (lead magnet)
- [ ] First paid Google/LinkedIn ad experiment: $500 budget, targeting "executive coaching tools"
- [ ] Press release to local Louisiana media (angle: "Baton Rouge startup disrupts coaching industry")

**Week 6: Content Push**
- [ ] Publish first "State of Coaching" micro-report (from beta data, anonymized)
- [ ] Guest post on coaching industry blog (ICF Coaching World, Coaching Tools Company, etc.)
- [ ] YouTube: 3 short demos (diagnostic flow, session prep, ROI report)
- [ ] LinkedIn articles: "How to Prove Coaching ROI" (with Coach Perfect examples)
- [ ] Outreach to 5 coaching podcast hosts for guest spots

**Week 7: Partnership Launch**
- [ ] Approach ICF local chapters for presentation opportunities
- [ ] Contact 3 coaching certification programs for partnership
- [ ] Launch referral program: coaches get 1 month free per referral
- [ ] Create "Coach Perfect Partner" tier for coaching organizations
- [ ] Explore conference speaking opportunities (book 2-3 for coming months)

**Week 8: Growth Engine Activation**
- [ ] Template library goes live (25 free templates, email-gated)
- [ ] Embeddable diagnostic widget released
- [ ] SEO pages published: "Business Health Score for [Industry]" × 10 industries
- [ ] First monthly webinar: "How to Use Data to Grow Your Coaching Practice"
- [ ] Target: 30 paying coaches, $3,000-$5,000 MRR

### Phase 3: Scale (Weeks 9-24)

**Months 3-4: Channel Development**
- [ ] Certification program launches ($495)
- [ ] Coach directory goes live
- [ ] First coached "Coach Perfect Method" workshop
- [ ] Target: 75 paying coaches, $8,000-$12,000 MRR
- [ ] Hire first part-time support person (if needed)

**Months 5-6: Market Expansion**
- [ ] Expand beyond Louisiana/Texas: target 3 new states
- [ ] International pilot (UK/Australia — English-speaking, strong coaching markets)
- [ ] First Enterprise/white-label customer
- [ ] Launch peer group features (Meredith's CEO Roundtable is the template)
- [ ] Target: 150 paying coaches, $18,000-$25,000 MRR
- [ ] First "State of Small Business" report (from aggregated data)

### Launch Day Checklist

- [ ] Platform tested end-to-end (signup → onboard → diagnostic → session → export)
- [ ] Payment processing tested (all tiers, monthly + annual)
- [ ] Email sequences activated (welcome, onboarding tips days 1/3/7/14)
- [ ] Support queue monitored (response time <4 hours)
- [ ] Status page live (status.coachperfect.io)
- [ ] Analytics tracking verified (Mixpanel/Amplitude/PostHog)
- [ ] Error monitoring active (Sentry)
- [ ] Backup and recovery tested
- [ ] SSL certificate valid
- [ ] Load testing passed (50 concurrent users minimum)

---

## 3. MULTI-COACH FIRM MODE

### The Opportunity
Solo coaches are the first market, but coaching firms (5-50 coaches) represent 10x the revenue per account. Coach Perfect needs a firm-level experience from Business tier up.

### Firm Architecture

```
┌─────────────────────────────────────────┐
│           FIRM ADMIN DASHBOARD          │
│  (Firm owner/manager sees everything)   │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────┐  ┌───────────┐  ┌───────┐
│  │ Coach A   │  │ Coach B   │  │ Coach │
│  │ 12 clients│  │ 8 clients │  │ C ... │
│  │ $14K MRR  │  │ $9K MRR   │  │       │
│  └───────────┘  └───────────┘  └───────┘
│                                         │
│  FIRM-LEVEL VIEWS:                      │
│  • Total clients: 47                    │
│  • Total MRR: $52,000                   │
│  • Avg BHS improvement: 19 points       │
│  • Avg client retention: 84%            │
│  • Top performing coach: Coach A        │
│  • At-risk clients: 3                   │
└─────────────────────────────────────────┘
```

### Firm Admin Features

**Dashboard:**
- Aggregate metrics across all coaches: total clients, total revenue, avg BHS improvement, retention rate, session count
- Coach comparison view (opt-in): who's most effective, who has capacity, who needs support
- Client list with filter: by coach, by status, by risk level, by BHS range
- Revenue tracking: MRR by coach, pipeline by coach, renewal calendar

**Coach Management:**
- Add/remove coaches (each at $99/mo per seat)
- Assign clients to coaches (drag-and-drop or auto-assign based on fit)
- Transfer clients between coaches (with history preserved)
- Coach performance metrics: session adherence, task completion rates, client outcomes
- Coach activity log: last login, sessions this week, diagnostics run

**Client Assignment Logic:**
- Manual: firm admin assigns
- Smart match: based on coach specialty, capacity, client industry, location
- Load balancing: "Coach A has 15 clients, Coach C has 4. Recommend routing new clients to Coach C."
- Re-assignment workflow: when a coach leaves, clients auto-queue for reassignment

**Firm-Level Reporting:**
- "Firm Impact Report" — quarterly aggregate: clients served, outcomes achieved, ROI generated
- Exportable for firm marketing: "Our firm improved average client BHS by 22 points"
- Individual coach reports for performance reviews
- Client satisfaction aggregated across firm

**Firm Billing:**
- Single invoice for all seats
- Volume discount: 5-9 seats = 10% off, 10-19 seats = 15% off, 20+ seats = 20% off
- Coach can have individual plan OR be part of firm plan (no double-billing)

### Firm Pricing

| Firm Size | Base | Per Coach Seat | Total | Per Coach Savings |
|-----------|------|---------------|-------|-------------------|
| 2-4 coaches | $349 (Business) | $99/each additional | $547-$646 | ~$162/coach |
| 5-9 coaches | $349 | $89/each (10% off) | $703-$1,061 | ~$118/coach |
| 10-19 coaches | $349 | $84/each (15% off) | $1,105-$1,861 | ~$98/coach |
| 20+ coaches | Custom | $79/each (20% off) | Custom | ~$79/coach |

---

## 4. CORPORATE BUYER PORTAL

### The Second Market
Beyond solo coaches and firms, there's a massive B2B market: companies buying coaching for their leaders.

**Buyers:** HR directors, L&D managers, Chief People Officers, CEOs of mid-market companies (100-1,000 employees)

**What They Buy:** Coaching engagements for 5-50 leaders simultaneously

**What They Need (That Coaches Don't):**
- ROI reporting rolled up across all leaders being coached
- Compliance and confidentiality guarantees
- Single invoice and procurement-friendly pricing
- Progress visibility without seeing session content
- Vendor management features

### Corporate Dashboard

```
┌─────────────────────────────────────────────┐
│         ACME CORP — COACHING PROGRAM        │
│  HR Admin: Sarah Johnson                     │
├─────────────────────────────────────────────┤
│                                              │
│  PROGRAM OVERVIEW                            │
│  Leaders enrolled: 12                        │
│  Coaches assigned: 3                         │
│  Avg sessions completed: 6.2                 │
│  Program start: Jan 15, 2026                 │
│  Program end: Jun 15, 2026                   │
│                                              │
│  AGGREGATE OUTCOMES (no individual names)    │
│  Avg BHS improvement: +16 points             │
│  Diagnostic completion: 100%                 │
│  Session attendance: 94%                     │
│  Task completion: 78%                        │
│  Program NPS: 8.7/10                         │
│                                              │
│  INVESTMENT & ROI                            │
│  Total investment: $72,000                   │
│  Estimated ROI: $216,000 (3:1)               │
│  Top improvement areas: Leadership, Strategy │
│  Lowest improvement: Operations              │
│                                              │
│  ⚠ ATTENTION NEEDED                          │
│  • 2 leaders haven't scheduled next session  │
│  • 1 coach has capacity for 2 more leaders   │
│  • Mid-program survey due in 2 weeks         │
│                                              │
│  [📊 Download Program Report]                │
│  [📧 Share with Executive Team]              │
└─────────────────────────────────────────────┘
```

### Key Design Principle: CONFIDENTIALITY WALL

The corporate buyer sees:
- ✅ Aggregate metrics (average BHS improvement, completion rates)
- ✅ Program-level ROI
- ✅ Attendance and engagement data
- ✅ Anonymous feedback themes

The corporate buyer NEVER sees:
- ❌ Individual session notes
- ❌ Individual diagnostic responses
- ❌ What any specific leader said
- ❌ Individual KPIs or financial data
- ❌ Coach's notes about a specific leader

This confidentiality wall is the ONLY way coaching programs work in corporate settings. Coaches won't use a platform that compromises it, and leaders won't be honest in sessions.

### Corporate Features

**Procurement:**
- Custom SOW generator (scope, timeline, deliverables, pricing)
- W-9/vendor registration auto-complete
- Single PO for entire program
- Invoicing on net-30/60 terms
- Budget tracking vs. approved PO

**Program Management:**
- Cohort creation: "Q1 2026 Leadership Development — 12 leaders"
- Coach assignment: match coaches to leaders based on specialty/preference
- Milestone tracking: enrollment → diagnostic → sessions → mid-point review → final assessment
- Automated reminders to leaders who fall behind
- Mid-program and end-of-program surveys

**Reporting (For HR/L&D):**
- Monthly progress report (automated)
- Mid-program assessment with recommendations
- Final program impact report (board-ready)
- Year-over-year comparison (for recurring programs)
- Benchmark against other companies (anonymized): "Your leaders improved 16 points vs. industry avg 14"

### Corporate Pricing

| Program Size | Per Leader/Month | Minimum Commitment | Includes |
|-------------|-----------------|-------------------|----------|
| 5-10 leaders | $399/leader/mo | 6 months | Full diagnostic, sessions, reporting, admin portal |
| 11-25 leaders | $349/leader/mo | 6 months | + dedicated CSM, custom reporting |
| 26-50 leaders | $299/leader/mo | 12 months | + executive briefings, custom diagnostic |
| 50+ leaders | Custom | 12 months | Full enterprise, white-label option |

**Revenue example:** 15 leaders × $349/mo × 12 months = $62,820/year from ONE corporate account

### The Coach's Cut
When Coach Perfect sells corporate programs:
- Coach delivers sessions (their usual rate)
- Coach Perfect provides platform + admin + reporting
- Split: Coach gets 70% of per-leader fee, Coach Perfect gets 30%
- Or: Coach pays for Coach Perfect subscription, bills corporate client directly at their own rate

---

## 5. INFRASTRUCTURE & OPERATIONS

### Technology Stack (Recommended)

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Frontend** | React + Next.js | SEO for marketing pages, fast for app |
| **Backend** | Node.js (Express or Fastify) | Same language as frontend, fast dev |
| **Database** | PostgreSQL (Supabase or Neon) | Relational data, excellent for SaaS |
| **Auth** | Clerk or Auth0 | SSO, MFA, social login, not worth building |
| **Payments** | Stripe | Subscriptions, invoicing, metered billing |
| **Email** | Resend or Postmark | Transactional. Mailgun for marketing volume |
| **File Storage** | AWS S3 or Cloudflare R2 | Documents, exports, attachments |
| **Hosting** | Vercel (frontend) + Railway/Render (backend) | Fast deploys, auto-scaling, reasonable cost |
| **AI** | OpenAI API (GPT-4o) or Claude API | Session prep, recommendations, NLP |
| **Search** | Algolia or Meilisearch | Coach directory, template library, in-app search |
| **Analytics** | PostHog (self-hosted) or Mixpanel | Product analytics, feature adoption |
| **Error Monitoring** | Sentry | Crash reporting, performance monitoring |
| **Uptime Monitoring** | BetterUptime or UptimeRobot | Status page, alerting |
| **CI/CD** | GitHub Actions | Build, test, deploy |
| **CDN** | Cloudflare | Speed, DDoS protection, edge caching |

### Monthly Infrastructure Cost Estimate

| Stage | Users | Monthly Cost | Notes |
|-------|-------|-------------|-------|
| MVP / Beta | <50 coaches | $50-$150/mo | Free tiers of most services |
| Early Growth | 50-200 coaches | $200-$500/mo | Paid tiers, moderate traffic |
| Growth | 200-500 coaches | $500-$1,500/mo | More compute, more storage, more email |
| Scale | 500-2,000 coaches | $1,500-$5,000/mo | Dedicated resources, CDN, support tools |

### Database Schema — Core Tables

```sql
-- Core entities
coaches           -- id, email, name, plan, firm_id, created_at
clients           -- id, coach_id, name, email, company, industry, status
firms             -- id, name, owner_coach_id, plan, seats
corporate_programs -- id, company_name, hr_admin_id, start_date, end_date

-- Diagnostic engine
diagnostics       -- id, client_id, type, status, started_at, completed_at
diagnostic_responses -- id, diagnostic_id, question_id, answer_value
diagnostic_scores -- id, diagnostic_id, category, score, benchmark_percentile
questions         -- id, category, text, weight, industry_module

-- Sessions
sessions          -- id, client_id, coach_id, date, status, duration_min
session_notes     -- id, session_id, content, ai_summary, created_at
session_preps     -- id, session_id, ai_brief, reviewed_by_coach

-- Tasks & accountability
tasks             -- id, client_id, assigned_by, title, due_date, status
habits            -- id, client_id, title, frequency, streak_count
wins              -- id, client_id, description, date, category
pulse_checkins    -- id, client_id, date, energy, progress, blockers

-- KPIs & financials
kpis              -- id, client_id, metric_name, value, date, source
kpi_definitions   -- id, name, category, unit, direction (higher_better)

-- Business tools
proposals         -- id, coach_id, client_id, status, total_value
packages          -- id, coach_id, name, sessions_included, price
pipeline_leads    -- id, coach_id, name, email, stage, source, score
testimonials      -- id, coach_id, client_id, text, permission_level

-- Analytics
events            -- id, user_id, event_type, properties, timestamp
coach_health      -- id, coach_id, status (green/yellow/red), factors, date
```

### Security Requirements

| Requirement | Implementation | Priority |
|-------------|---------------|----------|
| Encryption at rest | PostgreSQL encryption + S3 SSE | Launch |
| Encryption in transit | TLS 1.3 everywhere | Launch |
| Authentication | MFA available, enforced for Enterprise | Launch |
| Session management | JWT with refresh tokens, 24hr expiry | Launch |
| Input validation | Server-side validation on all endpoints | Launch |
| RBAC | Role-based access: admin, coach, client, firm_admin, corp_admin | Launch |
| Data backup | Daily automated backups, 30-day retention | Launch |
| Audit log | All data access logged with timestamps | Month 2 |
| Penetration testing | Annual third-party pen test | Month 6 |
| SOC 2 Type I | Begin compliance process | Month 9 |
| SOC 2 Type II | Complete certification | Month 18 |
| GDPR compliance | Data export, deletion, DPA available | Launch |

### Monitoring & Alerting

| What | Tool | Alert Threshold |
|------|------|----------------|
| Uptime | BetterUptime | Any downtime → immediate |
| Error rate | Sentry | >1% error rate → Slack alert |
| Response time | Built-in middleware | p95 >500ms → warning, >2s → critical |
| Database | Supabase dashboard | CPU >80%, storage >75% |
| Email delivery | Resend dashboard | Bounce rate >5% |
| Payment failures | Stripe webhooks | Any failed charge → alert + retry |
| Security | Cloudflare | Unusual traffic patterns → alert |

### Backup & Recovery

| Data | Backup Frequency | Retention | Recovery Time |
|------|-----------------|-----------|---------------|
| Database (full) | Daily | 30 days | <1 hour |
| Database (incremental) | Every 6 hours | 7 days | <30 min |
| File storage | Continuous (S3 versioning) | 90 days | <15 min |
| Code | Git (GitHub) | Forever | <5 min (redeploy) |
| Configuration | Environment variables in Vault/Doppler | Versioned | <10 min |

---

## 6. LEGAL TEMPLATES

### 6A. Terms of Service (Key Provisions)

**Account Terms:**
- Coaches must be 18+ and provide accurate information
- One person per account (no sharing credentials)
- Coach is responsible for maintaining account security
- Coach Perfect reserves right to suspend accounts violating ToS

**Payment Terms:**
- Monthly billing on subscription anniversary
- Annual plans billed upfront with stated discount
- Failed payments: 3 retry attempts over 10 days, then account downgraded to Free
- No refunds for partial months; annual plans refundable pro-rata within first 30 days
- Price changes: 30-day notice for monthly, honored through current annual term

**Data & Privacy:**
- Coach owns their data and client data
- Coach Perfect may use anonymized, aggregated data for benchmarking (no PII)
- Client data is confidential between coach and client
- Coach Perfect will not access individual session notes except for technical support (with coach permission)
- Full data export available at any time
- Data deleted 30 days after account termination (coach can request earlier)

**Acceptable Use:**
- No illegal activity, harassment, spam, or abuse
- No scraping, reverse engineering, or unauthorized API access
- No reselling access without Enterprise agreement
- No misrepresenting Coach Perfect as coach's own proprietary technology (except white-label)

**Liability:**
- Coach Perfect is a technology platform, not a coaching service
- Coach Perfect does not provide legal, financial, or therapeutic advice
- AI recommendations are informational, not professional advice
- Coach is solely responsible for coaching quality and client relationships
- Standard SaaS limitation of liability (damages capped at 12 months of fees)

**Termination:**
- Coach can cancel anytime; access continues through end of billing period
- Coach Perfect can terminate for ToS violations with 30-day notice (immediate for egregious violations)
- Data export available for 30 days post-termination

### 6B. Privacy Policy (Key Provisions)

**Data Collected:**
- Account information (name, email, company, payment method)
- Client information (as entered by coach)
- Diagnostic responses and scores
- Session metadata (date, duration — NOT content unless opted in)
- Usage data (features used, login frequency, page views)
- Device/browser information (for support and security)

**Data Usage:**
- Provide and improve the platform
- Generate anonymized benchmarks and reports
- Send transactional emails (notifications, billing)
- Send marketing emails (opt-out available)
- Prevent fraud and ensure security
- Comply with legal obligations

**Data NOT Shared With:**
- Advertisers (Coach Perfect does not sell data)
- Other coaches (unless coach explicitly shares)
- Corporate buyers (session content is confidential)
- Third parties for marketing

**Data Shared With:**
- Service providers (hosting, email, payment) under DPA
- Law enforcement (only when legally compelled)
- In aggregate (anonymized benchmarks, no PII)

**Client Rights:**
- Access: request copy of all data
- Correction: update inaccurate data
- Deletion: request deletion of account and data
- Portability: export data in standard formats
- Objection: opt out of marketing, benchmarking use

**Retention:**
- Active accounts: data retained for duration of account
- Post-termination: 30 days then permanent deletion
- Anonymized aggregate data: retained indefinitely (no PII)
- Backups: purged within 90 days of deletion request

### 6C. Coach-Client Confidentiality Agreement Template

```
COACHING CONFIDENTIALITY AGREEMENT

This agreement is between [Coach Name] ("Coach") and [Client Name] ("Client").

1. CONFIDENTIAL INFORMATION
All information shared during coaching sessions, diagnostics, assessments,
and related communications is considered confidential. This includes but
is not limited to: business financials, strategic plans, personal
information, employee matters, and diagnostic results.

2. COACH OBLIGATIONS
The Coach agrees to:
- Maintain strict confidentiality of all client information
- Not disclose client information to any third party without written consent
- Store client data securely using encrypted systems (Coach Perfect platform)
- Destroy or return confidential information upon request

3. EXCEPTIONS
Confidentiality may be broken only if:
- Client provides written consent to share specific information
- Required by law or court order
- There is imminent risk of harm to the client or others
- Anonymous, aggregate data is used for benchmarking (no PII)

4. DATA PLATFORM
Coaching data is stored on the Coach Perfect platform. Client acknowledges:
- Data is encrypted at rest and in transit
- Coach controls access to all client data
- Client can request data export or deletion at any time
- Anonymized diagnostic data may contribute to industry benchmarks

5. DURATION
This agreement survives the end of the coaching engagement indefinitely.

Signed: _________________________ Date: _________
Coach: [Coach Name]

Signed: _________________________ Date: _________
Client: [Client Name]
```

### 6D. Coaching Services Agreement Template

```
COACHING SERVICES AGREEMENT

Between: [Coach Name/Company] ("Coach")
And: [Client Name/Company] ("Client")
Effective Date: [Date]

1. SERVICES
Coach will provide [executive/business/leadership] coaching services including:
- [X] sessions per [month/quarter] of [60/90] minutes each
- [X] diagnostic assessments (initial + re-diagnostic at [interval])
- [  ] 360° feedback assessment
- [  ] Team diagnostic
- [  ] Quarterly Business Review
- Between-session support via [email/text/platform messaging]

2. SCHEDULE
- Sessions: [weekly/bi-weekly/monthly] on [day/time] or as mutually agreed
- Location: [in-person/virtual/hybrid]
- Cancellation: 24-hour notice required; late cancellations count as used session

3. INVESTMENT
- Total engagement value: $[amount]
- Payment schedule: $[amount] per [month/quarter]
- Payment method: [invoice/auto-charge]
- Payment terms: Due within [15/30] days of invoice

4. TERM & RENEWAL
- Initial term: [3/6/12] months from effective date
- Renewal: [auto-renews / requires new agreement]
- Early termination: Either party may terminate with 30 days written notice
- Unused sessions: [non-refundable / refundable pro-rata / rollover 30 days]

5. CONFIDENTIALITY
Per attached Confidentiality Agreement (incorporated by reference).

6. EXPECTATIONS
Coach will: provide professional coaching, maintain confidentiality,
prepare for sessions, track progress via Coach Perfect platform.

Client will: attend sessions, complete assigned tasks and diagnostics,
communicate openly, provide timely payment.

7. LIMITATIONS
Coaching is not therapy, consulting, or legal/financial advice.
Coach will refer client to appropriate professionals when needed.

8. TECHNOLOGY
Sessions supported by Coach Perfect coaching platform. Client will:
- Complete diagnostic assessments via the platform
- Review and update tasks and KPIs as agreed
- Access their dashboard for progress tracking

9. INTELLECTUAL PROPERTY
- Frameworks and methodologies remain property of Coach
- Client's business data remains property of Client
- Platform data shared per Coach Perfect Terms of Service

Signed: _________________________ Date: _________
Coach: [Coach Name]

Signed: _________________________ Date: _________
Client: [Client Name]
```

### 6E. Data Processing Agreement (DPA) — Summary Provisions

For Enterprise/corporate clients who require it:

- **Data Controller:** Coach (or Corporate Client)
- **Data Processor:** Coach Perfect
- **Sub-processors:** Listed (Supabase, AWS, Stripe, email provider) with notification of changes
- **Data location:** United States (with option for EU hosting at Enterprise tier)
- **Processing purpose:** Solely to provide the Coach Perfect platform services
- **Security measures:** Encryption, access controls, monitoring, backups, incident response
- **Breach notification:** Within 72 hours of confirmed breach
- **Data deletion:** Within 30 days of termination or upon request
- **Audit rights:** Corporate client may request annual compliance attestation
- **Standard Contractual Clauses:** Included for international data transfers

### 6F. Referral Partner Agreement Template

```
COACH PERFECT REFERRAL PARTNER AGREEMENT

Between: Coach Perfect LLC ("Coach Perfect")
And: [Partner Name] ("Partner")

1. REFERRAL PROGRAM
Partner will refer potential coaches to Coach Perfect via:
- Unique referral link: coachperfect.io/r/[partner-code]
- Direct introduction to Coach Perfect team
- Co-marketing activities (webinars, content, events)

2. COMPENSATION
- First 6 months: 15% of referred coach's monthly subscription
- Months 7-12: 10% of referred coach's monthly subscription
- After 12 months: 5% ongoing (for life of the referred account)
- Payments: Monthly, net-30, via Stripe Connect or ACH
- Minimum payout: $50 (rolls over if below threshold)

3. ATTRIBUTION
- Referral tracked via unique link or manual attribution
- 90-day cookie/attribution window
- If prospect uses referral link and signs up within 90 days = credited

4. EXCLUSIONS
- Self-referrals not eligible
- Existing Coach Perfect users not eligible
- Fraudulent referrals result in immediate termination

5. TERM
- 12 months, auto-renewing
- Either party may terminate with 30 days notice
- Commissions earned before termination will be paid

6. RESPONSIBILITIES
Partner will: accurately represent Coach Perfect, not make false claims,
comply with applicable advertising laws.
Coach Perfect will: track referrals, process payments, provide marketing materials.
```

---

## 7. DATA MIGRATION & ONBOARDING FROM COMPETITORS

### CSV Import Wizard

Most coaches switching from other tools have data in spreadsheets or other platforms. Coach Perfect needs a dead-simple import.

**Supported Import Sources:**
- CSV/Excel files (universal)
- CoachAccountable export
- Paperbell export
- Satori export
- Practice Better export
- Google Sheets

**Import Workflow:**
1. Coach uploads file (drag-and-drop)
2. Coach Perfect auto-detects columns: "We found: Name, Email, Company, Start Date, Notes"
3. Coach maps columns to Coach Perfect fields (smart suggestions pre-filled)
4. Preview: "We'll import 12 clients with their contact info and session history"
5. Import: data created, coach sees populated dashboard
6. Review: "Import complete! 12 clients added. 2 had missing emails — want to fix those?"

**What Can Be Imported:**
- Client contact information
- Session history (dates, durations, notes if available)
- Goals and action items
- Documents and attachments
- Financial data (invoices, payments)

**What Can't Be Imported (But Coach Perfect Replaces):**
- Diagnostic data (client takes Coach Perfect diagnostic — this IS the product demo)
- Benchmarks (generated by Coach Perfect's proprietary data)
- AI insights (generated fresh from Coach Perfect's intelligence)

### Competitor Comparison Landing Pages

For SEO and conversion:
- "Coach Perfect vs CoachAccountable" — feature comparison table
- "Coach Perfect vs Paperbell" — feature comparison table
- "Coach Perfect vs Practice Better" — feature comparison table
- "Switching from [Competitor] to Coach Perfect" — step-by-step guide with import instructions

---

## 8. COACHING SUPERVISION MODULE

### Why This Matters
ICF requires coaches to complete supervised hours for credentialing (ACC, PCC, MCC). Currently this happens via phone calls or Zoom with a mentor coach reviewing session recordings or written notes. Coach Perfect can make this better.

### How It Works

**Coach (Supervisee) Side:**
- Selects sessions to share with supervisor (anonymized client names optional)
- Shares: session notes, diagnostic context, AI debrief, task outcomes
- Adds reflection: "What I'm struggling with..." "Where I want feedback..."
- Logs supervision hours toward ICF credentialing

**Supervisor Side:**
- Reviews shared session materials asynchronously or in live supervision session
- Provides feedback: text annotations on session notes, ratings on ICF competencies
- Tracks supervisee progress: competency development over time
- Issues supervision verification (for ICF credentialing documentation)

**Coach Perfect Facilitates:**
- Supervision scheduling (built into calendar)
- Supervision notes (separate from coaching notes — meta-level)
- Competency tracking: which ICF competencies are developing, which need work
- Hour logging: "42 of 100 required mentor coaching hours completed"
- Export: formal supervision documentation for ICF credentialing applications

### Revenue
- Supervisor subscription: $49/mo (special tier for mentor coaches)
- Supervisee access: included in Professional+ plans
- ICF credentialing tracking: free (drives adoption)

### Competitive Advantage
No coaching platform does this well. It creates a built-in training & development layer that keeps coaches on the platform from the moment they start their coaching career through credentialing and beyond.

---

## 9. COACH MATCHING MARKETPLACE

### Phase 1: Directory (Launch)
- Coach creates public profile: name, photo, bio, specialties, industries, certifications, location
- Verified badges: "Coach Perfect Verified" (completed training + active clients)
- Aggregate metrics: "22 clients coached, avg 19-point BHS improvement"
- Searchable by: specialty, industry, location, price range, certification
- URL: coachperfect.io/coaches/[name]

### Phase 2: Matching (Month 6+)
- Prospect takes free diagnostic → gets results + "Want a coach? Here are 3 matches."
- Matching algorithm: industry experience, price range, coaching style, location, availability
- Prospect requests intro → coach gets notification with prospect profile + diagnostic results
- Coach accepts/declines within 48 hours
- Discovery call scheduled through Coach Perfect

### Phase 3: Marketplace (Month 12+)
- Prospect books directly through Coach Perfect
- Coach Perfect handles: scheduling, payment, invoicing
- Platform fee: 15% of first 6 months, 10% ongoing
- Coach sees: "New client from Coach Perfect marketplace — net revenue: $425/session"
- Reviews and ratings from clients (verified, post-engagement only)

### Marketplace Revenue at Scale
- 500 coaches × avg 1 marketplace client each/year × $500/mo × 12.5% avg fee = $375,000/year
- This is pure platform revenue with zero customer acquisition cost

---

## DOCUMENT SUMMARY

| Section | Key Deliverable |
|---------|----------------|
| Pricing & Packaging | 5 tiers with detailed feature gates, psychology, and revenue math |
| GTM Launch Sequence | Week-by-week plan from pre-launch through Month 6 |
| Multi-Coach Firm Mode | Architecture, features, pricing for coaching firms |
| Corporate Buyer Portal | Dashboard, confidentiality wall, features, pricing for B2B |
| Infrastructure & Ops | Full tech stack, cost estimates, database schema, security |
| Legal Templates | ToS, Privacy Policy, Confidentiality, Services Agreement, DPA, Referral Agreement |
| Data Migration | CSV import wizard, competitor comparison pages |
| Coaching Supervision | ICF-aligned supervision module |
| Coach Marketplace | 3-phase directory → matching → marketplace |

---

## COMPLETE COACH PERFECT DOCUMENTATION SET

| Doc | Title | Content |
|-----|-------|---------|
| 01 | Business Plan | Market, competition, business model, financials |
| 02 | Diagnostic & Coaching | 48-question diagnostic, scoring, methodology |
| 03 | Pitch & Marketing | Investor pitch, marketing strategy, messaging |
| 04 | Architecture | Technical architecture, component design |
| 05 | Feature Recommendations | 42 features across 8 themes |
| 06 | Competitive Separation | 28 moat-building concepts |
| 07 | Drill-Down Architecture | Complete UI proof system, 500+ drill-down points |
| 08 | Growth & Final Layer | PLG loops, onboarding, AI, gamification, mobile |
| 09 | Final Innovation Layer | Novel concepts, partner ecosystem, crisis tools |
| 10 | Pricing, GTM & Operations | Pricing, launch plan, infrastructure, legal |
| — | Platform Code | 36-file React + Node.js implementation |
| — | Dashboard JSX | Interactive coach dashboard component |

**Total strategic features mapped: 250+**
**Total documents: 10 strategy + codebase**

This is the most comprehensively documented coaching SaaS platform that exists. Period.
