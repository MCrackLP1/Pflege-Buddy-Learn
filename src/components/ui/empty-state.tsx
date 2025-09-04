'use client';

import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ 
  title, 
  description, 
  icon = <div className="text-6xl">📚</div>,
  action 
}: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-4 max-w-md mx-auto px-4">
        <div className="flex justify-center">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          {description && (
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          )}
        </div>
        {action && (
          <Button 
            onClick={action.onClick}
            className="min-h-[44px]"
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
