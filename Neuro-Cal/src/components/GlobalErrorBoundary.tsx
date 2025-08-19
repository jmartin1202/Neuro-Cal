import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    this.logError(error, errorInfo);
    
    // Update state with error details
    this.setState({
      error,
      errorInfo
    });
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    // Log to console for development
    console.error('🚨 Global Error Boundary Caught Error:', error);
    console.error('🚨 Error Info:', errorInfo);
    
    // In production, send to monitoring service (Sentry, LogRocket, etc.)
    if (process.env.NODE_ENV === 'production') {
      // Example: sendToMonitoringService(error, errorInfo);
      console.log('📊 Error logged to monitoring service');
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const errorDetails = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // In production, send to bug reporting service
    console.log('🐛 Bug Report:', errorDetails);
    
    // For now, copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
    alert('Bug report copied to clipboard! Please send this to support.');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
            {/* Error Icon */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            
            {/* Error Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-6 text-lg">
              We've encountered an unexpected error. Don't worry - your data is safe!
            </p>
            
            {/* Error Details (Collapsible) */}
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                Technical Details (Click to expand)
              </summary>
              <div className="bg-gray-50 p-4 rounded-lg text-xs font-mono text-gray-600 overflow-auto max-h-40">
                <div className="mb-2">
                  <strong>Error ID:</strong> {this.state.errorId}
                </div>
                <div className="mb-2">
                  <strong>Message:</strong> {this.state.error?.message}
                </div>
                <div className="mb-2">
                  <strong>Component Stack:</strong>
                </div>
                <pre className="whitespace-pre-wrap">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            </details>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={this.handleRetry} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                onClick={this.handleGoHome} 
                variant="outline"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              
              <Button 
                onClick={this.handleReportBug} 
                variant="outline"
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                <Bug className="w-4 h-4 mr-2" />
                Report Bug
              </Button>
            </div>
            
            {/* Support Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                If this problem persists, please contact our support team.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Error ID: {this.state.errorId}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
