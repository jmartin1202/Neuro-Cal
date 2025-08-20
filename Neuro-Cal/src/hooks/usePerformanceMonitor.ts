import { useState, useEffect, useCallback, useRef } from 'react';
import { performanceConfig } from '@/config/environment';

interface PerformanceMetrics {
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
  };
  pagePerformance: {
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
  };
  resourcePerformance: {
    totalResources: number;
    slowResources: number;
    averageLoadTime: number;
    largestResource: string;
  };
  errors: {
    total: number;
    critical: number;
    warnings: number;
    lastError?: string;
  };
  system: {
    memoryUsage: number;
    cpuUsage: number;
    networkLatency: number;
    databaseResponseTime: number;
  };
  userInteractions: {
    totalClicks: number;
    totalScrolls: number;
    averageResponseTime: number;
    slowInteractions: number;
  };
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    memoryPressure: 'low' | 'medium' | 'high';
  };
}

interface PerformanceAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  metric: string;
  value: number;
  threshold: number;
}

/**
 * Enhanced performance monitoring hook
 * Collects real performance metrics and provides alerts
 */
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    coreWebVitals: { lcp: 0, fid: 0, cls: 0, ttfb: 0 },
    pagePerformance: { loadTime: 0, domContentLoaded: 0, firstPaint: 0, firstContentfulPaint: 0 },
    resourcePerformance: { totalResources: 0, slowResources: 0, averageLoadTime: 0, largestResource: '' },
    errors: { total: 0, critical: 0, warnings: 0 },
    system: { memoryUsage: 0, cpuUsage: 0, networkLatency: 0, databaseResponseTime: 0 },
    userInteractions: { totalClicks: 0, totalScrolls: 0, averageResponseTime: 0, slowInteractions: 0 },
    memory: { usedJSHeapSize: 0, totalJSHeapSize: 0, jsHeapSizeLimit: 0, memoryPressure: 'low' },
  });

  const [isMonitoring, setIsMonitoring] = useState(performanceConfig.enabled);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const observerRef = useRef<PerformanceObserver | null>(null);
  const clickCountRef = useRef(0);
  const scrollCountRef = useRef(0);
  const interactionTimesRef = useRef<number[]>([]);
  const lastInteractionTimeRef = useRef(performance.now());

  // Initialize performance monitoring
  useEffect(() => {
    if (!performanceConfig.enabled || isInitialized) return;

    initializePerformanceMonitoring();
    setIsInitialized(true);

    return () => {
      cleanupPerformanceMonitoring();
    };
  }, [performanceConfig.enabled, isInitialized]);

  // Initialize performance monitoring
  const initializePerformanceMonitoring = useCallback(() => {
    try {
      // Core Web Vitals
      if ('PerformanceObserver' in window) {
        // LCP (Largest Contentful Paint)
        observerRef.current = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            setMetrics(prev => ({
              ...prev,
              coreWebVitals: {
                ...prev.coreWebVitals,
                lcp: lastEntry.startTime / 1000, // Convert to seconds
              }
            }));
          }
        });
        observerRef.current.observe({ entryTypes: ['largest-contentful-paint'] });

        // FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const firstEntry = entries[0];
          if (firstEntry) {
            setMetrics(prev => ({
              ...prev,
              coreWebVitals: {
                ...prev.coreWebVitals,
                fid: firstEntry.processingStart - firstEntry.startTime,
              }
            }));
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          setMetrics(prev => ({
            ...prev,
            coreWebVitals: {
              ...prev.coreWebVitals,
              cls: clsValue,
            }
          }));
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      }

      // Page load performance
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', measurePagePerformance);
      } else {
        measurePagePerformance();
      }

      // User interaction tracking
      setupUserInteractionTracking();

      // Memory monitoring
      if ('memory' in performance) {
        startMemoryMonitoring();
      }

      // Network monitoring
      setupNetworkMonitoring();

      console.log('🚀 Performance monitoring initialized');
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  }, []);

  // Measure page performance
  const measurePagePerformance = useCallback(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      setMetrics(prev => ({
        ...prev,
        pagePerformance: {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: 0, // Will be updated by paint timing
          firstContentfulPaint: 0, // Will be updated by paint timing
        }
      }));
    }

    // Paint timing
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach(entry => {
      if (entry.name === 'first-paint') {
        setMetrics(prev => ({
          ...prev,
          pagePerformance: {
            ...prev.pagePerformance,
            firstPaint: entry.startTime,
          }
        }));
      } else if (entry.name === 'first-contentful-paint') {
        setMetrics(prev => ({
          ...prev,
          pagePerformance: {
            ...prev.pagePerformance,
            firstContentfulPaint: entry.startTime,
          }
        }));
      }
    });
  }, []);

  // Setup user interaction tracking
  const setupUserInteractionTracking = useCallback(() => {
    let clickTimeout: NodeJS.Timeout;
    let scrollTimeout: NodeJS.Timeout;

    const handleClick = () => {
      clickCountRef.current++;
      const now = performance.now();
      const responseTime = now - lastInteractionTimeRef.current;
      interactionTimesRef.current.push(responseTime);
      
      // Keep only last 100 interactions
      if (interactionTimesRef.current.length > 100) {
        interactionTimesRef.current.shift();
      }

      setMetrics(prev => ({
        ...prev,
        userInteractions: {
          ...prev.userInteractions,
          totalClicks: clickCountRef.current,
          averageResponseTime: interactionTimesRef.current.reduce((a, b) => a + b, 0) / interactionTimesRef.current.length,
        }
      }));

      lastInteractionTimeRef.current = now;
    };

    const handleScroll = () => {
      scrollCountRef.current++;
      setMetrics(prev => ({
        ...prev,
        userInteractions: {
          ...prev.userInteractions,
          totalScrolls: scrollCountRef.current,
        }
      }));
    };

    // Debounced event handlers
    const debouncedClick = () => {
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(handleClick, 0);
    };

    const debouncedScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    };

    document.addEventListener('click', debouncedClick, { passive: true });
    document.addEventListener('scroll', debouncedScroll, { passive: true });

    return () => {
      document.removeEventListener('click', debouncedClick);
      document.removeEventListener('scroll', debouncedScroll);
      clearTimeout(clickTimeout);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Start memory monitoring
  const startMemoryMonitoring = useCallback(() => {
    const updateMemoryMetrics = () => {
      try {
        const memory = (performance as any).memory;
        if (memory) {
          const usedJSHeapSize = memory.usedJSHeapSize / (1024 * 1024); // MB
          const totalJSHeapSize = memory.totalJSHeapSize / (1024 * 1024); // MB
          const jsHeapSizeLimit = memory.jsHeapSizeLimit / (1024 * 1024); // MB
          
          let memoryPressure: 'low' | 'medium' | 'high' = 'low';
          if (usedJSHeapSize / jsHeapSizeLimit > 0.8) {
            memoryPressure = 'high';
          } else if (usedJSHeapSize / jsHeapSizeLimit > 0.5) {
            memoryPressure = 'medium';
          }

          setMetrics(prev => ({
            ...prev,
            memory: {
              usedJSHeapSize,
              totalJSHeapSize,
              jsHeapSizeLimit,
              memoryPressure,
            }
          }));
        }
      } catch (error) {
        console.warn('Failed to update memory metrics:', error);
      }
    };

    updateMemoryMetrics();
    const interval = setInterval(updateMemoryMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Setup network monitoring
  const setupNetworkMonitoring = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const updateNetworkMetrics = () => {
          setMetrics(prev => ({
            ...prev,
            system: {
              ...prev.system,
              networkLatency: connection.rtt || 0,
            }
          }));
        };

        updateNetworkMetrics();
        connection.addEventListener('change', updateNetworkMetrics);
        
        return () => {
          connection.removeEventListener('change', updateNetworkMetrics);
        };
      }
    }
  }, []);

  // Cleanup performance monitoring
  const cleanupPerformanceMonitoring = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  // Check for performance alerts
  useEffect(() => {
    if (!isMonitoring) return;

    const checkAlerts = () => {
      const newAlerts: PerformanceAlert[] = [];

      // Core Web Vitals alerts
      if (metrics.coreWebVitals.lcp > performanceConfig.thresholds.slowRender) {
        newAlerts.push({
          id: `lcp-${Date.now()}`,
          type: 'warning',
          message: `LCP (${metrics.coreWebVitals.lcp.toFixed(1)}s) is above threshold`,
          timestamp: new Date(),
          severity: 'medium',
          metric: 'LCP',
          value: metrics.coreWebVitals.lcp,
          threshold: performanceConfig.thresholds.slowRender,
        });
      }

      if (metrics.coreWebVitals.fid > 100) {
        newAlerts.push({
          id: `fid-${Date.now()}`,
          type: 'warning',
          message: `FID (${metrics.coreWebVitals.fid.toFixed(0)}ms) indicates poor interactivity`,
          timestamp: new Date(),
          severity: 'medium',
          metric: 'FID',
          value: metrics.coreWebVitals.fid,
          threshold: 100,
        });
      }

      // Memory alerts
      if (metrics.memory.memoryPressure === 'high') {
        newAlerts.push({
          id: `memory-${Date.now()}`,
          type: 'error',
          message: `High memory usage: ${metrics.memory.usedJSHeapSize.toFixed(1)}MB`,
          timestamp: new Date(),
          severity: 'high',
          metric: 'Memory',
          value: metrics.memory.usedJSHeapSize,
          threshold: metrics.memory.jsHeapSizeLimit * 0.8,
        });
      }

      // User interaction alerts
      if (metrics.userInteractions.averageResponseTime > performanceConfig.thresholds.slowRender) {
        newAlerts.push({
          id: `interaction-${Date.now()}`,
          type: 'warning',
          message: `Slow user interactions: ${metrics.userInteractions.averageResponseTime.toFixed(0)}ms average`,
          timestamp: new Date(),
          severity: 'medium',
          metric: 'Interaction',
          value: metrics.userInteractions.averageResponseTime,
          threshold: performanceConfig.thresholds.slowRender,
        });
      }

      // Add new alerts
      if (newAlerts.length > 0) {
        setAlerts(prev => [...prev, ...newAlerts]);
      }
    };

    const interval = setInterval(checkAlerts, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [metrics, isMonitoring]);

  // Control functions
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    if (!isInitialized) {
      initializePerformanceMonitoring();
      setIsInitialized(true);
    }
  }, [isInitialized, initializePerformanceMonitoring]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Calculate performance score
  const getPerformanceScore = useCallback(() => {
    let score = 100;
    
    // Deduct points for poor performance
    if (metrics.coreWebVitals.lcp > performanceConfig.thresholds.slowRender) score -= 20;
    if (metrics.coreWebVitals.fid > 100) score -= 20;
    if (metrics.coreWebVitals.cls > 0.1) score -= 20;
    if (metrics.memory.memoryPressure === 'high') score -= 15;
    if (metrics.userInteractions.averageResponseTime > performanceConfig.thresholds.slowRender) score -= 15;
    
    return Math.max(score, 0);
  }, [metrics, performanceConfig.thresholds.slowRender]);

  return {
    metrics,
    isMonitoring,
    alerts,
    startMonitoring,
    stopMonitoring,
    clearAlerts,
    getPerformanceScore,
    isInitialized,
  };
};
