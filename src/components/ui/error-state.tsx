'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  icon?: React.ReactNode;
}

export function ErrorState({ 
  title = 'Ein Fehler ist aufgetreten',
  message = 'Bitte versuchen Sie es erneut.',
  onRetry,
  showRetry = true,
  icon = <AlertCircle className="h-12 w-12 text-red-500" />
}: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-4 max-w-md mx-auto px-4">
        <div className="flex justify-center">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{message}</p>
        </div>
        {showRetry && onRetry && (
          <Button 
            onClick={onRetry}
            variant="outline"
            className="min-h-[44px]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Erneut versuchen
          </Button>
        )}
      </div>
    </div>
  );
}
