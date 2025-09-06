import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types/api.types';

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
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

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Get global leaderboard from view (one entry per user)
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from('global_ranked_leaderboard')
      .select('*')
      .limit(limit);

    if (leaderboardError) throw leaderboardError;

    // Handle empty leaderboard
    if (!leaderboard || leaderboard.length === 0) {
      return NextResponse.json({
        leaderboard: [],
        userRank: null,
        success: true
      });
    }

    // Format leaderboard data
    const rankedLeaderboard = leaderboard.map((entry) => ({
      id: entry.user_id, // Use user_id as unique identifier
      user_id: entry.user_id,
      total_score: entry.total_score,
      questions_answered: entry.questions_answered,
      correct_answers: entry.correct_answers,
      accuracy: entry.accuracy,
      rank: entry.rank,
      display_name: entry.display_name || 'Unbekannter Nutzer',
      created_at: new Date().toISOString(), // Placeholder
    }));

    // Find user's rank
    const userRank = rankedLeaderboard.find(entry => entry.user_id === user.id)?.rank || null;

    return NextResponse.json({
      leaderboard: rankedLeaderboard,
      userRank,
      success: true
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch leaderboard',
        success: false
      },
      { status: 500 }
    );
  }
}
