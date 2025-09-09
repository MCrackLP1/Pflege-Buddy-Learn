'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { Lightbulb, ExternalLink, Trophy, Target, Clock } from 'lucide-react';
import type { QuestionWithChoices } from '@/lib/db/schema';

interface RankedQuizProps {
  onEndSession: () => void;
  onUpdateStats: (stats: RankedStats) => void;
}

interface RankedStats {
  questionsAnswered: number;
  correctAnswers: number;
  totalScore: number;
  currentStreak: number;
}

interface QuizState {
  currentQuestion: QuestionWithChoices | null;
  answer: string | boolean | undefined;
  usedHints: number;
  timeLeft: number;
  showFeedback: boolean;
  isLoading: boolean;
  startTime: number;
  lastAnswerCorrect: boolean | null;
  lastScore: number;
}

export function RankedQuiz({ onEndSession, onUpdateStats }: RankedQuizProps) {
  const t = useTranslations();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stats, setStats] = useState<RankedStats>({
    questionsAnswered: 0,
    correctAnswers: 0,
    totalScore: 0,
    currentStreak: 0,
  });

  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: null,
    answer: undefined,
    usedHints: 0,
    timeLeft: 20,
    showFeedback: false,
    isLoading: true,
    startTime: Date.now(),
    lastAnswerCorrect: null,
    lastScore: 0,
  });

  // Hint balance state
  const [hintsBalance, setHintsBalance] = useState(0);

  // Ref to track current question ID for randomization stability
  const currentQuestionIdRef = useRef<string | null>(null);

  // Shuffle function for consistent randomization
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Memoized shuffled choices - only reshuffle when question changes
  const shuffledChoices = useMemo(() => {
    if (!quizState.currentQuestion || quizState.currentQuestion.type !== 'mc' || !quizState.currentQuestion.choices) return [];

    // Check if this is a new question
    if (currentQuestionIdRef.current !== quizState.currentQuestion.id) {
      currentQuestionIdRef.current = quizState.currentQuestion.id;
    }

    // Always shuffle for new questions or if no previous shuffle exists
    return shuffleArray(quizState.currentQuestion.choices);
  }, [quizState.currentQuestion?.id, quizState.currentQuestion?.type, quizState.currentQuestion?.choices]);
  // Removed freeHintsLeft - using unified hints system

  // Initialize session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const response = await fetch('/api/ranked/session', { method: 'POST' });
        const data = await response.json();

        if (data.success) {
          setSessionId(data.session.id);
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        console.error('Failed to initialize ranked session:', error);
        alert('Failed to start ranked session');
      }
    };

    const loadHints = async () => {
      try {
        const response = await fetch('/api/user/hints');
        const data = await response.json();

        if (response.ok) {
          setHintsBalance(data.hintsBalance || 0);
          // Using unified hints system - no separate free hints
        }
      } catch (error) {
        console.error('Error loading hints:', error);
      }
    };

    initializeSession();
    loadHints();
    loadNextQuestion();
  }, []);

  const loadNextQuestion = async () => {
    try {
      setQuizState(prev => ({ ...prev, isLoading: true }));

      // Add cache-busting parameter for randomness
      const response = await fetch(`/api/questions/random?_t=${Date.now()}`);
      const data = await response.json();

      if (data.success && data.questions?.[0]) {
        setQuizState({
          currentQuestion: data.questions[0],
          answer: undefined,
          usedHints: 0,
          timeLeft: 20,
          showFeedback: false,
          isLoading: false,
          startTime: Date.now(),
          lastAnswerCorrect: null,
          lastScore: 0,
        });
      } else {
        throw new Error(data.error || 'No questions available');
      }
    } catch (error) {
      console.error('Failed to load question:', error);
      alert('Failed to load next question');
    }
  };

  const handleAnswer = (answer: string | boolean) => {
    setQuizState(prev => ({ ...prev, answer }));
  };

  const handleTimeUp = () => {
    // Auto-submit with incorrect answer
    submitAnswer(undefined);
  };

  const handleHintUsed = async () => {
    if (!quizState.currentQuestion || !sessionId) return;

    try {
      const response = await fetch('/api/user/hints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'use_hint' }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setQuizState(prev => ({ ...prev, usedHints: prev.usedHints + 1 }));
        setHintsBalance(data.hintsBalance);
        // Using unified hints system
      } else {
        alert('Failed to use hint: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error using hint:', error);
      alert('Failed to use hint');
    }
  };

  const submitAnswer = async (finalAnswer?: string | boolean) => {
    if (!quizState.currentQuestion || !sessionId) return;

    const answer = finalAnswer !== undefined ? finalAnswer : quizState.answer;
    const timeMs = Date.now() - quizState.startTime;

    try {
      const response = await fetch('/api/ranked/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: quizState.currentQuestion.id,
          answer,
          timeMs,
          usedHints: quizState.usedHints,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const isCorrect = data.isCorrect;
        const score = data.score;

        // Update stats
        const newStats = {
          questionsAnswered: stats.questionsAnswered + 1,
          correctAnswers: stats.correctAnswers + (isCorrect ? 1 : 0),
          totalScore: stats.totalScore + score,
          currentStreak: isCorrect ? stats.currentStreak + 1 : 0,
        };

        setStats(newStats);
        onUpdateStats(newStats);

        setQuizState(prev => ({ 
          ...prev, 
          showFeedback: true, 
          lastAnswerCorrect: isCorrect,
          lastScore: score 
        }));

        // Auto-advance to next question after 2 seconds
        setTimeout(() => {
          loadNextQuestion();
        }, 2000);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('Failed to submit answer');
    }
  };


  const handleEndSession = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch('/api/ranked/session/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (data.success) {
        onEndSession();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to end session:', error);
      alert('Failed to end session');
    }
  };

  if (quizState.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Lade nächste Frage...</p>
        </div>
      </div>
    );
  }

  if (!quizState.currentQuestion) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Keine Fragen verfügbar</p>
      </div>
    );
  }

  const { currentQuestion } = quizState;
  const isAnswered = quizState.answer !== undefined;
  const canShowHint = currentQuestion.hints && currentQuestion.hints.length > quizState.usedHints &&
                     (hintsBalance > 0);

  return (
    <div className="space-y-6">
      {/* Header with timer and stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <CountdownTimer
            duration={20}
            onTimeUp={handleTimeUp}
            isActive={!quizState.showFeedback && !quizState.isLoading}
            size="md"
          />
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{stats.questionsAnswered + 1}</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span>{stats.totalScore}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{Math.round(stats.questionsAnswered > 0 ? stats.totalScore / stats.questionsAnswered : 0)}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={handleEndSession}>
          Session beenden
        </Button>
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">
            {currentQuestion.stem}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="px-2 py-1 bg-secondary rounded-full">
              {currentQuestion.type === 'mc' ? t('quiz.multipleChoice') : t('quiz.trueFalse')}
            </span>
            <span>Schwierigkeit: {currentQuestion.difficulty}/5</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Answer Options */}
          {currentQuestion.type === 'mc' ? (
            <RadioGroup
              value={quizState.answer as string || ""}
              onValueChange={(value) => handleAnswer(value)}
              className="space-y-3"
            >
              {shuffledChoices.map((choice) => (
                <div key={choice.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={choice.id} id={choice.id} />
                  <Label
                    htmlFor={choice.id}
                    className="flex-1 text-sm leading-relaxed cursor-pointer p-2"
                  >
                    {choice.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={quizState.answer === true ? "default" : "outline"}
                onClick={() => handleAnswer(true)}
                className="h-auto py-4"
              >
                {t('quiz.true')}
              </Button>
              <Button
                variant={quizState.answer === false ? "default" : "outline"}
                onClick={() => handleAnswer(false)}
                className="h-auto py-4"
              >
                {t('quiz.false')}
              </Button>
            </div>
          )}

          {/* Hint Section */}
          {canShowHint && !quizState.showFeedback && (
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="text-sm">
                Verfügbare Hints: {hintsBalance}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleHintUsed}
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                {t('quiz.hint')}
              </Button>
            </div>
          )}

          {/* Show Hint */}
          {quizState.usedHints > 0 && currentQuestion.hints && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm leading-relaxed">
                  {currentQuestion.hints[quizState.usedHints - 1]}
                </p>
              </div>
            </div>
          )}

          {/* Feedback Display */}
          {quizState.showFeedback && quizState.lastAnswerCorrect !== null && (
            <div className={`p-4 rounded-lg text-center ${
              quizState.lastAnswerCorrect 
                ? 'bg-green-500/10 border border-green-500/20' 
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <div className={`text-lg font-bold ${
                quizState.lastAnswerCorrect ? 'text-green-600' : 'text-red-600'
              }`}>
                {quizState.lastAnswerCorrect ? 'Richtig!' : 'Falsch!'}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {quizState.lastScore > 0 ? '+' : ''}{quizState.lastScore} Punkte
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Automatische Weiterleitung zur nächsten Frage...
              </div>
            </div>
          )}

          {/* Submit Button */}
          {!quizState.showFeedback && (
            <Button
              onClick={() => submitAnswer()}
              disabled={!isAnswered}
              className="w-full"
              size="lg"
            >
              {t('quiz.submit')}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
