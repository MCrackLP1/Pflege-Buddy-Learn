'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createLocalizedPath } from '@/lib/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shuffle, ChevronRight } from 'lucide-react';

export function LearnPage() {
  const t = useTranslations('learn');
  const locale = useLocale();
  const router = useRouter();

  // Mock topics data - will be replaced with real data from database
  const topics = [
    {
      id: '1',
      slug: 'grundlagen',
      title: 'Pflegegrundlagen',
      description: 'Basiswissen für die professionelle Pflege',
      totalQuestions: 45,
      completedQuestions: 12,
    },
    {
      id: '2', 
      slug: 'hygiene',
      title: 'Hygiene & Infektionsschutz',
      description: 'Hygienemaßnahmen und Infektionsprävention',
      totalQuestions: 30,
      completedQuestions: 8,
    },
    {
      id: '3',
      slug: 'medikamente',
      title: 'Medikamentengabe',
      description: 'Sichere Arzneimittelverabreichung',
      totalQuestions: 38,
      completedQuestions: 0,
    },
    {
      id: '4',
      slug: 'dokumentation',
      title: 'Pflegedokumentation',
      description: 'Rechtssichere Dokumentation',
      totalQuestions: 25,
      completedQuestions: 25,
    }
  ];

  const handleTopicSelect = (slug: string) => {
    router.push(createLocalizedPath(locale, `/quiz/${slug}`));
  };

  const handleRandomQuiz = () => {
    router.push(createLocalizedPath(locale, '/quiz/random'));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('selectTopic')}</p>
        </div>

        {/* Random Topic Option */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <Button
              onClick={handleRandomQuiz}
              className="w-full justify-between"
              variant="outline"
              size="lg"
            >
              <div className="flex items-center gap-3">
                <Shuffle className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{t('randomTopic')}</div>
                  <div className="text-xs text-muted-foreground">
                    Aus allen Themenbereichen
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Topic List */}
        <div className="space-y-3">
          {topics.map((topic) => {
            const progressPercent = Math.round(
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
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
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
