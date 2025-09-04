'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AuthCard() {
  const t = useTranslations('auth');
  const { signIn, loading } = useAuth();

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>{t('signIn')}</CardTitle>
        <CardDescription>{t('signInDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={signIn} 
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? '...' : t('signIn')}
        </Button>
      </CardContent>
    </Card>
  );
}
