'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn(
      'animate-spin border-2 border-primary border-t-transparent rounded-full',
      sizeClasses[size],
      className
    )} />
  );
}

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ message = 'Lädt...', size = 'md' }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-4">
        <LoadingSpinner size={size} className="mx-auto" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
