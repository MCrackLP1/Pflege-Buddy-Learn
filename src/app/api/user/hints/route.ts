import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's wallet data with daily reset tracking
    const { data: wallet } = await supabase
      .from('user_wallet')
      .select('hints_balance, daily_reset_date')
      .eq('user_id', user.id)
      .single();

    if (!wallet) {
      // Create wallet if it doesn't exist - start with 7 hints (5 initial + 2 daily)
      const today = new Date().toISOString().split('T')[0];
      const { data: newWallet } = await supabase
        .from('user_wallet')
        .insert({
          user_id: user.id,
          hints_balance: 7, // 5 initial + 2 daily
          daily_free_hints_used: 0,
          daily_reset_date: today
        })
        .select('hints_balance')
        .single();

      return NextResponse.json({
        success: true,
        hintsBalance: newWallet?.hints_balance || 7,
      });
    }

    // Check if we need to add daily hints (2 per day)
    const today = new Date().toISOString().split('T')[0];
    const lastReset = wallet.daily_reset_date || today;

    let currentBalance = wallet.hints_balance;

    if (today > lastReset) {
      // Add 2 daily hints
      currentBalance += 2;
      
      await supabase
        .from('user_wallet')
        .update({
          hints_balance: currentBalance,
          daily_reset_date: today
        })
        .eq('user_id', user.id);
        
      console.log(`💎 Added 2 daily hints to user. New balance: ${currentBalance}`);
    }

    return NextResponse.json({
      success: true,  
      hintsBalance: currentBalance,
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
        .select('hints_balance')
        .eq('user_id', user.id)
        .single();

      if (!wallet) {
        return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
      }

      // Simple check: do we have hints?
      if (wallet.hints_balance <= 0) {
        return NextResponse.json({
          error: 'No hints available',
          hintsBalance: 0,
        }, { status: 400 });
      }

      // Use one hint
      const newBalance = wallet.hints_balance - 1;

      // Update wallet
      await supabase
        .from('user_wallet')
        .update({
          hints_balance: newBalance,
        })
        .eq('user_id', user.id);

      return NextResponse.json({
        success: true,
        hintsBalance: newBalance,
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
