import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { purchases, userWallet } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { updatePurchaseWithdrawalWaiver } from '@/lib/actions/legal';
import { getStripeConfig } from '@/lib/stripe/config';

// Initialize Stripe with validated config
let stripe: Stripe;
let webhookSecret: string;

try {
  const stripeConfig = getStripeConfig();
  stripe = new Stripe(stripeConfig.secretKey, {
    apiVersion: '2024-06-20',
  });
  webhookSecret = stripeConfig.webhookSecret;
} catch (error) {
  console.error('Stripe webhook configuration error:', error);
  // These will be undefined, handled in route
}

export async function POST(req: NextRequest) {
  // Validate Stripe configuration first
  if (!stripe || !webhookSecret) {
    console.error('Webhook called but Stripe not configured');
    return NextResponse.json({ error: 'Service configuration error' }, { status: 500 });
  }

  const body = await req.text();
  const headersList = headers();
  const signature = headersList.get('Stripe-Signature');

  if (!signature) {
    console.error('Missing Stripe signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Log webhook event for debugging (in development only)
  if (process.env.NODE_ENV !== 'production') {
    console.log('Received webhook event:', event.type, event.id);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.payment_status === 'paid' && session.metadata?.pack_key && session.metadata?.user_id) {
          // Check if this session has already been processed (idempotency)
          const existingPurchase = await db
            .select()
            .from(purchases)
            .where(eq(purchases.stripeSessionId, session.id))
            .limit(1);

          if (existingPurchase.length === 0) {
            console.error(`No purchase record found for session ${session.id}`);
            break;
          }

          const purchase = existingPurchase[0];

          // Idempotency check: if already succeeded, skip processing
          if (purchase.status === 'succeeded') {
            console.log(`Session ${session.id} already processed, skipping`);
            break;
          }

          // Use database transaction for atomic updates
          await db.transaction(async (tx) => {
            // Update purchase status
            await tx
              .update(purchases)
              .set({ status: 'succeeded' })
              .where(eq(purchases.stripeSessionId, session.id));

            // Handle withdrawal waiver if present in metadata
            if (session.metadata.withdrawal_waiver_version) {
              await updatePurchaseWithdrawalWaiver(
                session.id,
                session.metadata.withdrawal_waiver_version
              );
              console.log(`✅ Recorded withdrawal waiver for session ${session.id}`);
            }

            // Add hints to user wallet (immediate delivery for digital content)
            await tx
              .insert(userWallet)
              .values({
                userId: purchase.userId,
                hintsBalance: purchase.hintsDelta,
                dailyFreeHintsUsed: 0,
                dailyResetDate: new Date().toISOString().split('T')[0]
              })
              .onConflictDoUpdate({
                target: userWallet.userId,
                set: {
                  hintsBalance: sql`${userWallet.hintsBalance} + ${purchase.hintsDelta}`
                }
              });

            console.log(`✅ Added ${purchase.hintsDelta} hints to user ${purchase.userId} (digital delivery)`);
          });
        }
        break;
      }

      case 'checkout.session.expired':
      case 'payment_intent.payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        await db
          .update(purchases)
          .set({ status: 'failed' })
          .where(eq(purchases.stripeSessionId, session.id));
        
        console.log(`❌ Payment failed for session ${session.id}`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
