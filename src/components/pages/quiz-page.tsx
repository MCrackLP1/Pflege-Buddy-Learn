'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { QuizQuestion } from '@/components/quiz/quiz-question';
import { QuizResults } from '@/components/quiz/quiz-results';
import { QuizProgress } from '@/components/quiz/quiz-progress';
import type { QuestionWithChoices } from '@/lib/db/schema';

interface QuizPageProps {
  topic: string;
}

// Mock question data - will be replaced with real data from database
const mockQuestions: QuestionWithChoices[] = [
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
  const [questions] = useState<QuestionWithChoices[]>(mockQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [usedHints, setUsedHints] = useState<Record<string, number>>({});
  const [startTime] = useState(Date.now());
  
  const t = useTranslations();
  const router = useRouter();

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

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

  const calculateResults = () => {
    let correct = 0;
    let totalXP = 0;
    
    questions.forEach(question => {
      const userAnswer = answers[question.id];
      let isCorrect = false;
      
      if (question.type === 'tf') {
        const correctAnswer = true; // This would come from the question data
        isCorrect = userAnswer === correctAnswer;
      } else {
        const correctChoice = question.choices.find(c => c.isCorrect);
        isCorrect = userAnswer === correctChoice?.id;
      }
      
      if (isCorrect) {
        correct++;
        const timeMs = Date.now() - startTime;
        const hintsUsed = usedHints[question.id] || 0;
        // Use utility function from utils.ts
        totalXP += question.difficulty * 10 - hintsUsed * 5;
      }
    });
    
    return { correct, total: questions.length, xp: totalXP };
  };

  if (showResults) {
    const results = calculateResults();
    return (
      <MainLayout>
        <QuizResults 
          {...results}
                  onRestart={() => router.push('/de/learn')}
        onReview={() => router.push('/de/review')}
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
