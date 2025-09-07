/**
 * Script to seed milestones directly via API
 * This can be run in production when database migrations can't be executed locally
 */

const MILESTONES_TO_SEED = [
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
    boost_duration_hours: 168,
    reward_description: '30 Tage Serie! Du bist ein Lern-Champion. Dreifacher XP-Boost für eine Woche!',
    is_active: true,
  },
  {
    days_required: 50,
    xp_boost_multiplier: '3.00',
    boost_duration_hours: 336,
    reward_description: '50 Tage Serie! Außerordentliche Disziplin. Dreifacher XP-Boost für zwei Wochen!',
    is_active: true,
  },
  {
    days_required: 100,
    xp_boost_multiplier: '5.00',
    boost_duration_hours: 168,
    reward_description: '100 Tage Serie! Du bist ein Pflege-Lern-Legende! Fünffacher XP-Boost für eine Woche!',
    is_active: true,
  },
];

async function seedMilestones() {
  console.log('🌱 Starting milestone seeding via API...');

  for (const milestone of MILESTONES_TO_SEED) {
    try {
      console.log(`📝 Seeding milestone: ${milestone.days_required} days`);

      const response = await fetch('/api/admin/seed-milestone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(milestone),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log(`✅ Successfully seeded ${milestone.days_required} day milestone`);
      } else {
        console.log(`⚠️  Milestone ${milestone.days_required} days may already exist or failed:`, result);
      }
    } catch (error) {
      console.error(`❌ Failed to seed ${milestone.days_required} day milestone:`, error);
    }
  }

  console.log('🎉 Milestone seeding completed!');
}

// Only run if called directly or if we're in a browser environment
if (typeof window !== 'undefined') {
  // Browser environment - can be called from console
  window.seedMilestones = seedMilestones;
  console.log('💡 Milestone seeder loaded! Run seedMilestones() in console to seed data.');
} else {
  // Node.js environment
  seedMilestones();
}
