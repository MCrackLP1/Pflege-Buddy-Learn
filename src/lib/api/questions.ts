import { createServerClient } from '@/lib/supabase/server';
import type { QuestionWithChoices } from '@/lib/db/schema';

/**
 * Fetch questions for a specific topic from database using Supabase client
 * Excludes questions that user has already answered correctly
 * Supports pagination for large question sets
 */
export async function getQuestionsByTopic(
  topicSlug: string, 
  limit: number = 10, 
  offset: number = 0
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

    // Get questions that user has already answered correctly
    const { data: correctAttempts, error: attemptsError } = await supabase
      .from('attempts')
      .select('question_id')
      .eq('user_id', user.id)
      .eq('is_correct', true);

    if (attemptsError) throw attemptsError;

    console.log('DEBUG getQuestionsByTopic - correctAttempts from DB:', correctAttempts);

    const answeredQuestionIds = new Set(
      (correctAttempts || []).map(a => a.question_id)
    );

    console.log('DEBUG getQuestionsByTopic - answeredQuestionIds set:', Array.from(answeredQuestionIds));

    // First get ALL questions for this topic to properly filter
    const { data: allQuestionsData, error: allQuestionsError } = await supabase
      .from('questions')
      .select(`
        *,
        choices (*),
        citations (*)
      `)
      .eq('topic_id', topic.id)
      .order('created_at', { ascending: false });

    if (allQuestionsError) throw allQuestionsError;

    // Filter out questions user has already answered correctly
    const unansweredQuestions = (allQuestionsData || []).filter(q =>
      !answeredQuestionIds.has(q.id)
    );

    console.log('DEBUG getQuestionsByTopic - all questions:', allQuestionsData?.length);
    console.log('DEBUG getQuestionsByTopic - unanswered questions:', unansweredQuestions.length);
    console.log('DEBUG getQuestionsByTopic - filtered out:', (allQuestionsData?.length || 0) - unansweredQuestions.length);

    // Apply pagination to the filtered results
    const paginatedQuestions = unansweredQuestions.slice(offset, offset + limit);

    console.log('DEBUG getQuestionsByTopic - paginated questions:', paginatedQuestions.length);
    console.log('DEBUG getQuestionsByTopic - requested offset:', offset, 'limit:', limit);

    // If no unanswered questions, return a few for review/practice
    const finalQuestions = unansweredQuestions.length > 0
      ? paginatedQuestions
      : (allQuestionsData || []).slice(0, 3); // Show 3 for review
    
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
      choices: (q.choices || []).map((c: any) => ({
        id: c.id,
        questionId: c.question_id,
        label: c.label,
        isCorrect: c.is_correct, // Map snake_case to camelCase
      })),
      citations: (q.citations || []).map((c: any) => ({
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

    // Get questions that user has already answered correctly
    const { data: correctAttempts, error: attemptsError } = await supabase
      .from('attempts')
      .select('question_id')
      .eq('user_id', user.id)
      .eq('is_correct', true);

    if (attemptsError) throw attemptsError;

    console.log('DEBUG getRandomQuestions - correctAttempts from DB:', correctAttempts);

    const answeredQuestionIds = new Set(
      (correctAttempts || []).map(a => a.question_id)
    );

    console.log('DEBUG getRandomQuestions - answeredQuestionIds set:', Array.from(answeredQuestionIds));

    // Get ALL questions from all topics
    const { data: allQuestionsData, error: allQuestionsError } = await supabase
      .from('questions')
      .select(`
        *,
        choices (*),
        citations (*)
      `);

    if (allQuestionsError) throw allQuestionsError;

    console.log('DEBUG getRandomQuestions - all questions:', allQuestionsData?.length);

    // Filter out questions user has already answered correctly
    const unansweredQuestions = (allQuestionsData || []).filter(q =>
      !answeredQuestionIds.has(q.id)
    );

    console.log('DEBUG getRandomQuestions - unanswered questions:', unansweredQuestions.length);
    console.log('DEBUG getRandomQuestions - filtered out:', (allQuestionsData?.length || 0) - unansweredQuestions.length);

    // If no unanswered questions, use all questions for review
    const availableQuestions = unansweredQuestions.length > 0
      ? unansweredQuestions
      : allQuestionsData || [];

    // Get random questions from the available ones
    const randomQuestions = availableQuestions
      .sort(() => Math.random() - 0.5) // Randomize
      .slice(0, count); // Take only requested count

    console.log('DEBUG getRandomQuestions - random questions selected:', randomQuestions.length);
    
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
        choices: (q.choices || []).map((c: any) => ({
          id: c.id,
          questionId: c.question_id,
          label: c.label,
          isCorrect: c.is_correct, // Map snake_case to camelCase
        })),
        citations: (q.citations || []).map((c: any) => ({
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
