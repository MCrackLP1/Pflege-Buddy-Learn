// Script zum Randomisieren der Antwortoptionen für alle MC-Fragen
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://tkqofzynpyvmivmxhoef.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrcW9memlueXB2bWl2bXhob2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NDU0ODUsImV4cCI6MjA1MjAyMTQ4NX0.8B8gO6iZKXh8q7W5V0gO6iZKXh8q7W5V0gO6iZKXh8q7W5V0g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function randomizeChoices() {
  console.log('🔄 Starte Randomisierung der Antwortoptionen...');

  // Alle MC-Fragen mit ihren Antwortoptionen abrufen
  const { data: mcQuestions, error: questionsError } = await supabase
    .from('questions')
    .select('id, stem')
    .eq('type', 'mc');

  if (questionsError) {
    console.error('❌ Fehler beim Abrufen der Fragen:', questionsError);
    return;
  }

  console.log(`📊 Gefunden: ${mcQuestions.length} MC-Fragen`);

  let successCount = 0;
  let errorCount = 0;

  for (const question of mcQuestions) {
    try {
      // Antwortoptionen für diese Frage abrufen
      const { data: choices, error: choicesError } = await supabase
        .from('choices')
        .select('id, label, is_correct')
        .eq('question_id', question.id);

      if (choicesError) {
        console.error(`❌ Fehler beim Abrufen der Antworten für Frage ${question.id}:`, choicesError);
        errorCount++;
        continue;
      }

      if (choices.length === 0) {
        console.warn(`⚠️  Frage ${question.id} hat keine Antwortoptionen`);
        continue;
      }

      // Zufällige Reihenfolge erstellen
      const shuffledIndices = Array.from({ length: choices.length }, (_, i) => i).sort(() => Math.random() - 0.5);

      // Antwortoptionen mit neuer display_order aktualisieren
      for (let i = 0; i < choices.length; i++) {
        const choice = choices[shuffledIndices[i]];
        const displayOrder = i + 1; // 1, 2, 3, 4

        const { error: updateError } = await supabase
          .from('choices')
          .update({ display_order: displayOrder })
          .eq('id', choice.id);

        if (updateError) {
          console.error(`❌ Fehler beim Aktualisieren der Antwort ${choice.id}:`, updateError);
          errorCount++;
        }
      }

      successCount++;
      console.log(`✅ Frage "${question.stem.substring(0, 50)}...": Antworten randomisiert`);

    } catch (err) {
      console.error(`❌ Unerwarteter Fehler bei Frage ${question.id}:`, err);
      errorCount++;
    }
  }

  console.log('\n🎉 Randomisierung abgeschlossen!');
  console.log(`📈 Erfolgreich: ${successCount} Fragen`);
  console.log(`❌ Fehler: ${errorCount} Fragen`);
  console.log(`📊 Gesamt: ${successCount + errorCount} Fragen`);
}

randomizeChoices().catch(console.error);

