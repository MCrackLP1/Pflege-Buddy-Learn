import { createServerClient } from '../src/lib/supabase/server';
import { updateUserStreak, getNextMilestone, getActiveXPBoost } from '../src/lib/streak-utils';

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
    const streakResult = await updateUserStreak(userId);
    console.log('Streak result:', {
      currentStreak: streakResult.updatedProgress.streakDays,
      longestStreak: streakResult.updatedProgress.longestStreak,
      lastSeen: streakResult.updatedProgress.lastSeen,
      xpBoostActive: streakResult.xpBoostActive,
      xpBoostMultiplier: streakResult.xpBoostMultiplier,
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
