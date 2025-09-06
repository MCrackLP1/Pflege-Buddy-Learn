import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';

const locales = ['de', 'en'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // First try to get locale from cookie (user preference)
  let locale = (await cookies()).get('NEXT_LOCALE')?.value;

  // Fallback to request locale detection
  if (!locale || !locales.includes(locale as Locale)) {
    locale = await requestLocale;
  }

  if (!locales.includes(locale as Locale)) notFound();

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
