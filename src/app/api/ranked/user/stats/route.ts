import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types/api.types';

export async function GET(): Promise<NextResponse<ApiResponse>> {
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

    // Get user's best leaderboard entry
    const { data: bestEntry, error: bestEntryError } = await supabase
      .from('ranked_leaderboard')
      .select('*')
      .eq('user_id', user.id)
      .order('total_score', { ascending: false })
      .limit(1)
      .single();

    if (bestEntryError && bestEntryError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw bestEntryError;
    }

    // Get user's total sessions and stats
    const { data: sessions, error: sessionsError } = await supabase
      .from('ranked_sessions')
      .select('total_score, questions_answered, correct_answers, total_time_ms')
      .eq('user_id', user.id)
      .eq('is_active', false); // Only completed sessions

    if (sessionsError) throw sessionsError;

    // Calculate aggregate stats
    const totalSessions = sessions?.length || 0;
    const totalQuestions = sessions?.reduce((sum, s) => sum + s.questions_answered, 0) || 0;
    const totalCorrect = sessions?.reduce((sum, s) => sum + s.correct_answers, 0) || 0;
    const totalScore = sessions?.reduce((sum, s) => sum + s.total_score, 0) || 0;
    const totalTime = sessions?.reduce((sum, s) => sum + s.total_time_ms, 0) || 0;

    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 10000) / 100 : 0;
    const averageScore = totalSessions > 0 ? Math.round(totalScore / totalSessions) : 0;
    const averageTimeMs = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0;

    // Get user's rank on leaderboard
    const { data: userRankData, error: rankError } = await supabase
      .rpc('get_user_ranked_rank', { user_id: user.id });

    const userRank = rankError ? null : userRankData;

    return NextResponse.json({
      stats: {
        totalSessions,
        totalQuestions,
        totalCorrect,
        totalScore,
        overallAccuracy,
        averageScore,
        averageTimeMs,
        bestScore: bestEntry?.total_score || 0,
        bestAccuracy: bestEntry ? bestEntry.accuracy / 100 : 0,
      },
      rank: userRank,
      success: true
    });

  } catch (error) {
    console.error('Error fetching user ranked stats:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch user stats',
        success: false
      },
      { status: 500 }
    );
  }
}
