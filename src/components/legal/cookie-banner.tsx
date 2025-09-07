'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Settings, Check } from 'lucide-react';
import Link from 'next/link';
import { createLocalizedPath } from '@/lib/navigation';
import { getStorageItem, setStorageItem } from '@/lib/utils/safe-storage';

interface CookieBannerProps {
  onAccept: (preferences: Record<string, boolean>) => void;
  onReject: () => void;
}

export function CookieBanner({ onAccept, onReject }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const locale = useLocale();
  const t = useTranslations('legal.cookies');

  useEffect(() => {
    // Check if user has already made a choice
    const hasChoice = getStorageItem('cookieConsentGiven');
    console.log('🍪 Cookie banner check - hasChoice:', hasChoice);
    if (!hasChoice) {
      console.log('🍪 No previous choice found, showing banner');
      setIsVisible(true);
    } else {
      console.log('🍪 Previous choice found, hiding banner');
    }
  }, []);

  const handleAcceptAll = () => {
    const preferences = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    setStorageItem('cookiePreferences', JSON.stringify(preferences));
    setStorageItem('cookieConsentGiven', 'true');
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
    setStorageItem('cookiePreferences', JSON.stringify(preferences));
    setStorageItem('cookieConsentGiven', 'true');
    setIsVisible(false);
    onReject();
  };

  if (!isVisible) return null;

  return (
    <div
      data-testid="cookie-banner"
      className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-sm border-t"
    >
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                {t('bannerTitle')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('bannerDescription')}
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
              {t('acceptAll')}
            </Button>

            <Link href="/cookie-einstellungen" className="flex-1">
              <Button variant="outline" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                {t('settings')}
              </Button>
            </Link>

            <Button onClick={handleRejectAll} variant="outline" className="flex-1">
              {t('essentialOnly')}
            </Button>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            <p>
              {t('bannerFooter')}{' '}
              <Link href={createLocalizedPath(locale, 'cookies')} className="underline hover:no-underline">
                {t('cookiePolicyLink')}
              </Link>
              {' '}und{' '}
              <Link href={createLocalizedPath(locale, 'datenschutz')} className="underline hover:no-underline">
                {t('privacyPolicyLink')}
              </Link>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
