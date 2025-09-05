import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types/api.types';

interface EndSessionRequest {
  sessionId: string;
}

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

    const body: EndSessionRequest = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required', success: false },
        { status: 400 }
      );
    }

    // Verify session belongs to user and is active
    const { data: session, error: sessionError } = await supabase
      .from('ranked_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid or inactive session', success: false },
        { status: 400 }
      );
    }

    // End the session
    const { data: updatedSession, error: updateError } = await supabase
      .from('ranked_sessions')
      .update({
        is_active: false,
        ended_at: new Date(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update global user progress with session results
    const { data: currentProgress } = await supabase
      .from('user_progress')
      .select('ranked_score, ranked_questions_total, ranked_correct_total, ranked_sessions_played')
      .eq('user_id', user.id)
      .single();

    // Calculate new global totals (session.total_score already includes previous score)
    const newGlobalScore = session.total_score; // Session already started with global score
    const newQuestionTotal = (currentProgress?.ranked_questions_total || 0) + session.questions_answered;
    const newCorrectTotal = (currentProgress?.ranked_correct_total || 0) + session.correct_answers;
    const newSessionsPlayed = (currentProgress?.ranked_sessions_played || 0) + 1;

    // Update user's global ranked progress
    await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        ranked_score: newGlobalScore,
        ranked_questions_total: newQuestionTotal,
        ranked_correct_total: newCorrectTotal,
        ranked_sessions_played: newSessionsPlayed,
      });

    // Calculate final stats
    const accuracy = session.questions_answered > 0
      ? Math.round((session.correct_answers / session.questions_answered) * 10000) / 100 // percentage with 2 decimal places
      : 0;

    const averageTimeMs = session.questions_answered > 0
      ? Math.round(session.total_time_ms / session.questions_answered)
      : 0;

    return NextResponse.json({
      session: updatedSession,
      stats: {
        totalScore: session.total_score,
        questionsAnswered: session.questions_answered,
        correctAnswers: session.correct_answers,
        accuracy: accuracy,
        averageTimeMs: averageTimeMs,
      },
      leaderboardEntry,
      success: true
    });

  } catch (error) {
    console.error('Error ending ranked session:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to end session',
        success: false
      },
      { status: 500 }
    );
  }
}
