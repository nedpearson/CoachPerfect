// ═══════════════════════════════════════════════════
// COACH PERFECT — EMAIL TEMPLATE SYSTEM
// ═══════════════════════════════════════════════════
//
// Usage:
//   const emails = require('./email-templates');
//   await emails.send('welcome', { to: 'coach@example.com', coachName: 'Sarah' });
//
// Templates:
//   1. welcome            — After signup
//   2. diagnosticInvite   — Coach sends to client
//   3. sessionReminder    — 24hr before session
//   4. weeklyPulse        — Weekly check-in prompt
//   5. trialEnding        — 3 days before trial ends
//   6. paymentFailed      — After failed charge
//   7. diagnosticResults  — Client's diagnostic complete
//   8. progressReport     — Monthly progress summary
//

require('dotenv').config();

// ─── RESEND CLIENT ───
let resend;
try {
  const { Resend } = require('resend');
  resend = new Resend(process.env.RESEND_API_KEY);
} catch (e) {
  console.warn('[Email] Resend not installed. Run: npm install resend');
}

const FROM = process.env.EMAIL_FROM || 'Coach Perfect <hello@coachperfect.io>';
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'support@coachperfect.io';
const BASE_URL = process.env.FRONTEND_URL || 'https://coachperfect.io';

// ═══════════════════════════════════════════════════
// BASE LAYOUT
// ═══════════════════════════════════════════════════

function layout(content, preheader = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coach Perfect</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body { margin:0; padding:0; background:#06060b; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
    .preheader { display:none !important; max-height:0; overflow:hidden; mso-hide:all; }
    .wrapper { max-width:600px; margin:0 auto; background:#0e0e16; }
    .header { padding:32px 40px 24px; text-align:center; border-bottom:1px solid #1e1e2e; }
    .logo { font-size:22px; font-weight:700; color:#eaeaf0; text-decoration:none; }
    .logo span { color:#f97316; }
    .body { padding:40px; }
    .footer { padding:24px 40px; text-align:center; border-top:1px solid #1e1e2e; }
    .footer p { color:#55556a; font-size:12px; line-height:1.6; margin:0; }
    .footer a { color:#8b8ba0; text-decoration:none; }
    h1 { color:#eaeaf0; font-size:26px; font-weight:700; line-height:1.3; margin:0 0 16px; letter-spacing:-0.5px; }
    h2 { color:#eaeaf0; font-size:20px; font-weight:600; margin:0 0 12px; }
    p { color:#8b8ba0; font-size:15px; line-height:1.7; margin:0 0 16px; }
    .accent { color:#f97316; }
    .btn { display:inline-block; padding:14px 32px; background:#f97316; color:#ffffff !important; font-size:15px; font-weight:600; text-decoration:none; border-radius:10px; }
    .btn-ghost { background:transparent; border:1px solid #2a2a3a; color:#eaeaf0 !important; }
    .card { background:#16161f; border:1px solid #1e1e2e; border-radius:12px; padding:20px; margin:20px 0; }
    .metric { text-align:center; padding:12px; }
    .metric-value { font-size:36px; font-weight:700; color:#f97316; }
    .metric-label { font-size:12px; color:#55556a; text-transform:uppercase; letter-spacing:1px; margin-top:4px; }
    .divider { border:none; border-top:1px solid #1e1e2e; margin:24px 0; }
    .highlight { background:rgba(249,115,22,0.08); border-left:3px solid #f97316; padding:12px 16px; border-radius:0 8px 8px 0; margin:16px 0; }
    .green { color:#22c55e; }
    .red { color:#ef4444; }
    .yellow { color:#eab308; }
    ul { color:#8b8ba0; font-size:14px; line-height:1.8; padding-left:20px; }
    @media (max-width:640px) { .body { padding:24px 20px; } .header { padding:24px 20px; } }
  </style>
</head>
<body style="background:#06060b;">
  <div class="preheader">${preheader}</div>
  <center>
    <div class="wrapper">
      <div class="header">
        <a href="${BASE_URL}" class="logo">Coach<span>Perfect</span></a>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Coach Perfect. All rights reserved.</p>
        <p style="margin-top:8px;">
          <a href="${BASE_URL}/settings/notifications">Email preferences</a> · 
          <a href="${BASE_URL}/privacy">Privacy</a> · 
          <a href="${BASE_URL}/support">Support</a>
        </p>
      </div>
    </div>
  </center>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════
// TEMPLATES
// ═══════════════════════════════════════════════════

const templates = {

  // ─── 1. WELCOME ───
  welcome: (data) => ({
    subject: `Welcome to Coach Perfect, ${data.coachName}! 🟠`,
    html: layout(`
      <h1>Welcome aboard, ${data.coachName} 👋</h1>
      <p>You just joined the coaches who prove their impact with data. Here's how to make the most of your first week:</p>
      
      <div class="card">
        <h2>Your Quick Start Checklist</h2>
        <ul>
          <li><strong>Add your first client</strong> — Takes 2 minutes. They'll get a diagnostic invite automatically.</li>
          <li><strong>Send a diagnostic</strong> — Your client answers 48 questions. You get their Business Health Score.</li>
          <li><strong>Log a session</strong> — After your next coaching session, capture notes and action items.</li>
          <li><strong>See the dashboard</strong> — Watch the data build into a clear picture of coaching impact.</li>
        </ul>
      </div>

      <div class="highlight">
        <strong style="color:#eaeaf0;">Pro tip:</strong> The most successful coaches send the diagnostic <em>before</em> the first session. It gives you a baseline and makes the first conversation incredibly productive.
      </div>

      <p style="text-align:center; margin:28px 0;">
        <a href="${BASE_URL}/dashboard" class="btn">Open Your Dashboard →</a>
      </p>

      ${data.isTrial ? `
        <hr class="divider">
        <p style="font-size:13px; text-align:center;">Your 14-day free trial of <strong style="color:#eaeaf0;">${data.planName}</strong> is active. No charge until ${data.trialEndDate}.</p>
      ` : ''}

      ${data.isFoundingMember ? `
        <div class="card" style="border-color:#f97316;">
          <p style="text-align:center; margin:0;">
            🎉 <strong style="color:#f97316;">Founding Member</strong> — You're locked in at 30% off for life. Thank you for being early.
          </p>
        </div>
      ` : ''}
    `, `Welcome to Coach Perfect — here's your quick start guide.`),
  }),

  // ─── 2. DIAGNOSTIC INVITE ───
  diagnosticInvite: (data) => ({
    subject: `${data.coachName} invited you to take a Business Health Diagnostic`,
    html: layout(`
      <h1>Your Business Health Check</h1>
      <p>${data.coachName} has invited you to take the Coach Perfect Business Health Diagnostic — a 10-minute assessment that measures the health of your business across 8 key categories.</p>

      <div class="card">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td class="metric" width="33%"><div class="metric-value">48</div><div class="metric-label">Questions</div></td>
            <td class="metric" width="33%"><div class="metric-value">8</div><div class="metric-label">Categories</div></td>
            <td class="metric" width="33%"><div class="metric-value">10m</div><div class="metric-label">To Complete</div></td>
          </tr>
        </table>
      </div>

      <p>When you finish, you'll see:</p>
      <ul>
        <li>Your <strong style="color:#eaeaf0;">Business Health Score</strong> (0–100)</li>
        <li>A radar chart showing strengths and gaps</li>
        <li>Personalized recommendations for each category</li>
      </ul>

      <p style="text-align:center; margin:28px 0;">
        <a href="${BASE_URL}/d/${data.diagnosticId}" class="btn">Start My Diagnostic →</a>
      </p>

      <p style="font-size:13px; color:#55556a; text-align:center;">
        Your responses are confidential and shared only with ${data.coachName}.<br>
        This link expires in 7 days.
      </p>
    `, `${data.coachName} invited you to assess your business health — takes 10 minutes.`),
  }),

  // ─── 3. SESSION REMINDER ───
  sessionReminder: (data) => ({
    subject: `Coaching session tomorrow at ${data.sessionTime}`,
    html: layout(`
      <h1>Session Reminder</h1>
      <p>You have a coaching session scheduled with <strong style="color:#eaeaf0;">${data.otherPartyName}</strong>.</p>

      <div class="card">
        <table width="100%" cellpadding="8" cellspacing="0" style="font-size:14px;">
          <tr><td style="color:#55556a; width:100px;">When</td><td style="color:#eaeaf0; font-weight:500;">${data.sessionDate} at ${data.sessionTime}</td></tr>
          <tr><td style="color:#55556a;">Duration</td><td style="color:#eaeaf0;">${data.duration} minutes</td></tr>
          <tr><td style="color:#55556a;">Location</td><td style="color:#eaeaf0;">${data.location || 'Virtual (link in calendar invite)'}</td></tr>
        </table>
      </div>

      ${data.isCoach && data.prepBrief ? `
        <div class="highlight">
          <strong style="color:#eaeaf0;">AI Prep Brief:</strong><br>
          <span style="font-size:14px;">${data.prepBrief}</span>
        </div>
      ` : ''}

      ${data.openTasks > 0 ? `
        <p style="font-size:14px;"><strong style="color:#eaeaf0;">${data.openTasks} open task${data.openTasks > 1 ? 's' : ''}</strong> from last session${data.overdueTasks > 0 ? ` (<span class="red">${data.overdueTasks} overdue</span>)` : ''}.</p>
      ` : ''}

      <p style="text-align:center; margin:28px 0;">
        <a href="${BASE_URL}/sessions/${data.sessionId}" class="btn">View Session Details →</a>
      </p>
    `, `Coaching session with ${data.otherPartyName} tomorrow at ${data.sessionTime}.`),
  }),

  // ─── 4. WEEKLY PULSE ───
  weeklyPulse: (data) => ({
    subject: `Weekly check-in: How's your business this week? 💓`,
    html: layout(`
      <h1>Weekly Pulse Check</h1>
      <p>Hi ${data.clientName}, quick check-in from ${data.coachName}. Rate these three areas (takes 30 seconds):</p>

      <div class="card">
        <p style="margin:0 0 16px;"><strong style="color:#eaeaf0;">How are you feeling about...</strong></p>
        
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            <td style="color:#8b8ba0; font-size:14px;">Revenue momentum</td>
            <td width="160" style="text-align:right;">
              <a href="${BASE_URL}/pulse/${data.pulseId}?q=revenue&v=1" style="text-decoration:none; font-size:18px;">😟</a>&nbsp;&nbsp;
              <a href="${BASE_URL}/pulse/${data.pulseId}?q=revenue&v=2" style="text-decoration:none; font-size:18px;">😐</a>&nbsp;&nbsp;
              <a href="${BASE_URL}/pulse/${data.pulseId}?q=revenue&v=3" style="text-decoration:none; font-size:18px;">🙂</a>&nbsp;&nbsp;
              <a href="${BASE_URL}/pulse/${data.pulseId}?q=revenue&v=4" style="text-decoration:none; font-size:18px;">😊</a>&nbsp;&nbsp;
              <a href="${BASE_URL}/pulse/${data.pulseId}?q=revenue&v=5" style="text-decoration:none; font-size:18px;">🔥</a>
            </td>
          </tr>
          <tr><td colspan="2"><hr class="divider" style="margin:8px 0;"></td></tr>
          <tr>
            <td style="color:#8b8ba0; font-size:14px;">Team performance</td>
            <td width="160" style="text-align:right;">
              <a href="${BASE_URL}/pulse/${data.pulseId}?q=team&v=1" style="text-decoration:none; font-size:18px;">😟</a>&nbsp;&nbsp;
              <a href="${BASE_URL}/pulse/${data.pulseId}?q=team&v=2" style="text-decoration:none; font-size:18px;">😐</a>&nbsp;&nbsp;
              <a href="${BASE_URL}/pulse/${data.pulseId}?q=team&v=3" style="text-decoration:none; font-size:18px;">🙂</a>&nbsp;&nbsp;
              <a href="${BASE_URL}/pulse/${data.pulseId}?q=team&v=4" style="text-decoration:none; font-size:18px;">😊</a>&nbsp;&nbsp;
              <a href="${BASE_URL}/pulse/${data.pulseId}?q=team&v=5" style="text-decoration:none; font-size:18px;">🔥</a>
            </td>
          </tr>
          <tr><td colspan="2"><hr class="divider" style="margin:8px 0;"></td></tr>
          <tr>
            <td style="color:#8b8ba0; font-size:14px;">Personal energy</td>
            <td width="160" style="text-align:right;">
              <a href="${BASE_URL}/pulse/${data.pulseId}?q=energy&v=1" style="text-decoration:none; font-size:18px;">😟</a>&nbsp;&nbsp;
              <a href="${BASE_URL}/pulse/${data.pulseId}?q=energy&v=2" style="text-decoration:none; font-size:18px;">😐</a>&nbsp;&nbsp;
              <a href="${BASE_URL}/pulse/${data.pulseId}?q=energy&v=3" style="text-decoration:none; font-size:18px;">🙂</a>&nbsp;&nbsp;
              <a href="${BASE_URL}/pulse/${data.pulseId}?q=energy&v=4" style="text-decoration:none; font-size:18px;">😊</a>&nbsp;&nbsp;
              <a href="${BASE_URL}/pulse/${data.pulseId}?q=energy&v=5" style="text-decoration:none; font-size:18px;">🔥</a>
            </td>
          </tr>
        </table>
      </div>

      <p style="font-size:13px; text-align:center; color:#55556a;">Click any emoji to respond instantly. ${data.coachName} will see your pulse before your next session.</p>

      ${data.streak > 0 ? `
        <p style="text-align:center; font-size:14px;">🔥 <strong style="color:#f97316;">${data.streak} week streak!</strong> Keep it going.</p>
      ` : ''}
    `, `Quick 30-second pulse check from ${data.coachName}.`),
  }),

  // ─── 5. TRIAL ENDING ───
  trialEnding: (data) => ({
    subject: `Your Coach Perfect trial ends in 3 days`,
    html: layout(`
      <h1>Your trial ends ${data.trialEndDate}</h1>
      <p>Hi ${data.coachName}, your 14-day trial of <strong style="color:#eaeaf0;">${data.planName}</strong> wraps up in 3 days.</p>

      <div class="card">
        <h2>What you've accomplished:</h2>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td class="metric" width="33%"><div class="metric-value">${data.clientsAdded}</div><div class="metric-label">Clients Added</div></td>
            <td class="metric" width="33%"><div class="metric-value">${data.diagnosticsSent}</div><div class="metric-label">Diagnostics</div></td>
            <td class="metric" width="33%"><div class="metric-value">${data.sessionsLogged}</div><div class="metric-label">Sessions</div></td>
          </tr>
        </table>
      </div>

      ${data.clientsAdded > 0 ? `
        <div class="highlight">
          <strong style="color:#eaeaf0;">Your data is safe.</strong> If you don't subscribe, your account downgrades to Free (1 client, limited features). All your data is preserved — upgrade anytime to unlock it.
        </div>
      ` : ''}

      <p style="text-align:center; margin:28px 0;">
        <a href="${BASE_URL}/billing/upgrade" class="btn">Subscribe Now →</a>
      </p>

      ${data.isFoundingMember ? `
        <p style="text-align:center; font-size:14px; color:#f97316;">🎉 Your founding member discount (30% off for life) will apply automatically.</p>
      ` : ''}

      <p style="text-align:center;">
        <a href="${BASE_URL}/billing/plans" class="btn-ghost" style="display:inline-block; padding:10px 24px; border:1px solid #2a2a3a; border-radius:8px; color:#8b8ba0; text-decoration:none; font-size:13px;">Compare Plans</a>
      </p>
    `, `Your Coach Perfect trial ends in 3 days — here's what you've built so far.`),
  }),

  // ─── 6. PAYMENT FAILED ───
  paymentFailed: (data) => ({
    subject: `⚠️ Payment failed — update your card to keep Coach Perfect`,
    html: layout(`
      <h1>Payment didn't go through</h1>
      <p>Hi ${data.coachName}, we tried to charge your ${data.cardBrand} ending in ${data.cardLast4} for your ${data.planName} subscription ($${data.amount}), but it was declined.</p>

      <div class="card" style="border-color:#ef4444;">
        <p style="margin:0; text-align:center;">
          <span class="red" style="font-size:14px; font-weight:600;">⚠️ We'll retry automatically in ${data.nextRetryDays} days</span>
        </p>
      </div>

      <p>To avoid any interruption:</p>

      <p style="text-align:center; margin:28px 0;">
        <a href="${BASE_URL}/billing/update-payment" class="btn">Update Payment Method →</a>
      </p>

      <p style="font-size:13px; color:#55556a;">If your card info is correct, you may need to contact your bank. After 3 failed attempts, your account will downgrade to Free (your data is always preserved).</p>
    `, `Your payment for Coach Perfect was declined — update your card to avoid interruption.`),
  }),

  // ─── 7. DIAGNOSTIC RESULTS ───
  diagnosticResults: (data) => ({
    subject: `${data.clientName}'s diagnostic is complete — BHS: ${data.overallScore}`,
    html: layout(`
      <h1>Diagnostic Results Are In</h1>
      <p><strong style="color:#eaeaf0;">${data.clientName}</strong> from ${data.companyName} just completed their Business Health Diagnostic.</p>

      <div class="card" style="text-align:center;">
        <div class="metric-value" style="font-size:64px;">${data.overallScore}</div>
        <div class="metric-label">Business Health Score</div>
        <div style="margin-top:8px; font-size:14px; color:${data.overallScore >= 70 ? '#22c55e' : data.overallScore >= 50 ? '#eab308' : '#ef4444'};">
          ${data.overallScore >= 70 ? '● Strong' : data.overallScore >= 50 ? '● Developing' : '● Needs Attention'}
        </div>
      </div>

      <h2>Category Scores</h2>
      ${data.categories.map(c => `
        <div style="display:flex; align-items:center; padding:8px 0; border-bottom:1px solid #1e1e2e; font-size:14px;">
          <span style="flex:1; color:#8b8ba0;">${c.icon} ${c.name}</span>
          <span style="font-weight:600; color:${c.score >= 70 ? '#22c55e' : c.score >= 50 ? '#eab308' : '#ef4444'};">${c.score}</span>
        </div>
      `).join('')}

      <div class="highlight" style="margin-top:20px;">
        <strong style="color:#eaeaf0;">Weakest area:</strong> ${data.weakest.name} (${data.weakest.score})<br>
        <strong style="color:#eaeaf0;">Strongest area:</strong> ${data.strongest.name} (${data.strongest.score})
      </div>

      <p style="text-align:center; margin:28px 0;">
        <a href="${BASE_URL}/clients/${data.clientId}/diagnostic" class="btn">View Full Results →</a>
      </p>

      <p style="font-size:13px; color:#55556a; text-align:center;">Session prep will automatically incorporate these results.</p>
    `, `${data.clientName}'s Business Health Score: ${data.overallScore} — see the full breakdown.`),
  }),

  // ─── 8. MONTHLY PROGRESS REPORT ───
  progressReport: (data) => ({
    subject: `Monthly Progress: ${data.clientName} — BHS ${data.previousScore} → ${data.currentScore}`,
    html: layout(`
      <h1>Monthly Progress Report</h1>
      <p>Here's ${data.clientName}'s coaching progress for ${data.monthName}:</p>

      <div class="card">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td class="metric" width="33%"><div class="metric-value">${data.previousScore}</div><div class="metric-label">Previous BHS</div></td>
            <td class="metric" width="33%"><div class="metric-value" style="font-size:24px;">→</div><div class="metric-label">&nbsp;</div></td>
            <td class="metric" width="33%"><div class="metric-value">${data.currentScore}</div><div class="metric-label">Current BHS</div></td>
          </tr>
        </table>
        <div style="text-align:center; margin-top:8px;">
          <span style="font-size:18px; font-weight:700; color:${data.currentScore > data.previousScore ? '#22c55e' : '#ef4444'};">
            ${data.currentScore > data.previousScore ? '↑' : '↓'} ${Math.abs(data.currentScore - data.previousScore)} points
          </span>
        </div>
      </div>

      <h2>This Month's Highlights</h2>
      <ul>
        <li><strong style="color:#eaeaf0;">${data.sessionsCompleted} sessions</strong> completed (${data.attendanceRate}% attendance)</li>
        <li><strong style="color:#eaeaf0;">${data.tasksCompleted} of ${data.totalTasks} tasks</strong> completed (${Math.round(data.tasksCompleted/data.totalTasks*100)}%)</li>
        <li><strong style="color:#eaeaf0;">${data.winsLogged} wins</strong> captured</li>
        ${data.topImprovement ? `<li>Biggest gain: <strong style="color:#22c55e;">${data.topImprovement.name} +${data.topImprovement.change} pts</strong></li>` : ''}
      </ul>

      ${data.estimatedROI ? `
        <div class="card" style="text-align:center; border-color:#22c55e;">
          <div class="metric-label">Estimated Coaching ROI</div>
          <div class="metric-value" style="color:#22c55e;">$${data.estimatedROI.toLocaleString()}</div>
          <div style="font-size:12px; color:#55556a; margin-top:4px;">${data.roiMultiple}x return on investment</div>
        </div>
      ` : ''}

      <p style="text-align:center; margin:28px 0;">
        <a href="${BASE_URL}/clients/${data.clientId}/progress" class="btn">View Full Report →</a>
      </p>
    `, `${data.clientName}'s coaching progress: BHS ${data.previousScore} → ${data.currentScore}.`),
  }),
};

// ═══════════════════════════════════════════════════
// SEND EMAIL
// ═══════════════════════════════════════════════════

async function send(templateName, data) {
  const template = templates[templateName];
  if (!template) {
    throw new Error(`Unknown email template: ${templateName}`);
  }

  const { subject, html } = template(data);
  const to = data.to;

  if (!to) {
    throw new Error('Email "to" address required');
  }

  // Dev mode: log to console
  if (!resend || process.env.NODE_ENV === 'development') {
    console.log(`\n[Email] Template: ${templateName}`);
    console.log(`[Email] To: ${to}`);
    console.log(`[Email] Subject: ${subject}`);
    console.log(`[Email] Preview: ${html.substring(0, 200)}...`);

    if (process.env.SAVE_EMAIL_PREVIEWS) {
      const fs = require('fs');
      const path = `./email-previews/${templateName}-${Date.now()}.html`;
      fs.mkdirSync('./email-previews', { recursive: true });
      fs.writeFileSync(path, html);
      console.log(`[Email] Saved preview: ${path}`);
    }

    return { id: 'dev-' + Date.now(), to, subject };
  }

  // Production: send via Resend
  try {
    const result = await resend.emails.send({
      from: FROM,
      to: [to],
      reply_to: REPLY_TO,
      subject,
      html,
    });

    console.log(`[Email] Sent: ${templateName} → ${to} (${result.id})`);
    return result;

  } catch (err) {
    console.error(`[Email] Failed: ${templateName} → ${to}:`, err.message);
    throw err;
  }
}

// ═══════════════════════════════════════════════════
// PREVIEW ALL TEMPLATES (for dev)
// ═══════════════════════════════════════════════════

function generatePreviews() {
  const fs = require('fs');
  fs.mkdirSync('./email-previews', { recursive: true });

  const sampleData = {
    welcome: { to: 'test@test.com', coachName: 'Sarah', isTrial: true, planName: 'Professional', trialEndDate: 'March 4, 2026', isFoundingMember: true },
    diagnosticInvite: { to: 'client@test.com', coachName: 'Sarah Mitchell', diagnosticId: 'abc123', clientName: 'James Cooper' },
    sessionReminder: { to: 'test@test.com', otherPartyName: 'James Cooper', sessionDate: 'Tuesday, Feb 19', sessionTime: '10:00 AM', duration: 60, isCoach: true, prepBrief: 'BHS 68 → 74 (+6). Financial score dropped 3 pts. Third consecutive avoidance of financial discussion.', openTasks: 3, overdueTasks: 1, sessionId: 'sess123' },
    weeklyPulse: { to: 'client@test.com', clientName: 'James', coachName: 'Sarah', pulseId: 'pulse123', streak: 8 },
    trialEnding: { to: 'test@test.com', coachName: 'Sarah', planName: 'Professional', trialEndDate: 'March 4, 2026', clientsAdded: 5, diagnosticsSent: 3, sessionsLogged: 8, isFoundingMember: true },
    paymentFailed: { to: 'test@test.com', coachName: 'Sarah', cardBrand: 'Visa', cardLast4: '4242', planName: 'Professional', amount: '149.00', nextRetryDays: 3 },
    diagnosticResults: { to: 'coach@test.com', clientName: 'James Cooper', companyName: 'Cooper Construction', overallScore: 62, clientId: 'c2', categories: [
      { icon: '🎯', name: 'Strategy', score: 70 }, { icon: '💰', name: 'Financial', score: 48 },
      { icon: '⚙️', name: 'Operations', score: 65 }, { icon: '👥', name: 'People', score: 72 },
      { icon: '📣', name: 'Marketing', score: 55 }, { icon: '🧭', name: 'Leadership', score: 60 },
      { icon: '🚀', name: 'Innovation', score: 58 }, { icon: '🔧', name: 'Systems', score: 68 },
    ], weakest: { name: 'Financial', score: 48 }, strongest: { name: 'People', score: 72 } },
    progressReport: { to: 'coach@test.com', clientName: 'James Cooper', clientId: 'c2', monthName: 'January 2026', previousScore: 62, currentScore: 71, sessionsCompleted: 4, attendanceRate: 100, tasksCompleted: 11, totalTasks: 14, winsLogged: 5, topImprovement: { name: 'Financial', change: 8 }, estimatedROI: 42000, roiMultiple: 3.2 },
  };

  Object.entries(sampleData).forEach(([name, data]) => {
    const { subject, html } = templates[name](data);
    fs.writeFileSync(`./email-previews/${name}.html`, html);
    console.log(`Generated: email-previews/${name}.html — "${subject}"`);
  });

  console.log(`\nDone! Open email-previews/*.html in your browser to preview.`);
}

// Run preview generation if called directly
if (require.main === module) {
  generatePreviews();
}

module.exports = { send, templates, generatePreviews };
