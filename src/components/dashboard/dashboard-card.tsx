'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createLocalizedPath } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MainLayout } from '@/components/layout/main-layout';
import { Flame, Star, Target } from 'lucide-react';

interface UserProgress {
  xp: number;
  streak_days: number;
  total_questions: number;
  accuracy: number;
  today_attempts: number;
}

export function DashboardCard() {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [, setLoading] = useState(true);
  
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  
  // Load real user progress from API
  useEffect(() => {
    async function loadUserProgress() {
      try {
        setLoading(true);
        const response = await fetch('/api/user/progress');
        const data = await response.json();
        
        if (data.success) {
          setUserProgress(data.user_progress);
        } else {
          throw new Error(data.error || 'Failed to load progress');
        }
      } catch (err) {
        console.error('Error loading user progress:', err);
        // Fallback to mock data for demonstration
        setUserProgress({
          xp: 0,
          streak_days: 0,
          total_questions: 0,
          accuracy: 0,
          today_attempts: 0,
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadUserProgress();
  }, []);

  // Calculate today's progress (simple goal: 5 questions per day)
  const todayProgress = Math.min(((userProgress?.today_attempts || 0) / 5) * 100, 100);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Main CTA */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('home.title')}</CardTitle>
            <p className="text-muted-foreground">{t('home.subtitle')}</p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push(createLocalizedPath(locale, '/learn'))}
              className="w-full"
              size="lg"
            >
              {t('home.title')}
            </Button>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Streak */}
          <Card>
            <CardContent className="p-4 text-center space-y-2">
              <Flame className="h-8 w-8 mx-auto text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{userProgress?.streak_days || 0}</div>
                <div className="text-sm text-muted-foreground">{t('home.days')}</div>
              </div>
              <div className="text-xs font-medium">{t('home.currentStreak')}</div>
            </CardContent>
          </Card>

          {/* Total XP */}
          <Card>
            <CardContent className="p-4 text-center space-y-2">
              <Star className="h-8 w-8 mx-auto text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{(userProgress?.xp || 0).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">XP</div>
              </div>
              <div className="text-xs font-medium">{t('home.totalXP')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Goal */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              {t('home.todaysGoal')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={todayProgress} className="w-full" />
            <p className="text-xs text-muted-foreground mt-2">
              {todayProgress}% abgeschlossen
            </p>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="p-4">
            <p className="text-xs text-center leading-relaxed">
              {t('home.disclaimer')}
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
