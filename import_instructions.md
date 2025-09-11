# 📋 **Anweisungen: Fragen-Import Workflow**

## 🎯 **Überblick**
Dieses Dokument beschreibt den systematischen Prozess für den Import von Fragen aus der `COMPLETE_examensfragen_database_cleaned.json` in die Supabase-Datenbank der PflegeBuddy Learn App.

## 📊 **Arbeitsablauf-Phasen**

### Phase A: Fragen-Analyse
```bash
# 1. JSON-Datei analysieren
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('COMPLETE_examensfragen_database_cleaned.json', 'utf8'));
console.log('Gesamtanzahl Fragen:', data.questions_answers.length);
console.log('Verfügbare Kategorien:');
const categories = [...new Set(data.questions_answers.map(q => q.category))];
categories.forEach(cat => console.log('- ' + cat));
"
```

### Phase B: Fragen-Auswahl & Konvertierung

#### Schritt 1: Fragen identifizieren
```javascript
// Beispiel für Anatomie-Fragen
const anatomyQuestions = data.questions_answers.filter(q =>
  q.category === 'I. Anatomie, Biologie und Physiologie' &&
  q.topic === 'Zytologie / Histologie'
);
console.log('Gefundene Fragen:', anatomyQuestions.length);
```

#### Schritt 2: Frage konvertieren
```javascript
// Open-ended → Multiple Choice oder True/False
const convertedQuestion = {
  stem: "Welche der folgenden Aufgaben haben die Ribosomen in einer Zelle?",
  type: "mc", // oder "tf"
  explanation_md: "Detaillierte Erklärung warum die Antwort richtig ist...",
  difficulty: 3,
  hints: ["Hinweis 1", "Hinweis 2", "Hinweis 3"],
  source_url: "https://vertrauenswuerdige-quelle.de",
  source_title: "Titel der Quelle",
  choices: [ // nur bei MC-Fragen
    { label: "Korrekte Antwort", is_correct: true },
    { label: "Falsche Antwort 1", is_correct: false },
    { label: "Falsche Antwort 2", is_correct: false },
    { label: "Falsche Antwort 3", is_correct: false }
  ]
};
```

### Phase C: Datenbank-Import

#### Schritt 3: Frage in Datenbank einfügen
```sql
-- Frage einfügen
INSERT INTO questions (
  topic_id,
  type,
  stem,
  explanation_md,
  source_url,
  source_title,
  difficulty,
  hints
) VALUES (
  (SELECT id FROM topics WHERE slug = 'grundlagen'),
  'mc',
  'Frage-Text hier...',
  'Erklärung hier...',
  'https://quelle.de',
  'Quellen-Titel',
  3,
  '["Hinweis 1", "Hinweis 2"]'::jsonb
) RETURNING id;
```

#### Schritt 4: Antwortoptionen hinzufügen (nur bei MC)
```sql
-- Antwortoptionen für Multiple Choice
INSERT INTO choices (question_id, label, is_correct) VALUES
('frage-id-hier', 'Korrekte Antwort', true),
('frage-id-hier', 'Falsche Antwort 1', false),
('frage-id-hier', 'Falsche Antwort 2', false),
('frage-id-hier', 'Falsche Antwort 3', false);
```

#### Schritt 5: Quelle hinzufügen
```sql
-- Quelle/Zitation hinzufügen
INSERT INTO citations (
  question_id,
  url,
  title,
  published_date
) VALUES (
  'frage-id-hier',
  'https://vertrauenswuerdige-quelle.de',
  'Titel der medizinischen Quelle',
  '2023-01-15'
);
```

### Phase D: JSON-Datei bereinigen

#### Schritt 6: Fragen aus JSON entfernen
```javascript
// Node.js Script zum Entfernen der importierten Fragen
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('COMPLETE_examensfragen_database_cleaned.json', 'utf8'));

// Fragen, die entfernt werden sollen
const questionsToRemove = [
  'Welche 3 Aufgaben haben die Ribosomen?',
  'Welcher Chromosomensatz entspricht dem einer gesunden Frau?',
  // ... weitere Fragen
];

console.log('Vor dem Entfernen:', data.questions_answers.length, 'Fragen');

// Filtere die questions_answers Array
const filteredQuestions = data.questions_answers.filter(q =>
  !questionsToRemove.includes(q.question)
);

data.questions_answers = filteredQuestions;

// Aktualisiere Metadaten
data.metadata.total_questions = data.questions_answers.length;

// Schreibe aktualisierte Datei
fs.writeFileSync('COMPLETE_examensfragen_database_cleaned.json', JSON.stringify(data, null, 2));

console.log('Nach dem Entfernen:', data.questions_answers.length, 'Fragen');
console.log('Entfernt wurden:', data.metadata.total_questions - data.questions_answers.length, 'Fragen');
```

### Phase E: Fortschritt dokumentieren

#### Schritt 7: MD-Datei aktualisieren
```markdown
<!-- In progress.md hinzufügen: -->
| Nr. | Frage | Typ | Thema | Status | Quelle |
|----|-------|-----|-------|--------|--------|
| 9 | Neue Frage hier... | MC | Grundlagen | ✅ Live | Quelle |
```

## 🔍 **Qualitätssicherung**

### Vor dem Import
- [ ] **Korrektheit prüfen**: Ist die Antwort medizinisch korrekt?
- [ ] **Quelle validieren**: Ist die Quelle vertrauenswürdig und aktuell?
- [ ] **Format prüfen**: Entspricht die Frage dem Datenbank-Schema?
- [ ] **Schwierigkeitsgrad**: Ist Level 1-5 angemessen?

### Nach dem Import
- [ ] **Datenbank prüfen**: Sind alle Felder korrekt gefüllt?
- [ ] **Foreign Keys**: Sind alle Beziehungen intakt?
- [ ] **App testen**: Funktioniert die Frage in der Anwendung?

## 📋 **Checkliste pro Frage**

```markdown
- [ ] Frage aus JSON identifiziert
- [ ] Frage konvertiert (MC/TF)
- [ ] Erklärung und Hinweise erstellt
- [ ] Vertrauenswürdige Quelle gefunden
- [ ] Schwierigkeitsgrad festgelegt
- [ ] In Datenbank importiert
- [ ] Antwortoptionen hinzugefügt (falls MC)
- [ ] Zitation hinzugefügt
- [ ] Aus JSON-Datei entfernt
- [ ] In progress.md dokumentiert
- [ ] Qualitätssicherung durchgeführt
```

## ⚡ **Schnellreferenz**

### Datenbank-IDs der Themen
```sql
SELECT id, slug, title FROM topics ORDER BY title;
```

### Frage-Typen
- `mc`: Multiple Choice (mit choices Tabelle)
- `tf`: True/False (mit tf_correct_answer Feld)

### Schwierigkeitsgrade
- `1`: Sehr einfach
- `2`: Einfach
- `3`: Mittel
- `4`: Schwer
- `5`: Sehr schwer

## 🚨 **Wichtige Hinweise**

### Datenbank-Constraints
- **topic_id**: Muss existierende Topic-ID referenzieren
- **questions.stem**: Muss unique pro Topic sein
- **choices.question_id**: Foreign Key zur questions Tabelle
- **citations.question_id**: Foreign Key zur questions Tabelle

### JSON-Datei-Struktur
```json
{
  "metadata": {
    "total_questions": 1586
  },
  "questions_answers": [
    {
      "question": "Frage-Text",
      "answer": "Antwort-Text",
      "topic": "Thema",
      "category": "Kategorie",
      "url": "Quellen-URL"
    }
  ]
}
```

### Backup-Strategie
```bash
# Vor jedem Import:
cp COMPLETE_examensfragen_database_cleaned.json backup_$(date +%Y%m%d_%H%M%S).json
```

## 📈 **Performance-Optimierung**

### Batch-Processing
```javascript
// Mehrere Fragen gleichzeitig verarbeiten
const batchSize = 10;
for (let i = 0; i < questions.length; i += batchSize) {
  const batch = questions.slice(i, i + batchSize);
  // Batch verarbeiten...
}
```

### Qualitätskontrolle
```sql
-- Import verifizieren
SELECT
  q.id,
  q.stem,
  q.type,
  t.title as topic,
  COUNT(c.id) as choice_count,
  COUNT(cit.id) as citation_count
FROM questions q
LEFT JOIN topics t ON q.topic_id = t.id
LEFT JOIN choices c ON c.question_id = q.id
LEFT JOIN citations cit ON cit.question_id = q.id
WHERE q.created_at > '2025-01-09'
GROUP BY q.id, q.stem, q.type, t.title;
```

## 🎯 **Nächste Schritte**

1. **Sofort**: 10 weitere Anatomie-Fragen importieren
2. **Danach**: Pflege-spezifische Fragen bearbeiten
3. **Abschluss**: Vollständige Qualitätskontrolle

---

## 📝 **Dokumentations-Updates**

Nach jedem Import-Session:
1. ✅ Neue Fragen in `progress.md` eintragen
2. ✅ Statistiken aktualisieren
3. ✅ Herausforderungen dokumentieren
4. ✅ Nächste Schritte planen

---

**Letzte Aktualisierung**: 2025-01-09
**Version**: 1.0
**Autor**: AI Assistant
