'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/providers/auth-provider';
import { AuthCard } from '@/components/auth/auth-card';
import { DashboardCard } from '@/components/dashboard/dashboard-card';

export function HomePage() {
  const t = useTranslations();
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="p-4 border-b border-border">
          <h1 className="text-xl font-bold text-center">{t('meta.title')}</h1>
        </header>
        
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-sm mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">{t('home.title')}</h2>
              <p className="text-muted-foreground">{t('home.subtitle')}</p>
            </div>
            
            <AuthCard />
            
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                {t('home.disclaimer')}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return <DashboardCard />;
}
