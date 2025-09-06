import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { createServerClient } from '@/lib/supabase/server';
import { AuthProvider } from '@/components/providers/auth-provider';

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return [{ locale: 'de' }, { locale: 'en' }];
}

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  // Enable static rendering
  unstable_setRequestLocale(locale);
  
  const messages = await getMessages();
  const supabase = createServerClient();
  
  // Get initial session
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider initialSession={session}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
