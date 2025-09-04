'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AgeGateModal } from './age-gate-modal';

export function AuthCard() {
  const t = useTranslations('auth');
  const { signIn, loading } = useAuth();
  const [showAgeGate, setShowAgeGate] = useState(false);

  const handleSignInClick = () => {
    // Check if age verification has been completed
    const ageVerified = localStorage.getItem('ageVerified');
    if (ageVerified === 'true') {
      signIn();
    } else {
      setShowAgeGate(true);
    }
  };

  const handleAgeConfirm = () => {
    localStorage.setItem('ageVerified', 'true');
    setShowAgeGate(false);
    signIn();
  };

  const handleAgeCancel = () => {
    setShowAgeGate(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>{t('signIn')}</CardTitle>
          <CardDescription>{t('signInDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleSignInClick}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? '...' : t('signIn')}
          </Button>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Mit der Anmeldung bestätigen Sie, dass Sie mindestens 16 Jahre alt sind.
          </p>
        </CardContent>
      </Card>

      <AgeGateModal
        isOpen={showAgeGate}
        onConfirm={handleAgeConfirm}
        onCancel={handleAgeCancel}
      />
    </>
  );
}
