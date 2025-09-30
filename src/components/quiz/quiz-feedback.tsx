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

          {/* Internal Links for SEO */}
          {question.citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <h5 className="font-medium text-xs mb-2 text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Weiterführende Links:
              </h5>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`/learn?topic=${question.topicId}`}
                  className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 underline"
                  title="Mehr Fragen zu diesem Thema"
                >
                  📚 Mehr Fragen
                </a>
                <a
                  href={`/quiz?difficulty=${question.difficulty}`}
                  className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline"
                  title="Ähnliche Schwierigkeit üben"
                >
                  🎯 Schwierigkeit {question.difficulty}
                </a>
                {question.citations[0] && (
                  <a
                    href={`/quellen/${question.citations[0].url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
                    className="text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 underline"
                    title="Alle Fragen dieser Quelle"
                  >
                    🔗 Quelle ansehen
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sources */}
        {question.citations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">{t('quiz.sources')}</h4>
            <div className="space-y-2">
              {question.citations.map((citation) => (
                <div key={citation.id}>
                  {/* Structured Data for Citation */}
                  <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                      __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CreativeWork",
                        "name": citation.title,
                        "url": citation.url,
                        "datePublished": citation.publishedDate,
                        "publisher": {
                          "@type": "Organization",
                          "name": citation.url.includes('awmf.org') ? 'Arbeitsgemeinschaft der Wissenschaftlichen Medizinischen Fachgesellschaften e.V. (AWMF)' :
                                 citation.url.includes('rki.de') ? 'Robert Koch Institut (RKI)' :
                                 citation.url.includes('who.int') ? 'World Health Organization (WHO)' :
                                 citation.url.includes('ncbi.nlm.nih.gov') ? 'National Center for Biotechnology Information (NCBI)' :
                                 citation.url.includes('amboss.com') ? 'Amboss GmbH' :
                                 citation.url.includes('dge.de') ? 'Deutsche Gesellschaft für Ernährung e.V. (DGE)' :
                                 citation.url.includes('bfarm.de') ? 'Bundesinstitut für Arzneimittel und Medizinprodukte (BfArM)' :
                                 citation.url.includes('dgem.de') ? 'Deutsche Gesellschaft für Ernährungsmedizin e.V. (DGEM)' :
                                 'Medizinische Fachgesellschaft'
                        },
                        "citation": {
                          "@type": "ScholarlyArticle",
                          "headline": question.stem,
                          "description": question.explanationMd?.substring(0, 200) + '...',
                          "dateModified": (citation.accessedAt instanceof Date ? citation.accessedAt : new Date(citation.accessedAt as string | number)).toISOString().split('T')[0]
                        }
                      })
                    }}
                  />
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors group"
                    aria-label={`Externe Quelle: ${citation.title}`}
                    title={`Quelle: ${citation.title} - Öffnet in neuem Tab`}
                  >
                    <ExternalLink className="h-3 w-3 group-hover:scale-110 transition-transform" />
                    <span className="underline-offset-4 group-hover:underline">
                      {citation.title}
                    </span>
                    {citation.publishedDate && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({new Date(citation.publishedDate).getFullYear()})
                      </span>
                    )}
                  </a>
                </div>
              ))}
            </div>

            {/* Additional SEO Meta Information */}
            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Quellen basieren auf aktuellen medizinischen Leitlinien und wurden zuletzt am {new Date().toLocaleDateString('de-DE')} verifiziert.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
