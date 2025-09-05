import { createServerClient } from './supabase/server';
import type { UserProgress, XpMilestone } from './db/schema';

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

  const { data: progress, error: progressError } = await supabase
    .from('user_progress')
    .select('xp')
    .eq('user_id', userId)
    .single();

  if (progressError) {
    return null;
  }

  if (!progress) {
    return null;
  }

  const { data: milestones, error: milestonesError } = await supabase
    .from('xp_milestones')
    .select('*')
    .eq('is_active', true)
    .gt('xp_required', progress.xp)
    .order('xp_required')
    .limit(1);

  // Fallback to hardcoded milestones if database query fails or returns empty
  let nextMilestone = milestones?.[0] || null;

  if (!nextMilestone || milestonesError) {
    // Hardcoded XP milestones as fallback
    const fallbackMilestones = [
      { id: '1', xpRequired: 100, freeHintsReward: 5, rewardDescription: '100 XP erreicht! Du erhältst 5 gratis Hints für deine Lernfortschritte.', isActive: true, createdAt: new Date() },
      { id: '2', xpRequired: 500, freeHintsReward: 5, rewardDescription: '500 XP erreicht! Du erhältst 5 gratis Hints als Belohnung.', isActive: true, createdAt: new Date() },
      { id: '3', xpRequired: 1000, freeHintsReward: 5, rewardDescription: '1000 XP erreicht! Du erhältst 5 gratis Hints - du bist auf dem richtigen Weg!', isActive: true, createdAt: new Date() },
      { id: '4', xpRequired: 2500, freeHintsReward: 5, rewardDescription: '2500 XP erreicht! Du erhältst 5 gratis Hints für deine beeindruckenden Fortschritte.', isActive: true, createdAt: new Date() },
      { id: '5', xpRequired: 5000, freeHintsReward: 5, rewardDescription: '5000 XP erreicht! Du erhältst 5 gratis Hints - du bist ein Lern-Champion!', isActive: true, createdAt: new Date() },
    ];

    nextMilestone = fallbackMilestones.find(m => m.xpRequired > progress.xp) || null;
  }

  return nextMilestone;
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
  const { data: milestone, error: milestoneError } = await supabase
    .from('xp_milestones')
    .select('*')
    .eq('id', lastAchievement[0].milestone_id)
    .single();

  if (milestoneError || !milestone) {
    // Find the last achieved milestone based on user progress
    const { data: userProgress } = await supabase
      .from('user_progress')
      .select('xp')
      .eq('user_id', userId)
      .single();

    if (userProgress) {
      const fallbackMilestones = [
        { id: '1', xpRequired: 100, freeHintsReward: 5, rewardDescription: '100 XP erreicht! Du erhältst 5 gratis Hints für deine Lernfortschritte.', isActive: true, createdAt: new Date() },
        { id: '2', xpRequired: 500, freeHintsReward: 5, rewardDescription: '500 XP erreicht! Du erhältst 5 gratis Hints als Belohnung.', isActive: true, createdAt: new Date() },
        { id: '3', xpRequired: 1000, freeHintsReward: 5, rewardDescription: '1000 XP erreicht! Du erhältst 5 gratis Hints - du bist auf dem richtigen Weg!', isActive: true, createdAt: new Date() },
        { id: '4', xpRequired: 2500, freeHintsReward: 5, rewardDescription: '2500 XP erreicht! Du erhältst 5 gratis Hints für deine beeindruckenden Fortschritte.', isActive: true, createdAt: new Date() },
        { id: '5', xpRequired: 5000, freeHintsReward: 5, rewardDescription: '5000 XP erreicht! Du erhältst 5 gratis Hints - du bist ein Lern-Champion!', isActive: true, createdAt: new Date() },
      ];

      // Find the highest milestone that the user has achieved
      const lastAchieved = fallbackMilestones
        .filter(m => m.xpRequired <= userProgress.xp)
        .sort((a, b) => b.xpRequired - a.xpRequired)[0];

      return lastAchieved || null;
    }
  }

  return milestone || null;
}
