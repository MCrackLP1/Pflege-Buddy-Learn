'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Lightbulb } from 'lucide-react';

interface XpMilestoneCardProps {
  currentXp: number;
}

export function XpMilestoneCard({
  currentXp,
}: XpMilestoneCardProps) {
  const t = useTranslations();

  // Hardcoded milestones - completely independent from API for reliability
  const ALL_MILESTONES = [
    { xpRequired: 100, freeHintsReward: 5, rewardDescription: '100 XP erreicht! Du erhältst 5 gratis Hints für deine Lernfortschritte.' },
    { xpRequired: 500, freeHintsReward: 5, rewardDescription: '500 XP erreicht! Du erhältst 5 gratis Hints als Belohnung.' },
    { xpRequired: 1000, freeHintsReward: 5, rewardDescription: '1000 XP erreicht! Du erhältst 5 gratis Hints - du bist auf dem richtigen Weg!' },
    { xpRequired: 2500, freeHintsReward: 5, rewardDescription: '2500 XP erreicht! Du erhältst 5 gratis Hints für deine beeindruckenden Fortschritte.' },
    { xpRequired: 5000, freeHintsReward: 5, rewardDescription: '5000 XP erreicht! Du erhältst 5 gratis Hints - du bist ein Lern-Champion!' },
    { xpRequired: 10000, freeHintsReward: 10, rewardDescription: '10000 XP erreicht! Du erhältst 10 gratis Hints - wahnsinniger Fortschritt!' },
    { xpRequired: 25000, freeHintsReward: 15, rewardDescription: '25000 XP erreicht! Du erhältst 15 gratis Hints - du bist ein Pflege-Experte!' },
  ];

  // Simple, reliable milestone calculation
  const nextMilestoneData = ALL_MILESTONES.find(m => m.xpRequired > currentXp) || {
    xpRequired: currentXp + 1000,
    freeHintsReward: 5,
    rewardDescription: 'Weiter lernen!'
  };

  const lastMilestoneData = ALL_MILESTONES
    .filter(m => m.xpRequired <= currentXp)
    .sort((a, b) => b.xpRequired - a.xpRequired)[0];

  const xpToNext = Math.max(0, nextMilestoneData.xpRequired - currentXp);
  const progressToNextMilestone = Math.min((currentXp / nextMilestoneData.xpRequired) * 100, 100);

  return (
    <Card className="relative overflow-hidden card-game">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500" />
          {t('xp.xpMilestones') || 'XP Meilensteine'}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-section">
        {/* Current XP Display */}
        <div className="text-center p-4 bg-surface-3 rounded-xl border border-primary/10">
          <div className="text-display font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
            {currentXp}
          </div>
          <div className="text-caption">
            ⭐ {t('xp.totalXp') || 'Gesamt-XP'}
          </div>
        </div>

        {/* Next Milestone Progress */}
        {nextMilestoneData && (
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border-2 border-yellow-200/50 dark:border-yellow-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">{t('xp.nextMilestone') || 'Nächster Meilenstein'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span className="font-bold text-primary">{nextMilestoneData.xpRequired} XP</span>
              </div>
            </div>

            <Progress
              value={Math.min(progressToNextMilestone, 100)}
              className="h-3 mb-3"
            />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                🎯 {xpToNext} {t('xp.xpToGo') || 'XP bis zum Ziel'}
              </span>
              <div className="flex items-center gap-1 badge-success">
                <Lightbulb className="h-3 w-3" />
                <span>+{nextMilestoneData.freeHintsReward} {t('xp.freeHints') || 'gratis Hints'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Last Achieved Milestone */}
        {lastMilestoneData && (
          <div className="status-success rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Trophy className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-success mb-2">
                  🎉 {t('xp.lastMilestone') || 'Zuletzt erreicht'}: {lastMilestoneData.xpRequired} XP
                </div>
                <div className="text-body leading-relaxed">
                  {lastMilestoneData.rewardDescription}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No milestones available yet */}
        {currentXp === 0 && (
          <div className="bg-surface-3 rounded-xl p-4 text-center border border-primary/5">
            <div className="text-body text-muted-foreground">
              🚀 {t('xp.startLearning') || 'Beginne zu lernen und sammle XP!'}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
