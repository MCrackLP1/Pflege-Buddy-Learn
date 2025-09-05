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

      // Initialize Supabase ADMIN client (bypasses RLS for webhooks)
      console.log('🔍 Checking for SUPABASE_SERVICE_ROLE...', !!process.env.SUPABASE_SERVICE_ROLE);
      
      if (!process.env.SUPABASE_SERVICE_ROLE) {
        console.error('❌ Missing SUPABASE_SERVICE_ROLE environment variable');
        throw new Error('Webhook requires Supabase service role key');
      }
      
      console.log('🔑 Service role key found, length:', process.env.SUPABASE_SERVICE_ROLE.length);
      
      // Create admin client that bypasses RLS
      const supabase = createServerClient(true); // Admin mode
      
      console.log('🔧 Admin client created, testing write permissions...');
      
      // Test admin permissions with a simple write test
      console.log('🔐 Testing admin write permissions...');
      
      try {
        // Try to insert a test row to verify admin permissions
        const testUserId = 'test-webhook-permissions-' + Date.now();
        const { data: testInsert, error: testInsertError } = await supabase
          .from('user_wallet')
          .insert({
            user_id: testUserId,
            hints_balance: 999,
            daily_free_hints_used: 0,
            daily_reset_date: new Date().toISOString().split('T')[0]
          })
          .select();
          
        if (testInsertError) {
          console.error('❌ Admin write test FAILED:', testInsertError);
          throw new Error(`Admin client lacks write permissions: ${testInsertError.message}`);
        }
        
        // Clean up test entry
        await supabase.from('user_wallet').delete().eq('user_id', testUserId);
        console.log('✅ Admin write permissions confirmed - test insert/delete successful');
        
      } catch (adminTestError) {
        console.error('❌ Admin permission test failed:', adminTestError);
        throw new Error(`Webhook admin setup failed: ${adminTestError instanceof Error ? adminTestError.message : 'Unknown admin error'}`);
      }

      try {
        // Simple approach: Get existing wallet
        console.log('🔍 Looking up user wallet for user:', userId);
        
        const { data: existingWallet, error: selectError } = await supabase
          .from('user_wallet')
          .select('hints_balance')
          .eq('user_id', userId)
          .maybeSingle(); // Use maybeSingle instead of single to avoid errors
        
        if (selectError) {
          console.error('❌ Error selecting user wallet:', selectError);
          throw new Error(`Database select failed: ${selectError.message}`);
        }
        
        console.log('💰 Existing wallet found:', !!existingWallet);
        
        if (existingWallet) {
          // User has wallet - add to existing balance
          const newBalance = existingWallet.hints_balance + hintsToAdd;
          console.log(`📈 Updating: ${existingWallet.hints_balance} + ${hintsToAdd} = ${newBalance}`);
          
          const { error: updateError } = await supabase
            .from('user_wallet')
            .update({ hints_balance: newBalance })
            .eq('user_id', userId);
            
          if (updateError) {
            console.error('❌ Update failed:', updateError);
            throw new Error(`Database update failed: ${updateError.message}`);
          }
          
          console.log(`✅ Updated wallet to ${newBalance} hints`);
        } else {
          // User has no wallet - create new with starting hints + purchased
          const startingBalance = 5 + hintsToAdd; // 5 starting + purchased
          console.log(`🆕 Creating wallet with ${startingBalance} hints (5 start + ${hintsToAdd} purchased)`);
          
          const { error: insertError } = await supabase
            .from('user_wallet')
            .insert({
              user_id: userId,
              hints_balance: startingBalance,
              daily_free_hints_used: 0,
              daily_reset_date: new Date().toISOString().split('T')[0]
            });
            
          if (insertError) {
            console.error('❌ Insert failed:', insertError);
            console.error('❌ Insert error details:', JSON.stringify(insertError, null, 2));
            throw new Error(`Database insert failed: ${insertError.message}`);
          }
          
          console.log(`✅ Created wallet with ${startingBalance} hints`);
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
