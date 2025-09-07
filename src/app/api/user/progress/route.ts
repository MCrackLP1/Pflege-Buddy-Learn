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

    // Get next milestones
    const nextStreakMilestoneRaw = await getNextMilestone(user.id);
    const nextXpMilestone = await getNextXpMilestone(user.id);
    const lastXpMilestone = await getLastAchievedXpMilestone(user.id);

    console.log('🔍 API: getNextMilestone result:', nextStreakMilestoneRaw);

    // Convert snake_case to camelCase for frontend
    // getNextMilestone should never return null after our fixes, but handle it just in case
    const nextStreakMilestone = nextStreakMilestoneRaw ? {
      id: nextStreakMilestoneRaw.id,
      daysRequired: nextStreakMilestoneRaw.daysRequired,
      xpBoostMultiplier: nextStreakMilestoneRaw.xpBoostMultiplier,
      boostDurationHours: nextStreakMilestoneRaw.boostDurationHours,
      rewardDescription: nextStreakMilestoneRaw.rewardDescription,
      isActive: nextStreakMilestoneRaw.isActive,
      createdAt: nextStreakMilestoneRaw.createdAt,
    } : {
      id: 'api-fallback',
      daysRequired: 3,
      xpBoostMultiplier: '1.00',
      boostDurationHours: 24,
      rewardDescription: 'API-Fehler: Verwende Standard-Milestone.',
      isActive: true,
      createdAt: new Date(),
    };

    console.log('🔍 API: converted milestone:', nextStreakMilestone);

    // Get active XP boost info
    const xpBoostInfo = await getActiveXPBoost(user.id);

    return NextResponse.json({
      user_progress: {
        xp: streakResult.updatedProgress.xp,
        streak_days: streakResult.updatedProgress.streakDays || 0,
        longest_streak: streakResult.updatedProgress.longestStreak || 0,
        last_seen: streakResult.updatedProgress.lastSeen || today,
        current_streak_start: streakResult.updatedProgress.currentStreakStart || undefined,
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
