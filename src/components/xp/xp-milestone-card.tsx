'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Gift, Lightbulb } from 'lucide-react';
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

  console.log('🎯 XP Milestone Card received:', {
    currentXp,
    nextMilestone: !!nextMilestone,
    lastMilestone: !!lastMilestone,
    nextMilestoneData: nextMilestone
  });

  const progressToNextMilestone = nextMilestone
    ? (currentXp / nextMilestone.xpRequired) * 100
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
        {nextMilestone && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>{t('xp.nextMilestone') || 'Nächster Meilenstein'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span className="font-medium">{nextMilestone.xpRequired} XP</span>
              </div>
            </div>

            <Progress
              value={Math.min(progressToNextMilestone, 100)}
              className="h-2"
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {nextMilestone.xpRequired - currentXp} {t('xp.xpToGo') || 'XP bis zum Ziel'}
              </span>
              <div className="flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                <span>+5 {t('xp.freeHints') || 'gratis Hints'}</span>
              </div>
            </div>

            {/* Milestone Reward Preview */}
            <div className="bg-secondary/50 rounded-lg p-3 text-xs">
              <div className="font-medium text-foreground mb-1">
                {t('xp.rewardPreview') || 'Belohnung'}:
              </div>
              <div className="text-muted-foreground">
                {nextMilestone.rewardDescription}
              </div>
            </div>
          </div>
        )}

        {/* Last Achieved Milestone */}
        {lastMilestone && (
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Trophy className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <div className="font-medium text-green-700 dark:text-green-300 mb-1">
                  {t('xp.lastMilestone') || 'Zuletzt erreicht'}:
                </div>
                <div className="text-muted-foreground">
                  {lastMilestone.rewardDescription}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No milestones available yet */}
        {!nextMilestone && !lastMilestone && currentXp === 0 && (
          <div className="bg-secondary/50 rounded-lg p-3 text-xs text-center text-muted-foreground">
            {t('xp.startLearning') || 'Beginne zu lernen und sammle XP!'}
          </div>
        )}

        {/* Motivational Message */}
        <div className="text-center text-sm text-muted-foreground">
          {currentXp === 0 && (t('xp.startLearning') || 'Beginne zu lernen und sammle XP!')}
          {currentXp > 0 && currentXp < 100 && (t('xp.keepGoing') || 'Mach weiter so!')}
          {currentXp >= 100 && currentXp < 500 && (t('xp.greatProgress') || 'Tolles Fortschritte!')}
          {currentXp >= 500 && (t('xp.excellentWork') || 'Ausgezeichnete Arbeit!')}
        </div>
      </CardContent>
    </Card>
  );
}
