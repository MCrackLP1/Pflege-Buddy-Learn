'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, BookOpen, Award, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface SourcePageProps {
  sourceName: string;
  sourceUrl: string;
  description: string;
  questionCount: number;
  topics: string[];
  lastUpdated: string;
  authority: string;
  relatedQuestions?: Array<{
    id: string;
    stem: string;
    topic: string;
    difficulty: number;
  }>;
}

export function SourcePage({
  sourceName,
  sourceUrl,
  description,
  questionCount,
  topics,
  lastUpdated,
  authority,
  relatedQuestions = []
}: SourcePageProps) {
  const getAuthorityBadgeColor = (authority: string) => {
    switch (authority.toLowerCase()) {
      case 'hoch':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'mittel':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'niedrig':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Award className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Medizinische Quelle
            </h1>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            {sourceName}
          </h2>

          <div className="flex items-center justify-center gap-4 mb-6">
            <Badge className={getAuthorityBadgeColor(authority)}>
              <Award className="w-3 h-3 mr-1" />
              {authority} Autorität
            </Badge>
            <Badge variant="outline">
              <BookOpen className="w-3 h-3 mr-1" />
              {questionCount} Fragen
            </Badge>
            <Badge variant="outline">
              <Calendar className="w-3 h-3 mr-1" />
              Aktualisiert: {new Date(lastUpdated).toLocaleDateString('de-DE')}
            </Badge>
          </div>

          {/* Structured Data for Source Organization */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": sourceName,
                "url": sourceUrl,
                "description": description,
                "knowsAbout": topics,
                "publishes": {
                  "@type": "EducationalOccupationalCredential",
                  "name": "Pflegefachwissen",
                  "educationalLevel": "Professional",
                  "numberOfCredits": questionCount
                }
              })
            }}
          />
        </motion.div>

        {/* Source Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Über diese Quelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
                {description}
              </p>

              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-600" />
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline font-medium"
                  title={`Zur Originalquelle: ${sourceName}`}
                >
                  Originalquelle besuchen
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Topics Covered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Abgedeckte Themen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic, index) => (
                  <motion.div
                    key={topic}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Badge variant="secondary" className="text-sm py-2 px-3">
                      {topic}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Related Questions */}
        {relatedQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Zugehörige Fragen ({relatedQuestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {relatedQuestions.slice(0, 10).map((question, index) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                            {question.stem}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {question.topic}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Schwierigkeit: {question.difficulty}/5
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {relatedQuestions.length > 10 && (
                    <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                      Und {relatedQuestions.length - 10} weitere Fragen...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* SEO Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-4xl mx-auto mt-12 text-center"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Warum vertrauen wir dieser Quelle?
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex flex-col items-center">
                <Award className="w-6 h-6 text-green-600 mb-2" />
                <span>Wissenschaftliche Exzellenz</span>
              </div>
              <div className="flex flex-col items-center">
                <Calendar className="w-6 h-6 text-blue-600 mb-2" />
                <span>Regelmäßige Aktualisierung</span>
              </div>
              <div className="flex flex-col items-center">
                <Users className="w-6 h-6 text-purple-600 mb-2" />
                <span>Fachliche Expertise</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
