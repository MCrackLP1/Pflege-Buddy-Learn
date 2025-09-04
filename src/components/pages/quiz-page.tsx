'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createLocalizedPath } from '@/lib/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { QuizQuestion } from '@/components/quiz/quiz-question';
import { QuizResults } from '@/components/quiz/quiz-results';
import { QuizProgress } from '@/components/quiz/quiz-progress';
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
  // API Data loading
  const [questions, setQuestions] = useState<QuestionWithChoices[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [usedHints, setUsedHints] = useState<Record<string, number>>({});
  const [startTime] = useState(Date.now());
  
  // Fetch questions from API
  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        const response = await fetch(`/api/questions/${topic}`);
        const data = await response.json();
        
        if (data.success) {
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
    }
    
    loadQuestions();
  }, [topic]);
  
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

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
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowResults(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleHintUsed = (questionId: string) => {
    setUsedHints(prev => ({
      ...prev,
      [questionId]: (prev[questionId] || 0) + 1
    }));
  };

  // Save attempt to database
  const saveAttemptToDb = async (questionId: string, isCorrect: boolean, timeMs: number, hintsUsed: number) => {
    try {
      await fetch('/api/attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          isCorrect,
          timeMs,
          usedHints: hintsUsed,
        }),
      });
    } catch (error) {
      console.error('Failed to save attempt:', error);
      // Don't break the quiz flow if saving fails
    }
  };

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
        totalXP += question.difficulty * 10 - (usedHints[question.id] || 0) * 5;
      }
      
      // Save attempt to database (fire and forget)
      const timeMs = Date.now() - startTime;
      const hintsUsed = usedHints[question.id] || 0;
      saveAttemptToDb(question.id, isCorrect, timeMs, hintsUsed);
    });
    
    return { correct, total: questions.length, xp: totalXP };
  };

  if (showResults) {
    const results = calculateResults();
    return (
      <MainLayout>
        <QuizResults 
          {...results}
          onRestart={() => router.push(createLocalizedPath(locale, '/learn'))}
          onReview={() => router.push(createLocalizedPath(locale, '/review'))}
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
      <div className="space-y-6">
        <QuizProgress 
          current={currentQuestionIndex + 1}
          total={questions.length}
        />
        
        <QuizQuestion
          question={currentQuestion}
          answer={answers[currentQuestion.id]}
          onAnswer={handleAnswer}
          onNext={handleNext}
          onHintUsed={() => handleHintUsed(currentQuestion.id)}
          usedHints={usedHints[currentQuestion.id] || 0}
          isLastQuestion={isLastQuestion}
        />
      </div>
    </MainLayout>
  );
}
