'use client';

import { useState, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ExternalLink, Play, Zap, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuestionWithChoices } from '@/lib/db/schema';

interface QuizQuestionProps {
  question: QuestionWithChoices;
  answer: string | boolean | undefined;
  onAnswer: (questionId: string, answer: string | boolean) => void;
  onNext: () => void;
  onHintUsed: () => void;
  usedHints: number;
  isLastQuestion: boolean;
  hintsBalance: number;
  hintsLoading: boolean;
  isTransitioning?: boolean;
}

export function QuizQuestion({
  question,
  answer,
  onAnswer,
  onNext,
  onHintUsed,
  usedHints,
  isLastQuestion,
  hintsBalance,
  hintsLoading,
  isTransitioning = false
}: QuizQuestionProps) {
  const [showHint, setShowHint] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const t = useTranslations();

  // Ref to track current question ID for randomization stability
  const currentQuestionIdRef = useRef<string | null>(null);

  // Shuffle function for consistent randomization
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Memoized shuffled choices - only reshuffle when question changes
  const shuffledChoices = useMemo(() => {
    if (question.type !== 'mc' || !question.choices) return [];

    // Check if this is a new question
    if (currentQuestionIdRef.current !== question.id) {
      currentQuestionIdRef.current = question.id;
    }

    // Always shuffle for new questions or if no previous shuffle exists
    return shuffleArray(question.choices);
  }, [question.id, question.type, question.choices]);

  // Calculate if the current answer is correct
  const isCurrentAnswerCorrect = () => {
    if (answer === undefined) return false;
    
    if (question.type === 'tf') {
      return answer === question.tfCorrectAnswer;
    } else {
      const correctChoice = question.choices.find(c => c.isCorrect);
      return answer === correctChoice?.id;
    }
  };

  const handleSubmit = () => {
    setShowFeedback(true);
  };

  const handleHint = () => {
    setShowHint(true);
    onHintUsed();
  };

  const handleNext = () => {
    setShowFeedback(false);
    setShowHint(false);
    onNext();
  };

  const isAnswered = answer !== undefined;
  const canShowHint = question.hints && question.hints.length > usedHints && hintsBalance > 0;

  return (
    <div className="flex flex-col h-full md:h-auto">
      {/* Mobile-Optimized Layout */}
      <div className="flex flex-col h-full md:h-auto">
        {/* Fixed Header - Question Info */}
        <div className="flex-shrink-0 pb-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline">
                <Zap className="w-3 h-3 mr-1" />
                {question.type === 'mc' ? 'Multiple Choice' : 'True/False'}
              </Badge>

              {/* Difficulty Display - Gaming Style */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < question.difficulty
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-sm'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <h2 className="text-xl leading-relaxed font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              {question.stem}
            </h2>
          </motion.div>
        </div>

        {/* Scrollable Content - Answers */}
        <div className="flex-1 overflow-y-auto pb-6 md:overflow-visible md:flex-1 md:min-h-0">
          <div className="space-y-6">
            {/* Answer Options - Gaming Style */}
            {question.type === 'mc' ? (
              <RadioGroup
                value={answer as string || ""}
                onValueChange={(value) => !showFeedback && onAnswer(question.id, value)}
                disabled={showFeedback}
                className="space-y-4"
              >
                {shuffledChoices.map((choice, index) => {
                  const isSelected = answer === choice.id;
                  return (
                    <motion.div
                      key={choice.id}
                      whileHover={!showFeedback ? { scale: 1.02 } : {}}
                      whileTap={!showFeedback ? { scale: 0.98 } : {}}
                      className={`relative group transition-all duration-200 ${
                        isSelected ? 'transform scale-[1.02]' : ''
                      } ${showFeedback ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                    >
                      <div className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/40 dark:to-green-900/40 shadow-lg shadow-blue-500/20'
                          : `border-gray-200 dark:border-gray-700 ${!showFeedback ? 'hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20' : ''}`
                      }`}>
                        <RadioGroupItem value={choice.id} id={choice.id} className="border-2" />
                        <Label
                          htmlFor={choice.id}
                          className={`flex-1 text-base leading-relaxed font-medium ${
                            showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                          <span className="text-gray-400 dark:text-gray-500 text-sm mr-2">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          {choice.label}
                        </Label>
                      </div>
                    </motion.div>
                  );
                })}
              </RadioGroup>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: true, label: t('quiz.true'), color: 'from-green-400 to-emerald-500', icon: CheckCircle2 },
                  { value: false, label: t('quiz.false'), color: 'from-red-400 to-pink-500', icon: XCircle }
                ].map(({ value, label, color, icon: Icon }) => (
                  <motion.div
                    key={String(value)}
                    whileHover={!showFeedback ? { scale: 1.05 } : {}}
                    whileTap={!showFeedback ? { scale: 0.95 } : {}}
                  >
                    <Button
                      variant={answer === value ? "default" : "outline"}
                      onClick={() => !showFeedback && onAnswer(question.id, value)}
                      disabled={showFeedback}
                      className={`h-auto py-6 px-6 text-lg font-bold border-2 relative overflow-hidden group ${
                        answer === value
                          ? `bg-gradient-to-r ${color} text-white shadow-lg hover:shadow-xl shadow-${color.split('-')[0]}-500/30`
                          : `hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 ${showFeedback ? 'cursor-not-allowed opacity-75' : ''}`
                      }`}
                    >
                      {answer === value && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      )}
                      <Icon className="w-5 h-5 mr-2" />
                      {label}
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Power-Up Hint Section */}
            <AnimatePresence>
              {canShowHint && !showHint && !showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="relative"
                >
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200/50 dark:border-yellow-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{
                          boxShadow: [
                            "0 0 0 0 rgba(251, 191, 36, 0.4)",
                            "0 0 0 8px rgba(251, 191, 36, 0)",
                          ]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center"
                      >
                        <Lightbulb className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <p className="font-semibold text-yellow-700 dark:text-yellow-300">💡 Power-Up verfügbar!</p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                          {hintsLoading ? 'Lade Hints...' : `${hintsBalance} Hints verfügbar`}
                        </p>
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={handleHint}
                        disabled={hintsLoading}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Hint nutzen
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Show Hint - Power-Up Style */}
            <AnimatePresence>
              {showHint && question.hints && question.hints[usedHints - 1] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="relative"
                >
                  <div className="p-4 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-green-500/10 border-2 border-blue-300/50 dark:border-blue-600/50 rounded-xl backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                        className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      >
                        <Lightbulb className="w-4 h-4 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <p className="font-semibold text-blue-700 dark:text-blue-300 mb-2">💡 Hint aktiviert!</p>
                        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-200">
                          {question.hints[usedHints - 1]}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hint Display */}
            <AnimatePresence>
              {showHint && question.hints && question.hints[usedHints - 1] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-blue-700 dark:text-blue-300 mb-2">💡 Hint aktiviert!</p>
                      <p className="text-base leading-relaxed text-gray-700 dark:text-gray-200">
                        {question.hints[usedHints - 1]}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Fixed Footer - Navigation Buttons */}
        <div className="flex-shrink-0 pt-4 border-t border-border md:border-t-0 md:pt-6">
          <div className="flex gap-3">
            {!showFeedback ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  onClick={handleSubmit}
                  disabled={!isAnswered}
                  className="w-full h-14 text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Button Animation Effect */}
                  {isAnswered && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  <Play className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                  ✨ Antwort prüfen
                </Button>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  onClick={handleNext}
                  disabled={isTransitioning}
                  className="w-full h-14 text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  {isTransitioning ? (
                    <>
                      <div className="w-6 h-6 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Speichere Antwort...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6 mr-2 group-hover:rotate-12 transition-transform" />
                      {isLastQuestion ? '🏆 Quiz beenden' : '➡️ Nächste Frage'}
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Hint Button */}
            {canShowHint && !showFeedback && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleHint}
                  variant="outline"
                  size="lg"
                  className="h-14 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Hint ({hintsBalance})
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }
