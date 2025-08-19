import Stripe from 'stripe';
import { pool } from '../server.js';
import emailService from './emailService.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class SubscriptionService {
  
  // Initialize free trial for new user
  static async createFreeTrial(userId, email) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: email,
        metadata: { userId: userId }
      });

      // Get Pro plan
      const proPlanResult = await client.query(
        'SELECT * FROM subscription_plans WHERE name = $1',
        ['pro']
      );
      
      if (proPlanResult.rows.length === 0) {
        throw new Error('Pro plan not found');
      }
      
      const proPlan = proPlanResult.rows[0];
      
      // Get trial duration from environment or default to 7 days
      const trialDurationDays = parseInt(process.env.TRIAL_DURATION_DAYS) || 7;
      const trialEndDate = new Date(Date.now() + trialDurationDays * 24 * 60 * 60 * 1000);
      
      // Create trial subscription record
      const subscriptionResult = await client.query(`
        INSERT INTO user_subscriptions (
          user_id, plan_id, status, trial_start_date, trial_end_date, 
          current_period_start, current_period_end, stripe_customer_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        userId, proPlan.id, 'trial', new Date(), trialEndDate, 
        new Date(), trialEndDate, stripeCustomer.id
      ]);
      
      const subscription = subscriptionResult.rows[0];

      // Initialize usage tracking
      await this.initializeUsageTracking(client, userId);

      await client.query('COMMIT');
      return subscription;
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Failed to create free trial:', error);
      throw new Error('Trial creation failed');
    } finally {
      client.release();
    }
  }

  // Subscribe to a paid plan
  static async subscribeToPlan(userId, planName, paymentMethodId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const subscriptionResult = await client.query(`
        SELECT * FROM user_subscriptions 
        WHERE user_id = $1 AND status IN ('trial', 'expired')
        ORDER BY created_at DESC LIMIT 1
      `, [userId]);

      if (subscriptionResult.rows.length === 0) {
        throw new Error('No trial or expired subscription found');
      }

      const subscription = subscriptionResult.rows[0];
      
      const planResult = await client.query(
        'SELECT * FROM subscription_plans WHERE name = $1',
        [planName]
      );
      
      if (planResult.rows.length === 0) {
        throw new Error('Invalid plan selected');
      }

      const plan = planResult.rows[0];

      // Get Stripe price ID based on plan
      const stripePriceId = planName === 'basic' 
        ? process.env.STRIPE_BASIC_MONTHLY_PRICE_ID 
        : process.env.STRIPE_PRO_MONTHLY_PRICE_ID;

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: subscription.stripe_customer_id,
      });

      // Set as default payment method
      await stripe.customers.update(subscription.stripe_customer_id, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create Stripe subscription
      const stripeSubscription = await stripe.subscriptions.create({
        customer: subscription.stripe_customer_id,
        items: [{ price: stripePriceId }],
        expand: ['latest_invoice.payment_intent'],
      });

      // Update local subscription
      const updatedSubscriptionResult = await client.query(`
        UPDATE user_subscriptions 
        SET plan_id = $1, status = $2, stripe_subscription_id = $3, 
            payment_method_id = $4, current_period_start = $5, current_period_end = $6,
            trial_start_date = NULL, trial_end_date = NULL
        WHERE id = $7
        RETURNING *
      `, [
        plan.id, 'active', stripeSubscription.id, paymentMethodId,
        new Date(stripeSubscription.current_period_start * 1000),
        new Date(stripeSubscription.current_period_end * 1000),
        subscription.id
      ]);

      await client.query('COMMIT');
      return updatedSubscriptionResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Failed to subscribe to plan:', error);
      throw new Error('Subscription failed');
    } finally {
      client.release();
    }
  }

  // Handle trial expiration
  static async handleTrialExpiry(userId) {
    const client = await pool.connect();
    
    try {
      const subscriptionResult = await client.query(`
        SELECT * FROM user_subscriptions 
        WHERE user_id = $1 AND status = 'trial'
      `, [userId]);

      if (subscriptionResult.rows.length === 0) return;

      const subscription = subscriptionResult.rows[0];

      // Trial expires - user needs to choose a paid plan
      await client.query(`
        UPDATE user_subscriptions 
        SET status = 'expired', trial_start_date = NULL, trial_end_date = NULL
        WHERE id = $1
      `, [subscription.id]);

      // Send trial expiry email with plan selection
      await this.sendTrialExpiryEmail(userId);

      return subscription;
      
    } catch (error) {
      console.error('Failed to handle trial expiry:', error);
    } finally {
      client.release();
    }
  }

  // Check feature access
  static async hasFeatureAccess(userId, feature) {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) return false;
      
      const planResult = await pool.query(
        'SELECT * FROM subscription_plans WHERE id = $1',
        [subscription.plan_id]
      );
      
      if (planResult.rows.length === 0) return false;
      
      const plan = planResult.rows[0];
      
      // Check if feature is included in plan
      if (!plan.features[feature]) {
        return false;
      }

      // Check usage limits if applicable
      if (plan.limits[feature] && plan.limits[feature] !== -1) {
        const usage = await this.getUserUsage(userId, feature);
        return usage.usage_count < plan.limits[feature];
      }

      return true;
    } catch (error) {
      console.error('Failed to check feature access:', error);
      return false;
    }
  }

  // Track feature usage
  static async trackUsage(userId, feature, count = 1) {
    const client = await pool.connect();
    
    try {
      const monthYear = new Date().toISOString().slice(0, 7); // YYYY-MM
      
      const usageResult = await client.query(`
        INSERT INTO user_usage (user_id, feature, usage_count, month_year, reset_date)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, feature, month_year)
        DO UPDATE SET 
          usage_count = user_usage.usage_count + $3,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        userId, feature, count, monthYear,
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
      ]);

      return usageResult.rows[0];
      
    } catch (error) {
      console.error('Failed to track usage:', error);
    } finally {
      client.release();
    }
  }

  // Cancel subscription
  static async cancelSubscription(userId, cancelImmediately = false) {
    const client = await pool.connect();
    
    try {
      const subscriptionResult = await client.query(`
        SELECT * FROM user_subscriptions 
        WHERE user_id = $1 AND status = 'active'
      `, [userId]);

      if (subscriptionResult.rows.length === 0) {
        throw new Error('No active subscription found');
      }

      const subscription = subscriptionResult.rows[0];

      if (cancelImmediately) {
        // Cancel immediately
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
        
        await client.query(`
          UPDATE user_subscriptions 
          SET status = 'canceled', canceled_at = CURRENT_TIMESTAMP, cancel_at_period_end = FALSE
          WHERE id = $1
        `, [subscription.id]);
      } else {
        // Cancel at period end
        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: true
        });
        
        await client.query(`
          UPDATE user_subscriptions 
          SET cancel_at_period_end = TRUE
          WHERE id = $1
        `, [subscription.id]);
      }

      return subscription;
      
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw new Error('Cancellation failed');
    } finally {
      client.release();
    }
  }

  // Get user's current subscription
  static async getUserSubscription(userId) {
    try {
      const result = await pool.query(`
        SELECT us.*, sp.name as plan_name, sp.display_name, sp.features, sp.limits
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.user_id = $1
        ORDER BY us.created_at DESC
        LIMIT 1
      `, [userId]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get user subscription:', error);
      return null;
    }
  }

  // Get user's usage for a feature
  static async getUserUsage(userId, feature) {
    try {
      const monthYear = new Date().toISOString().slice(0, 7);
      const result = await pool.query(`
        SELECT * FROM user_usage 
        WHERE user_id = $1 AND feature = $2 AND month_year = $3
      `, [userId, feature, monthYear]);
      
      return result.rows[0] || { usage_count: 0 };
    } catch (error) {
      console.error('Failed to get user usage:', error);
      return { usage_count: 0 };
    }
  }

  // Initialize usage tracking for new user
  static async initializeUsageTracking(client, userId) {
    const monthYear = new Date().toISOString().slice(0, 7);
    const features = ['ai_suggestions', 'calendar_integrations'];
    
    for (const feature of features) {
      await client.query(`
        INSERT INTO user_usage (user_id, feature, usage_count, month_year, reset_date)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        userId, feature, 0, monthYear,
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
      ]);
    }
  }

  // Send trial expiry email
  static async sendTrialExpiryEmail(userId) {
    try {
      const userResult = await pool.query(
        'SELECT email, display_name FROM users WHERE id = $1',
        [userId]
      );
      
      if (userResult.rows.length === 0) return;
      
      const user = userResult.rows[0];
      
      const emailTemplate = `
        <h2>Your NeuroCal trial has ended</h2>
        <p>Hi ${user.display_name || user.email.split('@')[0]},</p>
        
        <p>Your 7-day free trial of NeuroCal Pro has ended. We hope you enjoyed the intelligent scheduling features!</p>
        
        <p>Your account has been moved to our Free plan, which includes:</p>
        <ul>
          <li>Basic AI scheduling</li>
          <li>2 calendar integrations</li>
          <li>50 AI suggestions per month</li>
        </ul>
        
        <p>To continue enjoying unlimited AI suggestions, advanced features, and priority support, upgrade to Pro for just $9.99/month.</p>
        
        <a href="${process.env.APP_URL}/dashboard/billing" style="background: #E17B47; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Upgrade to Pro</a>
        
        <p>Questions? Reply to this email - we're here to help!</p>
        
        <p>Best regards,<br>The NeuroCal Team</p>
      `;
      
      await emailService.sendVerificationEmail(user.email, user.id, user.first_name);
      
    } catch (error) {
      console.error('Failed to send trial expiry email:', error);
    }
  }

  // Get subscription metrics for admin dashboard
  static async getSubscriptionMetrics() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'trial') as active_trials,
          COUNT(*) FILTER (WHERE status = 'active') as active_subscriptions,
          COUNT(*) FILTER (WHERE status = 'canceled') as canceled_subscriptions,
          AVG(EXTRACT(DAY FROM (current_period_end - current_period_start))) as avg_subscription_length,
          SUM(CASE WHEN status = 'active' THEN 9.99 ELSE 0 END) as monthly_recurring_revenue
        FROM user_subscriptions 
        WHERE created_at >= NOW() - INTERVAL '30 days'
      `);
      
      return result.rows[0];
    } catch (error) {
      console.error('Failed to get subscription metrics:', error);
      return null;
    }
  }

  // Get conversion funnel data
  static async getConversionFunnel() {
    try {
      const result = await pool.query(`
        SELECT 
          'Trial Started' as stage,
          COUNT(*) as users,
          100.0 as conversion_rate
        FROM user_subscriptions 
        WHERE status IN ('trial', 'active', 'canceled')
        AND created_at >= NOW() - INTERVAL '30 days'
        
        UNION ALL
        
        SELECT 
          'Trial Converted' as stage,
          COUNT(*) as users,
          (COUNT(*) * 100.0 / (
            SELECT COUNT(*) FROM user_subscriptions 
            WHERE status IN ('trial', 'active', 'canceled')
            AND created_at >= NOW() - INTERVAL '30 days'
          )) as conversion_rate
        FROM user_subscriptions 
        WHERE status = 'active'
        AND created_at >= NOW() - INTERVAL '30 days'
        
        ORDER BY conversion_rate DESC
      `);
      
      return result.rows;
    } catch (error) {
      console.error('Failed to get conversion funnel:', error);
      return [];
    }
  }
}

export default SubscriptionService;
