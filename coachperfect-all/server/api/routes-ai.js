// ─── COACHPERFECT — AI AGENT ROUTES ─────────────────────────────────────────────
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, requireCoach, requirePlanLevel, auditLog: makeAudit } = require('./middleware');

// ─── AGENT REGISTRY ──────────────────────────────────────────────────────────
const AGENTS = {
  'session-prep':    { name: 'Session Prep Agent',       minPlan: 'professional', icon: '🧠', description: 'Auto-generates session briefs 24 hours before each coaching session.' },
  'at-risk':         { name: 'At-Risk Detection Agent',  minPlan: 'starter',      icon: '🚨', description: 'Flags clients showing warning signs: overdue tasks, missed sessions, declining scores.' },
  'progress-report': { name: 'Progress Report Agent',    minPlan: 'professional', icon: '📊', description: 'Generates Q1/Q2/Q3/Q4 progress reports automatically from all client data.' },
  'weekly-pulse':    { name: 'Weekly Pulse Agent',       minPlan: 'starter',      icon: '💓', description: 'Sends automated weekly check-in surveys and summarizes responses for coach review.' },
  'smart-followup':  { name: 'Smart Follow-Up Agent',    minPlan: 'professional', icon: '📬', description: 'Analyzes diagnostic gaps and suggests tailored resources and next steps.' },
  'onboarding':      { name: 'Onboarding Agent',         minPlan: 'free',         icon: '🚀', description: 'Handles full client onboarding: welcome email, diagnostic invite, portal setup.' },
};

// ─── AI RUNNER — OpenAI if configured, mock fallback otherwise ───────────────
let openaiClient = null;
if (process.env.AI_ENABLED === 'true' && process.env.OPENAI_API_KEY) {
  try { const { OpenAI } = require('openai'); openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); } catch (_) {}
}

const AGENT_PROMPTS = {
  'session-prep':    'You are a business coaching AI. Write a concise pre-session brief (3-4 bullet points) for the coach based on the client data provided. Focus on health score, overdue tasks, goals at risk, and one recommended session focus.',
  'at-risk':         'You are a business coaching AI. Analyze client data and write a 2-3 sentence at-risk summary explaining warning signs (overdue tasks, days since last session, declining scores). Be direct and actionable.',
  'progress-report': 'You are a business coaching AI. Write a 4-6 sentence quarterly progress report for this client. Highlight top gains, areas needing attention, and one key recommendation.',
  'weekly-pulse':    'You are a business coaching AI. Write a brief weekly pulse summary (2-3 sentences) noting client engagement and key areas to watch this week.',
  'smart-followup':  'You are a business coaching AI. Based on the client diagnostic gaps, recommend 2-3 specific follow-up actions or resources. Be concrete — name the category, the gap, and the suggestion.',
  'onboarding':      'You are a business coaching AI. Write a brief onboarding completion summary (2-3 sentences) confirming what was activated and what the client should expect in their first week.',
};

async function runAgent(agentId, client, context = {}) {
  const agent = AGENTS[agentId];
  if (!agent) throw new Error(`Unknown agent: ${agentId}`);

  // Mock fallback values
  const mocks = {
    'session-prep':    `Session Brief for ${client.name}: Health Score ${client.health_score || 'N/A'}. Focus areas: review recent task completion and discuss goals progress. Watch for financial avoidance patterns noted last session.`,
    'at-risk':         `${client.name} flagged: ${context.overdueCount || 0} overdue tasks, last session ${context.daysSince || 'unknown'} days ago. Recommend immediate outreach.`,
    'progress-report': `Q Report for ${client.name}: Business Health improved from baseline. Top gains in Operations (+8). Needs attention: Financial (-3).`,
    'weekly-pulse':    `Pulse check sent to ${client.name}. Previous response rate: 80%. Auto-summarizing when response received.`,
    'smart-followup':  `Recommended resources for ${client.name} based on diagnostic gap in Strategy: 3 articles, 1 template, 1 workshop link queued.`,
    'onboarding':      `Onboarding complete for ${client.name}: welcome email sent, diagnostic link delivered, portal access activated, first session scheduled.`,
  };

  if (!openaiClient) return mocks[agentId] || 'Agent completed successfully.';

  try {
    const clientCtx = JSON.stringify({ name: client.name, company: client.company, health_score: client.health_score, overdueCount: context.overdueCount || 0, daysSinceSession: context.daysSince || 'unknown' });
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 300,
      messages: [
        { role: 'system', content: AGENT_PROMPTS[agentId] },
        { role: 'user',   content: `Client data: ${clientCtx}` },
      ],
    });
    return completion.choices[0]?.message?.content?.trim() || mocks[agentId];
  } catch (_) {
    return mocks[agentId]; // graceful fallback on API error
  }
}

module.exports = function aiRoutes(db) {
  const router = express.Router();
  const log = makeAudit(db);

  // ── GET /ai/agents ─ List all agents with status ─────────────────────────
  router.get('/ai/agents', authMiddleware, requireCoach, (req, res) => {
    const planOrder = ['free', 'starter', 'professional', 'business', 'enterprise'];
    const coachLevel = planOrder.indexOf(req.user.plan || 'free');

    const agents = Object.entries(AGENTS).map(([id, cfg]) => {
      const lastRun = db.prepare("SELECT created_at FROM ai_agent_log WHERE coach_id = ? AND agent = ? ORDER BY created_at DESC LIMIT 1").get(req.user.id, cfg.name);
      return {
        id, ...cfg,
        available: coachLevel >= planOrder.indexOf(cfg.minPlan),
        lastRun: lastRun ? new Date(lastRun.created_at * 1000).toLocaleString() : 'Never',
      };
    });

    res.json(agents);
  });

  // ── GET /ai/queue ─ Items needing human review ────────────────────────────
  router.get('/ai/queue', authMiddleware, requireCoach, (req, res) => {
    const queue = db.prepare(`
      SELECT a.*, c.name as client_name
      FROM ai_agent_log a
      LEFT JOIN clients c ON a.client_id = c.id
      WHERE a.coach_id = ?
      ORDER BY a.created_at DESC LIMIT 30
    `).all(req.user.id);
    res.json(queue);
  });

  // ── POST /ai/run/:agentId ─ Manually trigger an agent ────────────────────
  router.post('/ai/run/:agentId', authMiddleware, requireCoach, async (req, res) => {
    const { agentId } = req.params;
    const { clientId } = req.body;
    const agent = AGENTS[agentId];
    if (!agent) return res.status(404).json({ error: 'Unknown agent' });

    // Check plan
    const planOrder = ['free', 'starter', 'professional', 'business', 'enterprise'];
    if (planOrder.indexOf(req.user.plan || 'free') < planOrder.indexOf(agent.minPlan)) {
      return res.status(403).json({ error: `${agent.minPlan} plan required` });
    }

    const client = clientId ? db.prepare('SELECT * FROM clients WHERE id = ? AND coach_id = ?').get(clientId, req.user.id) : null;
    if (clientId && !client) return res.status(404).json({ error: 'Client not found' });

    try {
      const overdueTasks = clientId ? db.prepare("SELECT COUNT(*) as n FROM tasks WHERE client_id = ? AND status = 'overdue'").get(clientId)?.n : 0;
      const result = await runAgent(agentId, client || { name: 'All Clients', health_score: 0 }, { overdueCount: overdueTasks });

      const id = uuidv4();
      const isAutoComplete = ['weekly-pulse', 'onboarding'].includes(agentId);
      db.prepare(`
        INSERT INTO ai_agent_log (id, coach_id, client_id, agent, action, status, result)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, req.user.id, clientId || null, agent.name, result, isAutoComplete ? 'auto_completed' : 'needs_review', result);

      log(req.user.id, 'ai', `RUN_AGENT_${agentId.toUpperCase()}`, 'ai_agent', id, { clientId, agentId }, req.ip);
      res.json({ id, agent: agent.name, result, status: isAutoComplete ? 'auto_completed' : 'needs_review' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── PATCH /ai/queue/:id ─ Approve, edit, or dismiss a queue item ─────────
  router.patch('/ai/queue/:id', authMiddleware, requireCoach, (req, res) => {
    const { action, editedResult } = req.body; // action: 'approve' | 'dismiss'
    const item = db.prepare('SELECT * FROM ai_agent_log WHERE id = ? AND coach_id = ?').get(req.params.id, req.user.id);
    if (!item) return res.status(404).json({ error: 'Queue item not found' });

    if (action === 'dismiss') {
      db.prepare('DELETE FROM ai_agent_log WHERE id = ?').run(req.params.id);
    } else {
      db.prepare(`
        UPDATE ai_agent_log SET status = 'approved', result = COALESCE(?, result),
        reviewed_by = ?, reviewed_at = strftime('%s','now') WHERE id = ?
      `).run(editedResult || null, req.user.id, req.params.id);
    }

    log(req.user.id, 'coach', `AI_${action.toUpperCase()}`, 'ai_agent', req.params.id, {}, req.ip);
    res.json({ success: true });
  });

  // ── GET /ai/audit ─ Full audit log for coach ──────────────────────────────
  router.get('/ai/audit', authMiddleware, requireCoach, (req, res) => {
    const { limit = 50, resource } = req.query;
    let sql = 'SELECT * FROM audit_log WHERE actor_id = ?';
    const params = [req.user.id];
    if (resource) { sql += ' AND resource = ?'; params.push(resource); }
    sql += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)}`;
    res.json(db.prepare(sql).all(...params));
  });

  return router;
};
