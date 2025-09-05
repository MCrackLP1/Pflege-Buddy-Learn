import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    'Missing required environment variable STRIPE_SECRET_KEY. ' +
    'Make sure to add your Stripe secret key to .env.local'
  );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
});

// Price IDs for hints packages
export const HINTS_PRICES = {
  S: process.env.STRIPE_PRICE_HINTS_S!,
  M: process.env.STRIPE_PRICE_HINTS_M!,
  L: process.env.STRIPE_PRICE_HINTS_L!,
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
