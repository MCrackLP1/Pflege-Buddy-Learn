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
 * Updates user streak based on activity
 * Call this when user logs in or completes questions
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

  let currentStreak = progress?.streak_days || 0;
  let longestStreak = progress?.longest_streak || 0;
  let currentStreakStart = progress?.current_streak_start;
  const lastMilestoneAchieved = progress?.last_milestone_achieved || 0;

  // Check if user was active yesterday or today
  const { data: recentActivity } = await supabase
    .from('attempts')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', yesterday + ' 00:00:00')
    .limit(1);

  const hasRecentActivity = recentActivity && recentActivity.length > 0;
  const lastSeen = progress?.last_seen;

  // Calculate new streak
  if (!hasRecentActivity) {
    // No recent activity - reset streak if it's been more than 1 day
    if (lastSeen && lastSeen < yesterday) {
      currentStreak = 0;
      currentStreakStart = null;
    }
  } else {
    // Has recent activity - update streak
    if (!lastSeen || lastSeen < today) {
      // First activity today - increment streak
      currentStreak += 1;
      if (!currentStreakStart) {
        currentStreakStart = today;
      }
      longestStreak = Math.max(longestStreak, currentStreak);
    }
  }

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
        if (milestone.xp_boost_multiplier > (savedProgress.xp_boost_multiplier || 1)) {
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
    xpBoostMultiplier: savedProgress.xp_boost_multiplier || 1,
    xpBoostExpiry: savedProgress.xp_boost_expiry ? new Date(savedProgress.xp_boost_expiry) : undefined,
  };
}

/**
 * Get next milestone for user
 */
export async function getNextMilestone(userId: string): Promise<StreakMilestone | null> {
  const supabase = createServerClient();

  const { data: progress } = await supabase
    .from('user_progress')
    .select('streak_days')
    .eq('user_id', userId)
    .single();

  if (!progress) return null;

  const { data: milestones } = await supabase
    .from('streak_milestones')
    .select('*')
    .eq('is_active', true)
    .gt('days_required', progress.streak_days)
    .order('days_required')
    .limit(1);

  return milestones?.[0] || null;
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
    multiplier: progress.xp_boost_multiplier || 1,
    expiry: progress.xp_boost_expiry ? new Date(progress.xp_boost_expiry) : undefined,
    isActive: isActive || false,
  };
}

/**
 * Calculate XP with boost applied
 */
export function calculateXPWithBoost(baseXP: number, boostMultiplier: number): number {
  return Math.floor(baseXP * boostMultiplier);
}
