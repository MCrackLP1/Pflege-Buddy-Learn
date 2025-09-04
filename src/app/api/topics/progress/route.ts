import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get topics with question counts and user progress
    const { data: topicsData, error: topicsError } = await supabase
      .from('topics')
      .select(`
        id,
        slug,
        title,
        description,
        questions (id)
      `);

    if (topicsError) throw topicsError;

    // Get user attempts for progress calculation
    const { data: attempts, error: attemptsError } = await supabase
      .from('attempts')
      .select(`
        question_id,
        is_correct,
        questions (
          topic_id
        )
      `)
      .eq('user_id', user.id);

    if (attemptsError) throw attemptsError;

    // Calculate progress for each topic
    const topicsWithProgress = (topicsData || []).map(topic => {
      const totalQuestions = topic.questions?.length || 0;
      
      // Get user attempts for this topic
      const topicAttempts = (attempts || []).filter((attempt: any) => 
        attempt.questions?.topic_id === topic.id
      );

      // Get unique correct questions (user might have attempted same question multiple times)
      const uniqueCorrectQuestions = new Set(
        topicAttempts
          .filter((a: any) => a.is_correct)
          .map((a: any) => a.question_id)
      );

      const completedQuestions = uniqueCorrectQuestions.size;

      return {
        id: topic.id,
        slug: topic.slug,
        title: topic.title,
        description: topic.description,
        totalQuestions,
        completedQuestions,
        progress: totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0
      };
    });

    return NextResponse.json({
      topics: topicsWithProgress,
      success: true
    });

  } catch (error) {
    console.error('Error fetching topic progress:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch topic progress' 
    }, { status: 500 });
  }
}
