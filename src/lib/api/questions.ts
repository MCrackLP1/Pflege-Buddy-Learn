import { db } from '@/lib/db';
import { topics, questions, choices, citations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { QuestionWithChoices } from '@/lib/db/schema';

/**
 * Fetch questions for a specific topic from database
 */
export async function getQuestionsByTopic(topicSlug: string): Promise<QuestionWithChoices[]> {
  try {
    // Get topic by slug
    const topic = await db
      .select()
      .from(topics)
      .where(eq(topics.slug, topicSlug))
      .limit(1);
    
    if (topic.length === 0) {
      throw new Error(`Topic '${topicSlug}' not found`);
    }
    
    // Get questions with choices and citations
    const questionsData = await db
      .select()
      .from(questions)
      .where(eq(questions.topicId, topic[0].id));
    
    const questionsWithRelations: QuestionWithChoices[] = [];
    
    for (const question of questionsData) {
      // Get choices for this question
      const questionChoices = await db
        .select()
        .from(choices)
        .where(eq(choices.questionId, question.id));
      
      // Get citations for this question  
      const questionCitations = await db
        .select()
        .from(citations)
        .where(eq(citations.questionId, question.id));
      
      questionsWithRelations.push({
        ...question,
        choices: questionChoices,
        citations: questionCitations,
        tfCorrectAnswer: question.tfCorrectAnswer,
      });
    }
    
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
    // Get all questions
    const allQuestions = await db
      .select()
      .from(questions)
      .limit(count * 3); // Get more to randomize
    
    // Shuffle and take requested count
    const shuffled = allQuestions.sort(() => Math.random() - 0.5).slice(0, count);
    
    const questionsWithRelations: QuestionWithChoices[] = [];
    
    for (const question of shuffled) {
      // Get choices for this question
      const questionChoices = await db
        .select()
        .from(choices)
        .where(eq(choices.questionId, question.id));
      
      // Get citations for this question  
      const questionCitations = await db
        .select()
        .from(citations)
        .where(eq(citations.questionId, question.id));
      
      questionsWithRelations.push({
        ...question,
        choices: questionChoices,
        citations: questionCitations,
        tfCorrectAnswer: question.tfCorrectAnswer,
      });
    }
    
    return questionsWithRelations;
    
  } catch (error) {
    console.error('Error fetching random questions:', error);
    throw error;
  }
}

/**
 * Save user attempt to database
 */
export async function saveAttempt(
  userId: string, 
  questionId: string, 
  isCorrect: boolean, 
  timeMs: number,
  usedHints: number
) {
  try {
    const { attempts } = await import('@/lib/db/schema');
    
    await db.insert(attempts).values({
      userId,
      questionId,
      isCorrect,
      timeMs,
      usedHints,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving attempt:', error);
    throw error;
  }
}
