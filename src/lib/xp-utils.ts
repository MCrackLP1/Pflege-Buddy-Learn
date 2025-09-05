import { createServerClient } from './supabase/server';
import type { UserProgress, XpMilestone, UserMilestoneAchievement } from './db/schema';

export interface XpMilestoneResult {
  updatedProgress: UserProgress;
  milestonesAchieved: XpMilestone[];
}

/**
 * Updates XP milestones and awards free hints when XP thresholds are reached
 * Call this when user gains XP
 */
export async function updateXpMilestones(userId: string, currentXp: number): Promise<XpMilestoneResult> {
  const supabase = createServerClient();

  // Get available XP milestones
  const { data: milestones } = await supabase
    .from('xp_milestones')
    .select('*')
    .eq('is_active', true)
    .order('xp_required');

  // Get user's last achieved XP milestone
  const { data: lastAchievement } = await supabase
    .from('user_milestone_achievements')
    .select('milestone_id')
    .eq('user_id', userId)
    .eq('milestone_type', 'xp')
    .order('achieved_at', { ascending: false })
    .limit(1);

  const lastMilestoneId = lastAchievement?.[0]?.milestone_id;

  // Find the last achieved milestone XP threshold
  let lastMilestoneXp = 0;
  if (lastMilestoneId) {
    const { data: lastMilestone } = await supabase
      .from('xp_milestones')
      .select('xp_required')
      .eq('id', lastMilestoneId)
      .single();

    lastMilestoneXp = lastMilestone?.xp_required || 0;
  }

  // Check for new milestones achieved
  const newMilestones = milestones?.filter(
    milestone => milestone.xp_required > lastMilestoneXp && currentXp >= milestone.xp_required
  ) || [];

  // Process new milestones
  const milestonesAchieved: XpMilestone[] = [];
  for (const milestone of newMilestones) {
    // Check if already achieved
    const { data: existing } = await supabase
      .from('user_milestone_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('milestone_id', milestone.id)
      .eq('milestone_type', 'xp')
      .limit(1);

    if (!existing || existing.length === 0) {
      // Award free hints
      const { data: wallet } = await supabase
        .from('user_wallet')
        .select('hints_balance')
        .eq('user_id', userId)
        .single();

      const currentHintsBalance = wallet?.hints_balance || 0;
      const newHintsBalance = currentHintsBalance + milestone.free_hints_reward;

      // Update hints balance
      await supabase
        .from('user_wallet')
        .upsert({
          user_id: userId,
          hints_balance: newHintsBalance,
        });

      // Create achievement record
      await supabase
        .from('user_milestone_achievements')
        .insert({
          user_id: userId,
          milestone_id: milestone.id,
          milestone_type: 'xp',
          free_hints_reward: milestone.free_hints_reward,
        });

      milestonesAchieved.push(milestone);
    }
  }

  // Get updated progress (XP might have changed)
  const { data: updatedProgress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  return {
    updatedProgress: updatedProgress || {
      user_id: userId,
      xp: currentXp,
      streak_days: 0,
      longest_streak: 0,
      last_seen: new Date().toISOString().split('T')[0],
    },
    milestonesAchieved,
  };
}

/**
 * Get next XP milestone for user
 */
export async function getNextXpMilestone(userId: string): Promise<XpMilestone | null> {
  const supabase = createServerClient();

  console.log('🔍 Getting next XP milestone for user:', userId);

  const { data: progress, error: progressError } = await supabase
    .from('user_progress')
    .select('xp')
    .eq('user_id', userId)
    .single();

  if (progressError) {
    console.log('❌ Error getting user progress:', progressError);
    return null;
  }

  if (!progress) {
    console.log('❌ No user progress found');
    return null;
  }

  console.log('📊 User XP:', progress.xp);

  const { data: milestones, error: milestonesError } = await supabase
    .from('xp_milestones')
    .select('*')
    .eq('is_active', true)
    .gt('xp_required', progress.xp)
    .order('xp_required')
    .limit(1);

  if (milestonesError) {
    console.log('❌ Error getting XP milestones:', milestonesError);
    return null;
  }

  console.log('🎯 Found milestones:', milestones?.length || 0, milestones?.[0]);

  return milestones?.[0] || null;
}

/**
 * Get last achieved XP milestone for user
 */
export async function getLastAchievedXpMilestone(userId: string): Promise<XpMilestone | null> {
  const supabase = createServerClient();

  // First get the milestone ID from achievements
  const { data: lastAchievement } = await supabase
    .from('user_milestone_achievements')
    .select('milestone_id')
    .eq('user_id', userId)
    .eq('milestone_type', 'xp')
    .order('achieved_at', { ascending: false })
    .limit(1);

  if (!lastAchievement || lastAchievement.length === 0) {
    return null;
  }

  // Then get the milestone data
  const { data: milestone } = await supabase
    .from('xp_milestones')
    .select('*')
    .eq('id', lastAchievement[0].milestone_id)
    .single();

  return milestone || null;
}
