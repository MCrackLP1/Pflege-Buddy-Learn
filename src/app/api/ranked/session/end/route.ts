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

    // Calculate final stats
    const accuracy = session.questions_answered > 0
      ? Math.round((session.correct_answers / session.questions_answered) * 10000) / 100 // percentage with 2 decimal places
      : 0;

    const averageTimeMs = session.questions_answered > 0
      ? Math.round(session.total_time_ms / session.questions_answered)
      : 0;

    // Add to leaderboard if they answered at least 5 questions
    let leaderboardEntry = null;
    if (session.questions_answered >= 5) {
      const { data: entry, error: leaderboardError } = await supabase
        .from('ranked_leaderboard')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          total_score: session.total_score,
          questions_answered: session.questions_answered,
          correct_answers: session.correct_answers,
          accuracy: Math.round(accuracy * 100), // Store as integer (percentage * 100)
          average_time_ms: averageTimeMs,
        })
        .select()
        .single();

      if (leaderboardError) {
        console.error('Failed to save leaderboard entry:', leaderboardError);
        // Don't fail the request if leaderboard save fails
      } else {
        leaderboardEntry = entry;
      }
    }

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
