import { createServerClient } from '../src/lib/supabase/server';
import type { XpMilestone } from '../src/lib/db/schema';

const DEFAULT_XP_MILESTONES: Omit<XpMilestone, 'id' | 'createdAt'>[] = [
  {
    xpRequired: 100,
    freeHintsReward: 5,
    rewardDescription: '100 XP erreicht! Du erhältst 5 gratis Hints für deine Lernfortschritte.',
    isActive: true,
  },
  {
    xpRequired: 500,
    freeHintsReward: 5,
    rewardDescription: '500 XP erreicht! Du erhältst 5 gratis Hints als Belohnung.',
    isActive: true,
  },
  {
    xpRequired: 1000,
    freeHintsReward: 5,
    rewardDescription: '1000 XP erreicht! Du erhältst 5 gratis Hints - du bist auf dem richtigen Weg!',
    isActive: true,
  },
  {
    xpRequired: 2500,
    freeHintsReward: 5,
    rewardDescription: '2500 XP erreicht! Du erhältst 5 gratis Hints für deine beeindruckenden Fortschritte.',
    isActive: true,
  },
  {
    xpRequired: 5000,
    freeHintsReward: 5,
    rewardDescription: '5000 XP erreicht! Du erhältst 5 gratis Hints - du bist ein Lern-Champion!',
    isActive: true,
  },
  {
    xpRequired: 10000,
    freeHintsReward: 5,
    rewardDescription: '10000 XP erreicht! Du erhältst 5 gratis Hints - du bist ein Lern-Legende!',
    isActive: true,
  },
  {
    xpRequired: 20000,
    freeHintsReward: 5,
    rewardDescription: '20000 XP erreicht! Du erhältst 5 gratis Hints - außergewöhnliches Engagement!',
    isActive: true,
  },
  {
    xpRequired: 35000,
    freeHintsReward: 5,
    rewardDescription: '35000 XP erreicht! Du erhältst 5 gratis Hints - du bist ein Pflege-Experte!',
    isActive: true,
  },
  {
    xpRequired: 50000,
    freeHintsReward: 5,
    rewardDescription: '50000 XP erreicht! Du erhältst 5 gratis Hints - du bist ein Pflege-Meister!',
    isActive: true,
  },
  {
    xpRequired: 75000,
    freeHintsReward: 5,
    rewardDescription: '75000 XP erreicht! Du erhältst 5 gratis Hints - du bist ein Pflege-Großmeister!',
    isActive: true,
  },
  {
    xpRequired: 100000,
    freeHintsReward: 5,
    rewardDescription: '100000 XP erreicht! Du erhältst 5 gratis Hints - du bist eine Pflege-Legende! 🏆',
    isActive: true,
  },
];

export async function seedXpMilestones() {
  try {
    console.log('🌱 Seeding XP milestones...');

    const supabase = createServerClient();

    // Check if XP milestones already exist
    const { data: existingMilestones } = await supabase
      .from('xp_milestones')
      .select('xp_required')
      .limit(1);

    if (existingMilestones && existingMilestones.length > 0) {
      console.log('✅ XP milestones already exist, skipping seed...');
      return;
    }

    // Insert default XP milestones
    const { data, error } = await supabase
      .from('xp_milestones')
      .insert(DEFAULT_XP_MILESTONES)
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ Successfully seeded ${data?.length || 0} XP milestones`);
    return data;
  } catch (error) {
    console.error('❌ Error seeding XP milestones:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedXpMilestones()
    .then(() => {
      console.log('🎉 XP milestones seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 XP milestones seeding failed:', error);
      process.exit(1);
    });
}
