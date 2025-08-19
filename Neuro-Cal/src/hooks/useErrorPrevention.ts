import { useEffect, useRef, useCallback, useState } from 'react';

interface ErrorPreventionConfig {
  maxErrors: number;
  errorWindowMs: number;
  autoRecover: boolean;
  logErrors: boolean;
  preventUnhandledRejections: boolean;
  preventUnhandledErrors: boolean;
}

interface ErrorEvent {
  message: string;
  source: string;
  lineno?: number;
  colno?: number;
  error?: Error;
  timestamp: number;
  count: number;
}

const DEFAULT_CONFIG: ErrorPreventionConfig = {
  maxErrors: 5,
  errorWindowMs: 60000, // 1 minute
  autoRecover: true,
  logErrors: true,
  preventUnhandledRejections: true,
  preventUnhandledErrors: true
};

export const useErrorPrevention = (
  componentName: string,
  config: Partial<ErrorPreventionConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [isErrorState, setIsErrorState] = useState(false);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const errorHistory = useRef<ErrorEvent[]>([]);
  const errorHandlers = useRef<{
    unhandledRejection: ((event: PromiseRejectionEvent) => void) | null;
    unhandledError: ((event: ErrorEvent) => void) | null;
  }>({ unhandledRejection: null, unhandledError: null });

  // Track error frequency
  const trackError = useCallback((error: Error | string, source: string, details?: any) => {
    const now = Date.now();
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // Find existing error
    const existingError = errorHistory.current.find(e => 
      e.message === errorMessage && 
      e.source === source &&
      now - e.timestamp < finalConfig.errorWindowMs
    );

    if (existingError) {
      existingError.count++;
      existingError.timestamp = now;
    } else {
      errorHistory.current.push({
        message: errorMessage,
        source,
        error: typeof error === 'string' ? undefined : error,
        timestamp: now,
        count: 1
      });
    }

    // Check if we're in an error state
    const recentErrors = errorHistory.current.filter(e => 
      now - e.timestamp < finalConfig.errorWindowMs
    );

    const totalRecentErrors = recentErrors.reduce((sum, e) => sum + e.count, 0);

    if (totalRecentErrors > finalConfig.maxErrors) {
      setIsErrorState(true);
      
      if (finalConfig.logErrors) {
        console.error(`🚨 Too many errors in ${componentName} - entering error state`);
        console.error(`🚨 Error History:`, errorHistory.current);
      }
    }

    // Log error if enabled
    if (finalConfig.logErrors) {
      console.error(`🚨 Error in ${componentName} (${source}):`, error, details);
    }
  }, [componentName, finalConfig]);

  // Safe function wrapper
  const safeCall = useCallback(<T extends any[], R>(
    fn: (...args: T) => R,
    fallback: R,
    context: string
  ) => {
    try {
      return fn();
    } catch (error) {
      trackError(error instanceof Error ? error : String(error), context);
      return fallback;
    }
  }, [trackError]);

  // Safe async function wrapper
  const safeAsyncCall = useCallback(async <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    fallback: R,
    context: string
  ) => {
    try {
      return await fn();
    } catch (error) {
      trackError(error instanceof Error ? error : String(error), context);
      return fallback;
    }
  }, [trackError]);

  // Safe state setter
  const safeSetState = useCallback(<T>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    value: T | ((prev: T) => T),
    context: string
  ) => {
    try {
      setter(value);
    } catch (error) {
      trackError(error instanceof Error ? error : String(error), context);
    }
  }, [trackError]);

  // Safe effect cleanup
  const safeEffect = useCallback((
    effect: () => void | (() => void),
    deps: React.DependencyList = []
  ) => {
    useEffect(() => {
      try {
        const cleanup = effect();
        return () => {
          if (cleanup) {
            try {
              cleanup();
            } catch (error) {
              trackError(error instanceof Error ? error : String(error), 'effect-cleanup');
            }
          }
        };
      } catch (error) {
        trackError(error instanceof Error ? error : String(error), 'effect');
      }
    }, deps);
  }, [trackError]);

  // Recovery mechanism
  const attemptRecovery = useCallback(async () => {
    if (recoveryAttempts >= 3) {
      console.error(`🚨 Max recovery attempts reached for ${componentName}`);
      return false;
    }

    console.log(`🔄 Attempting recovery for ${componentName} (${recoveryAttempts + 1}/3)...`);
    
    setRecoveryAttempts(prev => prev + 1);
    
    try {
      // Clear recent errors
      const now = Date.now();
      errorHistory.current = errorHistory.current.filter(e => 
        now - e.timestamp > finalConfig.errorWindowMs
      );

      // Wait a bit to see if errors recur
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if we're still in error state
      const recentErrors = errorHistory.current.filter(e => 
        now - e.timestamp < finalConfig.errorWindowMs
      );

      if (recentErrors.length === 0) {
        setIsErrorState(false);
        console.log(`✅ Recovery successful for ${componentName}`);
        return true;
      } else {
        console.log(`⚠️ Recovery incomplete for ${componentName} - errors still present`);
        return false;
      }
    } catch (error) {
      console.error(`🚨 Recovery failed for ${componentName}:`, error);
      return false;
    }
  }, [componentName, recoveryAttempts, finalConfig.errorWindowMs]);

  // Force recovery
  const forceRecovery = useCallback(() => {
    console.log(`🔧 Force recovering ${componentName}...`);
    
    errorHistory.current = [];
    setIsErrorState(false);
    setRecoveryAttempts(0);
    
    console.log(`✅ Force recovery completed for ${componentName}`);
  }, [componentName]);

  // Prevent unhandled rejections
  useEffect(() => {
    if (!finalConfig.preventUnhandledRejections) return;

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      trackError(
        event.reason instanceof Error ? event.reason : String(event.reason),
        'unhandled-rejection'
      );
    };

    errorHandlers.current.unhandledRejection = handleUnhandledRejection;
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      if (errorHandlers.current.unhandledRejection) {
        window.removeEventListener('unhandledrejection', errorHandlers.current.unhandledRejection);
        errorHandlers.current.unhandledRejection = null;
      }
    };
  }, [finalConfig.preventUnhandledRejections, trackError]);

  // Prevent unhandled errors
  useEffect(() => {
    if (!finalConfig.preventUnhandledErrors) return;

    const handleUnhandledError = (event: ErrorEvent) => {
      event.preventDefault();
      trackError(
        event.error || new Error(event.message),
        'unhandled-error',
        { lineno: event.lineno, colno: event.colno }
      );
    };

    errorHandlers.current.unhandledError = handleUnhandledError;
    window.addEventListener('error', handleUnhandledError);

    return () => {
      if (errorHandlers.current.unhandledError) {
        window.removeEventListener('error', errorHandlers.current.unhandledError);
        errorHandlers.current.unhandledError = null;
      }
    };
  }, [finalConfig.preventUnhandledErrors, trackError]);

  // Auto-recovery
  useEffect(() => {
    if (!finalConfig.autoRecover || !isErrorState) return;

    const timer = setTimeout(() => {
      attemptRecovery();
    }, 5000); // Wait 5 seconds before auto-recovery

    return () => clearTimeout(timer);
  }, [isErrorState, finalConfig.autoRecover, attemptRecovery]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (errorHistory.current.length > 0) {
        console.log(`🧹 Cleaning up error prevention for ${componentName}`);
      }
    };
  }, [componentName]);

  return {
    // State
    isErrorState,
    recoveryAttempts,
    errorCount: errorHistory.current.length,
    
    // Actions
    trackError,
    safeCall,
    safeAsyncCall,
    safeSetState,
    safeEffect,
    attemptRecovery,
    forceRecovery,
    
    // Utilities
    getErrorHistory: () => [...errorHistory.current],
    clearErrors: () => {
      errorHistory.current = [];
      setIsErrorState(false);
    }
  };
};

// Hook for preventing specific types of errors
export const useNetworkErrorPrevention = (componentName: string) => {
  const [networkErrors, setNetworkErrors] = useState(0);
  const [isNetworkDown, setIsNetworkDown] = useState(false);

  const safeFetch = useCallback(async (url: string, options?: RequestInit) => {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network Error')) {
        setNetworkErrors(prev => prev + 1);
        setIsNetworkDown(true);
        
        // Auto-recovery after 10 seconds
        setTimeout(() => {
          setIsNetworkDown(false);
        }, 10000);
      }
      
      throw error;
    }
  }, []);

  return {
    networkErrors,
    isNetworkDown,
    safeFetch
  };
};

// Hook for preventing render errors
export const useRenderErrorPrevention = (componentName: string) => {
  const [renderErrors, setRenderErrors] = useState(0);
  const [lastRenderError, setLastRenderError] = useState<Error | null>(null);

  const safeRender = useCallback((renderFn: () => React.ReactNode, fallback: React.ReactNode) => {
    try {
      return renderFn();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      setRenderErrors(prev => prev + 1);
      setLastRenderError(errorObj);
      
      console.error(`🚨 Render error in ${componentName}:`, errorObj);
      
      return fallback;
    }
  }, [componentName]);

  return {
    renderErrors,
    lastRenderError,
    safeRender,
    clearRenderErrors: () => {
      setRenderErrors(0);
      setLastRenderError(null);
    }
  };
};
