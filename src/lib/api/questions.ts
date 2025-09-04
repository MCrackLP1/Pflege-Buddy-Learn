import { createServerClient } from '@/lib/supabase/server';
import type { QuestionWithChoices } from '@/lib/db/schema';

/**
 * Fetch questions for a specific topic from database using Supabase client
 */
export async function getQuestionsByTopic(topicSlug: string): Promise<QuestionWithChoices[]> {
  try {
    const supabase = createServerClient();
    
    // Get topic by slug
    const { data: topics, error: topicError } = await supabase
      .from('topics')
      .select('*')
      .eq('slug', topicSlug)
      .limit(1);
    
    if (topicError) throw topicError;
    if (!topics || topics.length === 0) {
      throw new Error(`Topic '${topicSlug}' not found`);
    }
    
    const topic = topics[0];
    
    // Get questions for this topic with all related data
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select(`
        *,
        choices (*),
        citations (*)
      `)
      .eq('topic_id', topic.id);
    
    if (questionsError) throw questionsError;
    
    // Transform to QuestionWithChoices format
    const questionsWithRelations: QuestionWithChoices[] = (questionsData || []).map(q => ({
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
      choices: (q.choices || []).map(c => ({
        id: c.id,
        questionId: c.question_id,
        label: c.label,
        isCorrect: c.is_correct, // Map snake_case to camelCase
      })),
      citations: (q.citations || []).map(c => ({
        id: c.id,
        questionId: c.question_id,
        url: c.url,
        title: c.title,
        publishedDate: c.published_date,
        accessedAt: new Date(), // Default to now since this isn't stored
      })),
    }));
    
    return questionsWithRelations;
    
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

/**
 * Get random questions from all topics (for mixed quiz)
 */
export async function getRandomQuestions(count: number = 10): Promise<QuestionWithChoices[]> {
  try {
    const supabase = createServerClient();
    
    // Get random questions from all topics with related data
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select(`
        *,
        choices (*),
        citations (*)
      `)
      .limit(count);
    
    if (questionsError) throw questionsError;
    
    // Transform to QuestionWithChoices format
    const questionsWithRelations: QuestionWithChoices[] = (questionsData || [])
      .sort(() => Math.random() - 0.5) // Randomize
      .slice(0, count) // Take only requested count
      .map(q => ({
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
        choices: (q.choices || []).map(c => ({
          id: c.id,
          questionId: c.question_id,
          label: c.label,
          isCorrect: c.is_correct, // Map snake_case to camelCase
        })),
        citations: (q.citations || []).map(c => ({
          id: c.id,
          questionId: c.question_id,
          url: c.url,
          title: c.title,
          publishedDate: c.published_date,
          accessedAt: new Date(), // Default to now since this isn't stored
        })),
      }));
    
    return questionsWithRelations;
    
  } catch (error) {
    console.error('Error fetching random questions:', error);
    throw error;
  }
}

/**
 * Save user attempt to database using Supabase client
 */
export async function saveAttempt(
  userId: string, 
  questionId: string, 
  isCorrect: boolean, 
  timeMs: number,
  usedHints: number
) {
  try {
    const supabase = createServerClient();
    
    const { error } = await supabase
      .from('attempts')
      .insert({
        user_id: userId,
        question_id: questionId,
        is_correct: isCorrect,
        time_ms: timeMs,
        used_hints: usedHints,
      });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error saving attempt:', error);
    throw error;
  }
}
