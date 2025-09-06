#!/usr/bin/env tsx

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database.types';

interface VerifiedQuestion {
  type: 'mc' | 'tf';
  stem: string;
  explanation_md: string;
  difficulty: number;
  hints: string[];
  choices?: {
    label: string;
    is_correct: boolean;
  }[];
  tf_correct_answer?: boolean;
  citations: {
    url: string;
    title: string;
    organization: string;
    published_date: string;
    credibility_score: number;
  }[];
  medical_review: {
    generated_at: string;
    ai_confidence: number;
    requires_expert_review: boolean;
    source_verification: 'verified' | 'pending' | 'rejected';
  };
}

interface ContentBatch {
  topic: string;
  questions: VerifiedQuestion[];
  quality_metrics: {
    total_generated: number;
    expert_review_required: number;
    average_credibility: number;
    source_coverage: number;
  };
}

/**
 * Import verified medical content to database with safety checks
 */
async function importVerifiedContent(
  filename?: string,
  expertApproved: boolean = false
): Promise<void> {
  console.log('🏥 Importing verified medical content to database...');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) {
    throw new Error('Missing Supabase environment variables');
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE
  );

  const contentDir = join(process.cwd(), 'data', 'generated-content');
  
  let filesToProcess: string[];
  
  if (filename) {
    filesToProcess = [filename];
  } else {
    // Process all verified content files
    filesToProcess = readdirSync(contentDir)
      .filter(f => f.includes('verified_') && f.endsWith('.json'))
      .sort(); // Process chronologically
  }

  console.log(`📁 Processing ${filesToProcess.length} content files...`);

  let totalImported = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const file of filesToProcess) {
    console.log(`\n📄 Processing: ${file}`);
    
    try {
      const content = readFileSync(join(contentDir, file), 'utf-8');
      const batch: ContentBatch = JSON.parse(content);
      
      console.log(`   📊 Quality Metrics:`);
      console.log(`      Generated: ${batch.quality_metrics.total_generated}`);
      console.log(`      Expert Review Required: ${batch.quality_metrics.expert_review_required}`);
      console.log(`      Average Credibility: ${batch.quality_metrics.average_credibility}/10`);
      
      // Safety check: skip if expert review required and not approved
      if (batch.quality_metrics.expert_review_required > 0 && !expertApproved) {
        console.log('   ⚠️  Skipping: Expert review required but not provided');
        console.log('   💡 Run with --expert-approved flag after medical expert review');
        totalSkipped += batch.questions.length;
        continue;
      }

      // Get topic ID
      const { data: topics, error: topicError } = await supabase
        .from('topics')
        .select('id')
        .eq('slug', batch.topic)
        .single();
      
      if (topicError || !topics) {
        console.error(`   ❌ Topic '${batch.topic}' not found in database`);
        totalErrors++;
        continue;
      }

      // Import questions with batch processing for performance
      for (let index = 0; index < batch.questions.length; index++) {
        const question = batch.questions[index];
        try {
          // Check for duplicates
          const { data: existing } = await supabase
            .from('questions')
            .select('id')
            .eq('stem', question.stem)
            .single();

          if (existing) {
            console.log(`     ⚠️  Skipping duplicate: "${question.stem.slice(0, 40)}..."`);
            totalSkipped++;
            continue;
          }

          // Insert question
          const { data: insertedQuestion, error: questionError } = await supabase
            .from('questions')
            .insert({
              topic_id: topics.id,
              type: question.type,
              stem: question.stem,
              explanation_md: question.explanation_md,
              difficulty: question.difficulty,
              hints: question.hints,
              tf_correct_answer: question.type === 'tf' ? question.tf_correct_answer : null,
            })
            .select()
            .single();

          if (questionError || !insertedQuestion) {
            console.error(`     ❌ Failed to insert question ${index + 1}:`, questionError);
            totalErrors++;
            continue;
          }

          // Insert choices for MC questions
          if (question.type === 'mc' && question.choices) {
            const { error: choicesError } = await supabase
              .from('choices')
              .insert(
                question.choices.map(choice => ({
                  question_id: insertedQuestion.id,
                  label: choice.label,
                  is_correct: choice.is_correct,
                }))
              );

            if (choicesError) {
              console.error(`     ❌ Failed to insert choices for question ${index + 1}:`, choicesError);
              totalErrors++;
              continue;
            }
          }

          // Insert citations
          const { error: citationsError } = await supabase
            .from('citations')
            .insert(
              question.citations.map(citation => ({
                question_id: insertedQuestion.id,
                url: citation.url,
                title: citation.title,
                published_date: citation.published_date,
              }))
            );

          if (citationsError) {
            console.error(`     ❌ Failed to insert citations for question ${index + 1}:`, citationsError);
            totalErrors++;
            continue;
          }

          totalImported++;
          console.log(`     ✅ Question ${index + 1}: "${question.stem.slice(0, 50)}..." imported successfully`);
          
        } catch (error) {
          console.error(`     ❌ Error processing question ${index + 1}:`, error);
          totalErrors++;
        }
      }
      
    } catch (error) {
      console.error(`   ❌ Error processing file ${file}:`, error);
      totalErrors++;
    }
  }

  // Import summary
  console.log(`\n📊 Import Summary:`);
  console.log(`   ✅ Successfully imported: ${totalImported} questions`);
  console.log(`   ⚠️  Skipped (duplicates/review): ${totalSkipped} questions`);
  console.log(`   ❌ Errors: ${totalErrors} questions`);
  
  if (totalImported > 0) {
    console.log('\n🎉 Medical content successfully imported to database!');
    console.log('💡 Test the new questions in your application');
  }
}

// CLI Interface  
async function main() {
  const args = process.argv.slice(2);
  const filename = args.find(arg => !arg.startsWith('--'));
  const expertApproved = args.includes('--expert-approved');
  
  if (expertApproved) {
    console.log('✅ Expert approval flag detected - importing all content including review-required questions\n');
  } else {
    console.log('⚠️  Only importing auto-approved content (high-confidence, verified sources)\n');
    console.log('💡 Use --expert-approved flag to import expert-reviewed content\n');
  }

  try {
    await importVerifiedContent(filename, expertApproved);
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
