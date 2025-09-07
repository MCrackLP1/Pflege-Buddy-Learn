'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { AuthCard } from '@/components/auth/auth-card';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import { CookieBanner } from '@/components/legal/cookie-banner';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Head from 'next/head';
import { motion, useAnimation, useInView } from 'framer-motion';
import React from 'react';
import { useOptimizedAnimation } from '@/hooks/useOptimizedAnimation';
import { shouldDisableAnimations, getOptimizedVariants } from '@/lib/utils/performance';
import {
  Brain,
  BookOpen,
  Target,
  Clock,
  Award,
  Shield,
  Heart,
  Sparkles,
  ArrowRight,
  Play,
  ChevronDown,
  User,
  CheckCircle,
  Instagram,
  Star,
  Users,
  type LucideIcon
} from 'lucide-react';

// Loading Animation Component
function LoadingAnimation() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 animate-spin opacity-75"></div>
            <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-800"></div>
            <Heart className="w-8 h-8 text-blue-600 absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            PflegeBuddy Learn lädt...
          </h2>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Feature Card Component
function FeatureCard({ icon: Icon, title, description, delay = 0, link }: {
  icon: LucideIcon,
  title: string,
  description: string,
  delay?: number,
  link?: string
}) {
  const { shouldAnimate, getTransition } = useOptimizedAnimation({ delay });

  const cardContent = (
    <Card className="h-full transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 bg-gradient-to-br from-card to-card/95 border-border/50 group-hover:border-primary/30">
      <CardHeader className="pb-4">
        <motion.div
          className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300"
          whileHover={shouldAnimate ? { rotate: 5, scale: 1.1 } : {}}
        >
          <Icon className="w-7 h-7 text-primary-foreground" />
        </motion.div>
        <CardTitle className="text-lg xs:text-xl font-semibold group-hover:text-primary transition-colors duration-300">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm xs:text-base leading-relaxed">
          {description}
        </CardDescription>
        <motion.div
          className="mt-4 h-1 bg-gradient-to-r from-primary/20 to-primary/40 rounded-full overflow-hidden"
          initial={shouldAnimate ? { scaleX: 0 } : { scaleX: 1 }}
          whileInView={shouldAnimate ? { scaleX: 1 } : { scaleX: 1 }}
          transition={getTransition({ delay: delay + 0.3, duration: 0.8 })}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
            initial={shouldAnimate ? { x: "-100%" } : { x: "0%" }}
            whileInView={shouldAnimate ? { x: "100%" } : { x: "0%" }}
            transition={getTransition({ delay: delay + 0.5, duration: 1.2 })}
          />
        </motion.div>
      </CardContent>
    </Card>
  );

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }}
      animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      transition={getTransition()}
      whileHover={shouldAnimate ? { y: -8, scale: 1.02 } : {}}
      className="group"
    >
      {link ? (
        <a href={link} className="block h-full min-h-[44px] touch-manipulation">
          {cardContent}
        </a>
      ) : (
        cardContent
      )}
    </motion.div>
  );
}

function CategoryCard({ icon: Icon, title, description, example, link }: {
  icon: LucideIcon;
  title: string;
  description: string;
  example?: { question: string; answer: string };
  link?: string;
}) {
  const categoryContent = (
    <Card className="h-full transition-all duration-300 hover:shadow-lg group">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      {example && (
        <CardContent>
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium mb-1">Beispiel-Frage:</p>
            <p className="text-sm text-muted-foreground mb-1">{example.question}</p>
            <p className="text-xs text-primary">Antwort: {example.answer}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );

  return link ? (
    <a href={link} className="block h-full min-h-[44px] touch-manipulation">
      {categoryContent}
    </a>
  ) : categoryContent;
}

function ProcessStep({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-xl">
        {step}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

// Floating Card Component
const FloatingCard = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const { shouldAnimate, getTransition } = useOptimizedAnimation({ delay });

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
      animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      transition={getTransition()}
      whileHover={shouldAnimate ? { y: -5, scale: 1.02 } : {}}
      className={`bg-background/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-lg ${className}`}
    >
      {children}
    </motion.div>
  )
}

// Animated Counter Component - handles both numbers and text
const AnimatedCounter = ({ value, duration = 2 }: { value: string, duration?: number }) => {
  const [count, setCount] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const ref = React.useRef(null)
  const isInView = useInView(ref)

  useEffect(() => {
    // Check if value is purely numeric (like "250", "14")
    const isNumeric = /^\d+$/.test(value)

    if (isNumeric && isInView) {
      const numericValue = parseInt(value)
      let start = 0
      const increment = numericValue / (duration * 60)

      const timer = setInterval(() => {
        start += increment
        if (start >= numericValue) {
          setCount(numericValue)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 1000 / 60)

      return () => clearInterval(timer)
    } else if (!isNumeric) {
      // For non-numeric values like "24/7", show immediately
      setDisplayText(value)
    }
  }, [isInView, value, duration])

  const isNumeric = /^\d+$/.test(value)
  return <span ref={ref}>{isNumeric ? count.toLocaleString() : displayText}</span>
}

// Modern Hero Section Component
function ModernHeroSection() {
  const { shouldAnimate, getTransition, variants } = useOptimizedAnimation();
  const controls = useAnimation()
  const [isVisible, setIsVisible] = useState(false)
  const tHomeHero = useTranslations('components.homeHero');

  useEffect(() => {
    if (shouldAnimate) {
      setIsVisible(true)
      controls.start("visible")
    }
  }, [controls, shouldAnimate])

  const containerVariants = shouldAnimate ? {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  } : {
    hidden: { opacity: 1 },
    visible: { opacity: 1 }
  }

  const itemVariants = shouldAnimate ? {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  } : {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 }
  }

  const stats = [
    { value: "14", label: "Themenbereiche", icon: <BookOpen className="w-5 h-5" /> },
    { value: "+1392", label: "Fragen", icon: <BookOpen className="w-5 h-5" /> },
    { value: "24/7", label: "Verfügbar", icon: <Users className="w-5 h-5" /> }
  ]

  const features = [
    "Erfahrungspunkte sammeln",
    "Intelligente Hinweise",
    "Lernfortschritt verfolgen",
    "Tägliche Lernserie"
  ]

  const trustIndicators = [
    {
      title: "Medizinisch fundiert",
      description: "Alle Inhalte basieren auf aktuellen medizinischen Leitlinien und werden regelmäßig aktualisiert",
      icon: <Shield className="w-6 h-6" />
    },
    {
      title: "DSGVO-konform",
      description: "Ihre Daten sind sicher und werden streng vertraulich behandelt",
      icon: <Heart className="w-6 h-6" />
    },
    {
      title: "Für Profis entwickelt",
      description: "Spezialisiert auf die Bedürfnisse von Pflegefachkräften und medizinischem Personal",
      icon: <Award className="w-6 h-6" />
    }
  ]

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/20 dark:bg-blue-800/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-200/20 dark:bg-green-800/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid lg:grid-cols-2 gap-12 items-center min-h-screen"
        >
          {/* Left Column - Content */}
          <div className="space-y-8">
            <motion.div variants={itemVariants} className="space-y-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                <Sparkles className="w-4 h-4 mr-2" />
                Für professionelle Pflegekräfte
              </Badge>

              <motion.h2
                variants={itemVariants}
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase"
              >
                Medizinisch fundiert & DSGVO-konform
              </motion.h2>

              <motion.h1
                variants={itemVariants}
                className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
              >
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-blue-600 dark:text-blue-400"
                >
                  Ihr digitaler Pflegeassistent{' '}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-foreground"
                >
                  für Fachwissen & Weiterbildung
                </motion.span>
              </motion.h1>

              {/* SEO-optimized hidden H1 for screen readers and search engines */}
              <h1 className="sr-only">
                PflegeBuddy Learn - Ihr digitaler Pflegeassistent für Fachwissen & Weiterbildung
              </h1>

              <motion.p
                variants={itemVariants}
                className="text-base xs:text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl"
              >
                {tHomeHero('description')}
              </motion.p>
            </motion.div>

            {/* Features List */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-xs xs:text-sm font-medium text-foreground">{feature}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto sm:mx-0">
              <Button
                size="lg"
                onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold group w-full min-h-[48px] touch-manipulation"
                aria-label={`${tHomeHero('primaryCta')} - Jetzt mit dem Lernen beginnen`}
              >
                {tHomeHero('primaryCta')}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold group w-full min-h-[48px] touch-manipulation"
                aria-label={`${tHomeHero('secondaryCta')} - Erfahre mehr über unsere Features`}
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" aria-hidden="true" />
                {tHomeHero('secondaryCta')}
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-6 pt-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-2 text-blue-600 dark:text-blue-400">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Column - Visual Elements */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-6">
              {/* Main Feature Card */}
              <FloatingCard delay={0.5} className="col-span-2">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Komplette Lernplattform</h3>
                    <p className="text-sm text-muted-foreground">
                      <a href="/de/learn" className="text-blue-600 hover:text-blue-700 underline">
                        14 Fachbereiche sofort verfügbar
                      </a>
                    </p>
                  </div>
                </div>
                <div className="w-full h-2 bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 2 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center">
                  <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                  Vollständig verfügbar - Start jederzeit möglich
                </p>
              </FloatingCard>

              {/* Stats Card */}
              <FloatingCard delay={0.7}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    <AnimatedCounter value="+1392" />
                  </div>
                  <p className="text-sm text-muted-foreground">Fragen</p>
                </div>
              </FloatingCard>

              {/* Community Card */}
              <FloatingCard delay={0.9}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    <AnimatedCounter value="14" />
                  </div>
                  <p className="text-sm text-muted-foreground">Fachbereiche</p>
                </div>
              </FloatingCard>

              {/* Trust Indicators Card */}
              <FloatingCard delay={1.1} className="col-span-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Warum PflegeBuddy vertrauen?
                  </h3>
                  <div className="space-y-3">
                    {trustIndicators.map((indicator, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="text-blue-600 dark:text-blue-400">
                            {indicator.icon}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{indicator.title}</p>
                          <p className="text-xs text-muted-foreground">{indicator.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FloatingCard>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Name Input Modal Component
function NameInputModal({ onSave, onSkip }: { onSave: (name: string) => void; onSkip: () => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const tComponents = useTranslations('components');

  const handleSave = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onSave(name.trim());
    } catch (error) {
      console.error('Error saving name:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Willkommen bei PflegeBuddy Learn! 🎉
          </h2>

          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
            Wie sollen wir dich nennen? Dieser Name wird in deinem Profil angezeigt.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Anzeigename
              </label>
              <input
                id="displayName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Anna Schmidt"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && name.trim()) {
                    handleSave();
                  }
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onSkip}
                className="flex-1 px-4 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Überspringen
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim() || loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
              >
                {loading ? tComponents('saving') : tComponents('saving2')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  const { session, loading } = useAuth();
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [showNameModal, setShowNameModal] = useState(false);

  // Translations
  const tErrors = useTranslations('errors');
  const tComponents = useTranslations('components');
  const tHomeHero = useTranslations('components.homeHero');
  const tHomeFeatures = useTranslations('components.homeFeatures');
  const tHomeCategories = useTranslations('components.homeCategories');
  const tHomeProcess = useTranslations('components.homeProcess');
  const tHomeCta = useTranslations('components.homeCta');
  const tHomeFooter = useTranslations('components.homeFooter');
  const tNavbar = useTranslations('components.navbar');
  
  // Cookie handlers for non-session view
  const handleCookieAccept = (preferences: Record<string, boolean>) => {
    console.log('Cookie preferences accepted:', preferences);
    // Here you would log the consent event to your backend
  };

  const handleCookieReject = () => {
    console.log('Only essential cookies accepted');
    // Here you would log the minimal consent event
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollIndicator(window.scrollY < 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if user needs to set their name
  useEffect(() => {
    const checkUserProfile = async () => {
      if (session?.user?.id) {
        try {
          // Check if user has a display name in the profiles table
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const responseData = await response.json();
            const profile = responseData.data;

            // Show modal if no display name is set
            if (!profile?.display_name) {
              setShowNameModal(true);
            }
          }
        } catch (error) {
          console.error('Error checking user profile:', error);
        }
      }
    };

    checkUserProfile();
  }, [session]);

  const handleSaveName = async (name: string) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ displayName: name }),
      });

      if (response.ok) {
        const responseData = await response.json();
        const updatedProfile = responseData.data;
        setShowNameModal(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save name');
      }
    } catch (error) {
      console.error('Error saving name:', error);
      alert(tErrors('savingName'));
    }
  };

  const handleSkipName = () => {
    setShowNameModal(false);
    // Optional: Save a default name or mark as skipped
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  if (!session) {
    const structuredData = [
      // WebApplication Schema
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "PflegeBuddy Learn",
        "description": "Interaktives Lernquiz für Pflegekräfte mit Multiple-Choice Fragen zu medizinischen Themen",
        "url": "https://www.pflegebuddy.app",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web Browser",
        "browserRequirements": "Modern Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "EUR",
          "availability": "https://schema.org/InStock"
        },
        "creator": {
          "@type": "Organization",
          "name": "PflegeBuddy",
          "url": "https://www.pflegebuddy.app",
          "logo": "https://www.pflegebuddy.app/favicon/logo.webp"
        },
        "featureList": [
          "Interaktive Multiple-Choice Fragen",
          "Erfahrungspunkt-System (XP)",
          "Intelligente Hinweise",
          "Lernfortschritt-Tracking",
          "Tägliche Lernserie",
          "14 Fachbereiche mit +1392 Fragen verfügbar"
        ],
        "screenshot": "https://www.pflegebuddy.app/favicon/logo.webp",
        "datePublished": "2025-01-01",
        "softwareVersion": "1.0"
      },
      // Organization Schema
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "PflegeBuddy",
        "url": "https://www.pflegebuddy.app",
        "logo": "https://www.pflegebuddy.app/favicon/logo.webp",
        "description": "Digitale Lernplattform für Pflegefachkräfte und medizinisches Personal",
        "foundingDate": "2025",
        "knowsAbout": [
          "Pflegeweiterbildung",
          "Medizinische Weiterbildung",
          "Multiple-Choice Lernsysteme",
          "DSGVO-konforme Gesundheitsdaten",
          "Medizinische Fachkenntnisse"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+491741632129",
          "email": "deinpflegebuddy@gmail.com",
          "contactType": "customer service"
        },
        "sameAs": [
          "https://www.instagram.com/pflege.buddy/"
        ]
      },
      // Course Schema
      {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": "Pflegefachwissen Weiterbildung",
        "description": "Umfassende Lernplattform mit 14 Fachbereichen und +1392 Fragen für Pflegekräfte",
        "provider": {
          "@type": "Organization",
          "name": "PflegeBuddy"
        },
        "courseMode": "online",
        "educationalCredentialAwarded": "Lernzertifikat",
        "hasCourseInstance": {
          "@type": "CourseInstance",
          "courseMode": "online",
          "instructor": {
            "@type": "Organization",
            "name": "PflegeBuddy Team"
          }
        },
        "teaches": [
          "Notfallmanagement",
          "Medikamentengabe",
          "Hygiene & Infektionsschutz",
          "Pflegedokumentation",
          "Schmerzmanagement",
          "Palliative Pflege"
        ],
        "educationalLevel": "Professional",
        "occupationalCategory": "Pflegefachkraft"
      }
    ];

    return (
      <>
        <Head>
          {structuredData.map((data, index) => (
            <script
              key={index}
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(data),
              }}
            />
          ))}
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo & Brand */}
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <img
                    src="/favicon/logo.webp"
                    alt="PflegeBuddy Logo"
                    className="h-10 w-auto"
                    width="40"
                    height="40"
                    loading="lazy"
                  />
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-bold text-foreground tracking-tight">
                    {tNavbar('brand')}
                  </span>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {tNavbar('subtitle')}
                  </p>
                </div>
              </div>

              {/* Tagline - Desktop only */}
              <div className="hidden md:flex items-center space-x-2">
                <div className="h-4 w-px bg-border"></div>
                <div className="text-sm text-muted-foreground font-medium">
                  🎓 {tNavbar('tagline')}
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="sm:hidden">
                <button
                  className="text-muted-foreground hover:text-foreground p-3 rounded-md hover:bg-muted transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                  aria-label="Menü öffnen"
                  onClick={() => {
                    // Simple mobile menu toggle - could be expanded
                    const nav = document.querySelector('nav');
                    if (nav) {
                      nav.classList.toggle('mobile-menu-open');
                    }
                  }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Modern Hero Section */}
        <ModernHeroSection />

        {/* Enhanced Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden" aria-labelledby="features-heading">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Warum PflegeBuddy Learn?
                </Badge>
              </motion.div>
              <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {tHomeFeatures('title')}
              </h2>
              <motion.p
                className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                viewport={{ once: true }}
              >
                {tHomeFeatures('subtitle')}
              </motion.p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15,
                    delayChildren: 0.2
                  }
                }
              }}
            >
              <FeatureCard
                icon={Award}
                title={tHomeFeatures('xpSystem.title')}
                description={`${tHomeFeatures('xpSystem.description')} Erfahre mehr über das Punktesystem.`}
                delay={0}
                link="/de/learn"
              />
              <FeatureCard
                icon={Sparkles}
                title={tHomeFeatures('hints.title')}
                description={`${tHomeFeatures('hints.description')} Spare Zeit mit intelligenten Hinweisen.`}
                delay={0.1}
                link="/de/learn"
              />
              <FeatureCard
                icon={Target}
                title={tHomeFeatures('progress.title')}
                description={`${tHomeFeatures('progress.description')} Verfolge deinen Lernfortschritt.`}
                delay={0.2}
                link="/de/profile"
              />
              <FeatureCard
                icon={Clock}
                title={tHomeFeatures('streak.title')}
                description={`${tHomeFeatures('streak.description')} Halte deine Lernserie aufrecht.`}
                delay={0.3}
                link="/de/learn"
              />
              <FeatureCard
                icon={Shield}
                title={tHomeFeatures('leaderboard.title')}
                description={`${tHomeFeatures('leaderboard.description')} Vergleiche dich mit anderen.`}
                delay={0.4}
                link="/de/ranked"
              />
              <FeatureCard
                icon={Brain}
                title={tHomeFeatures('adaptive.title')}
                description={`${tHomeFeatures('adaptive.description')} Passe dich an dein Lerntempo an.`}
                delay={0.5}
                link="/de/learn"
              />
            </motion.div>

            {/* Additional visual element */}
            <motion.div
              className="text-center mt-16"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full border border-primary/20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Heart className="w-5 h-5 text-primary" />
                </motion.div>
                <span className="text-sm font-medium text-foreground">
                  Entwickelt mit ❤️ für Pflegeprofis
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background" aria-labelledby="categories-heading">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 id="categories-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {tHomeCategories('title')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {tHomeCategories('subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CategoryCard
                icon={Shield}
                title={tHomeCategories('emergency.title')}
                description={tHomeCategories('emergency.description')}
                example={{
                  question: "Was ist die normale Körpertemperatur eines gesunden Erwachsenen bei rektaler Messung?",
                  answer: "36,6°C - 37,2°C"
                }}
              />
              <CategoryCard
                icon={BookOpen}
                title={tHomeCategories('hygiene.title')}
                description={tHomeCategories('hygiene.description')}
                example={{
                  question: "Welche Reihenfolge ist bei der hygienischen Händedesinfektion korrekt?",
                  answer: "Hände anfeuchten → Desinfektionsmittel auftragen → 20-30 Sek. einwirken → Trocknen lassen"
                }}
              />
              <CategoryCard
                icon={Brain}
                title={tHomeCategories('medication.title')}
                description={tHomeCategories('medication.description')}
                example={{
                  question: "Welche Regel gilt bei der Medikamentengabe als oberste Priorität?",
                  answer: "Richtiger Patient - Patientenidentifikation hat höchste Priorität"
                }}
              />
              <CategoryCard
                icon={Heart}
                title={tHomeCategories('basics.title')}
                description={tHomeCategories('basics.description')}
                example={{
                  question: "Die Händedesinfektion sollte mindestens 30 Sekunden durchgeführt werden.",
                  answer: "Ja, mindestens 20-30 Sekunden für effektive Keimreduktion"
                }}
              />
              <CategoryCard
                icon={Target}
                title={tHomeCategories('pain.title')}
                description={tHomeCategories('pain.description')}
                example={{
                  question: "Die numerische Ratingskala (NRS) zur Schmerzerfassung reicht von 0 bis 10.",
                  answer: "Ja, 0 = kein Schmerz, 10 = stärkster vorstellbarer Schmerz"
                }}
              />
              <CategoryCard
                icon={Award}
                title={tHomeCategories('more.title')}
                description={tHomeCategories('more.description')}
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30" aria-labelledby="process-heading">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 id="process-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {tHomeProcess('title')}
              </h2>
              <p className="text-xl text-muted-foreground">
                {tHomeProcess('subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <ProcessStep
                step={1}
                title={tHomeProcess('step1.title')}
                description={tHomeProcess('step1.description')}
              />
              <ProcessStep
                step={2}
                title={tHomeProcess('step2.title')}
                description={tHomeProcess('step2.description')}
              />
              <ProcessStep
                step={3}
                title={tHomeProcess('step3.title')}
                description={tHomeProcess('step3.description')}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="auth-section" className="py-16 px-4 sm:px-6 lg:px-8 bg-primary" aria-labelledby="cta-heading">
          <div className="max-w-4xl mx-auto text-center">
            <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              {tHomeCta('title')}
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8">
              {tHomeCta('subtitle')}
            </p>

            <Card className="max-w-md mx-auto shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {tHomeCta('primaryCta')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AuthCard />
              </CardContent>
            </Card>

            <div className="mt-8 text-primary-foreground/80">
              <p className="text-sm">
                {tHomeCta('disclaimer')}
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-muted text-muted-foreground py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src="/favicon/logo.webp"
                    alt="PflegeBuddy Logo"
                    className="h-8 w-auto"
                    width="32"
                    height="32"
                    loading="lazy"
                  />
                  <span className="text-lg font-bold text-foreground">{tNavbar('brand')}</span>
                </div>
                <p className="text-muted-foreground">
                  {tNavbar('subtitle')}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-foreground text-sm xs:text-base">{tHomeFooter('legal')}</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li><a href="/de/datenschutz" className="hover:text-foreground transition-colors text-sm xs:text-base min-h-[44px] flex items-center touch-manipulation">Datenschutz</a></li>
                  <li><a href="/de/agb" className="hover:text-foreground transition-colors text-sm xs:text-base min-h-[44px] flex items-center touch-manipulation">AGB</a></li>
                  <li><a href="/de/impressum" className="hover:text-foreground transition-colors text-sm xs:text-base min-h-[44px] flex items-center touch-manipulation">Impressum</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-foreground text-sm xs:text-base">{tHomeFooter('support')}</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li><a href="mailto:deinpflegebuddy@gmail.com" className="hover:text-foreground transition-colors text-sm xs:text-base min-h-[44px] flex items-center touch-manipulation">deinpflegebuddy@gmail.com</a></li>
                  <li><a href="tel:+491741632129" className="hover:text-foreground transition-colors text-sm xs:text-base min-h-[44px] flex items-center touch-manipulation">0174 1632129</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors text-sm xs:text-base min-h-[44px] flex items-center touch-manipulation">FAQ</a></li>
                  <li>
                    <a
                      href="https://www.instagram.com/pflege.buddy/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors inline-flex items-center gap-2 text-sm xs:text-base min-h-[44px] touch-manipulation"
                    >
                      <Instagram className="w-4 h-4" />
                      @pflege.buddy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
              <p>&copy; 2025 PflegeBuddy. Alle Rechte vorbehalten. Entwickelt mit ❤️ für Pflegeprofis.</p>
            </div>
          </div>
        </footer>

        {/* Scroll Indicator */}
        {showScrollIndicator && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-muted-foreground" />
          </div>
        )}

        {/* Cookie Banner for non-logged-in users */}
        <CookieBanner onAccept={handleCookieAccept} onReject={handleCookieReject} />
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardCard />
      {showNameModal && (
        <NameInputModal onSave={handleSaveName} onSkip={handleSkipName} />
      )}
    </>
  );
}
