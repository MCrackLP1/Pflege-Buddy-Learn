#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SEOAnalysisResult {
  totalQuestions: number;
  questionsWithSources: number;
  questionsWithUrls: number;
  totalCitations: number;
  sourceDistribution: Array<{
    source: string;
    count: number;
    authority: string;
    domain: string;
  }>;
  topicsFromSources: Array<{
    topic: string;
    questionCount: number;
    sources: string[];
  }>;
  seoRecommendations: string[];
  seoScore: number;
}

async function analyzeSourceSEO(): Promise<SEOAnalysisResult> {
  console.log('🔍 Analyzing SEO potential of sources...');

  // Get comprehensive source data
  const { data: questions, error } = await supabase
    .from('questions')
    .select(`
      id,
      stem,
      explanation_md,
      source_url,
      source_title,
      difficulty,
      topics!inner(title, slug)
    `)
    .not('source_url', 'is', null);

  if (error) {
    console.error('Error fetching questions:', error);
    return {} as SEOAnalysisResult;
  }

  // Get citation data
  const { data: citations } = await supabase
    .from('citations')
    .select('question_id, url, title, published_date');

  // Basic statistics
  const totalQuestions = questions?.length || 0;
  const questionsWithSources = questions?.filter(q => q.source_url || q.source_title).length || 0;
  const questionsWithUrls = questions?.filter(q => q.source_url).length || 0;
  const totalCitations = citations?.length || 0;

  // Source distribution analysis
  const sourceMap = new Map<string, { count: number; questions: any[] }>();

  questions?.forEach(question => {
    if (question.source_url) {
      const source = question.source_url;
      if (!sourceMap.has(source)) {
        sourceMap.set(source, { count: 0, questions: [] });
      }
      sourceMap.get(source)!.count++;
      sourceMap.get(source)!.questions.push(question);
    }
  });

  const sourceDistribution = Array.from(sourceMap.entries()).map(([source, data]) => ({
    source: questions?.find(q => q.source_url === source)?.source_title || source,
    count: data.count,
    authority: getAuthorityLevel(source),
    domain: new URL(source).hostname
  })).sort((a, b) => b.count - a.count);

  // Topic analysis from sources
  const topicMap = new Map<string, { questionCount: number; sources: Set<string> }>();

  questions?.forEach(question => {
    if (question.source_url && question.topics) {
      const topic = question.topics.title;
      if (!topicMap.has(topic)) {
        topicMap.set(topic, { questionCount: 0, sources: new Set() });
      }
      topicMap.get(topic)!.questionCount++;
      topicMap.get(topic)!.sources.add(question.source_url);
    }
  });

  const topicsFromSources = Array.from(topicMap.entries()).map(([topic, data]) => ({
    topic,
    questionCount: data.questionCount,
    sources: Array.from(data.sources)
  })).sort((a, b) => b.questionCount - a.questionCount);

  // Generate SEO recommendations
  const seoRecommendations = generateSEORecommendations({
    totalQuestions,
    questionsWithSources,
    questionsWithUrls,
    totalCitations,
    sourceDistribution,
    topicsFromSources
  });

  // Calculate SEO score
  const seoScore = calculateSEOScore({
    totalQuestions,
    questionsWithSources,
    questionsWithUrls,
    totalCitations,
    sourceDistribution
  });

  return {
    totalQuestions,
    questionsWithSources,
    questionsWithUrls,
    totalCitations,
    sourceDistribution,
    topicsFromSources,
    seoRecommendations,
    seoScore
  };
}

function getAuthorityLevel(url: string): string {
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

function generateSEORecommendations(data: Partial<SEOAnalysisResult>): string[] {
  const recommendations = [];

  const coverage = (data.questionsWithSources || 0) / (data.totalQuestions || 1) * 100;

  if (coverage < 80) {
    recommendations.push(`🔍 ${Math.round(100 - coverage)}% der Fragen haben keine Quellen. Fügen Sie Quellen hinzu für bessere Glaubwürdigkeit.`);
  }

  const highAuthorityCount = data.sourceDistribution?.filter(s => s.authority === 'hoch').length || 0;
  if (highAuthorityCount < 5) {
    recommendations.push(`🏆 Nur ${highAuthorityCount} hochautoritätige Quellen. Integrieren Sie mehr WHO, AWMF, RKI Quellen.`);
  }

  const uniqueDomains = new Set(data.sourceDistribution?.map(s => s.domain)).size;
  if (uniqueDomains < 10) {
    recommendations.push(`🌐 Nur ${uniqueDomains} verschiedene Domains. Diversifizieren Sie die Quellen für besseres Link-Profil.`);
  }

  if ((data.totalCitations || 0) < (data.questionsWithSources || 0) * 2) {
    recommendations.push(`📚 Erweitern Sie Citations von ${data.totalCitations} auf mindestens ${data.questionsWithSources} * 2 für bessere Interlinking.`);
  }

  recommendations.push(`✅ Implementieren Sie strukturierte Daten (Schema.org) für alle Quellen und Citations.`);
  recommendations.push(`🔗 Erstellen Sie interne Verlinkungen zwischen verwandten Fragen basierend auf Quellen.`);
  recommendations.push(`📊 Überwachen Sie die Suchmaschinen-Performance mit Google Search Console.`);

  return recommendations;
}

function calculateSEOScore(data: Partial<SEOAnalysisResult>): number {
  let score = 0;
  const maxScore = 100;

  // Coverage score (40 points)
  const coverage = (data.questionsWithSources || 0) / (data.totalQuestions || 1);
  score += coverage * 40;

  // Authority score (30 points)
  const highAuthorityCount = data.sourceDistribution?.filter(s => s.authority === 'hoch').length || 0;
  const authorityRatio = highAuthorityCount / (data.sourceDistribution?.length || 1);
  score += authorityRatio * 30;

  // Diversity score (20 points)
  const uniqueDomains = new Set(data.sourceDistribution?.map(s => s.domain)).size;
  const diversityScore = Math.min(uniqueDomains / 15, 1); // Cap at 15 domains
  score += diversityScore * 20;

  // Citation score (10 points)
  const citationRatio = (data.totalCitations || 0) / (data.questionsWithSources || 1);
  score += Math.min(citationRatio / 2, 1) * 10; // Cap at 2 citations per question

  return Math.round(Math.min(score, maxScore));
}

async function generateSEOReport() {
  const analysis = await analyzeSourceSEO();

  const report = `
# 📊 SEO Analyse: Quellen & Citations
*Generiert am: ${new Date().toLocaleDateString('de-DE')}*

## 📈 Grundlegende Statistiken

- **Gesamtanzahl Fragen:** ${analysis.totalQuestions}
- **Fragen mit Quellen:** ${analysis.questionsWithSources} (${Math.round((analysis.questionsWithSources / analysis.totalQuestions) * 100)}%)
- **Fragen mit URLs:** ${analysis.questionsWithUrls} (${Math.round((analysis.questionsWithUrls / analysis.totalQuestions) * 100)}%)
- **Gesamtanzahl Citations:** ${analysis.totalCitations}

## 🏆 SEO Score: ${analysis.seoScore}/100

## 📊 Quellen-Verteilung (Top 10)

${analysis.sourceDistribution.slice(0, 10).map((source, index) =>
  `${index + 1}. **${source.source}**\n   - Anzahl: ${source.count} Fragen\n   - Autorität: ${source.authority}\n   - Domain: ${source.domain}`
).join('\n')}

## 🏷️ Themen aus Quellen (Top 10)

${analysis.topicsFromSources.slice(0, 10).map((topic, index) =>
  `${index + 1}. **${topic.topic}**\n   - Fragen: ${topic.questionCount}\n   - Quellen: ${topic.sources.length}`
).join('\n')}

## 💡 SEO Empfehlungen

${analysis.seoRecommendations.map(rec => `- ${rec}`).join('\n')}

## 🎯 Nächste Schritte

1. **Strukturierte Daten implementieren** - Schema.org Markup für alle Quellen
2. **Interne Verlinkungen optimieren** - Verbinden verwandter Fragen
3. **Quellen diversifizieren** - Mehr hochautoritätige Quellen hinzufügen
4. **Citations erweitern** - Mehr externe Referenzen pro Frage
5. **Performance überwachen** - Google Search Console und Analytics

---

*Diese Analyse hilft dabei, das SEO-Potential der medizinischen Quellen zu maximieren.*
`;

  // Save report to file
  const reportPath = path.join(process.cwd(), 'SEO_SOURCE_ANALYSIS.md');
  fs.writeFileSync(reportPath, report);

  console.log('✅ SEO Analyse abgeschlossen!');
  console.log(`📄 Bericht gespeichert: ${reportPath}`);
  console.log(`🏆 SEO Score: ${analysis.seoScore}/100`);

  // Print summary to console
  console.log('\n📊 Zusammenfassung:');
  console.log(`   Fragen mit Quellen: ${analysis.questionsWithSources}/${analysis.totalQuestions}`);
  console.log(`   Hochautoritätige Quellen: ${analysis.sourceDistribution.filter(s => s.authority === 'hoch').length}`);
  console.log(`   Einzigartige Domains: ${new Set(analysis.sourceDistribution.map(s => s.domain)).size}`);

  return analysis;
}

generateSEOReport().catch(console.error);
