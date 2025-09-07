import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { updateUserStreak, getNextMilestone, getActiveXPBoost } from '@/lib/streak-utils';
import { getNextXpMilestone, getLastAchievedXpMilestone } from '@/lib/xp-utils';
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
        last_xp_milestone?: any;
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

    // Update streak before returning progress
    console.log('🔥 Updating streak in progress API...');
    const streakResult = await updateUserStreak(user.id);
    console.log('✅ Streak updated:', {
      currentStreak: streakResult.updatedProgress.streakDays,
      longestStreak: streakResult.updatedProgress.longestStreak
    });

    // Get next milestones (not used anymore, client-side logic)
    const nextXpMilestone = await getNextXpMilestone(user.id);
    const lastXpMilestone = await getLastAchievedXpMilestone(user.id);

    // Client-side milestones now
    const nextStreakMilestone = null;

    // Get active XP boost info
    const xpBoostInfo = await getActiveXPBoost(user.id);

    return NextResponse.json({
      user_progress: {
        xp: streakResult.updatedProgress.xp,
        streak_days: streakResult.updatedProgress.streakDays,
        longest_streak: streakResult.updatedProgress.longestStreak,
        last_seen: streakResult.updatedProgress.lastSeen || today,
        current_streak_start: streakResult.updatedProgress.currentStreakStart,
        total_questions: totalAttempts,
        correct_answers: correctAttempts,
        accuracy: accuracy,
        today_attempts: todayAttempts,
        xp_boost_active: xpBoostInfo.isActive,
        xp_boost_multiplier: xpBoostInfo.multiplier,
        xp_boost_expiry: xpBoostInfo.expiry?.toISOString(),
        next_streak_milestone: nextStreakMilestone,
        next_xp_milestone: nextXpMilestone || undefined,
        last_xp_milestone: lastXpMilestone || undefined,
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
