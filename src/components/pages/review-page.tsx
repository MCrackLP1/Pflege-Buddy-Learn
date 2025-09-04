'use client';

import { useTranslations } from 'next-intl';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle, XCircle } from 'lucide-react';

export function ReviewPage() {
  const t = useTranslations('review');
  
  // Mock review data - will be replaced with real data from database
  const reviewItems = [
    {
      id: '1',
      question: 'Was ist die normale Körpertemperatur eines gesunden Erwachsenen?',
      userAnswer: '36,1°C - 37,2°C',
      correctAnswer: '36,1°C - 37,2°C',
      isCorrect: true,
      explanation: 'Die normale Körpertemperatur liegt zwischen 36,1°C und 37,2°C.',
      topic: 'Pflegegrundlagen',
      completedAt: new Date('2024-01-15T10:30:00'),
      citations: [
        {
          id: 'c1',
          url: 'https://www.rki.de/DE/Content/InfAZ/F/Fieber/Fieber_node.html',
          title: 'RKI - Fieber',
        }
      ]
    },
    {
      id: '2',
      question: 'Händedesinfektion sollte mindestens 30 Sekunden dauern.',
      userAnswer: 'Falsch',
      correctAnswer: 'Wahr',
      isCorrect: false,
      explanation: 'Händedesinfektion sollte mindestens 30 Sekunden durchgeführt werden.',
      topic: 'Hygiene & Infektionsschutz',
      completedAt: new Date('2024-01-15T10:25:00'),
      citations: [
        {
          id: 'c2',
          url: 'https://www.who.int/gpsc/5may/Hand_Hygiene_Why_How_and_When_Brochure.pdf',
          title: 'WHO Hand Hygiene Guidelines',
        }
      ]
    }
  ];

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
                        {item.completedAt.toLocaleDateString('de-DE')}
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
