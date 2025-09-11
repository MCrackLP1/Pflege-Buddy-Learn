'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Lightbulb } from 'lucide-react';
import type { XpMilestone } from '@/lib/db/schema';

interface XpMilestoneCardProps {
  currentXp: number;
  nextMilestone?: XpMilestone;
  lastMilestone?: XpMilestone;
}

export function XpMilestoneCard({
  currentXp,
  nextMilestone,
  lastMilestone,
}: XpMilestoneCardProps) {
  const t = useTranslations();

  // Fallback milestones for robust display
  const fallbackMilestones = [
    { xpRequired: 100, freeHintsReward: 5, rewardDescription: '100 XP erreicht! Du erhältst 5 gratis Hints für deine Lernfortschritte.' },
    { xpRequired: 500, freeHintsReward: 5, rewardDescription: '500 XP erreicht! Du erhältst 5 gratis Hints als Belohnung.' },
    { xpRequired: 1000, freeHintsReward: 5, rewardDescription: '1000 XP erreicht! Du erhältst 5 gratis Hints - du bist auf dem richtigen Weg!' },
    { xpRequired: 2500, freeHintsReward: 5, rewardDescription: '2500 XP erreicht! Du erhältst 5 gratis Hints für deine beeindruckenden Fortschritte.' },
    { xpRequired: 5000, freeHintsReward: 5, rewardDescription: '5000 XP erreicht! Du erhältst 5 gratis Hints - du bist ein Lern-Champion!' },
    { xpRequired: 10000, freeHintsReward: 10, rewardDescription: '10000 XP erreicht! Du erhältst 10 gratis Hints - wahnsinniger Fortschritt!' },
    { xpRequired: 25000, freeHintsReward: 15, rewardDescription: '25000 XP erreicht! Du erhältst 15 gratis Hints - du bist ein Pflege-Experte!' },
  ];

  // Get effective next milestone (use fallback if API data missing)
  const effectiveNextMilestone = nextMilestone || fallbackMilestones.find(m => m.xpRequired > currentXp);
  
  // Get effective last milestone (use fallback if API data missing)
  const effectiveLastMilestone = lastMilestone || fallbackMilestones
    .filter(m => m.xpRequired <= currentXp)
    .sort((a, b) => b.xpRequired - a.xpRequired)[0];

  const progressToNextMilestone = effectiveNextMilestone
    ? Math.min((currentXp / effectiveNextMilestone.xpRequired) * 100, 100)
    : 100;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-blue-500" />
          {t('xp.xpMilestones') || 'XP Meilensteine'}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current XP Display */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {currentXp}
          </div>
          <div className="text-sm text-muted-foreground">
            {t('xp.totalXp') || 'Gesamt-XP'}
          </div>
        </div>

        {/* Next Milestone Progress */}
        {effectiveNextMilestone && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>{t('xp.nextMilestone') || 'Nächster Meilenstein'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span className="font-medium">{effectiveNextMilestone.xpRequired} XP</span>
              </div>
            </div>

            <Progress
              value={Math.min(progressToNextMilestone, 100)}
              className="h-2"
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {effectiveNextMilestone.xpRequired - currentXp} {t('xp.xpToGo') || 'XP bis zum Ziel'}
              </span>
              <div className="flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                <span>+{effectiveNextMilestone.freeHintsReward} {t('xp.freeHints') || 'gratis Hints'}</span>
              </div>
            </div>

          </div>
        )}

        {/* Last Achieved Milestone */}
        {effectiveLastMilestone && (
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Trophy className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <div className="font-medium text-green-700 dark:text-green-300 mb-1">
                  {t('xp.lastMilestone') || 'Zuletzt erreicht'}: {effectiveLastMilestone.xpRequired} XP
                </div>
                <div className="text-muted-foreground">
                  {effectiveLastMilestone.rewardDescription}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No milestones available yet */}
        {!effectiveNextMilestone && !effectiveLastMilestone && currentXp === 0 && (
          <div className="bg-secondary/50 rounded-lg p-3 text-xs text-center text-muted-foreground">
            {t('xp.startLearning') || 'Beginne zu lernen und sammle XP!'}
          </div>
        )}

      </CardContent>
    </Card>
  );
}
