import { useEffect } from 'react';
import { initializeAnalytics } from '@/lib/analytics';
import { analyticsConfig, validateAnalyticsConfig } from '@/config/analytics.config';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  useEffect(() => {
    // Validate configuration
    const isValid = validateAnalyticsConfig();
    
    if (isValid) {
      // Initialize analytics with configuration
      initializeAnalytics({
        googleAnalyticsId: analyticsConfig.googleAnalytics.measurementId,
        mixpanelToken: analyticsConfig.mixpanel.token,
        hotjarId: analyticsConfig.hotjar.id,
        posthogKey: analyticsConfig.posthog.key,
        environment: analyticsConfig.environment,
      });
      
      console.log('✅ Analytics initialized successfully');
    } else {
      console.warn('⚠️ Analytics configuration incomplete - some features may not work');
    }
  }, []);

  return <>{children}</>;
};
