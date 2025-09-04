'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Navigation } from './navigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { session } = useAuth();

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 p-4 pb-20 max-w-md mx-auto w-full">
        {children}
      </main>
      <Navigation />
    </div>
  );
}
