'use client';

import { useState, useCallback } from 'react';

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
}

export function useErrorBoundary() {
  const [error, setError] = useState<ErrorInfo | null>(null);

  const captureError = useCallback((error: Error, errorInfo?: { componentStack?: string }) => {
    const errorData: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
    };
    
    setError(errorData);
    
    // Log error for debugging
    console.error('Captured error:', error);
    console.error('Component stack:', errorInfo?.componentStack);
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
      console.error('Production error captured:', errorData);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    captureError,
    clearError,
    hasError: error !== null,
  };
}

// Error boundary component
interface ErrorFallbackProps {
  error: ErrorInfo;
  onRetry: () => void;
}

export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-6xl">⚠️</div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Ein Fehler ist aufgetreten</h2>
          <p className="text-muted-foreground mb-4">
            {error.message || 'Unknown error'}
          </p>
          <button 
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
        
        {process.env.NODE_ENV === 'development' && error.stack && (
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Entwickler-Details anzeigen
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
