import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PflegeBuddy Learn - Interaktives Lernquiz für Pflegekräfte',
  description: 'Interaktives Lernquiz für Pflegekräfte. Sammeln Sie XP, testen Sie Ihr Fachwissen. Medizinisch fundiert & DSGVO-konform.',
  keywords: 'Pflege, Lernquiz, Weiterbildung, Multiple-Choice, Fachwissen, Pflegekräfte, Medizin',
  authors: [{ name: 'PflegeBuddy Team' }],
  creator: 'PflegeBuddy',
  publisher: 'PflegeBuddy',
  robots: 'index, follow',
  openGraph: {
    title: 'PflegeBuddy Learn - Interaktives Lernquiz für Pflegekräfte',
    description: 'Interaktives Lernquiz für Pflegekräfte. Sammeln Sie XP, testen Sie Ihr Fachwissen. Medizinisch fundiert & DSGVO-konform.',
    url: 'https://www.pflegebuddy.app',
    siteName: 'PflegeBuddy Learn',
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PflegeBuddy Learn - Interaktives Lernquiz für Pflegekräfte',
    description: 'Interaktives Lernquiz für Pflegekräfte. Sammeln Sie XP, testen Sie Ihr Fachwissen.',
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
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
