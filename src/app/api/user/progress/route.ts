import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { updateUserStreak, getNextMilestone, getActiveXPBoost } from '@/lib/streak-utils';
import { updateXpMilestones, getNextXpMilestone } from '@/lib/xp-utils';
import type { ApiResponse, UserProgressData } from '@/types/api.types';
import type { StreakMilestone } from '@/lib/db/schema';

export async function GET(): Promise<NextResponse<ApiResponse<{
  user_progress: UserProgressData & {
    longest_streak: number;
    current_streak_start?: string;
    xp_boost_active: boolean;
    xp_boost_multiplier: number;
    xp_boost_expiry?: string;
    next_streak_milestone?: StreakMilestone;
    next_xp_milestone?: any;
  }
}>>> {
  try {
    // Get user from auth
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Update user streak (this will create progress record if it doesn't exist)
    const streakResult = await updateUserStreak(user.id);

    // Get user statistics from attempts
    const { data: attemptStats, error: attemptsError } = await supabase
      .from('attempts')
      .select('is_correct, created_at')
      .eq('user_id', user.id);

    if (attemptsError) throw attemptsError;

    const totalAttempts = attemptStats?.length || 0;
    const correctAttempts = attemptStats?.filter(a => a.is_correct).length || 0;
    const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    // Calculate today's progress (attempts made today)
    const today = new Date().toISOString().split('T')[0];
    const todayAttempts = attemptStats?.filter(a =>
      a.created_at.startsWith(today)
    ).length || 0;

    // Get next milestones
    const nextStreakMilestone = await getNextMilestone(user.id);
    const nextXpMilestone = await getNextXpMilestone(user.id);

    // Get active XP boost info
    const xpBoostInfo = await getActiveXPBoost(user.id);

    return NextResponse.json({
      user_progress: {
        xp: streakResult.updatedProgress.xp,
        streak_days: (streakResult.updatedProgress as any).streak_days || 0,
        longest_streak: (streakResult.updatedProgress as any).longest_streak || 0,
        last_seen: (streakResult.updatedProgress as any).last_seen || today,
        current_streak_start: (streakResult.updatedProgress as any).current_streak_start || undefined,
        total_questions: totalAttempts,
        correct_answers: correctAttempts,
        accuracy: accuracy,
        today_attempts: todayAttempts,
        xp_boost_active: xpBoostInfo.isActive,
        xp_boost_multiplier: xpBoostInfo.multiplier,
        xp_boost_expiry: xpBoostInfo.expiry?.toISOString(),
        next_streak_milestone: nextStreakMilestone || undefined,
        next_xp_milestone: nextXpMilestone || undefined,
      },
      topic_progress: [],
      success: true
    });

  } catch (error) {
    console.error('Error fetching user progress:', error);
        return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch progress'
    }, { status: 500 });
  }
}
