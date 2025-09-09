// Demo-Script für die Randomisierungsfunktion
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Beispiel für eine MC-Frage mit 4 Antwortoptionen
const exampleQuestion = {
  stem: "Welche der folgenden Aufgaben haben die Ribosomen in einer Zelle?",
  choices: [
    { id: "choice_1", label: "Proteinsynthese", isCorrect: true },
    { id: "choice_2", label: "Energiespeicherung", isCorrect: false },
    { id: "choice_3", label: "DNA-Replikation", isCorrect: false },
    { id: "choice_4", label: "Zellatmung", isCorrect: false }
  ]
};

console.log("🔄 Randomisierung-Demo für Multiple Choice Fragen");
console.log("================================================\n");

console.log("📝 Originalfrage:", exampleQuestion.stem);
console.log("\n📊 Originale Reihenfolge:");
exampleQuestion.choices.forEach((choice, index) => {
  const marker = choice.isCorrect ? "✅" : "❌";
  console.log(`   ${String.fromCharCode(65 + index)}. ${choice.label} ${marker}`);
});

console.log("\n🎲 5 zufällige Sortierungen:");
for (let i = 1; i <= 5; i++) {
  const shuffledChoices = shuffleArray(exampleQuestion.choices);
  console.log(`\n   Sortierung ${i}:`);
  shuffledChoices.forEach((choice, index) => {
    const marker = choice.isCorrect ? "✅" : "❌";
    console.log(`   ${String.fromCharCode(65 + index)}. ${choice.label} ${marker}`);
  });
}

console.log("\n✨ Vorteile der Randomisierung:");
console.log("   • Verhindert Auswendiglernen von Positionen");
console.log("   • Erhöht die Lernqualität");
console.log("   • Macht das Quiz fairer");
console.log("   • Stabil während der Beantwortung einer Frage");
console.log("   • Neu randomisiert bei jeder neuen Frage");
