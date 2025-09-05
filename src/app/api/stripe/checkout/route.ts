import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { purchases } from '@/lib/db/schema';
import { logConsentEvent } from '@/lib/actions/legal';
import { LEGAL_CONFIG } from '@/lib/constants';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const HINT_PACKS = {
  '10_hints': { hints: 10, price_id: 'price_10_hints' },
  '50_hints': { hints: 50, price_id: 'price_50_hints' },
  '200_hints': { hints: 200, price_id: 'price_200_hints' },
};

export async function POST(req: NextRequest) {
  try {
    const { pack_key, withdrawal_waiver_consent } = await req.json();

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

    // Check for proper Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('sk_test_')) {
      return NextResponse.json({
        error: 'Stripe not properly configured. Please check your environment variables.',
        stripe_config_error: true,
        pack_details: pack
      }, { status: 500 });
    }

    // Get price ID from environment or use default
    const priceIds = process.env.NEXT_PUBLIC_STRIPE_PRICE_IDS
      ? JSON.parse(process.env.NEXT_PUBLIC_STRIPE_PRICE_IDS)
      : { '10_hints': 'price_demo1', '50_hints': 'price_demo2', '200_hints': 'price_demo3' };

    const priceId = priceIds[pack_key] || pack.price_id;

    // Create Stripe checkout session with waiver metadata
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

    // Log withdrawal waiver consent event
    await logConsentEvent({
      type: 'withdrawal',
      version: LEGAL_CONFIG.versions.withdrawal,
      locale: 'de', // Default to German for legal compliance
      categories: { digital_content_delivery: true, waiver_acknowledged: true }
    });

    // Create purchase record with waiver info
    await db.insert(purchases).values({
      userId: user.id,
      stripeSessionId: session.id,
      packKey: pack_key,
      hintsDelta: pack.hints,
      status: 'pending',
      withdrawalWaiverVersion: LEGAL_CONFIG.versions.withdrawal,
      withdrawalWaiverAt: new Date(),
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({
      error: 'Failed to create checkout session'
    }, { status: 500 });
  }
}
