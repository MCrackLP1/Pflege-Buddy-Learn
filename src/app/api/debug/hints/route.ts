import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        authError: authError?.message,
        user: !!user 
      }, { status: 401 });
    }

    // Check if user has wallet
    const { data: wallet, error: walletError } = await supabase
      .from('user_wallet')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Check all wallets (for debugging)
    const { data: allWallets } = await supabase
      .from('user_wallet')
      .select('*');

    return NextResponse.json({
      success: true,
      debug: {
        userId: user.id,
        userEmail: user.email,
        hasWallet: !!wallet,
        wallet: wallet,
        walletError: walletError,
        totalWalletsInDB: allWallets?.length || 0,
        allWallets: allWallets || []
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
