-- ═══════════════════════════════════════════════════════════════════════════════
-- COACHPERFECT DATABASE SCHEMA  (SQLite-compatible; Postgres-ready with minor tweaks)
-- ═══════════════════════════════════════════════════════════════════════════════

PRAGMA foreign_keys = ON;

-- ─── COACHES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coaches (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  company     TEXT,
  avatar      TEXT,                        -- initials or URL
  plan        TEXT NOT NULL DEFAULT 'free',-- free|starter|professional|business|enterprise
  plan_status TEXT NOT NULL DEFAULT 'active',
  stripe_customer_id   TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  trial_ends_at  INTEGER,                  -- unix timestamp
  password_hash  TEXT NOT NULL,
  landing_page_url TEXT,
  created_at  INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at  INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- ─── CLIENTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  coach_id    TEXT NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  company     TEXT,
  avatar      TEXT,
  engagement  TEXT DEFAULT '1:1 Coaching',
  plan        TEXT DEFAULT 'starter',     -- client's sub tier
  mrr         INTEGER DEFAULT 0,          -- cents
  health_score INTEGER DEFAULT 0,
  status      TEXT DEFAULT 'active',      -- active|paused|churned
  member_since TEXT,
  password_hash TEXT,                     -- for client portal login
  created_at  INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at  INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- ─── DOCUMENTS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  coach_id      TEXT NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  client_id     TEXT REFERENCES clients(id) ON DELETE SET NULL,
  uploaded_by   TEXT NOT NULL,            -- 'coach' | 'client'
  name          TEXT NOT NULL,            -- display name
  original_name TEXT NOT NULL,            -- original filename
  file_path     TEXT NOT NULL,            -- server-side storage path
  file_size     INTEGER NOT NULL,         -- bytes
  mime_type     TEXT NOT NULL,
  file_type     TEXT NOT NULL,            -- pdf|spreadsheet|document|presentation|image|audio|video|other
  category      TEXT DEFAULT 'Uncategorized',
  ai_summary    TEXT,                     -- AI-extracted summary
  ai_tags       TEXT,                     -- JSON array of tags
  pushed_to_client INTEGER DEFAULT 0,     -- 0|1 boolean
  push_message  TEXT,                     -- optional message to client
  client_viewed INTEGER DEFAULT 0,
  created_at    INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at    INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- ─── TASKS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  client_id   TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  coach_id    TEXT NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  priority    TEXT DEFAULT 'medium',      -- low|medium|high|critical
  category    TEXT,
  due_date    TEXT,
  status      TEXT DEFAULT 'pending',     -- pending|active|completed|overdue
  from_coach  INTEGER DEFAULT 1,
  created_at  INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  completed_at INTEGER
);

-- ─── MESSAGES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  coach_id    TEXT NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  client_id   TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  from_role   TEXT NOT NULL,              -- 'coach' | 'client'
  text        TEXT NOT NULL,
  read        INTEGER DEFAULT 0,
  created_at  INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  recipient_id TEXT NOT NULL,             -- coach_id or client_id
  recipient_role TEXT NOT NULL,           -- 'coach' | 'client'
  type        TEXT NOT NULL,              -- document|task|message|milestone|alert|ai|system
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  action_label TEXT,
  action_url  TEXT,
  ref_id      TEXT,                       -- document_id | task_id | message_id
  read        INTEGER DEFAULT 0,
  created_at  INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- ─── SESSIONS (COACHING) ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coaching_sessions (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  coach_id    TEXT NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  client_id   TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  scheduled_at INTEGER,
  duration_min INTEGER DEFAULT 60,
  focus       TEXT,
  notes       TEXT,
  outcome     TEXT,                       -- positive|neutral|needs_attention
  ai_brief    TEXT,                       -- AI session prep content
  created_at  INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- ─── GOALS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goals (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  client_id   TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  progress    INTEGER DEFAULT 0,          -- 0-100
  icon        TEXT DEFAULT '🎯',
  due_date    TEXT,
  milestones  TEXT,                       -- JSON array
  completed_count INTEGER DEFAULT 0,
  created_at  INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at  INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- ─── SUBSCRIPTION ADD-ONS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addon_activations (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  coach_id    TEXT NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  client_id   TEXT REFERENCES clients(id) ON DELETE CASCADE,
  addon_id    TEXT NOT NULL,
  addon_name  TEXT NOT NULL,
  price_cents INTEGER DEFAULT 0,
  active      INTEGER DEFAULT 1,
  activated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  deactivated_at INTEGER
);

-- ─── AI AGENT LOG ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_agent_log (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  coach_id    TEXT REFERENCES coaches(id) ON DELETE CASCADE,
  client_id   TEXT REFERENCES clients(id) ON DELETE SET NULL,
  agent       TEXT NOT NULL,              -- Session Prep|At-Risk|Progress Report|etc.
  action      TEXT NOT NULL,
  status      TEXT DEFAULT 'needs_review',-- needs_review|auto_completed|approved|dismissed
  result      TEXT,                       -- JSON output from agent
  reviewed_by TEXT,
  created_at  INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  reviewed_at INTEGER
);

-- ─── AUDIT LOG ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  actor_id    TEXT NOT NULL,
  actor_role  TEXT NOT NULL,              -- 'coach' | 'client' | 'system' | 'ai'
  action      TEXT NOT NULL,              -- UPLOAD_DOC|PUSH_DOC|CREATE_TASK|SEND_MESSAGE|etc.
  resource    TEXT,                       -- 'document' | 'task' | 'client' | etc.
  resource_id TEXT,
  metadata    TEXT,                       -- JSON blob of additional context
  ip          TEXT,
  created_at  INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_clients_coach       ON clients(coach_id);
CREATE INDEX IF NOT EXISTS idx_documents_client    ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_coach     ON documents(coach_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client        ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_coach_client ON messages(coach_id, client_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, read);
CREATE INDEX IF NOT EXISTS idx_audit_actor         ON audit_log(actor_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_log_coach        ON ai_agent_log(coach_id, status);
CREATE INDEX IF NOT EXISTS idx_sessions_client     ON coaching_sessions(client_id);
