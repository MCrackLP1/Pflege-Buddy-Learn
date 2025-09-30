'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Zap, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuizProgressProps {
  current: number;
  total: number;
}

export function QuizProgress({ current, total }: QuizProgressProps) {
  const progressPercent = (current / total) * 100;
  const isNearEnd = current >= total * 0.8; // Last 20% of questions

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -2 }}
      className="transition-all duration-300"
    >
      <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">

        <CardContent className="p-6 space-y-4 relative z-10">
          {/* Header with Quest Icon */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <Target className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  🎯 Quiz-Fortschritt
                </span>
                <p className="text-sm text-muted-foreground">
                  Frage {current} von {total}
                </p>
              </div>
            </div>

            {/* Progress Badge */}
            <Badge
              variant="outline"
              className={`${
                isNearEnd
                  ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300 text-yellow-700 dark:from-yellow-900/30 dark:to-orange-900/30 dark:border-yellow-600 dark:text-yellow-300'
                  : 'bg-gradient-to-r from-blue-100 to-green-100 border-blue-300 text-blue-700 dark:from-blue-900/30 dark:to-green-900/30 dark:border-blue-600 dark:text-blue-300'
              } font-bold px-4 py-2 shadow-sm`}
            >
              {isNearEnd ? (
                <>
                  <Trophy className="w-4 h-4 mr-2" />
                  Fast fertig!
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  {Math.round(progressPercent)}%
                </>
              )}
            </Badge>
          </div>

          {/* Modern Progress Bar */}
          <div className="relative">
            <div className="w-full h-8 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-500 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className={`h-full rounded-full transition-all duration-500 relative ${
                  isNearEnd
                    ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 shadow-yellow-500/50'
                    : 'bg-gradient-to-r from-blue-500 to-green-500 shadow-blue-500/50'
                } shadow-lg`}
              >
                {/* Enhanced Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-white/40 rounded-full" />

                {/* Animated Sparkle Effect */}
                {progressPercent > 0 && (
                  <motion.div
                    animate={{
                      x: ['-100%', '100%'],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"
                  />
                )}

                {/* Progress Particles */}
                {progressPercent > 10 && (
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg"
                  />
                )}
              </motion.div>
            </div>

            {/* Enhanced Progress Text Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm font-bold text-white drop-shadow-2xl bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm"
              >
                {current} / {total}
              </motion.span>
            </div>
          </div>

          {/* Enhanced Level Indicators */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {[...Array(Math.min(total, 10))].map((_, i) => {
                const isCompleted = i < current;
                const isCurrent = i === current - 1;
                const isVisible = i < 10 || current > i - 5; // Show more indicators as progress increases

                if (!isVisible && total > 10) {
                  return null;
                }

                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      isCompleted
                        ? isCurrent
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50 scale-125'
                          : 'bg-gradient-to-br from-green-400 to-blue-500 shadow-sm'
                        : 'bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500'
                    }`}
                  />
                );
              })}
              {total > 10 && current <= total - 5 && (
                <span className="text-xs text-muted-foreground ml-2">
                  +{total - 10}
                </span>
              )}
            </div>

            {/* Enhanced Achievement Preview */}
            {isNearEnd && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Trophy className="w-4 h-4" />
                </motion.div>
                <span className="text-sm font-semibold">Belohnung wartet! 🎉</span>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
