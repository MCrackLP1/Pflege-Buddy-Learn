import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getActiveXPBoost } from '@/lib/streak-utils';
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
    next_xp_milestone?: { id: string; xpRequired: number; freeHintsReward: number; rewardDescription: string; isActive: boolean; createdAt: string };
    last_xp_milestone?: { id: string; xpRequired: number; freeHintsReward: number; rewardDescription: string; isActive: boolean; createdAt: string };
    // Daily Quest fields
    daily_quest_completed: boolean;
    daily_quest_date: string;
    daily_quest_progress: number;
  }
}>>> {
  try {
    // Get user from auth
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

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

    // Note: Streak management is now handled when users answer questions

    // Get updated user progress after streak check/reset
    const { data: userProgress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Use defaults if no progress record exists yet
    const currentProgress = userProgress || {
      xp: 0,
      streak_days: 0,
      longest_streak: 0,
      last_seen: today,
      current_streak_start: null,
      daily_quest_completed: false,
      daily_quest_date: null,
      daily_quest_progress: 0,
      xp_boost_multiplier: '1.00',
      xp_boost_expiry: null,
    };

    // Get next milestones (not used anymore, client-side logic)
    const nextXpMilestone = await getNextXpMilestone(user.id);
    const lastXpMilestone = await getLastAchievedXpMilestone(user.id);

    // Client-side milestones now
    const nextStreakMilestone = null;

    // Get active XP boost info
    const xpBoostInfo = await getActiveXPBoost(user.id);

    return NextResponse.json({
      user_progress: {
        xp: currentProgress.xp,
        streak_days: currentProgress.streak_days,
        longest_streak: currentProgress.longest_streak,
        last_seen: currentProgress.last_seen || today,
        current_streak_start: currentProgress.current_streak_start,
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
        // Daily Quest fields from database
        daily_quest_completed: currentProgress.daily_quest_completed || false,
        daily_quest_date: currentProgress.daily_quest_date || null,
        daily_quest_progress: currentProgress.daily_quest_progress || 0,
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
