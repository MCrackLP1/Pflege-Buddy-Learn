'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { AuthCard } from '@/components/auth/auth-card';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
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
                {loading ? 'Speichern...' : 'Speichern'}
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
      alert('Fehler beim Speichern des Namens. Bitte versuche es erneut.');
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
                <Sparkles className="w-4 h-4 mr-2" />
                Kostenlos für Pflegekräfte
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Tägliches Pflegewissen
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  in 5 Minuten
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                Lerne täglich neue Pflege-Themen mit interaktiven Quizfragen.
                Verbessere deine Fachkenntnisse und bleibe auf dem neuesten Stand der Pflegepraxis.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button
                  onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Jetzt kostenlos starten
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Mehr erfahren
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              <StatCard number="5.000+" label="Pflegekräfte" />
              <StatCard number="500+" label="Quizfragen" />
              <StatCard number="24/7" label="Verfügbar" />
              <StatCard number="100%" label="Kostenlos" />
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
                icon={Brain}
                title="Intelligente Lernalgorithmen"
                description="Adaptive Quizfragen passen sich deinem Wissensstand an und fokussieren auf Bereiche, die du stärken möchtest."
              />
              <FeatureCard
                icon={Clock}
                title="Nur 5 Minuten täglich"
                description="Kurze, fokussierte Lernsessions passen perfekt in deinen Arbeitsalltag und helfen dir, kontinuierlich zu lernen."
              />
              <FeatureCard
                icon={Target}
                title="Personalisierte Ziele"
                description="Setze dir individuelle Lernziele und verfolge deine Fortschritte mit detaillierten Statistiken."
              />
              <FeatureCard
                icon={Award}
                title="Zertifikate & Badges"
                description="Sammle Auszeichnungen für deine Lernfortschritte und teile deine Erfolge mit Kollegen."
              />
              <FeatureCard
                icon={BookOpen}
                title="Medizinische Fachliteratur"
                description="Alle Inhalte basieren auf aktuellen pflegewissenschaftlichen Erkenntnissen und Richtlinien."
              />
              <FeatureCard
                icon={Shield}
                title="DSGVO-konform"
                description="Deine Daten sind sicher und werden nur für deine Lernfortschritte verwendet. Keine Werbung oder Datenverkauf."
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                So einfach geht&apos;s
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                In 3 Schritten zu deinem täglichen Pflegewissen
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Anmelden</h3>
                <p className="text-gray-600 dark:text-gray-300">Melde dich kostenlos mit deinem Google-Konto an</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Lernen</h3>
                <p className="text-gray-600 dark:text-gray-300">Bearbeite täglich Quizfragen zu verschiedenen Pflege-Themen</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Verbessern</h3>
                <p className="text-gray-600 dark:text-gray-300">Verfolge deine Fortschritte und sammle Zertifikate</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="auth-section" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Bereit für dein tägliches Pflegewissen?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Tausende Pflegekräfte lernen bereits täglich mit PflegeBuddy Learn. Jetzt bist du dran!
            </p>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-2xl max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Kostenlos starten
              </h3>
              <AuthCard />
            </div>

            <div className="mt-8 text-blue-100">
              <p className="text-sm">
                🔒 Deine Daten sind sicher • 📚 Medizinisch fundiert • 🎯 100% kostenlos
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
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
                <h4 className="font-semibold mb-4">Lernen</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Quizfragen</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Lernfortschritt</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Zertifikate</a></li>
                </ul>
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
                  <li><a href="mailto:deinpflegebuddy@gmail.com" className="hover:text-white transition-colors">Kontakt</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                  <li><span className="text-green-400">● Online</span></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 PflegeBuddy Learn. Entwickelt mit ❤️ für Pflegeprofis.</p>
            </div>
          </div>
        </footer>

        {/* Scroll Indicator */}
        {showScrollIndicator && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-gray-500" />
          </div>
        )}
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
