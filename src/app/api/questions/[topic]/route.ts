import { NextRequest, NextResponse } from 'next/server';
import { getQuestionsByTopic, getRandomQuestions } from '@/lib/api/questions';

export async function GET(
  req: NextRequest,
  { params }: { params: { topic: string } }
) {
  try {
    const { topic } = params;
    
    let questions;
    
    if (topic === 'random') {
      // Get random questions from all topics
      questions = await getRandomQuestions(10);
    } else {
      // Get questions for specific topic
      questions = await getQuestionsByTopic(topic);
    }
    
    return NextResponse.json({ 
      questions,
      success: true 
    });
    
  } catch (error) {
    console.error('Error fetching questions:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch questions',
        success: false 
      }, 
      { status: 500 }
    );
  }
}
