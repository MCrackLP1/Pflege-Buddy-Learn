'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { RankedQuiz } from '@/components/quiz/ranked-quiz';
import { RankedLeaderboard } from '@/components/ranked/ranked-leaderboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Play, Target, Clock, TrendingUp } from 'lucide-react';

type RankedStats = {
  questionsAnswered: number;
  correctAnswers: number;
  totalScore: number;
  currentStreak: number;
};

type PageState = 'menu' | 'playing' | 'results';

export function RankedPage() {
  const [pageState, setPageState] = useState<PageState>('menu');
  const [sessionStats, setSessionStats] = useState<RankedStats>({
    questionsAnswered: 0,
    correctAnswers: 0,
    totalScore: 0,
    currentStreak: 0,
  });

  const handleStartSession = () => {
    setPageState('playing');
    setSessionStats({
      questionsAnswered: 0,
      correctAnswers: 0,
      totalScore: 0,
      currentStreak: 0,
    });
  };

  const handleEndSession = () => {
    setPageState('results');
  };

  const handleUpdateStats = (stats: RankedStats) => {
    setSessionStats(stats);
  };

  const handleBackToMenu = () => {
    setPageState('menu');
  };

  const handleViewLeaderboard = () => {
    // Go back to menu and scroll to leaderboard
    setPageState('menu');
    setTimeout(() => {
      const leaderboardElement = document.getElementById('leaderboard');
      if (leaderboardElement) {
        leaderboardElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  if (pageState === 'playing') {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Ranked Mode
            </h1>
          </div>

          <RankedQuiz
            onEndSession={handleEndSession}
            onUpdateStats={handleUpdateStats}
          />
        </div>
      </MainLayout>
    );
  }

  if (pageState === 'results') {
    const accuracy = sessionStats.questionsAnswered > 0
      ? Math.round((sessionStats.correctAnswers / sessionStats.questionsAnswered) * 100)
      : 0;

    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Session beendet!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{sessionStats.questionsAnswered}</div>
                  <div className="text-sm text-muted-foreground">Fragen</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{accuracy}%</div>
                  <div className="text-sm text-muted-foreground">Genauigkeit</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <div className="text-2xl font-bold">{sessionStats.totalScore}</div>
                  <div className="text-sm text-muted-foreground">Punkte</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">{sessionStats.currentStreak}</div>
                  <div className="text-sm text-muted-foreground">Serie</div>
                </div>
              </div>

              {sessionStats.questionsAnswered >= 5 && (
                <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-green-600 font-semibold">
                    Deine Punkte wurden zur Bestenliste hinzugefügt!
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={handleStartSession} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Neue Session
                </Button>
                <Button variant="outline" onClick={handleViewLeaderboard} className="flex-1">
                  <Trophy className="h-4 w-4 mr-2" />
                  Bestenliste
                </Button>
                <Button variant="outline" onClick={handleBackToMenu}>
                  Zurück
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Ranked Mode
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Teste dein Wissen in einem endlosen Quiz mit Zeitlimit. Sammle Punkte und klettere in der Bestenliste nach oben!
          </p>
        </div>

        {/* Game Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Spielregeln</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">20 Sekunden pro Frage</h4>
                    <p className="text-sm text-muted-foreground">
                      Du hast nur 20 Sekunden Zeit pro Frage. Bei Zeitüberschreitung gibt es automatisch 0 Punkte.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Endloses Quiz</h4>
                    <p className="text-sm text-muted-foreground">
                      Beantworte so viele Fragen wie möglich. Du kannst jederzeit aufhören.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Trophy className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Punkteberechnung</h4>
                    <p className="text-sm text-muted-foreground">
                      (Schwierigkeit × 100) + Zeitbonus - Hint-Strafe. Schnellere Antworten = mehr Punkte!
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Bestenliste</h4>
                    <p className="text-sm text-muted-foreground">
                      Nach 5+ Fragen wirst du in der globalen Bestenliste geführt.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <div className="text-center">
          <Button onClick={handleStartSession} size="lg" className="px-8 py-4 text-lg">
            <Play className="h-5 w-5 mr-2" />
            Ranked Session starten
          </Button>
        </div>

        {/* Leaderboard */}
        <div id="leaderboard">
          <RankedLeaderboard />
        </div>
      </div>
    </MainLayout>
  );
}
