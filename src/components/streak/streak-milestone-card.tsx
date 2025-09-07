'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Zap, Calendar, Gift } from 'lucide-react';
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
    <Card className="relative overflow-hidden">
      {/* XP Boost Banner */}
      {xpBoostActive && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-yellow-500/30 p-3">
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">
              {getXPBoostDisplay(xpBoostMultiplier)} aktiv
            </span>
            {timeLeft && (
              <Badge variant="secondary" className="text-xs">
                {timeLeft} {t('streak.remaining')}
              </Badge>
            )}
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className="h-5 w-5 text-orange-500" />
          {t('streak.currentStreak')}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Streak Display */}
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {currentStreak}
          </div>
          <div className="text-sm text-muted-foreground">
            {t('streak.days')}
          </div>
          {longestStreak > currentStreak && (
            <div className="text-xs text-muted-foreground mt-1">
              {t('streak.longestStreak')}: {longestStreak} {t('streak.days')}
            </div>
          )}
        </div>

        {/* Next Milestone Progress */}
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>{t('streak.nextMilestone')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="font-medium">{effectiveNextMilestone.daysRequired} {t('streak.days')}</span>
              </div>
            </div>

            <Progress
              value={Math.min(progressToNextMilestone, 100)}
              className="h-2"
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {Math.max(0, effectiveNextMilestone.daysRequired - currentStreak)} {t('streak.daysToGo')}
              </span>
              <div className="flex items-center gap-1">
                <Gift className="h-3 w-3" />
                <span>{getXPBoostDisplay(effectiveNextMilestone.xpBoostMultiplier)}</span>
              </div>
            </div>

            {/* Milestone Reward Preview */}
            <div className="bg-secondary/50 rounded-lg p-3 text-xs">
              <div className="font-medium text-foreground mb-1">
                {t('streak.rewardPreview')}:
              </div>
              <div className="text-muted-foreground">
                {currentStreak === 0
                  ? 'Melde dich täglich an und sammle XP-Boosts für deine Lernserie!'
                  : effectiveNextMilestone.rewardDescription
                }
              </div>
            </div>
          </div>

        {/* Achievement Celebration */}
        {currentStreak >= 30 && (
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Trophy className="h-4 w-4" />
              <span className="text-sm font-medium">
                {t('streak.championStatus')}
              </span>
            </div>
          </div>
        )}

        {/* Motivational Message */}
        <div className="text-center text-sm text-muted-foreground">
          {currentStreak === 0 && 'Bereit für deine erste Serie? Starte jetzt!'}
          {currentStreak > 0 && currentStreak < 3 && t('streak.keepGoing')}
          {currentStreak >= 3 && currentStreak < 7 && t('streak.greatStart')}
          {currentStreak >= 7 && t('streak.amazingStreak')}
        </div>
      </CardContent>
    </Card>
  );
}
