#!/usr/bin/env node

/**
 * NeuroCal Subscription System Test Script
 * This script tests the basic functionality of the subscription system
 */

import dotenv from 'dotenv';
import { Pool } from 'pg';
import SubscriptionService from '../services/subscriptionService.js';

// Load environment variables
dotenv.config();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'joelmartin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'neurocal',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

// Test data
const TEST_USER_ID = 'test-user-' + Date.now();
const TEST_EMAIL = `test-${Date.now()}@example.com`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testDatabaseConnection() {
  logInfo('Testing database connection...');
  
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    logSuccess(`Database connected successfully. Current time: ${result.rows[0].current_time}`);
    client.release();
    return true;
  } catch (error) {
    logError(`Database connection failed: ${error.message}`);
    return false;
  }
}

async function testSubscriptionPlans() {
  logInfo('Testing subscription plans...');
  
  try {
    const result = await pool.query('SELECT * FROM subscription_plans ORDER BY price_monthly');
    
    if (result.rows.length === 0) {
      logError('No subscription plans found in database');
      return false;
    }
    
    logSuccess(`Found ${result.rows.length} subscription plans:`);
    result.rows.forEach(plan => {
      log(`  - ${plan.display_name}: $${plan.price_monthly}/month`, 'cyan');
    });
    
    return true;
  } catch (error) {
    logError(`Failed to fetch subscription plans: ${error.message}`);
    return false;
  }
}

async function testFreeTrialCreation() {
  logInfo('Testing free trial creation...');
  
  try {
    const subscription = await SubscriptionService.createFreeTrial(TEST_USER_ID, TEST_EMAIL);
    
    if (subscription && subscription.status === 'trial') {
      logSuccess(`Free trial created successfully for user ${TEST_USER_ID}`);
      log(`  Trial ends: ${subscription.trial_end_date}`, 'cyan');
      log(`  Stripe customer ID: ${subscription.stripe_customer_id}`, 'cyan');
      return subscription;
    } else {
      logError('Free trial creation failed - invalid subscription data');
      return null;
    }
  } catch (error) {
    logError(`Free trial creation failed: ${error.message}`);
    return null;
  }
}

async function testFeatureAccess() {
  logInfo('Testing feature access...');
  
  try {
    // Test basic feature access
    const hasBasicAI = await SubscriptionService.hasFeatureAccess(TEST_USER_ID, 'basic_ai');
    const hasAdvancedAI = await SubscriptionService.hasFeatureAccess(TEST_USER_ID, 'advanced_ai');
    
    log(`  Basic AI access: ${hasBasicAI ? '✅' : '❌'}`, hasBasicAI ? 'green' : 'red');
    log(`  Advanced AI access: ${hasAdvancedAI ? '✅' : '❌'}`, hasAdvancedAI ? 'green' : 'red');
    
    return hasBasicAI && hasAdvancedAI;
  } catch (error) {
    logError(`Feature access test failed: ${error.message}`);
    return false;
  }
}

async function testUsageTracking() {
  logInfo('Testing usage tracking...');
  
  try {
    // Track some usage
    await SubscriptionService.trackUsage(TEST_USER_ID, 'ai_suggestions', 5);
    await SubscriptionService.trackUsage(TEST_USER_ID, 'calendar_integrations', 2);
    
    // Get usage data
    const aiUsage = await SubscriptionService.getUserUsage(TEST_USER_ID, 'ai_suggestions');
    const calendarUsage = await SubscriptionService.getUserUsage(TEST_USER_ID, 'calendar_integrations');
    
    log(`  AI suggestions usage: ${aiUsage.usage_count}`, 'cyan');
    log(`  Calendar integrations usage: ${calendarUsage.usage_count}`, 'cyan');
    
    if (aiUsage.usage_count === 5 && calendarUsage.usage_count === 2) {
      logSuccess('Usage tracking working correctly');
      return true;
    } else {
      logError('Usage tracking not working correctly');
      return false;
    }
  } catch (error) {
    logError(`Usage tracking test failed: ${error.message}`);
    return false;
  }
}

async function testSubscriptionRetrieval() {
  logInfo('Testing subscription retrieval...');
  
  try {
    const subscription = await SubscriptionService.getUserSubscription(TEST_USER_ID);
    
    if (subscription) {
      logSuccess(`Subscription retrieved successfully`);
      log(`  Status: ${subscription.status}`, 'cyan');
      log(`  Plan: ${subscription.plan_name}`, 'cyan');
      return true;
    } else {
      logError('Failed to retrieve subscription');
      return false;
    }
  } catch (error) {
    logError(`Subscription retrieval test failed: ${error.message}`);
    return false;
  }
}

async function cleanupTestData() {
  logInfo('Cleaning up test data...');
  
  try {
    // Delete test subscription and usage data
    await pool.query('DELETE FROM user_usage WHERE user_id = $1', [TEST_USER_ID]);
    await pool.query('DELETE FROM user_subscriptions WHERE user_id = $1', [TEST_USER_ID]);
    
    logSuccess('Test data cleaned up successfully');
  } catch (error) {
    logWarning(`Cleanup failed: ${error.message}`);
  }
}

async function runTests() {
  log('🧪 NeuroCal Subscription System Test Suite', 'bright');
  log('============================================', 'bright');
  
  const results = {
    database: false,
    plans: false,
    trial: false,
    features: false,
    usage: false,
    retrieval: false
  };
  
  try {
    // Test database connection
    results.database = await testDatabaseConnection();
    if (!results.database) {
      logError('Cannot continue without database connection');
      return;
    }
    
    // Test subscription plans
    results.plans = await testSubscriptionPlans();
    
    // Test free trial creation
    results.trial = await testFreeTrialCreation();
    
    // Test feature access
    if (results.trial) {
      results.features = await testFeatureAccess();
      results.usage = await testUsageTracking();
      results.retrieval = await testSubscriptionRetrieval();
    }
    
  } catch (error) {
    logError(`Test suite failed with error: ${error.message}`);
  } finally {
    // Cleanup
    await cleanupTestData();
    
    // Summary
    log('\n📊 Test Results Summary', 'bright');
    log('======================', 'bright');
    
    Object.entries(results).forEach(([test, passed]) => {
      const status = passed ? 'PASS' : 'FAIL';
      const color = passed ? 'green' : 'red';
      log(`  ${test}: ${status}`, color);
    });
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    if (passedTests === totalTests) {
      log('\n🎉 All tests passed! Subscription system is working correctly.', 'green');
    } else {
      log(`\n⚠️  ${passedTests}/${totalTests} tests passed. Some issues were found.`, 'yellow');
    }
    
    // Close database connection
    await pool.end();
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    logError(`Test suite crashed: ${error.message}`);
    process.exit(1);
  });
}

export { runTests };
