#!/usr/bin/env tsx

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { db } from '../src/lib/db';
import { topics, questions, choices, citations } from '../src/lib/db/schema';

interface GeneratedChoice {
  label: string;
  is_correct: boolean;
}

interface GeneratedQuestion {
  type: 'mc' | 'tf';
  stem: string;
  explanation_md: string;
  difficulty: number;
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

// Fallback manual seed data
const MANUAL_TOPICS = [
  {
    slug: 'grundlagen',
    title: 'Pflegegrundlagen',
    description: 'Basiswissen für die professionelle Pflege'
  },
  {
    slug: 'hygiene',
    title: 'Hygiene & Infektionsschutz', 
    description: 'Hygienemaßnahmen und Infektionsprävention'
  },
  {
    slug: 'medikamente',
    title: 'Medikamentengabe',
    description: 'Sichere Arzneimittelverabreichung'
  },
  {
    slug: 'dokumentation',
    title: 'Pflegedokumentation',
    description: 'Rechtssichere Dokumentation'
  }
];

const MANUAL_QUESTIONS: GeneratedQuestion[] = [
  {
    type: 'mc',
    stem: 'Was ist die normale Körpertemperatur eines gesunden Erwachsenen?',
    explanation_md: 'Die normale Körpertemperatur liegt zwischen 36,1°C und 37,2°C. Diese wird üblicherweise rektal gemessen.',
    difficulty: 2,
    hints: ['Die Temperatur wird meist rektal gemessen', 'Normal liegt zwischen 36-37°C'],
    choices: [
      { label: '35,0°C - 36,0°C', is_correct: false },
      { label: '36,1°C - 37,2°C', is_correct: true },
      { label: '37,5°C - 38,0°C', is_correct: false },
      { label: '38,1°C - 39,0°C', is_correct: false },
    ],
    citations: [
      {
        url: 'https://www.rki.de/DE/Content/InfAZ/F/Fieber/Fieber_node.html',
        title: 'RKI - Fieber',
        published_date: '2024-01-15'
      }
    ]
  },
  {
    type: 'tf',
    stem: 'Händedesinfektion sollte mindestens 30 Sekunden dauern.',
    explanation_md: 'Händedesinfektion sollte mindestens 30 Sekunden durchgeführt werden, um eine effektive Keimreduktion zu erreichen.',
    difficulty: 1,
    hints: ['WHO empfiehlt mindestens 20-30 Sekunden'],
    tf_correct_answer: true,
    citations: [
      {
        url: 'https://www.who.int/gpsc/5may/Hand_Hygiene_Why_How_and_When_Brochure.pdf',
        title: 'WHO Hand Hygiene Guidelines',
        published_date: '2024-01-12'
      }
    ]
  },
  {
    type: 'mc',
    stem: 'Welche Maßnahme ist bei der Medikamentengabe am wichtigsten?',
    explanation_md: 'Die Überprüfung der Patientenidentität ist essentiell, um Verwechslungen zu vermeiden.',
    difficulty: 3,
    hints: ['Verwechslungsgefahr vermeiden', 'Identitätsprüfung ist entscheidend'],
    choices: [
      { label: 'Schnelle Verabreichung', is_correct: false },
      { label: 'Patientenidentität prüfen', is_correct: true },
      { label: 'Dosis verdoppeln bei Unsicherheit', is_correct: false },
      { label: 'Ohne Dokumentation geben', is_correct: false },
    ],
    citations: [
      {
        url: 'https://www.bfarm.de/DE/Arzneimittel/Pharmakovigilanz/_node.html',
        title: 'BfArM - Arzneimittelsicherheit',
        published_date: '2024-01-18'
      }
    ]
  },
  {
    type: 'tf',
    stem: 'Pflegedokumentation muss immer handschriftlich erfolgen.',
    explanation_md: 'Pflegedokumentation kann digital oder handschriftlich erfolgen, wichtig ist die Rechtssicherheit.',
    difficulty: 2,
    hints: ['Digitale Dokumentation ist zulässig'],
    tf_correct_answer: false,
    citations: [
      {
        url: 'https://www.awmf.org/leitlinien/detail/ll/157-002.html',
        title: 'AWMF - Pflegedokumentation',
        published_date: '2024-01-16'
      }
    ]
  }
];

async function seedDatabase(): Promise<void> {
  console.log('🌱 Seeding database with questions...');

  try {
    // Insert topics
    console.log('📝 Inserting topics...');
    for (const topic of MANUAL_TOPICS) {
      await db.insert(topics).values(topic).onConflictDoNothing();
    }
    console.log(`✅ Inserted ${MANUAL_TOPICS.length} topics`);

    // Get topic IDs for reference
    const topicRecords = await db.select().from(topics);
    const topicMap = new Map(topicRecords.map(t => [t.slug, t.id]));

    // Try to load generated questions, fall back to manual
    const seedDir = join(process.cwd(), 'data', 'seed');
    let allQuestions: Array<{ topicSlug: string; question: GeneratedQuestion }> = [];

    try {
      const seedFiles = readdirSync(seedDir).filter(f => f.endsWith('.json'));
      
      if (seedFiles.length > 0) {
        console.log('📚 Loading AI-generated questions...');
        
        for (const file of seedFiles) {
          const topicQuestions: TopicQuestions = JSON.parse(
            readFileSync(join(seedDir, file), 'utf-8')
          );
          
          topicQuestions.questions.forEach(question => {
            allQuestions.push({
              topicSlug: topicQuestions.topic,
              question
            });
          });
        }
        
        console.log(`✅ Loaded ${allQuestions.length} AI-generated questions`);
      } else {
        throw new Error('No generated questions found');
      }
    } catch (error) {
      console.log('⚠️  Using manual fallback questions (no AI-generated questions found)');
      
      // Use manual questions with topic assignment
      MANUAL_QUESTIONS.forEach((question, index) => {
        const topicIndex = index % MANUAL_TOPICS.length;
        allQuestions.push({
          topicSlug: MANUAL_TOPICS[topicIndex].slug,
          question
        });
      });
    }

    // Insert questions
    console.log('❓ Inserting questions...');
    for (const { topicSlug, question } of allQuestions) {
      const topicId = topicMap.get(topicSlug);
      if (!topicId) {
        console.warn(`⚠️  Topic '${topicSlug}' not found, skipping question`);
        continue;
      }

      const [insertedQuestion] = await db.insert(questions).values({
        topicId,
        type: question.type,
        stem: question.stem,
        explanationMd: question.explanation_md,
        sourceUrl: question.citations[0]?.url,
        sourceTitle: question.citations[0]?.title,
        sourceDate: question.citations[0]?.published_date || null,
        difficulty: question.difficulty,
        hints: question.hints,
      }).returning({ id: questions.id });

      // Insert choices for MC questions
      if (question.type === 'mc' && question.choices) {
        await db.insert(choices).values(
          question.choices.map(choice => ({
            questionId: insertedQuestion.id,
            label: choice.label,
            isCorrect: choice.is_correct,
          }))
        );
      }

      // Insert citations
      for (const citation of question.citations) {
        await db.insert(citations).values({
          questionId: insertedQuestion.id,
          url: citation.url,
          title: citation.title,
          publishedDate: citation.published_date || null,
        });
      }
    }

    console.log(`✅ Inserted ${allQuestions.length} questions with choices and citations`);
    console.log('🎉 Database seeding completed!');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// CLI interface
if (require.main === module) {
  seedDatabase().catch(console.error);
}

export { seedDatabase };
