import Stripe from 'stripe';

// Server-side Stripe instance (only use on server)
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (typeof window !== 'undefined') {
      throw new Error('Stripe secret key should never be used on the client side');
    }
    
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error(
        'Missing required environment variable STRIPE_SECRET_KEY. ' +
        'Make sure to add your Stripe secret key to your deployment environment'
      );
    }

    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    });
  }
  
  return _stripe;
}

// For backwards compatibility (server-side only)
export const stripe = {
  get checkout() {
    return getStripe().checkout;
  },
  get webhooks() {
    return getStripe().webhooks;
  }
};

// Price IDs for hints packages (safe to access on client)
export const HINTS_PRICES = {
  S: process.env.STRIPE_PRICE_HINTS_S || 'price_1S47GBHcAFSVUhHPdO1Bnyil',
  M: process.env.STRIPE_PRICE_HINTS_M || 'price_1S47GDHcAFSVUhHPE0xO4Asj',
  L: process.env.STRIPE_PRICE_HINTS_L || 'price_1S47GEHcAFSVUhHPfw6xh04q',
} as const;

// Package configurations
export const HINTS_PACKAGES = {
  S: { quantity: 10, badge: null },
  M: { quantity: 30, badge: 'Meistgewählt' },
  L: { quantity: 100, badge: 'Bester Deal' },
} as const;

// Format currency helper
export function formatCurrency(amountInCents: number, currency = 'EUR', locale = 'de-DE'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amountInCents / 100);
}

// Validate environment variables
export function validateStripeConfig() {
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_PRICE_HINTS_S',
    'STRIPE_PRICE_HINTS_M',
    'STRIPE_PRICE_HINTS_L',
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required Stripe environment variables: ${missing.join(', ')}. ` +
      'Please check your .env.local configuration.'
    );
  }
}
