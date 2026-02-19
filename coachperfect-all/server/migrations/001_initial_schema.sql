-- ═══════════════════════════════════════════════════
-- COACH PERFECT — LOCAL POSTGRESQL SCHEMA
-- ═══════════════════════════════════════════════════
--
-- Setup:
--   1. createdb coachperfect
--   2. psql -d coachperfect -f migrations/001_initial_schema.sql
--
-- Tables:
--   users               — login credentials
--   coaches             — coach profile + billing state
--   clients             — clients managed by each coach
--   diagnostics         — one row per diagnostic assessment
--   diagnostic_responses — one row per question (48 per diagnostic)
--   diagnostic_scores   — one row per category (8 per diagnostic)
--   sessions            — coaching session log
--   tasks               — action items
--   wins                — win journal entries
--   goals               — goal tracker
--   habits              — habit definitions
--   habit_checks        — daily check-ins
--   payments            — Stripe payment log
--   waitlist            — email signups
--

-- ─── EXTENSIONS ───────────────────────────────────
create extension if not exists "pgcrypto";

-- ═══════════════════════════════════════════════════
-- USERS (auth)
-- ═══════════════════════════════════════════════════
create table if not exists users (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  password_hash   text not null,
  email_verified  boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════
-- COACHES
-- ═══════════════════════════════════════════════════
create table if not exists coaches (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null unique references users(id) on delete cascade,
  name                    text not null,
  business_name           text,
  bio                     text,
  specialty               text,
  -- Stripe billing state
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  plan                    text not null default 'free',
  plan_status             text not null default 'active',
  trial_ends_at           timestamptz,
  subscribed_at           timestamptz,
  canceled_at             timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  archived_at             timestamptz
);

-- ═══════════════════════════════════════════════════
-- CLIENTS
-- ═══════════════════════════════════════════════════
create table if not exists clients (
  id              uuid primary key default gen_random_uuid(),
  coach_id        uuid not null references coaches(id) on delete cascade,
  name            text not null,
  email           text,
  phone           text,
  business_name   text,
  industry        text,
  status          text not null default 'active',
  notes           text,
  -- ROI tracking
  revenue_before  numeric(14,2),
  revenue_after   numeric(14,2),
  coaching_fee    numeric(14,2),
  coaching_months integer,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  archived_at     timestamptz
);

-- ═══════════════════════════════════════════════════
-- DIAGNOSTICS
-- ═══════════════════════════════════════════════════
create table if not exists diagnostics (
  id                   uuid primary key default gen_random_uuid(),
  -- coach_id is null for public (un-claimed) diagnostic submissions
  coach_id             uuid references coaches(id) on delete cascade,
  client_id            uuid references clients(id) on delete set null,
  respondent_email     text,
  respondent_name      text,
  respondent_business  text,
  overall_score        integer,
  -- category scores stored as JSON for convenience
  categories           jsonb,
  completed_at         timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table if not exists diagnostic_responses (
  id              uuid primary key default gen_random_uuid(),
  diagnostic_id   uuid not null references diagnostics(id) on delete cascade,
  question_index  integer not null,
  category        text not null,
  answer_index    integer not null,
  score           integer not null,
  created_at      timestamptz not null default now(),
  unique(diagnostic_id, question_index)
);

create table if not exists diagnostic_scores (
  id              uuid primary key default gen_random_uuid(),
  diagnostic_id   uuid not null references diagnostics(id) on delete cascade,
  category        text not null,
  score           integer not null,
  created_at      timestamptz not null default now(),
  unique(diagnostic_id, category)
);

-- ═══════════════════════════════════════════════════
-- SESSIONS
-- ═══════════════════════════════════════════════════
create table if not exists sessions (
  id                uuid primary key default gen_random_uuid(),
  coach_id          uuid not null references coaches(id) on delete cascade,
  client_id         uuid references clients(id) on delete set null,
  scheduled_at      timestamptz not null,
  duration_min      integer not null default 60,
  session_type      text not null default 'coaching',
  status            text not null default 'scheduled',
  notes             text,
  session_summary   text,
  follow_up_actions text,
  completed_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════
-- TASKS
-- ═══════════════════════════════════════════════════
create table if not exists tasks (
  id           uuid primary key default gen_random_uuid(),
  coach_id     uuid not null references coaches(id) on delete cascade,
  client_id    uuid references clients(id) on delete set null,
  title        text not null,
  description  text,
  category     text not null default 'general',
  priority     text not null default 'medium',
  due_date     date,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════
-- WINS
-- ═══════════════════════════════════════════════════
create table if not exists wins (
  id         uuid primary key default gen_random_uuid(),
  coach_id   uuid not null references coaches(id) on delete cascade,
  title      text not null,
  category   text not null default 'general',
  starred    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════
-- GOALS
-- ═══════════════════════════════════════════════════
create table if not exists goals (
  id            uuid primary key default gen_random_uuid(),
  coach_id      uuid not null references coaches(id) on delete cascade,
  title         text not null,
  category      text not null default 'general',
  target_value  numeric(14,2),
  current_value numeric(14,2) not null default 0,
  target_date   date,
  status        text not null default 'active',
  milestones    jsonb not null default '[]',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════
-- HABITS
-- ═══════════════════════════════════════════════════
create table if not exists habits (
  id                   uuid primary key default gen_random_uuid(),
  coach_id             uuid not null references coaches(id) on delete cascade,
  name                 text not null,
  streak               integer not null default 0,
  target_days_per_week integer not null default 7,
  active               boolean not null default true,
  created_at           timestamptz not null default now()
);

create table if not exists habit_checks (
  id           uuid primary key default gen_random_uuid(),
  habit_id     uuid not null references habits(id) on delete cascade,
  checked_date date not null default current_date,
  created_at   timestamptz not null default now(),
  unique(habit_id, checked_date)
);

-- ═══════════════════════════════════════════════════
-- PAYMENTS (Stripe invoice log)
-- ═══════════════════════════════════════════════════
create table if not exists payments (
  id                  uuid primary key default gen_random_uuid(),
  stripe_customer_id  text not null,
  stripe_invoice_id   text not null unique,
  amount_paid         integer not null,
  currency            text not null default 'usd',
  paid_at             timestamptz,
  status              text not null default 'paid',
  created_at          timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════
-- WAITLIST
-- ═══════════════════════════════════════════════════
create table if not exists waitlist (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  name            text,
  business_type   text,
  referral_source text,
  position        serial,
  created_at      timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════
create index if not exists idx_coaches_user_id          on coaches(user_id);
create index if not exists idx_coaches_stripe_customer  on coaches(stripe_customer_id);
create index if not exists idx_clients_coach_id         on clients(coach_id);
create index if not exists idx_clients_status           on clients(status);
create index if not exists idx_diagnostics_coach_id     on diagnostics(coach_id);
create index if not exists idx_diagnostics_email        on diagnostics(respondent_email);
create index if not exists idx_sessions_coach_id        on sessions(coach_id);
create index if not exists idx_sessions_scheduled_at    on sessions(scheduled_at desc);
create index if not exists idx_tasks_coach_id           on tasks(coach_id);
create index if not exists idx_wins_coach_id            on wins(coach_id);
create index if not exists idx_goals_coach_id           on goals(coach_id);
create index if not exists idx_habits_coach_id          on habits(coach_id);
create index if not exists idx_habit_checks_habit_id    on habit_checks(habit_id);
create index if not exists idx_habit_checks_date        on habit_checks(checked_date desc);
create index if not exists idx_payments_customer        on payments(stripe_customer_id);

-- ═══════════════════════════════════════════════════
-- TRIGGERS — auto-update updated_at
-- ═══════════════════════════════════════════════════
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated_at    before update on users    for each row execute function set_updated_at();
create trigger trg_coaches_updated_at  before update on coaches  for each row execute function set_updated_at();
create trigger trg_clients_updated_at  before update on clients  for each row execute function set_updated_at();
create trigger trg_sessions_updated_at before update on sessions for each row execute function set_updated_at();
create trigger trg_tasks_updated_at    before update on tasks    for each row execute function set_updated_at();
create trigger trg_goals_updated_at    before update on goals    for each row execute function set_updated_at();
create trigger trg_diag_updated_at     before update on diagnostics for each row execute function set_updated_at();
