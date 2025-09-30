import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { ApiResponse, ReviewItemData } from '@/types/api.types';
import type { Database } from '@/types/database.types';


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
    const reviewItems = (attempts || []).map((attempt: {
      id: string;
      question_id: string;
      is_correct: boolean;
      created_at: string;
      user_answer?: string;
      questions?: {
        stem: string;
        explanation_md?: string;
        type: string;
        tf_correct_answer?: boolean;
        choices?: Database['public']['Tables']['choices']['Row'][];
        citations?: Database['public']['Tables']['citations']['Row'][];
        topics?: { title: string };
      };
    }) => {
      const question = attempt.questions;
      let userAnswer = '';
      let correctAnswer = '';

      if (!question) {
        return {
          id: 'unknown',
          question: 'Frage nicht verfügbar',
          userAnswer: attempt.user_answer || 'Unbekannt',
          correctAnswer: 'Unbekannt',
          isCorrect: attempt.is_correct || false,
          date: attempt.created_at || new Date().toISOString()
        };
      }

      if (question.type === 'tf') {
        // For True/False questions, we need to find the correct answer from choices
        const correctChoice = question.choices?.find(c => c.is_correct);
        const correctAnswerValue = correctChoice?.label || 'Unbekannt';
        userAnswer = attempt.is_correct ? correctAnswerValue : (correctAnswerValue === 'Wahr' ? 'Falsch' : 'Wahr');
        correctAnswer = correctAnswerValue;
      } else {
        // For MC questions, we need to reconstruct which choice was selected
        // This is complex, so for now we'll show simplified version
        userAnswer = attempt.is_correct ? 'Richtig beantwortet' : 'Falsch beantwortet';
        const correctChoice = question.choices?.find((c: Database['public']['Tables']['choices']['Row']) => c.is_correct);
        correctAnswer = correctChoice?.label || 'Unbekannt';
      }

      return {
        id: attempt.question_id || attempt.id || 'unknown',
        question: question.stem || 'Frage nicht verfügbar',
        userAnswer,
        correctAnswer,
        isCorrect: attempt.is_correct || false,
        explanation: question.explanation_md || 'Keine Erklärung verfügbar',
        topic: question.topics?.title || 'Unbekannt',
        completedAt: attempt.created_at || new Date().toISOString(),
        citations: (question.citations || []).map((c: Database['public']['Tables']['citations']['Row']) => ({
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

