'use client';

import { useState, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuestionWithChoices } from '@/lib/db/schema';
import { QuizFeedback } from './quiz-feedback';

interface QuizQuestionProps {
  question: QuestionWithChoices;
  answer: string | boolean | undefined;
  onAnswer: (questionId: string, answer: string | boolean) => void;
  onNext: () => void;
  onHintUsed: () => void;
  usedHints: number;
  isLastQuestion: boolean;
  hintsBalance: number;
  hintsLoading: boolean;
  isTransitioning?: boolean;
}

export function QuizQuestion({
  question,
  answer,
  onAnswer,
  onNext,
  onHintUsed,
  usedHints,
  isLastQuestion,
  hintsBalance,
  hintsLoading,
  isTransitioning = false
}: QuizQuestionProps) {
  
  const t = useTranslations();
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);

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
    if (!question || question.type !== 'mc' || !question.choices) return [];
    return shuffleArray(question.choices);
  }, [question?.id, question?.type, question?.choices]);

  // Calculate if the current answer is correct
  const isCurrentAnswerCorrect = () => {
    if (answer === undefined) return false;
    
    if (question.type === 'tf') {
      return answer === question.tfCorrectAnswer;
    } else {
      const correctChoice = question.choices.find(c => c.isCorrect);
      return answer === correctChoice?.id;
    }
  };

  const handleSubmit = () => {
    setShowFeedback(true);
  };

  const handleHint = () => {
    setShowHint(true);
    onHintUsed();
  };

  const handleNext = () => {
    setShowFeedback(false);
    setShowHint(false);
    onNext();
  };

  const isAnswered = answer !== undefined;
  const canShowHint = question.hints && question.hints.length > usedHints && hintsBalance > 0;

  return (
    <div className="space-y-6">
      {/* Question Card - Ranked Style */}
      <Card>
        <CardHeader>
          <CardTitle className="text-heading-3 leading-relaxed">
            {question.stem}
          </CardTitle>
          <div className="flex items-center gap-2 text-caption">
            <Badge variant="secondary" className="text-xs">
              {question.type === 'mc' ? t('quiz.multipleChoice') : t('quiz.trueFalse')}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Schwierigkeit: {question.difficulty}/5
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-card">
          {/* Answer Options */}
          {question.type === 'mc' ? (
            <RadioGroup
              value={answer as string || ""}
              onValueChange={(value) => !showFeedback && onAnswer(question.id, value)}
              disabled={showFeedback}
              className="space-y-3"
            >
              {shuffledChoices.map((choice) => (
                <div
                  key={choice.id}
                  className={`flex items-center space-x-2 p-2 rounded transition-all duration-200 ${
                    showFeedback ? 'cursor-not-allowed opacity-75' : ''
                  }`}
                >
                  <RadioGroupItem value={choice.id} id={choice.id} />
                  <Label
                    htmlFor={choice.id}
                    className={`flex-1 text-sm leading-relaxed p-2 ${
                      showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    {choice.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={answer === true ? "default" : "outline"}
                onClick={() => !showFeedback && onAnswer(question.id, true)}
                disabled={showFeedback}
                className={`h-auto py-4 ${showFeedback ? 'cursor-not-allowed opacity-75' : ''}`}
              >
                {t('quiz.true')}
              </Button>
              <Button
                variant={answer === false ? "default" : "outline"}
                onClick={() => !showFeedback && onAnswer(question.id, false)}
                disabled={showFeedback}
                className={`h-auto py-4 ${showFeedback ? 'cursor-not-allowed opacity-75' : ''}`}
              >
                {t('quiz.false')}
              </Button>
            </div>
          )}

          {/* Hint Section */}
          {canShowHint && !showFeedback && (
            <div className="flex items-center justify-between p-4 bg-surface-3 rounded-xl border border-primary/10">
              <div className="text-sm font-medium">
                💡 Verfügbare Hints: {hintsBalance}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleHint}
                className="hover:bg-primary/5"
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                {t('quiz.hint')}
              </Button>
            </div>
          )}

          {/* Show Hint */}
          {showHint && question.hints && (
            <div className="p-4 bg-info/10 border border-info/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-info mt-0.5 shrink-0" />
                <p className="text-body leading-relaxed">
                  {question.hints[usedHints - 1]}
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {!showFeedback && (
            <Button
              onClick={handleSubmit}
              disabled={!isAnswered}
              className="w-full"
              size="lg"
            >
              ✅ {t('quiz.submit')}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Feedback Section - Show detailed feedback with explanation */}
      {showFeedback && (
        <div className="space-y-4">
          <QuizFeedback 
            question={question} 
            isCorrect={isCurrentAnswerCorrect()}
            showCorrectAnswer={true}
          />
          
          {/* Next Button */}
          <Button
            onClick={handleNext}
            disabled={isTransitioning}
            className="w-full"
            size="lg"
          >
            {isTransitioning ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Laden...
              </>
            ) : (
              <>
                {isLastQuestion ? '🏆 Quiz beenden' : '➡️ Nächste Frage'}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}