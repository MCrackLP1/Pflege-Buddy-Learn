import { createServerClient } from '../src/lib/supabase/server';
import type { Database } from '../src/types/database.types';

type StreakMilestoneInsert = Database['public']['Tables']['streak_milestones']['Insert'];

const DEFAULT_MILESTONES: Omit<StreakMilestoneInsert, 'id' | 'created_at'>[] = [
  {
    days_required: 3,
    xp_boost_multiplier: '1.00',
    boost_duration_hours: 24,
    reward_description: '3 Tage Serie erreicht! Du erhältst einen kleinen XP-Boost.',
    is_active: true,
  },
  {
    days_required: 5,
    xp_boost_multiplier: '1.30',
    boost_duration_hours: 24,
    reward_description: '5 Tage hintereinander! Du bekommst 30% mehr XP für einen Tag.',
    is_active: true,
  },
  {
    days_required: 7,
    xp_boost_multiplier: '1.50',
    boost_duration_hours: 48,
    reward_description: 'Eine Woche durchgehalten! Du bekommst 50% mehr XP für zwei Tage.',
    is_active: true,
  },
  {
    days_required: 14,
    xp_boost_multiplier: '2.00',
    boost_duration_hours: 72,
    reward_description: 'Zwei Wochen am Stück! Dein Lernengagement zahlt sich aus mit 2x XP.',
    is_active: true,
  },
  {
    days_required: 30,
    xp_boost_multiplier: '3.00',
    boost_duration_hours: 168, // 7 Tage
    reward_description: '30 Tage Serie! Du bist ein Lern-Champion. Dreifacher XP-Boost für eine Woche!',
    is_active: true,
  },
  {
    days_required: 50,
    xp_boost_multiplier: '3.00',
    boost_duration_hours: 336, // 14 Tage
    reward_description: '50 Tage Serie! Außerordentliche Disziplin. Dreifacher XP-Boost für zwei Wochen!',
    is_active: true,
  },
  {
    days_required: 100,
    xp_boost_multiplier: '5.00',
    boost_duration_hours: 168, // 7 Tage
    reward_description: '100 Tage Serie! Du bist ein Pflege-Lern-Legende! Fünffacher XP-Boost für eine Woche!',
    is_active: true,
  },
];

export async function seedStreakMilestones() {
  try {
    console.log('🌱 Seeding streak milestones...');

    const supabase = createServerClient();

    // Check if milestones already exist
    const { data: existingMilestones } = await supabase
      .from('streak_milestones')
      .select('days_required')
      .limit(1);

    if (existingMilestones && existingMilestones.length > 0) {
      console.log('✅ Streak milestones already exist, skipping seed...');
      return;
    }

    // Insert default milestones
    const { data, error } = await supabase
      .from('streak_milestones')
      .insert(DEFAULT_MILESTONES)
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ Successfully seeded ${data?.length || 0} streak milestones`);
    return data;
  } catch (error) {
    console.error('❌ Error seeding streak milestones:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedStreakMilestones()
    .then(() => {
      console.log('🎉 Streak milestones seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Streak milestones seeding failed:', error);
      process.exit(1);
    });
}
