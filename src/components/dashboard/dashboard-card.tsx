'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createLocalizedPath } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/main-layout';
import { StreakMilestoneCard } from '@/components/streak/streak-milestone-card';
import { XpMilestoneCard } from '@/components/xp/xp-milestone-card';
import { HintsDisplay } from '@/components/ui/hints-display';
import { Target, Play, Flame, Star, Lightbulb, Trophy, Zap, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
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
  // Daily Quest fields
  daily_quest_completed: boolean;
  daily_quest_date: string;
  daily_quest_progress: number;
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

        // Load progress data (includes automatic streak update)
        console.log('📊 Loading user progress...');
        const response = await fetch('/api/user/progress');
        const data = await response.json();

        if (data.success) {
          console.log('✅ Progress loaded:', data.user_progress);
          setUserProgress(data.user_progress);
        } else {
          throw new Error(data.error || 'Failed to load progress');
        }
      } catch (err) {
        console.error('❌ Error loading user progress:', err);
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
          daily_quest_completed: false,
          daily_quest_date: new Date().toISOString().split('T')[0],
          daily_quest_progress: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    loadUserProgress();
  }, []);

  // Calculate today's progress using daily quest data from database
  const todayProgress = Math.min(((userProgress?.daily_quest_progress || 0) / 5) * 100, 100);
  const isDailyQuestCompleted = userProgress?.daily_quest_completed || false;

  return (
    <MainLayout>
      <div className="space-section">
          {/* Hero Quest Card - Tägliche Session starten */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="relative overflow-hidden shadow-lg">
              
              <CardHeader className="text-center relative z-10">
                <motion.div
                  animate={{ 
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="flex items-center justify-center mb-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </motion.div>
                <CardTitle className="text-heading-1 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  🎮 Tägliche Quest starten!
                </CardTitle>
                <p className="text-body text-muted-foreground">Sammle XP und erweitere dein Pflegewissen</p>
              </CardHeader>
              
              <CardContent className="space-card relative z-10">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="xl"
                    className="w-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group text-lg font-semibold"
                    onClick={() => router.push(createLocalizedPath(locale, '/quiz/random'))}
                  >
                    <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    ⚡ Sofort starten
                    <Sparkles className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
                  </Button>
                </motion.div>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full group"
                  onClick={() => router.push(createLocalizedPath(locale, '/learn'))}
                >
                  <Trophy className="w-4 h-4 mr-2 group-hover:text-yellow-500 transition-colors" />
                  📚 Themen wählen
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Progress Hub - Status Leiste */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Status-Hub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 md:gap-6">
                  {/* Serie (Flame) */}
                  <div className="text-center space-y-2">
                    <motion.div
                      animate={userProgress?.streak_days && userProgress.streak_days > 0 ? {
                        scale: [1, 1.1, 1],
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: userProgress?.streak_days && userProgress.streak_days > 0 ? Infinity : 0,
                        ease: "easeInOut"
                      }}
                      className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg"
                    >
                      <Flame className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {userProgress?.streak_days || 0}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      🔥 Serie
                    </Badge>
                  </div>

                  {/* XP (Star) */}
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {userProgress?.xp || 0}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      ⭐ XP
                    </Badge>
                  </div>

                  {/* Hints (Lightbulb) */}
                  <div className="text-center space-y-2">
                    <motion.div
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(34, 197, 94, 0.4)",
                          "0 0 0 10px rgba(34, 197, 94, 0)",
                        ]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg"
                    >
                      <Lightbulb className="w-6 h-6 text-white" />
                    </motion.div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    <HintsDisplay compact />
                  </div>
                    <Badge variant="secondary" className="text-xs">
                      💡 Hints
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Daily Quest Box - Heutiges Ziel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className={`transition-all duration-300 ${
              todayProgress >= 100 
                ? 'border-green-300 bg-green-50 dark:bg-green-900/20' 
                : ''
            }`}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  📅 Daily Quest
                </CardTitle>
                {isDailyQuestCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  >
                    <Badge className="ml-auto bg-success hover:bg-success/90">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Abgeschlossen!
                    </Badge>
                  </motion.div>
                )}
              </CardHeader>
              <CardContent className="space-card">
                <div className="flex items-center justify-between text-sm">
                  <span>5 Fragen richtig beantworten</span>
                  <span className="font-medium">{userProgress?.daily_quest_progress || 0}/5</span>
                </div>
                
                {/* Health Bar Style Progress */}
                <div className="relative">
                  <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${todayProgress}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        todayProgress >= 100
                          ? 'bg-green-500 shadow-lg'
                          : 'bg-primary'
                      }`}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white drop-shadow-lg">
                      {Math.round(todayProgress)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quest-Cards: Meilensteine */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <StreakMilestoneCard 
              currentStreak={userProgress?.streak_days || 0}
              longestStreak={userProgress?.longest_streak || 0}
              nextMilestone={userProgress?.next_streak_milestone || undefined}
              xpBoostActive={userProgress?.xp_boost_active || false}
              xpBoostMultiplier={userProgress?.xp_boost_multiplier || 1}
              xpBoostExpiry={userProgress?.xp_boost_expiry ? new Date(userProgress.xp_boost_expiry) : undefined}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <XpMilestoneCard 
              currentXp={userProgress?.xp || 0}
              nextMilestone={userProgress?.next_xp_milestone}
              lastMilestone={userProgress?.last_xp_milestone}
            />
          </motion.div>

          {/* Footer: Rechtliche Hinweise harmonisch integriert */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <Card>
              <CardContent className="p-4">
                <p className="text-caption text-center leading-relaxed">
                  {t('home.disclaimer')}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
    </MainLayout>
  );
}