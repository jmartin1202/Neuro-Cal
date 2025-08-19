# 📊 Analytics & Monitoring Setup Guide

## **Overview**

NeuroCal now includes a comprehensive analytics and monitoring system with the following tools:

- **Google Analytics 4** - Website traffic and user behavior
- **Mixpanel** - User journey and event tracking
- **Hotjar** - User session recordings and heatmaps
- **PostHog** - Product analytics and A/B testing
- **Performance Monitoring** - Core Web Vitals and system health
- **User Feedback System** - Ratings, comments, and bug reports
- **A/B Testing Platform** - UI variation testing
- **Error Tracking** - Application error monitoring

## **🚀 Quick Start**

### **1. Environment Variables**

Create a `.env.local` file in your project root:

```bash
# Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GA_ENABLED=true

# Mixpanel
VITE_MIXPANEL_TOKEN=your-mixpanel-token
VITE_MIXPANEL_ENABLED=true

# Hotjar
VITE_HOTJAR_ID=1234567
VITE_HOTJAR_ENABLED=true

# PostHog
VITE_POSTHOG_KEY=your-posthog-key
VITE_POSTHOG_ENABLED=true

# Sentry (Error Tracking)
VITE_SENTRY_DSN=your-sentry-dsn
VITE_SENTRY_ENABLED=true

# Feature Flags
VITE_ANALYTICS_ENABLED=true
VITE_PERFORMANCE_MONITORING_ENABLED=true
VITE_USER_FEEDBACK_ENABLED=true
VITE_AB_TESTING_ENABLED=true

# Privacy & Compliance
VITE_GDPR_ENABLED=true
VITE_CCPA_ENABLED=true
```

### **2. Initialize Analytics**

In your main application file, add:

```typescript
import { initializeAnalytics } from '@/lib/analytics';
import { analyticsConfig } from '@/config/analytics.config';

// Initialize analytics when app starts
initializeAnalytics({
  googleAnalyticsId: analyticsConfig.googleAnalytics.measurementId,
  mixpanelToken: analyticsConfig.mixpanel.token,
  hotjarId: analyticsConfig.hotjar.id,
  posthogKey: analyticsConfig.posthog.key,
  environment: analyticsConfig.environment,
});
```

## **🔧 Tool-Specific Setup**

### **Google Analytics 4**

1. **Create GA4 Property**
   - Go to [Google Analytics](https://analytics.google.com/)
   - Create new property
   - Copy Measurement ID (G-XXXXXXXXXX)

2. **Configure Events**
   - Set up custom events for calendar interactions
   - Track event creation, AI usage, calendar sync

3. **Enhanced Ecommerce** (Optional)
   - Track premium feature usage
   - Monitor subscription conversions

### **Mixpanel**

1. **Create Project**
   - Sign up at [Mixpanel](https://mixpanel.com/)
   - Create new project
   - Copy project token

2. **Key Events to Track**
   ```typescript
   // User registration
   trackEvent('User Registered', {
     source: 'signup_form',
     plan: 'free'
   });

   // Event creation
   trackEvent('Event Created', {
     event_type: 'meeting',
     duration: '1 hour',
     has_location: true
   });

   // AI assistant usage
   trackEvent('AI Assistant Used', {
     feature: 'event_creation',
     success: true,
     response_time: 1500
   });
   ```

### **Hotjar**

1. **Create Account**
   - Sign up at [Hotjar](https://hotjar.com/)
   - Create new site
   - Copy site ID

2. **Configure Recordings**
   - Set recording duration (default: 30 seconds)
   - Enable heatmaps for calendar interactions
   - Set up conversion funnels

3. **Privacy Settings**
   - Mask sensitive data (emails, names)
   - Respect Do Not Track headers
   - GDPR compliance settings

### **PostHog**

1. **Create Project**
   - Sign up at [PostHog](https://posthog.com/)
   - Create new project
   - Copy API key

2. **Feature Flags**
   ```typescript
   // Check feature flag
   const variant = getExperimentVariant('ai_assistant_placement');
   
   if (variant === 'floating-button') {
     // Show floating AI button
   } else {
     // Show sidebar AI button
   }
   ```

3. **A/B Testing**
   - Create experiments in PostHog dashboard
   - Set traffic splits
   - Define success metrics

## **📈 Performance Monitoring**

### **Core Web Vitals**

The system automatically tracks:

- **LCP (Largest Contentful Paint)** - Target: ≤2.5s
- **FID (First Input Delay)** - Target: ≤100ms
- **CLS (Cumulative Layout Shift)** - Target: ≤0.1
- **TTFB (Time to First Byte)** - Target: ≤600ms

### **Custom Metrics**

```typescript
// Track custom performance metrics
trackPerformanceMetric('calendar_render_time', 150);
trackPerformanceMetric('event_creation_duration', 2000);
trackPerformanceMetric('ai_response_time', 1200);
```

### **Real-time Alerts**

The system automatically generates alerts for:
- Performance degradation
- High resource usage
- Error spikes
- Core Web Vitals violations

## **🧪 A/B Testing**

### **Creating Experiments**

1. **Define Hypothesis**
   - "Moving AI assistant to floating button will increase usage by 20%"

2. **Set Up Variants**
   - Control: Current sidebar placement
   - Variant A: Floating button
   - Variant B: Top navigation

3. **Configure Traffic Split**
   - Control: 50%
   - Variant A: 25%
   - Variant B: 25%

4. **Define Success Metrics**
   - Primary: Click-through rate
   - Secondary: Time to first interaction
   - Guard: Page load time

### **Statistical Analysis**

The system provides:
- Conversion rate comparison
- Statistical significance testing
- Confidence intervals
- Winner determination

## **💬 User Feedback System**

### **Feedback Types**

1. **Ratings & Reviews**
   - 5-star rating system
   - Optional comment field
   - Auto-response messages

2. **Bug Reports**
   - Categorized by feature
   - Severity levels
   - Reproduction steps

3. **Feature Requests**
   - User suggestions
   - Priority voting
   - Roadmap integration

### **Quick Feedback**

Users can quickly submit feedback using:
- Thumbs up/down buttons
- One-click ratings
- Pre-filled templates

## **🚨 Error Tracking**

### **Automatic Error Capture**

```typescript
// Errors are automatically tracked
try {
  // Your code
} catch (error) {
  // Error is automatically sent to analytics
  trackError(error, {
    context: 'event_creation',
    user_id: currentUser.id
  });
}
```

### **Error Categories**

- JavaScript Errors
- Network Errors
- API Errors
- Authentication Errors
- Validation Errors
- Performance Errors

## **📊 Analytics Dashboard**

### **Key Metrics**

- **Users**: Total, active, new, retention
- **Events**: Total, weekly, monthly, per user
- **Performance**: Load times, Core Web Vitals, errors
- **Engagement**: Page views, session duration, bounce rate

### **Real-time Monitoring**

- Live performance metrics
- Active alerts
- System health status
- Resource usage

## **🔒 Privacy & Compliance**

### **GDPR Compliance**

- Cookie consent management
- Data retention policies
- Right to be forgotten
- Data portability

### **CCPA Compliance**

- Do Not Track support
- Opt-out mechanisms
- Data disclosure
- Consumer rights

### **Data Anonymization**

- IP address masking
- User agent anonymization
- Personal data protection
- Aggregated reporting

## **📱 Integration Examples**

### **Calendar Component**

```typescript
import { trackEvent, trackFeatureUsage } from '@/lib/analytics';

const CalendarGrid = () => {
  const handleDateClick = (date: Date) => {
    // Track user interaction
    trackEvent('Date Clicked', {
      date: date.toISOString(),
      view: 'month'
    });
    
    // Track feature usage
    trackFeatureUsage('Calendar', 'date_selection', {
      date: date.toISOString()
    });
  };
  
  // ... rest of component
};
```

### **AI Assistant**

```typescript
import { trackEvent, getExperimentVariant } from '@/lib/analytics';

const AIPanel = () => {
  const variant = getExperimentVariant('ai_assistant_placement');
  
  const handleAIRequest = async (prompt: string) => {
    const startTime = Date.now();
    
    try {
      const response = await aiService.process(prompt);
      
      // Track successful AI interaction
      trackEvent('AI Request Successful', {
        prompt_length: prompt.length,
        response_time: Date.now() - startTime,
        variant: variant
      });
      
    } catch (error) {
      // Track AI errors
      trackEvent('AI Request Failed', {
        error: error.message,
        prompt_length: prompt.length,
        variant: variant
      });
    }
  };
  
  // ... rest of component
};
```

## **🚀 Deployment Checklist**

### **Production Setup**

- [ ] All environment variables configured
- [ ] Analytics tools enabled
- [ ] Privacy policies updated
- [ ] Cookie consent implemented
- [ ] Error tracking active
- [ ] Performance monitoring running
- [ ] A/B testing configured
- [ ] User feedback system active

### **Testing**

- [ ] Analytics events firing correctly
- [ ] Performance metrics being collected
- [ ] Error tracking working
- [ ] A/B tests assigning variants
- [ ] Feedback forms submitting
- [ ] Privacy controls functioning

## **📚 Additional Resources**

### **Documentation**

- [Google Analytics 4](https://developers.google.com/analytics/devguides/collection/ga4)
- [Mixpanel Documentation](https://developer.mixpanel.com/)
- [Hotjar Help Center](https://help.hotjar.com/)
- [PostHog Docs](https://posthog.com/docs)
- [Web Vitals](https://web.dev/vitals/)

### **Best Practices**

- **Data Quality**: Validate events before sending
- **Performance**: Use analytics sparingly in critical paths
- **Privacy**: Always respect user preferences
- **Testing**: Test analytics in development environment
- **Monitoring**: Set up alerts for data anomalies

## **🎯 Next Steps**

1. **Configure your analytics tools** with the provided setup
2. **Test the integration** in development
3. **Set up dashboards** for key metrics
4. **Create A/B tests** for UI improvements
5. **Monitor performance** and user feedback
6. **Iterate and optimize** based on data

Your NeuroCal application now has enterprise-level analytics and monitoring capabilities! 🚀✨
