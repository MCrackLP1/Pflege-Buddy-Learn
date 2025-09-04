'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Settings, Check } from 'lucide-react';
import Link from 'next/link';
import { LEGAL_CONFIG } from '@/lib/constants';

interface CookieBannerProps {
  onAccept: (preferences: Record<string, boolean>) => void;
  onReject: () => void;
}

export function CookieBanner({ onAccept, onReject }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    // Check if user has already made a choice
    const hasChoice = localStorage.getItem('cookieConsentGiven');
    if (!hasChoice) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const preferences = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    localStorage.setItem('cookieConsentGiven', 'true');
    setIsVisible(false);
    onAccept(preferences);
  };

  const handleRejectAll = () => {
    const preferences = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    localStorage.setItem('cookieConsentGiven', 'true');
    setIsVisible(false);
    onReject();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                🍪 Cookie-Einstellungen
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Wir verwenden Cookies, um Ihnen das beste Erlebnis auf unserer Website zu bieten.
                Einige Cookies sind essenziell für den Betrieb der Website, andere helfen uns,
                die Website zu verbessern.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="ml-4"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleAcceptAll} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Alle akzeptieren
            </Button>

            <Link href="/cookie-einstellungen" className="flex-1">
              <Button variant="outline" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Einstellungen
              </Button>
            </Link>

            <Button onClick={handleRejectAll} variant="outline" className="flex-1">
              Nur essenzielle
            </Button>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            <p>
              Durch Klick auf "Alle akzeptieren" stimmen Sie der Verwendung aller Cookies zu.
              Weitere Informationen finden Sie in unserer{' '}
              <Link href="/cookies" className="underline hover:no-underline">
                Cookie-Richtlinie
              </Link>
              {' '}und{' '}
              <Link href="/datenschutz" className="underline hover:no-underline">
                Datenschutzerklärung
              </Link>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
