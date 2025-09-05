'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createLocalizedPath } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MainLayout } from '@/components/layout/main-layout';
import { StreakMilestoneCard } from '@/components/streak/streak-milestone-card';
import { XpMilestoneCard } from '@/components/xp/xp-milestone-card';
import { HintsDisplay } from '@/components/ui/hints-display';
import { Target } from 'lucide-react';
import type { StreakMilestone, XpMilestone } from '@/lib/db/schema';

interface UserProgress {
  xp: number;
  streak_days: number;
  longest_streak: number;
  total_questions: number;
  accuracy: number;
  next_streak_milestone?: StreakMilestone;
  next_xp_milestone?: XpMilestone;
  last_xp_milestone?: XpMilestone;
  today_attempts: number;
  xp_boost_active: boolean;
  xp_boost_multiplier: number;
  xp_boost_expiry?: string;
  next_milestone?: StreakMilestone;
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
          longest_streak: 0,
          total_questions: 0,
          accuracy: 0,
          today_attempts: 0,
          xp_boost_active: false,
          xp_boost_multiplier: 1,
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
        {/* Main CTA - 1-Tap-Start */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('home.title')}</CardTitle>
            <p className="text-muted-foreground">{t('home.subtitle')}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full h-12 text-lg"
              onClick={() => router.push(createLocalizedPath(locale, '/quiz/random'))}
            >
              ⚡ {t('home.quickStart')}
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-10"
              onClick={() => router.push(createLocalizedPath(locale, '/learn'))}
            >
              📚 {t('home.selectTopics')}
            </Button>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('home.currentStreak')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProgress?.streak_days || 0}</div>
              <p className="text-xs text-muted-foreground">{t('home.days')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('home.totalXP')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProgress?.xp || 0}</div>
              <p className="text-xs text-muted-foreground">XP</p>
            </CardContent>
          </Card>
        </div>

        {/* Hints Display */}
        <HintsDisplay />

        {/* Streak Milestone */}
        <StreakMilestoneCard 
          currentStreak={userProgress?.streak_days || 0}
          longestStreak={userProgress?.longest_streak || 0}
          nextMilestone={userProgress?.next_streak_milestone}
          xpBoostActive={userProgress?.xp_boost_active || false}
          xpBoostMultiplier={userProgress?.xp_boost_multiplier || 1}
          xpBoostExpiry={userProgress?.xp_boost_expiry ? new Date(userProgress.xp_boost_expiry) : undefined}
        />

        {/* XP Milestone */}
        <XpMilestoneCard 
          currentXp={userProgress?.xp || 0}
          nextMilestone={userProgress?.next_xp_milestone}
          lastMilestone={userProgress?.last_xp_milestone}
        />

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