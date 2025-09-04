import { useLocale } from 'next-intl';

// Utility hook for creating localized URLs
export function useLocalizedRouter() {
  const locale = useLocale();
  
  const push = (path: string) => {
    // Ensure path starts with locale
    const localizedPath = path.startsWith(`/${locale}`) 
      ? path 
      : `/${locale}${path.startsWith('/') ? '' : '/'}${path}`;
    
    return localizedPath;
  };
  
  return { push };
}

// Utility function for creating localized paths
export function createLocalizedPath(locale: string, path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${cleanPath}`;
}
