import React, { Component, ErrorInfo, ReactNode, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Eye, EyeOff, Shield, Zap } from 'lucide-react';

interface ComponentSafetyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  componentName: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  retryCount?: number;
  showErrorDetails?: boolean;
  autoRecover?: boolean;
  isolationLevel?: 'strict' | 'moderate' | 'loose';

}

interface ComponentSafetyWrapperState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryAttempts: number;
  showDetails: boolean;
  isRecovering: boolean;
  lastErrorTime: number;
}

class ComponentErrorBoundary extends Component<
  { 
    children: ReactNode; 
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    isolationLevel: 'strict' | 'moderate' | 'loose';
  },
  { hasError: boolean; error: Error | null; errorInfo: ErrorInfo | null }
> {
  constructor(props: { 
    children: ReactNode; 
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    isolationLevel: 'strict' | 'moderate' | 'loose';
  }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // Log error with isolation level context
    console.error(`🚨 Error in component (${this.props.isolationLevel} isolation):`, error);
    console.error(`🚨 Error Info:`, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // For strict isolation, don't render children at all
      if (this.props.isolationLevel === 'strict') {
        return null;
      }
      
      // For moderate/loose isolation, render children but mark as errored
      return this.props.children;
    }
    return this.props.children;
  }
}

export const ComponentSafetyWrapper: React.FC<ComponentSafetyWrapperProps> = ({
  children,
  fallback,
  componentName,
  onError,
  retryCount = 3,
  showErrorDetails = false,
  autoRecover = true,
  isolationLevel = 'moderate',

}) => {
  const [state, setState] = useState<ComponentSafetyWrapperState>({
    hasError: false,
    error: null,
    errorInfo: null,
    retryAttempts: 0,
    showDetails: false,
    isRecovering: false,
    lastErrorTime: 0
  });

  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error(`🚨 Error in ${componentName}:`, error);
    console.error(`🚨 Error Info:`, errorInfo);

    const now = Date.now();
    
    setState(prev => ({
      ...prev,
      hasError: true,
      error,
      errorInfo,
      retryAttempts: prev.retryAttempts + 1,
      lastErrorTime: now
    }));

    onError?.(error, errorInfo);

    // Auto-recovery for certain types of errors
    if (autoRecover && shouldAutoRecover(error)) {
      setTimeout(() => {
        console.log(`🔄 Auto-recovering ${componentName}...`);
        handleRetry();
      }, 2000);
    }
  };

  const shouldAutoRecover = (error: Error): boolean => {
    const autoRecoverableErrors = [
      'Network Error',
      'Failed to fetch',
      'Timeout',
      'Service Unavailable',
      'Temporary error'
    ];
    
    return autoRecoverableErrors.some(msg => 
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
  };

  const handleRetry = () => {
    if (state.retryAttempts < retryCount) {
      setState(prev => ({
        ...prev,
        hasError: false,
        error: null,
        errorInfo: null,
        isRecovering: true
      }));

      // Simulate recovery delay
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isRecovering: false
        }));
      }, 1000);
    } else {
      setState(prev => ({
        ...prev,
        hasError: true
      }));
    }
  };

  const handleForceRecovery = () => {
    console.log(`🔧 Force recovering ${componentName}...`);
    
    setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryAttempts: 0,
      showDetails: false,
      isRecovering: false,
      lastErrorTime: 0
    });
  };

  const toggleErrorDetails = () => {
    setState(prev => ({
      ...prev,
      showDetails: !prev.showDetails
    }));
  };

  // Reset error state when component unmounts/remounts
  useEffect(() => {
    return () => {
      if (state.hasError) {
        console.log(`🧹 Cleaning up error state for ${componentName}`);
      }
    };
  }, [componentName, state.hasError]);

  if (!state.hasError) {
    return (
      <ComponentErrorBoundary 
        onError={handleError}
        isolationLevel={isolationLevel}
      >
        {children}
      </ComponentErrorBoundary>
    );
  }

  if (state.retryAttempts >= retryCount) {
    // In production mode, just show fallback or nothing
    if (false) { // Dev Mode removed - always show fallback
      return fallback || null;
    }
    
    // In developer mode, show detailed error message
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h3 className="font-semibold text-red-900">
            {componentName} Unavailable
          </h3>
        </div>
        <p className="text-sm text-red-700 mb-3">
          This component is temporarily unavailable after multiple errors.
        </p>
        
        <div className="flex gap-2 mb-3">
          <Button
            onClick={handleForceRecovery}
            size="sm"
            className="bg-red-600 hover:bg-red-700"
          >
            <Zap className="h-4 w-4 mr-2" />
            Force Recovery
          </Button>
        </div>

        {fallback && (
          <div className="mt-3">
            {fallback}
          </div>
        )}
      </div>
    );
  }

  // In production mode, just show fallback or nothing
  if (!isDeveloperMode) {
    return fallback || null;
  }
  
  // In developer mode, show detailed error message
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center gap-3 mb-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <h3 className="font-semibold text-yellow-900">
          {componentName} Error
        </h3>
      </div>

      <p className="text-sm text-yellow-700 mb-3">
        Something went wrong with this component. You can try again or continue using other features.
      </p>

      <div className="flex items-center gap-3 mb-3">
        <Button
          onClick={handleRetry}
          size="sm"
          variant="outline"
          className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          disabled={state.isRecovering}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${state.isRecovering ? 'animate-spin' : ''}`} />
          {state.isRecovering ? 'Recovering...' : `Try Again (${state.retryAttempts}/${retryCount})`}
        </Button>

        <Button
          onClick={handleForceRecovery}
          size="sm"
          variant="outline"
          className="border-green-300 text-green-700 hover:bg-green-100"
        >
          <Shield className="h-4 w-4 mr-2" />
          Force Recovery
        </Button>

        {showErrorDetails && (
          <Button
            onClick={toggleErrorDetails}
            size="sm"
            variant="ghost"
            className="text-yellow-600 hover:text-yellow-800"
          >
            {state.showDetails ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Details
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Details
              </>
            )}
          </Button>
        )}
      </div>

      {state.showDetails && state.error && (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm text-yellow-600 hover:text-yellow-800 mb-2">
            Technical Details
          </summary>
          <div className="bg-yellow-100 p-3 rounded text-xs font-mono text-yellow-800 overflow-auto max-h-32">
            <div className="mb-1">
              <strong>Error:</strong> {state.error.message}
            </div>
            {state.errorInfo && (
              <div className="mb-1">
                <strong>Component Stack:</strong>
              </div>
            )}
            {state.errorInfo?.componentStack && (
              <pre className="whitespace-pre-wrap text-xs">
                {state.errorInfo.componentStack}
              </pre>
            )}
          </div>
        </details>
      )}

      {fallback && (
        <div className="mt-3 pt-3 border-t border-yellow-200">
          <p className="text-xs text-yellow-600 mb-2">Alternative content:</p>
          {fallback}
        </div>
      )}
    </div>
  );
};

export const withComponentSafety = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ComponentSafetyWrapperProps, 'children'>
) => {
  return (props: P) => (
    <ComponentSafetyWrapper {...options}>
      <Component {...props} />
    </ComponentSafetyWrapper>
  );
};

// Higher-order component for strict error isolation
export const withStrictIsolation = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return withComponentSafety(Component, {
    componentName: Component.displayName || Component.name || 'Unknown',
    isolationLevel: 'strict',
    autoRecover: false,
    retryCount: 1
  });
};

// Higher-order component for loose error isolation
export const withLooseIsolation = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return withComponentSafety(Component, {
    componentName: Component.displayName || Component.name || 'Unknown',
    isolationLevel: 'loose',
    autoRecover: true,
    retryCount: 5
  });
};
