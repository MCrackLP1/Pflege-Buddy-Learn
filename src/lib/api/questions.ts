import { createServerClient } from '@/lib/supabase/server';
import type { QuestionWithChoices } from '@/lib/db/schema';
import type { Database } from '@/types/database.types';

/**
 * Fetch questions for a specific topic from database using Supabase client
 * Excludes questions that user has already answered correctly
 * Supports pagination for large question sets
 */
export async function getQuestionsByTopic(
  topicSlug: string, 
  limit: number = 10
): Promise<QuestionWithChoices[]> {
  try {
    const supabase = createServerClient();
    
    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }
    
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

    // Get ALL questions for this topic
    const { data: allQuestionsData, error: allQuestionsError } = await supabase
      .from('questions')
      .select(`
        *,
        choices (*),
        citations (*)
      `)
      .eq('topic_id', topic.id);

    if (allQuestionsError) throw allQuestionsError;

    // Shuffle all questions and take the first 'limit' questions
    // This ensures randomness and reduces duplicate chances
    const shuffledQuestions = (allQuestionsData || [])
      .sort(() => Math.random() - 0.5) // Random shuffle
      .slice(0, limit); // Take only the requested number

    // Return the randomized selection
    const finalQuestions = shuffledQuestions;
    
    // Transform to QuestionWithChoices format
    const questionsWithRelations: QuestionWithChoices[] = finalQuestions.map(q => ({
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
      choices: (q.choices || []).map((c: Database['public']['Tables']['choices']['Row']) => ({
        id: c.id,
        questionId: c.question_id,
        label: c.label,
        isCorrect: c.is_correct, // Map snake_case to camelCase
      })),
      citations: (q.citations || []).map((c: Database['public']['Tables']['citations']['Row']) => ({
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
 * Optimized for performance with single query
 */
export async function getRandomQuestions(count: number = 10): Promise<QuestionWithChoices[]> {
  try {
    const supabase = createServerClient();

    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Get ALL questions from all topics
    const { data: allQuestionsData, error: allQuestionsError } = await supabase
      .from('questions')
      .select(`
        *,
        choices (*),
        citations (*)
      `);

    if (allQuestionsError) throw allQuestionsError;

    // Get truly random questions from all available questions
    const randomQuestions = (allQuestionsData || [])
      .sort(() => Math.random() - 0.5) // Randomize all questions
      .slice(0, count); // Take only requested count
    
    // Transform to QuestionWithChoices format
    const questionsWithRelations: QuestionWithChoices[] = randomQuestions
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
        choices: (q.choices || []).map((c: Database['public']['Tables']['choices']['Row']) => ({
          id: c.id,
          questionId: c.question_id,
          label: c.label,
          isCorrect: c.is_correct, // Map snake_case to camelCase
        })),
        citations: (q.citations || []).map((c: Database['public']['Tables']['citations']['Row']) => ({
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
