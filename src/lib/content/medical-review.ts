// Medical review system for quality assurance of healthcare content

export interface MedicalReviewCriteria {
  factualAccuracy: boolean;
  sourceVerification: boolean;  
  clinicalRelevance: boolean;
  appropriateDifficulty: boolean;
  clearLanguage: boolean;
  noMisinformation: boolean;
  ethicallyAppropriate: boolean;
}

export interface MedicalReviewResult {
  approved: boolean;
  score: number; // 0-100
  criteria: MedicalReviewCriteria;
  reviewer: {
    name?: string;
    credentials?: string;
    reviewDate: string;
  };
  feedback?: string;
  requiredChanges?: string[];
}

export interface QuestionReview {
  questionId: string;
  questionText: string;
  topic: string;
  review: MedicalReviewResult;
  finalStatus: 'approved' | 'rejected' | 'revision_required' | 'pending_review';
}

/**
 * Medical review checklist for nursing education content
 */
export const MEDICAL_REVIEW_CHECKLIST = {
  factualAccuracy: {
    weight: 25,
    criteria: [
      'Alle medizinischen Fakten sind wissenschaftlich korrekt',
      'Dosierungen, Zeitangaben und Protokolle sind präzise',
      'Keine veralteten oder überholten Informationen',
      'Übereinstimmung mit aktuellen Leitlinien'
    ]
  },
  sourceVerification: {
    weight: 20,
    criteria: [
      'Quellen sind vertrauenswürdig und authoritative',
      'Mindestens 2 unabhängige Quellen pro Frage',
      'Publikationsdaten sind aktuell (< 5 Jahre)',
      'URLs funktionieren und führen zu korrekten Inhalten'
    ]
  },
  clinicalRelevance: {
    weight: 20,
    criteria: [
      'Frage ist relevant für Pflegealltag',
      'Schwierigkeitsgrad angemessen für Zielgruppe',
      'Praktische Anwendbarkeit gegeben',
      'Bezug zu realen Pflegesituationen'
    ]
  },
  appropriateDifficulty: {
    weight: 15,
    criteria: [
      'Schwierigkeitsgrad korrekt eingestuft (1-5)',
      'Angemessen für Pflegeweiterbildung/-praxis',
      'Nicht zu trivial oder übermäßig komplex',
      'Progression vom Grundlagen zu Expertenwissen'
    ]
  },
  clearLanguage: {
    weight: 10,
    criteria: [
      'Eindeutige, unmissverständliche Formulierung',
      'Fachterminologie korrekt verwendet',
      'Keine mehrdeutigen Aussagen',
      'Verständlich für Zielgruppe'
    ]
  },
  noMisinformation: {
    weight: 5,
    criteria: [
      'Keine gefährlichen Fehlinformationen',
      'Kein Widerspruch zu etablierten Leitlinien',
      'Keine veralteten Praktiken als aktuell dargestellt',
      'Angemessene Disclaimers wo nötig'
    ]
  },
  ethicallyAppropriate: {
    weight: 5,
    criteria: [
      'Respektvoller Umgang mit Patientenwürde',
      'Keine diskriminierenden Inhalte',
      'Kulturelle Sensibilität beachtet',
      'Ethische Pflegeprinzipien befolgt'
    ]
  }
} as const;

/**
 * Calculate medical review score based on criteria
 */
export function calculateReviewScore(criteria: MedicalReviewCriteria): number {
  let totalScore = 0;
  let maxPossibleScore = 0;
  
  Object.entries(MEDICAL_REVIEW_CHECKLIST).forEach(([key, config]) => {
    const criterion = criteria[key as keyof MedicalReviewCriteria];
    const weight = config.weight;
    
    maxPossibleScore += weight;
    if (criterion) {
      totalScore += weight;
    }
  });
  
  return Math.round((totalScore / maxPossibleScore) * 100);
}

/**
 * Determine if question should be approved based on review
 */
export function shouldApproveQuestion(review: MedicalReviewResult): boolean {
  // Critical criteria must all be met
  const criticalCriteria = [
    review.criteria.factualAccuracy,
    review.criteria.sourceVerification,
    review.criteria.noMisinformation
  ];
  
  if (!criticalCriteria.every(c => c)) {
    return false;
  }
  
  // Overall score must be >= 80%
  return review.score >= 80;
}

/**
 * Generate review template for medical experts
 */
export function generateReviewTemplate(questions: any[]): string {
  return `
# Medizinisches Fachexperten-Review
**Datum:** ${new Date().toLocaleDateString('de-DE')}
**Anzahl Fragen:** ${questions.length}

## Review-Kriterien (Bitte für jede Frage bewerten):

### ✅ Faktische Richtigkeit (25 Punkte)
- [ ] Alle medizinischen Fakten wissenschaftlich korrekt
- [ ] Dosierungen/Zeitangaben/Protokolle präzise
- [ ] Aktuelle Leitlinien-Konformität
- [ ] Keine veralteten Informationen

### 🔗 Quellenverifikation (20 Punkte)  
- [ ] Vertrauenswürdige, authoritative Quellen
- [ ] Mindestens 2 unabhängige Quellen
- [ ] Aktuelle Publikationsdaten (< 5 Jahre)
- [ ] Funktionierende, korrekte URLs

### 🏥 Klinische Relevanz (20 Punkte)
- [ ] Relevant für Pflegealltag
- [ ] Angemessener Schwierigkeitsgrad
- [ ] Praktische Anwendbarkeit
- [ ] Bezug zu realen Pflegesituationen

### 📊 Angemessene Schwierigkeit (15 Punkte)
- [ ] Korrekte Schwierigkeitseinstufung (1-5)
- [ ] Passend für Pflegeweiterbildung/-praxis
- [ ] Weder zu trivial noch zu komplex

### 📝 Klare Sprache (10 Punkte)
- [ ] Eindeutige, unmissverständliche Formulierung
- [ ] Korrekte Fachterminologie
- [ ] Verständlich für Zielgruppe

### ⚠️ Keine Fehlinformationen (5 Punkte)
- [ ] Keine gefährlichen Fehlinformationen
- [ ] Übereinstimmung mit Leitlinien
- [ ] Aktuelle Praktiken dargestellt

### 🤝 Ethische Angemessenheit (5 Punkte)
- [ ] Respekt für Patientenwürde
- [ ] Keine Diskriminierung
- [ ] Kulturelle Sensibilität

---

## Fragen zur Bewertung:

${questions.map((q, i) => `
### Frage ${i + 1}: ${q.stem}

**Typ:** ${q.type === 'mc' ? 'Multiple Choice' : 'Wahr/Falsch'}  
**Schwierigkeit:** ${q.difficulty}/5
**KI-Konfidenz:** ${q.medical_review?.ai_confidence || 'N/A'}%

**Antworten:**
${q.type === 'mc' && q.choices ?
  q.choices.map((c: any, idx: number) => `${idx + 1}. ${c.label} ${c.is_correct ? '✅ (Korrekt)' : ''}`).join('\n') :
  q.tf_correct_answer !== undefined ? `Korrekte Antwort: ${q.tf_correct_answer ? 'Wahr' : 'Falsch'}` : ''
}

**Erklärung:** ${q.explanation_md}

**Quellen:**
${q.citations ? q.citations.map((c: any) => `- ${c.organization}: ${c.title} (${c.published_date})`).join('\n') : 'Keine Quellen'}

**BEWERTUNG:**
- [ ] ✅ Genehmigt (Kann ohne Änderungen verwendet werden)
- [ ] ⚠️ Überarbeitung erforderlich (siehe Kommentare unten)  
- [ ] ❌ Abgelehnt (Darf nicht verwendet werden)

**Kommentare/Änderungsvorschläge:**
_[Bitte spezifische Feedback oder Korrekturen angeben]_

---
`).join('\n')}

## Gesamt-Empfehlung:
- [ ] ✅ Alle Fragen genehmigt für Produktion
- [ ] ⚠️ Teilweise genehmigt (siehe individuelle Bewertungen)
- [ ] ❌ Batch erfordert umfassende Überarbeitung

**Reviewer-Informationen:**
- **Name:** ___________________________
- **Qualifikation:** ___________________________  
- **Institution:** ___________________________
- **Datum:** ___________________________
- **Unterschrift:** ___________________________
`;
}

/**
 * Export review results for integration
 */
export function exportReviewResults(reviews: QuestionReview[]): {
  approved: QuestionReview[];
  rejected: QuestionReview[];
  revisionRequired: QuestionReview[];
  summary: {
    totalReviewed: number;
    approvalRate: number;
    averageScore: number;
    criticalIssues: string[];
  };
} {
  const approved = reviews.filter(r => r.finalStatus === 'approved');
  const rejected = reviews.filter(r => r.finalStatus === 'rejected');
  const revisionRequired = reviews.filter(r => r.finalStatus === 'revision_required');
  
  const averageScore = reviews.reduce((sum, r) => sum + r.review.score, 0) / reviews.length;
  const approvalRate = (approved.length / reviews.length) * 100;
  
  // Identify critical issues
  const criticalIssues: string[] = [];
  reviews.forEach(r => {
    if (!r.review.criteria.factualAccuracy) {
      criticalIssues.push('Faktische Unrichtigkeit erkannt');
    }
    if (!r.review.criteria.noMisinformation) {
      criticalIssues.push('Potentielle Fehlinformation erkannt');
    }
    if (!r.review.criteria.sourceVerification) {
      criticalIssues.push('Unzureichende Quellenverifikation');
    }
  });

  return {
    approved,
    rejected, 
    revisionRequired,
    summary: {
      totalReviewed: reviews.length,
      approvalRate: Math.round(approvalRate),
      averageScore: Math.round(averageScore),
      criticalIssues: Array.from(new Set(criticalIssues)),
    }
  };
}
