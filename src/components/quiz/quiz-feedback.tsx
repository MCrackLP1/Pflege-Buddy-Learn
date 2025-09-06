'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import type { QuestionWithChoices } from '@/lib/db/schema';

interface QuizFeedbackProps {
  question: QuestionWithChoices;
  isCorrect: boolean;
  showCorrectAnswer?: boolean;
  className?: string;
}

export function QuizFeedback({ 
  question, 
  isCorrect, 
  showCorrectAnswer = true,
  className 
}: QuizFeedbackProps) {
  const t = useTranslations();

  const getCorrectAnswer = () => {
    if (question.type === 'tf') {
      return question.tfCorrectAnswer ? t('quiz.true') : t('quiz.false');
    } else {
      return question.choices.find(c => c.isCorrect)?.label || 'Unbekannt';
    }
  };

  return (
    <Card className={`${
      isCorrect 
        ? 'border-green-500/20 bg-green-500/5' 
        : 'border-red-500/20 bg-red-500/5'
    } ${className || ''}`}>
      <CardContent className="p-4 space-y-4">
        {/* Result Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {isCorrect ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500" />
            )}
            <div className={`text-lg font-semibold ${
              isCorrect ? 'text-green-500' : 'text-red-500'
            }`}>
              {isCorrect ? t('quiz.correct') : t('quiz.incorrect')}
            </div>
          </div>
          
          {/* Show correct answer if user was wrong */}
          {!isCorrect && showCorrectAnswer && (
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm font-medium text-green-600 mb-1">
                Richtige Antwort:
              </p>
              <p className="text-sm font-medium text-green-700">
                {getCorrectAnswer()}
              </p>
            </div>
          )}
        </div>
        
        {/* Explanation */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">{t('quiz.explanation')}</h4>
          <div 
            className="text-sm text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: question.explanationMd }}
          />
        </div>

        {/* Sources */}
        {question.citations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">{t('quiz.sources')}</h4>
            <div className="space-y-2">
              {question.citations.map((citation) => (
                <a
                  key={citation.id}
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors group"
                  aria-label={`Externe Quelle: ${citation.title}`}
                >
                  <ExternalLink className="h-3 w-3 group-hover:scale-110 transition-transform" />
                  <span className="underline-offset-4 group-hover:underline">
                    {citation.title}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
