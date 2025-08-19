import mixpanel from 'mixpanel-browser';
import hotjar from '@hotjar/browser';
import posthog from 'posthog-js';
import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals';

// Analytics Configuration
export interface AnalyticsConfig {
  googleAnalyticsId?: string;
  mixpanelToken?: string;
  hotjarId?: string;
  posthogKey?: string;
  sentryDsn?: string;
  environment: 'development' | 'staging' | 'production';
}

// Initialize analytics with configuration
export const initializeAnalytics = (config: AnalyticsConfig) => {
  // Google Analytics (GA4)
  if (config.googleAnalyticsId) {
    initializeGoogleAnalytics(config.googleAnalyticsId);
  }

  // Mixpanel
  if (config.mixpanelToken) {
    initializeMixpanel(config.mixpanelToken);
  }

  // Hotjar
  if (config.hotjarId) {
    initializeHotjar(config.hotjarId);
  }

  // PostHog
  if (config.posthogKey) {
    initializePostHog(config.posthogKey, config.environment);
  }

  // Performance Monitoring
  initializePerformanceMonitoring();

  console.log('Analytics initialized successfully');
};

// Google Analytics Setup
const initializeGoogleAnalytics = (measurementId: string) => {
  // Add GA4 script to head
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: (string | Date | Record<string, unknown>)[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', measurementId, {
    page_title: document.title,
    page_location: window.location.href,
  });

  // Track page views
  window.addEventListener('popstate', () => {
    gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href,
    });
  });
};

// Mixpanel Setup
const initializeMixpanel = (token: string) => {
  mixpanel.init(token, {
    debug: process.env.NODE_ENV === 'development',
    track_pageview: true,
    persistence: 'localStorage',
  });

  // Track page views
  mixpanel.track('Page View', {
    page: window.location.pathname,
    title: document.title,
    url: window.location.href,
  });
};

// Hotjar Setup
const initializeHotjar = (hotjarId: string) => {
  hotjar.init(parseInt(hotjarId), 6);
};

// PostHog Setup
const initializePostHog = (apiKey: string, environment: string) => {
  posthog.init(apiKey, {
    api_host: 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    },
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    disable_session_recording: environment === 'development',
  });
};

// Performance Monitoring
const initializePerformanceMonitoring = () => {
  // Core Web Vitals
  onCLS(console.log);
  onFCP(console.log);
  onLCP(console.log);
  onTTFB(console.log);

  // Custom performance metrics
  if ('performance' in window) {
    // Navigation timing
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        trackPerformanceMetric('page_load_time', navigation.loadEventEnd - navigation.loadEventStart);
        trackPerformanceMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
      }
    });

    // Resource timing
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          if (resourceEntry.initiatorType === 'img' || resourceEntry.initiatorType === 'script') {
            trackPerformanceMetric('resource_load_time', resourceEntry.duration);
          }
        }
      });
    });
    observer.observe({ entryTypes: ['resource'] });
  }
};

// Analytics Event Tracking
export const trackEvent = (
  eventName: string,
  properties?: Record<string, unknown>,
  userId?: string
) => {
  // Mixpanel
  if (mixpanel) {
    mixpanel.track(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      user_agent: navigator.userAgent,
    });
  }

  // PostHog
  if (posthog) {
    posthog.capture(eventName, {
      ...properties,
      $current_url: window.location.href,
      $user_agent: navigator.userAgent,
    });
  }

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'user_interaction',
      event_label: properties?.label || eventName,
      value: properties?.value,
    });
  }

  console.log('Event tracked:', eventName, properties);
};

// User Identification
export const identifyUser = (userId: string, userProperties?: Record<string, unknown>) => {
  // Mixpanel
  if (mixpanel) {
    mixpanel.identify(userId);
    if (userProperties) {
      mixpanel.people.set(userProperties);
    }
  }

  // PostHog
  if (posthog) {
    posthog.identify(userId, userProperties);
  }

  // Google Analytics
  if (window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      user_id: userId,
    });
  }
};

// Page View Tracking
export const trackPageView = (pageName: string, properties?: Record<string, unknown>) => {
  trackEvent('Page View', {
    page_name: pageName,
    page_url: window.location.href,
    page_title: document.title,
    ...properties,
  });
};

// Feature Usage Tracking
export const trackFeatureUsage = (featureName: string, action: string, properties?: Record<string, unknown>) => {
  trackEvent('Feature Usage', {
    feature: featureName,
    action,
    ...properties,
  });
};

// Error Tracking
export const trackError = (error: Error, context?: Record<string, unknown>) => {
  trackEvent('Error', {
    error_message: error.message,
    error_stack: error.stack,
    error_name: error.name,
    ...context,
  });
};

// Performance Metric Tracking
export const trackPerformanceMetric = (metricName: string, value: number, properties?: Record<string, unknown>) => {
  trackEvent('Performance Metric', {
    metric_name: metricName,
    metric_value: value,
    ...properties,
  });
};

// A/B Testing
export const getExperimentVariant = (experimentName: string): string => {
  // PostHog A/B testing
  if (posthog) {
    return posthog.getFeatureFlag(experimentName) || 'control';
  }
  return 'control';
};

// User Feedback
export const trackUserFeedback = (feedbackType: 'rating' | 'comment' | 'bug_report', feedback: string, rating?: number) => {
  trackEvent('User Feedback', {
    feedback_type: feedbackType,
    feedback_content: feedback,
    rating,
    timestamp: new Date().toISOString(),
  });
};

// Export for global use
declare global {
  interface Window {
    gtag: (...args: (string | Date | Record<string, unknown>)[]) => void;
    dataLayer: (string | Date | Record<string, unknown>)[][];
  }
}
