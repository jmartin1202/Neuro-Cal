# 🚀 Quick Start: Analytics & Monitoring Setup

## **What's New in NeuroCal**

Your NeuroCal application now includes **enterprise-level analytics and monitoring** with:

- 📊 **Analytics Dashboard** - User metrics, event tracking, performance data
- 🧪 **A/B Testing Platform** - Test UI variations and measure impact
- 💬 **User Feedback System** - Collect ratings, comments, and bug reports
- ⚡ **Performance Monitoring** - Real-time Core Web Vitals and system health
- 🔍 **Multi-Tool Integration** - Google Analytics, Mixpanel, Hotjar, PostHog

## **🎯 Get Started in 3 Steps**

### **Step 1: Access Your Dashboard**

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   - Main Calendar: `http://localhost:8080/`
   - Analytics Dashboard: `http://localhost:8080/dashboard`

3. **Navigate between tabs:**
   - **Overview** - Key metrics and recent activity
   - **Analytics** - Detailed user and event analytics
   - **Performance** - Real-time performance monitoring
   - **Feedback** - User feedback collection
   - **A/B Testing** - Experiment management

### **Step 2: Configure Analytics Tools (Optional)**

To enable real analytics data collection, create a `.env.local` file:

```bash
# Copy from env.example
cp env.example .env.local

# Edit .env.local with your API keys
nano .env.local
```

**Required API Keys:**
- **Google Analytics**: Get from [analytics.google.com](https://analytics.google.com)
- **Mixpanel**: Get from [mixpanel.com](https://mixpanel.com)
- **Hotjar**: Get from [hotjar.com](https://hotjar.com)
- **PostHog**: Get from [posthog.com](https://posthog.com)

### **Step 3: Test the Features**

#### **📊 Analytics Dashboard**
- View mock data (1,247 users, 15,420 events)
- Switch between time ranges (7d, 30d, 90d)
- Explore performance metrics and user engagement

#### **🧪 A/B Testing**
- See active experiments (AI button placement, event forms)
- View variant performance and statistical significance
- Understand how experiments are assigned

#### **💬 User Feedback**
- Submit test feedback (ratings, comments, bug reports)
- Use quick feedback buttons
- View feedback history and status

#### **⚡ Performance Monitoring**
- Real-time Core Web Vitals tracking
- System resource monitoring
- Automatic performance alerts

## **🔧 Current Status**

### **✅ What's Working**
- **Dashboard Interface** - All tabs and components
- **Mock Data** - Realistic sample data for testing
- **Component Integration** - All analytics components connected
- **Navigation** - Easy switching between calendar and dashboard

### **⚠️ What Needs Setup**
- **Real API Keys** - Currently using placeholder values
- **Data Collection** - Events are tracked but not sent to external tools
- **Production Deployment** - Environment variables need configuration

## **📱 Navigation**

### **From Calendar to Dashboard**
- Click the **"Dashboard"** button in the top-right corner
- Or navigate directly to `/dashboard`

### **Dashboard Tabs**
1. **Overview** - High-level metrics and recent activity
2. **Analytics** - Detailed user behavior and event analysis
3. **Performance** - Real-time monitoring and alerts
4. **Feedback** - User feedback collection and management
5. **A/B Testing** - Experiment creation and results

## **🎨 Customization**

### **Add Your Own Metrics**
```typescript
// In any component
import { trackEvent } from '@/lib/analytics';

trackEvent('Custom Event', {
  category: 'user_action',
  value: 100,
  user_id: 'user123'
});
```

### **Create New Experiments**
```typescript
// In analytics.config.ts
experiments: {
  yourExperiment: {
    id: 'your_experiment',
    name: 'Your Experiment Name',
    variants: ['control', 'variant-a'],
    trafficSplit: [50, 50],
    goal: 'increase_conversion',
    metric: 'click_through_rate'
  }
}
```

## **🚨 Troubleshooting**

### **Build Errors**
```bash
# If you get import errors
npm install
npm run build
```

### **Missing Components**
```bash
# Check if all components are imported
grep -r "import.*from" src/components/
```

### **Analytics Not Working**
```bash
# Check browser console for errors
# Verify .env.local file exists
# Ensure API keys are correct
```

## **📈 Next Steps**

### **Immediate (Today)**
1. ✅ **Test the dashboard** - Navigate through all tabs
2. ✅ **Submit test feedback** - Try the feedback system
3. ✅ **View mock data** - Understand the metrics structure

### **This Week**
1. 🔑 **Get API keys** - Sign up for analytics tools
2. 📝 **Configure environment** - Set up .env.local
3. 🧪 **Create experiments** - Design A/B tests for your UI

### **Next Month**
1. 📊 **Real data collection** - Start tracking actual user behavior
2. 📈 **Performance optimization** - Use data to improve UX
3. 🎯 **User insights** - Analyze feedback and usage patterns

## **🎉 You're All Set!**

Your NeuroCal now has:
- **Professional analytics dashboard** 🎯
- **A/B testing capabilities** 🧪
- **User feedback collection** 💬
- **Performance monitoring** ⚡
- **Multi-tool integration** 🔗

**Start exploring at:** `http://localhost:8080/dashboard`

---

**Need help?** Check the full `ANALYTICS_SETUP.md` for detailed configuration instructions.
