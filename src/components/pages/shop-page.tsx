'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowLeft, ShoppingCart, Zap, Shield, CheckCircle, Gift, Lock, Clock, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

// Format currency helper
function formatCurrency(amountInCents: number, currency = 'EUR', locale = 'de-DE'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amountInCents / 100);
}

interface HintPackage {
  sku: 'S' | 'M' | 'L';
  name: string;
  quantity: number;
  price: number; // in cents
  badge?: string;
  popular?: boolean;
  savings?: string | null;
}

const HINT_PACKAGES: HintPackage[] = [
  {
    sku: 'S',
    name: 'Starter Paket',
    quantity: 10,
    price: 499,
    savings: null,
  },
  {
    sku: 'M',
    name: 'Beliebt',
    quantity: 30,
    price: 999,
    badge: 'Meistgewählt',
    popular: true,
    savings: '33% sparen',
  },
  {
    sku: 'L',
    name: 'Bester Deal',
    quantity: 100,
    price: 2499,
    badge: 'Bester Wert',
    savings: '50% sparen',
  },
];

export function ShopPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);

  const handlePurchase = async (sku: 'S' | 'M' | 'L') => {
    if (!session) {
      // Redirect to auth if not logged in
      router.push('/');
      return;
    }

    setLoadingPackage(sku);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sku }),
      });

      if (!response.ok) {
        throw new Error('Checkout failed');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      // TODO: Show error toast
      alert('Fehler beim Starten des Kaufprozesses. Bitte versuchen Sie es erneut.');
    } finally {
      setLoadingPackage(null);
    }
  };

  const calculatePricePerHint = (price: number, quantity: number) => {
    return formatCurrency(Math.round(price / quantity), 'EUR', 'de-DE');
  };

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
    <MainLayout>
      <motion.div
        className="space-y-8 pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Navigation */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Zurück
          </Button>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-muted-foreground">PflegeBuddy Shop</span>
          </motion.div>
        </motion.div>

        {/* Hero Section */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden shadow-lg bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10" />
            <CardContent className="relative z-10 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg mx-auto mb-6"
              >
                <Gift className="w-10 h-10 text-white" />
              </motion.div>

              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
                🚀 Level Up Dein Lernen!
              </CardTitle>

              <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
                Hol dir mehr Hints und meistere jede Frage! Dein Weg zum Pflegeprofi wird endlich einfach.
              </p>

              {/* Urgency Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 px-4 py-2 rounded-full border border-orange-200 dark:border-orange-700"
              >
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                  🔥 Begrenztes Angebot - Spare bis zu 50%!
                </span>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>


        {/* Pricing Section */}
        <motion.div variants={itemVariants}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
              🎁 Wähle Dein Paket
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Jedes Paket enthält sofort verfügbare Hints, die nie verfallen und dir helfen, schneller zu lernen.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
            {HINT_PACKAGES.map((pkg, index) => (
              <motion.div
                key={pkg.sku}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative"
              >
                <Card className={`relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
                  pkg.popular
                    ? 'border-2 border-primary shadow-primary/20 scale-105 bg-gradient-to-br from-primary/5 to-primary/10'
                    : 'hover:border-primary/50'
                }`}>

                  {/* Popular Badge */}
                  {pkg.popular && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.2, type: "spring" }}
                      className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
                    >
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 shadow-lg">
                        <Crown className="w-4 h-4 mr-2" />
                        🔥 Bestseller
                      </Badge>
                    </motion.div>
                  )}

                  {/* Savings Badge */}
                  {pkg.savings && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7 + index * 0.2, type: "spring" }}
                      className="absolute -top-2 -right-2 z-10"
                    >
                      <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 shadow-lg">
                        💰 {pkg.savings}
                      </Badge>
                    </motion.div>
                  )}

                  <CardHeader className="text-center pb-6 pt-8">
                    <motion.div
                      animate={{
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index
                      }}
                      className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4"
                    >
                      <Sparkles className="w-8 h-8 text-white" />
                    </motion.div>

                    <CardTitle className="text-2xl font-bold mb-2">
                      {pkg.quantity} Hints
                    </CardTitle>
                    <CardDescription className="text-lg font-semibold">
                      {pkg.name}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6 text-center">
                    {/* Price */}
                    <div>
                      <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
                        {formatCurrency(pkg.price, 'EUR', 'de-DE')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {calculatePricePerHint(pkg.price, pkg.quantity)} pro Hint
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 justify-center">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">Sofort verfügbar nach Kauf</span>
                      </div>
                      <div className="flex items-center gap-3 justify-center">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">Nie verfallen</span>
                      </div>
                      <div className="flex items-center gap-3 justify-center">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">Für alle Quiz-Themen</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-6">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full"
                    >
                      <Button
                        onClick={() => handlePurchase(pkg.sku)}
                        disabled={loadingPackage === pkg.sku}
                        className={`w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 group ${
                          pkg.popular
                            ? 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white'
                            : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-900 border-2 border-gray-300'
                        }`}
                        size="lg"
                      >
                        {loadingPackage === pkg.sku ? (
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Weiterleitung...
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            {pkg.popular ? '🚀 Jetzt kaufen' : 'Jetzt kaufen'}
                            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>


        {/* Trust Section */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
                <Shield className="w-6 h-6 text-green-500" />
                Sicher & Vertrauenswürdig
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg mx-auto">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold">SSL-verschlüsselt</h3>
                  <p className="text-sm text-muted-foreground">
                    Deine Zahlungsdaten sind durch 256-Bit SSL-Verschlüsselung geschützt.
                  </p>
                </div>

                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg mx-auto">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold">Stripe-Zahlung</h3>
                  <p className="text-sm text-muted-foreground">
                    Sichere Zahlungsabwicklung durch den weltweit führenden Payment-Anbieter.
                  </p>
                </div>

                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg mx-auto">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold">DSGVO-konform</h3>
                  <p className="text-sm text-muted-foreground">
                    Wir halten uns strikt an die Datenschutz-Grundverordnung.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold">
                ❓ Häufige Fragen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border-b border-border pb-4">
                  <h3 className="font-semibold mb-2">Wann sind die Hints verfügbar?</h3>
                  <p className="text-sm text-muted-foreground">
                    Sofort nach erfolgreicher Zahlung! Du kannst sie direkt in deinem nächsten Quiz verwenden.
                  </p>
                </div>

                <div className="border-b border-border pb-4">
                  <h3 className="font-semibold mb-2">Verfallen die Hints?</h3>
                  <p className="text-sm text-muted-foreground">
                    Nein! Hints verfallen nie und bleiben dauerhaft in deinem Konto verfügbar.
                  </p>
                </div>

                <div className="border-b border-border pb-4">
                  <h3 className="font-semibold mb-2">Kann ich Hints zurückgeben?</h3>
                  <p className="text-sm text-muted-foreground">
                    Digitale Inhalte können nach Lieferung nicht zurückgegeben werden. Mehr dazu in unserem{' '}
                    <a href={`/${Intl.DateTimeFormat().resolvedOptions().locale?.startsWith('de') ? 'de' : 'en'}/widerruf`} className="text-primary hover:underline">Widerrufsrecht</a>.
                  </p>
                </div>

                <div className="border-b border-border pb-4">
                  <h3 className="font-semibold mb-2">Für welche Fragen kann ich Hints nutzen?</h3>
                  <p className="text-sm text-muted-foreground">
                    Für alle Quiz-Fragen in allen Themenbereichen - egal ob Pflegegrundlagen, Hygiene oder Medikamente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>


        {/* Footer Legal */}
        <motion.div
          variants={itemVariants}
          className="text-center text-sm text-muted-foreground space-y-2 pt-8 border-t"
        >
          <p>
            Durch den Kauf stimmst du unseren{' '}
            <a href={`/${Intl.DateTimeFormat().resolvedOptions().locale?.startsWith('de') ? 'de' : 'en'}/agb`} className="underline hover:text-primary transition-colors">AGB</a>
            {' '}und der{' '}
            <a href={`/${Intl.DateTimeFormat().resolvedOptions().locale?.startsWith('de') ? 'de' : 'en'}/datenschutz`} className="underline hover:text-primary transition-colors">Datenschutzerklärung</a>
            {' '}zu.
          </p>
          <p className="text-xs">
            💡 <strong>Tipp:</strong> Digitale Inhalte können nach Lieferung nicht zurückgegeben werden.{' '}
            <a href={`/${Intl.DateTimeFormat().resolvedOptions().locale?.startsWith('de') ? 'de' : 'en'}/widerruf`} className="underline hover:text-primary transition-colors">Mehr dazu</a>
          </p>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
