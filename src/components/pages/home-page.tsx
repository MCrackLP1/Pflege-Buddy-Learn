'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { AuthCard } from '@/components/auth/auth-card';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import { MainLayout } from '@/components/layout/main-layout';
import { CookieBanner } from '@/components/legal/cookie-banner';
import { useTranslations } from 'next-intl';
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
  type LucideIcon
} from 'lucide-react';

// Loading Animation Component
function LoadingAnimation() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin opacity-75"></div>
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

// Feature Card Component
function FeatureCard({ icon: Icon, title, description }: { icon: LucideIcon, title: string, description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700">
      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

// Statistic Component
function StatCard({ number, label }: { number: string, label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
        {number}
      </div>
      <div className="text-gray-600 dark:text-gray-300 text-sm">{label}</div>
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
  
  // Add translations
  const tErrors = useTranslations('errors');
  const tComponents = useTranslations('components');
  const tHome = useTranslations('components');
  
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Heart className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">PflegeBuddy Learn</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                🎓 Lernen für Pflegeprofis
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium mb-6">
                <Shield className="w-4 h-4 mr-2" />
                Medizinisch fundiert & DSGVO-konform
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Ihr digitaler Pflegeassistent
                <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  für Notfälle & Fachwissen
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                Testen Sie Ihr Pflegewissen mit unserem interaktiven Multiple-Choice Quiz. Sammeln Sie XP-Punkte, nutzen Sie Hinweise und verbessern Sie Ihre Fachkenntnisse mit jeder Frage.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button
                  onClick={() => {
                    if (session) {
                      window.location.href = '/de/learn';
                    } else {
                      document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="inline-flex items-center px-12 py-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 animate-pulse"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Jetzt Spielen
                  <ArrowRight className="w-6 h-6 ml-3" />
                </button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Mehr erfahren
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              <StatCard number="5.000+" label={tHome('homeStats.nurses')} />
              <StatCard number="500+" label={tHome('homeStats.questions')} />
              <StatCard number="24/7" label={tHome('homeStats.available')} />
              <StatCard number="100%" label={tHome('homeStats.free')} />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Warum PflegeBuddy Learn?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Entwickelt von Pflegeprofis für Pflegeprofis - das perfekte Tool für deine tägliche Weiterbildung.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={Shield}
                title="Notfallmanagement"
                description="Sofortmaßnahmen & Checklisten für verschiedene Notfälle. Schneller Zugriff auf alles, was im Ernstfall zählt."
              />
              <FeatureCard
                icon={BookOpen}
                title="Pflegewissen"
                description="Nachschlagewerk für Krankheitsbilder, Pflegestandards, Lexikon & Online-Medizinwissen. Inklusive Medikamentensuche."
              />
              <FeatureCard
                icon={Brain}
                title="Medikamentengabe"
                description="Sichere Arzneimittelverabreichung nach 5-R-Regel."
              />
              <FeatureCard
                icon={Target}
                title="App-weite Suche"
                description="Zentrale Suchfunktion für Notfälle, Krankheiten, Standards, Lexikon & Wikipedia. Alles sofort auffindbar."
              />
              <FeatureCard
                icon={Clock}
                title="Offline-Fähigkeit"
                description="Alle wichtigen Funktionen auch ohne Internetverbindung nutzbar. Ideal für den Einsatz im Krankenhaus oder unterwegs."
              />
              <FeatureCard
                icon={Award}
                title="Interaktives Quiz-System"
                description="Multiple-Choice Fragen mit XP-System, Hinweisen und detaillierten Erklärungen. Verfolgen Sie Ihren Lernfortschritt und bauen Sie Ihr Fachwissen auf."
              />
            </div>
          </div>
        </section>

        {/* Quiz Categories Preview */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Welche Fragen erwarten dich?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Teste dein Fachwissen in verschiedenen pflegerischen Themenbereichen mit unseren authentischen Multiple-Choice Fragen.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notfallmanagement</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">Sofortmaßnahmen und Krisenversorgung</p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Beispiel-Frage:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">"Was ist die normale Körpertemperatur eines gesunden Erwachsenen bei rektaler Messung?"</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Antwort: 36,6°C - 37,2°C</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                    <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hygiene & Infektionsschutz</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">Hygienemaßnahmen und Infektionsprävention</p>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Beispiel-Frage:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">"Welche Reihenfolge ist bei der hygienischen Händedesinfektion korrekt?"</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">Antwort: Hände anfeuchten → Desinfektionsmittel auftragen → 20-30 Sek. einwirken → Trocknen lassen</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
                    <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Medikamentengabe</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">Sichere Arzneimittelverabreichung</p>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Beispiel-Frage:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">"Welche Regel gilt bei der Medikamentengabe als oberste Priorität?"</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Antwort: Richtiger Patient - Patientenidentifikation hat höchste Priorität</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3">
                    <Heart className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pflegegrundlagen</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">Grundlagen der Pflege</p>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Beispiel-Frage:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">"Die Händedesinfektion sollte mindestens 30 Sekunden durchgeführt werden."</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Antwort: Ja, mindestens 20-30 Sekunden für effektive Keimreduktion</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-3">
                    <Target className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schmerzmanagement</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">Schmerzerfassung und Schmerztherapie</p>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Beispiel-Frage:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">"Die numerische Ratingskala (NRS) zur Schmerzerfassung reicht von 0 bis 10."</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">Antwort: Ja, 0 = kein Schmerz, 10 = stärkster vorstellbarer Schmerz</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mr-3">
                    <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weitere Themen</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">Wundmanagement, Mobilität, Dokumentation & mehr</p>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Und viele weitere Kategorien:</p>
                  <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Geriatrische Pflege</li>
                    <li>• Intensivpflege</li>
                    <li>• Palliative Pflege</li>
                    <li>• Psychiatrische Pflege</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Professionelle Pflegeunterstützung
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Von der Anmeldung bis zum Expertenstatus - Ihr Weg zur pflegerischen Exzellenz
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Registrieren</h3>
                <p className="text-gray-600 dark:text-gray-300">Kostenlose Registrierung mit Google-Konto für professionelle Pflegekräfte</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Quiz spielen</h3>
                <p className="text-gray-600 dark:text-gray-300">Beantworten Sie Multiple-Choice Fragen, sammeln Sie XP-Punkte und nutzen Sie Hinweise bei schwierigen Fragen</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Fortschritt feiern</h3>
                <p className="text-gray-600 dark:text-gray-300">Verfolgen Sie Ihren Lernfortschritt, sammeln Sie XP-Punkte und erreichen Sie neue Meilensteine in Ihrer beruflichen Entwicklung</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="auth-section" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Testen Sie Ihr Pflegewissen jetzt!
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Professionelle Pflegekräfte vertrauen bereits auf PflegeBuddy Learn für ihre Fortbildung. Starten Sie Ihr interaktives Quiz und sammeln Sie XP-Punkte!
            </p>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-2xl max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Kostenlos spielen
              </h3>
              <AuthCard />
            </div>

            <div className="mt-8 text-blue-100">
              <p className="text-sm">
                🔒 DSGVO-konform • 📚 Medizinisch fundiert • 🎯 25% Rabatt bei erfolgreichem Quiz
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Heart className="w-6 h-6 text-blue-400" />
                  <span className="text-lg font-bold">PflegeBuddy Learn</span>
                </div>
                <p className="text-gray-400">
                  Dein täglicher Begleiter für Pflegewissen und Weiterbildung.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Rechtliches</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/de/datenschutz" className="hover:text-white transition-colors">Datenschutz</a></li>
                  <li><a href="/de/agb" className="hover:text-white transition-colors">AGB</a></li>
                  <li><a href="/de/impressum" className="hover:text-white transition-colors">Impressum</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="mailto:deinpflegebuddy@gmail.com" className="hover:text-white transition-colors">deinpflegebuddy@gmail.com</a></li>
                  <li><a href="tel:+491741632129" className="hover:text-white transition-colors">0174 1632129</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                  <li><span className="text-green-400">● 24/7 Support</span></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 PflegeBuddy. Alle Rechte vorbehalten. Entwickelt mit ❤️ für Pflegeprofis.</p>
            </div>
          </div>
        </footer>

        {/* Scroll Indicator */}
        {showScrollIndicator && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-gray-500" />
          </div>
        )}
        
        {/* Cookie Banner for non-logged-in users */}
        <CookieBanner onAccept={handleCookieAccept} onReject={handleCookieReject} />
      </div>
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
