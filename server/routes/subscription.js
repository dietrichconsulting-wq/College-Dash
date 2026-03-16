import { Router } from 'express';
import Stripe from 'stripe';
import { getProfile, updateProfile, getProfileByStripeCustomerId } from '../services/notion.js';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Stripe Checkout Session with 7-day trial
router.post('/create-checkout', async (req, res, next) => {
  try {
    const { userId } = req.body;
    const profile = await getProfile(userId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    // Create or reuse Stripe customer
    let customerId = profile.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        metadata: { userId },
      });
      customerId = customer.id;
      await updateProfile(userId, { stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: `${req.headers.origin || 'http://localhost:5173'}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5173'}/?cancelled=true`,
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

// Validate promo code and grant 7-day trial without credit card
router.post('/promo', async (req, res, next) => {
  try {
    const { userId, promoCode } = req.body;
    if (promoCode !== process.env.PROMO_CODE) {
      return res.status(400).json({ error: 'Invalid promo code' });
    }

    const profile = await getProfile(userId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    // Don't allow promo code if user already used it
    if (profile.subscriptionStatus === 'active') {
      return res.status(400).json({ error: 'You already have an active subscription' });
    }

    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);

    await updateProfile(userId, {
      subscriptionStatus: 'trial',
      subscriptionEnd: trialEnd.toISOString(),
    });

    const updated = await getProfile(userId);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Check subscription status
router.get('/status/:userId', async (req, res, next) => {
  try {
    const profile = await getProfile(req.params.userId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    let { subscriptionStatus, subscriptionEnd } = profile;

    // Auto-expire stale trials
    if (subscriptionStatus === 'trial' && subscriptionEnd) {
      if (new Date(subscriptionEnd) < new Date()) {
        await updateProfile(req.params.userId, { subscriptionStatus: 'expired' });
        subscriptionStatus = 'expired';
      }
    }

    res.json({
      status: subscriptionStatus,
      subscriptionEnd,
      hasAccess: subscriptionStatus === 'trial' || subscriptionStatus === 'active',
    });
  } catch (err) {
    next(err);
  }
});

// Stripe webhook (receives raw body — configured in index.js)
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const { type, data } = event;

  try {
    switch (type) {
      case 'checkout.session.completed': {
        const session = data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const profile = await getProfileByStripeCustomerId(customerId);
        if (profile) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          await updateProfile(profile.userId, {
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: sub.status === 'trialing' ? 'trial' : 'active',
            subscriptionEnd: new Date(sub.current_period_end * 1000).toISOString(),
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = data.object;
        const profile = await getProfileByStripeCustomerId(sub.customer);
        if (profile) {
          let status;
          if (sub.status === 'active') status = 'active';
          else if (sub.status === 'trialing') status = 'trial';
          else if (sub.cancel_at_period_end) status = 'cancelled';
          else status = 'expired';
          await updateProfile(profile.userId, {
            subscriptionStatus: status,
            subscriptionEnd: new Date(sub.current_period_end * 1000).toISOString(),
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = data.object;
        const profile = await getProfileByStripeCustomerId(sub.customer);
        if (profile) {
          await updateProfile(profile.userId, { subscriptionStatus: 'expired' });
        }
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err.message);
  }

  res.json({ received: true });
});

export default router;
