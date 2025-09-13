import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

// Disable body parsing to get raw body for webhook signature verification
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('Webhook Error: Missing Stripe signature');
    return NextResponse.json(
      { error: 'Missing Stripe signature' },
      { status: 400 }
    );
  }

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
    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log('Processing checkout session:', session.id);

      // Extract metadata
      const { userId, hintsQuantity } = session.metadata || {};
      // const packageSize = session.metadata?.packageSize; // Not used currently

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

      // Initialize Supabase ADMIN client (bypasses RLS for webhooks)
      if (!process.env.SUPABASE_SERVICE_ROLE) {
        console.error('Missing SUPABASE_SERVICE_ROLE environment variable');
        throw new Error('Webhook requires Supabase service role key');
      }
      
      // Create admin client that bypasses RLS
      const supabase = createServerClient(true); // Admin mode

      try {
        // Get existing wallet
        const { data: existingWallet, error: selectError } = await supabase
          .from('user_wallet')
          .select('hints_balance')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (selectError) {
          console.error('Error selecting user wallet:', selectError);
          throw new Error(`Database select failed: ${selectError.message}`);
        }
        
        if (existingWallet) {
          // User has wallet - add to existing balance
          const newBalance = existingWallet.hints_balance + hintsToAdd;
          
          const { error: updateError } = await supabase
            .from('user_wallet')
            .update({ hints_balance: newBalance })
            .eq('user_id', userId);
            
          if (updateError) {
            console.error('Error updating user wallet:', updateError);
            throw new Error(`Database update failed: ${updateError.message}`);
          }
          
          console.log(`Added ${hintsToAdd} hints to user. New balance: ${newBalance}`);
        } else {
          // User has no wallet - create new with starting hints + purchased
          const startingBalance = 5 + hintsToAdd; // 5 starting + purchased
          
          const { error: insertError } = await supabase
            .from('user_wallet')
            .insert({
              user_id: userId,
              hints_balance: startingBalance,
              daily_free_hints_used: 0,
              daily_reset_date: new Date().toISOString().split('T')[0]
            });
            
          if (insertError) {
            console.error('Error creating user wallet:', insertError);
            throw new Error(`Database insert failed: ${insertError.message}`);
          }
          
          console.log(`Created wallet with ${startingBalance} hints for user`);
        }

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
