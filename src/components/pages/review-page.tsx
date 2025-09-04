'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle, XCircle } from 'lucide-react';

interface ReviewItem {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  topic: string;
  completedAt: string;
  citations: {
    id: string;
    url: string;
    title: string;
  }[];
}

export function ReviewPage() {
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const t = useTranslations('review');
  
  // Load real review data from API
  useEffect(() => {
    async function loadReviewData() {
      try {
        setLoading(true);
        const response = await fetch('/api/user/attempts');
        const data = await response.json();
        
        if (data.success) {
          setReviewItems(data.review_items);
        } else {
          throw new Error(data.error || 'Failed to load review data');
        }
      } catch (err) {
        console.error('Error loading review data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load review data');
        setReviewItems([]); // Empty state
      } finally {
        setLoading(false);
      }
    }
    
    loadReviewData();
  }, []);
  
  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Lade Verlauf...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (reviewItems.length === 0) {
    return (
      <MainLayout>
        <div className="text-center py-8 space-y-4">
          <div className="text-6xl">📚</div>
          <div>
            <h2 className="text-xl font-semibold mb-2">{t('noHistory')}</h2>
            <p className="text-muted-foreground">
              Absolvieren Sie Ihr erstes Quiz, um hier Ihren Fortschritt zu sehen.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>

        <div className="space-y-4">
          {reviewItems.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  {item.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-1 shrink-0" />
                  )}
                  <div className="flex-1 space-y-2">
                    <p className="text-sm leading-relaxed font-medium">
                      {item.question}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{item.topic}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.completedAt).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Answers */}
                <div className="grid gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="font-medium text-muted-foreground">
                      {t('yourAnswer')}:
                    </div>
                    <div className={`font-medium ${
                      item.isCorrect ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {item.userAnswer}
                    </div>
                  </div>
                  
                  {!item.isCorrect && (
                    <div className="space-y-1">
                      <div className="font-medium text-muted-foreground">
                        {t('correctAnswer')}:
                      </div>
                      <div className="font-medium text-green-400">
                        {item.correctAnswer}
                      </div>
                    </div>
                  )}
                </div>

                {/* Explanation */}
                <div className="space-y-2">
                  <div className="font-medium text-sm">{t('explanation')}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.explanation}
                  </p>
                </div>

                {/* Sources */}
                {item.citations.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-medium text-sm">Quellen</div>
                    <div className="space-y-1">
                      {item.citations.map((citation) => (
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
          ))}
        </div>
      </div>
    </MainLayout>
  );
}