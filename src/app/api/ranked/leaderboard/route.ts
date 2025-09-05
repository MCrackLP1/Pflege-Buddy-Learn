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

    // Get leaderboard data
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from('ranked_leaderboard')
      .select('*')
      .order('total_score', { ascending: false })
      .order('created_at', { ascending: true }) // For tie-breaking
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

    // Get user profiles for display names
    const userIds = leaderboard.map(entry => entry.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .in('user_id', userIds);

    // Create a map for quick profile lookup
    const profileMap = new Map(
      profiles?.map(profile => [profile.user_id, profile.display_name]) || []
    );

    // Add rank and profile info to each entry
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      accuracy: entry.accuracy / 100, // Convert back to percentage
      display_name: profileMap.get(entry.user_id) || 'Unbekannter Nutzer'
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
