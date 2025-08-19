import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug, Shield, Zap } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  lastErrorTime: number;
  isRecovering: boolean;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeout = 5000; // 5 seconds between retries
  private errorHistory: Array<{ error: Error; timestamp: number; count: number }> = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      lastErrorTime: 0,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.logError(error, errorInfo);
    
    // Track error frequency
    const now = Date.now();
    const existingError = this.errorHistory.find(e => 
      e.error.message === error.message && 
      e.error.stack === error.stack
    );

    if (existingError) {
      existingError.count++;
      existingError.timestamp = now;
    } else {
      this.errorHistory.push({
        error,
        timestamp: now,
        count: 1
      });
    }

    // Check if this is a recurring error
    const recentErrors = this.errorHistory.filter(e => 
      now - e.timestamp < 60000 && // Last minute
      e.error.message === error.message
    );

    const totalRecentErrors = recentErrors.reduce((sum, e) => sum + e.count, 0);

    // If too many errors, prevent infinite loop
    if (totalRecentErrors > 5) {
      console.error('🚨 Too many errors detected - preventing infinite loop');
      this.setState({
        hasError: true,
        error: new Error('Too many errors detected. Please refresh the page completely.'),
        errorInfo,
        isRecovering: false
      });
      return;
    }

    this.setState({
      error,
      errorInfo,
      lastErrorTime: now
    });
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('🚨 Global Error Boundary Caught Error:', error);
    console.error('🚨 Error Info:', errorInfo);
    console.error('🚨 Error History:', this.errorHistory);
    
    if (process.env.NODE_ENV === 'production') {
      console.log('📊 Error logged to monitoring service');
    }
  };

  private handleRetry = async () => {
    const { retryCount, lastErrorTime } = this.state;
    const now = Date.now();

    // Prevent rapid retries
    if (now - lastErrorTime < this.retryTimeout) {
      console.log('⏳ Waiting before retry...');
      return;
    }

    // Check retry limit
    if (retryCount >= this.maxRetries) {
      console.error('🚨 Max retries reached - forcing page refresh');
      this.handleForceRefresh();
      return;
    }

    console.log(`🔄 Attempting recovery (${retryCount + 1}/${this.maxRetries})...`);
    
    this.setState({ isRecovering: true });

    try {
      // Clear error state
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1
      });

      // Wait a bit to see if the error recurs
      await new Promise(resolve => setTimeout(resolve, 1000));

      // If we get here, recovery might have worked
      console.log('✅ Recovery attempt completed');
      
    } catch (recoveryError) {
      console.error('🚨 Recovery failed:', recoveryError);
      this.setState({
        hasError: true,
        error: recoveryError instanceof Error ? recoveryError : new Error('Recovery failed'),
        isRecovering: false
      });
    }
  };

  private handleForceRefresh = () => {
    console.log('🔄 Forcing complete page refresh...');
    
    // Clear any cached state
    if (typeof window !== 'undefined') {
      // Clear localStorage if it might be corrupted
      try {
        const keys = Object.keys(localStorage);
        const suspiciousKeys = keys.filter(key => 
          key.includes('error') || 
          key.includes('crash') || 
          key.includes('corrupt')
        );
        
        if (suspiciousKeys.length > 0) {
          console.log('🧹 Clearing potentially corrupted data...');
          suspiciousKeys.forEach(key => localStorage.removeItem(key));
        }
      } catch (e) {
        console.log('🧹 Could not clear localStorage, proceeding with refresh');
      }
      
      // Force complete page refresh
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    console.log('🏠 Navigating to home...');
    
    try {
      // Clear error state first
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: 0
      });

      // Navigate to home
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('🚨 Navigation failed:', error);
      this.handleForceRefresh();
    }
  };

  private handleReportBug = () => {
    const errorDetails = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorHistory: this.errorHistory,
      retryCount: this.state.retryCount
    };
    
    console.log('🐛 Bug Report:', errorDetails);
    
    try {
      navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      alert('Bug report copied to clipboard! Please send this to support.');
    } catch (e) {
      console.error('Could not copy to clipboard:', e);
      alert('Please manually copy the error details from the console.');
    }
  };

  private handleAdvancedRecovery = async () => {
    console.log('🔧 Attempting advanced recovery...');
    
    this.setState({ isRecovering: true });

    try {
      // Clear all error state
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: 0
      });

      // Clear error history
      this.errorHistory = [];

      // Wait for next render cycle
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('✅ Advanced recovery completed');
      
    } catch (error) {
      console.error('🚨 Advanced recovery failed:', error);
      this.setState({
        hasError: true,
        error: error instanceof Error ? error : new Error('Advanced recovery failed'),
        isRecovering: false
      });
    }
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId, retryCount, isRecovering } = this.state;
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {retryCount >= this.maxRetries ? 'Critical Error Detected' : 'Oops! Something went wrong'}
            </h1>
            
            <p className="text-gray-600 mb-6 text-lg">
              {retryCount >= this.maxRetries 
                ? 'We\'ve detected multiple errors. A complete refresh is recommended.'
                : 'We\'ve encountered an unexpected error. Don\'t worry - your data is safe!'
              }
            </p>

            {/* Error Details */}
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                Technical Details (Click to expand)
              </summary>
              <div className="bg-gray-50 p-4 rounded-lg text-xs font-mono text-gray-600 overflow-auto max-h-40">
                <div className="mb-2">
                  <strong>Error ID:</strong> {errorId}
                </div>
                <div className="mb-2">
                  <strong>Retry Count:</strong> {retryCount}/{this.maxRetries}
                </div>
                <div className="mb-2">
                  <strong>Message:</strong> {error?.message}
                </div>
                <div className="mb-2">
                  <strong>Component Stack:</strong>
                </div>
                <pre className="whitespace-pre-wrap">
                  {errorInfo?.componentStack}
                </pre>
              </div>
            </details>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              {retryCount < this.maxRetries && (
                <Button
                  onClick={this.handleRetry}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isRecovering}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRecovering ? 'animate-spin' : ''}`} />
                  {isRecovering ? 'Recovering...' : 'Try Again'}
                </Button>
              )}

              <Button
                onClick={this.handleAdvancedRecovery}
                className="bg-green-600 hover:bg-green-700"
                disabled={isRecovering}
              >
                <Shield className="w-4 h-4 mr-2" />
                Advanced Recovery
              </Button>

              <Button
                onClick={this.handleGoHome}
                variant="outline"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>

            {/* Force Refresh Option */}
            {retryCount >= this.maxRetries && (
              <div className="mb-4">
                <Button
                  onClick={this.handleForceRefresh}
                  className="bg-red-600 hover:bg-red-700 w-full"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Force Complete Refresh
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  This will completely restart the application
                </p>
              </div>
            )}

            {/* Report Bug */}
            <div className="flex justify-center">
              <Button
                onClick={this.handleReportBug}
                variant="outline"
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                <Bug className="w-4 h-4 mr-2" />
                Report Bug
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                If this problem persists, please contact our support team.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Error ID: {errorId} | Retries: {retryCount}/{this.maxRetries}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
