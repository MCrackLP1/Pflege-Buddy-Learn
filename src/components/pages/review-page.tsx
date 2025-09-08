'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle, XCircle, BookOpen, Target, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createLocalizedPath } from '@/lib/navigation';

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
  const [, setError] = useState<string | null>(null);

  const t = useTranslations('review');
  const router = useRouter();

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center py-12"
        >
          <div className="text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg mx-auto"
            >
              <BookOpen className="w-8 h-8 text-white" />
            </motion.div>
            <p className="text-muted-foreground">Lade Verlauf...</p>
          </div>
        </motion.div>
      </MainLayout>
    );
  }

  if (reviewItems.length === 0) {
    return (
      <MainLayout>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12 space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg mx-auto"
          >
            <BookOpen className="w-12 h-12 text-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              📚 Noch keine Quiz-Historie
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Absolvieren Sie Ihr erstes Quiz, um hier Ihren Fortschritt zu sehen und zu lernen.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={() => router.push(createLocalizedPath('de', '/learn'))}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              <Target className="w-4 h-4 mr-2" />
              Jetzt mit dem Lernen beginnen
            </Button>
          </motion.div>
        </motion.div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Card */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden shadow-lg">
            <CardHeader className="text-center relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="flex justify-center mb-4"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <BookOpen className="h-8 h-8 text-white" />
                </div>
              </motion.div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                📚 {t('title')}
              </CardTitle>
              <p className="text-muted-foreground text-lg">Deine Quiz-Historie und Lernfortschritte</p>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Stats Overview */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6 space-y-3">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg"
                >
                  <CheckCircle className="h-6 w-6 text-white" />
                </motion.div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {reviewItems.filter(item => item.isCorrect).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  ✅ Richtig beantwortet
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6 space-y-3">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                  className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg"
                >
                  <TrendingUp className="h-6 w-6 text-white" />
                </motion.div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {reviewItems.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  📊 Fragen bearbeitet
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6 space-y-3">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="h-6 w-6 text-white" />
                </motion.div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round((reviewItems.filter(item => item.isCorrect).length / reviewItems.length) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  🎯 Genauigkeit
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Review Items */}
        <motion.div variants={itemVariants} className="space-y-4">
          {reviewItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className={`hover:shadow-lg transition-all duration-300 ${
                item.isCorrect
                  ? 'border-green-200 bg-gradient-to-r from-green-50/50 to-green-100/30 dark:from-green-900/20 dark:to-green-800/20'
                  : 'border-red-200 bg-gradient-to-r from-red-50/50 to-red-100/30 dark:from-red-900/20 dark:to-red-800/20'
              }`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 200 }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                        item.isCorrect
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                          : 'bg-gradient-to-br from-red-400 to-pink-500'
                      }`}
                    >
                      {item.isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-white" />
                      ) : (
                        <XCircle className="h-6 w-6 text-white" />
                      )}
                    </motion.div>
                    <div className="flex-1 space-y-3">
                      <p className="text-base leading-relaxed font-semibold">
                        {item.question}
                      </p>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-primary/10 border-primary/20">
                          {item.topic}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          📅 {new Date(item.completedAt).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Answers Comparison */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-muted-foreground">Deine Antwort:</span>
                      </div>
                      <div className={`p-3 rounded-lg font-medium ${
                        item.isCorrect
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {item.userAnswer}
                      </div>
                    </div>

                    {!item.isCorrect && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-muted-foreground">Richtige Antwort:</span>
                        </div>
                        <div className="p-3 rounded-lg font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          {item.correctAnswer}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Explanation */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">?</span>
                      </div>
                      <span className="font-semibold">Erklärung</span>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                        {item.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Sources */}
                  {item.citations.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-5 h-5 text-blue-500" />
                        <span className="font-semibold">Quellen</span>
                      </div>
                      <div className="space-y-2">
                        {item.citations.map((citation) => (
                          <motion.a
                            key={citation.id}
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <ExternalLink className="h-4 w-4 text-blue-500 group-hover:text-blue-600" />
                            <span className="text-sm text-blue-700 dark:text-blue-300 group-hover:text-blue-800 dark:group-hover:text-blue-200">
                              {citation.title}
                            </span>
                          </motion.a>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}