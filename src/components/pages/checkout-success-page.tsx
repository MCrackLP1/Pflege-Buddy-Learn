'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, Home, ArrowRight, Target, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { createLocalizedPath } from '@/lib/navigation';

interface CheckoutSuccessPageProps {
  sessionId?: string;
}

interface PurchaseDetails {
  hintsQuantity: number;
  packageName: string;
  totalAmount: number;
  customerEmail: string;
}

export function CheckoutSuccessPage({ sessionId }: CheckoutSuccessPageProps) {
  const router = useRouter();
  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('Keine Session-ID gefunden');
      setLoading(false);
      return;
    }

    // In a real application, you'd fetch this from your backend
    // For now, we'll simulate the purchase details
    const fetchPurchaseDetails = async () => {
      try {
        // This would be a call to your backend to get session details
        // For now, we'll use mock data based on common package sizes
        const mockDetails: PurchaseDetails = {
          hintsQuantity: 30, // This would come from Stripe session metadata
          packageName: 'Hints M - Beliebt',
          totalAmount: 999, // in cents
          customerEmail: 'user@example.com',
        };

        setPurchaseDetails(mockDetails);
      } catch (err) {
        console.error('Error fetching purchase details:', err);
        setError('Fehler beim Laden der Kaufdetails');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseDetails();
  }, [sessionId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto p-4 pt-20">
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4">
                <div className="w-full h-full border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
              <p className="text-muted-foreground">Lade Kaufdetails...</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (error || !purchaseDetails) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto p-4 pt-20">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-destructive">Fehler</CardTitle>
              <CardDescription>
                {error || 'Kaufdetails konnten nicht geladen werden'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => router.push('/')}>
                Zur Startseite
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
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
        className="max-w-2xl mx-auto p-4 pt-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Success Hero Card */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden shadow-lg border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardHeader className="text-center relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
              </motion.div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                🎉 Kauf erfolgreich!
              </CardTitle>
              <CardDescription className="text-lg text-green-700 dark:text-green-300">
                Deine Hints wurden erfolgreich zu deinem Konto hinzugefügt
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 relative z-10">
              {/* Purchase Summary */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-green-200 dark:border-green-700 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Gift className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-lg">Dein Paket ist da! 🎁</h3>
                    <p className="text-sm text-muted-foreground">Alle Hints sind sofort verfügbar</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg border border-blue-200 dark:border-blue-700">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      +{purchaseDetails.hintsQuantity}
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">Hints</div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {purchaseDetails.packageName.split(' - ')[0]}
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-300">Paket</div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg border border-purple-200 dark:border-purple-700">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {new Intl.NumberFormat('de-DE', {
                        style: 'currency',
                        currency: 'EUR'
                      }).format(purchaseDetails.totalAmount / 100)}
                    </div>
                    <div className="text-xs text-purple-700 dark:text-purple-300">Preis</div>
                  </div>
                </div>
              </motion.div>

              {/* Next Steps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-blue-800 dark:text-blue-200">Was jetzt? 🚀</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-800 dark:text-blue-200">Hints nutzen</div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Bei schwierigen Fragen</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-800 dark:text-blue-200">Weiter lernen</div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">XP sammeln & verbessern</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-800 dark:text-blue-200">Mehr kaufen</div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Wenn du mehr brauchst</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="space-y-4"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => router.push(createLocalizedPath('de', '/quiz/random'))}
                    className="w-full h-14 text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
                    size="lg"
                  >
                    <Target className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                    ⚡ Sofort mit dem Lernen beginnen
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    onClick={() => router.push(createLocalizedPath('de', '/'))}
                    variant="outline"
                    className="w-full h-12 text-lg font-semibold group hover:bg-muted/50 transition-all duration-300"
                    size="lg"
                  >
                    <Home className="w-5 h-5 mr-3 group-hover:text-blue-500 transition-colors" />
                    📊 Zum Dashboard
                  </Button>
                </motion.div>
              </motion.div>

              {/* Receipt Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="text-center text-sm text-muted-foreground pt-6 border-t border-green-200 dark:border-green-700"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Kauf bestätigt</span>
                </div>
                <p className="mb-1">
                  Bestätigung gesendet an: <strong className="text-foreground">{purchaseDetails.customerEmail}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Session: <code className="text-xs bg-muted px-2 py-1 rounded">{sessionId}</code>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
