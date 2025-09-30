import type { Database } from '@/types/database.types';

type QuestionWithCitations = Database['public']['Tables']['questions']['Row'] & {
  citations: Database['public']['Tables']['citations']['Row'][];
};

export interface SourceSEOData {
  name: string;
  url: string;
  description: string;
  questionCount: number;
  topics: string[];
  lastUpdated: string;
  authority: string;
  relatedQuestions: Array<{
    id: string;
    stem: string;
    topic: string;
    difficulty: number;
  }>;
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  structuredData: object;
  canonicalUrl: string;
}

/**
 * Generate SEO metadata for source pages
 */
export function generateSourceSEOMetadata(source: SourceSEOData): SEOMetadata {
  const baseTitle = `${source.name} - Medizinische Fachliteratur | PflegeBuddy Learn`;
  const description = `${source.description} ${source.questionCount} medizinische Fragen basierend auf aktuellen Leitlinien. Fachliche Expertise für Pflegekräfte.`;

  return {
    title: baseTitle,
    description: description.substring(0, 160),
    keywords: [
      source.name,
      'medizinische Leitlinien',
      'Pflegefachwissen',
      'medizinische Quellen',
      ...source.topics.slice(0, 5),
      'Pflegeausbildung',
      'medizinische Fachliteratur'
    ],
    canonicalUrl: `/quellen/${source.url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": source.name,
      "url": source.url,
      "description": source.description,
      "educationalCredentialAwarded": "Pflegefachwissen",
      "hasEducationalUse": "Professional Education",
      "teaches": source.topics,
      "numberOfCredits": source.questionCount,
      "dateModified": source.lastUpdated,
      "publisher": {
        "@type": "Organization",
        "name": "PflegeBuddy Learn",
        "description": "Lernplattform für Pflegefachkräfte"
      }
    }
  };
}

/**
 * Get source authority level based on domain
 */
export function getSourceAuthorityLevel(url: string): string {
  const highAuthorityDomains = [
    'awmf.org',
    'who.int',
    'ncbi.nlm.nih.gov',
    'rki.de',
    'bfarm.de'
  ];

  const mediumAuthorityDomains = [
    'dge.de',
    'dgem.de',
    'amboss.com',
    'thieme.de',
    'springer.com'
  ];

  const domain = url.toLowerCase();

  if (highAuthorityDomains.some(d => domain.includes(d))) {
    return 'hoch';
  } else if (mediumAuthorityDomains.some(d => domain.includes(d))) {
    return 'mittel';
  } else {
    return 'niedrig';
  }
}

/**
 * Generate source description based on domain
 */
export function generateSourceDescription(url: string, questionCount: number): string {
  const descriptions: Record<string, string> = {
    'awmf.org': 'Die Arbeitsgemeinschaft der Wissenschaftlichen Medizinischen Fachgesellschaften e.V. (AWMF) ist die größte und wichtigste wissenschaftliche medizinische Fachgesellschaft in Deutschland. Sie entwickelt evidenzbasierte Leitlinien für die medizinische Versorgung.',
    'who.int': 'Die Weltgesundheitsorganisation (WHO) ist die maßgebliche Organisation für internationale Gesundheit. Sie entwickelt globale Standards und Leitlinien für Gesundheitsversorgung und Prävention.',
    'ncbi.nlm.nih.gov': 'Das National Center for Biotechnology Information (NCBI) ist Teil der National Library of Medicine der USA. Es bietet Zugang zu biomedizinischen und genomischen Informationen.',
    'rki.de': 'Das Robert Koch-Institut (RKI) ist das öffentliche Gesundheitsinstitut Deutschlands und zuständig für die Verhinderung und Bekämpfung von Krankheiten.',
    'bfarm.de': 'Das Bundesinstitut für Arzneimittel und Medizinprodukte (BfArM) ist zuständig für die Zulassung und Überwachung von Arzneimitteln in Deutschland.',
    'dge.de': 'Die Deutsche Gesellschaft für Ernährung e.V. (DGE) ist die wissenschaftliche Fachgesellschaft für Ernährung in Deutschland.',
    'dgem.de': 'Die Deutsche Gesellschaft für Ernährungsmedizin e.V. (DGEM) widmet sich der ernährungsmedizinischen Forschung und Versorgung.',
    'amboss.com': 'Amboss ist eine digitale Wissensplattform für Medizin mit evidenzbasierten Inhalten für Ärzte und Medizinstudierende.'
  };

  const domain = Object.keys(descriptions).find(d => url.includes(d));
  const baseDescription = domain ? descriptions[domain] : 'Eine anerkannte medizinische Fachquelle mit evidenzbasierten Informationen.';

  return `${baseDescription} Diese Quelle bildet die Grundlage für ${questionCount} medizinische Fragen in unserer Lernplattform.`;
}

/**
 * Extract topics from questions related to a source
 */
export function extractTopicsFromQuestions(questions: QuestionWithCitations[]): string[] {
  const topicKeywords: Record<string, string[]> = {
    'Anatomie': ['skelett', 'muskel', 'organ', 'gewebe', 'anatomie', 'physiologie'],
    'Ernährung': ['ernährung', 'nahrung', 'diät', 'ballaststoff', 'protein', 'vitamin'],
    'Hygiene': ['hygiene', 'desinfektion', 'infektion', 'keim', 'händewaschen'],
    'Medikamente': ['medikament', 'arznei', 'dosierung', 'nebenwirkung', 'interaktion'],
    'Grundlagen': ['grundlagen', 'basis', 'einführung', 'grundbegriff'],
    'Dokumentation': ['dokumentation', 'aufzeichnung', 'bericht', 'protokoll']
  };

  const foundTopics = new Set<string>();

  questions.forEach(question => {
    const explanation: string = (question as any).explanationMd || (question as any).explanation_md || '';
    const text = (question.stem + ' ' + explanation).toLowerCase();

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        foundTopics.add(topic);
      }
    });
  });

  return Array.from(foundTopics);
}

/**
 * Generate internal linking suggestions for SEO
 */
export function generateInternalLinks(relatedTopics: string[]): Array<{
  url: string;
  anchorText: string;
  title: string;
}> {
  const links = [];

  // Link to related topics
  relatedTopics.forEach(topic => {
    links.push({
      url: `/themen/${topic.toLowerCase().replace(/\s+/g, '-')}`,
      anchorText: `${topic} lernen`,
      title: `Mehr über ${topic} erfahren`
    });
  });

  // Link to quiz
  links.push({
    url: '/quiz',
    anchorText: 'Jetzt üben',
    title: 'Starte ein Quiz zu diesem Thema'
  });

  // Link to main learning page
  links.push({
    url: '/learn',
    anchorText: 'Lernbereich',
    title: 'Zum Lernbereich navigieren'
  });

  return links;
}

/**
 * Generate breadcrumb structured data for source pages
 */
export function generateBreadcrumbStructuredData(sourceName: string, sourceUrl: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "PflegeBuddy Learn",
        "item": "https://pflegebuddy.de"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Quellen",
        "item": "https://pflegebuddy.de/quellen"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": sourceName,
        "item": sourceUrl
      }
    ]
  };
}
