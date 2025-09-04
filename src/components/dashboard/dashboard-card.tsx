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
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
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
        } else {
          console.error('API returned error:', data.error);
          // Fallback to mock data for debugging - 10 answers for continuous scrolling
          setRecentAnswers([
            {
              id: 'mock-1',
              isCorrect: true,
              topic: 'Grundlagen',
              createdAt: new Date().toISOString(),
              question: 'Was ist die normale Körpertemperatur eines gesunden Erwachsenen?',
              userAnswer: '36.1°C - 37.2°C',
              correctAnswer: '36.1°C - 37.2°C',
              explanation: 'Die normale Körpertemperatur liegt zwischen 36,1°C und 37,2°C.'
            },
            {
              id: 'mock-2',
              isCorrect: false,
              topic: 'Hygiene',
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              question: 'Wie lange sollte man die Hände waschen?',
              userAnswer: '10 Sekunden',
              correctAnswer: '20-30 Sekunden',
              explanation: 'Hände sollten mindestens 20-30 Sekunden gewaschen werden.'
            },
            {
              id: 'mock-3',
              isCorrect: true,
              topic: 'Medikamente',
              createdAt: new Date(Date.now() - 7200000).toISOString(),
              question: 'Was bedeutet die 5-R-Regel bei der Medikamentenverabreichung?',
              userAnswer: 'Richtiger Patient, richtiges Medikament, richtige Dosis, richtige Zeit, richtige Applikation',
              correctAnswer: 'Richtiger Patient, richtiges Medikament, richtige Dosis, richtige Zeit, richtige Applikation',
              explanation: 'Die 5-R-Regel stellt sicher, dass Medikamente korrekt verabreicht werden.'
            },
            {
              id: 'mock-4',
              isCorrect: false,
              topic: 'Dokumentation',
              createdAt: new Date(Date.now() - 10800000).toISOString(),
              question: 'Wie lange müssen Pflegedokumentationen aufbewahrt werden?',
              userAnswer: '5 Jahre',
              correctAnswer: '10 Jahre',
              explanation: 'Pflegedokumentationen müssen mindestens 10 Jahre aufbewahrt werden.'
            },
            {
              id: 'mock-5',
              isCorrect: true,
              topic: 'Grundlagen',
              createdAt: new Date(Date.now() - 14400000).toISOString(),
              question: 'Was ist der normale Blutdruckbereich für Erwachsene?',
              userAnswer: '120/80 mmHg',
              correctAnswer: '120/80 mmHg',
              explanation: 'Der optimale Blutdruck liegt bei 120/80 mmHg oder niedriger.'
            },
            {
              id: 'mock-6',
              isCorrect: true,
              topic: 'Hygiene',
              createdAt: new Date(Date.now() - 18000000).toISOString(),
              question: 'Wann sollte man Handschuhe tragen?',
              userAnswer: 'Bei Kontakt mit Körperflüssigkeiten',
              correctAnswer: 'Bei Kontakt mit Körperflüssigkeiten',
              explanation: 'Handschuhe schützen vor Infektionen bei Kontakt mit Körperflüssigkeiten.'
            },
            {
              id: 'mock-7',
              isCorrect: false,
              topic: 'Medikamente',
              createdAt: new Date(Date.now() - 21600000).toISOString(),
              question: 'Wie werden Insulin-Pens aufbewahrt?',
              userAnswer: 'Im Kühlschrank',
              correctAnswer: 'Bei Raumtemperatur nach Anbruch',
              explanation: 'Insulin-Pens werden nach Anbruch bei Raumtemperatur aufbewahrt.'
            },
            {
              id: 'mock-8',
              isCorrect: true,
              topic: 'Dokumentation',
              createdAt: new Date(Date.now() - 25200000).toISOString(),
              question: 'Was muss in der Pflegedokumentation stehen?',
              userAnswer: 'Alle durchgeführten Maßnahmen und Beobachtungen',
              correctAnswer: 'Alle durchgeführten Maßnahmen und Beobachtungen',
              explanation: 'Die Dokumentation muss alle pflegerischen Maßnahmen und Beobachtungen enthalten.'
            },
            {
              id: 'mock-9',
              isCorrect: true,
              topic: 'Grundlagen',
              createdAt: new Date(Date.now() - 28800000).toISOString(),
              question: 'Was ist der Sauerstoffsättigung Normalwert?',
              userAnswer: '95-100%',
              correctAnswer: '95-100%',
              explanation: 'Eine Sauerstoffsättigung von 95-100% gilt als normal.'
            },
            {
              id: 'mock-10',
              isCorrect: false,
              topic: 'Hygiene',
              createdAt: new Date(Date.now() - 32400000).toISOString(),
              question: 'Wie oft sollte Bettwäsche gewechselt werden?',
              userAnswer: 'Jede Woche',
              correctAnswer: 'Bei Verschmutzung oder nach 7 Tagen',
              explanation: 'Bettwäsche wird bei Verschmutzung oder mindestens alle 7 Tage gewechselt.'
            }
          ]);
        }
      } catch (err) {
        console.error('Error loading recent answers:', err);
        // Fallback to mock data for debugging - 10 answers for continuous scrolling
        setRecentAnswers([
          {
            id: 'mock-1',
            isCorrect: true,
            topic: 'Grundlagen',
            createdAt: new Date().toISOString(),
            question: 'Was ist die normale Körpertemperatur eines gesunden Erwachsenen?',
            userAnswer: '36.1°C - 37.2°C',
            correctAnswer: '36.1°C - 37.2°C',
            explanation: 'Die normale Körpertemperatur liegt zwischen 36,1°C und 37,2°C.'
          },
          {
            id: 'mock-2',
            isCorrect: false,
            topic: 'Hygiene',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            question: 'Wie lange sollte man die Hände waschen?',
            userAnswer: '10 Sekunden',
            correctAnswer: '20-30 Sekunden',
            explanation: 'Hände sollten mindestens 20-30 Sekunden gewaschen werden.'
          },
          {
            id: 'mock-3',
            isCorrect: true,
            topic: 'Medikamente',
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            question: 'Was bedeutet die 5-R-Regel bei der Medikamentenverabreichung?',
            userAnswer: 'Richtiger Patient, richtiges Medikament, richtige Dosis, richtige Zeit, richtige Applikation',
            correctAnswer: 'Richtiger Patient, richtiges Medikament, richtige Dosis, richtige Zeit, richtige Applikation',
            explanation: 'Die 5-R-Regel stellt sicher, dass Medikamente korrekt verabreicht werden.'
          },
          {
            id: 'mock-4',
            isCorrect: false,
            topic: 'Dokumentation',
            createdAt: new Date(Date.now() - 10800000).toISOString(),
            question: 'Wie lange müssen Pflegedokumentationen aufbewahrt werden?',
            userAnswer: '5 Jahre',
            correctAnswer: '10 Jahre',
            explanation: 'Pflegedokumentationen müssen mindestens 10 Jahre aufbewahrt werden.'
          },
          {
            id: 'mock-5',
            isCorrect: true,
            topic: 'Grundlagen',
            createdAt: new Date(Date.now() - 14400000).toISOString(),
            question: 'Was ist der normale Blutdruckbereich für Erwachsene?',
            userAnswer: '120/80 mmHg',
            correctAnswer: '120/80 mmHg',
            explanation: 'Der optimale Blutdruck liegt bei 120/80 mmHg oder niedriger.'
          },
          {
            id: 'mock-6',
            isCorrect: true,
            topic: 'Hygiene',
            createdAt: new Date(Date.now() - 18000000).toISOString(),
            question: 'Wann sollte man Handschuhe tragen?',
            userAnswer: 'Bei Kontakt mit Körperflüssigkeiten',
            correctAnswer: 'Bei Kontakt mit Körperflüssigkeiten',
            explanation: 'Handschuhe schützen vor Infektionen bei Kontakt mit Körperflüssigkeiten.'
          },
          {
            id: 'mock-7',
            isCorrect: false,
            topic: 'Medikamente',
            createdAt: new Date(Date.now() - 21600000).toISOString(),
            question: 'Wie werden Insulin-Pens aufbewahrt?',
            userAnswer: 'Im Kühlschrank',
            correctAnswer: 'Bei Raumtemperatur nach Anbruch',
            explanation: 'Insulin-Pens werden nach Anbruch bei Raumtemperatur aufbewahrt.'
          },
          {
            id: 'mock-8',
            isCorrect: true,
            topic: 'Dokumentation',
            createdAt: new Date(Date.now() - 25200000).toISOString(),
            question: 'Was muss in der Pflegedokumentation stehen?',
            userAnswer: 'Alle durchgeführten Maßnahmen und Beobachtungen',
            correctAnswer: 'Alle durchgeführten Maßnahmen und Beobachtungen',
            explanation: 'Die Dokumentation muss alle pflegerischen Maßnahmen und Beobachtungen enthalten.'
          },
          {
            id: 'mock-9',
            isCorrect: true,
            topic: 'Grundlagen',
            createdAt: new Date(Date.now() - 28800000).toISOString(),
            question: 'Was ist der Sauerstoffsättigung Normalwert?',
            userAnswer: '95-100%',
            correctAnswer: '95-100%',
            explanation: 'Eine Sauerstoffsättigung von 95-100% gilt als normal.'
          },
          {
            id: 'mock-10',
            isCorrect: false,
            topic: 'Hygiene',
            createdAt: new Date(Date.now() - 32400000).toISOString(),
            question: 'Wie oft sollte Bettwäsche gewechselt werden?',
            userAnswer: 'Jede Woche',
            correctAnswer: 'Bei Verschmutzung oder nach 7 Tagen',
            explanation: 'Bettwäsche wird bei Verschmutzung oder mindestens alle 7 Tage gewechselt.'
          }
        ]);
      }
    }

    loadRecentAnswers();
  }, []);

  // Auto-scroll carousel with pauses - new implementation
  useEffect(() => {
    if (recentAnswers.length <= 1) return;

    const scrollContainer = document.getElementById('recent-answers-carousel');
    if (!scrollContainer) return;

    const cardWidth = 320 + 16; // Card width + gap
    const scrollSpeed = 1; // pixels per frame for smooth movement
    let currentCardIndex = 0;
    let animationId: number;
    let isPaused = false;
    let pauseTimeout: NodeJS.Timeout;

    const scrollToCard = (cardIndex: number) => {
      const targetScroll = cardIndex * cardWidth;
      const currentScroll = scrollContainer.scrollLeft;
      const distance = targetScroll - currentScroll;

      if (Math.abs(distance) < 1) {
        // Reached target - pause for reading
        startPause(cardIndex);
        return;
      }

      // Smooth scroll towards target
      const step = Math.sign(distance) * Math.min(scrollSpeed, Math.abs(distance));
      scrollContainer.scrollLeft += step;
      animationId = requestAnimationFrame(() => scrollToCard(cardIndex));
    };

    const startPause = (cardIndex: number) => {
      isPaused = true;
      // Pause for 4 seconds to allow reading
      pauseTimeout = setTimeout(() => {
        isPaused = false;
        // Move to next card
        currentCardIndex = (cardIndex + 1) % recentAnswers.length;
        scrollToCard(currentCardIndex);
      }, 4000); // 4 seconds pause
    };

    const startCarousel = () => {
      currentCardIndex = 0;
      scrollContainer.scrollLeft = 0; // Start at beginning
      scrollToCard(0);
    };

    // Pause on hover
    const pauseScroll = () => {
      if (pauseTimeout) {
        clearTimeout(pauseTimeout);
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      isPaused = true;
    };

    const resumeScroll = () => {
      if (!isPaused) return;

      isPaused = false;
      // Resume from current position
      const currentScroll = scrollContainer.scrollLeft;
      const nearestCardIndex = Math.round(currentScroll / cardWidth);

      // Start pause for current card
      startPause(nearestCardIndex % recentAnswers.length);
    };

    scrollContainer.addEventListener('mouseenter', pauseScroll);
    scrollContainer.addEventListener('mouseleave', resumeScroll);

    // Start carousel after 2 seconds
    const startDelay = setTimeout(() => {
      startCarousel();
    }, 2000);

    return () => {
      clearTimeout(startDelay);
      if (pauseTimeout) {
        clearTimeout(pauseTimeout);
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      scrollContainer.removeEventListener('mouseenter', pauseScroll);
      scrollContainer.removeEventListener('mouseleave', resumeScroll);
    };
  }, [recentAnswers]);

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
              📚 {t('home.selectTopics') || 'Themen auswählen'}
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
        {recentAnswers.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📚 {t('home.recentAnswers') || 'Letzte Antworten'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                id="recent-answers-carousel"
                className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide scroll-smooth"
                style={{
                  scrollbarWidth: 'none', // Firefox
                  msOverflowStyle: 'none', // IE/Edge
                }}
              >
                {recentAnswers.map((answer, index) => (
                  <div
                    key={answer.id}
                    className="flex-shrink-0 w-80 bg-card border border-border rounded-lg p-4 hover:bg-accent/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                    onClick={() => router.push(createLocalizedPath(locale, '/review'))}
                  >
                    {/* Status & Topic Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex items-center gap-2 ${
                        answer.isCorrect ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {answer.isCorrect ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                        <span className="text-sm font-medium">
                          {answer.isCorrect ? 'Richtig' : 'Falsch'}
                        </span>
                      </div>
                      <div className="text-xs bg-secondary px-2 py-1 rounded-full">
                        {answer.topic}
                      </div>
                    </div>

                    {/* Question */}
                    <div className="mb-3">
                      <p className="text-sm font-medium leading-relaxed overflow-hidden"
                         style={{
                           display: '-webkit-box',
                           WebkitLineClamp: 2,
                           WebkitBoxOrient: 'vertical'
                         }}>
                        {answer.question}
                      </p>
                    </div>

                    {/* Answers */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-muted-foreground mt-0.5">Deine:</span>
                        <span className="text-sm flex-1">{answer.userAnswer}</span>
                      </div>
                      {!answer.isCorrect && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-medium text-green-600 mt-0.5">Richtig:</span>
                          <span className="text-sm flex-1 text-green-700">{answer.correctAnswer}</span>
                        </div>
                      )}
                    </div>

                    {/* Explanation (truncated) */}
                    <div className="border-t pt-2">
                      <p className="text-xs text-muted-foreground overflow-hidden"
                         style={{
                           display: '-webkit-box',
                           WebkitLineClamp: 2,
                           WebkitBoxOrient: 'vertical'
                         }}>
                        {answer.explanation}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <div className="mt-3 pt-2 border-t text-xs text-muted-foreground">
                      {new Date(answer.createdAt).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom CSS for hiding scrollbar completely */}
              <style dangerouslySetInnerHTML={{
                __html: `
                  #recent-answers-carousel::-webkit-scrollbar {
                    display: none;
                  }
                `
              }} />

              <p className="text-xs text-muted-foreground mt-4 text-center">
                ⏸️ 4s Pause pro Frage • Hover für Pause • Klick für Details
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📚 {t('home.recentAnswers') || 'Letzte Antworten'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-2">Lade Antworten...</div>
                <div className="text-xs text-muted-foreground">
                  Beantworte einige Fragen, um hier deine letzten Antworten zu sehen
                </div>
              </div>
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
