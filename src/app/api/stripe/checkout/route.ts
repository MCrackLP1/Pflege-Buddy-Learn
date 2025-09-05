import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { purchases } from '@/lib/db/schema';
import { logConsentEvent } from '@/lib/actions/legal';
import { LEGAL_CONFIG } from '@/lib/constants';
import { getStripeConfig } from '@/lib/stripe/config';

// Initialize Stripe with validated config
let stripe: Stripe;
let stripeConfig: any;

try {
  stripeConfig = getStripeConfig();
  stripe = new Stripe(stripeConfig.secretKey, {
    apiVersion: '2024-06-20',
  });
} catch (error) {
  console.error('Stripe configuration error:', error);
  // stripe will be undefined, handled in route
}

const HINT_PACKS = {
  '10_hints': { hints: 10 },
  '50_hints': { hints: 50 },
  '200_hints': { hints: 200 },
} as const;

export async function POST(req: NextRequest) {
  try {
    // Validate Stripe configuration first
    if (!stripe || !stripeConfig) {
      return NextResponse.json({
        error: 'Stripe configuration invalid. Please check environment variables.',
        configuration_error: true
      }, { status: 500 });
    }

    const { pack_key, withdrawal_waiver_consent } = await req.json();

    // Validate pack key
    if (!pack_key || !HINT_PACKS[pack_key as keyof typeof HINT_PACKS]) {
      return NextResponse.json({ error: 'Invalid pack key' }, { status: 400 });
    }

    // Validate withdrawal waiver consent for digital content
    if (!withdrawal_waiver_consent) {
      return NextResponse.json({
        error: 'Withdrawal waiver consent required for digital content',
        requires_waiver: true
      }, { status: 400 });
    }

    // Get user from auth
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pack = HINT_PACKS[pack_key as keyof typeof HINT_PACKS];

    // Get price ID from validated configuration (no hardcoded fallbacks)
    const priceId = stripeConfig.priceIds[pack_key];
    if (!priceId) {
      return NextResponse.json({
        error: 'Price configuration missing for this pack',
        configuration_error: true
      }, { status: 500 });
    }

    // Create Stripe checkout session with waiver metadata
    console.log('Creating Stripe session with:', {
      priceId,
      userId: user.id,
      packKey: pack_key,
      stripeMode: stripeConfig.mode,
      configValid: true
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.nextUrl.origin}/de/store?success=true`,
      cancel_url: `${req.nextUrl.origin}/de/store?cancelled=true`,
      metadata: {
        user_id: user.id,
        pack_key: pack_key,
        withdrawal_waiver_version: LEGAL_CONFIG.versions.withdrawal,
        withdrawal_waiver_consent: 'true',
      },
    });

    console.log('Stripe session created successfully:', session.id);

    // Use database transaction for atomic consent logging and purchase creation
    await db.transaction(async (tx) => {
      // Log withdrawal waiver consent event
      await logConsentEvent({
        type: 'withdrawal',
        version: LEGAL_CONFIG.versions.withdrawal,
        locale: 'de', // Default to German for legal compliance
        categories: { digital_content_delivery: true, waiver_acknowledged: true },
        userId: user.id // Pass user ID directly since we already have it
      });

      // Create purchase record with waiver info
      await tx.insert(purchases).values({
        userId: user.id,
        stripeSessionId: session.id,
        packKey: pack_key,
        hintsDelta: pack.hints,
        status: 'pending',
        withdrawalWaiverVersion: LEGAL_CONFIG.versions.withdrawal,
        withdrawalWaiverAt: new Date(),
      });
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id
    });

  } catch (error: any) {
    console.error('Stripe checkout error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param
    });

    return NextResponse.json({
      error: `Stripe Error: ${error.message || 'Failed to create checkout session'}`,
      stripe_error: true
    }, { status: 500 });
  }
}
