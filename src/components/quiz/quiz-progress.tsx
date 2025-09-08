'use client';

import { useTranslations } from 'next-intl';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Zap, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuizProgressProps {
  current: number;
  total: number;
}

export function QuizProgress({ current, total }: QuizProgressProps) {
  const t = useTranslations('quiz');
  const progressPercent = (current / total) * 100;
  const isNearEnd = current >= total * 0.8; // Last 20% of questions
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden border-2 border-blue-200/50 dark:border-blue-700/50 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 shadow-lg">
        {/* Quest Progress Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10 opacity-50" />
        
        <CardContent className="p-4 space-y-4 relative z-10">
          {/* Header with Quest Icon */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-sm">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-base font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  🎯 Quest-Fortschritt
                </span>
                <p className="text-xs text-muted-foreground">
                  Frage {current} von {total}
                </p>
              </div>
            </div>
            
            {/* Progress Badge */}
            <Badge 
              variant="outline" 
              className={`${
                isNearEnd 
                  ? 'bg-yellow-100 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-600 dark:text-yellow-300'
                  : 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300'
              } font-bold px-3 py-1`}
            >
              {isNearEnd ? (
                <>
                  <Trophy className="w-3 h-3 mr-1" />
                  Fast geschafft!
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3 mr-1" />
                  {Math.round(progressPercent)}%
                </>
              )}
            </Badge>
          </div>
          
          {/* Energy Bar Style Progress */}
          <div className="relative">
            <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full transition-all duration-300 relative ${
                  isNearEnd 
                    ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500' 
                    : 'bg-gradient-to-r from-blue-400 via-blue-500 to-green-500'
                } shadow-lg`}
              >
                {/* Energy Bar Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/30 rounded-full" />
                
                {/* Animated Energy Pulse */}
                {progressPercent > 0 && (
                  <motion.div
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
                  />
                )}
              </motion.div>
            </div>
            
            {/* Progress Text Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm font-bold drop-shadow-lg transition-colors duration-300 ${
                progressPercent > 50 ? 'text-white' : 'text-gray-700 dark:text-gray-200'
              }`}>
                {current} / {total}
              </span>
            </div>
          </div>
          
          {/* Level Indicators */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              {[...Array(total)].map((_, i) => {
                const isCompleted = i < current;
                const isCurrent = i === current - 1;
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      isCompleted 
                        ? isCurrent 
                          ? 'bg-yellow-400 shadow-lg scale-125' 
                          : 'bg-green-500 shadow-sm' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                );
              })}
            </div>
            
            {/* Achievement Preview */}
            {isNearEnd && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400"
              >
                <Trophy className="w-3 h-3" />
                <span className="text-xs font-semibold">Belohnung wartet!</span>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
