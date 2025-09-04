import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types/api.types';

// Simple type for recent answers carousel
interface RecentAnswer {
  id: string;
  isCorrect: boolean;
  topic: string;
  createdAt: string;
}

export async function GET(): Promise<NextResponse<ApiResponse<{ recent_answers: RecentAnswer[] }>>> {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get last 10 attempts with topic info
    const { data: attempts, error: attemptsError } = await supabase
      .from('attempts')
      .select(`
        id,
        is_correct,
        created_at,
        questions (
          topics (title)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (attemptsError) throw attemptsError;

    const recentAnswers: RecentAnswer[] = (attempts || []).map((attempt: any) => ({
      id: attempt.id,
      isCorrect: attempt.is_correct,
      topic: attempt.questions?.topics?.title || 'Unbekannt',
      createdAt: attempt.created_at
    }));

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
