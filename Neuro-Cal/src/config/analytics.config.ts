export const analyticsConfig = {
  // Google Analytics (GA4)
  googleAnalytics: {
    measurementId: process.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX',
    enabled: process.env.VITE_GA_ENABLED === 'true',
  },

  // Mixpanel
  mixpanel: {
    token: process.env.VITE_MIXPANEL_TOKEN || 'your-mixpanel-token',
    enabled: process.env.VITE_MIXPANEL_ENABLED === 'true',
  },

  // Hotjar
  hotjar: {
    id: process.env.VITE_HOTJAR_ID || '1234567',
    enabled: process.env.VITE_HOTJAR_ENABLED === 'true',
  },

  // PostHog
  posthog: {
    key: process.env.VITE_POSTHOG_KEY || 'your-posthog-key',
    enabled: process.env.VITE_POSTHOG_ENABLED === 'true',
  },

  // Sentry (Error Tracking)
  sentry: {
    dsn: process.env.VITE_SENTRY_DSN || 'your-sentry-dsn',
    enabled: process.env.VITE_SENTRY_ENABLED === 'true',
    environment: process.env.NODE_ENV || 'development',
  },

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Feature Flags
  features: {
    analytics: process.env.VITE_ANALYTICS_ENABLED !== 'false',
    performanceMonitoring: process.env.VITE_PERFORMANCE_MONITORING_ENABLED !== 'false',
    userFeedback: process.env.VITE_USER_FEEDBACK_ENABLED !== 'false',
    abTesting: process.env.VITE_AB_TESTING_ENABLED !== 'false',
  },

  // Performance Monitoring
  performance: {
    // Core Web Vitals thresholds
    thresholds: {
      lcp: 2.5, // seconds
      fid: 100, // milliseconds
      cls: 0.1, // unitless
      ttfb: 600, // milliseconds
    },
    
    // Page load time thresholds
    pageLoad: {
      excellent: 1.5, // seconds
      good: 2.5, // seconds
      poor: 4.0, // seconds
    },
    
    // Resource load time thresholds
    resourceLoad: {
      excellent: 100, // milliseconds
      good: 200, // milliseconds
      poor: 500, // milliseconds
    },
  },

  // A/B Testing
  abTesting: {
    // Default traffic split
    defaultTrafficSplit: 50, // percentage
    
    // Minimum sample size for statistical significance
    minSampleSize: 100,
    
    // Confidence level for statistical tests
    confidenceLevel: 0.95,
    
    // Experiments
    experiments: {
      aiAssistantPlacement: {
        id: 'ai_assistant_placement',
        name: 'AI Assistant Button Placement',
        variants: ['control', 'floating-button', 'top-navbar'],
        trafficSplit: [50, 25, 25],
        goal: 'increase_ai_usage',
        metric: 'click_through_rate',
      },
      eventCreationFlow: {
        id: 'event_creation_flow',
        name: 'Event Creation Form',
        variants: ['detailed', 'quick', 'wizard'],
        trafficSplit: [33, 33, 34],
        goal: 'increase_event_creation',
        metric: 'form_completion_rate',
      },
      calendarView: {
        id: 'calendar_view',
        name: 'Calendar View Layout',
        variants: ['month', 'week', 'day'],
        trafficSplit: [40, 30, 30],
        goal: 'increase_calendar_engagement',
        metric: 'time_spent_on_calendar',
      },
    },
  },

  // User Feedback
  userFeedback: {
    // Feedback types
    types: ['rating', 'comment', 'bug_report', 'feature_request'],
    
    // Rating scale
    ratingScale: 5,
    
    // Bug report categories
    bugCategories: [
      'Event Creation',
      'Calendar Sync',
      'AI Assistant',
      'User Interface',
      'Performance',
      'Authentication',
      'Other',
    ],
    
    // Auto-response messages
    autoResponses: {
      rating: {
        5: 'Thank you for the excellent rating! We\'re glad you love NeuroCal!',
        4: 'Thank you for the great rating! We\'re working to make it even better.',
        3: 'Thank you for your feedback. We\'d love to hear how we can improve.',
        2: 'We\'re sorry you\'re not satisfied. Please let us know how we can help.',
        1: 'We\'re sorry for the poor experience. Our team will review this immediately.',
      },
      bug_report: 'Thank you for reporting this issue. Our team has been notified and will investigate.',
      feature_request: 'Thank you for the feature request! We\'ll add it to our roadmap for consideration.',
      comment: 'Thank you for your feedback! We appreciate you taking the time to share your thoughts.',
    },
  },

  // Error Tracking
  errorTracking: {
    // Error severity levels
    severity: ['low', 'medium', 'high', 'critical'],
    
    // Error categories
    categories: [
      'JavaScript Error',
      'Network Error',
      'API Error',
      'Authentication Error',
      'Validation Error',
      'Performance Error',
      'Other',
    ],
    
    // Error sampling rate (percentage of errors to track)
    samplingRate: 100,
    
    // Maximum errors per session
    maxErrorsPerSession: 50,
  },

  // Privacy & Compliance
  privacy: {
    // GDPR compliance
    gdpr: {
      enabled: process.env.VITE_GDPR_ENABLED === 'true',
      cookieConsent: true,
      dataRetention: 90, // days
    },
    
    // CCPA compliance
    ccpa: {
      enabled: process.env.VITE_CCPA_ENABLED === 'true',
      doNotTrack: true,
    },
    
    // Data anonymization
    anonymization: {
      enabled: true,
      ipAddresses: false,
      userAgents: true,
      personalData: true,
    },
  },
};

// Environment variable validation
export const validateAnalyticsConfig = () => {
  const requiredVars = [
    'VITE_GA_MEASUREMENT_ID',
    'VITE_MIXPANEL_TOKEN',
    'VITE_HOTJAR_ID',
    'VITE_POSTHOG_KEY',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('Missing analytics environment variables:', missingVars);
    console.warn('Some analytics features may not work properly');
  }

  return missingVars.length === 0;
};

// Helper function to check if analytics is enabled
export const isAnalyticsEnabled = () => {
  return analyticsConfig.features.analytics && analyticsConfig.environment === 'production';
};

// Helper function to get experiment variant
export const getExperimentVariant = (experimentId: string): string => {
  const experiment = analyticsConfig.abTesting.experiments[experimentId as keyof typeof analyticsConfig.abTesting.experiments];
  
  if (!experiment) {
    return 'control';
  }

  // Simple random assignment based on traffic split
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (let i = 0; i < experiment.variants.length; i++) {
    cumulative += experiment.trafficSplit[i];
    if (random <= cumulative) {
      return experiment.variants[i];
    }
  }
  
  return experiment.variants[0]; // fallback to first variant
};
