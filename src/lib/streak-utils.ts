import { createServerClient } from './supabase/server';
import type { UserProgress, StreakMilestone } from './db/schema';

export interface StreakUpdateResult {
  updatedProgress: UserProgress;
  milestonesAchieved: StreakMilestone[];
  xpBoostActive: boolean;
  xpBoostMultiplier: number;
  xpBoostExpiry?: Date;
}

/**
 * Updates user streak based on login activity (not quiz attempts)
 * Call this when user logs in or becomes active
 */
export async function updateUserStreak(userId: string): Promise<StreakUpdateResult> {
  const supabase = createServerClient();

  // Get current progress
  const { data: progress, error: progressError } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (progressError && progressError.code !== 'PGRST116') {
    throw progressError;
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const lastSeen = progress?.last_seen;

  let currentStreak = progress?.streak_days || 0;
  let longestStreak = progress?.longest_streak || 0;
  let currentStreakStart = progress?.current_streak_start;
  const lastMilestoneAchieved = progress?.last_milestone_achieved || 0;

  console.log('🔥 Debug updateUserStreak:', {
    userId,
    today,
    yesterday,
    lastSeen,
    currentStreakBefore: currentStreak,
    hasProgress: !!progress,
    progressError: progressError?.message
  });

  // Calculate new streak based on login activity
  if (lastSeen === today) {
    console.log('📅 Same day login - no streak increment');
  } else if (lastSeen === yesterday) {
    console.log('📅 Consecutive day login - incrementing streak');
    currentStreak += 1;
    longestStreak = Math.max(longestStreak, currentStreak);
  } else if (!lastSeen || lastSeen < yesterday) {
    console.log('📅 New streak started - first login or gap detected');
    currentStreak = 1;
    currentStreakStart = today;
    longestStreak = Math.max(longestStreak, currentStreak);
  } else {
    console.log('📅 Edge case - resetting streak');
    currentStreak = 1;
    currentStreakStart = today;
    longestStreak = Math.max(longestStreak, currentStreak);
  }

  console.log('✅ Streak calculation result:', {
    currentStreak,
    longestStreak,
    lastSeen: today
  });


  // Get available milestones
  const { data: milestones } = await supabase
    .from('streak_milestones')
    .select('*')
    .eq('is_active', true)
    .order('days_required');

  // Check for new milestones achieved
  const newMilestones = milestones?.filter(
    milestone => milestone.days_required > lastMilestoneAchieved && currentStreak >= milestone.days_required
  ) || [];

  // Update progress record
  const updatedProgress = {
    user_id: userId,
    xp: progress?.xp || 0,
    streak_days: currentStreak,
    longest_streak: longestStreak,
    last_seen: today,
    current_streak_start: currentStreakStart,
    last_milestone_achieved: Math.max(lastMilestoneAchieved, ...newMilestones.map(m => m.days_required)),
    xp_boost_multiplier: progress?.xp_boost_multiplier || 1,
    xp_boost_expiry: progress?.xp_boost_expiry,
  };

  const { data: savedProgress, error: updateError } = await supabase
    .from('user_progress')
    .upsert(updatedProgress, { onConflict: 'user_id' })
    .select()
    .single();

  if (updateError) throw updateError;

  // Process new milestones
  const milestonesAchieved: StreakMilestone[] = [];
  for (const milestone of newMilestones) {
    // Check if already achieved
    const { data: existing } = await supabase
      .from('user_milestone_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('milestone_id', milestone.id)
      .limit(1);

    if (!existing || existing.length === 0) {
      // Create achievement record
      const boostExpiry = new Date(Date.now() + milestone.boost_duration_hours * 60 * 60 * 1000);

      const { error: achievementError } = await supabase
        .from('user_milestone_achievements')
        .insert({
          user_id: userId,
          milestone_id: milestone.id,
          xp_boost_multiplier: milestone.xp_boost_multiplier,
          boost_expiry: boostExpiry.toISOString(),
        });

      if (achievementError) {
        console.error('Error creating milestone achievement:', achievementError);
      } else {
        milestonesAchieved.push(milestone);

        // Update user's XP boost if this milestone has higher multiplier
        if (parseFloat(milestone.xp_boost_multiplier) > parseFloat(savedProgress.xp_boost_multiplier || '1.00')) {
          const { error: boostUpdateError } = await supabase
            .from('user_progress')
            .update({
              xp_boost_multiplier: milestone.xp_boost_multiplier,
              xp_boost_expiry: boostExpiry.toISOString(),
            })
            .eq('user_id', userId);

          if (boostUpdateError) {
            console.error('Error updating XP boost:', boostUpdateError);
          }
        }
      }
    }
  }

  // Check if XP boost is still active
  const now = new Date();
  const xpBoostActive = savedProgress.xp_boost_expiry && new Date(savedProgress.xp_boost_expiry) > now;

  return {
    updatedProgress: savedProgress,
    milestonesAchieved,
    xpBoostActive: xpBoostActive || false,
    xpBoostMultiplier: parseFloat(savedProgress.xp_boost_multiplier || '1.00'),
    xpBoostExpiry: savedProgress.xp_boost_expiry ? new Date(savedProgress.xp_boost_expiry) : undefined,
  };
}

/**
 * Get next milestone for user
 */
export async function getNextMilestone(userId: string): Promise<StreakMilestone | null> {
  const supabase = createServerClient();

  try {
    // Get user progress, default to 0 streak if no record exists
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('streak_days, last_seen')
      .eq('user_id', userId)
      .single();

    // If no progress record exists or error (user doesn't exist yet), treat as 0 streak days
    const streakDays = progress?.streak_days ?? 0;

    // Simplified: no more debug logging for getNextMilestone

    // Get next milestone greater than current streak
    const { data: milestones, error: milestonesError } = await supabase
      .from('streak_milestones')
      .select('*')
      .eq('is_active', true)
      .gt('days_required', streakDays)
      .order('days_required')
      .limit(1);

    // Simplified: using client-side milestones instead

    if (milestonesError) {
      console.error('Error fetching milestones:', milestonesError);
      throw milestonesError; // Will be caught by outer try-catch
    }

    // If no milestone found (user has reached all milestones), return the highest one
    if (!milestones || milestones.length === 0) {
      console.log('🔍 No next milestone found, checking for highest milestone');
      const { data: highestMilestone, error: highestError } = await supabase
        .from('streak_milestones')
        .select('*')
        .eq('is_active', true)
        .order('days_required', { ascending: false })
        .limit(1);

      // Using client-side logic instead

      // If still no milestones found or error, return a fallback milestone
      if (highestError || !highestMilestone || highestMilestone.length === 0) {
        console.log('🔍 No milestones in database or error, returning fallback');
        return {
          id: 'fallback-5-days',
          daysRequired: 5,
          xpBoostMultiplier: '1.30',
          boostDurationHours: 24,
          rewardDescription: '5 Tage hintereinander! Du bekommst 30% mehr XP für einen Tag.',
          isActive: true,
          createdAt: new Date(),
        } as StreakMilestone;
      }

      return highestMilestone[0];
    }

    console.log('🔍 Returning milestone:', milestones[0]);
    return milestones[0];

  } catch (error) {
    console.error('❌ getNextMilestone failed completely:', error);

    // Return a guaranteed fallback if everything fails
    console.log('🔍 Returning emergency fallback milestone');
    return {
      id: 'emergency-fallback',
      daysRequired: 3,
      xpBoostMultiplier: '1.00',
      boostDurationHours: 24,
      rewardDescription: 'Serie starten! Kleiner XP-Boost wartet auf dich.',
      isActive: true,
      createdAt: new Date(),
    } as StreakMilestone;
  }
}

/**
 * Get user's active XP boost info
 */
export async function getActiveXPBoost(userId: string): Promise<{
  multiplier: number;
  expiry?: Date;
  isActive: boolean;
}> {
  const supabase = createServerClient();

  const { data: progress } = await supabase
    .from('user_progress')
    .select('xp_boost_multiplier, xp_boost_expiry')
    .eq('user_id', userId)
    .single();

  if (!progress) {
    return { multiplier: 1, isActive: false };
  }

  const now = new Date();
  const isActive = progress.xp_boost_expiry && new Date(progress.xp_boost_expiry) > now;

  return {
    multiplier: parseFloat(progress.xp_boost_multiplier || '1.00'),
    expiry: progress.xp_boost_expiry ? new Date(progress.xp_boost_expiry) : undefined,
    isActive: isActive || false,
  };
}

/**
 * Calculate XP with boost applied
 */
export function calculateXPWithBoost(baseXP: number, boostMultiplier: number): number {
  // Ensure boostMultiplier is a number (handles both integer and decimal values)
  const multiplier = typeof boostMultiplier === 'string' ? parseFloat(boostMultiplier) : boostMultiplier;
  return Math.floor(baseXP * multiplier);
}
