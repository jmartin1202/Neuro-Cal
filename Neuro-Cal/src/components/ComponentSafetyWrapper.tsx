import React, { Component, ErrorInfo, ReactNode, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface ComponentSafetyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  componentName: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  retryCount?: number;
  showErrorDetails?: boolean;
}

interface ComponentSafetyWrapperState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryAttempts: number;
  showDetails: boolean;
}

// Class-based error boundary for the wrapper
class ComponentErrorBoundary extends Component<
  { children: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void },
  { hasError: boolean; error: Error | null; errorInfo: ErrorInfo | null }
> {
  constructor(props: { children: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
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
  showErrorDetails = false
}) => {
  const [state, setState] = useState<ComponentSafetyWrapperState>({
    hasError: false,
    error: null,
    errorInfo: null,
    retryAttempts: 0,
    showDetails: false
  });

  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error(`🚨 Error in ${componentName}:`, error);
    console.error(`🚨 Error Info:`, errorInfo);
    
    setState(prev => ({
      ...prev,
      hasError: true,
      error,
      errorInfo,
      retryAttempts: prev.retryAttempts + 1
    }));
    
    onError?.(error, errorInfo);
  };

  const handleRetry = () => {
    if (state.retryAttempts < retryCount) {
      setState(prev => ({
        ...prev,
        hasError: false,
        error: null,
        errorInfo: null
      }));
    } else {
      // Max retries reached, show permanent fallback
      setState(prev => ({
        ...prev,
        hasError: true
      }));
    }
  };

  const toggleErrorDetails = () => {
    setState(prev => ({
      ...prev,
      showDetails: !prev.showDetails
    }));
  };

  // If no error, render children normally
  if (!state.hasError) {
    return (
      <ComponentErrorBoundary onError={handleError}>
        {children}
      </ComponentErrorBoundary>
    );
  }

  // If max retries reached, show permanent fallback
  if (state.retryAttempts >= retryCount) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h3 className="font-semibold text-red-900">
            {componentName} Unavailable
          </h3>
        </div>
        <p className="text-sm text-red-700 mb-3">
          This component is temporarily unavailable. Please try again later.
        </p>
        {fallback && (
          <div className="mt-3">
            {fallback}
          </div>
        )}
      </div>
    );
  }

  // Show error with retry option
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
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again ({state.retryAttempts}/{retryCount})
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

// Higher-order component for easier usage
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
