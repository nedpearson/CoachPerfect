// ═══════════════════════════════════════════════════
// COACH PERFECT — MAIN API SERVER
// ═══════════════════════════════════════════════════
//
// Runs on PORT 3002 (billing-server.js stays on 3001)
//
// Route groups:
//   POST /api/auth/register
//   POST /api/auth/login
//   POST /api/auth/refresh
//   POST /api/auth/logout
//
//   GET  /api/dashboard          — aggregated KPIs + recent data
//   GET  /api/clients
//   POST /api/clients
//   PUT  /api/clients/:id
//   DELETE /api/clients/:id
//
//   GET  /api/sessions
//   POST /api/sessions
//   PUT  /api/sessions/:id
//   GET  /api/sessions/:id/prep-brief   (AI, professional+)
//
//   GET  /api/tasks
//   POST /api/tasks
//   PUT  /api/tasks/:id
//   DELETE /api/tasks/:id
//
//   GET  /api/wins
//   POST /api/wins
//   PUT  /api/wins/:id
//   DELETE /api/wins/:id
//
//   GET  /api/goals
//   POST /api/goals
//   PUT  /api/goals/:id
//   DELETE /api/goals/:id
//
//   GET  /api/habits
//   POST /api/habits
//   POST /api/habits/:id/check
//
//   GET  /api/diagnostics
//   GET  /api/diagnostics/:id
//   POST /api/diagnostics/public/submit  (no auth, from diagnostic.html)
//
//   POST /api/waitlist
//   GET  /api/health

require('dotenv').config();

const express = require('express');
const cors    = require('cors');

const { query, getClient } = require('./lib/db');
const { send: sendEmail }  = require('../emails/email-templates');
const { hashPassword, verifyPassword, signAccessToken, signRefreshToken, verifyToken } = require('./lib/auth-helpers');
const { requireAuth, requirePlan } = require('./middleware/auth');
const {
  computeDiagnosticScores,
  buildResponseRows,
  buildScoreRows,
  getRecommendations,
  getSummaryStats,
} = require('./lib/scoring');

const app = express();

// ─── MIDDLEWARE ────────────────────────────────────
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));

// Simple in-memory rate limiter
const _hits = new Map();
function rateLimit(maxPerMin = 60) {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const hits = (_hits.get(key) || []).filter(t => t > now - 60_000);
    hits.push(now);
    _hits.set(key, hits);
    if (hits.length > maxPerMin) return res.status(429).json({ error: 'Too many requests' });
    next();
  };
}

app.use('/api/', rateLimit(120));

// ═══════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, businessName } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password, and name are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Check existing user
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await hashPassword(password);

    const { rows: [user] } = await client.query(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email`,
      [email.toLowerCase(), passwordHash]
    );

    const { rows: [coach] } = await client.query(
      `INSERT INTO coaches (user_id, name, business_name, plan, plan_status)
       VALUES ($1, $2, $3, 'free', 'active')
       RETURNING *`,
      [user.id, name, businessName || null]
    );

    await client.query('COMMIT');

    const accessToken  = signAccessToken({ sub: user.id, coachId: coach.id, plan: coach.plan, email: user.email });
    const refreshToken = signRefreshToken(user.id);

    // Send welcome email (non-blocking — don't fail register if email fails)
    sendEmail('welcome', {
      to: email.toLowerCase(),
      coachName: name,
      isTrial: false,
      planName: 'Free',
      isFoundingMember: false,
    }).catch(err => console.warn('[Email] Welcome send failed:', err.message));

    res.status(201).json({ accessToken, refreshToken, coach });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Auth Register]', err.message);
    res.status(500).json({ error: 'Registration failed' });
  } finally {
    client.release();
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  try {
    const { rows } = await query(
      `SELECT u.id, u.email, u.password_hash, c.id AS coach_id, c.plan, c.plan_status, c.name, c.business_name
         FROM users u
         JOIN coaches c ON c.user_id = u.id
        WHERE u.email = $1
          AND c.archived_at IS NULL`,
      [email.toLowerCase()]
    );

    if (!rows.length) return res.status(401).json({ error: 'Invalid email or password' });

    const row = rows[0];
    const valid = await verifyPassword(password, row.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const accessToken  = signAccessToken({ sub: row.id, coachId: row.coach_id, plan: row.plan, email: row.email });
    const refreshToken = signRefreshToken(row.id);

    res.json({
      accessToken,
      refreshToken,
      coach: { id: row.coach_id, name: row.name, businessName: row.business_name, plan: row.plan, planStatus: row.plan_status },
    });
  } catch (err) {
    console.error('[Auth Login]', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/refresh
app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });

  let payload;
  try {
    payload = verifyToken(refreshToken);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired refresh token', code: 'INVALID_REFRESH_TOKEN' });
  }

  if (payload.type !== 'refresh') {
    return res.status(401).json({ error: 'Not a refresh token', code: 'WRONG_TOKEN_TYPE' });
  }

  try {
    const { rows } = await query(
      `SELECT u.id, u.email, c.id AS coach_id, c.plan
         FROM users u JOIN coaches c ON c.user_id = u.id
        WHERE u.id = $1 AND c.archived_at IS NULL`,
      [payload.sub]
    );
    if (!rows.length) return res.status(401).json({ error: 'User not found' });

    const row = rows[0];
    const newAccessToken = signAccessToken({ sub: row.id, coachId: row.coach_id, plan: row.plan, email: row.email });
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// ═══════════════════════════════════════════════════
// DASHBOARD — Aggregated KPIs
// ═══════════════════════════════════════════════════

app.get('/api/dashboard', requireAuth, async (req, res) => {
  const coachId = req.coach.id;
  try {
    const [clientsRes, sessionsRes, diagnosticsRes, tasksRes, revenueRes, latestDiagRes, upcomingRes, winsRes] = await Promise.all([
      query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'active')::int AS active FROM clients WHERE coach_id = $1`, [coachId]),
      query(`SELECT COUNT(*)::int AS total,
               COUNT(*) FILTER (WHERE status = 'no_show')::int AS no_shows,
               COUNT(*) FILTER (WHERE status = 'late_cancel')::int AS late_cancels,
               COUNT(*) FILTER (WHERE scheduled_at >= date_trunc('month', NOW()))::int AS this_month
             FROM sessions WHERE coach_id = $1`, [coachId]),
      query(`SELECT COUNT(*)::int AS total, AVG(overall_score)::numeric AS avg_score FROM diagnostics WHERE coach_id = $1 AND overall_score IS NOT NULL`, [coachId]),
      query(`SELECT * FROM tasks WHERE coach_id = $1 AND completed_at IS NULL ORDER BY due_date ASC NULLS LAST, created_at DESC LIMIT 8`, [coachId]),
      // Monthly revenue: sum of coaching_fee for active clients, spread over coaching_months
      query(`SELECT
               COALESCE(SUM(coaching_fee), 0)::numeric AS total_fees,
               COALESCE(SUM(CASE WHEN status='active' THEN coaching_fee / NULLIF(coaching_months,0) ELSE 0 END), 0)::numeric AS monthly_mrr
             FROM clients WHERE coach_id = $1`, [coachId]),
      // Latest diagnostic for radar chart
      query(`SELECT id, overall_score, categories, completed_at FROM diagnostics WHERE coach_id = $1 AND overall_score IS NOT NULL ORDER BY completed_at DESC LIMIT 2`, [coachId]),
      // Upcoming sessions as pipeline
      query(`SELECT s.*, c.name AS client_name FROM sessions s LEFT JOIN clients c ON c.id = s.client_id WHERE s.coach_id = $1 AND s.scheduled_at >= NOW() AND s.status = 'scheduled' ORDER BY s.scheduled_at ASC LIMIT 5`, [coachId]),
      query(`SELECT COUNT(*)::int AS total FROM wins WHERE coach_id = $1`, [coachId]),
    ]);

    const clients     = clientsRes.rows[0];
    const sessions    = sessionsRes.rows[0];
    const diagnostics = diagnosticsRes.rows[0];
    const tasks       = tasksRes.rows;
    const revenue     = revenueRes.rows[0];
    const diagHistory = latestDiagRes.rows;
    const upcoming    = upcomingRes.rows;
    const wins        = winsRes.rows[0];

    const attendanceRate = sessions.total > 0
      ? Math.round(((sessions.total - sessions.no_shows - sessions.late_cancels) / sessions.total) * 100)
      : 100;

    // Latest diagnostic radar data
    const latestDiag = diagHistory[0] || null;
    const prevDiag   = diagHistory[1] || null;

    // Build recommendations from latest diag
    let recommendations = [];
    if (latestDiag?.categories) {
      const { getRecommendations } = require('./lib/scoring');
      recommendations = getRecommendations(latestDiag.categories).slice(0, 3);
    }

    res.json({
      kpis: {
        activeClients:     clients.active,
        totalClients:      clients.total,
        sessionsThisMonth: sessions.this_month,
        attendanceRate,
        avgDiagScore:      diagnostics.avg_score ? Math.round(parseFloat(diagnostics.avg_score)) : null,
        openTasks:         tasks.filter(t => !t.completed_at).length,
        totalWins:         wins.total,
        mrr:               Math.round(parseFloat(revenue.monthly_mrr)),
        totalFees:         Math.round(parseFloat(revenue.total_fees)),
      },
      tasks,
      upcoming,
      recommendations,
      latestDiag:  latestDiag  ? { id: latestDiag.id, score: latestDiag.overall_score, categories: latestDiag.categories, date: latestDiag.completed_at } : null,
      prevDiag:    prevDiag    ? { id: prevDiag.id,   score: prevDiag.overall_score,   categories: prevDiag.categories,   date: prevDiag.completed_at }   : null,
    });
  } catch (err) {
    console.error('[Dashboard]', err.message);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// ═══════════════════════════════════════════════════
// CLIENTS
// ═══════════════════════════════════════════════════

app.get('/api/clients', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM clients WHERE coach_id = $1 ORDER BY name`,
      [req.coach.id]
    );
    res.json({ clients: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', requireAuth, async (req, res) => {
  const { name, email, phone, businessName, industry, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  try {
    const { rows } = await query(
      `INSERT INTO clients (coach_id, name, email, phone, business_name, industry, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.coach.id, name, email || null, phone || null, businessName || null, industry || null, notes || null]
    );
    res.status(201).json({ client: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clients/:id', requireAuth, async (req, res) => {
  const { name, email, phone, businessName, industry, notes, status } = req.body;
  try {
    const { rows } = await query(
      `UPDATE clients SET
         name = COALESCE($1, name),
         email = COALESCE($2, email),
         phone = COALESCE($3, phone),
         business_name = COALESCE($4, business_name),
         industry = COALESCE($5, industry),
         notes = COALESCE($6, notes),
         status = COALESCE($7, status)
       WHERE id = $8 AND coach_id = $9 RETURNING *`,
      [name, email, phone, businessName, industry, notes, status, req.params.id, req.coach.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Client not found' });
    res.json({ client: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clients/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await query(
      `DELETE FROM clients WHERE id = $1 AND coach_id = $2`,
      [req.params.id, req.coach.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Client not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════
// SESSIONS
// ═══════════════════════════════════════════════════

app.get('/api/sessions', requireAuth, async (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit  || '50'), 200);
  const offset = parseInt(req.query.offset || '0');
  try {
    const { rows } = await query(
      `SELECT s.*, c.name AS client_name
         FROM sessions s
         LEFT JOIN clients c ON c.id = s.client_id
        WHERE s.coach_id = $1
        ORDER BY s.scheduled_at DESC
        LIMIT $2 OFFSET $3`,
      [req.coach.id, limit, offset]
    );
    res.json({ sessions: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sessions', requireAuth, async (req, res) => {
  const { clientId, scheduledAt, durationMin, sessionType, notes, status } = req.body;
  try {
    const { rows } = await query(
      `INSERT INTO sessions (coach_id, client_id, scheduled_at, duration_min, session_type, notes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.coach.id, clientId || null, scheduledAt, durationMin || 60, sessionType || 'coaching', notes || null, status || 'scheduled']
    );
    const session = rows[0];

    // Send session reminder email to coach (non-blocking)
    if (scheduledAt) {
      const sessionDate = new Date(scheduledAt);
      let clientName = 'your client';
      if (clientId) {
        const cr = await query(`SELECT name FROM clients WHERE id = $1`, [clientId]).catch(() => ({ rows: [] }));
        if (cr.rows[0]) clientName = cr.rows[0].name;
      }
      sendEmail('sessionReminder', {
        to: req.user.email,
        coachName: req.coach.name,
        clientName,
        sessionDate: sessionDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        sessionTime: sessionDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }),
        sessionType: sessionType || 'Coaching',
        duration: `${durationMin || 60} min`,
        prepLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?session=${session.id}`,
      }).catch(err => console.warn('[Email] Session reminder send failed:', err.message));
    }

    res.status(201).json({ session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/sessions/:id', requireAuth, async (req, res) => {
  const { status, notes, sessionSummary, followUpActions } = req.body;
  try {
    const { rows } = await query(
      `UPDATE sessions SET
         status = COALESCE($1, status),
         notes = COALESCE($2, notes),
         session_summary = COALESCE($3, session_summary),
         follow_up_actions = COALESCE($4, follow_up_actions),
         completed_at = CASE WHEN $1 = 'attended' THEN NOW() ELSE completed_at END
       WHERE id = $5 AND coach_id = $6 RETURNING *`,
      [status, notes, sessionSummary, followUpActions, req.params.id, req.coach.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Session not found' });
    res.json({ session: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sessions/:id/prep-brief  (AI-powered, professional+ plan)
app.get('/api/sessions/:id/prep-brief', requireAuth, requirePlan('professional'), async (req, res) => {
  try {
    // Load session + client data
    const { rows } = await query(
      `SELECT s.*, c.name AS client_name, c.business_name, c.industry, c.notes AS client_notes
         FROM sessions s
         LEFT JOIN clients c ON c.id = s.client_id
        WHERE s.id = $1 AND s.coach_id = $2`,
      [req.params.id, req.coach.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Session not found' });

    const session = rows[0];

    // Load last 3 sessions for context
    const { rows: pastSessions } = await query(
      `SELECT scheduled_at, session_summary, follow_up_actions
         FROM sessions
        WHERE coach_id = $1 AND client_id = $2 AND status = 'attended' AND id != $3
        ORDER BY scheduled_at DESC LIMIT 3`,
      [req.coach.id, session.client_id, session.id]
    );

    // Load latest diagnostic score
    const { rows: diagRows } = await query(
      `SELECT overall_score, categories FROM diagnostics
        WHERE coach_id = $1 AND client_id = $2
        ORDER BY completed_at DESC LIMIT 1`,
      [req.coach.id, session.client_id]
    );

    // Build AI prompt
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const diagContext = diagRows[0]
      ? `Latest diagnostic: ${diagRows[0].overall_score}/100. Category scores: ${JSON.stringify(diagRows[0].categories)}`
      : 'No diagnostic data yet.';

    const pastContext = pastSessions.length
      ? pastSessions.map((s, i) => `Session ${i + 1}: ${s.session_summary || 'No summary'} | Follow-ups: ${s.follow_up_actions || 'None'}`).join('\n')
      : 'No previous sessions.';

    const prompt = `You are a business coaching assistant. Generate a session prep brief for a coaching session.

Client: ${session.client_name || 'Unknown'}
Business: ${session.business_name || 'Unknown'} (${session.industry || 'General'})
Session type: ${session.session_type}
Client notes: ${session.client_notes || 'None'}

${diagContext}

Recent sessions:
${pastContext}

Generate a concise prep brief with:
1. 3 powerful coaching questions to open the session
2. Key areas to probe based on past context
3. Recommended focus for this session
4. One accountability check-in from last session

Keep it practical and actionable. Format as JSON with keys: openingQuestions (array), probeAreas (array), sessionFocus (string), accountabilityCheck (string).`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 600,
    });

    const brief = JSON.parse(completion.choices[0].message.content);
    res.json({ brief, session });
  } catch (err) {
    console.error('[AI Prep Brief]', err.message);
    res.status(500).json({ error: 'Failed to generate prep brief' });
  }
});

// ═══════════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════════

app.get('/api/tasks', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM tasks WHERE coach_id = $1 ORDER BY due_date ASC NULLS LAST, created_at DESC`,
      [req.coach.id]
    );
    res.json({ tasks: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', requireAuth, async (req, res) => {
  const { title, description, category, dueDate, priority } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  try {
    const { rows } = await query(
      `INSERT INTO tasks (coach_id, title, description, category, due_date, priority)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.coach.id, title, description || null, category || 'general', dueDate || null, priority || 'medium']
    );
    res.status(201).json({ task: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', requireAuth, async (req, res) => {
  const { title, completed, priority, dueDate } = req.body;
  try {
    const { rows } = await query(
      `UPDATE tasks SET
         title = COALESCE($1, title),
         completed_at = CASE WHEN $2::boolean THEN NOW() WHEN $2::boolean = false THEN NULL ELSE completed_at END,
         priority = COALESCE($3, priority),
         due_date = COALESCE($4, due_date)
       WHERE id = $5 AND coach_id = $6 RETURNING *`,
      [title, completed, priority, dueDate, req.params.id, req.coach.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json({ task: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await query(
      `DELETE FROM tasks WHERE id = $1 AND coach_id = $2`,
      [req.params.id, req.coach.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════
// WINS
// ═══════════════════════════════════════════════════

app.get('/api/wins', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM wins WHERE coach_id = $1 ORDER BY created_at DESC LIMIT 100`,
      [req.coach.id]
    );
    res.json({ wins: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/wins', requireAuth, async (req, res) => {
  const { title, category, starred } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  try {
    const { rows } = await query(
      `INSERT INTO wins (coach_id, title, category, starred) VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.coach.id, title, category || 'general', starred || false]
    );
    res.status(201).json({ win: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/wins/:id', requireAuth, async (req, res) => {
  const { starred, title } = req.body;
  try {
    const { rows } = await query(
      `UPDATE wins SET
         starred = COALESCE($1, starred),
         title = COALESCE($2, title)
       WHERE id = $3 AND coach_id = $4 RETURNING *`,
      [starred, title, req.params.id, req.coach.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Win not found' });
    res.json({ win: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/wins/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await query(
      `DELETE FROM wins WHERE id = $1 AND coach_id = $2`,
      [req.params.id, req.coach.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Win not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════
// GOALS
// ═══════════════════════════════════════════════════

app.get('/api/goals', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM goals WHERE coach_id = $1 ORDER BY created_at DESC`,
      [req.coach.id]
    );
    res.json({ goals: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/goals', requireAuth, async (req, res) => {
  const { title, category, targetValue, currentValue, targetDate, milestones } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  try {
    const { rows } = await query(
      `INSERT INTO goals (coach_id, title, category, target_value, current_value, target_date, milestones)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.coach.id, title, category || 'general', targetValue || null, currentValue || 0, targetDate || null, JSON.stringify(milestones || [])]
    );
    res.status(201).json({ goal: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/goals/:id', requireAuth, async (req, res) => {
  const { title, currentValue, milestones, status } = req.body;
  try {
    const { rows } = await query(
      `UPDATE goals SET
         title = COALESCE($1, title),
         current_value = COALESCE($2, current_value),
         milestones = COALESCE($3::jsonb, milestones),
         status = COALESCE($4, status)
       WHERE id = $5 AND coach_id = $6 RETURNING *`,
      [title, currentValue, milestones ? JSON.stringify(milestones) : null, status, req.params.id, req.coach.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Goal not found' });
    res.json({ goal: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════
// HABITS
// ═══════════════════════════════════════════════════

app.get('/api/habits', requireAuth, async (req, res) => {
  try {
    const { rows: habits } = await query(
      `SELECT h.*,
         (SELECT COUNT(*)::int FROM habit_checks hc WHERE hc.habit_id = h.id AND hc.checked_date >= CURRENT_DATE - INTERVAL '6 days') AS week_completions
         FROM habits h
        WHERE h.coach_id = $1 AND h.active = true
        ORDER BY h.created_at`,
      [req.coach.id]
    );

    // For each habit, get last 7 days of checks
    const habitIds = habits.map(h => h.id);
    if (habitIds.length) {
      const { rows: checks } = await query(
        `SELECT habit_id, checked_date FROM habit_checks
          WHERE habit_id = ANY($1::uuid[])
            AND checked_date >= CURRENT_DATE - INTERVAL '6 days'
          ORDER BY checked_date`,
        [habitIds]
      );

      const checkMap = {};
      for (const c of checks) {
        if (!checkMap[c.habit_id]) checkMap[c.habit_id] = new Set();
        checkMap[c.habit_id].add(c.checked_date.toISOString().split('T')[0]);
      }

      habits.forEach(h => {
        const last7 = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split('T')[0];
          last7.push(checkMap[h.id]?.has(key) ? 1 : 0);
        }
        h.last7 = last7;
      });
    }

    res.json({ habits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/habits', requireAuth, async (req, res) => {
  const { name, targetDaysPerWeek } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  try {
    const { rows } = await query(
      `INSERT INTO habits (coach_id, name, target_days_per_week) VALUES ($1,$2,$3) RETURNING *`,
      [req.coach.id, name, targetDaysPerWeek || 7]
    );
    res.status(201).json({ habit: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/habits/:id/check', requireAuth, async (req, res) => {
  const { date } = req.body; // YYYY-MM-DD, defaults to today
  const checkDate = date || new Date().toISOString().split('T')[0];
  try {
    // Verify ownership
    const { rows: owned } = await query(
      `SELECT id FROM habits WHERE id = $1 AND coach_id = $2`,
      [req.params.id, req.coach.id]
    );
    if (!owned.length) return res.status(404).json({ error: 'Habit not found' });

    // Upsert the check
    await query(
      `INSERT INTO habit_checks (habit_id, checked_date) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.params.id, checkDate]
    );

    // Update streak
    const { rows: checks } = await query(
      `SELECT checked_date FROM habit_checks WHERE habit_id = $1 ORDER BY checked_date DESC LIMIT 60`,
      [req.params.id]
    );

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < checks.length; i++) {
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      const actual = new Date(checks[i].checked_date);
      if (expected.toDateString() !== actual.toDateString()) break;
      streak++;
    }

    await query(`UPDATE habits SET streak = $1 WHERE id = $2`, [streak, req.params.id]);

    res.json({ success: true, streak });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════
// DIAGNOSTICS
// ═══════════════════════════════════════════════════

app.get('/api/diagnostics', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT d.*, c.name AS client_name
         FROM diagnostics d
         LEFT JOIN clients c ON c.id = d.client_id
        WHERE d.coach_id = $1
        ORDER BY d.completed_at DESC`,
      [req.coach.id]
    );
    res.json({ diagnostics: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/diagnostics/:id', requireAuth, async (req, res) => {
  try {
    const [diagRes, scoresRes] = await Promise.all([
      query(
        `SELECT d.*, c.name AS client_name FROM diagnostics d LEFT JOIN clients c ON c.id = d.client_id WHERE d.id = $1 AND d.coach_id = $2`,
        [req.params.id, req.coach.id]
      ),
      query(
        `SELECT category, score FROM diagnostic_scores WHERE diagnostic_id = $1`,
        [req.params.id]
      ),
    ]);

    if (!diagRes.rows.length) return res.status(404).json({ error: 'Diagnostic not found' });

    const categories = {};
    scoresRes.rows.forEach(r => { categories[r.category] = r.score; });

    const diagnostic = diagRes.rows[0];
    const recommendations = getRecommendations(categories);
    const summary = getSummaryStats(categories);

    res.json({ diagnostic, categories, recommendations, summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public diagnostic submission (no auth — called from diagnostic.html)
app.post('/api/diagnostics/public/submit', async (req, res) => {
  const { email, name, businessName, answers } = req.body;
  if (!email || !Array.isArray(answers) || answers.length !== 48) {
    return res.status(400).json({ error: 'email and 48 answers are required' });
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { overall, categories } = computeDiagnosticScores(answers);

    // Store as public submission (no coach_id)
    const { rows: [diag] } = await client.query(
      `INSERT INTO diagnostics (respondent_email, respondent_name, respondent_business, overall_score, categories, completed_at)
       VALUES ($1,$2,$3,$4,$5::jsonb,NOW()) RETURNING id`,
      [email.toLowerCase(), name || null, businessName || null, overall, JSON.stringify(categories)]
    );

    const diagId = diag.id;

    // Insert response rows
    const responseRows = buildResponseRows(diagId, answers);
    for (const r of responseRows) {
      await client.query(
        `INSERT INTO diagnostic_responses (diagnostic_id, question_index, category, answer_index, score) VALUES ($1,$2,$3,$4,$5)`,
        [r.diagnostic_id, r.question_index, r.category, r.answer_index, r.score]
      );
    }

    // Insert score rows
    const scoreRows = buildScoreRows(diagId, categories);
    for (const r of scoreRows) {
      await client.query(
        `INSERT INTO diagnostic_scores (diagnostic_id, category, score) VALUES ($1,$2,$3)`,
        [r.diagnostic_id, r.category, r.score]
      );
    }

    await client.query('COMMIT');

    const recommendations = getRecommendations(categories);
    const summary = getSummaryStats(categories);

    res.json({ diagnosticId: diagId, overall, categories, recommendations, summary });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Diagnostic Submit]', err.message);
    res.status(500).json({ error: 'Failed to save diagnostic' });
  } finally {
    client.release();
  }
});

// ═══════════════════════════════════════════════════
// WAITLIST
// ═══════════════════════════════════════════════════

app.post('/api/waitlist', async (req, res) => {
  const { email, name, businessType, referralSource } = req.body;
  if (!email) return res.status(400).json({ error: 'email is required' });

  try {
    const { rows } = await query(
      `INSERT INTO waitlist (email, name, business_type, referral_source)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id, email, position`,
      [email.toLowerCase(), name || null, businessType || null, referralSource || null]
    );
    res.json({ success: true, position: rows[0].position });
  } catch (err) {
    console.error('[Waitlist]', err.message);
    res.status(500).json({ error: 'Failed to join waitlist' });
  }
});

// ═══════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════

// GET /api/analytics/revenue — last 6 months of monthly coaching fees
app.get('/api/analytics/revenue', requireAuth, async (req, res) => {
  try {
    // Group sessions by month to track activity (as proxy for revenue activity)
    const { rows } = await query(
      `SELECT
         TO_CHAR(DATE_TRUNC('month', scheduled_at), 'Mon') AS month,
         DATE_TRUNC('month', scheduled_at) AS month_date,
         COUNT(*) FILTER (WHERE status = 'attended')::int AS sessions,
         COUNT(*) FILTER (WHERE status = 'no_show')::int AS no_shows
       FROM sessions
       WHERE coach_id = $1
         AND scheduled_at >= NOW() - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month', scheduled_at)
       ORDER BY month_date ASC`,
      [req.coach.id]
    );

    // Also get monthly MRR from active clients
    const { rows: clientRows } = await query(
      `SELECT
         COALESCE(SUM(coaching_fee / NULLIF(coaching_months, 0)), 0)::numeric AS mrr
       FROM clients
       WHERE coach_id = $1 AND status = 'active'`,
      [req.coach.id]
    );

    const mrr = Math.round(parseFloat(clientRows[0]?.mrr || 0));

    // Build last 6 months even if no sessions
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const existing = rows.find(r => r.month === label);
      months.push({
        month:    label,
        sessions: existing?.sessions || 0,
        noShows:  existing?.no_shows || 0,
        revenue:  mrr, // flat MRR for now; historical could come from payments table
      });
    }

    res.json({ months, currentMrr: mrr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/pipeline — upcoming sessions for pipeline view
app.get('/api/analytics/pipeline', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT s.*, c.name AS client_name, c.industry, c.coaching_fee
         FROM sessions s
         LEFT JOIN clients c ON c.id = s.client_id
        WHERE s.coach_id = $1
          AND s.scheduled_at >= NOW()
          AND s.status IN ('scheduled', 'confirmed')
        ORDER BY s.scheduled_at ASC
        LIMIT 20`,
      [req.coach.id]
    );
    res.json({ pipeline: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/wins-summary
app.get('/api/analytics/wins-summary', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT category, COUNT(*)::int AS count
         FROM wins WHERE coach_id = $1
         GROUP BY category ORDER BY count DESC`,
      [req.coach.id]
    );
    res.json({ byCategory: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════
// HEALTH
// ═══════════════════════════════════════════════════

app.get('/api/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', service: 'coachperfect-api', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', service: 'coachperfect-api', db: 'disconnected' });
  }
});

// ═══════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════

const PORT = process.env.API_PORT || 3002;
app.listen(PORT, () => {
  console.log(`\n  Coach Perfect API Server`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  → DB: ${process.env.PG_DATABASE || 'coachperfect'} @ ${process.env.PG_HOST || 'localhost'}:${process.env.PG_PORT || 5432}`);
  console.log('');
});

module.exports = { app };
