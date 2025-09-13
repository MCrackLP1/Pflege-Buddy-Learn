'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createLocalizedPath } from '@/lib/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { QuizQuestion } from '@/components/quiz/quiz-question';
import { QuizResults } from '@/components/quiz/quiz-results';
import { QuizProgress } from '@/components/quiz/quiz-progress';
import { calculateXP } from '@/lib/utils/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Sparkles } from 'lucide-react';
import type { QuestionWithChoices } from '@/lib/db/schema';

interface QuizPageProps {
  topic: string;
}

// Fallback mock questions if API fails
const mockQuestionsFallback: QuestionWithChoices[] = [
  {
    id: '1',
    topicId: '1',
    type: 'mc',
    stem: 'Was ist die normale Körpertemperatur eines gesunden Erwachsenen?',
    explanationMd: 'Die normale Körpertemperatur liegt zwischen 36,1°C und 37,2°C.',
    sourceUrl: 'https://www.rki.de',
    sourceTitle: 'RKI Leitlinien',
    sourceDate: '2024-01-01',
    difficulty: 2,
    hints: ['Die Temperatur wird meist rektal gemessen', 'Normal liegt zwischen 36-37°C'],
    tfCorrectAnswer: null, // MC questions don't use this field
    createdAt: new Date(),
    choices: [
      { id: '1a', questionId: '1', label: '35,0°C - 36,0°C', isCorrect: false },
      { id: '1b', questionId: '1', label: '36,1°C - 37,2°C', isCorrect: true },
      { id: '1c', questionId: '1', label: '37,5°C - 38,0°C', isCorrect: false },
      { id: '1d', questionId: '1', label: '38,1°C - 39,0°C', isCorrect: false },
    ],
    citations: [
      {
        id: 'c1',
        questionId: '1',
        url: 'https://www.rki.de/DE/Content/InfAZ/F/Fieber/Fieber_node.html',
        title: 'RKI - Fieber',
        publishedDate: '2024-01-01',
        accessedAt: new Date(),
      }
    ]
  },
  {
    id: '2',
    topicId: '1', 
    type: 'tf',
    stem: 'Händedesinfektion sollte mindestens 30 Sekunden dauern.',
    explanationMd: 'Händedesinfektion sollte mindestens 30 Sekunden durchgeführt werden, um eine effektive Keimreduktion zu erreichen.',
    sourceUrl: 'https://www.who.int',
    sourceTitle: 'WHO Guidelines',
    sourceDate: '2024-01-01',
    difficulty: 1,
    hints: ['WHO empfiehlt mindestens 20-30 Sekunden'],
    tfCorrectAnswer: true, // The correct answer for this TF question
    createdAt: new Date(),
    choices: [],
    citations: [
      {
        id: 'c2',
        questionId: '2',
        url: 'https://www.who.int/gpsc/5may/Hand_Hygiene_Why_How_and_When_Brochure.pdf',
        title: 'WHO Hand Hygiene Guidelines',
        publishedDate: '2024-01-01',
        accessedAt: new Date(),
      }
    ]
  }
];

export function QuizPage({ topic }: QuizPageProps) {
  // Translations
  const tErrors = useTranslations('errors');
  
  // API Data loading
  const [questions, setQuestions] = useState<QuestionWithChoices[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quiz State - simplified state management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [usedHints, setUsedHints] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [questionStartTimes, setQuestionStartTimes] = useState<Record<string, number>>({});

  // Hint balance state - simplified
  const [hintsBalance, setHintsBalance] = useState(0);
  const [hintsLoading, setHintsLoading] = useState(true);

  // Loading state for transitions
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Load questions from API - always fresh and random
  useEffect(() => {
    const loadQuestions = async () => {
      console.log('Loading fresh random questions for topic:', topic);

      try {
        setLoading(true);
        // Add cache-busting parameter for random questions to ensure true randomness
        const cacheBuster = topic === 'random' ? `?_t=${Date.now()}` : '';
        const response = await fetch(`/api/questions/${topic}${cacheBuster}`);
        const data = await response.json();

        if (data.success && data.questions) {
          console.log(`Loaded ${data.questions.length} fresh random questions for topic: ${topic}`);
          setQuestions(data.questions);
        } else {
          throw new Error(data.error || 'Failed to load questions');
        }
      } catch (err) {
        console.error('Error loading questions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load questions');
        // Fallback to mock data for development
        setQuestions(mockQuestionsFallback);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [topic]);

  // Load hints balance
  useEffect(() => {
    const loadHints = async () => {
      try {
        setHintsLoading(true);
        const response = await fetch('/api/user/hints');
        const data = await response.json();

        if (data.success) {
          setHintsBalance(data.hintsBalance || 0);
        } else {
          console.error('Failed to load hints:', data.error);
        }
      } catch (error) {
        console.error('Error loading hints:', error);
      } finally {
        setHintsLoading(false);
      }
    };

    loadHints();
  }, []);

  // Removed unused useTranslations import
  const locale = useLocale();
  const router = useRouter();

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Track question start time when question changes
  useEffect(() => {
    if (currentQuestion && !questionStartTimes[currentQuestion.id]) {
      setQuestionStartTimes(prev => ({
        ...prev,
        [currentQuestion.id]: Date.now()
      }));
    }
  }, [currentQuestion?.id, questionStartTimes]);

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Lade Fragen...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state  
  if (error) {
    return (
      <MainLayout>
        <div className="text-center py-8 space-y-4">
          <div className="text-6xl">❌</div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Fehler beim Laden der Fragen</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-blue-400 hover:text-blue-300"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleAnswer = (questionId: string, answer: string | boolean) => {
    // Simple state update - no immediate DB save to prevent race conditions
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    // Track question start time if not already set
    setQuestionStartTimes(prev => ({
      ...prev,
      [questionId]: prev[questionId] || Date.now()
    }));
  };

  const handleNext = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setIsTransitioning(true);

    try {
      // Save current question attempt before proceeding
      await saveCurrentQuestionAttempt(currentQuestion);

      // Small delay for better UX feedback
      await new Promise(resolve => setTimeout(resolve, 200));

      // Navigate to next question or show results
      if (currentQuestionIndex === questions.length - 1) {
        setShowResults(true);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error transitioning to next question:', error);
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleHintUsed = async (questionId: string) => {
    try {
      // First, use the hint via API
      const response = await fetch('/api/user/hints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'use_hint' }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local state
        setUsedHints(prev => ({
          ...prev,
          [questionId]: (prev[questionId] || 0) + 1
        }));

        // Update hint balance
        setHintsBalance(data.hintsBalance);
      } else {
        console.error('Failed to use hint:', data.error);
        alert(tErrors('hintNotUsed') + ': ' + (data.error || tErrors('unknownError')));
      }
    } catch (error) {
      console.error('Error using hint:', error);
      alert(tErrors('usingHint'));
    }
  };

  // Save current question attempt to database
  const saveCurrentQuestionAttempt = async (question: QuestionWithChoices) => {
    const userAnswer = answers[question.id];
    if (userAnswer === undefined) return; // No answer given

    // Calculate if answer is correct
    let isCorrect = false;
    if (question.type === 'tf') {
      isCorrect = userAnswer === question.tfCorrectAnswer;
    } else {
      const correctChoice = question.choices.find(c => c.isCorrect);
      isCorrect = userAnswer === correctChoice?.id;
    }

    // Calculate time spent on this question
    const questionStartTime = questionStartTimes[question.id] || Date.now();
    const timeMs = Date.now() - questionStartTime;
    const hintsUsed = usedHints[question.id] || 0;

    try {
      const response = await fetch('/api/attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: question.id,
          isCorrect,
          timeMs,
          usedHints: hintsUsed,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save attempt: ${response.status}`);
      }

      console.log(`✅ Saved attempt for question ${question.id}: ${isCorrect ? 'correct' : 'incorrect'}`);
    } catch (error) {
      console.error('Failed to save attempt:', error);
      // Don't break the quiz flow if saving fails
    }
  };

  // Quiz session is now stateless - no cleanup needed

  const calculateResults = () => {
    let correct = 0;
    let totalXP = 0;

    questions.forEach(question => {
      const userAnswer = answers[question.id];
      let isCorrect = false;

      if (question.type === 'tf') {
        // For True/False questions, compare with the stored correct answer
        isCorrect = userAnswer === question.tfCorrectAnswer;
      } else {
        // For Multiple Choice questions, check if selected choice is correct
        const correctChoice = question.choices.find(c => c.isCorrect);
        isCorrect = userAnswer === correctChoice?.id;
      }

      if (isCorrect) {
        correct++;
        // Use the standardized calculateXP function for consistency
        const timeSpent = questionStartTimes[question.id] ? Date.now() - questionStartTimes[question.id] : 0;
        const xpForThisQuestion = calculateXP(question.difficulty, usedHints[question.id] || 0, timeSpent);
        totalXP += xpForThisQuestion;
      }

      // Note: Attempts are now saved immediately when answer is given
      // No need to save again here
    });

    return { correct, total: questions.length, xp: totalXP };
  };

  if (showResults) {
    const results = calculateResults();

    return (
      <MainLayout>
        <QuizResults
          {...results}
          onRestart={() => router.push(createLocalizedPath(locale, '/quiz/random'))}
          onReview={() => router.push(createLocalizedPath(locale, '/review'))}
          // Pass the actual number of questions answered
          total={Object.keys(answers).length}
        />
      </MainLayout>
    );
  }

  if (!currentQuestion) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Keine Fragen verfügbar</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Mobile-Optimized Quiz Layout */}
      <div className="flex flex-col h-screen max-h-screen overflow-hidden md:h-auto md:max-h-none md:space-y-6 md:overflow-visible">
        {/* Fixed Header - Progress */}
        <div className="flex-shrink-0 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <QuizProgress
                  current={currentQuestionIndex + 1}
                  total={questions.length}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Scrollable Content - Question */}
        <div className="flex-1 overflow-y-auto pb-4">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="shadow-lg h-full md:h-auto">
              <CardContent className="p-4 h-full md:h-auto">
                <QuizQuestion
                  question={currentQuestion}
                  answer={answers[currentQuestion.id]}
                  onAnswer={handleAnswer}
                  onNext={handleNext}
                  isTransitioning={isTransitioning}
                  onHintUsed={() => handleHintUsed(currentQuestion.id)}
                  usedHints={usedHints[currentQuestion.id] || 0}
                  isLastQuestion={isLastQuestion}
                  hintsBalance={hintsBalance}
                  hintsLoading={hintsLoading}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Fixed Footer - Navigation will be handled inside QuizQuestion */}
      </div>
    </MainLayout>
  );
}
