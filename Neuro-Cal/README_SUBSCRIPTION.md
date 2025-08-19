# 🚀 NeuroCal Subscription System - Quick Start

This guide will help you get the NeuroCal subscription system up and running in minutes.

## ✨ What's Included

- **Free Trial Management**: 7-day trials with automatic expiry
- **Subscription Plans**: Basic ($4.99) and Pro ($9.99) tiers
- **Feature Gating**: Control access to premium features
- **Usage Tracking**: Monitor feature usage and enforce limits
- **Stripe Integration**: Secure payment processing
- **Email Notifications**: Trial expiry and payment failure alerts
- **Admin Dashboard**: Subscription metrics and analytics

## 🚀 Quick Setup

### 1. Run the Setup Script
```bash
# Make the script executable and run it
chmod +x scripts/setup-subscription.sh
./scripts/setup-subscription.sh
```

### 2. Configure Environment Variables
```bash
cd backend
cp env.subscription.example .env
# Edit .env with your actual credentials
```

### 3. Set Up Stripe
1. Create a [Stripe account](https://stripe.com)
2. Get your API keys from the dashboard
3. Create products and prices for Basic and Pro plans
4. Set up webhook endpoints

### 4. Start the Backend
```bash
cd backend
npm run dev
```

### 5. Test the System
```bash
cd backend
node scripts/test-subscription.js
```

## 📁 File Structure

```
NeuroCal/
├── backend/
│   ├── services/
│   │   ├── subscriptionService.js      # Core subscription logic
│   │   ├── stripeWebhookHandler.js     # Stripe event processing
│   │   └── cronJobs.js                 # Background tasks
│   ├── routes/
│   │   └── billing.js                  # Billing API endpoints
│   ├── middleware/
│   │   └── auth.js                     # Authentication & feature gating
│   └── scripts/
│       ├── subscription-migration.sql  # Database schema
│       └── test-subscription.js        # Test suite
├── src/
│   └── components/
│       ├── SubscriptionManagement.tsx   # Subscription dashboard
│       └── FeatureGate.tsx             # Feature access control
└── scripts/
    └── setup-subscription.sh           # Automated setup
```

## 🔧 Configuration

### Required Environment Variables
```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BASIC_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...

# Database
DATABASE_URL=postgresql://...

# App
APP_URL=https://yourdomain.com
TRIAL_DURATION_DAYS=7
```

### Database Setup
```bash
# Run the migration
psql -d neurocal -f backend/scripts/subscription-migration.sql
```

## 💳 Subscription Plans

| Feature | Free Trial | Basic | Pro |
|---------|------------|-------|-----|
| **Price** | $0 (7 days) | $4.99/month | $9.99/month |
| **AI Suggestions** | Unlimited | 50/month | Unlimited |
| **Calendar Integrations** | 5 | 2 | Unlimited |
| **Analytics** | Full | Basic | Full |
| **Support** | Priority | Email | Priority |
| **Team Features** | ✅ | ❌ | ✅ |

## 🎯 Usage Examples

### Feature Gating
```tsx
import FeatureGate from './components/FeatureGate';

// Wrap premium features
<FeatureGate feature="analytics">
  <AnalyticsDashboard />
</FeatureGate>

// Check access programmatically
const { hasAccess } = useFeatureAccess('advanced_ai');
```

### Subscription Management
```tsx
import SubscriptionManagement from './components/SubscriptionManagement';

// Add to your dashboard
<SubscriptionManagement />
```

### Backend Middleware
```javascript
import { checkFeatureAccess } from './middleware/auth.js';

// Protect routes
app.use('/api/ai/advanced', checkFeatureAccess('advanced_ai'));
```

## 🔍 Testing

### Run the Test Suite
```bash
cd backend
node scripts/test-subscription.js
```

### Test Individual Components
```bash
# Test database connection
psql -d neurocal -c "SELECT * FROM subscription_plans;"

# Test webhook endpoint
curl -X POST http://localhost:5001/webhooks/stripe
```

## 📊 Monitoring

### Check Subscription Status
```bash
# View active subscriptions
psql -d neurocal -c "
  SELECT status, COUNT(*) 
  FROM user_subscriptions 
  GROUP BY status;
"

# View usage metrics
psql -d neurocal -c "
  SELECT feature, SUM(usage_count) 
  FROM user_usage 
  GROUP BY feature;
"
```

### Log Files
- Backend logs: `backend/logs/`
- Webhook events: Check Stripe dashboard
- Cron job logs: Check system logs

## 🚨 Troubleshooting

### Common Issues

1. **Webhook Failures**
   - Verify webhook secret in `.env`
   - Check endpoint accessibility
   - Monitor webhook delivery logs

2. **Database Connection**
   - Verify PostgreSQL is running
   - Check connection credentials
   - Ensure database exists

3. **Stripe Integration**
   - Verify API keys are correct
   - Check webhook endpoint configuration
   - Ensure products and prices exist

### Debug Mode
```javascript
// Enable detailed logging
console.log('Subscription data:', subscription);
console.log('Feature access:', feature, hasAccess);
```

## 📚 Additional Resources

- [Full Documentation](SUBSCRIPTION_SYSTEM.md)
- [Stripe Documentation](https://stripe.com/docs)
- [API Reference](SUBSCRIPTION_SYSTEM.md#api-endpoints)
- [Feature Gating Guide](SUBSCRIPTION_SYSTEM.md#feature-gating)

## 🤝 Support

- **Documentation**: Check `SUBSCRIPTION_SYSTEM.md`
- **Issues**: Create GitHub issue with detailed description
- **Questions**: Check the troubleshooting section above

## 🔄 Updates

Keep your system updated:
```bash
# Update dependencies
npm update

# Check for Stripe API changes
# Monitor webhook delivery
# Review security best practices
```

---

**Need help?** Start with the [setup script](scripts/setup-subscription.sh) and check the [full documentation](SUBSCRIPTION_SYSTEM.md) for detailed information.
