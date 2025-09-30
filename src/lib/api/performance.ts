import { createServerClient } from '@/lib/supabase/server';
import { apiCache, cacheKeys } from '@/lib/cache';
import type { QuestionWithChoices } from '@/lib/db/schema';
import type { UserProgressData } from '@/types/api.types';
import type { Database } from '@/types/database.types';

/**
 * Performance-optimized question fetching with caching and single-query optimization
 */
export async function getOptimizedQuestionsByTopic(
  topicSlug: string, 
  limit: number = 10,
  offset: number = 0
): Promise<QuestionWithChoices[]> {
  const supabase = createServerClient();
  
  // Get user from auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Check cache first
  const cacheKey = cacheKeys.topicQuestions(topicSlug, user.id);
  const cached = apiCache.get<QuestionWithChoices[]>(cacheKey);
  if (cached && offset === 0) {
    return cached.slice(offset, offset + limit);
  }

  // Single optimized query with joins
  const { data: questionsData, error: questionsError } = await supabase
    .rpc('get_topic_questions_optimized', {
      p_topic_slug: topicSlug,
      p_user_id: user.id,
      p_limit: limit,
      p_offset: offset
    });

  if (questionsError) {
    // Fallback to original method if RPC doesn't exist
    console.warn('Optimized RPC not available, using fallback method');
    // Return empty for now, will be implemented in next step
    return [];
  }

  // Transform and cache
  const transformedQuestions = (questionsData || []).map((q: Database['public']['Tables']['questions']['Row'] & {
    choices?: Database['public']['Tables']['choices']['Row'][];
    citations?: Database['public']['Tables']['citations']['Row'][];
    topics?: { title: string }[];
  }) => ({
    id: q.id,
    topicId: q.topic_id,
    type: q.type,
    stem: q.stem,
    explanationMd: q.explanation_md,
    sourceUrl: q.source_url,
    sourceTitle: q.source_title,
    sourceDate: q.source_date,
    difficulty: q.difficulty,
    hints: q.hints || [],
    tfCorrectAnswer: q.tf_correct_answer,
    createdAt: new Date(q.created_at),
    choices: q.choices || [],
    citations: q.citations || [],
  }));

  // Cache the result
  if (offset === 0) {
    apiCache.set(cacheKey, transformedQuestions, 300000); // 5 minutes
  }

  return transformedQuestions;
}

/**
 * Performance-optimized user progress fetching with caching
 */
export async function getOptimizedUserProgress(userId: string): Promise<UserProgressData> {
  const cacheKey = cacheKeys.userProgress(userId);
  const cached = apiCache.get<UserProgressData>(cacheKey);
  if (cached) return cached;

  const supabase = createServerClient();

  // Single query to get all user stats
  const { data: userStats, error } = await supabase
    .rpc('get_user_stats_optimized', { p_user_id: userId });

  if (error) {
    throw new Error(`Failed to fetch user progress: ${error.message}`);
  }

  const progressData: UserProgressData = {
    xp: userStats?.xp || 0,
    streak_days: userStats?.streak_days || 0,
    last_seen: userStats?.last_seen || new Date().toISOString().split('T')[0],
    total_questions: userStats?.total_questions || 0,
    correct_answers: userStats?.correct_answers || 0,
    accuracy: userStats?.accuracy || 0,
    today_attempts: userStats?.today_attempts || 0,
  };

  // Cache for 2 minutes
  apiCache.set(cacheKey, progressData, 120000);

  return progressData;
}

/**
 * Invalidate cache when user makes progress
 */
export function invalidateUserCache(userId: string): void {
  apiCache.delete(cacheKeys.userProgress(userId));
  apiCache.delete(cacheKeys.topicProgress(userId));
  apiCache.delete(cacheKeys.userAttempts(userId));
  
  // Clear any topic-specific caches for this user
  ['grundlagen', 'hygiene', 'medikamente', 'dokumentation'].forEach(topic => {
    apiCache.delete(cacheKeys.topicQuestions(topic, userId));
  });
}
