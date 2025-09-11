'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ExternalLink, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { createLocalizedPath } from '@/lib/navigation';

interface RelatedQuestion {
  id: string;
  stem: string;
  topic: string;
  difficulty: number;
  sourceUrl?: string;
  sourceTitle?: string;
}

interface RelatedQuestionsProps {
  questions: RelatedQuestion[];
  currentQuestionId?: string;
  title?: string;
  maxItems?: number;
}

export function RelatedQuestions({
  questions,
  currentQuestionId,
  title = "Verwandte Fragen",
  maxItems = 5
}: RelatedQuestionsProps) {
  const t = useTranslations();
  const locale = useLocale();

  const filteredQuestions = questions
    .filter(q => q.id !== currentQuestionId)
    .slice(0, maxItems);

  if (filteredQuestions.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-8"
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-blue-600" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredQuestions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={createLocalizedPath(locale, `quiz/${question.id}`)}
                      className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
                      title={question.stem}
                    >
                      {question.stem}
                    </Link>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {question.topic}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Level {question.difficulty}
                      </Badge>
                    </div>

                    {/* Source Link for SEO */}
                    {question.sourceUrl && question.sourceTitle && (
                      <div className="mt-2">
                        <a
                          href={question.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                          title={`Quelle: ${question.sourceTitle}`}
                        >
                          <ExternalLink className="w-3 h-3" />
                          {question.sourceTitle}
                        </a>
                      </div>
                    )}
                  </div>

                  <Link
                    href={createLocalizedPath(locale, `quiz/${question.id}`)}
                    className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Zur Frage"
                  >
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                  </Link>
                </div>
              </motion.div>
            ))}

            {questions.length > maxItems && (
              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={createLocalizedPath(locale, 'learn')}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  Alle Fragen ansehen →
                </Link>
              </div>
            )}
          </div>

          {/* Structured Data for Related Questions */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": title,
                "numberOfItems": filteredQuestions.length,
                "itemListElement": filteredQuestions.map((question, index) => ({
                  "@type": "ListItem",
                  "position": index + 1,
                  "item": {
                    "@type": "Question",
                    "name": question.stem,
                    "educationalLevel": `Schwierigkeitsgrad ${question.difficulty}`,
                    "teaches": question.topic,
                    "url": `/quiz/${question.id}`
                  }
                }))
              })
            }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
