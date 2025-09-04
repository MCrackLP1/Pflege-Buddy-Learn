'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ShoppingCart, Star } from 'lucide-react';

export function StorePage() {
  const t = useTranslations('store');
  const [loading, setLoading] = useState<string | null>(null);
  
  // Mock current balance
  const currentBalance = 3;
  
  const hintPacks = [
    {
      id: '10_hints',
      hints: 10,
      price: '€2.99',
      popular: false,
    },
    {
      id: '50_hints',
      hints: 50,
      price: '€9.99',
      popular: true,
    },
    {
      id: '200_hints',
      hints: 200,
      price: '€24.99',
      popular: false,
    },
  ];

  const handlePurchase = async (packId: string, price: string) => {
    setLoading(packId);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pack_key: packId,
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Purchase failed:', error);
      
      // Get pack info for error message
      const packInfo = hintPacks.find(p => p.id === packId);
      
      // Check if it's a demo mode error
      if (error?.message?.includes('Demo mode') || error?.message?.includes('demo') || error?.message?.includes('Failed to create checkout session')) {
        alert(`🎮 Demo-Modus aktiv!\n\n${packInfo?.hints || 'X'} Hints für ${packInfo?.price || 'X'} würden gekauft werden.\n\nDies ist nur eine Demo - keine echte Zahlung wird verarbeitet.\n\nFür echte Käufe müssen Stripe-Credentials konfiguriert werden.`);
      } else {
        alert('Unerwarteter Fehler beim Kaufvorgang. Bitte versuchen Sie es erneut.');
        console.error('Purchase error:', error);
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>

        {/* Demo Mode Banner */}
        <Card className="border-blue-500/30 bg-blue-500/10">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-blue-400 mb-1">🎮 Demo-Modus aktiv</p>
            <p className="text-xs text-blue-300/80 leading-relaxed">
              Klicken Sie auf "Kaufen" um die Demo-Kaufabwicklung zu testen. 
              Keine echten Zahlungen werden verarbeitet.
            </p>
          </CardContent>
        </Card>

        {/* Current Balance */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 text-center space-y-2">
            <Lightbulb className="h-8 w-8 mx-auto text-yellow-500" />
            <div>
              <div className="text-2xl font-bold">{currentBalance}</div>
              <div className="text-sm text-muted-foreground">
                {t('currentBalance', { count: currentBalance })}
              </div>
            </div>
            <div className="text-xs font-medium">
              {t('freeDaily')}
            </div>
          </CardContent>
        </Card>

        {/* Hint Packs */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-center">Hint-Packs kaufen</h2>
          
          <div className="grid gap-4">
            {hintPacks.map((pack) => (
              <Card key={pack.id} className="relative">
                {pack.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                    <Star className="h-3 w-3 mr-1" />
                    Beliebt
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-3">
                  <CardTitle className="text-xl">
                    {t(`pack${pack.hints}` as any) || `${pack.hints} Hinweise`}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="text-center space-y-4">
                  <div className="space-y-1">
                    <div className="text-3xl font-bold">{pack.hints}</div>
                    <div className="text-sm text-muted-foreground">Hinweise</div>
                  </div>
                  
                  <Button
                    onClick={() => handlePurchase(pack.id, pack.price)}
                    disabled={loading === pack.id}
                    className="w-full"
                    size="lg"
                    variant={pack.popular ? "default" : "outline"}
                  >
                    {loading === pack.id ? (
                      t('processing')
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {t('purchase', { price: pack.price })}
                      </>
                    )}
                  </Button>
                  
                  {pack.hints >= 50 && (
                    <div className="text-xs text-green-400">
                      {Math.round((pack.hints / parseFloat(pack.price.replace('€', ''))) * 100) / 100} Hinweise/€
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Info */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4">
            <p className="text-xs text-center leading-relaxed">
              Hinweise helfen dabei, schwierige Fragen zu lösen. 
              Sie erhalten täglich 2 kostenlose Hinweise.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
