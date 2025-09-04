import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { AttemptRequestSchema } from '@/lib/validation';
import { rateLimiter, RATE_LIMITS } from '@/middleware/rate-limiter';
import { invalidateUserCache } from '@/lib/api/performance';
import { calculateXP } from '@/lib/utils/quiz';
import { updateUserStreak, getActiveXPBoost, calculateXPWithBoost } from '@/lib/streak-utils';
import type { ApiResponse } from '@/types/api.types';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Get user from auth
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Rate limiting
    const clientIp = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const limitKey = `attempts:${user.id}:${clientIp}`;
    const rateLimit = rateLimiter.checkLimit(
      limitKey, 
      RATE_LIMITS.ATTEMPTS.maxRequests,
      RATE_LIMITS.ATTEMPTS.windowMs
    );

    if (!rateLimit.allowed) {
      return NextResponse.json({ 
        success: false, 
        error: 'Too many requests. Please try again later.' 
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
        }
      });
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = AttemptRequestSchema.parse(body);
    
    // Verify question exists and user has access
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('id, difficulty')
      .eq('id', validatedData.questionId)
      .single();
    
    if (questionError || !question) {
      return NextResponse.json({ 
        success: false, 
        error: 'Question not found' 
      }, { status: 404 });
    }

    // Save attempt to database
    const { error: saveError } = await supabase
      .from('attempts')
      .insert({
        user_id: user.id,
        question_id: validatedData.questionId,
        is_correct: validatedData.isCorrect,
        time_ms: validatedData.timeMs,
        used_hints: validatedData.usedHints,
      });

    if (saveError) {
      console.error('Failed to save attempt:', saveError);
      return NextResponse.json({
        success: false,
        error: 'Failed to save progress'
      }, { status: 500 });
    }

    // Calculate and update XP if correct
    if (validatedData.isCorrect) {
      // Use the standardized calculateXP function
      const baseXPGained = calculateXP(question.difficulty, validatedData.usedHints, validatedData.timeMs);

      // Get active XP boost for user
      const xpBoostInfo = await getActiveXPBoost(user.id);
      const finalXPGained = calculateXPWithBoost(baseXPGained, xpBoostInfo.multiplier);

      console.log(`XP gained: ${baseXPGained} (base) x ${xpBoostInfo.multiplier} (boost) = ${finalXPGained} (final)`);

      // Get current XP first, then add the new XP
      const { data: currentProgress, error: fetchError } = await supabase
        .from('user_progress')
        .select('xp')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Failed to fetch current XP:', fetchError);
      }

      const currentXP = currentProgress?.xp || 0;
      const newTotalXP = currentXP + finalXPGained;

      // Update with the new total XP
      const { error: xpError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          xp: newTotalXP,
          last_seen: new Date().toISOString().split('T')[0]
        });

      if (xpError) {
        console.error('Failed to update XP:', xpError);
        // Don't fail the request if XP update fails
      } else {
        console.log(`XP updated: ${currentXP} + ${finalXPGained} = ${newTotalXP}`);
      }
    }

    // Update user streak after attempt (this handles daily streak tracking)
    try {
      await updateUserStreak(user.id);
    } catch (streakError) {
      console.error('Failed to update user streak:', streakError);
      // Don't fail the request if streak update fails
    }

    // Invalidate user cache for fresh data
    invalidateUserCache(user.id);

    return NextResponse.json({ 
      success: true,
      xpGained: validatedData.isCorrect ? 
        Math.max(1, question.difficulty * 10 - validatedData.usedHints * 5) : 0
    }, {
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
      }
    });

  } catch (error) {
    console.error('Attempt save error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Import z for ZodError check
import { z } from 'zod';