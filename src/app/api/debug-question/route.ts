import { NextRequest, NextResponse } from 'next/server';
import { getQuestionsByTopic } from '@/lib/api/questions';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get('topic') || 'medikamente';
    
    console.log('🔍 Debug: Loading questions for topic:', topic);
    
    const questions = await getQuestionsByTopic(topic);
    
    console.log('🔍 Debug: Loaded questions:', questions.length);
    
    // Find the problematic question
    const medQuestion = questions.find(q => q.stem.includes('Medikamentengabe') && q.stem.includes('Priorität'));
    
    if (medQuestion) {
      console.log('🔍 Debug: Found med question:', {
        id: medQuestion.id,
        stem: medQuestion.stem.slice(0, 50),
        type: medQuestion.type,
        tfCorrectAnswer: medQuestion.tfCorrectAnswer,
        choices: medQuestion.choices.map(c => ({
          id: c.id,
          label: c.label,
          isCorrect: c.isCorrect
        }))
      });
    }
    
    return NextResponse.json({ 
      topic,
      questionCount: questions.length,
      medQuestion: medQuestion || 'not found',
      allQuestions: questions.map(q => ({
        id: q.id,
        stem: q.stem.slice(0, 60),
        type: q.type,
        choiceCount: q.choices.length,
        correctChoice: q.choices.find(c => c.isCorrect)?.label || 'N/A'
      }))
    });
    
  } catch (error) {
    console.error('Debug API Error:', error);
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}
