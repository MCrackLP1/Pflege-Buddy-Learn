'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowLeft, ShoppingCart, Zap } from 'lucide-react';

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

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-4 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Hints Shop</h1>
          </div>
        </div>

        {/* Intro */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-muted-foreground">
              Mehr Hints, bessere Lernerfolge
            </h2>
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Erweitere dein Hints-Guthaben und meistere auch die schwierigsten Fragen!
          </p>
        </div>

        {/* Package Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {HINT_PACKAGES.map((pkg) => (
            <Card 
              key={pkg.sku} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                pkg.popular ? 'border-2 border-primary shadow-md scale-105' : ''
              }`}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Zap className="h-3 w-3 mr-1" />
                    Meistgewählt
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-bold">{pkg.quantity}</span>
                  <span className="text-lg text-muted-foreground">Hints</span>
                </CardTitle>
                <CardDescription className="font-medium text-base">
                  {pkg.name}
                </CardDescription>
                
                {/* Savings Badge */}
                {pkg.savings && (
                  <Badge variant="secondary" className="w-fit mx-auto">
                    {pkg.savings}
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="text-center pb-4">
                {/* Price */}
                <div className="mb-4">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {formatCurrency(pkg.price, 'EUR', 'de-DE')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {calculatePricePerHint(pkg.price, pkg.quantity)} pro Hint
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    <span>Sofort verfügbar</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span>Kein Ablauf</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <Button
                  onClick={() => handlePurchase(pkg.sku)}
                  disabled={loadingPackage === pkg.sku}
                  className="w-full"
                  size="lg"
                  variant={pkg.popular ? "default" : "outline"}
                >
                  {loadingPackage === pkg.sku ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Weiterleitung...
                    </div>
                  ) : (
                    'Jetzt kaufen'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">✨ Warum Hints kaufen?</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Schwierige Fragen meistern und schneller lernen</li>
            <li>• Keine Wartezeit - sofort verfügbar nach dem Kauf</li>
            <li>• Sichere Bezahlung über Stripe</li>
            <li>• Hints verfallen nie und bleiben dauerhaft verfügbar</li>
          </ul>
        </div>

        {/* Legal Notice */}
        <div className="mt-6 text-xs text-muted-foreground text-center">
          Durch den Kauf stimmst du unseren{' '}
          <a href="/agb" className="underline hover:text-primary">AGB</a>
          {' '}und der{' '}
          <a href="/datenschutz" className="underline hover:text-primary">Datenschutzerklärung</a>
          {' '}zu.
        </div>
      </div>
    </MainLayout>
  );
}
