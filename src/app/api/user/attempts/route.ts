import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { ApiResponse, ReviewItemData, SupabaseChoice, SupabaseCitation } from '@/types/api.types';


export async function GET(): Promise<NextResponse<ApiResponse<{ review_items: ReviewItemData[] }>>> {
  try {
    // Get user from auth
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user attempts with question details for review
    const { data: attempts, error: attemptsError } = await supabase
      .from('attempts')
      .select(`
        *,
        questions (
          id,
          stem,
          explanation_md,
          type,
          tf_correct_answer,
          topics (title),
          choices (*),
          citations (*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50); // Last 50 attempts

    if (attemptsError) throw attemptsError;

    // Transform attempts for review page
    const reviewItems = (attempts || []).map((attempt: any) => {
      const question = attempt.questions;
      let userAnswer = '';
      let correctAnswer = '';

      if (question.type === 'tf') {
        userAnswer = attempt.is_correct ? 
          (question.tf_correct_answer ? 'Wahr' : 'Falsch') : 
          (question.tf_correct_answer ? 'Falsch' : 'Wahr');
        correctAnswer = question.tf_correct_answer ? 'Wahr' : 'Falsch';
      } else {
        // For MC questions, we need to reconstruct which choice was selected
        // This is complex, so for now we'll show simplified version
        userAnswer = attempt.is_correct ? 'Richtig beantwortet' : 'Falsch beantwortet';
        const correctChoice = question.choices?.find((c: SupabaseChoice) => c.is_correct);
        correctAnswer = correctChoice?.label || 'Unbekannt';
      }

      return {
        id: attempt.id,
        question: question.stem,
        userAnswer,
        correctAnswer,
        isCorrect: attempt.is_correct,
        explanation: question.explanation_md,
        topic: question.topics?.title || 'Unbekannt',
        completedAt: attempt.created_at, // Keep as string, convert in frontend
        citations: (question.citations || []).map((c: SupabaseCitation) => ({
          id: c.id,
          url: c.url,
          title: c.title,
        }))
      };
    });

    return NextResponse.json({
      review_items: reviewItems,
      success: true
    });

  } catch (error) {
    console.error('Error fetching user attempts:', error);
        return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch attempts'
    }, { status: 500 });
  }
}

