'use client';

import { useEffect } from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';

interface ScriptManagerProps {
  children?: React.ReactNode;
}

export function ScriptManager({ children }: ScriptManagerProps) {
  const { hasConsent, isAllowed } = useCookieConsent();

  useEffect(() => {
    // Listen for cookie consent changes
    const handleConsentChange = (event: CustomEvent) => {
      const preferences = event.detail;

      // Load/unload scripts based on consent
      if (preferences.analytics && isAllowed('analytics')) {
        loadAnalyticsScripts();
      } else {
        unloadAnalyticsScripts();
      }

      if (preferences.marketing && isAllowed('marketing')) {
        loadMarketingScripts();
      } else {
        unloadMarketingScripts();
      }

      if (preferences.functional && isAllowed('functional')) {
        loadFunctionalScripts();
      } else {
        unloadFunctionalScripts();
      }
    };

    window.addEventListener('cookieConsentChanged', handleConsentChange as EventListener);

    // Initial load if consent already given
    if (hasConsent) {
      if (isAllowed('analytics')) loadAnalyticsScripts();
      if (isAllowed('marketing')) loadMarketingScripts();
      if (isAllowed('functional')) loadFunctionalScripts();
    }

    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange as EventListener);
    };
  }, [hasConsent, isAllowed]);

  return <>{children}</>;
}

function loadAnalyticsScripts() {
  // Example: Load Google Analytics or similar
  // This is where you would conditionally load analytics scripts
  console.log('Loading analytics scripts...');

  // Example implementation:
  /*
  if (!document.querySelector('script[data-analytics]')) {
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID';
    script.async = true;
    script.setAttribute('data-analytics', 'true');
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', 'GA_TRACKING_ID');
  }
  */
}

function unloadAnalyticsScripts() {
  // Remove analytics scripts and cookies
  console.log('Unloading analytics scripts...');

  // Example implementation:
  /*
  const analyticsScripts = document.querySelectorAll('script[data-analytics]');
  analyticsScripts.forEach(script => script.remove());

  // Clear analytics cookies
  document.cookie = '_ga=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = '_gid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  */
}

function loadMarketingScripts() {
  // Load marketing/tracking scripts
  console.log('Loading marketing scripts...');
}

function unloadMarketingScripts() {
  // Remove marketing scripts and cookies
  console.log('Unloading marketing scripts...');
}

function loadFunctionalScripts() {
  // Load functional enhancement scripts
  console.log('Loading functional scripts...');
}

function unloadFunctionalScripts() {
  // Remove functional scripts
  console.log('Unloading functional scripts...');
}

// Type definitions for gtag (if using Google Analytics)
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
