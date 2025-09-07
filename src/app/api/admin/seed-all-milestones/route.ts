import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

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

export async function POST(): Promise<NextResponse> {
  try {
    const supabase = createServerClient();
    const results = [];

    console.log('🌱 Starting bulk milestone seeding...');

    for (const milestone of MILESTONES_TO_SEED) {
      try {
        console.log(`📝 Seeding milestone: ${milestone.days_required} days`);

        // Check if milestone already exists
        const { data: existing } = await supabase
          .from('streak_milestones')
          .select('id')
          .eq('days_required', milestone.days_required)
          .limit(1);

        if (existing && existing.length > 0) {
          console.log(`⚠️  Milestone ${milestone.days_required} days already exists, skipping`);
          results.push({
            days_required: milestone.days_required,
            status: 'skipped',
            reason: 'already exists'
          });
          continue;
        }

        // Insert the milestone
        const { data, error } = await supabase
          .from('streak_milestones')
          .insert({
            days_required: milestone.days_required,
            xp_boost_multiplier: milestone.xp_boost_multiplier,
            boost_duration_hours: milestone.boost_duration_hours,
            reward_description: milestone.reward_description,
            is_active: milestone.is_active,
          })
          .select()
          .single();

        if (error) {
          console.error(`❌ Error seeding ${milestone.days_required} days:`, error);
          results.push({
            days_required: milestone.days_required,
            status: 'error',
            error: error.message
          });
        } else {
          console.log(`✅ Successfully seeded ${milestone.days_required} days`);
          results.push({
            days_required: milestone.days_required,
            status: 'success',
            data: data
          });
        }

      } catch (error) {
        console.error(`❌ Failed to seed ${milestone.days_required} days:`, error);
        results.push({
          days_required: milestone.days_required,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log(`🎉 Bulk seeding completed: ${successCount} success, ${skippedCount} skipped, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      results: results,
      summary: {
        total: results.length,
        success: successCount,
        skipped: skippedCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('❌ Bulk seed milestones API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
