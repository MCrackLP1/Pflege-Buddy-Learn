import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { questions } from '@/lib/db/schema';
import type { ApiResponse } from '@/types/api.types';

interface RankedAttemptRequest {
  sessionId: string;
  questionId: string;
  answer: string | boolean;
  timeMs: number;
  usedHints: number;
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

    const body: RankedAttemptRequest = await req.json();
    const { sessionId, questionId, answer, timeMs, usedHints } = body;

    if (!sessionId || !questionId || answer === undefined || timeMs === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields', success: false },
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

    // Get question details for scoring
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (questionError || !question) {
      return NextResponse.json(
        { error: 'Question not found', success: false },
        { status: 400 }
      );
    }

    // Calculate if answer is correct
    let isCorrect = false;
    if (question.type === 'tf') {
      isCorrect = answer === question.tf_correct_answer;
    } else {
      // For MC questions, we need to check the choices
      const { data: choices, error: choicesError } = await supabase
        .from('choices')
        .select('*')
        .eq('question_id', questionId);

      if (choicesError) throw choicesError;

      const correctChoice = choices?.find(c => c.is_correct);
      isCorrect = answer === correctChoice?.id;
    }

    // Calculate score: (difficulty * 100) + timeBonus - hintPenalty
    const baseScore = question.difficulty * 100;
    const timeBonus = Math.max(0, 20000 - timeMs) / 200; // Max 100 bonus for answering in < 20s
    const hintPenalty = usedHints * 25;
    const score = Math.round(baseScore + timeBonus - hintPenalty);

    // Save attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('ranked_attempts')
      .insert({
        session_id: sessionId,
        question_id: questionId,
        is_correct: isCorrect,
        time_ms: timeMs,
        used_hints: usedHints,
        score: score,
      })
      .select()
      .single();

    if (attemptError) throw attemptError;

    // Update session stats
    await supabase
      .from('ranked_sessions')
      .update({
        total_score: session.total_score + score,
        questions_answered: session.questions_answered + 1,
        correct_answers: session.correct_answers + (isCorrect ? 1 : 0),
        total_time_ms: session.total_time_ms + timeMs,
      })
      .eq('id', sessionId);

    return NextResponse.json({
      attempt,
      isCorrect,
      score,
      success: true
    });

  } catch (error) {
    console.error('Error saving ranked attempt:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to save attempt',
        success: false
      },
      { status: 500 }
    );
  }
}
