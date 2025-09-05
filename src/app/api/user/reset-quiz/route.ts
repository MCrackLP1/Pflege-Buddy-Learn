import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types/api.types';

export async function POST(): Promise<NextResponse<ApiResponse>> {
  try {
    const supabase = createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert', success: false },
        { status: 401 }
      );
    }

    // Delete all attempts for this user
    const { error: deleteError } = await supabase
      .from('attempts')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting attempts:', deleteError);
      return NextResponse.json(
        { error: 'Fehler beim Zurücksetzen der Quiz-Versuche', success: false },
        { status: 500 }
      );
    }

    // Reset user progress (optional - only reset XP and streak if requested)
    const { error: progressError } = await supabase
      .from('user_progress')
      .update({
        xp: 0,
        streak_days: 0,
        last_seen: new Date().toISOString().split('T')[0] // Today's date
      })
      .eq('user_id', user.id);

    if (progressError) {
      console.error('Error resetting progress:', progressError);
      // Don't fail the request if progress reset fails
    }

    return NextResponse.json({
      success: true,
      message: 'Quiz-Versuche erfolgreich zurückgesetzt'
    });

  } catch (error) {
    console.error('Error resetting quiz:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler', success: false },
      { status: 500 }
    );
  }
}
