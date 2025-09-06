import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types/api.types';

type Props = {
  params: { sessionId: string };
};

export async function GET(
  req: NextRequest,
  { params }: Props
): Promise<NextResponse<ApiResponse>> {
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

    const { sessionId } = params;

    // Get session details with attempts
    const { data: session, error: sessionError } = await supabase
      .from('ranked_sessions')
      .select(`
        *,
        attempts: ranked_attempts (
          *,
          questions (
            stem,
            difficulty,
            type
          )
        )
      `)
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError) {
      if (sessionError.code === 'PGRST116') { // No rows returned
        return NextResponse.json(
          { error: 'Session not found', success: false },
          { status: 404 }
        );
      }
      throw sessionError;
    }

    return NextResponse.json({
      session,
      success: true
    });

  } catch (error) {
    console.error('Error fetching session details:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch session details',
        success: false
      },
      { status: 500 }
    );
  }
}
