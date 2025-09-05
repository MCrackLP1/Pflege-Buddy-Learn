import { NextRequest, NextResponse } from 'next/server';
import { getQuestionsByTopic, getRandomQuestions } from '@/lib/api/questions';
import type { ApiResponse } from '@/types/api.types';

// Add caching headers for better performance
const CACHE_MAX_AGE = 300; // 5 minutes

export async function GET(
  req: NextRequest,
  { params }: { params: { topic: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    // Extract topic from params and ignore cache-busting parameters
    let topic = params.topic;

    // Remove cache-busting parameter if present (e.g., "random?_t=123" -> "random")
    if (topic.includes('?')) {
      topic = topic.split('?')[0];
    }

    console.log('Processing topic:', topic);
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    let questions;
    
    if (topic === 'random') {
      // Get random questions from all topics with pagination
      questions = await getRandomQuestions(limit);
    } else {
      // Get questions for specific topic with pagination
      questions = await getQuestionsByTopic(topic, limit);
    }
    
    const response = NextResponse.json({
      questions,
      count: questions.length,
      success: true
    });

    // Disable caching for random questions to ensure true randomness
    if (topic === 'random') {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
    } else {
      // Add caching headers for performance on specific topics
      response.headers.set('Cache-Control', `public, max-age=${CACHE_MAX_AGE}`);
      response.headers.set('CDN-Cache-Control', `max-age=${CACHE_MAX_AGE}`);
    }

    return response;
    
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