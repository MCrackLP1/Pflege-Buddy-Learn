// Application configuration
export const APP_CONFIG = {
  GAMIFICATION: {
    XP_PER_DIFFICULTY: 10, // Base XP per difficulty level
    XP_PENALTY_PER_HINT: 5, // XP reduction per hint used
    MIN_XP_PER_QUESTION: 1, // Minimum XP per question
    STREAK_RESET_HOURS: 48, // Hours before streak resets
    DAILY_QUESTION_GOAL: 5, // Questions needed for daily goal
  },
};

// Legal and compliance constants for DE/BY GDPR compliance

export const LEGAL_CONFIG = {
  // Provider information (from env)
  provider: {
    name: process.env.LEGAL_PROVIDER_NAME || 'Mark Tietz',
    brand: process.env.LEGAL_BRAND_NAME || 'PflegeBuddy Learn',
    address: {
      line1: process.env.LEGAL_ADDRESS_LINE1 || 'Königplatz 3',
      postcode: process.env.LEGAL_POSTCODE || '87448',
      city: process.env.LEGAL_CITY || 'Waltenhofen',
      state: process.env.LEGAL_STATE || 'Bayern',
      country: process.env.LEGAL_COUNTRY || 'Deutschland',
    },
    email: process.env.LEGAL_EMAIL || 'deinpflegebuddy@gmail.com',
    phone: process.env.LEGAL_PHONE || '',
    vatId: process.env.LEGAL_VAT_ID || '',
    isKleinunternehmer: process.env.LEGAL_KLEINUNTERNEHMER === 'true',
    jugendschutzbeauftragter: process.env.LEGAL_JUGENDSCHUTZBEAUFTRAGTER || '',
  },

  // Legal document versions
  versions: {
    terms: process.env.LEGAL_TERMS_VERSION || '1.0.0',
    privacy: process.env.LEGAL_PRIVACY_VERSION || '1.0.0',
    cookie: process.env.LEGAL_COOKIE_VERSION || '1.0.0',
    withdrawal: process.env.LEGAL_WITHDRAWAL_VERSION || '1.0.0',
  },

  // Processor DPAs
  processors: {
    supabase: process.env.LEGAL_PROCESSOR_SUPABASE_DPA || 'https://supabase.com/privacy',
    vercel: process.env.LEGAL_PROCESSOR_VERCEL_DPA || 'https://vercel.com/legal/dpa',
  },

  // Legal pages paths
  pages: {
    impressum: '/impressum',
    datenschutz: '/datenschutz',
    agb: '/agb',
    widerruf: '/widerruf',
    cookies: '/cookies',
    cookieSettings: '/cookie-einstellungen',
  },

  // Cookie categories (TTDSG compliance)
  cookieCategories: {
    essential: {
      id: 'essential',
      name: 'Essenziell',
      description: 'Notwendig für den Betrieb der Website',
      required: true,
      providers: ['Supabase', 'Vercel'],
    },
    functional: {
      id: 'functional',
      name: 'Funktional',
      description: 'Verbessert die Benutzererfahrung',
      required: false,
      providers: ['Supabase'],
    },
    analytics: {
      id: 'analytics',
      name: 'Analyse',
      description: 'Hilft uns, die Website zu verbessern',
      required: false,
      providers: [],
    },
    marketing: {
      id: 'marketing',
      name: 'Marketing',
      description: 'Für personalisierte Werbung',
      required: false,
      providers: [],
    },
  },

  // EU/DE legal requirements
  euRequirements: {
    ageVerification: 16, // Art. 8 DSGVO in DE
    withdrawalPeriodDays: 14, // EU standard
    dataRetentionDays: 365, // General retention period
  },

  // Security headers
  securityHeaders: {
    csp: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;",
    hsts: 'max-age=31536000; includeSubDomains; preload',
    xFrameOptions: 'SAMEORIGIN',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: 'geolocation=(), camera=(), microphone=(), payment=()',
  },
};

// Legal document templates and content helpers
export const LEGAL_CONTENT = {
  lastUpdated: new Date('2024-01-15').toLocaleDateString('de-DE'),

  // Common legal phrases
  common: {
    de: {
      contactEmail: 'E-Mail: info@pflegebuddy.app',
      responsibleParty: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
      noMedicalAdvice: 'Dies ist keine medizinische Beratung oder Notfallhilfe.',
      euOdr: 'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/',
      vsbgNotice: 'Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
    },
    en: {
      contactEmail: 'Email: info@pflegebuddy.app',
      responsibleParty: 'Responsible for content according to § 18 Abs. 2 MStV',
      noMedicalAdvice: 'This is not medical advice or emergency assistance.',
      euOdr: 'The European Commission provides a platform for online dispute resolution (ODR): https://ec.europa.eu/consumers/odr/',
      vsbgNotice: 'We are not willing or obliged to participate in dispute settlement proceedings before a consumer arbitration board.',
    },
  },
};

// Helper functions
export function getFullLegalAddress() {
  const addr = LEGAL_CONFIG.provider.address;
  return `${addr.line1}, ${addr.postcode} ${addr.city}, ${addr.state}, ${addr.country}`;
}

export function getVatNotice() {
  if (LEGAL_CONFIG.provider.isKleinunternehmer) {
    return 'Als Kleinunternehmer im Sinne des § 19 UStG wird keine Umsatzsteuer berechnet.';
  }
  return 'Alle Preise inklusive gesetzlicher Umsatzsteuer.';
}

export function isLegalVersionOutdated(type: keyof typeof LEGAL_CONFIG.versions, userVersion?: string) {
  if (!userVersion) return true;
  return userVersion !== LEGAL_CONFIG.versions[type];
}