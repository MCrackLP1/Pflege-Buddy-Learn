import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { AttemptRequestSchema } from '@/lib/validation';
import { rateLimiter, RATE_LIMITS } from '@/middleware/rate-limiter';
import { invalidateUserCache } from '@/lib/api/performance';
import { calculateXP } from '@/lib/utils/quiz';
import { updateDailyQuestAndStreak, getActiveXPBoost, calculateXPWithBoost } from '@/lib/streak-utils';
import { updateXpMilestones } from '@/lib/xp-utils';
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

    // Note: Daily Quest and Streak management now handled per correct answer

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

    // Save attempt to database (this is the critical operation)
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

    console.log(`✅ Saved attempt for question ${validatedData.questionId}: ${validatedData.isCorrect ? 'correct' : 'incorrect'}`);

    // Handle XP and related operations asynchronously (don't block the response)
    if (validatedData.isCorrect) {
      // Fire and forget - don't wait for completion
      handleXPOperations(user.id, question.difficulty, validatedData.usedHints, validatedData.timeMs)
        .catch(error => console.error('XP operations failed:', error));
    }

    // XP and related operations are handled asynchronously above
    // Cache invalidation happens in the async function

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

// Helper function to handle XP operations asynchronously
async function handleXPOperations(userId: string, questionDifficulty: number, usedHints: number, timeMs: number) {
  try {
    const supabase = createServerClient();

    // Calculate XP
    const baseXPGained = calculateXP(questionDifficulty, usedHints, timeMs);
    const xpBoostInfo = await getActiveXPBoost(userId);
    const finalXPGained = calculateXPWithBoost(baseXPGained, xpBoostInfo.multiplier);

    console.log(`XP gained: ${baseXPGained} (base) x ${xpBoostInfo.multiplier} (boost) = ${finalXPGained} (final)`);

    // Get current XP and update atomically
    const { data: currentProgress } = await supabase
      .from('user_progress')
      .select('xp')
      .eq('user_id', userId)
      .single();

    const currentXP = currentProgress?.xp || 0;
    const newTotalXP = currentXP + finalXPGained;

    // Update XP
    await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        xp: newTotalXP,
        last_seen: new Date().toISOString().split('T')[0]
      });

    console.log(`XP updated: ${currentXP} + ${finalXPGained} = ${newTotalXP}`);

    // Update milestones and daily quest in parallel
    const [milestoneResult] = await Promise.allSettled([
      updateXpMilestones(userId, newTotalXP),
      updateDailyQuestAndStreak(userId)
    ]);

    if (milestoneResult.status === 'fulfilled' && milestoneResult.value.milestonesAchieved.length > 0) {
      console.log(`🎉 XP milestones achieved: ${milestoneResult.value.milestonesAchieved.length}`);
    }

    // Invalidate cache
    invalidateUserCache(userId);

  } catch (error) {
    console.error('XP operations failed:', error);
    // Don't throw - this is fire-and-forget
  }
}

// Import z for ZodError check
import { z } from 'zod';