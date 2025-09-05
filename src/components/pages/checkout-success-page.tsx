'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, Home, ArrowRight } from 'lucide-react';
import { stripe } from '@/lib/stripe';

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

  return (
    <MainLayout>
      <div className="max-w-md mx-auto p-4 pt-20">
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-800">
              Kauf erfolgreich! 🎉
            </CardTitle>
            <CardDescription className="text-green-700">
              Deine Hints wurden erfolgreich zu deinem Konto hinzugefügt
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Purchase Summary */}
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Gekauft:
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paket:</span>
                  <span className="font-medium">{purchaseDetails.packageName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hints:</span>
                  <span className="font-bold text-primary">+{purchaseDetails.hintsQuantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preis:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('de-DE', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(purchaseDetails.totalAmount / 100)}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Was jetzt?</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✨ Deine Hints sind sofort verfügbar</li>
                <li>🎯 Nutze sie in schwierigen Quiz-Fragen</li>
                <li>📚 Starte jetzt mit dem Lernen!</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/quiz')}
                className="w-full"
                size="lg"
              >
                Quiz starten
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Zur Startseite
              </Button>
            </div>

            {/* Receipt Info */}
            <div className="text-center text-xs text-muted-foreground pt-4 border-t">
              <p>
                Eine Bestätigung wurde an <strong>{purchaseDetails.customerEmail}</strong> gesendet
              </p>
              <p className="mt-1">
                Session ID: <code className="text-xs">{sessionId}</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
