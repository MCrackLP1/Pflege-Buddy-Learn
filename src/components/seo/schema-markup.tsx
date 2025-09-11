'use client';

import { usePathname } from 'next/navigation';
import Head from 'next/head';

interface SchemaMarkupProps {
  type: 'website' | 'article' | 'educational' | 'quiz' | 'question';
  title: string;
  description: string;
  url: string;
  image?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  educationalData?: {
    level?: string;
    subject?: string[];
    teaches?: string[];
    assesses?: string;
    educationalUse?: string;
  };
  questionData?: {
    question: string;
    answer?: string;
    acceptedAnswer?: string;
    suggestedAnswer?: string;
    difficulty?: number;
    topic?: string;
    citations?: Array<{
      title: string;
      url: string;
      datePublished?: string;
    }>;
  };
}

export function SchemaMarkup({
  type,
  title,
  description,
  url,
  image,
  author,
  publishedTime,
  modifiedTime,
  keywords,
  educationalData,
  questionData
}: SchemaMarkupProps) {
  const pathname = usePathname();

  const generateSchemaData = () => {
    const baseSchema: any = {
      "@context": "https://schema.org",
      "@type": type === 'website' ? 'WebSite' :
              type === 'article' ? 'Article' :
              type === 'educational' ? 'EducationalOccupationalCredential' :
              type === 'quiz' ? 'Quiz' :
              'Question',
      "name": title,
      "description": description,
      "url": url,
      "inLanguage": "de-DE",
      "publisher": {
        "@type": "Organization",
        "name": "PflegeBuddy Learn",
        "description": "Lernplattform für Pflegefachkräfte mit evidenzbasierten medizinischen Inhalten",
        "url": "https://pflegebuddy.de"
      }
    };

    // Add image if provided
    if (image) {
      baseSchema.image = image;
    }

    // Add keywords if provided
    if (keywords && keywords.length > 0) {
      baseSchema.keywords = keywords.join(', ');
    }

    // Add author if provided
    if (author) {
      baseSchema.author = {
        "@type": "Person",
        "name": author
      };
    }

    // Add publication dates if provided
    if (publishedTime) {
      baseSchema.datePublished = publishedTime;
    }
    if (modifiedTime) {
      baseSchema.dateModified = modifiedTime;
    }

    // Educational specific data
    if (educationalData) {
      if (educationalData.level) {
        baseSchema.educationalLevel = educationalData.level;
      }
      if (educationalData.subject) {
        baseSchema.about = educationalData.subject;
      }
      if (educationalData.teaches) {
        baseSchema.teaches = educationalData.teaches;
      }
      if (educationalData.assesses) {
        baseSchema.assesses = educationalData.assesses;
      }
      if (educationalData.educationalUse) {
        baseSchema.educationalUse = educationalData.educationalUse;
      }
    }

    // Question specific data
    if (questionData) {
      baseSchema.text = questionData.question;

      if (questionData.answer || questionData.acceptedAnswer || questionData.suggestedAnswer) {
        baseSchema.acceptedAnswer = {
          "@type": "Answer",
          "text": questionData.answer || questionData.acceptedAnswer || questionData.suggestedAnswer
        };
      }

      if (questionData.citations && questionData.citations.length > 0) {
        baseSchema.citation = questionData.citations.map(citation => ({
          "@type": "CreativeWork",
          "name": citation.title,
          "url": citation.url,
          "datePublished": citation.datePublished
        }));
      }

      // Add educational context for questions
      baseSchema.educationalAlignment = {
        "@type": "AlignmentObject",
        "alignmentType": "assesses",
        "educationalFramework": "Pflegefachwissen",
        "targetName": questionData.topic || "Medizinische Fachkenntnisse",
        "targetUrl": `https://pflegebuddy.de/themen/${questionData.topic?.toLowerCase().replace(/\s+/g, '-')}`
      };
    }

    // Breadcrumb navigation
    const breadcrumbItems = [];
    const pathSegments = pathname.split('/').filter(segment => segment);

    breadcrumbItems.push({
      "@type": "ListItem",
      "position": 1,
      "name": "Startseite",
      "item": "https://pflegebuddy.de"
    });

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      breadcrumbItems.push({
        "@type": "ListItem",
        "position": index + 2,
        "name": segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        "item": `https://pflegebuddy.de${currentPath}`
      });
    });

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbItems
    };

    return [baseSchema, breadcrumbSchema];
  };

  const schemaData = generateSchemaData();

  return (
    <Head>
      {/* Primary Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaData[0])
        }}
      />

      {/* Breadcrumb Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaData[1])
        }}
      />

      {/* Additional SEO Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type === 'article' ? 'article' : 'website'} />
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}

      {/* Educational specific meta tags */}
      {educationalData && (
        <>
          <meta name="educational-use" content={educationalData.educationalUse || "Professional Education"} />
          {educationalData.level && (
            <meta name="educational-level" content={educationalData.level} />
          )}
        </>
      )}
    </Head>
  );
}

// Specialized component for question pages
export function QuestionSchemaMarkup({
  question,
  answer,
  topic,
  difficulty,
  citations = []
}: {
  question: string;
  answer?: string;
  topic: string;
  difficulty: number;
  citations?: Array<{
    title: string;
    url: string;
    datePublished?: string;
  }>;
}) {
  const url = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <SchemaMarkup
      type="question"
      title={`${question} - Pflegefachwissen Quiz`}
      description={`Medizinische Frage zum Thema ${topic} mit evidenzbasierter Antwort. Schwierigkeitsgrad: ${difficulty}/5.`}
      url={url}
      keywords={[topic, 'Pflege', 'Medizin', 'Quiz', 'Fachwissen', 'evidenzbasiert']}
      educationalData={{
        level: `Schwierigkeitsgrad ${difficulty}`,
        subject: [topic, 'Pflegefachwissen', 'Medizin'],
        teaches: [topic],
        assesses: topic,
        educationalUse: 'Assessment'
      }}
      questionData={{
        question,
        answer,
        difficulty,
        topic,
        citations
      }}
    />
  );
}

// Specialized component for quiz/collection pages
export function QuizSchemaMarkup({
  title,
  description,
  questionCount,
  topics,
  difficulty
}: {
  title: string;
  description: string;
  questionCount: number;
  topics: string[];
  difficulty: number;
}) {
  const url = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <SchemaMarkup
      type="educational"
      title={title}
      description={description}
      url={url}
      keywords={[...topics, 'Quiz', 'Pflege', 'Medizin', 'Lernen', 'Fachwissen']}
      educationalData={{
        level: `Schwierigkeitsgrad ${difficulty}`,
        subject: topics,
        teaches: topics,
        assesses: topics.join(', '),
        educationalUse: 'Assessment'
      }}
    />
  );
}
