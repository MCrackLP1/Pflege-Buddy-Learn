import { NextResponse } from 'next/server';
import { checkStripeEnvironment, validateClientStripeConfig } from '@/lib/stripe/config';

/**
 * Health check endpoint for Stripe configuration
 * GET /api/health/stripe
 */
export async function GET() {
  try {
    const serverCheck = checkStripeEnvironment();
    const clientCheck = validateClientStripeConfig();

    return NextResponse.json({
      server: {
        status: serverCheck.status,
        message: serverCheck.message,
        details: serverCheck.details
      },
      client: {
        isValid: clientCheck.isValid,
        mode: clientCheck.mode,
        errors: clientCheck.errors
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      server: {
        status: 'error',
        message: 'Health check failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      },
      client: {
        isValid: false,
        mode: 'unknown',
        errors: ['Health check failed']
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
