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

// Reusable Components
function FeatureCard({ icon: Icon, title, description }: { icon: LucideIcon, title: string, description: string }) {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-2">
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

function CategoryCard({ icon: Icon, title, description, example }: {
  icon: LucideIcon;
  title: string;
  description: string;
  example?: { question: string; answer: string };
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
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
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "PflegeBuddy Learn",
      "description": "Interaktives Lernquiz für Pflegekräfte mit Multiple-Choice Fragen",
      "url": "https://www.pflegebuddy.app",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR"
      },
      "creator": {
        "@type": "Organization",
        "name": "PflegeBuddy",
        "url": "https://www.pflegebuddy.app"
      },
      "featureList": [
        "Interaktive Multiple-Choice Fragen",
        "Erfahrungspunkt-System",
        "Intelligente Hinweise",
        "Lernfortschritt-Tracking",
        "Tägliche Lernserie"
      ]
    };

    return (
      <>
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData),
            }}
          />
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo & Brand */}
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <img
                    src="/favicon/logo.webp"
                    alt="PflegeBuddy Logo"
                    className="h-10 w-auto"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-foreground tracking-tight">
                    {tNavbar('brand')}
                  </h1>
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

              {/* Mobile menu button (placeholder for future expansion) */}
              <div className="sm:hidden">
                <button className="text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-muted transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8" aria-labelledby="hero-heading">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-6">
                <Shield className="w-4 h-4 mr-2" />
                {tHomeHero('badge')}
              </Badge>
              <h1 id="hero-heading" className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                {tHomeHero('title')}
                <span className="block text-primary">
                  {tHomeHero('subtitle')}
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                {tHomeHero('description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button
                  size="lg"
                  onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-lg px-8"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {tHomeHero('primaryCta')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {tHomeHero('secondaryCta')}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {tHomeHero('disclaimer')}
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30" aria-labelledby="features-heading">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {tHomeFeatures('title')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {tHomeFeatures('subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={Award}
                title={tHomeFeatures('xpSystem.title')}
                description={tHomeFeatures('xpSystem.description')}
              />
              <FeatureCard
                icon={Sparkles}
                title={tHomeFeatures('hints.title')}
                description={tHomeFeatures('hints.description')}
              />
              <FeatureCard
                icon={Target}
                title={tHomeFeatures('progress.title')}
                description={tHomeFeatures('progress.description')}
              />
              <FeatureCard
                icon={Clock}
                title={tHomeFeatures('streak.title')}
                description={tHomeFeatures('streak.description')}
              />
              <FeatureCard
                icon={Shield}
                title={tHomeFeatures('leaderboard.title')}
                description={tHomeFeatures('leaderboard.description')}
              />
              <FeatureCard
                icon={Brain}
                title={tHomeFeatures('adaptive.title')}
                description={tHomeFeatures('adaptive.description')}
              />
            </div>
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
                  />
                  <span className="text-lg font-bold text-foreground">{tNavbar('brand')}</span>
                </div>
                <p className="text-muted-foreground">
                  {tNavbar('subtitle')}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-foreground">{tHomeFooter('legal')}</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li><a href="/de/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</a></li>
                  <li><a href="/de/agb" className="hover:text-foreground transition-colors">AGB</a></li>
                  <li><a href="/de/impressum" className="hover:text-foreground transition-colors">Impressum</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-foreground">{tHomeFooter('support')}</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li><a href="mailto:deinpflegebuddy@gmail.com" className="hover:text-foreground transition-colors">deinpflegebuddy@gmail.com</a></li>
                  <li><a href="tel:+491741632129" className="hover:text-foreground transition-colors">0174 1632129</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
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
