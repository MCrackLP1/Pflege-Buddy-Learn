import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PflegeBuddy Learn',
  description: 'Daily nursing knowledge drills. Not medical advice.',
  robots: 'noindex, nofollow', // Privacy-focused
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
      </body>
    </html>
  )
}
