import Stripe from 'stripe';
import { pool } from '../server.js';
import emailService from './emailService.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Webhook handler for Stripe events
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).send('Webhook handled');
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).send('Webhook handler failed');
  }
};

const handlePaymentSucceeded = async (invoice) => {
  const client = await pool.connect();
  
  try {
    const subscriptionResult = await client.query(`
      SELECT * FROM user_subscriptions 
      WHERE stripe_subscription_id = $1
    `, [invoice.subscription]);

    if (subscriptionResult.rows.length === 0) {
      console.log(`No subscription found for Stripe subscription: ${invoice.subscription}`);
      return;
    }

    const subscription = subscriptionResult.rows[0];

    // Update subscription status to active
    await client.query(`
      UPDATE user_subscriptions 
      SET status = 'active'
      WHERE id = $1
    `, [subscription.id]);
    
    // Record billing history
    await client.query(`
      INSERT INTO billing_history (
        user_id, subscription_id, amount, currency, status,
        stripe_invoice_id, billing_period_start, billing_period_end
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      subscription.user_id,
      subscription.id,
      invoice.amount_paid / 100, // Convert from cents
      invoice.currency,
      'paid',
      invoice.id,
      new Date(invoice.period_start * 1000),
      new Date(invoice.period_end * 1000)
    ]);

    console.log(`Payment succeeded for subscription: ${subscription.id}`);
    
  } catch (error) {
    console.error('Failed to handle payment succeeded:', error);
  } finally {
    client.release();
  }
};

const handlePaymentFailed = async (invoice) => {
  const client = await pool.connect();
  
  try {
    const subscriptionResult = await client.query(`
      SELECT * FROM user_subscriptions 
      WHERE stripe_subscription_id = $1
    `, [invoice.subscription]);

    if (subscriptionResult.rows.length === 0) {
      console.log(`No subscription found for Stripe subscription: ${invoice.subscription}`);
      return;
    }

    const subscription = subscriptionResult.rows[0];

    // Update subscription status to past_due
    await client.query(`
      UPDATE user_subscriptions 
      SET status = 'past_due'
      WHERE id = $1
    `, [subscription.id]);
    
    // Record failed payment
    await client.query(`
      INSERT INTO billing_history (
        user_id, subscription_id, amount, currency, status,
        stripe_invoice_id, billing_period_start, billing_period_end
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      subscription.user_id,
      subscription.id,
      invoice.amount_due / 100,
      invoice.currency,
      'failed',
      invoice.id,
      new Date(invoice.period_start * 1000),
      new Date(invoice.period_end * 1000)
    ]);

    // Send payment failed email
    await sendPaymentFailedEmail(subscription.user_id, invoice);
    
    console.log(`Payment failed for subscription: ${subscription.id}`);
    
  } catch (error) {
    console.error('Failed to handle payment failed:', error);
  } finally {
    client.release();
  }
};

const handleSubscriptionUpdated = async (stripeSubscription) => {
  const client = await pool.connect();
  
  try {
    const subscriptionResult = await client.query(`
      SELECT * FROM user_subscriptions 
      WHERE stripe_subscription_id = $1
    `, [stripeSubscription.id]);

    if (subscriptionResult.rows.length === 0) {
      console.log(`No subscription found for Stripe subscription: ${stripeSubscription.id}`);
      return;
    }

    const subscription = subscriptionResult.rows[0];

    // Update subscription details
    await client.query(`
      UPDATE user_subscriptions 
      SET 
        current_period_start = $1,
        current_period_end = $2,
        cancel_at_period_end = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `, [
      new Date(stripeSubscription.current_period_start * 1000),
      new Date(stripeSubscription.current_period_end * 1000),
      stripeSubscription.cancel_at_period_end,
      subscription.id
    ]);

    console.log(`Subscription updated: ${subscription.id}`);
    
  } catch (error) {
    console.error('Failed to handle subscription updated:', error);
  } finally {
    client.release();
  }
};

const handleSubscriptionDeleted = async (stripeSubscription) => {
  const client = await pool.connect();
  
  try {
    const subscriptionResult = await client.query(`
      SELECT * FROM user_subscriptions 
      WHERE stripe_subscription_id = $1
    `, [stripeSubscription.id]);

    if (subscriptionResult.rows.length === 0) {
      console.log(`No subscription found for Stripe subscription: ${stripeSubscription.id}`);
      return;
    }

    const subscription = subscriptionResult.rows[0];

    // Update subscription status to canceled
    await client.query(`
      UPDATE user_subscriptions 
      SET 
        status = 'canceled',
        canceled_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [subscription.id]);

    console.log(`Subscription canceled: ${subscription.id}`);
    
  } catch (error) {
    console.error('Failed to handle subscription deleted:', error);
  } finally {
    client.release();
  }
};

const handleTrialWillEnd = async (stripeSubscription) => {
  const client = await pool.connect();
  
  try {
    const subscriptionResult = await client.query(`
      SELECT * FROM user_subscriptions 
      WHERE stripe_subscription_id = $1
    `, [stripeSubscription.id]);

    if (subscriptionResult.rows.length === 0) {
      console.log(`No subscription found for Stripe subscription: ${stripeSubscription.id}`);
      return;
    }

    const subscription = subscriptionResult.rows[0];

    // Send trial ending soon email
    await sendTrialEndingSoonEmail(subscription.user_id);
    
    console.log(`Trial ending soon email sent for subscription: ${subscription.id}`);
    
  } catch (error) {
    console.error('Failed to handle trial will end:', error);
  } finally {
    client.release();
  }
};

const sendPaymentFailedEmail = async (userId, invoice) => {
  try {
    const userResult = await pool.query(
      'SELECT email, display_name FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) return;
    
    const user = userResult.rows[0];
    
    const emailTemplate = `
      <h2>Payment Failed</h2>
      <p>Hi ${user.display_name || user.email.split('@')[0]},</p>
      
      <p>We were unable to process your payment for NeuroCal Pro. This could be due to:</p>
      <ul>
        <li>Insufficient funds</li>
        <li>Expired payment method</li>
        <li>Bank declined the transaction</li>
      </ul>
      
      <p>Amount: $${(invoice.amount_due / 100).toFixed(2)} ${invoice.currency.toUpperCase()}</p>
      
      <p>To avoid any interruption to your service, please update your payment method:</p>
      
      <a href="${process.env.APP_URL}/dashboard/billing" style="background: #E17B47; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Update Payment Method</a>
      
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      
      <p>Best regards,<br>The NeuroCal Team</p>
    `;
    
    await emailService.sendVerificationEmail(user.email, user.id, user.first_name);
    
  } catch (error) {
    console.error('Failed to send payment failed email:', error);
  }
};

const sendTrialEndingSoonEmail = async (userId) => {
  try {
    const userResult = await pool.query(
      'SELECT email, display_name FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) return;
    
    const user = userResult.rows[0];
    
    const emailTemplate = `
      <h2>Your Trial is Ending Soon</h2>
      <p>Hi ${user.display_name || user.email.split('@')[0]},</p>
      
      <p>Your NeuroCal Pro trial will end in 3 days. Don't lose access to your intelligent scheduling features!</p>
      
      <p>Upgrade now to continue enjoying:</p>
      <ul>
        <li>Unlimited AI suggestions</li>
        <li>Advanced calendar analytics</li>
        <li>Priority support</li>
        <li>Team collaboration features</li>
      </ul>
      
      <p>Upgrade to Pro for just $9.99/month:</p>
      
      <a href="${process.env.APP_URL}/dashboard/billing" style="background: #E17B47; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Upgrade to Pro</a>
      
      <p>Questions? Reply to this email - we're here to help!</p>
      
      <p>Best regards,<br>The NeuroCal Team</p>
    `;
    
    await emailService.sendVerificationEmail(user.email, user.id, user.first_name);
    
  } catch (error) {
    console.error('Failed to send trial ending soon email:', error);
  }
};
