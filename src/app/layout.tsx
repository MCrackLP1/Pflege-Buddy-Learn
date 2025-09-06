import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

// Preload critical resources
import { headers } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PflegeBuddy Learn - Interaktives Lernquiz für Pflegekräfte',
  description: 'Interaktives Lernquiz für Pflegefachkräfte. Sammle XP-Punkte, teste dein medizinisches Fachwissen. Multiple-Choice Fragen zu Pflegeausbildung & Weiterbildung. Medizinisch fundiert & DSGVO-konform.',
  keywords: 'Pflege, Lernquiz, Weiterbildung, Multiple-Choice, Fachwissen, Pflegekräfte, Medizin, Pflegeausbildung, Pflegefachwissen, medizinische Weiterbildung, Pflegequiz, Krankenpflege, Gesundheitswesen',
  authors: [{ name: 'PflegeBuddy Team' }],
  creator: 'PflegeBuddy',
  publisher: 'PflegeBuddy',
  robots: 'index, follow',
  openGraph: {
    title: 'PflegeBuddy Learn - Interaktives Lernquiz für Pflegekräfte',
    description: 'Interaktives Lernquiz für Pflegefachkräfte. Sammle XP-Punkte, teste dein medizinisches Fachwissen. Multiple-Choice Fragen zu Pflegeausbildung & Weiterbildung. Medizinisch fundiert & DSGVO-konform.',
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
    maximumScale: 1,
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
        {/* hreflang tags for multilingual SEO */}
        <link rel="alternate" hrefLang="de" href="https://www.pflegebuddy.app/de" />
        <link rel="alternate" hrefLang="en" href="https://www.pflegebuddy.app/en" />
        <link rel="alternate" hrefLang="x-default" href="https://www.pflegebuddy.app/de" />

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />

        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* Google Fonts - Inter */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
