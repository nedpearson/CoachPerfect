// ═══════════════════════════════════════════════════
// COACH PERFECT — STRIPE BILLING SERVER
// ═══════════════════════════════════════════════════
//
// Setup:
//   1. npm install stripe express cors dotenv
//   2. Copy .env.example → .env and fill in Stripe keys
//   3. Run: node billing-server.js
//   4. Set Stripe webhook endpoint to /webhooks/stripe
//
// Endpoints:
//   POST /api/checkout          — Create checkout session
//   POST /api/portal            — Create billing portal session
//   POST /webhooks/stripe       — Handle Stripe events
//   GET  /api/subscription/:id  — Get subscription status
//   POST /api/usage             — Report metered usage (API calls)
//

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// ─── STRIPE INIT ───
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ─── MIDDLEWARE ───
// Webhooks need raw body
app.use('/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json());
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:3000', 'http://localhost:5173'];
app.use(cors({ origin: allowedOrigins }));

// ═══════════════════════════════════════════════════
// PRICING CONFIGURATION
// ═══════════════════════════════════════════════════

const PLANS = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    features: { maxClients: 1, sessionNotes: 3, templates: 5, benchmarking: false, aiPrep: false, branding: true },
    stripePriceMonthly: null,
    stripePriceAnnual: null,
  },
  starter: {
    name: 'Starter',
    monthlyPrice: 4900, // cents
    annualPrice: 3900,
    features: { maxClients: 10, sessionNotes: -1, templates: -1, benchmarking: 'basic', aiPrep: false, branding: true },
    stripePriceMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
    stripePriceAnnual: process.env.STRIPE_PRICE_STARTER_ANNUAL,
  },
  professional: {
    name: 'Professional',
    monthlyPrice: 14900,
    annualPrice: 11900,
    features: { maxClients: 25, sessionNotes: -1, templates: -1, benchmarking: 'full', aiPrep: true, branding: false },
    stripePriceMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    stripePriceAnnual: process.env.STRIPE_PRICE_PRO_ANNUAL,
  },
  business: {
    name: 'Business',
    monthlyPrice: 34900,
    annualPrice: 27900,
    features: { maxClients: -1, sessionNotes: -1, templates: -1, benchmarking: 'full', aiPrep: true, branding: false },
    stripePriceMonthly: process.env.STRIPE_PRICE_BIZ_MONTHLY,
    stripePriceAnnual: process.env.STRIPE_PRICE_BIZ_ANNUAL,
  },
  enterprise: {
    name: 'Enterprise',
    monthlyPrice: 79900,
    annualPrice: null, // custom
    features: { maxClients: -1, sessionNotes: -1, templates: -1, benchmarking: 'full', aiPrep: true, branding: false },
    stripePriceMonthly: process.env.STRIPE_PRICE_ENT_MONTHLY,
    stripePriceAnnual: null,
  },
};

// ═══════════════════════════════════════════════════
// CHECKOUT — Create Stripe Checkout Session
// ═══════════════════════════════════════════════════

app.post('/api/checkout', async (req, res) => {
  try {
    const { plan, interval, coachId, email, coupon } = req.body;

    // Validate plan
    const planConfig = PLANS[plan];
    if (!planConfig || plan === 'free') {
      return res.status(400).json({ error: 'Invalid plan. Choose: starter, professional, business, enterprise' });
    }

    // Get the right price ID
    const priceId = interval === 'annual' ? planConfig.stripePriceAnnual : planConfig.stripePriceMonthly;
    if (!priceId) {
      return res.status(400).json({ error: `No ${interval} pricing available for ${plan}` });
    }

    // Build checkout session params
    const sessionParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,
      client_reference_id: coachId,
      metadata: { coachId, plan, interval },
      subscription_data: {
        metadata: { coachId, plan },
        trial_period_days: 14,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      tax_id_collection: { enabled: true },
    };

    // Pre-fill email if provided
    if (email) {
      sessionParams.customer_email = email;
    }

    // Apply founding member coupon
    if (coupon) {
      sessionParams.discounts = [{ coupon }];
      delete sessionParams.allow_promotion_codes; // Can't use both
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.json({ url: session.url, sessionId: session.id });

  } catch (err) {
    console.error('[Checkout Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════
// BILLING PORTAL — Self-Service Management
// ═══════════════════════════════════════════════════

app.post('/api/portal', async (req, res) => {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'customerId required' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/settings/billing`,
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error('[Portal Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════
// SUBSCRIPTION STATUS
// ═══════════════════════════════════════════════════

app.get('/api/subscription/:coachId', async (req, res) => {
  try {
    const { coachId } = req.params;

    // In production, look up Stripe customer by coachId in your DB
    // For now, return the plan features
    const planId = req.query.plan || 'free';
    const planConfig = PLANS[planId];

    if (!planConfig) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json({
      plan: planId,
      name: planConfig.name,
      features: planConfig.features,
      status: planId === 'free' ? 'active' : 'check_stripe',
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════
// WEBHOOKS — Handle Stripe Events
// ═══════════════════════════════════════════════════

app.post('/webhooks/stripe', async (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET is not set — rejecting event');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Webhook Sig Error]', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  const { type, data } = event;

  console.log(`[Webhook] ${type}`);

  switch (type) {
    // ─── CHECKOUT COMPLETED ───
    case 'checkout.session.completed': {
      const session = data.object;
      const coachId = session.metadata?.coachId || session.client_reference_id;
      const plan = session.metadata?.plan;
      const customerId = session.customer;
      const subscriptionId = session.subscription;

      console.log(`[Webhook] Coach ${coachId} subscribed to ${plan} (customer: ${customerId})`);

      // TODO: Update your database
      // await db.coaches.update(coachId, {
      //   stripeCustomerId: customerId,
      //   stripeSubscriptionId: subscriptionId,
      //   plan: plan,
      //   planStatus: 'active',
      //   trialEndsAt: new Date(Date.now() + 14 * 86400000),
      // });

      // TODO: Send welcome email
      // await sendEmail('welcome', coachId);

      break;
    }

    // ─── SUBSCRIPTION UPDATED ───
    case 'customer.subscription.updated': {
      const sub = data.object;
      const coachId = sub.metadata?.coachId;
      const status = sub.status; // active, past_due, canceled, trialing, etc.

      console.log(`[Webhook] Subscription updated: ${coachId} → ${status}`);

      // TODO: Update plan status in DB
      // await db.coaches.update(coachId, { planStatus: status });

      break;
    }

    // ─── SUBSCRIPTION DELETED (canceled) ───
    case 'customer.subscription.deleted': {
      const sub = data.object;
      const coachId = sub.metadata?.coachId;

      console.log(`[Webhook] Subscription canceled: ${coachId}`);

      // TODO: Downgrade to free
      // await db.coaches.update(coachId, {
      //   plan: 'free',
      //   planStatus: 'canceled',
      //   canceledAt: new Date(),
      // });

      // TODO: Send cancellation email
      break;
    }

    // ─── PAYMENT FAILED ───
    case 'invoice.payment_failed': {
      const invoice = data.object;
      const customerId = invoice.customer;
      const attempt = invoice.attempt_count;

      console.log(`[Webhook] Payment failed for ${customerId} (attempt ${attempt})`);

      // TODO: Send payment failure email
      // Stripe auto-retries 3 times over 10 days
      // After 3 failures, subscription moves to past_due/canceled

      // if (attempt >= 3) {
      //   // Final attempt failed — downgrade
      //   await db.coaches.updateByCustomerId(customerId, { plan: 'free', planStatus: 'payment_failed' });
      // }

      break;
    }

    // ─── PAYMENT SUCCEEDED ───
    case 'invoice.payment_succeeded': {
      const invoice = data.object;
      const customerId = invoice.customer;

      console.log(`[Webhook] Payment succeeded for ${customerId}: $${(invoice.amount_paid / 100).toFixed(2)}`);

      // TODO: Update payment records, send receipt email
      break;
    }

    // ─── TRIAL ENDING ───
    case 'customer.subscription.trial_will_end': {
      const sub = data.object;
      const coachId = sub.metadata?.coachId;

      console.log(`[Webhook] Trial ending for ${coachId} in 3 days`);

      // TODO: Send trial ending email
      break;
    }

    default:
      console.log(`[Webhook] Unhandled event: ${type}`);
  }

  res.json({ received: true });
});

// ═══════════════════════════════════════════════════
// USAGE REPORTING — Report metered API usage
// ═══════════════════════════════════════════════════

app.post('/api/usage', async (req, res) => {
  try {
    const { coachId, subscriptionItemId, quantity } = req.body;

    if (!coachId || !subscriptionItemId) {
      return res.status(400).json({ error: 'coachId and subscriptionItemId required' });
    }

    // Create a usage record for metered billing
    const usageRecord = await stripe.subscriptionItems.createUsageRecord(
      subscriptionItemId,
      {
        quantity: quantity || 1,
        timestamp: Math.floor(Date.now() / 1000),
        action: 'increment',
      }
    );

    res.json({ recorded: true, usageRecord });

  } catch (err) {
    console.error('[Usage Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════
// STRIPE SETUP HELPER — Run Once to Create Products
// ═══════════════════════════════════════════════════

// Middleware: require SETUP_SECRET header to prevent unauthorized execution
function requireSetupSecret(req, res, next) {
  const secret = req.headers['x-setup-secret'];
  if (!process.env.SETUP_SECRET || secret !== process.env.SETUP_SECRET) {
    return res.status(401).json({ error: 'Unauthorized — provide x-setup-secret header' });
  }
  next();
}

app.post('/api/setup-stripe', requireSetupSecret, async (req, res) => {
  try {
    const results = {};

    // Create product
    const product = await stripe.products.create({
      name: 'Coach Perfect',
      description: 'Coaching intelligence platform',
      metadata: { app: 'coachperfect' },
    });
    results.productId = product.id;

    // Create prices for each plan
    const priceConfigs = [
      { plan: 'starter', monthly: 4900, annual: 3900 },
      { plan: 'professional', monthly: 14900, annual: 11900 },
      { plan: 'business', monthly: 34900, annual: 27900 },
      { plan: 'enterprise', monthly: 79900, annual: null },
    ];

    results.prices = {};

    for (const cfg of priceConfigs) {
      // Monthly
      const monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: cfg.monthly,
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { plan: cfg.plan, interval: 'monthly' },
        nickname: `${cfg.plan} Monthly`,
      });
      results.prices[`${cfg.plan}_monthly`] = monthlyPrice.id;

      // Annual — charge once per year at monthly_rate × 12
      if (cfg.annual) {
        const annualPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: cfg.annual * 12,
          currency: 'usd',
          recurring: { interval: 'year' },
          metadata: { plan: cfg.plan, interval: 'annual' },
          nickname: `${cfg.plan} Annual`,
        });
        results.prices[`${cfg.plan}_annual`] = annualPrice.id;
      }
    }

    // Create founding member coupon (30% off forever)
    const coupon = await stripe.coupons.create({
      percent_off: 30,
      duration: 'forever',
      name: 'Founding Member — 30% Off For Life',
      metadata: { type: 'founding_member' },
    });
    results.foundingMemberCoupon = coupon.id;

    // Create billing portal configuration
    await stripe.billingPortal.configurations.create({
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price', 'promotion_code'],
          proration_behavior: 'create_prorations',
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
          cancellation_reason: {
            enabled: true,
            options: ['too_expensive', 'missing_features', 'switched_service', 'unused', 'other'],
          },
        },
        payment_method_update: { enabled: true },
        invoice_history: { enabled: true },
      },
      business_profile: {
        headline: 'Manage your Coach Perfect subscription',
      },
    });

    console.log('\n═══ STRIPE SETUP COMPLETE ═══');
    console.log('Add these to your .env:');
    console.log(`STRIPE_PRODUCT_ID=${product.id}`);
    Object.entries(results.prices).forEach(([key, val]) => {
      console.log(`STRIPE_PRICE_${key.toUpperCase()}=${val}`);
    });
    console.log(`STRIPE_FOUNDING_COUPON=${coupon.id}`);
    console.log('═══════════════════════════\n');

    res.json(results);

  } catch (err) {
    console.error('[Setup Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════
// FEATURE GATE MIDDLEWARE
// ═══════════════════════════════════════════════════

function requirePlan(minPlan) {
  const planOrder = ['free', 'starter', 'professional', 'business', 'enterprise'];

  return (req, res, next) => {
    const coachPlan = req.coachPlan || 'free'; // Set by auth middleware
    const coachLevel = planOrder.indexOf(coachPlan);
    const requiredLevel = planOrder.indexOf(minPlan);

    if (coachLevel < requiredLevel) {
      return res.status(403).json({
        error: 'Plan upgrade required',
        currentPlan: coachPlan,
        requiredPlan: minPlan,
        upgradeUrl: `${process.env.FRONTEND_URL}/billing/upgrade`,
      });
    }

    next();
  };
}

// Example usage:
// app.get('/api/ai-prep', requirePlan('professional'), (req, res) => { ... });
// app.get('/api/api-access', requirePlan('business'), (req, res) => { ... });

// ═══════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'coachperfect-billing',
    stripe: !!process.env.STRIPE_SECRET_KEY,
    plans: Object.keys(PLANS),
  });
});

// ═══════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════

const PORT = process.env.BILLING_PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n  🟠 Coach Perfect Billing Server`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  → Plans: ${Object.keys(PLANS).join(', ')}`);
  console.log(`  → Stripe: ${process.env.STRIPE_SECRET_KEY ? '✓ Connected' : '✗ Missing STRIPE_SECRET_KEY'}`);
  console.log(`  → Webhook: ${process.env.STRIPE_WEBHOOK_SECRET ? '✓ Configured' : '✗ Missing STRIPE_WEBHOOK_SECRET'}`);
  console.log('');
});

module.exports = { app, PLANS, requirePlan };
