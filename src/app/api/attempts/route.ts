import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { saveAttempt } from '@/lib/api/questions';

export async function POST(req: NextRequest) {
  try {
    // Get user from auth
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questionId, isCorrect, timeMs, usedHints } = await req.json();
    
    // Validate input
    if (!questionId || typeof isCorrect !== 'boolean') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Save attempt to database
    await saveAttempt(
      user.id,
      questionId,
      isCorrect,
      timeMs || 0,
      usedHints || 0
    );

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error saving attempt:', error);
    return NextResponse.json({ 
      error: 'Failed to save attempt' 
    }, { status: 500 });
  }
}
