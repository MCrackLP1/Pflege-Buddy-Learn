#!/usr/bin/env tsx

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import OpenAI from 'openai';

interface SourceData {
  url: string;
  title: string;
  published_date: string;
  description?: string;
}

interface TopicSources {
  topic: string;
  sources: SourceData[];
  updated_at: string;
}

interface GeneratedChoice {
  label: string;
  is_correct: boolean;
}

interface GeneratedQuestion {
  type: 'mc' | 'tf';
  stem: string;
  explanation_md: string;
  difficulty: number; // 1-5
  hints: string[];
  choices?: GeneratedChoice[];
  tf_correct_answer?: boolean;
  citations: {
    url: string;
    title: string;
    published_date: string;
  }[];
}

interface TopicQuestions {
  topic: string;
  questions: GeneratedQuestion[];
  generated_at: string;
}

const QUESTION_PROMPTS = {
  mc: `Create a multiple choice nursing knowledge question based on the provided sources. 
Requirements:
- Question in German language
- 4 answer choices, exactly 1 correct
- Professional nursing context
- Difficulty 1-5 (1=basic, 5=advanced)
- 2-3 progressive hints (don't reveal answer directly)
- Clear explanation referencing source material
- Citations must match provided sources

Return as JSON with structure:
{
  "type": "mc",
  "stem": "Question text",
  "explanation_md": "Why this answer is correct",
  "difficulty": 3,
  "hints": ["hint1", "hint2"],
  "choices": [
    {"label": "Choice A", "is_correct": false},
    {"label": "Choice B", "is_correct": true},
    {"label": "Choice C", "is_correct": false},
    {"label": "Choice D", "is_correct": false}
  ],
  "citations": [{"url": "source_url", "title": "source_title", "published_date": "2024-01-15"}]
}`,

  tf: `Create a true/false nursing knowledge question based on the provided sources.
Requirements:
- Question in German language
- Clear true or false statement
- Professional nursing context  
- Difficulty 1-5 (1=basic, 5=advanced)
- 1-2 progressive hints (don't reveal answer directly)
- Clear explanation referencing source material
- Citations must match provided sources

Return as JSON with structure:
{
  "type": "tf",
  "stem": "Statement to evaluate as true/false",
  "explanation_md": "Why this statement is true/false",
  "difficulty": 2,
  "hints": ["hint1"],
  "tf_correct_answer": true,
  "citations": [{"url": "source_url", "title": "source_title", "published_date": "2024-01-15"}]
}`
};

async function generateQuestions(topic?: string, count: number = 10): Promise<void> {
  console.log('🤖 Generating nursing knowledge questions...');
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  No OPENAI_API_KEY found. Skipping AI generation.');
    console.log('   Set OPENAI_API_KEY environment variable to enable AI question generation.');
    return;
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Ensure directories exist
  const rawDir = join(process.cwd(), 'data', 'raw');
  const seedDir = join(process.cwd(), 'data', 'seed');
  mkdirSync(seedDir, { recursive: true });

  // Get available topics
  const availableTopics = topic ? [topic] : readdirSync(rawDir)
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace('.json', ''));

  if (availableTopics.length === 0) {
    console.error('❌ No source files found. Run discover_sources.ts first.');
    return;
  }

  for (const topicKey of availableTopics) {
    console.log(`\n📚 Processing topic: ${topicKey}`);
    
    try {
      // Load source data
      const sourceFile = join(rawDir, `${topicKey}.json`);
      const topicSources: TopicSources = JSON.parse(readFileSync(sourceFile, 'utf-8'));
      
      const questions: GeneratedQuestion[] = [];
      const questionsPerType = Math.ceil(count / 2);

      // Generate MC questions
      console.log(`   Generating ${questionsPerType} multiple choice questions...`);
      for (let i = 0; i < questionsPerType; i++) {
        try {
          const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: QUESTION_PROMPTS.mc
              },
              {
                role: 'user',
                content: `Topic: ${topicKey}\nSources: ${JSON.stringify(topicSources.sources, null, 2)}`
              }
            ],
            temperature: 0.7,
            max_tokens: 1000,
          });

          const content = response.choices[0]?.message?.content;
          if (content) {
            const question = JSON.parse(content) as GeneratedQuestion;
            questions.push(question);
            console.log(`   ✓ Generated MC question ${i + 1}`);
          }
        } catch (error) {
          console.error(`   ❌ Failed to generate MC question ${i + 1}:`, error);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Generate TF questions
      console.log(`   Generating ${questionsPerType} true/false questions...`);
      for (let i = 0; i < questionsPerType; i++) {
        try {
          const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: QUESTION_PROMPTS.tf
              },
              {
                role: 'user',
                content: `Topic: ${topicKey}\nSources: ${JSON.stringify(topicSources.sources, null, 2)}`
              }
            ],
            temperature: 0.7,
            max_tokens: 800,
          });

          const content = response.choices[0]?.message?.content;
          if (content) {
            const question = JSON.parse(content) as GeneratedQuestion;
            questions.push(question);
            console.log(`   ✓ Generated TF question ${i + 1}`);
          }
        } catch (error) {
          console.error(`   ❌ Failed to generate TF question ${i + 1}:`, error);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Save generated questions
      const topicQuestions: TopicQuestions = {
        topic: topicKey,
        questions,
        generated_at: new Date().toISOString(),
      };

      const outputFile = join(seedDir, `${topicKey}.json`);
      writeFileSync(outputFile, JSON.stringify(topicQuestions, null, 2));
      
      console.log(`✅ Generated ${questions.length} questions for '${topicKey}': ${outputFile}`);
      
    } catch (error) {
      console.error(`❌ Failed to process topic '${topicKey}':`, error);
    }
  }

  console.log('\n🎉 Question generation completed!');
}

// CLI interface
const args = process.argv.slice(2);
const topicArg = args.find(arg => arg.startsWith('--topic='))?.split('=')[1];
const countArg = parseInt(args.find(arg => arg.startsWith('--count='))?.split('=')[1] || '10');

if (require.main === module) {
  generateQuestions(topicArg, countArg).catch(console.error);
}

export { generateQuestions };
