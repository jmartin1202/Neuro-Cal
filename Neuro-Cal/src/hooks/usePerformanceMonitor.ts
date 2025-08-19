import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  isSlow: boolean;
}

interface PerformanceThresholds {
  maxRenderTime: number; // milliseconds
  maxMemoryUsage: number; // MB
  slowRenderThreshold: number; // milliseconds
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  maxRenderTime: 1000, // 1 second
  maxMemoryUsage: 100, // 100 MB
  slowRenderThreshold: 500 // 500ms
};

export const usePerformanceMonitor = (
  componentName: string,
  thresholds: Partial<PerformanceThresholds> = {}
) => {
  const startTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const slowRenderCount = useRef<number>(0);
  const errorCount = useRef<number>(0);
  
  const finalThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };

  // Start performance measurement
  const startMeasurement = useCallback(() => {
    startTime.current = performance.now();
    renderCount.current++;
  }, []);

  // End performance measurement and analyze
  const endMeasurement = useCallback((): PerformanceMetrics => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    // Check if render is slow
    const isSlow = renderTime > finalThresholds.slowRenderThreshold;
    if (isSlow) {
      slowRenderCount.current++;
      console.warn(`🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }

    // Memory usage check (if available)
    let memoryUsage: number | undefined;
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
      
      if (memoryUsage > finalThresholds.maxMemoryUsage) {
        console.warn(`💾 High memory usage in ${componentName}: ${memoryUsage.toFixed(2)}MB`);
      }
    }

    // Log performance metrics
    if (renderCount.current % 10 === 0) { // Log every 10th render
      console.log(`📊 ${componentName} Performance:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        renderCount: renderCount.current,
        slowRenders: slowRenderCount.current,
        memoryUsage: memoryUsage ? `${memoryUsage.toFixed(2)}MB` : 'N/A',
        isSlow
      });
    }

    return {
      renderTime,
      memoryUsage,
      isSlow
    };
  }, [componentName, finalThresholds]);

  // Monitor for potential issues
  const checkForIssues = useCallback(() => {
    const issues: string[] = [];
    
    // Check render performance
    if (slowRenderCount.current > 5) {
      issues.push(`Multiple slow renders detected (${slowRenderCount.current})`);
    }
    
    // Check error rate
    if (errorCount.current > 3) {
      issues.push(`High error rate detected (${errorCount.current})`);
    }
    
    // Check memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / (1024 * 1024);
      if (memoryUsage > finalThresholds.maxMemoryUsage) {
        issues.push(`High memory usage: ${memoryUsage.toFixed(2)}MB`);
      }
    }
    
    if (issues.length > 0) {
      console.warn(`⚠️ Performance issues detected in ${componentName}:`, issues);
    }
    
    return issues;
  }, [componentName, finalThresholds]);

  // Report error
  const reportError = useCallback((error: Error) => {
    errorCount.current++;
    console.error(`🚨 Error in ${componentName}:`, error);
    
    // Check if we're hitting error thresholds
    if (errorCount.current > 5) {
      console.error(`🚨 High error rate in ${componentName}. Consider implementing error boundaries.`);
    }
  }, [componentName]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Final performance report
      if (renderCount.current > 0) {
        console.log(`📊 ${componentName} Final Performance Report:`, {
          totalRenders: renderCount.current,
          slowRenders: slowRenderCount.current,
          errors: errorCount.current,
          slowRenderPercentage: ((slowRenderCount.current / renderCount.current) * 100).toFixed(1) + '%'
        });
      }
    };
  }, [componentName]);

  // Periodic health check
  useEffect(() => {
    const interval = setInterval(() => {
      checkForIssues();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [checkForIssues]);

  return {
    startMeasurement,
    endMeasurement,
    reportError,
    checkForIssues,
    metrics: {
      renderCount: renderCount.current,
      slowRenderCount: slowRenderCount.current,
      errorCount: errorCount.current
    }
  };
};

// Hook for monitoring async operations
export const useAsyncPerformanceMonitor = (componentName: string) => {
  const asyncOperations = useRef<Map<string, number>>(new Map());
  const failedOperations = useRef<Map<string, number>>(new Map());

  const startAsyncOperation = useCallback((operationName: string) => {
    asyncOperations.current.set(operationName, performance.now());
  }, []);

  const endAsyncOperation = useCallback((operationName: string, success: boolean = true) => {
    const startTime = asyncOperations.current.get(operationName);
    if (startTime) {
      const duration = performance.now() - startTime;
      
      if (success) {
        console.log(`✅ ${componentName} - ${operationName} completed in ${duration.toFixed(2)}ms`);
      } else {
        const failCount = failedOperations.current.get(operationName) || 0;
        failedOperations.current.set(operationName, failCount + 1);
        console.error(`❌ ${componentName} - ${operationName} failed after ${duration.toFixed(2)}ms`);
      }
      
      asyncOperations.current.delete(operationName);
    }
  }, [componentName]);

  const getAsyncMetrics = useCallback(() => {
    const metrics: Record<string, any> = {};
    
    // Active operations
    asyncOperations.current.forEach((startTime, operationName) => {
      const duration = performance.now() - startTime;
      metrics[`${operationName}_active`] = `${duration.toFixed(2)}ms`;
    });
    
    // Failed operations
    failedOperations.current.forEach((count, operationName) => {
      metrics[`${operationName}_failures`] = count;
    });
    
    return metrics;
  }, []);

  return {
    startAsyncOperation,
    endAsyncOperation,
    getAsyncMetrics
  };
};
