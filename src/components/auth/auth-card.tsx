'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AgeGateModal } from './age-gate-modal';
import { getStorageItem, setStorageItem } from '@/lib/utils/safe-storage';
import { AlertCircle, X } from 'lucide-react';

export function AuthCard() {
  const t = useTranslations('auth');
  const { signIn, loading, error, clearError } = useAuth();
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Handle URL-based errors from OAuth callback
  useEffect(() => {
    const authError = searchParams.get('auth_error');
    const authErrorDescription = searchParams.get('auth_error_description');

    if (authError) {
      let errorMessage = 'Ein Fehler ist bei der Anmeldung aufgetreten.';

      switch (authError) {
        case 'access_denied':
          errorMessage = 'Anmeldung wurde abgebrochen. Bitte versuchen Sie es erneut.';
          break;
        case 'invalid_request':
          errorMessage = 'Ungültige Anfrage. Bitte versuchen Sie es erneut.';
          break;
        case 'unauthorized_client':
          errorMessage = 'Nicht autorisierter Client. Bitte kontaktieren Sie den Support.';
          break;
        case 'unsupported_response_type':
          errorMessage = 'Nicht unterstützter Antworttyp. Bitte kontaktieren Sie den Support.';
          break;
        case 'invalid_scope':
          errorMessage = 'Ungültiger Bereich. Bitte kontaktieren Sie den Support.';
          break;
        case 'server_error':
          errorMessage = 'Serverfehler bei Google. Bitte versuchen Sie es später erneut.';
          break;
        case 'temporarily_unavailable':
          errorMessage = 'Google-Dienst vorübergehend nicht verfügbar. Bitte versuchen Sie es später erneut.';
          break;
        case 'code_exchange_failed':
          errorMessage = 'Fehler beim Austausch des Autorisierungscodes. Bitte versuchen Sie es erneut.';
          break;
        case 'callback_processing_failed':
          errorMessage = 'Fehler bei der Verarbeitung der Anmeldung. Bitte versuchen Sie es erneut.';
          break;
        default:
          if (authErrorDescription) {
            errorMessage = authErrorDescription;
          }
      }

      setUrlError(errorMessage);

      // Clear URL parameters after processing
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('auth_error');
        url.searchParams.delete('auth_error_description');
        window.history.replaceState({}, '', url.pathname + url.search);
      }
    }
  }, [searchParams]);

  const handleSignInClick = () => {
    // Clear any existing errors
    clearError();
    setUrlError(null);

    // Check if age verification has been completed
    const ageVerified = getStorageItem('ageVerified');
    if (ageVerified === 'true') {
      signIn();
    } else {
      setShowAgeGate(true);
    }
  };

  const handleAgeConfirm = () => {
    setStorageItem('ageVerified', 'true');
    setShowAgeGate(false);
    signIn();
  };

  const handleAgeCancel = () => {
    setShowAgeGate(false);
  };

  const handleDismissError = () => {
    clearError();
    setUrlError(null);
  };

  // Determine which error to display
  const displayError = error?.message || urlError;

  return (
    <>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>{t('signIn')}</CardTitle>
          <CardDescription>{t('signInDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Display */}
          {displayError && (
            <Alert variant="destructive" className="relative">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="pr-8">
                {displayError}
              </AlertDescription>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-auto p-1 hover:bg-transparent"
                onClick={handleDismissError}
                aria-label="Fehler schließen"
              >
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          )}

          <Button
            onClick={handleSignInClick}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Wird geladen...</span>
              </div>
            ) : (
              t('signIn')
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Mit der Anmeldung bestätigen Sie, dass Sie mindestens 16 Jahre alt sind.
          </p>

          {/* Additional help text for errors */}
          {error?.type === 'network' && (
            <p className="text-xs text-muted-foreground text-center">
              Überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.
            </p>
          )}

          {error?.type === 'oauth' && (
            <p className="text-xs text-muted-foreground text-center">
              Wenn das Problem weiterhin besteht, versuchen Sie es in einem anderen Browser oder im Inkognito-Modus.
            </p>
          )}
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
