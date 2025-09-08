'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createLocalizedPath } from '@/lib/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LoadingState } from '@/components/ui/loading-spinner';
import { ErrorState } from '@/components/ui/error-state';
import { ChevronRight } from 'lucide-react';
import { BreadcrumbNav, getBreadcrumbItems } from '@/components/ui/breadcrumb-nav';

interface TopicWithProgress {
  id: string;
  slug: string;
  title: string;
  description: string;
  totalQuestions: number;
  completedQuestions: number;
  progress: number;
}

export function LearnPage() {
  const [topics, setTopics] = useState<TopicWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const t = useTranslations('learn');
  const locale = useLocale();
  const router = useRouter();

  // Load real topic progress from API
  const loadTopicProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/topics/progress');
      const data = await response.json();
      
      if (data.success) {
        setTopics(data.topics);
      } else {
        throw new Error(data.error || 'Failed to load topics');
      }
    } catch (err) {
      console.error('Error loading topic progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to load topics');
      // Fallback to basic topic data without progress
      const fallback: TopicWithProgress[] = [
        {
          id: '1',
          slug: 'grundlagen', 
          title: 'Pflegegrundlagen',
          description: 'Basiswissen für die professionelle Pflege',
          totalQuestions: 2,
          completedQuestions: 0,
          progress: 0,
        },
        {
          id: '2',
          slug: 'hygiene',
          title: 'Hygiene & Infektionsschutz', 
          description: 'Hygienemaßnahmen und Infektionsprävention',
          totalQuestions: 2,
          completedQuestions: 0,
          progress: 0,
        },
        {
          id: '3',
          slug: 'medikamente',
          title: 'Medikamentengabe',
          description: 'Sichere Arzneimittelverabreichung',
          totalQuestions: 2,
          completedQuestions: 0,
          progress: 0,
        },
        {
          id: '4',
          slug: 'dokumentation',
          title: 'Pflegedokumentation', 
          description: 'Rechtssichere Dokumentation',
          totalQuestions: 2,
          completedQuestions: 0,
          progress: 0,
        }
      ];
      setTopics(fallback);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTopicProgress();
  }, [loadTopicProgress]);

  const handleTopicSelect = (slug: string) => {
    router.push(createLocalizedPath(locale, `/quiz/${slug}`));
  };

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <LoadingState message="Lade Themen..." />
      </MainLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <MainLayout>
        <ErrorState 
          title="Fehler beim Laden der Themen"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <BreadcrumbNav items={getBreadcrumbItems('learn', locale)} className="mb-6" />

        <div className="text-center">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('selectTopic')}</p>
        </div>

        {/* Topic List */}
        <div className="space-y-3">
          {topics.map((topic) => {
            const progressPercent = topic.progress || Math.round(
              (topic.completedQuestions / topic.totalQuestions) * 100
            );

            return (
              <Card key={topic.id} className="transition-colors hover:bg-card/80">
                <CardContent className="p-4">
                  <Button
                    onClick={() => handleTopicSelect(topic.slug)}
                    className="w-full p-0 h-auto bg-transparent hover:bg-transparent text-left"
                    variant="ghost"
                  >
                    <div className="w-full space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base leading-tight">
                            {topic.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                            {topic.description}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 mt-1 shrink-0 ml-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t('progress')}</span>
                          <span className="font-medium">
                            {t('questionsCompleted', {
                              completed: topic.completedQuestions,
                              total: topic.totalQuestions
                            })}
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
