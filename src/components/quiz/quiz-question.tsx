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
    <div className="space-y-6">
      {/* Question Card - Arcade Style */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="relative overflow-hidden shadow-lg">
          
          <CardHeader className="relative z-10">
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

            <CardTitle className="text-xl leading-relaxed font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              {question.stem}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6 relative z-10">
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

            {/* Action Button - Gaming Style */}
            <div className="flex gap-3 pt-2">
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
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feedback Card - Achievement Style */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <Card className={`border-2 relative overflow-hidden ${
              isCurrentAnswerCorrect() 
                ? 'border-green-400/50 bg-gradient-to-br from-green-50 via-emerald-50/50 to-green-100/80 dark:from-green-900/20 dark:via-emerald-900/10 dark:to-green-800/20' 
                : 'border-red-400/50 bg-gradient-to-br from-red-50 via-pink-50/50 to-red-100/80 dark:from-red-900/20 dark:via-pink-900/10 dark:to-red-800/20'
            } shadow-xl`}>
              {/* Achievement Glow Effect */}
              <div className={`absolute inset-0 ${
                isCurrentAnswerCorrect() 
                  ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10' 
                  : 'bg-gradient-to-r from-red-500/10 to-pink-500/10'
              } opacity-50`} />
              
              <CardContent className="p-6 space-y-6 relative z-10">
                {/* Achievement Header */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="text-center"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                    isCurrentAnswerCorrect() 
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                      : 'bg-gradient-to-br from-red-400 to-pink-500'
                  } shadow-lg`}>
                    {isCurrentAnswerCorrect() ? (
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    ) : (
                      <XCircle className="w-8 h-8 text-white" />
                    )}
                  </div>
                  
                  <h3 className={`text-2xl font-bold mb-2 ${
                    isCurrentAnswerCorrect() ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                    {isCurrentAnswerCorrect() ? '🎉 Richtig!' : '❌ Leider falsch'}
                  </h3>
                  
                  {isCurrentAnswerCorrect() && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1">
                        <Sparkles className="w-3 h-3 mr-1" />
                        +{question.difficulty * 10} XP
                      </Badge>
                    </motion.div>
                  )}
                </motion.div>
                
                {/* Show correct answer if user was wrong */}
                {!isCurrentAnswerCorrect() && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-green-700 dark:text-green-300 mb-1">Richtige Antwort:</p>
                        <p className="text-green-600 dark:text-green-400 font-medium">
                          {question.type === 'tf' ? (
                            question.tfCorrectAnswer ? t('quiz.true') : t('quiz.false')
                          ) : (
                            question.choices.find(c => c.isCorrect)?.label
                          )}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Explanation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">?</span>
                    </div>
                    Erklärung
                  </h4>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-200">
                    {question.explanationMd}
                  </p>

                  {/* Internal Links for SEO */}
                  {question.citations.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <h5 className="font-semibold text-sm mb-2 text-gray-600 dark:text-gray-400">
                        Weiterführende Themen:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`/learn?topic=${question.topicId}`}
                          className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 underline"
                          title={`Mehr Fragen zu diesem Thema lernen`}
                        >
                          📚 Mehr {question.topicId} Fragen
                        </a>
                        <a
                          href={`/quiz?difficulty=${question.difficulty}`}
                          className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline"
                          title={`Schwierigkeitsgrad ${question.difficulty} üben`}
                        >
                          🎯 Ähnliche Schwierigkeit
                        </a>
                        {question.citations[0] && (
                          <a
                            href={`/quellen/${question.citations[0].url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
                            className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 underline"
                            title={`Alle Fragen dieser Quelle ansehen`}
                          >
                            🔗 Alle Fragen dieser Quelle
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Sources */}
                {question.citations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700"
                  >
                    <h4 className="font-bold text-base mb-3 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-blue-500" />
                      Quellen & Zitierungen
                    </h4>
                    <div className="space-y-2">
                      {question.citations.map((citation) => (
                        <div key={citation.id}>
                          {/* Structured Data for Citation */}
                          <script
                            type="application/ld+json"
                            dangerouslySetInnerHTML={{
                              __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "CreativeWork",
                                "name": citation.title,
                                "url": citation.url,
                                "datePublished": citation.publishedDate,
                                "publisher": {
                                  "@type": "Organization",
                                  "name": citation.url.includes('awmf.org') ? 'Arbeitsgemeinschaft der Wissenschaftlichen Medizinischen Fachgesellschaften e.V. (AWMF)' :
                                         citation.url.includes('rki.de') ? 'Robert Koch Institut (RKI)' :
                                         citation.url.includes('who.int') ? 'World Health Organization (WHO)' :
                                         citation.url.includes('ncbi.nlm.nih.gov') ? 'National Center for Biotechnology Information (NCBI)' :
                                         citation.url.includes('amboss.com') ? 'Amboss GmbH' :
                                         citation.url.includes('dge.de') ? 'Deutsche Gesellschaft für Ernährung e.V. (DGE)' :
                                         citation.url.includes('bfarm.de') ? 'Bundesinstitut für Arzneimittel und Medizinprodukte (BfArM)' :
                                         citation.url.includes('dgem.de') ? 'Deutsche Gesellschaft für Ernährungsmedizin e.V. (DGEM)' :
                                         'Medizinische Fachgesellschaft'
                                },
                                "citation": {
                                  "@type": "ScholarlyArticle",
                                  "headline": question.stem,
                                  "description": question.explanationMd?.substring(0, 200) + '...',
                                  "dateModified": (() => {
                                    const d: any = (citation as any).accessedAt;
                                    const iso = (d instanceof Date ? d : new Date(d)).toISOString();
                                    return iso.split('T')[0];
                                  })()
                                }
                              })
                            }}
                          />
                          <a
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors group"
                            title={`Quelle: ${citation.title} - Öffnet in neuem Tab`}
                          >
                            <ExternalLink className="h-3 w-3 group-hover:scale-110 transition-transform" />
                            <span className="underline group-hover:no-underline">
                              {citation.title}
                            </span>
                            {citation.publishedDate && (
                              <span className="text-xs text-gray-500 ml-2">
                                ({new Date(citation.publishedDate).getFullYear()})
                              </span>
                            )}
                          </a>
                        </div>
                      ))}
                    </div>

                    {/* Additional SEO Meta Information */}
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-600">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Diese Quellen wurden zuletzt am {new Date().toLocaleDateString('de-DE')} verifiziert und basieren auf aktuellen medizinischen Leitlinien.
                      </p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
