import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { purchases, userWallet } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { updatePurchaseWithdrawalWaiver } from '@/lib/actions/legal';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = headers();
  const signature = headersList.get('Stripe-Signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.payment_status === 'paid' && session.metadata?.pack_key && session.metadata?.user_id) {
          // Update purchase status
          await db
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

          // Get purchase details
          const purchase = await db
            .select()
            .from(purchases)
            .where(eq(purchases.stripeSessionId, session.id))
            .limit(1);

          if (purchase.length > 0) {
            const { userId, hintsDelta } = purchase[0];

            // Add hints to user wallet (immediate delivery for digital content)
            await db
              .insert(userWallet)
              .values({
                userId,
                hintsBalance: hintsDelta,
                dailyFreeHintsUsed: 0,
                dailyResetDate: new Date().toISOString().split('T')[0]
              })
              .onConflictDoUpdate({
                target: userWallet.userId,
                set: {
                  hintsBalance: sql`${userWallet.hintsBalance} + ${hintsDelta}`
                }
              });

            console.log(`✅ Added ${hintsDelta} hints to user ${userId} (digital delivery)`);
          }
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
