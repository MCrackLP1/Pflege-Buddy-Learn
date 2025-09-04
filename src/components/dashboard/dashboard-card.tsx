'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createLocalizedPath } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MainLayout } from '@/components/layout/main-layout';
import { Flame, Star, Target, CheckCircle, XCircle } from 'lucide-react';

interface UserProgress {
  xp: number;
  streak_days: number;
  total_questions: number;
  accuracy: number;
  today_attempts: number;
}

interface RecentAnswer {
  id: string;
  isCorrect: boolean;
  topic: string;
  createdAt: string;
}

export function DashboardCard() {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [recentAnswers, setRecentAnswers] = useState<RecentAnswer[]>([]);
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

  // Load recent answers for carousel
  useEffect(() => {
    async function loadRecentAnswers() {
      try {
        const response = await fetch('/api/user/recent-answers');
        const data = await response.json();

        if (data.success) {
          setRecentAnswers(data.recent_answers);
        }
      } catch (err) {
        console.error('Error loading recent answers:', err);
        // Fallback to mock data
        setRecentAnswers([]);
      }
    }

    loadRecentAnswers();
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
            {/* 1-Tap-Start: Direkter Quiz-Start */}
            <Button
              onClick={() => router.push(createLocalizedPath(locale, '/quiz/random'))}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              size="lg"
            >
              🚀 {t('home.quickStart') || 'Weiterlernen'}
            </Button>

            {/* Alternative: Topic-Auswahl */}
            <Button
              onClick={() => router.push(createLocalizedPath(locale, '/learn'))}
              variant="outline"
              className="w-full"
              size="sm"
            >
              📚 Themen auswählen
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

        {/* Review Light - Recent Answers Carousel */}
        {recentAnswers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📚 Letzte Antworten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                {recentAnswers.map((answer, index) => (
                  <div
                    key={answer.id}
                    className="flex-shrink-0 w-32 bg-card border border-border rounded-lg p-3 text-center hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => router.push(createLocalizedPath(locale, '/review'))}
                  >
                    <div className={`text-lg mb-2 ${
                      answer.isCorrect ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {answer.isCorrect ? <CheckCircle className="h-6 w-6 mx-auto" /> : <XCircle className="h-6 w-6 mx-auto" />}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {answer.topic}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(answer.createdAt).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Tippe auf eine Antwort für Details
              </p>
            </CardContent>
          </Card>
        )}

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
