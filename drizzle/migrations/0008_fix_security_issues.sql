-- Fix security issues identified by Supabase advisors
-- This migration addresses multiple security and performance issues

-- 1. Fix mutable search_path security issue in functions
CREATE OR REPLACE FUNCTION insert_question_safely(
    p_topic_id uuid,
    p_type question_type,
    p_stem text,
    p_explanation_md text,
    p_source_url text,
    p_source_title text,
    p_difficulty integer,
    p_hints text[],
    p_tf_correct_answer boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    existing_question_id UUID;
    new_question_id UUID;
BEGIN
    -- Prüfe, ob Frage bereits existiert
    IF p_type = 'mc' THEN
        SELECT id INTO existing_question_id
        FROM questions
        WHERE stem = p_stem AND topic_id = p_topic_id;
    ELSE -- True/False
        SELECT id INTO existing_question_id
        FROM questions
        WHERE stem = p_stem AND topic_id = p_topic_id AND tf_correct_answer = p_tf_correct_answer;
    END IF;

    -- Wenn Duplikat gefunden, gib Fehler zurück
    IF existing_question_id IS NOT NULL THEN
        RAISE EXCEPTION 'DUPLICATE_QUESTION: Frage bereits vorhanden in dieser Kategorie (ID: %)', existing_question_id;
    END IF;

    -- Andernfalls füge neue Frage ein (konvertiere hints zu JSONB)
    INSERT INTO questions (
        topic_id, type, stem, explanation_md, source_url,
        source_title, difficulty, hints, tf_correct_answer
    ) VALUES (
        p_topic_id, p_type, p_stem, p_explanation_md, p_source_url,
        p_source_title, p_difficulty, to_jsonb(p_hints), p_tf_correct_answer
    ) RETURNING id INTO new_question_id;

    RETURN new_question_id;
END;
$$;

-- Fix insert_mc_question_safely function
CREATE OR REPLACE FUNCTION insert_mc_question_safely(
    p_topic_id uuid,
    p_stem text,
    p_explanation_md text,
    p_choices jsonb,
    p_source_url text,
    p_source_title text,
    p_difficulty integer,
    p_hints text[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_question_id UUID;
    choice_record JSONB;
BEGIN
    -- Verwende die Hauptfunktion für die Frage
    SELECT insert_question_safely(
        p_topic_id, 'mc', p_stem, p_explanation_md,
        p_source_url, p_source_title, p_difficulty, p_hints, NULL
    ) INTO new_question_id;

    -- Füge die Antwortoptionen hinzu
    FOR choice_record IN SELECT * FROM jsonb_array_elements(p_choices)
    LOOP
        INSERT INTO choices (question_id, label, is_correct)
        VALUES (
            new_question_id,
            choice_record->>'label',
            (choice_record->>'isCorrect')::boolean
        );
    END LOOP;

    RETURN new_question_id;
END;
$$;

-- 2. Enable RLS on xp_milestones table
ALTER TABLE xp_milestones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for xp_milestones (read-only for all authenticated users)
CREATE POLICY "xp_milestones_public_read" ON xp_milestones
    FOR SELECT USING (true);

-- 3. Optimize RLS policies for better performance
-- Fix ranked_sessions policy
DROP POLICY IF EXISTS "Users can manage own ranked sessions" ON ranked_sessions;
CREATE POLICY "Users can manage own ranked sessions" ON ranked_sessions
    FOR ALL USING (user_id = (SELECT auth.uid()));

-- Fix ranked_attempts policy
DROP POLICY IF EXISTS "Users can manage own ranked attempts" ON ranked_attempts;
CREATE POLICY "Users can manage own ranked attempts" ON ranked_attempts
    FOR ALL USING (user_id = (SELECT auth.uid()));

-- Fix ranked_leaderboard policy
DROP POLICY IF EXISTS "Users can manage own leaderboard entries" ON ranked_leaderboard;
CREATE POLICY "Users can manage own leaderboard entries" ON ranked_leaderboard
    FOR ALL USING (user_id = (SELECT auth.uid()));

-- 4. Add missing foreign key index for better performance
CREATE INDEX IF NOT EXISTS idx_ranked_leaderboard_session_id ON ranked_leaderboard(session_id);

-- 5. Remove unused indexes to improve performance
DROP INDEX IF EXISTS idx_ranked_sessions_user_id;
DROP INDEX IF EXISTS idx_ranked_leaderboard_score;
DROP INDEX IF EXISTS idx_ranked_sessions_active;
DROP INDEX IF EXISTS idx_ranked_attempts_session_id;
DROP INDEX IF EXISTS idx_ranked_attempts_question_id;
DROP INDEX IF EXISTS idx_ranked_leaderboard_user_id;
DROP INDEX IF EXISTS idx_ranked_leaderboard_rank;
DROP INDEX IF EXISTS idx_user_milestone_achievements_milestone_id;
DROP INDEX IF EXISTS idx_attempts_user_id_created_at;
DROP INDEX IF EXISTS idx_user_progress_xp;
DROP INDEX IF EXISTS idx_user_progress_streak_days;
DROP INDEX IF EXISTS idx_questions_topic_id;
DROP INDEX IF EXISTS idx_attempts_user_id;
DROP INDEX IF EXISTS idx_attempts_question_id;
DROP INDEX IF EXISTS idx_attempts_user_correct;
DROP INDEX IF EXISTS idx_topics_slug;
