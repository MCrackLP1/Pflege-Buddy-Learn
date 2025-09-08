'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Navigation } from './navigation';
import { Footer } from './footer';
import { CookieBanner } from '@/components/legal/cookie-banner';
import { ScriptManager } from '@/components/legal/script-manager';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { session } = useAuth();

  const handleCookieAccept = (preferences: Record<string, boolean>) => {
    console.log('Cookie preferences accepted:', preferences);
    // Here you would log the consent event to your backend
  };

  const handleCookieReject = () => {
    console.log('Only essential cookies accepted');
    // Here you would log the minimal consent event
  };

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <ScriptManager>
          <main className="flex-1 p-4 max-w-md mx-auto w-full">
            {children}
          </main>
        </ScriptManager>
        <Footer showFullFooter={false} />
        <CookieBanner onAccept={handleCookieAccept} onReject={handleCookieReject} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ScriptManager>
        <main className="flex-1 p-4 pb-20 max-w-md mx-auto w-full">
          {children}
        </main>
      </ScriptManager>
      <Navigation />
      <Footer />
      <CookieBanner onAccept={handleCookieAccept} onReject={handleCookieReject} />
    </div>
  );
}
