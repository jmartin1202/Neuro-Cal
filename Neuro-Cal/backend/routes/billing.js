import express from 'express';
import Stripe from 'stripe';
import SubscriptionService from '../services/subscriptionService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware to check if user is authenticated
router.use(authenticateToken);

// Get user's subscription
router.get('/subscription', async (req, res) => {
  try {
    const subscription = await SubscriptionService.getUserSubscription(req.user.id);
    
    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }
    
    res.json(subscription);
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Create setup intent for adding payment method
router.post('/create-setup-intent', async (req, res) => {
  try {
    const subscription = await SubscriptionService.getUserSubscription(req.user.id);
    
    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }
    
    const setupIntent = await stripe.setupIntents.create({
      customer: subscription.stripe_customer_id,
      payment_method_types: ['card'],
      usage: 'off_session'
    });

    res.json({ client_secret: setupIntent.client_secret });
  } catch (error) {
    console.error('Failed to create setup intent:', error);
    res.status(500).json({ error: 'Failed to create setup intent' });
  }
});

// Convert trial to paid subscription
router.post('/convert-trial', async (req, res) => {
  try {
    const { payment_method_id, plan_name = 'pro' } = req.body;
    
    if (!payment_method_id) {
      return res.status(400).json({ error: 'Payment method ID is required' });
    }
    
    const subscription = await SubscriptionService.subscribeToPlan(
      req.user.id, 
      plan_name, 
      payment_method_id
    );
    
    res.json(subscription);
  } catch (error) {
    console.error('Failed to convert trial:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel subscription
router.post('/cancel-subscription', async (req, res) => {
  try {
    const { cancel_immediately = false } = req.body;
    
    const subscription = await SubscriptionService.cancelSubscription(
      req.user.id, 
      cancel_immediately
    );
    
    res.json(subscription);
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reactivate subscription
router.post('/reactivate-subscription', async (req, res) => {
  try {
    const subscription = await SubscriptionService.getUserSubscription(req.user.id);
    
    if (!subscription || !subscription.stripe_subscription_id) {
      return res.status(404).json({ error: 'No subscription found' });
    }
    
    // Reactivate in Stripe
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false
    });
    
    // Update local status
    const updatedSubscription = await SubscriptionService.reactivateSubscription(req.user.id);
    
    res.json(updatedSubscription);
  } catch (error) {
    console.error('Failed to reactivate subscription:', error);
    res.status(500).json({ error: 'Failed to reactivate subscription' });
  }
});

// Get billing history
router.get('/history', async (req, res) => {
  try {
    const { pool } = await import('../server.js');
    
    const result = await pool.query(`
      SELECT 
        bh.*,
        sp.name as plan_name,
        sp.display_name as plan_display_name
      FROM billing_history bh
      LEFT JOIN user_subscriptions us ON bh.subscription_id = us.id
      LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE bh.user_id = $1
      ORDER BY bh.created_at DESC
      LIMIT 50
    `, [req.user.id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch billing history:', error);
    res.status(500).json({ error: 'Failed to fetch billing history' });
  }
});

// Get available plans
router.get('/plans', async (req, res) => {
  try {
    const { pool } = await import('../server.js');
    
    const result = await pool.query(`
      SELECT * FROM subscription_plans 
      WHERE is_active = TRUE
      ORDER BY price_monthly ASC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch plans:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Get user's usage for features
router.get('/usage', async (req, res) => {
  try {
    const { pool } = await import('../server.js');
    
    const result = await pool.query(`
      SELECT 
        uu.*,
        sp.limits
      FROM user_usage uu
      JOIN user_subscriptions us ON uu.user_id = us.user_id
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE uu.user_id = $1 AND uu.month_year = $2
    `, [req.user.id, new Date().toISOString().slice(0, 7)]);
    
    // Format usage data with limits
    const usageData = result.rows.map(row => ({
      feature: row.feature,
      usage_count: row.usage_count,
      limit: row.limits[row.feature] || -1,
      is_unlimited: row.limits[row.feature] === -1,
      percentage_used: row.limits[row.feature] === -1 ? 0 : 
        Math.round((row.usage_count / row.limits[row.feature]) * 100)
    }));
    
    res.json(usageData);
  } catch (error) {
    console.error('Failed to fetch usage:', error);
    res.status(500).json({ error: 'Failed to fetch usage' });
  }
});

// Update payment method
router.post('/update-payment-method', async (req, res) => {
  try {
    const { payment_method_id } = req.body;
    
    if (!payment_method_id) {
      return res.status(400).json({ error: 'Payment method ID is required' });
    }
    
    const subscription = await SubscriptionService.getUserSubscription(req.user.id);
    
    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }
    
    // Set as default payment method in Stripe
    await stripe.customers.update(subscription.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: payment_method_id,
      },
    });
    
    // Update local subscription
    const { pool } = await import('../server.js');
    await pool.query(`
      UPDATE user_subscriptions 
      SET payment_method_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [payment_method_id, subscription.id]);
    
    res.json({ success: true, message: 'Payment method updated successfully' });
  } catch (error) {
    console.error('Failed to update payment method:', error);
    res.status(500).json({ error: 'Failed to update payment method' });
  }
});

// Get customer portal session for Stripe
router.post('/create-portal-session', async (req, res) => {
  try {
    const subscription = await SubscriptionService.getUserSubscription(req.user.id);
    
    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }
    
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL}/dashboard/billing`,
    });
    
    res.json({ url: session.url });
  } catch (error) {
    console.error('Failed to create portal session:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Feature access check middleware
export const checkFeatureAccess = (feature) => {
  return async (req, res, next) => {
    try {
      const hasAccess = await SubscriptionService.hasFeatureAccess(req.user.id, feature);
      
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Feature not available in your current plan',
          upgrade_required: true,
          feature: feature
        });
      }
      
      // Track usage
      await SubscriptionService.trackUsage(req.user.id, feature);
      next();
    } catch (error) {
      console.error('Failed to check feature access:', error);
      res.status(500).json({ error: 'Failed to check feature access' });
    }
  };
};

// Admin routes (protected by admin middleware)
router.get('/admin/metrics', async (req, res) => {
  try {
    // Check if user is admin (implement your admin check logic)
    if (!req.user.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const metrics = await SubscriptionService.getSubscriptionMetrics();
    const funnel = await SubscriptionService.getConversionFunnel();
    
    res.json({ metrics, funnel });
  } catch (error) {
    console.error('Failed to fetch admin metrics:', error);
    res.status(500).json({ error: 'Failed to fetch admin metrics' });
  }
});

export default router;
