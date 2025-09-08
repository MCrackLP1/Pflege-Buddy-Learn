'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Flame, RotateCcw, Eye, Play, Sparkles, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuizResultsProps {
  correct: number;
  total: number;
  xp: number;
  onRestart: () => void;
  onReview: () => void;
}

export function QuizResults({ correct, total, xp, onRestart, onReview }: QuizResultsProps) {
  const t = useTranslations('results');
  const scorePercent = (correct / total) * 100;
  const isPerfectScore = correct === total;

  // Mock data for streak
  const newStreak = 6;
  const streakContinued = true;

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

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Results Card */}
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
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              🎉 {isPerfectScore ? 'Perfekt!' : t('title')}
            </CardTitle>
            <p className="text-muted-foreground text-lg">Deine Quiz-Ergebnisse</p>
          </CardHeader>

          <CardContent className="space-y-6 relative z-10">
            {/* Score Display */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center space-y-4"
            >
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {correct}/{total}
              </div>
              <div className="space-y-2">
                <Progress
                  value={scorePercent}
                  className="h-4 bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  {Math.round(scorePercent)}% korrekt beantwortet
                </p>
              </div>
            </motion.div>

            {/* Performance Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="flex justify-center"
            >
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                scorePercent >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                scorePercent >= 70 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
              }`}>
                {scorePercent >= 90 ? '🏆 Ausgezeichnet!' :
                 scorePercent >= 70 ? '👍 Gut gemacht!' :
                 '💪 Weiter üben!'}
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 gap-4">
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
                className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg"
              >
                <Star className="h-6 w-6 text-white" />
              </motion.div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">+{xp}</div>
              <div className="text-sm text-muted-foreground">
                ⭐ XP verdient
              </div>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 space-y-3">
              <motion.div
                animate={streakContinued ? {
                  scale: [1, 1.1, 1],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: streakContinued ? Infinity : 0,
                  ease: "easeInOut"
                }}
                className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg"
              >
                <Flame className="h-6 w-6 text-white" />
              </motion.div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{newStreak}</div>
              <div className="text-sm text-muted-foreground">
                🔥 Serie Tage
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        variants={itemVariants}
        className="space-y-4"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={onRestart}
            className="w-full h-14 text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
            size="lg"
          >
            <Play className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
            ⚡ Neue Session starten
            <Sparkles className="w-5 h-5 ml-3 group-hover:rotate-12 transition-transform" />
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Button
            onClick={onReview}
            variant="outline"
            className="w-full h-12 text-lg font-semibold group hover:bg-muted/50 transition-all duration-300"
            size="lg"
          >
            <Eye className="w-5 h-5 mr-3 group-hover:text-blue-500 transition-colors" />
            📖 Antworten überprüfen
          </Button>
        </motion.div>
      </motion.div>

      {/* Achievement Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <Target className="w-4 h-4" />
              <span>Weiter so! Jede Frage bringt dich deinem nächsten Milestone näher.</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
