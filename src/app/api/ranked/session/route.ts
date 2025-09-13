import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types/api.types';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const supabase = createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    // End any active sessions for this user
    await supabase
      .from('ranked_sessions')
      .update({ is_active: false, ended_at: new Date() })
      .eq('user_id', user.id)
      .eq('is_active', true);

    // Get user's current global ranked score
    const { data: userProgress } = await supabase
      .from('user_progress')
      .select('ranked_score, ranked_questions_total, ranked_correct_total, ranked_sessions_played')
      .eq('user_id', user.id)
      .single();

    const currentScore = userProgress?.ranked_score || 0;

    // Create new session with current global score
    const { data: session, error: sessionError } = await supabase
      .from('ranked_sessions')
      .insert({
        user_id: user.id,
        is_active: true,
        total_score: currentScore, // Start with global score
      })
      .select()
      .single();

    if (sessionError) {
      throw sessionError;
    }

    return NextResponse.json({
      session,
      currentGlobalScore: currentScore,
      success: true
    });

  } catch (error) {
    console.error('Error creating ranked session:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create session',
        success: false
      },
      { status: 500 }
    );
  }
}

export async function GET(_req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const supabase = createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    // Get active session
    const { data: session, error: sessionError } = await supabase
      .from('ranked_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (sessionError && sessionError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw sessionError;
    }

    return NextResponse.json({
      session: session || null,
      success: true
    });

  } catch (error) {
    console.error('Error getting ranked session:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get session',
        success: false
      },
      { status: 500 }
    );
  }
}
