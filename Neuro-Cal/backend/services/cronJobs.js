import cron from 'node-cron';
import { pool } from '../server.js';
import SubscriptionService from './subscriptionService.js';

// Initialize cron jobs
export const initializeCronJobs = () => {
  console.log('🕐 Initializing cron jobs...');
  
  // Run daily at midnight to check for expired trials
  cron.schedule('0 0 * * *', async () => {
    console.log('🔍 Checking for expired trials...');
    await checkExpiredTrials();
  });

  // Run monthly on the 1st to reset usage limits
  cron.schedule('0 0 1 * *', async () => {
    console.log('🔄 Resetting monthly usage limits...');
    await resetMonthlyUsage();
  });

  // Run every hour to check for trials ending soon (3 days before expiry)
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Checking for trials ending soon...');
    await checkTrialsEndingSoon();
  });

  console.log('✅ Cron jobs initialized successfully');
};

// Check for expired trials
const checkExpiredTrials = async () => {
  const client = await pool.connect();
  
  try {
    const expiredTrialsResult = await client.query(`
      SELECT us.*, u.email 
      FROM user_subscriptions us
      JOIN users u ON us.user_id = u.id
      WHERE us.status = 'trial' 
      AND us.trial_end_date <= NOW()
    `);

    console.log(`Found ${expiredTrialsResult.rows.length} expired trials`);

    for (const subscription of expiredTrialsResult.rows) {
      try {
        await SubscriptionService.handleTrialExpiry(subscription.user_id);
        console.log(`✅ Trial expired for user ${subscription.user_id}`);
      } catch (error) {
        console.error(`❌ Failed to handle trial expiry for user ${subscription.user_id}:`, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to check expired trials:', error);
  } finally {
    client.release();
  }
};

// Check for trials ending soon (3 days before expiry)
const checkTrialsEndingSoon = async () => {
  const client = await pool.connect();
  
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const trialsEndingSoonResult = await client.query(`
      SELECT us.*, u.email 
      FROM user_subscriptions us
      JOIN users u ON us.user_id = u.id
      WHERE us.status = 'trial' 
      AND us.trial_end_date <= $1
      AND us.trial_end_date > NOW()
      AND NOT EXISTS (
        SELECT 1 FROM email_notifications en 
        WHERE en.user_id = us.user_id 
        AND en.type = 'trial_ending_soon'
        AND en.created_at > NOW() - INTERVAL '24 hours'
      )
    `, [threeDaysFromNow]);

    console.log(`Found ${trialsEndingSoonResult.rows.length} trials ending soon`);

    for (const subscription of trialsEndingSoonResult.rows) {
      try {
        await sendTrialEndingSoonEmail(subscription.user_id);
        
        // Record that we sent the notification
        await client.query(`
          INSERT INTO email_notifications (user_id, type, created_at)
          VALUES ($1, 'trial_ending_soon', NOW())
          ON CONFLICT (user_id, type) DO UPDATE SET created_at = NOW()
        `, [subscription.user_id]);
        
        console.log(`✅ Trial ending soon email sent for user ${subscription.user_id}`);
      } catch (error) {
        console.error(`❌ Failed to send trial ending soon email for user ${subscription.user_id}:`, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to check trials ending soon:', error);
  } finally {
    client.release();
  }
};

// Reset monthly usage limits
const resetMonthlyUsage = async () => {
  const client = await pool.connect();
  
  try {
    // Get the previous month
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const previousMonthYear = previousMonth.toISOString().slice(0, 7);
    
    // Archive old usage data
    await client.query(`
      INSERT INTO user_usage_archive (
        user_id, feature, usage_count, month_year, created_at, updated_at
      )
      SELECT user_id, feature, usage_count, month_year, created_at, updated_at
      FROM user_usage
      WHERE month_year = $1
    `, [previousMonthYear]);
    
    // Delete old usage data
    const deleteResult = await client.query(`
      DELETE FROM user_usage 
      WHERE month_year = $1
    `, [previousMonthYear]);
    
    console.log(`✅ Reset monthly usage limits. Deleted ${deleteResult.rowCount} old records`);
    
  } catch (error) {
    console.error('❌ Failed to reset monthly usage limits:', error);
  } finally {
    client.release();
  }
};

// Send trial ending soon email
const sendTrialEndingSoonEmail = async (userId) => {
  try {
    const emailService = await import('./emailService.js');
    
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
    
    await emailService.default.sendVerificationEmail(user.email, userId, user.display_name);
    
  } catch (error) {
    console.error('Failed to send trial ending soon email:', error);
  }
};

// Manual trigger functions for testing
export const triggerExpiredTrialsCheck = () => {
  console.log('🔍 Manually triggering expired trials check...');
  return checkExpiredTrials();
};

export const triggerUsageReset = () => {
  console.log('🔄 Manually triggering usage reset...');
  return resetMonthlyUsage();
};

export const triggerTrialsEndingSoonCheck = () => {
  console.log('⏰ Manually triggering trials ending soon check...');
  return checkTrialsEndingSoon();
};
