import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { stripe, HINTS_PRICES, HINTS_PACKAGES } from '@/lib/stripe';
import { z } from 'zod';

const checkoutSchema = z.object({
  sku: z.enum(['S', 'M', 'L']).optional(),
  priceId: z.string().optional(),
}).refine((data) => data.sku || data.priceId, {
  message: "Either 'sku' or 'priceId' must be provided",
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = checkoutSchema.parse(body);

    // Get user from Supabase auth
    const supabase = createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to purchase hints.' },
        { status: 401 }
      );
    }

    // Determine price ID
    let priceId: string;
    let quantity: number;
    let packageSize: keyof typeof HINTS_PACKAGES;

    if (validatedData.sku) {
      packageSize = validatedData.sku;
      priceId = HINTS_PRICES[packageSize];
      quantity = HINTS_PACKAGES[packageSize].quantity;
    } else if (validatedData.priceId) {
      priceId = validatedData.priceId;
      // Determine package size from price ID
      const priceToSku = Object.entries(HINTS_PRICES).find(([_, price]) => price === priceId);
      if (!priceToSku) {
        return NextResponse.json(
          { error: 'Invalid price ID provided' },
          { status: 400 }
        );
      }
      packageSize = priceToSku[0] as keyof typeof HINTS_PACKAGES;
      quantity = HINTS_PACKAGES[packageSize].quantity;
    } else {
      return NextResponse.json(
        { error: 'Invalid request: missing sku or priceId' },
        { status: 400 }
      );
    }

    // Validate APP_URL
    const appUrl = process.env.APP_URL;
    if (!appUrl) {
      throw new Error('APP_URL environment variable is required');
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel`,
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      metadata: {
        userId: user.id,
        userEmail: user.email || '',
        packageSize,
        hintsQuantity: quantity.toString(),
        appName: 'PflegeBuddy Learn',
      },
      customer_email: user.email || undefined,
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['DE', 'AT', 'CH'], // DACH region
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Checkout API Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to create a checkout session.' },
    { status: 405 }
  );
}
