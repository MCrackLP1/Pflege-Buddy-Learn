'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import type { GoogleOAuthError } from '@/types/components';

interface AuthError {
  message: string;
  code?: string;
  type: 'network' | 'oauth' | 'user_cancelled' | 'unknown';
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialSession
}: {
  children: React.ReactNode;
  initialSession: Session | null;
}) {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setLoading(false);

        // Clear error on successful auth
        if (session && error) {
          setError(null);
        }

        // Streak update now happens automatically in progress API
        // No need for separate call here
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth, error]);

  const signIn = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check network connectivity
      if (!navigator.onLine) {
        throw new Error('Keine Internetverbindung. Bitte überprüfen Sie Ihre Netzwerkverbindung.');
      }

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (oauthError) {
        throw oauthError;
      }

    } catch (err: unknown) {
      console.error('OAuth sign-in error:', err);
      setLoading(false);

      let errorMessage = 'Ein unerwarteter Fehler ist aufgetreten.';
      let errorType: AuthError['type'] = 'unknown';
      let errorCode: string | undefined;

      const oauthError = err as GoogleOAuthError;
      if (oauthError.message?.includes('network') || oauthError.message?.includes('fetch')) {
        errorMessage = 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.';
        errorType = 'network';
      } else if (oauthError.message?.includes('popup') || oauthError.message?.includes('blocked')) {
        errorMessage = 'Popup-Fenster wurde blockiert. Bitte erlauben Sie Popups für diese Seite und versuchen Sie es erneut.';
        errorType = 'oauth';
      } else if (oauthError.message?.includes('cancelled') || oauthError.message?.includes('denied')) {
        errorMessage = 'Anmeldung wurde abgebrochen. Bitte versuchen Sie es erneut.';
        errorType = 'user_cancelled';
      } else if (oauthError.message?.includes('invalid') || oauthError.message?.includes('unauthorized')) {
        errorMessage = 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.';
        errorType = 'oauth';
      }

      setError({
        message: errorMessage,
        code: errorCode,
        type: errorType
      });
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await supabase.auth.signOut();
      setLoading(false);
      // Navigate to home page after sign out
      router.push('/');
    } catch (err: unknown) {
      console.error('Sign out error:', err);
      setLoading(false);
      setError({
        message: 'Abmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.',
        type: 'unknown'
      });
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    session,
    user: session?.user || null,
    loading,
    error,
    signIn,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
