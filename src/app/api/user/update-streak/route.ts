import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { updateUserStreak } from '@/lib/streak-utils';

export async function POST(): Promise<NextResponse> {
  try {
    // Get user from auth
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Update user streak
    const result = await updateUserStreak(user.id);

    return NextResponse.json({
      success: true,
      data: {
        currentStreak: result.updatedProgress.streak_days,
        longestStreak: result.updatedProgress.longest_streak,
        xpBoostActive: result.xpBoostActive,
        xpBoostMultiplier: result.xpBoostMultiplier,
      }
    });

  } catch (error) {
    console.error('Error updating streak:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update streak'
    }, { status: 500 });
  }
}
