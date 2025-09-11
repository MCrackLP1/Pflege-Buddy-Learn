#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import {
  generateSourceSEOMetadata,
  getSourceAuthorityLevel,
  generateSourceDescription,
  extractTopicsFromQuestions,
  type SourceSEOData
} from '../src/lib/seo/source-seo-utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SourceData {
  url: string;
  title: string;
  questionCount: number;
  lastUpdated: string;
  questions: any[];
}

async function getSourcesData(): Promise<SourceData[]> {
  console.log('Fetching sources data from Supabase...');

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id,
      stem,
      explanation_md,
      source_url,
      source_title,
      created_at,
      topics!inner(title, slug)
    `)
    .not('source_url', 'is', null)
    .not('source_title', 'is', null);

  if (error) {
    console.error('Error fetching sources:', error);
    return [];
  }

  // Group by source URL
  const sourcesMap = new Map<string, SourceData>();

  data.forEach((question: any) => {
    const url = question.source_url;
    if (!sourcesMap.has(url)) {
      sourcesMap.set(url, {
        url,
        title: question.source_title,
        questionCount: 0,
        lastUpdated: question.created_at,
        questions: []
      });
    }

    const source = sourcesMap.get(url)!;
    source.questionCount++;
    source.questions.push(question);
    source.lastUpdated = question.created_at > source.lastUpdated ? question.created_at : source.lastUpdated;
  });

  return Array.from(sourcesMap.values());
}

function generateSourcePageComponent(sourceData: SourceData): string {
  const authority = getSourceAuthorityLevel(sourceData.url);
  const description = generateSourceDescription(sourceData.url, sourceData.questionCount);
  const topics = extractTopicsFromQuestions(sourceData.questions);

  const relatedQuestions = sourceData.questions.slice(0, 20).map(q => ({
    id: q.id,
    stem: q.stem,
    topic: q.topics?.title || 'Allgemein',
    difficulty: Math.floor(Math.random() * 5) + 1 // Placeholder difficulty
  }));

  const sourceSEOData: SourceSEOData = {
    name: sourceData.title,
    url: sourceData.url,
    description,
    questionCount: sourceData.questionCount,
    topics,
    lastUpdated: sourceData.lastUpdated,
    authority,
    relatedQuestions
  };

  const seoMetadata = generateSourceSEOMetadata(sourceSEOData);

  return `'use client';

import { SourcePage } from '@/components/pages/source-page';
import { generateBreadcrumbStructuredData } from '@/lib/seo/source-seo-utils';
import Head from 'next/head';

export default function ${sourceData.title.replace(/[^a-zA-Z0-9]/g, '')}Page() {
  const sourceData = ${JSON.stringify(sourceSEOData, null, 2)};

  const breadcrumbData = generateBreadcrumbStructuredData(sourceData.name, sourceData.url);

  return (
    <>
      <Head>
        <title>{seoMetadata.title}</title>
        <meta name="description" content={seoMetadata.description} />
        <meta name="keywords" content={seoMetadata.keywords.join(', ')} />
        <link rel="canonical" href={seoMetadata.canonicalUrl} />
        <meta property="og:title" content={seoMetadata.title} />
        <meta property="og:description" content={seoMetadata.description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoMetadata.title} />
        <meta name="twitter:description" content={seoMetadata.description} />
      </Head>

      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData)
        }}
      />

      {/* Main SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoMetadata.structuredData)
        }}
      />

      <SourcePage
        sourceName={sourceData.name}
        sourceUrl={sourceData.url}
        description={sourceData.description}
        questionCount={sourceData.questionCount}
        topics={sourceData.topics}
        lastUpdated={sourceData.lastUpdated}
        authority={sourceData.authority}
        relatedQuestions={sourceData.relatedQuestions}
      />
    </>
  );
}`;
}

async function generateSourcePages() {
  const sources = await getSourcesData();

  console.log(`Found ${sources.length} unique sources`);

  const outputDir = path.join(process.cwd(), 'src', 'app', '[locale]', 'quellen');

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate index page for all sources
  const indexPage = `'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, BookOpen, Award, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Head from 'next/head';

interface SourceSummary {
  name: string;
  url: string;
  questionCount: number;
  topics: string[];
  lastUpdated: string;
  authority: string;
  slug: string;
}

const sources: SourceSummary[] = ${JSON.stringify(
  sources.map(s => ({
    name: s.title,
    url: s.url,
    questionCount: s.questionCount,
    topics: extractTopicsFromQuestions(s.questions),
    lastUpdated: s.lastUpdated,
    authority: getSourceAuthorityLevel(s.url),
    slug: s.url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
  })),
  null,
  2
)};

export default function SourcesIndexPage() {
  const t = useTranslations();

  const getAuthorityBadgeColor = (authority: string) => {
    switch (authority.toLowerCase()) {
      case 'hoch':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'mittel':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'niedrig':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <>
      <Head>
        <title>Medizinische Quellen & Fachliteratur | PflegeBuddy Learn</title>
        <meta name="description" content="Umfassende Übersicht aller medizinischen Quellen und Fachliteratur in PflegeBuddy Learn. Evidenzbasierte Inhalte für Pflegefachkräfte." />
        <meta name="keywords" content="medizinische Quellen, Fachliteratur, Pflege, Leitlinien, evidenzbasiert" />
        <link rel="canonical" href="/quellen" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
              Medizinische Quellen & Fachliteratur
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Alle unsere Lerninhalte basieren auf renommierten medizinischen Quellen und aktuellen Leitlinien.
              Hier finden Sie eine Übersicht unserer Quellen mit detaillierten Informationen.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sources.map((source, index) => (
              <motion.div
                key={source.url}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg leading-tight">
                        {source.name}
                      </CardTitle>
                      <Badge className={getAuthorityBadgeColor(source.authority)}>
                        <Award className="w-3 h-3 mr-1" />
                        {source.authority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <BookOpen className="w-4 h-4" />
                      <span>{source.questionCount} Fragen</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Aktualisiert: {new Date(source.lastUpdated).toLocaleDateString('de-DE')}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {source.topics.slice(0, 3).map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {source.topics.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{source.topics.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Link
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Quelle
                      </Link>
                      <Link
                        href={\`/quellen/\${source.slug}\`}
                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm underline ml-auto"
                      >
                        Details →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 text-center"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Statistik</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{sources.length}</div>
                  <div className="text-sm text-gray-600">Quellen</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {sources.reduce((sum, s) => sum + s.questionCount, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Fragen</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(sources.flatMap(s => s.topics)).size}
                  </div>
                  <div className="text-sm text-gray-600">Themen</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {sources.filter(s => s.authority === 'hoch').length}
                  </div>
                  <div className="text-sm text-gray-600">Hochwertige Quellen</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}`;

  fs.writeFileSync(path.join(outputDir, 'page.tsx'), indexPage);
  console.log('Generated sources index page');

  // Generate individual source pages
  for (const source of sources) {
    const slug = source.url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const fileName = `${slug}.tsx`;
    const filePath = path.join(outputDir, fileName);

    const pageContent = generateSourcePageComponent(source);
    fs.writeFileSync(filePath, pageContent);
    console.log(`Generated page for ${source.title}: ${fileName}`);
  }

  console.log(`\n✅ Generated ${sources.length + 1} source pages successfully!`);
  console.log(`📊 Total sources: ${sources.length}`);
  console.log(`❓ Total questions from sources: ${sources.reduce((sum, s) => sum + s.questionCount, 0)}`);
  console.log(`🏆 High-authority sources: ${sources.filter(s => getSourceAuthorityLevel(s.url) === 'hoch').length}`);
}

generateSourcePages().catch(console.error);
