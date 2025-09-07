import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = createServerClient();

    // Get the milestone data from request
    const milestoneData = await request.json();

    console.log('🌱 Seeding milestone:', milestoneData);

    // Check if milestone already exists
    const { data: existing } = await supabase
      .from('streak_milestones')
      .select('id')
      .eq('days_required', milestoneData.days_required)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log('⚠️  Milestone already exists, skipping');
      return NextResponse.json({
        success: false,
        message: 'Milestone already exists',
        existing: true
      });
    }

    // Insert the milestone
    const { data, error } = await supabase
      .from('streak_milestones')
      .insert({
        days_required: milestoneData.days_required,
        xp_boost_multiplier: milestoneData.xp_boost_multiplier,
        boost_duration_hours: milestoneData.boost_duration_hours,
        reward_description: milestoneData.reward_description,
        is_active: milestoneData.is_active,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error seeding milestone:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log('✅ Successfully seeded milestone:', data);
    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('❌ Seed milestone API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
