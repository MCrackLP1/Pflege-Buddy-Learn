'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Zap, Calendar, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import type { StreakMilestone } from '@/lib/db/schema';

// Simplified hardcoded milestones - no API dependency
const MILESTONES: StreakMilestone[] = [
  {
    id: 'milestone-3-days',
    daysRequired: 3,
    xpBoostMultiplier: '1.00',
    boostDurationHours: 24,
    rewardDescription: '3 Tage Serie erreicht! Du erhältst einen kleinen XP-Boost.',
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'milestone-5-days',
    daysRequired: 5,
    xpBoostMultiplier: '1.30',
    boostDurationHours: 24,
    rewardDescription: '5 Tage hintereinander! Du bekommst 30% mehr XP für einen Tag.',
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'milestone-7-days',
    daysRequired: 7,
    xpBoostMultiplier: '1.50',
    boostDurationHours: 48,
    rewardDescription: 'Eine Woche durchgehalten! Du bekommst 50% mehr XP für zwei Tage.',
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'milestone-14-days',
    daysRequired: 14,
    xpBoostMultiplier: '2.00',
    boostDurationHours: 72,
    rewardDescription: 'Zwei Wochen am Stück! Dein Lernengagement zahlt sich aus mit 2x XP.',
    isActive: true,
    createdAt: new Date(),
  },
];

interface StreakMilestoneCardProps {
  currentStreak: number;
  longestStreak: number;
  xpBoostActive: boolean;
  xpBoostMultiplier: number;
  xpBoostExpiry?: Date;
  nextMilestone?: StreakMilestone;
}

// Helper function to format XP boost display
function getXPBoostDisplay(multiplier: number | string): string {
  const value = typeof multiplier === 'string' ? parseFloat(multiplier) : multiplier;

  if (value === 1.0) {
    return 'XP Boost';
  } else if (value === 1.3) {
    return '30% mehr XP';
  } else if (value === 1.5) {
    return '50% mehr XP';
  } else if (value > 2.0) {
    return `${value}x XP`;
  } else {
    return `${value}x XP`;
  }
}

// Simple function to get next milestone from hardcoded data
function getNextMilestone(currentStreak: number): StreakMilestone {
  // Find the next milestone that the user hasn't reached yet
  const nextMilestone = MILESTONES.find(milestone =>
    milestone.daysRequired > currentStreak
  );

  // If no next milestone found, return the last one (user has reached all)
  return nextMilestone || MILESTONES[MILESTONES.length - 1];
}

export function StreakMilestoneCard({
  currentStreak,
  longestStreak,
  xpBoostActive,
  xpBoostMultiplier,
  xpBoostExpiry,
  nextMilestone,
}: StreakMilestoneCardProps) {
  // Use hardcoded milestones - ignore API data completely
  const effectiveNextMilestone = getNextMilestone(currentStreak);
  const t = useTranslations();
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Update countdown timer for XP boost
  useEffect(() => {
    if (!xpBoostActive || !xpBoostExpiry) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const diff = xpBoostExpiry.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [xpBoostActive, xpBoostExpiry]);

  const progressToNextMilestone = effectiveNextMilestone && effectiveNextMilestone.daysRequired > 0
    ? Math.min((currentStreak / effectiveNextMilestone.daysRequired) * 100, 100)
    : 0;

  return (
    <Card className="relative overflow-hidden border-2 border-orange-200/50 dark:border-orange-700/50 bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-800 dark:via-orange-900/10 dark:to-red-900/10 shadow-lg">
      {/* Quest Card Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 opacity-50" />

      {/* XP Boost Banner - Power-Up Style */}
      {xpBoostActive && (
        <div className="relative z-10 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 p-4">
          <div className="flex items-center gap-3 text-white">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Zap className="h-5 w-5" />
            </motion.div>
            <div>
              <div className="text-lg font-bold">
                ⚡ {getXPBoostDisplay(xpBoostMultiplier)} AKTIV!
              </div>
              {timeLeft && (
                <div className="text-sm opacity-90">
                  ⏱️ {timeLeft} verbleibend
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <CardHeader className="pb-3 relative z-10">
        <CardTitle className="flex items-center gap-3 text-xl">
          <motion.div
            animate={currentStreak > 0 ? {
              scale: [1, 1.1, 1],
            } : {}}
            transition={{
              duration: 2,
              repeat: currentStreak > 0 ? Infinity : 0,
              ease: "easeInOut"
            }}
            className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg"
          >
            <Flame className="h-5 w-5 text-white" />
          </motion.div>
          🔥 Streak-Quest
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        {/* Current Streak Display - Gaming Style */}
        <div className="text-center p-6 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl border-2 border-orange-300/50 dark:border-orange-700/50">
          <div className="text-5xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            {currentStreak}
          </div>
          <div className="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-2">
            🔥 Tage Serie
          </div>
          
          {/* Streak Visualization */}
          <div className="flex justify-center gap-1 mb-3">
            {[...Array(Math.min(currentStreak, 14))].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                className="w-2 h-4 bg-gradient-to-t from-orange-400 to-red-500 rounded-full shadow-sm"
              />
            ))}
            {currentStreak > 14 && (
              <div className="text-xs text-orange-600 dark:text-orange-400 self-end mb-1">
                +{currentStreak - 14}
              </div>
            )}
          </div>

          {longestStreak > currentStreak && (
            <div className="text-sm text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1">
              <Trophy className="w-3 h-3" />
              Rekord: {longestStreak} Tage
            </div>
          )}
        </div>

        {/* Next Milestone Quest */}
        <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border-2 border-yellow-200/50 dark:border-yellow-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-yellow-700 dark:text-yellow-300">
                🏆 Nächste Belohnung
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">
                {effectiveNextMilestone.daysRequired} Tage Ziel
              </div>
            </div>
            <div className="ml-auto">
              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1">
                {getXPBoostDisplay(effectiveNextMilestone.xpBoostMultiplier)}
              </Badge>
            </div>
          </div>

          {/* Quest Progress Bar - Energy Style */}
          <div className="relative mb-3">
            <div className="w-full h-4 bg-yellow-200 dark:bg-yellow-800 rounded-full overflow-hidden border border-yellow-300 dark:border-yellow-700 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressToNextMilestone, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 rounded-full relative"
              >
                {/* Progress Glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/30 rounded-full" />
                
                {/* Energy Pulse */}
                {progressToNextMilestone > 0 && (
                  <motion.div
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"
                  />
                )}
              </motion.div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white drop-shadow-lg">
                {Math.max(0, effectiveNextMilestone.daysRequired - currentStreak)} Tage
              </span>
            </div>
          </div>

          {/* Reward Description */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
            <div className="text-sm text-gray-700 dark:text-gray-200">
              {currentStreak === 0
                ? '🎯 Starte deine erste Serie! Tägliches Lernen bringt XP-Boosts.'
                : effectiveNextMilestone.rewardDescription
              }
            </div>
          </div>
        </div>

        {/* Champion Status - Legendary Achievement */}
        {currentStreak >= 30 && (
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300/50 dark:border-purple-700/50 rounded-xl"
          >
            <div className="flex items-center gap-3 text-purple-700 dark:text-purple-300">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg">👑 LEGEND STATUS</div>
                <div className="text-sm">Du bist ein wahrer Streak-Champion!</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Motivational Quest Message */}
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {currentStreak === 0 && '🎮 Bereit für deine erste Serie? Quest startet jetzt!'}
            {currentStreak > 0 && currentStreak < 3 && '🚀 Toller Start! Bleib dran und sammle mehr Power-Ups!'}
            {currentStreak >= 3 && currentStreak < 7 && '🔥 Fantastisch! Du bist auf dem Weg zur Meisterschaft!'}
            {currentStreak >= 7 && '⚡ Unglaubliche Serie! Du beherrschst das Spiel!'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
