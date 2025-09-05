'use client';

import { useState, useEffect, useCallback } from 'react';

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cookiePreferences');
    const consentGiven = localStorage.getItem('cookieConsentGiven');

    if (saved && consentGiven === 'true') {
      try {
        const parsed = JSON.parse(saved);
        setPreferences({ ...parsed, essential: true }); // Essential always true
        setHasConsent(true);
      } catch (error) {
        console.error('Failed to parse cookie preferences:', error);
      }
    }

    setIsLoading(false);
  }, []);

  // Save preferences and trigger consent event
  const updatePreferences = useCallback(async (newPreferences: CookiePreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('cookiePreferences', JSON.stringify(newPreferences));
    localStorage.setItem('cookieConsentGiven', 'true');
    setHasConsent(true);

    // Trigger custom event for other components to react
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
      detail: newPreferences
    }));

    // Here you would also send to backend for GDPR compliance
    // await logConsentEvent('cookie', LEGAL_CONFIG.versions.cookie, newPreferences);
  }, []);

  // Check if a specific category is allowed
  const isAllowed = useCallback((category: keyof CookiePreferences): boolean => {
    return preferences[category];
  }, [preferences]);

  // Accept all cookies
  const acceptAll = useCallback(() => {
    updatePreferences({
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  }, [updatePreferences]);

  // Reject all non-essential cookies
  const rejectAll = useCallback(() => {
    updatePreferences({
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
  }, [updatePreferences]);

  // Reset consent (for testing/development)
  const resetConsent = useCallback(() => {
    localStorage.removeItem('cookiePreferences');
    localStorage.removeItem('cookieConsentGiven');
    setPreferences({
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
    setHasConsent(false);
  }, []);

  return {
    preferences,
    isLoading,
    hasConsent,
    isAllowed,
    updatePreferences,
    acceptAll,
    rejectAll,
    resetConsent,
  };
}
