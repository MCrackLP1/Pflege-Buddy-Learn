import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { usePathname } from 'next/navigation'
import './globals.css'
import './accessibility.css'

// Preload critical resources
import { headers } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PflegeBuddy Learn - Interaktives Lernquiz für Pflegekräfte',
  description: 'Interaktives Lernquiz für Pflegefachkräfte. Sammle XP-Punkte, teste dein medizinisches Fachwissen. Multiple-Choice Fragen zu Pflegeweiterbildung & Weiterbildung. Medizinisch fundiert & DSGVO-konform.',
  keywords: 'Pflege, Lernquiz, Weiterbildung, Multiple-Choice, Fachwissen, Pflegekräfte, Medizin, Pflegeweiterbildung, Pflegefachwissen, medizinische Weiterbildung, Pflegequiz, Krankenpflege, Gesundheitswesen',
  authors: [{ name: 'PflegeBuddy Team' }],
  creator: 'PflegeBuddy',
  publisher: 'PflegeBuddy',
  robots: 'index, follow',
  openGraph: {
    title: 'PflegeBuddy Learn - Interaktives Lernquiz für Pflegekräfte',
    description: 'Interaktives Lernquiz für Pflegefachkräfte. Sammle XP-Punkte, teste dein medizinisches Fachwissen. Multiple-Choice Fragen zu Pflegeweiterbildung & Weiterbildung. Medizinisch fundiert & DSGVO-konform.',
    url: 'https://www.pflegebuddy.app',
    siteName: 'PflegeBuddy Learn',
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PflegeBuddy Learn - Interaktives Lernquiz für Pflegekräfte',
    description: 'Interaktives Lernquiz für Pflegefachkräfte. Sammle XP-Punkte, teste dein medizinisches Fachwissen mit Multiple-Choice Fragen.',
    creator: '@pflegebuddy',
  },
  icons: {
    icon: [
      { url: '/favicon/logo.ico', sizes: 'any' },
      { url: '/favicon/logo.webp', sizes: '32x32', type: 'image/webp' },
    ],
    apple: [
      { url: '/favicon/logo.webp', sizes: '180x180' },
    ],
  },
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: '#000000',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className="dark">
      <head>
        {/* hreflang tags for multilingual SEO - handled by component below */}

        {/* Search Engine Optimization */}
        <meta name="msvalidate.01" content="634EC7319507185DEBBCB16C4AD2D99F" />
        <meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE" />
        <meta name="yandex-verification" content="f34d8314aa876df9" />

        {/* Hreflang Tags Component */}
        <HreflangTagsComponent />

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />

        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* Optimized Fonts */}
        <link
          rel="preload"
          href="/fonts.css"
          as="style"
          onLoad="this.onload=null;this.rel='stylesheet'"
        />
        <noscript>
          <link href="/fonts.css" rel="stylesheet" />
        </noscript>
      </head>
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

// Client component for hreflang tags
function HreflangTagsComponent() {
  // This will be rendered on the client side
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  // Remove locale prefix to get the base path
  const basePath = pathname.replace(/^\/(de|en)/, '') || '/';

  const hreflangs = [
    { lang: 'de', url: `https://www.pflegebuddy.app/de${basePath}` },
    { lang: 'en', url: `https://www.pflegebuddy.app/en${basePath}` },
  ];

  return (
    <>
      {hreflangs.map(({ lang, url }) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={url}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`https://www.pflegebuddy.app/de${basePath}`}
      />
    </>
  );
}
