import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface QuestionAnswer {
  question: string;
  answer: string;
  topic: string;
  category: string;
  url: string;
}

interface DatabaseQuestion {
  stem: string;
  topic_slug: string;
}

async function deduplicateQuestions() {
  try {
    console.log('Lade neue Fragen aus der JSON-Datei...');

    // Lade die neue JSON-Datei
    const jsonPath = join(process.cwd(), 'COMPLETE_examensfragen_database.json');
    const rawData = readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(rawData);

    const newQuestions: QuestionAnswer[] = data.questions_answers;
    console.log(`Gefunden: ${newQuestions.length} Fragen in der neuen Datei`);

    console.log('Lade vorhandene Fragen aus Supabase...');

    // Lade vorhandene Fragen aus Supabase
    const { data: existingQuestions, error } = await supabase
      .from('questions')
      .select(`
        stem,
        topics!inner (
          slug
        )
      `);

    if (error) {
      throw new Error(`Supabase Fehler: ${error.message}`);
    }

    console.log(`Gefunden: ${existingQuestions.length} Fragen in der Datenbank`);

    // Erstelle eine Map für schnellen Lookup der vorhandenen Fragen
    const existingMap = new Map<string, boolean>();
    existingQuestions.forEach((dbQ: any) => {
      const key = `${dbQ.stem.trim().toLowerCase()}|${dbQ.topics.slug}`;
      existingMap.set(key, true);
    });

    console.log(`Erstellt Map mit ${existingMap.size} einzigartigen Frage-Topic Kombinationen`);

    // Filtere Duplikate heraus
    let duplicateCount = 0;
    const uniqueQuestions: QuestionAnswer[] = [];

    for (const question of newQuestions) {
      const key = `${question.question.trim().toLowerCase()}|${question.topic}`;

      if (existingMap.has(key)) {
        duplicateCount++;
        console.log(`Duplikat gefunden: "${question.question.substring(0, 50)}..."`);
      } else {
        uniqueQuestions.push(question);
      }
    }

    console.log(`\nErgebnisse:`);
    console.log(`- Ursprüngliche Fragen: ${newQuestions.length}`);
    console.log(`- Duplikate entfernt: ${duplicateCount}`);
    console.log(`- Einzigartige Fragen: ${uniqueQuestions.length}`);

    // Erstelle bereinigte JSON-Datei
    const cleanedData = {
      ...data,
      questions_answers: uniqueQuestions,
      metadata: {
        ...data.metadata,
        total_questions: uniqueQuestions.length,
        duplicates_removed: duplicateCount,
        processed_at: new Date().toISOString(),
        original_count: newQuestions.length
      }
    };

    const outputPath = join(process.cwd(), 'COMPLETE_examensfragen_database_cleaned.json');
    writeFileSync(outputPath, JSON.stringify(cleanedData, null, 2), 'utf-8');

    console.log(`\nBereinigte Datei gespeichert unter: ${outputPath}`);
    console.log('Verarbeitung abgeschlossen!');

  } catch (error) {
    console.error('Fehler bei der Verarbeitung:', error);
    process.exit(1);
  }
}

// Führe das Script aus
deduplicateQuestions();
