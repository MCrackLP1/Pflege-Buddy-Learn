import { createServerClient } from '../src/lib/supabase/server';
import { updateUserStreakFromDailyQuest, getNextMilestone, getActiveXPBoost, checkAndResetExpiredStreak } from '../src/lib/streak-utils';

async function debugStreak(userId: string) {
  const supabase = createServerClient();

  console.log('🔍 Debugging streak for user:', userId);
  console.log('');

  try {
    // 1. Check current user progress
    console.log('1️⃣ Current user progress:');
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (progressError && progressError.code !== 'PGRST116') {
      console.error('❌ Error fetching progress:', progressError);
    } else {
      console.log('Progress record:', progress);
    }
    console.log('');

    // 2. Check today's attempts
    console.log('2️⃣ Today\'s attempts:');
    const today = new Date().toISOString().split('T')[0];
    const { data: todayAttempts } = await supabase
      .from('attempts')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', today + ' 00:00:00')
      .lt('created_at', today + ' 23:59:59');

    console.log('Today attempts:', todayAttempts?.length || 0);
    console.log('');

    // 3. Check available milestones
    console.log('3️⃣ Available milestones:');
    const { data: milestones } = await supabase
      .from('streak_milestones')
      .select('*')
      .eq('is_active', true)
      .order('days_required');

    console.log('Milestones:', milestones);
    console.log('');

    // 4. Get next milestone
    console.log('4️⃣ Next milestone:');
    const nextMilestone = await getNextMilestone(userId);
    console.log('Next milestone:', nextMilestone);
    console.log('');

    // 5. Get XP boost info
    console.log('5️⃣ XP boost info:');
    const xpBoostInfo = await getActiveXPBoost(userId);
    console.log('XP boost info:', xpBoostInfo);
    console.log('');

    // 6. Update streak
    console.log('6️⃣ Updating streak:');
    // Check for expired streaks first
    const wasReset = await checkAndResetExpiredStreak(userId);
    console.log('🔥 Streak reset check:', wasReset ? 'RESET' : 'VALID');
    
    // Note: updateUserStreakFromDailyQuest requires daily quest to be completed
    // This is just for debugging - in real app it's called when daily quest completes
    console.log('⚠️  updateUserStreakFromDailyQuest requires daily quest completion');
    
    // Get current progress after reset check
    const { data: finalProgress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    console.log('Final progress:', {
      currentStreak: finalProgress?.streak_days || 0,
      longestStreak: finalProgress?.longest_streak || 0,
      lastSeen: finalProgress?.last_seen,
      dailyQuestProgress: finalProgress?.daily_quest_progress || 0,
      dailyQuestCompleted: finalProgress?.daily_quest_completed || false,
      xpBoostMultiplier: finalProgress?.xp_boost_multiplier || '1.00',
    });

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// If run directly, use a test user ID
if (require.main === module) {
  const userId = process.argv[2] || 'test-user-id';
  debugStreak(userId)
    .then(() => console.log('\n✅ Debug completed'))
    .catch((error) => console.error('\n❌ Debug failed:', error));
}

export { debugStreak };
