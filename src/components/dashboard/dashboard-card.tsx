'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createLocalizedPath } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/main-layout';
import { StreakMilestoneCard } from '@/components/streak/streak-milestone-card';
import { XpMilestoneCard } from '@/components/xp/xp-milestone-card';
import { HintsDisplay } from '@/components/ui/hints-display';
import { Target, Play, Flame, Star, Lightbulb, Trophy, Zap, CheckCircle, Sparkles } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
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
      {/* Gaming Background Overlay */}
      <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 -mx-4 -my-6 px-4 py-6">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 90, 180],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/4 right-1/4 w-48 h-48 bg-blue-200/20 dark:bg-blue-800/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              rotate: [180, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-green-200/20 dark:bg-green-800/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 space-y-6">
          {/* Hero Quest Card - Tägliche Session starten */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="relative overflow-hidden border-2 border-blue-200/50 dark:border-blue-700/50 bg-gradient-to-r from-blue-50 via-white to-green-50 dark:from-blue-900/20 dark:via-gray-800 dark:to-green-900/20 shadow-2xl shadow-blue-500/10">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-green-500/10 opacity-50" />
              
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
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  🎮 Tägliche Quest starten!
                </CardTitle>
                <p className="text-muted-foreground text-lg">Sammle XP und erweitere dein Pflegewissen</p>
              </CardHeader>
              
              <CardContent className="space-y-4 relative z-10">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    className="w-full h-14 text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                    onClick={() => router.push(createLocalizedPath(locale, '/quiz/random'))}
                  >
                    {/* Button Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Play className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                    ⚡ Sofort starten
                    <Sparkles className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                  </Button>
                </motion.div>
                
                <Button 
                  variant="outline" 
                  className="w-full h-12 border-2 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-lg font-semibold group"
                  onClick={() => router.push(createLocalizedPath(locale, '/learn'))}
                >
                  <Trophy className="w-5 h-5 mr-2 group-hover:text-yellow-500 transition-colors" />
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
            <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-2 border-gray-200/50 dark:border-gray-600/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Status-Hub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
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
                      <HintsDisplay />
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
            <Card className={`border-2 transition-all duration-300 ${
              todayProgress >= 100 
                ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' 
                : 'border-blue-200 dark:border-blue-700'
            }`}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  📅 Daily Quest
                </CardTitle>
                {todayProgress >= 100 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  >
                    <Badge className="ml-auto bg-green-500 hover:bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Abgeschlossen!
                    </Badge>
                  </motion.div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>5 Fragen heute beantworten</span>
                  <span className="font-medium">{userProgress?.today_attempts || 0}/5</span>
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
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg'
                          : 'bg-gradient-to-r from-blue-400 to-blue-600'
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
            <Card className="border-yellow-500/20 bg-gradient-to-r from-yellow-50/80 to-orange-50/80 dark:from-yellow-900/10 dark:to-orange-900/10">
              <CardContent className="p-4">
                <p className="text-xs text-center leading-relaxed text-muted-foreground">
                  {t('home.disclaimer')}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}