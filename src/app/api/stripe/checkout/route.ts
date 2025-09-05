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

    // Force LIVE MODE for production - use environment variables or fallback to live keys
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        error: 'Stripe nicht konfiguriert. Bitte überprüfen Sie die Environment-Variablen.',
        demo_mode: true,
        pack_details: pack
      }, { status: 500 });
    }

    // Get price ID from environment or use default
    let priceIds;
    try {
      priceIds = process.env.NEXT_PUBLIC_STRIPE_PRICE_IDS
        ? JSON.parse(process.env.NEXT_PUBLIC_STRIPE_PRICE_IDS)
        : { '10_hints': 'price_1S3QDmHcAFSVUhHPGgC3ENBL', '50_hints': 'price_1S3QEgHcAFSVUhHPLC2II23r', '200_hints': 'price_1S3QGHHcAFSVUhHPjzi7Trjy' };
    } catch (e) {
      // Fallback to hardcoded live prices if JSON parsing fails
      priceIds = { '10_hints': 'price_1S3QDmHcAFSVUhHPGgC3ENBL', '50_hints': 'price_1S3QEgHcAFSVUhHPLC2II23r', '200_hints': 'price_1S3QGHHcAFSVUhHPjzi7Trjy' };
    }

    const priceId = priceIds[pack_key] || pack.price_id;

    // Create Stripe checkout session with waiver metadata
    console.log('Creating Stripe session with:', {
      priceId,
      userId: user.id,
      packKey: pack_key,
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7)
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
