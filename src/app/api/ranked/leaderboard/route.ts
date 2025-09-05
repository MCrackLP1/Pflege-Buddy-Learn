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

    // Get leaderboard with user info
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from('ranked_leaderboard')
      .select(`
        *,
        profiles: user_id (
          display_name
        )
      `)
      .order('total_score', { ascending: false })
      .order('created_at', { ascending: true }) // For tie-breaking
      .limit(limit);

    if (leaderboardError) throw leaderboardError;

    // Add rank to each entry
    const rankedLeaderboard = leaderboard?.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      accuracy: entry.accuracy / 100, // Convert back to percentage
    })) || [];

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
