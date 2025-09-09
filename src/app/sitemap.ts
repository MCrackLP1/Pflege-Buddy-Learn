import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.pflegebuddy.app'

  // Define all available locales
  const locales = ['de', 'en'] as const

  // Define all routes (without locale prefix)
  const routes = [
    '',
    '/learn',
    '/quiz',
    '/ranked',
    '/review',
    '/profile',
    '/shop',
    '/datenschutz',
    '/agb',
    '/impressum',
    '/cookies',
    '/kontakt',
    '/ueber-uns',
    '/faq',
    '/disclaimer-medizin',
    '/widerruf'
  ]

  const sitemapEntries: MetadataRoute.Sitemap = []

  // Generate entries for each locale
  locales.forEach(locale => {
    routes.forEach(route => {
      const url = route === '' ? `${baseUrl}/${locale}` : `${baseUrl}/${locale}${route}`

      // Set priority based on route importance
      let priority = 0.5
      if (route === '') priority = locale === 'de' ? 1.0 : 0.9
      else if (['/learn', '/quiz', '/faq'].includes(route)) priority = 0.8
      else if (['/ranked', '/review', '/kontakt'].includes(route)) priority = 0.7
      else if (['/profile', '/shop', '/ueber-uns'].includes(route)) priority = 0.6
      else if (['/datenschutz', '/agb', '/impressum', '/cookies', '/disclaimer-medizin', '/widerruf'].includes(route)) priority = 0.3

      // Set change frequency based on content type
      let changeFrequency: 'weekly' | 'monthly' | 'yearly' = 'monthly'
      if (route === '') changeFrequency = 'weekly'
      else if (['/datenschutz', '/agb', '/impressum', '/cookies', '/disclaimer-medizin', '/widerruf'].includes(route)) changeFrequency = 'yearly'

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency,
        priority,
      })
    })
  })

  return sitemapEntries
}
