'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  isActive: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CountdownTimer({
  duration,
  onTimeUp,
  isActive,
  className,
  size = 'md'
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isActive) return;

    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isActive, onTimeUp]);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const getProgressColor = () => {
    const progress = timeLeft / duration;
    if (progress > 0.5) return 'text-green-500';
    if (progress > 0.25) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-lg';
      case 'lg':
        return 'text-4xl font-bold';
      default:
        return 'text-2xl font-semibold';
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'flex items-center justify-center rounded-full bg-card border-2 p-4',
        getProgressColor(),
        getSizeClasses()
      )}>
        <span className="font-mono">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>
      {timeLeft <= 10 && (
        <div className="animate-pulse text-red-500 font-semibold">
          ⚠️
        </div>
      )}
    </div>
  );
}
