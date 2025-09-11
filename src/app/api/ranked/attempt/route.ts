import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { questions } from '@/lib/db/schema';
import { updateUserStreakFromDailyQuest, checkAndResetExpiredStreak } from '@/lib/streak-utils';
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

    // Check and reset expired streaks before processing attempt (same as regular quiz)
    try {
      console.log('🔥 Ranked Quiz: Checking for expired streaks...');
      const wasReset = await checkAndResetExpiredStreak(user.id);
      if (wasReset) {
        console.log('🚫 Streak was reset due to inactivity before ranked attempt');
      }
    } catch (streakCheckError) {
      console.error('Failed to check expired streak in ranked mode:', streakCheckError);
      // Don't fail the request if streak check fails
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

    // Get question details for scoring (ensure camelCase mapping matches frontend)
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (questionError || !questionData) {
      return NextResponse.json(
        { error: 'Question not found', success: false },
        { status: 400 }
      );
    }

    // Map database fields to camelCase to match frontend expectations
    const question = {
      ...questionData,
      tfCorrectAnswer: questionData.tf_correct_answer,
      explanationMd: questionData.explanation_md,
      sourceUrl: questionData.source_url,
      sourceTitle: questionData.source_title,
      sourceDate: questionData.source_date,
      createdAt: questionData.created_at,
    };

    // Calculate if answer is correct
    let isCorrect = false;
    if (question.type === 'tf') {
      // Use camelCase field to match frontend data structure
      isCorrect = answer === question.tfCorrectAnswer;
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

    // Calculate score: Only positive points for correct answers, negative for wrong answers
    let score = 0;
    if (isCorrect) {
      const baseScore = question.difficulty * 100;
      const timeBonus = Math.max(0, 20000 - timeMs) / 200; // Max 100 bonus for answering in < 20s
      const hintPenalty = usedHints * 25;
      score = Math.round(baseScore + timeBonus - hintPenalty);
    } else {
      // Wrong answer: lose points based on difficulty
      score = -(question.difficulty * 50); // Lose half the base score for wrong answers
    }

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

    // Update daily quest progress if answer is correct (same as regular quiz)
    if (isCorrect) {
      try {
        console.log('🎯 Ranked Quiz: Updating Daily Quest progress...');
        await updateRankedDailyQuest(supabase, user.id);
      } catch (questError) {
        console.error('Failed to update daily quest in ranked mode:', questError);
        // Don't fail the request if quest update fails
      }
    }

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

/**
 * Update daily quest progress for ranked mode (same logic as regular quiz)
 */
async function updateRankedDailyQuest(supabase: any, userId: string) {
  const today = new Date().toISOString().split('T')[0];

  // Get current daily quest progress
  const { data: currentProgress, error: progressError } = await supabase
    .from('user_progress')
    .select('daily_quest_progress, daily_quest_completed, daily_quest_date')
    .eq('user_id', userId)
    .single();

  if (progressError && progressError.code !== 'PGRST116') {
    console.error('Failed to fetch daily quest progress:', progressError);
    return;
  }

  const currentQuestProgress = currentProgress?.daily_quest_progress || 0;
  const isQuestCompleted = currentProgress?.daily_quest_completed || false;
  const questDate = currentProgress?.daily_quest_date;

  // Reset progress if it's a new day
  let newQuestProgress = currentQuestProgress;
  let newQuestCompleted = isQuestCompleted;
  let newQuestDate = questDate;

  if (questDate !== today) {
    // New day - reset progress
    newQuestProgress = 1; // This is the first question of the day
    newQuestCompleted = false;
    newQuestDate = today;
  } else if (!isQuestCompleted && currentQuestProgress < 5) {
    // Same day, quest not completed, increment progress
    newQuestProgress = currentQuestProgress + 1;

    // Mark as completed if we reach 5 questions
    if (newQuestProgress >= 5) {
      newQuestCompleted = true;
      newQuestDate = today;
    }
  }

  // Update daily quest progress
  const { error: questUpdateError } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      daily_quest_progress: newQuestProgress,
      daily_quest_completed: newQuestCompleted,
      daily_quest_date: newQuestDate,
    });

  if (questUpdateError) {
    console.error('Failed to update daily quest progress:', questUpdateError);
  } else {
    console.log(`📊 Ranked Daily Quest Progress: ${newQuestProgress}/5, Completed: ${newQuestCompleted}`);
  }

  // If daily quest was just completed, update streak (only if not already done today)
  if (newQuestCompleted && !isQuestCompleted) {
    try {
      console.log('🎯 Ranked Daily Quest completed! Updating streak...');
      await updateUserStreakFromDailyQuest(userId);
    } catch (streakError) {
      console.error('Failed to update user streak after ranked daily quest completion:', streakError);
    }
  }
}
