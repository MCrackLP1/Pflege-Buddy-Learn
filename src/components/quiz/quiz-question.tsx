'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Lightbulb, ExternalLink } from 'lucide-react';
import type { QuestionWithChoices } from '@/lib/db/schema';

interface QuizQuestionProps {
  question: QuestionWithChoices;
  answer: string | boolean | undefined;
  onAnswer: (questionId: string, answer: string | boolean) => void;
  onNext: () => void;
  onHintUsed: () => void;
  usedHints: number;
  isLastQuestion: boolean;
}

export function QuizQuestion({
  question,
  answer,
  onAnswer,
  onNext,
  onHintUsed,
  usedHints,
  isLastQuestion
}: QuizQuestionProps) {
  const [showHint, setShowHint] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const t = useTranslations();

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
  const canShowHint = question.hints && question.hints.length > usedHints;
  
  // Mock hint balance - will be replaced with real data
  const freeHintsLeft = Math.max(0, 2 - usedHints);

  return (
    <div className="space-y-4">
      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">
            {question.stem}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="px-2 py-1 bg-secondary rounded-full">
              {question.type === 'mc' ? t('quiz.multipleChoice') : t('quiz.trueFalse')}
            </span>
            <span>Schwierigkeit: {question.difficulty}/5</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Answer Options */}
          {question.type === 'mc' ? (
            <RadioGroup 
              value={answer as string} 
              onValueChange={(value) => onAnswer(question.id, value)}
              className="space-y-3"
            >
              {question.choices.map((choice) => (
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
                variant={answer === true ? "default" : "outline"}
                onClick={() => onAnswer(question.id, true)}
                className="h-auto py-4"
              >
                {t('quiz.true')}
              </Button>
              <Button
                variant={answer === false ? "default" : "outline"}
                onClick={() => onAnswer(question.id, false)}
                className="h-auto py-4"
              >
                {t('quiz.false')}
              </Button>
            </div>
          )}

          {/* Hint Section */}
          {canShowHint && !showHint && !showFeedback && (
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <span className="text-sm">
                {t('quiz.freeHintsLeft', { count: freeHintsLeft })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleHint}
                className="shrink-0"
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                {t('quiz.hint')}
              </Button>
            </div>
          )}

          {/* Show Hint */}
          {showHint && question.hints && question.hints[usedHints - 1] && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm leading-relaxed">
                  {question.hints && question.hints[usedHints - 1]}
                </p>
              </div>
            </div>
          )}

          {/* Submit/Next Button */}
          <div className="flex gap-2">
            {!showFeedback ? (
              <Button
                onClick={handleSubmit}
                disabled={!isAnswered}
                className="flex-1"
                size="lg"
              >
                {t('quiz.submit')}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex-1"
                size="lg"
              >
                {isLastQuestion ? t('quiz.finishQuiz') : t('quiz.nextQuestion')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Card */}
      {showFeedback && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-4 space-y-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-500">
                {t('quiz.correct')} {/* Simplified - will add correct/incorrect logic */}
              </div>
            </div>
            
            {/* Explanation */}
            <div>
              <h4 className="font-semibold text-sm mb-2">{t('quiz.explanation')}</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {question.explanationMd}
              </p>
            </div>

            {/* Sources */}
            {question.citations.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">{t('quiz.sources')}</h4>
                <div className="space-y-2">
                  {question.citations.map((citation) => (
                    <a
                      key={citation.id}
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>{citation.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
