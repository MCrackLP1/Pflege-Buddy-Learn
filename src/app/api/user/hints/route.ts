import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's wallet data - simplified to just hints_balance
    const { data: wallet } = await supabase
      .from('user_wallet')
      .select('hints_balance')
      .eq('user_id', user.id)
      .single();

    if (!wallet) {
      // Create wallet if it doesn't exist - start with 5 free hints
      const { data: newWallet } = await supabase
        .from('user_wallet')
        .insert({
          user_id: user.id,
          hints_balance: 5, // Everyone starts with 5 free hints
          daily_free_hints_used: 0,
          daily_reset_date: new Date().toISOString().split('T')[0]
        })
        .select('hints_balance')
        .single();

      return NextResponse.json({
        success: true,
        hintsBalance: newWallet?.hints_balance || 5,
      });
    }

    return NextResponse.json({
      success: true,  
      hintsBalance: wallet.hints_balance,
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
