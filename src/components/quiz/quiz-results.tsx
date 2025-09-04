'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Flame, RotateCcw, Eye, X } from 'lucide-react';

interface QuizResultsProps {
  correct: number;
  total: number;
  xp: number;
  onRestart: () => void;
  onReview: () => void;
}

export function QuizResults({ correct, total, xp, onRestart, onReview }: QuizResultsProps) {
  const t = useTranslations('results');
  const scorePercent = (correct / total) * 100;
  const isPerfectScore = correct === total;

  // Mock data for streak
  const newStreak = 6;
  const streakContinued = true;

  // Smart Continue: Auto-redirect after 3 seconds
  const [timeLeft, setTimeLeft] = useState(3);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (cancelled) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-redirect when timer reaches 0
          clearInterval(timer);
          onRestart();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRestart, cancelled]);

  const handleCancel = () => {
    setCancelled(true);
    setTimeLeft(0);
  };

  return (
    <div className="space-y-6">
      {/* Main Results */}
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Trophy 
              className={`h-16 w-16 ${isPerfectScore ? 'text-yellow-500' : 'text-gray-500'}`} 
            />
          </div>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-3xl font-bold">
              {correct}/{total}
            </div>
            <Progress value={scorePercent} className="h-3" />
            <p className="text-muted-foreground">
              {t('score', { correct, total })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* XP and Streak */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center">
          <CardContent className="p-4 space-y-2">
            <Star className="h-8 w-8 mx-auto text-yellow-500" />
            <div className="text-2xl font-bold text-green-400">+{xp}</div>
            <div className="text-xs text-muted-foreground">
              {t('xpEarned', { xp })}
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4 space-y-2">
            <Flame className={`h-8 w-8 mx-auto ${streakContinued ? 'text-orange-500' : 'text-gray-500'}`} />
            <div className="text-2xl font-bold">{newStreak}</div>
            <div className="text-xs text-muted-foreground">
              {streakContinued 
                ? t('streakContinued', { days: newStreak })
                : t('streakBroken')
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Continue Banner */}
      {!cancelled && timeLeft > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-blue-800 mb-3">
              🚀 Nächste Session startet automatisch in {timeLeft}s...
            </p>
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <X className="h-4 w-4 mr-2" />
              Hier bleiben
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button onClick={onReview} variant="outline" className="w-full" size="lg">
          <Eye className="h-4 w-4 mr-2" />
          {t('reviewAnswers')}
        </Button>

        <Button onClick={onRestart} className="w-full" size="lg">
          <RotateCcw className="h-4 w-4 mr-2" />
          {cancelled ? t('startNew') : 'Neue Session starten'}
        </Button>
      </div>
    </div>
  );
}
