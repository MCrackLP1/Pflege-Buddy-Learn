import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's wallet data
    const { data: wallet } = await supabase
      .from('user_wallet')
      .select('hints_balance, daily_free_hints_used, daily_reset_date')
      .eq('user_id', user.id)
      .single();

    if (!wallet) {
      // Create wallet if it doesn't exist
      const { data: newWallet } = await supabase
        .from('user_wallet')
        .insert({
          user_id: user.id,
          hints_balance: 0,
          daily_free_hints_used: 0,
          daily_reset_date: new Date().toISOString(),
        })
        .select('hints_balance, daily_free_hints_used, daily_reset_date')
        .single();

      return NextResponse.json({
        hintsBalance: newWallet?.hints_balance || 0,
        dailyFreeHintsUsed: newWallet?.daily_free_hints_used || 0,
        freeHintsLeft: 2, // Daily free hints limit
      });
    }

    // Check if we need to reset daily free hints
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastReset = wallet.daily_reset_date ? new Date(wallet.daily_reset_date) : new Date();
    lastReset.setHours(0, 0, 0, 0);

    let dailyFreeHintsUsed = wallet.daily_free_hints_used;
    if (today > lastReset) {
      // Reset daily free hints
      dailyFreeHintsUsed = 0;
      await supabase
        .from('user_wallet')
        .update({
          daily_free_hints_used: 0,
          daily_reset_date: today.toISOString(),
        })
        .eq('user_id', user.id);
    }

    const freeHintsLeft = Math.max(0, 2 - dailyFreeHintsUsed);

    return NextResponse.json({
      hintsBalance: wallet.hints_balance,
      dailyFreeHintsUsed,
      freeHintsLeft,
    });

  } catch (error) {
    console.error('Error fetching hints:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hints data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

    if (action === 'use_hint') {
      // Get current wallet data
      const { data: wallet } = await supabase
        .from('user_wallet')
        .select('hints_balance, daily_free_hints_used, daily_reset_date')
        .eq('user_id', user.id)
        .single();

      if (!wallet) {
        return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
      }

      // Check if we need to reset daily free hints
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastReset = wallet.daily_reset_date ? new Date(wallet.daily_reset_date) : new Date();
      lastReset.setHours(0, 0, 0, 0);

      let dailyFreeHintsUsed = wallet.daily_free_hints_used;
      let hintsBalance = wallet.hints_balance;

      if (today > lastReset) {
        dailyFreeHintsUsed = 0;
      }

      // Try to use a free hint first, then paid hints
      let usedFreeHint = false;
      let usedPaidHint = false;

      if (dailyFreeHintsUsed < 2) {
        // Use free hint
        dailyFreeHintsUsed += 1;
        usedFreeHint = true;
      } else if (hintsBalance > 0) {
        // Use paid hint
        hintsBalance -= 1;
        usedPaidHint = true;
      } else {
        return NextResponse.json({
          error: 'No hints available',
          hintsBalance: wallet.hints_balance,
          freeHintsLeft: Math.max(0, 2 - wallet.daily_free_hints_used),
        }, { status: 400 });
      }

      // Update wallet
      await supabase
        .from('user_wallet')
        .update({
          hints_balance: hintsBalance,
          daily_free_hints_used: dailyFreeHintsUsed,
          daily_reset_date: today > lastReset ? today.toISOString() : wallet.daily_reset_date,
        })
        .eq('user_id', user.id);

      return NextResponse.json({
        success: true,
        usedFreeHint,
        usedPaidHint,
        hintsBalance,
        freeHintsLeft: Math.max(0, 2 - dailyFreeHintsUsed),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error updating hints:', error);
    return NextResponse.json(
      { error: 'Failed to update hints' },
      { status: 500 }
    );
  }
}
