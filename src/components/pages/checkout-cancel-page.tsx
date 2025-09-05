'use client';

import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, ShoppingCart, Home, RefreshCw } from 'lucide-react';

export function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="max-w-md mx-auto p-4 pt-20">
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-orange-800">
              Kauf abgebrochen
            </CardTitle>
            <CardDescription className="text-orange-700">
              Dein Kauf wurde abgebrochen. Keine Sorge - es wurden keine Kosten berechnet.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Info Box */}
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-semibold mb-3">Was ist passiert?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Der Kaufvorgang wurde unterbrochen</li>
                <li>• Keine Zahlung wurde verarbeitet</li>
                <li>• Du kannst jederzeit erneut versuchen</li>
              </ul>
            </div>

            {/* Encouragement */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">💡 Hints helfen dir dabei:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✨ Schwierige Fragen zu meistern</li>
                <li>🚀 Schneller zu lernen</li>
                <li>🎯 Bessere Ergebnisse zu erreichen</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/shop')}
                className="w-full"
                size="lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Erneut versuchen
              </Button>
              
              <Button 
                onClick={() => router.push('/quiz')}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Erstmal ohne Hints weitermachen
              </Button>

              <Button 
                onClick={() => router.push('/')}
                variant="ghost"
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Zur Startseite
              </Button>
            </div>

            {/* Support Info */}
            <div className="text-center text-xs text-muted-foreground pt-4 border-t">
              <p>
                Probleme beim Bezahlen? Kontaktiere uns unter{' '}
                <a 
                  href="mailto:deinpflegebuddy@gmail.com"
                  className="underline hover:text-primary"
                >
                  deinpflegebuddy@gmail.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
