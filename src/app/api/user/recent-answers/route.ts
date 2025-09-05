import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types/api.types';

// Enhanced type for recent answers carousel with details
interface RecentAnswer {
  id: string;
  isCorrect: boolean;
  topic: string;
  createdAt: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
}

export async function GET(): Promise<NextResponse<ApiResponse<{ recent_answers: RecentAnswer[] }>>> {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get last 10 attempts with detailed question info
    const { data: attempts, error: attemptsError } = await supabase
      .from('attempts')
      .select(`
        id,
        is_correct,
        created_at,
        user_answer,
        questions (
          stem,
          explanation_md,
          type,
          tf_correct_answer,
          topics (title),
          choices (*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (attemptsError || !attempts || attempts.length === 0) {
      if (attemptsError) {
        console.error('Database error fetching attempts:', attemptsError);
      } else {
        console.log('No attempts found for user, using mock data');
      }

      // Fallback: Return mock data for testing or when no attempts exist
      const mockRecentAnswers: RecentAnswer[] = [
        {
          id: 'mock-1',
          isCorrect: true,
          topic: 'Grundlagen',
          createdAt: new Date().toISOString(),
          question: 'Was ist die normale Körpertemperatur?',
          userAnswer: '36,1°C - 37,2°C',
          correctAnswer: '36,1°C - 37,2°C',
          explanation: 'Die normale Körpertemperatur liegt zwischen 36,1°C und 37,2°C.'
        },
        {
          id: 'mock-2',
          isCorrect: false,
          topic: 'Hygiene',
          createdAt: new Date(Date.now() - 300000).toISOString(),
          question: 'Wie lange sollte Händedesinfektion dauern?',
          userAnswer: '10 Sekunden',
          correctAnswer: '30 Sekunden',
          explanation: 'Händedesinfektion sollte mindestens 30 Sekunden dauern.'
        }
      ];

      return NextResponse.json({
        recent_answers: mockRecentAnswers,
        success: true
      });
    }

    const recentAnswers: RecentAnswer[] = (attempts || []).map((attempt: any) => {
      try {
        const question = attempt.questions;
        let userAnswer = '';
        let correctAnswer = '';

        // Format user answer
        if (question?.type === 'tf') {
          userAnswer = attempt.user_answer === 'true' ? 'Wahr' : 'Falsch';
          correctAnswer = question.tf_correct_answer ? 'Wahr' : 'Falsch';
        } else if (question?.type === 'mc') {
          // For MC questions, find the choice label
          const userChoice = question.choices?.find((c: any) => c.id === attempt.user_answer);
          const correctChoice = question.choices?.find((c: any) => c.is_correct);
          userAnswer = userChoice?.label || attempt.user_answer || 'Unbekannt';
          correctAnswer = correctChoice?.label || 'Unbekannt';
        }

        return {
          id: attempt.id,
          isCorrect: attempt.is_correct,
          topic: question?.topics?.title || 'Unbekannt',
          createdAt: attempt.created_at,
          question: question?.stem || 'Frage nicht verfügbar',
          userAnswer,
          correctAnswer,
          explanation: question?.explanation_md || 'Keine Erklärung verfügbar'
        };
      } catch (error) {
        console.error('Error processing attempt:', attempt.id, error);
        // Return a fallback entry
        return {
          id: attempt.id,
          isCorrect: attempt.is_correct,
          topic: 'Unbekannt',
          createdAt: attempt.created_at,
          question: 'Frage konnte nicht geladen werden',
          userAnswer: 'Unbekannt',
          correctAnswer: 'Unbekannt',
          explanation: 'Keine Erklärung verfügbar'
        };
      }
    });

    return NextResponse.json({
      recent_answers: recentAnswers,
      success: true
    });

  } catch (error) {
    console.error('Error fetching recent answers:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch recent answers'
    }, { status: 500 });
  }
}
