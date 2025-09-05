import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

// Disable body parsing to get raw body for webhook signature verification
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('🎯 Webhook received!');
  
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('❌ Webhook Error: Missing Stripe signature');
    return NextResponse.json(
      { error: 'Missing Stripe signature' },
      { status: 400 }
    );
  }

  console.log('✅ Webhook signature present, verifying...');

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Webhook Error: Missing STRIPE_WEBHOOK_SECRET environment variable');
    return NextResponse.json(
      { error: 'Webhook configuration error' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify the webhook signature
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    console.log('🎉 Webhook event received:', event.type);

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log('💰 Processing completed checkout session:', session.id);
      console.log('📋 Session metadata:', session.metadata);

      // Extract metadata
      const { userId, packageSize, hintsQuantity } = session.metadata || {};

      console.log('🔍 Extracted data:', { userId, packageSize, hintsQuantity });

      if (!userId || !hintsQuantity) {
        console.error('Missing required metadata in session:', session.id);
        return NextResponse.json(
          { error: 'Missing required metadata' },
          { status: 400 }
        );
      }

      const hintsToAdd = parseInt(hintsQuantity, 10);
      if (isNaN(hintsToAdd) || hintsToAdd <= 0) {
        console.error('Invalid hints quantity:', hintsQuantity);
        return NextResponse.json(
          { error: 'Invalid hints quantity' },
          { status: 400 }
        );
      }

      // Initialize Supabase admin client
      const supabase = createServerClient();

      try {
        // Get or create user wallet
        console.log('🔍 Looking up user wallet for user:', userId);
        
        const { data: existingWallet, error: selectError } = await supabase
          .from('user_wallet')
          .select('hints_balance')
          .eq('user_id', userId)
          .single();
          
        if (selectError && selectError.code !== 'PGRST116') {
          console.error('❌ Error querying user wallet:', selectError);
          throw selectError;
        }
        
        console.log('💰 Existing wallet:', existingWallet);

        if (existingWallet) {
          // Update existing wallet
          console.log(`📈 Updating existing wallet: ${existingWallet.hints_balance} + ${hintsToAdd}`);
          
          const { error: updateError } = await supabase
            .from('user_wallet')
            .update({
              hints_balance: existingWallet.hints_balance + hintsToAdd
            })
            .eq('user_id', userId);

          if (updateError) {
            console.error('❌ Error updating user wallet:', updateError);
            throw updateError;
          }

          console.log(`✅ Added ${hintsToAdd} hints to user ${userId}. New balance: ${existingWallet.hints_balance + hintsToAdd}`);
        } else {
          // Create new wallet with purchased hints
          console.log(`🆕 Creating new wallet for user ${userId} with ${hintsToAdd} hints`);
          
          const { error: insertError } = await supabase
            .from('user_wallet')
            .insert({
              user_id: userId,
              hints_balance: hintsToAdd,
              daily_free_hints_used: 0,
              daily_reset_date: new Date().toISOString().split('T')[0]
            });

          if (insertError) {
            console.error('❌ Error creating user wallet:', insertError);
            throw insertError;
          }

          console.log(`✅ Created new wallet for user ${userId} with ${hintsToAdd} hints`);
        }

        // TODO: Optional - Log the purchase for analytics/support
        // You could create a purchases table to track all transactions
        
        console.log('Successfully processed hints purchase:', {
          userId,
          packageSize,
          hintsQuantity: hintsToAdd,
          sessionId: session.id,
          paymentIntentId: session.payment_intent,
        });

      } catch (dbError) {
        console.error('Database error processing hints purchase:', dbError);
        // Note: In production, you might want to implement retry logic
        // or queue the purchase for manual processing
        return NextResponse.json(
          { error: 'Database error processing purchase' },
          { status: 500 }
        );
      }
    }

    // Return 200 to acknowledge receipt of the webhook
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler error' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods - but also allow GET for testing
export async function GET() {
  return NextResponse.json({
    message: 'Stripe Webhook Endpoint',
    status: 'Ready to receive webhooks',
    timestamp: new Date().toISOString(),
    endpoint: '/api/stripe/webhook'
  });
}
