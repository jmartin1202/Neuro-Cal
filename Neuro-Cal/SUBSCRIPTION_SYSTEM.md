# NeuroCal Subscription Management System

## Overview
This document outlines the complete subscription system for NeuroCal, implementing free trials, Pro subscriptions at $9.99/month, and comprehensive billing management using Stripe as the payment processor.

## System Architecture

### Backend Components
- **SubscriptionService**: Core business logic for subscription management
- **StripeWebhookHandler**: Processes Stripe webhook events
- **CronJobs**: Background tasks for trial expiry and usage reset
- **Billing Routes**: API endpoints for subscription operations
- **Feature Gating**: Middleware for controlling access to premium features

### Frontend Components
- **SubscriptionManagement**: Main subscription dashboard
- **FeatureGate**: Component for gating premium features
- **Usage Tracking**: Real-time usage monitoring

## Database Schema

### Tables
1. **subscription_plans**: Available subscription tiers and features
2. **user_subscriptions**: User subscription status and billing info
3. **user_usage**: Feature usage tracking for billing limits
4. **billing_history**: Payment history and invoice records

### Key Relationships
- Users have one active subscription at a time
- Subscriptions reference subscription plans
- Usage is tracked per feature per month
- Billing history links to subscriptions

## Subscription Tiers

### Free Trial (7 Days)
- **Price**: $0 for 7 days
- **Features**: Full Pro features during trial
- **Limits**: Up to 5 calendar integrations
- **Support**: Priority support during trial

### Basic Plan ($4.99/month)
- **Features**: Basic AI scheduling, email support
- **Limits**: 2 calendar integrations, 50 AI suggestions/month
- **Storage**: 1GB

### Pro Plan ($9.99/month)
- **Features**: Advanced AI, priority support, full analytics
- **Limits**: Unlimited calendar integrations, unlimited AI suggestions
- **Storage**: 10GB
- **Extras**: Team collaboration, data export, travel time calculations

## Implementation Guide

### 1. Database Setup
```bash
# Run the subscription migration
psql -d neurocal -f backend/scripts/subscription-migration.sql
```

### 2. Environment Configuration
```bash
# Copy the environment template
cp backend/env.subscription.example backend/.env

# Fill in your Stripe and database credentials
```

### 3. Stripe Setup
1. Create a Stripe account and get API keys
2. Create products and prices for Basic and Pro plans
3. Set up webhook endpoints for payment events
4. Configure webhook secret in environment variables

### 4. Backend Installation
```bash
cd backend
npm install
npm run dev
```

### 5. Frontend Integration
```tsx
// Wrap premium features with FeatureGate
import FeatureGate from './components/FeatureGate';

<FeatureGate feature="analytics">
  <AnalyticsDashboard />
</FeatureGate>

// Use the subscription management component
import SubscriptionManagement from './components/SubscriptionManagement';

<SubscriptionManagement />
```

## API Endpoints

### Billing Routes
- `GET /api/billing/subscription` - Get user subscription
- `POST /api/billing/create-setup-intent` - Create payment setup intent
- `POST /api/billing/convert-trial` - Convert trial to paid plan
- `POST /api/billing/cancel-subscription` - Cancel subscription
- `GET /api/billing/usage` - Get feature usage
- `GET /api/billing/history` - Get billing history

### Webhook Endpoint
- `POST /webhooks/stripe` - Stripe webhook handler

## Feature Gating

### Backend Middleware
```javascript
import { checkFeatureAccess } from '../middleware/auth.js';

// Apply to routes that require feature access
app.use('/api/ai/advanced', checkFeatureAccess('advanced_ai'));
```

### Frontend Components
```tsx
// Check feature access in components
const { hasAccess, loading } = useFeatureAccess('analytics');

if (!hasAccess) {
  return <UpgradePrompt feature="analytics" />;
}
```

## Usage Tracking

### Automatic Tracking
- Feature usage is automatically tracked via middleware
- Limits are enforced at the API level
- Usage resets monthly

### Manual Tracking
```javascript
// Track custom feature usage
await SubscriptionService.trackUsage(userId, 'custom_feature', 1);
```

## Cron Jobs

### Scheduled Tasks
- **Daily**: Check for expired trials
- **Monthly**: Reset usage limits
- **Hourly**: Check for trials ending soon

### Manual Triggers
```javascript
import { triggerExpiredTrialsCheck } from './services/cronJobs.js';

// Manually trigger tasks for testing
await triggerExpiredTrialsCheck();
```

## Testing

### Unit Tests
```bash
# Run subscription service tests
npm test -- --grep "SubscriptionService"
```

### Integration Tests
```bash
# Test billing API endpoints
npm test -- --grep "Billing API"
```

### Webhook Testing
```bash
# Use Stripe CLI for webhook testing
stripe listen --forward-to localhost:5001/webhooks/stripe
```

## Monitoring & Analytics

### Subscription Metrics
- Active trials count
- Conversion rates
- Monthly recurring revenue
- Churn analysis

### Usage Analytics
- Feature adoption rates
- Usage patterns
- Limit utilization

## Security Considerations

### PCI Compliance
- No credit card data stored locally
- All payment processing via Stripe
- Webhook signature verification

### Data Protection
- Sensitive data encryption
- Access control via JWT tokens
- Rate limiting on API endpoints

## Deployment

### Environment Variables
Ensure all required environment variables are set:
- Stripe API keys
- Database credentials
- JWT secrets
- Email service configuration

### Database Migration
Run the subscription migration script on your production database:
```bash
psql -d your_production_db -f subscription-migration.sql
```

### Webhook Configuration
Update Stripe webhook endpoints to point to your production domain:
```
https://yourdomain.com/webhooks/stripe
```

## Troubleshooting

### Common Issues

1. **Webhook Failures**
   - Check webhook secret configuration
   - Verify endpoint URL accessibility
   - Monitor webhook logs

2. **Payment Failures**
   - Check Stripe dashboard for payment status
   - Verify customer and subscription setup
   - Check payment method validity

3. **Feature Access Issues**
   - Verify subscription status
   - Check feature configuration
   - Review usage limits

### Debug Mode
Enable debug logging in development:
```javascript
// In subscription service
console.log('Subscription data:', subscription);
console.log('Feature access check:', feature, hasAccess);
```

## Support & Maintenance

### Regular Tasks
- Monitor webhook delivery
- Review failed payments
- Analyze conversion metrics
- Update feature configurations

### Updates
- Keep Stripe SDK updated
- Monitor Stripe API changes
- Review security best practices

## Future Enhancements

### Planned Features
- Annual billing discounts
- Team/enterprise plans
- Usage-based pricing
- Advanced analytics dashboard
- A/B testing for pricing

### Scalability
- Redis caching for performance
- Database query optimization
- Horizontal scaling support
- Microservice architecture

## Contributing

### Development Workflow
1. Create feature branch
2. Implement changes
3. Add tests
4. Update documentation
5. Submit pull request

### Code Standards
- Follow existing code style
- Add JSDoc comments
- Include error handling
- Write comprehensive tests

---

For additional support or questions, please refer to the main README or contact the development team.
