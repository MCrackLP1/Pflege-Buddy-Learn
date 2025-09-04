import { createServerClient } from '../src/lib/supabase/server';

/**
 * Test-Script für das neue Streak-Milestone-System
 * Dieses Script demonstriert, wie das System funktioniert
 */
export async function testStreakSystem() {
  try {
    console.log('🧪 Teste Streak-Milestone-System...\n');

    const supabase = createServerClient();

    // 1. Zeige alle verfügbaren Milestones
    console.log('📋 Verfügbare Milestones:');
    const { data: milestones } = await supabase
      .from('streak_milestones')
      .select('*')
      .eq('is_active', true)
      .order('days_required');

    milestones?.forEach(milestone => {
      console.log(`  ${milestone.days_required} Tage: ${milestone.xp_boost_multiplier}x XP für ${milestone.boost_duration_hours}h`);
      console.log(`    ${milestone.reward_description}\n`);
    });

    // 2. Zeige User-Progress
    console.log('👤 User Progress:');
    const { data: userProgress } = await supabase
      .from('user_progress')
      .select('*')
      .limit(1);

    if (userProgress && userProgress.length > 0) {
      const progress = userProgress[0];
      console.log(`  Aktuelle Serie: ${progress.streak_days} Tage`);
      console.log(`  Längste Serie: ${progress.longest_streak} Tage`);
      console.log(`  XP-Boost: ${progress.xp_boost_multiplier}x`);
      console.log(`  Boost aktiv bis: ${progress.xp_boost_expiry || 'Nicht aktiv'}`);
      console.log(`  Letzter Milestone: ${progress.last_milestone_achieved} Tage\n`);
    }

    // 3. Teste Milestone-Logic
    if (userProgress && userProgress.length > 0) {
      const progress = userProgress[0];
      const nextMilestones = milestones?.filter(m =>
        m.days_required > progress.last_milestone_achieved &&
        m.days_required > progress.streak_days
      );

      if (nextMilestones && nextMilestones.length > 0) {
        console.log('🎯 Nächster Milestone:');
        const next = nextMilestones[0];
        console.log(`  ${next.days_required} Tage - noch ${next.days_required - progress.streak_days} Tage übrig`);
        console.log(`  Belohnung: ${next.reward_description}\n`);
      } else {
        console.log('🏆 Alle Milestones erreicht!\n');
      }
    }

    // 4. Zeige Milestone-Achievements
    console.log('🏅 Erreichte Milestones:');
    const { data: achievements } = await supabase
      .from('user_milestone_achievements')
      .select(`
        *,
        milestone:streak_milestones(*)
      `)
      .limit(5);

    if (achievements && achievements.length > 0) {
      achievements.forEach(achievement => {
        console.log(`  ${achievement.milestone.days_required} Tage: ${achievement.milestone.reward_description}`);
        console.log(`    Erreicht: ${new Date(achievement.achieved_at).toLocaleDateString('de-DE')}`);
        console.log(`    Boost gültig bis: ${new Date(achievement.boost_expiry).toLocaleDateString('de-DE')}\n`);
      });
    } else {
      console.log('  Noch keine Milestones erreicht\n');
    }

    console.log('✅ Streak-Milestone-System Test abgeschlossen!');

  } catch (error) {
    console.error('❌ Fehler beim Testen des Systems:', error);
  }
}

// Für direkten Aufruf
if (require.main === module) {
  testStreakSystem();
}
