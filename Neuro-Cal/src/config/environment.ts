import { Environment } from '@/types';

/**
 * Environment configuration for the Neuro-Cal application
 * This file centralizes all environment variables and provides type safety
 */
export const config: Environment = {
  NODE_ENV: (import.meta.env.NODE_ENV as Environment['NODE_ENV']) || 'development',
  
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  
  // Analytics Configuration
  ANALYTICS_ENABLED: import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
  GA_TRACKING_ID: import.meta.env.VITE_GA_TRACKING_ID,
  
  // Payment Configuration
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  
  // Database Configuration
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  
  // Feature Flags
  AI_SUGGESTIONS_ENABLED: import.meta.env.VITE_AI_SUGGESTIONS_ENABLED === 'true',
  CRM_ENABLED: import.meta.env.VITE_CRM_ENABLED === 'true',
  SUBSCRIPTIONS_ENABLED: import.meta.env.VITE_SUBSCRIPTIONS_ENABLED === 'true',
  
  // Development Configuration
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
  
  // Performance Configuration
  ENABLE_PERFORMANCE_MONITORING: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
  PERFORMANCE_SAMPLE_RATE: parseFloat(import.meta.env.VITE_PERFORMANCE_SAMPLE_RATE || '0.1'),
  
  // Security Configuration
  ENABLE_CSRF_PROTECTION: import.meta.env.VITE_ENABLE_CSRF_PROTECTION === 'true',
  SESSION_TIMEOUT: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '3600000'), // 1 hour
  
  // Error Reporting
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  ENABLE_ERROR_REPORTING: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
  
  // Testing Configuration
  ENABLE_MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
  MOCK_API_DELAY: parseInt(import.meta.env.VITE_MOCK_API_DELAY || '1000'),
} as const;

/**
 * Feature flags configuration
 */
export const featureFlags = {
  aiSuggestions: config.AI_SUGGESTIONS_ENABLED,
  crm: config.CRM_ENABLED,
  analytics: config.ANALYTICS_ENABLED,
  subscriptions: config.SUBSCRIPTIONS_ENABLED,
  advancedCalendar: true, // Always enabled
  mobileApp: true, // Always enabled
  performanceMonitoring: config.ENABLE_PERFORMANCE_MONITORING,
  errorReporting: config.ENABLE_ERROR_REPORTING,
} as const;

/**
 * API configuration
 */
export const apiConfig = {
  baseUrl: config.API_URL,
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

/**
 * Analytics configuration
 */
export const analyticsConfig = {
  enabled: config.ANALYTICS_ENABLED,
  trackingId: config.GA_TRACKING_ID,
  sampleRate: config.PERFORMANCE_SAMPLE_RATE,
  debug: config.DEBUG_MODE,
} as const;

/**
 * Performance monitoring configuration
 */
export const performanceConfig = {
  enabled: config.ENABLE_PERFORMANCE_MONITORING,
  sampleRate: config.PERFORMANCE_SAMPLE_RATE,
  metrics: {
    componentRender: true,
    apiCalls: true,
    userInteractions: true,
    memoryUsage: true,
    networkRequests: true,
  },
  thresholds: {
    slowRender: 100, // ms
    slowApiCall: 2000, // ms
    memoryWarning: 50 * 1024 * 1024, // 50MB
  },
} as const;

/**
 * Error reporting configuration
 */
export const errorConfig = {
  enabled: config.ENABLE_ERROR_REPORTING,
  sentryDsn: config.SENTRY_DSN,
  logLevel: config.LOG_LEVEL,
  maxErrorsPerMinute: 10,
  ignoredErrors: [
    'ResizeObserver loop limit exceeded',
    'Script error.',
    'Network Error',
  ],
} as const;

/**
 * Development utilities
 */
export const devUtils = {
  isDevelopment: config.NODE_ENV === 'development',
  isProduction: config.NODE_ENV === 'production',
  isTest: config.NODE_ENV === 'test',
  debug: config.DEBUG_MODE,
  mockData: config.ENABLE_MOCK_DATA,
  mockApiDelay: config.MOCK_API_DELAY,
} as const;

/**
 * Validate environment configuration
 */
export const validateConfig = (): void => {
  const requiredFields: (keyof Environment)[] = [
    'API_URL',
    'NODE_ENV',
  ];

  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    console.warn('Missing required environment variables:', missingFields);
  }

  if (config.DEBUG_MODE) {
    console.log('Environment configuration:', config);
    console.log('Feature flags:', featureFlags);
  }
};

// Validate configuration on import
validateConfig();

export default config;
