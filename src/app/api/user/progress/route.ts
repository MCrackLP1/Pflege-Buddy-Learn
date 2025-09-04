import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { ApiResponse, UserProgressData } from '@/types/api.types';

export async function GET(): Promise<NextResponse<ApiResponse<{ user_progress: UserProgressData }>>> {
  try {
    // Get user from auth
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create user progress
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (progressError && progressError.code === 'PGRST116') {
      // User progress doesn't exist, create it
      const { data: newProgress, error: createError } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          xp: 0,
          streak_days: 0,
          last_seen: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();
        
      if (createError) throw createError;
      progress = newProgress;
    } else if (progressError) {
      throw progressError;
    }

    // Get user statistics from attempts
    const { data: attemptStats, error: attemptsError } = await supabase
      .from('attempts')
      .select('is_correct, created_at')
      .eq('user_id', user.id);

    if (attemptsError) throw attemptsError;

    const totalAttempts = attemptStats?.length || 0;
    const correctAttempts = attemptStats?.filter(a => a.is_correct).length || 0;
    const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    // Calculate today's progress (attempts made today)
    const today = new Date().toISOString().split('T')[0];
    const todayAttempts = attemptStats?.filter(a => 
      a.created_at.startsWith(today)
    ).length || 0;

    // Get topic progress (remove unused for now)
    // const { data: topicStats } = await supabase
    //   .rpc('get_topic_progress', { p_user_id: user.id });

    return NextResponse.json({
      user_progress: {
        xp: progress?.xp || 0,
        streak_days: progress?.streak_days || 0,
        last_seen: progress?.last_seen || today,
        total_questions: totalAttempts,
        correct_answers: correctAttempts,
        accuracy: accuracy,
        today_attempts: todayAttempts,
      },
      topic_progress: topicStats || [],
      success: true
    });

  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch progress' 
    }, { status: 500 });
  }
}
