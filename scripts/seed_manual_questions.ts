#!/usr/bin/env tsx

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { db } from '../src/lib/db';
import { topics, questions, choices, citations } from '../src/lib/db/schema';

interface ManualChoice {
  label: string;
  is_correct: boolean;
}

interface ManualQuestion {
  type: 'mc' | 'tf';
  stem: string;
  explanation_md: string;
  difficulty: number;
  hints: string[];
  choices?: ManualChoice[];
  tf_correct_answer?: boolean;
  citations: {
    url: string;
    title: string;
    published_date: string;
  }[];
}

interface TopicQuestions {
  topic: string;
  questions: ManualQuestion[];
}

async function seedManualQuestions() {
  console.log('🌱 Seeding manual medical questions...');
  
  try {
    // First, ensure we have topics
    const topicData = [
      { slug: 'grundlagen', title: 'Pflegegrundlagen', description: 'Grundlegende Prinzipien der professionellen Pflege' },
      { slug: 'hygiene', title: 'Hygiene & Infektionsschutz', description: 'Hygienemaßnahmen und Infektionsprävention' },
      { slug: 'medikamente', title: 'Medikamentengabe', description: 'Sichere Arzneimittelverabreichung' },
      { slug: 'dokumentation', title: 'Pflegedokumentation', description: 'Rechtssichere Dokumentation' }
    ];

    // Insert or update topics
    for (const topicInfo of topicData) {
      await db.insert(topics)
        .values(topicInfo)
        .onConflictDoUpdate({
          target: topics.slug,
          set: {
            title: topicInfo.title,
            description: topicInfo.description
          }
        });
      console.log(`✓ Topic: ${topicInfo.title}`);
    }

    // Read manual question files
    const questionsDir = 'data/questions';
    const questionFiles = readdirSync(questionsDir).filter(f => f.endsWith('_manual.json'));
    
    for (const file of questionFiles) {
      console.log(`\n📝 Processing ${file}...`);
      
      const content = readFileSync(join(questionsDir, file), 'utf-8');
      const topicQuestions: TopicQuestions = JSON.parse(content);
      
      // Get topic ID
      const [topicRecord] = await db
        .select()
        .from(topics)
        .where(eq(topics.slug, topicQuestions.topic))
        .limit(1);
        
      if (!topicRecord) {
        console.error(`❌ Topic '${topicQuestions.topic}' not found`);
        continue;
      }

      // Insert questions
      for (const [index, questionData] of topicQuestions.questions.entries()) {
        try {
          // Check for duplicates by stem
          const existingQuestion = await db
            .select()
            .from(questions)
            .where(eq(questions.stem, questionData.stem))
            .limit(1);
            
          if (existingQuestion.length > 0) {
            console.log(`   ⚠️  Skipping duplicate: "${questionData.stem.slice(0, 50)}..."`);
            continue;
          }

          // Insert question
          const [insertedQuestion] = await db
            .insert(questions)
            .values({
              topicId: topicRecord.id,
              type: questionData.type,
              stem: questionData.stem,
              explanationMd: questionData.explanation_md,
              difficulty: questionData.difficulty,
              hints: questionData.hints,
              tfCorrectAnswer: questionData.type === 'tf' ? questionData.tf_correct_answer : null,
            })
            .returning();

          // Insert choices for MC questions
          if (questionData.type === 'mc' && questionData.choices) {
            for (const choiceData of questionData.choices) {
              await db.insert(choices).values({
                questionId: insertedQuestion.id,
                label: choiceData.label,
                isCorrect: choiceData.is_correct,
              });
            }
            console.log(`   ✓ Added ${questionData.choices.length} choices`);
          }

          // Insert citations
          for (const citationData of questionData.citations) {
            await db.insert(citations).values({
              questionId: insertedQuestion.id,
              url: citationData.url,
              title: citationData.title,
              publishedDate: citationData.published_date,
            });
          }

          console.log(`   ✓ Question ${index + 1}: "${questionData.stem.slice(0, 50)}..." (${questionData.type.toUpperCase()})`);
          
        } catch (error) {
          console.error(`   ❌ Failed to insert question ${index + 1}:`, error);
        }
      }
    }

    console.log('\n🎉 Manual question seeding completed!');
    
    // Show summary
    const totalQuestions = await db.select().from(questions);
    const totalTopics = await db.select().from(topics);
    
    console.log(`\n📊 Database Summary:`);
    console.log(`   Topics: ${totalTopics.length}`);
    console.log(`   Questions: ${totalQuestions.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding manual questions:', error);
    process.exit(1);
  }
}

// Import eq from drizzle-orm
import { eq } from 'drizzle-orm';

seedManualQuestions();
