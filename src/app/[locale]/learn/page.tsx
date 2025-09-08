import { unstable_setRequestLocale } from 'next-intl/server';
import { LearnPage } from '@/components/pages/learn-page';
import { Metadata } from 'next';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isGerman = locale === 'de';

  return {
    title: isGerman
      ? 'Lernen | PflegeBuddy Learn - Interaktives Pflege-Quiz'
      : 'Learn | PflegeBuddy Learn - Interactive Nursing Quiz',
    description: isGerman
      ? 'Starten Sie Ihr interaktives Lernen mit PflegeBuddy Learn. Beantworten Sie täglich neue Multiple-Choice Fragen zu Pflegegrundlagen, Hygiene, Medikamente und Dokumentation. Sammeln Sie XP-Punkte und verbessern Sie Ihr Fachwissen.'
      : 'Start your interactive learning with PflegeBuddy Learn. Answer new multiple-choice questions daily about nursing basics, hygiene, medication and documentation. Collect XP points and improve your expertise.',
    keywords: isGerman
      ? 'Pflege lernen, Pflegequiz, Pflegefragen, Pflegeweiterbildung, Pflegegrundlagen, Hygiene lernen, Medikamente lernen, Pflegedokumentation, Multiple-Choice Pflege, Pflege XP'
      : 'Nursing learning, Nursing quiz, Nursing questions, Nursing education, Nursing basics, Hygiene learning, Medication learning, Nursing documentation, Multiple-choice nursing, Nursing XP',
    alternates: {
      canonical: `https://www.pflegebuddy.app/${locale}/learn`,
      languages: {
        'de': 'https://www.pflegebuddy.app/de/learn',
        'en': 'https://www.pflegebuddy.app/en/learn',
      },
    },
    openGraph: {
      title: isGerman
        ? 'Lernen | PflegeBuddy Learn - Interaktives Pflege-Quiz'
        : 'Learn | PflegeBuddy Learn - Interactive Nursing Quiz',
      description: isGerman
        ? 'Starten Sie Ihr interaktives Lernen mit täglich neuen Multiple-Choice Fragen zu Pflegegrundlagen.'
        : 'Start your interactive learning with daily new multiple-choice questions about nursing basics.',
      url: `https://www.pflegebuddy.app/${locale}/learn`,
      siteName: 'PflegeBuddy Learn',
      locale: isGerman ? 'de_DE' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: isGerman
        ? 'Lernen | PflegeBuddy Learn - Interaktives Pflege-Quiz'
        : 'Learn | PflegeBuddy Learn - Interactive Nursing Quiz',
      description: isGerman
        ? 'Starten Sie Ihr interaktives Lernen mit täglich neuen Multiple-Choice Fragen zu Pflegegrundlagen.'
        : 'Start your interactive learning with daily new multiple-choice questions about nursing basics.',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function Learn({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  return (
    <>
      <LearnPage />
      <LearnStructuredData locale={locale} />
    </>
  );
}

// Structured Data for Learn Page
function LearnStructuredData({ locale }: { locale: string }) {
  const isGerman = locale === 'de';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      // BreadcrumbList
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': isGerman ? 'Startseite' : 'Home',
            'item': 'https://www.pflegebuddy.app'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': isGerman ? 'Lernen' : 'Learn',
            'item': `https://www.pflegebuddy.app/${locale}/learn`
          }
        ]
      },
      // Course Collection
      {
        '@type': 'ItemList',
        'name': isGerman ? 'Pflege Lernmodule' : 'Nursing Learning Modules',
        'description': isGerman
          ? 'Interaktive Lernmodule für Pflegekräfte mit Multiple-Choice Fragen'
          : 'Interactive learning modules for nursing professionals with multiple-choice questions',
        'numberOfItems': 4,
        'itemListElement': [
          {
            '@type': 'Course',
            'position': 1,
            'name': isGerman ? 'Pflegegrundlagen' : 'Nursing Basics',
            'description': isGerman
              ? 'Basiswissen für die professionelle Pflege'
              : 'Basic knowledge for professional nursing',
            'url': `https://www.pflegebuddy.app/${locale}/quiz/grundlagen`,
            'provider': {
              '@type': 'Organization',
              'name': 'PflegeBuddy Learn'
            }
          },
          {
            '@type': 'Course',
            'position': 2,
            'name': isGerman ? 'Hygiene & Infektionsschutz' : 'Hygiene & Infection Control',
            'description': isGerman
              ? 'Hygienemaßnahmen und Infektionsprävention'
              : 'Hygiene measures and infection prevention',
            'url': `https://www.pflegebuddy.app/${locale}/quiz/hygiene`,
            'provider': {
              '@type': 'Organization',
              'name': 'PflegeBuddy Learn'
            }
          },
          {
            '@type': 'Course',
            'position': 3,
            'name': isGerman ? 'Medikamentengabe' : 'Medication Administration',
            'description': isGerman
              ? 'Sichere Arzneimittelverabreichung'
              : 'Safe drug administration',
            'url': `https://www.pflegebuddy.app/${locale}/quiz/medikamente`,
            'provider': {
              '@type': 'Organization',
              'name': 'PflegeBuddy Learn'
            }
          },
          {
            '@type': 'Course',
            'position': 4,
            'name': isGerman ? 'Pflegedokumentation' : 'Nursing Documentation',
            'description': isGerman
              ? 'Rechtssichere Dokumentation'
              : 'Legally secure documentation',
            'url': `https://www.pflegebuddy.app/${locale}/quiz/dokumentation`,
            'provider': {
              '@type': 'Organization',
              'name': 'PflegeBuddy Learn'
            }
          }
        ]
      },
      // WebPage Schema
      {
        '@type': 'WebPage',
        '@id': `https://www.pflegebuddy.app/${locale}/learn`,
        'url': `https://www.pflegebuddy.app/${locale}/learn`,
        'name': isGerman
          ? 'Lernen | PflegeBuddy Learn - Interaktives Pflege-Quiz'
          : 'Learn | PflegeBuddy Learn - Interactive Nursing Quiz',
        'description': isGerman
          ? 'Starten Sie Ihr interaktives Lernen mit PflegeBuddy Learn. Beantworten Sie täglich neue Multiple-Choice Fragen zu Pflegegrundlagen.'
          : 'Start your interactive learning with PflegeBuddy Learn. Answer new multiple-choice questions daily about nursing basics.',
        'isPartOf': {
          '@id': `https://www.pflegebuddy.app/${locale}#website`
        },
        'about': {
          '@type': 'Thing',
          'name': isGerman ? 'Pflegeweiterbildung' : 'Nursing Continuing Education'
        },
        'primaryImageOfPage': {
          '@type': 'ImageObject',
          'url': 'https://www.pflegebuddy.app/learn-og-image.jpg'
        },
        'datePublished': '2024-01-01',
        'dateModified': new Date().toISOString().split('T')[0]
      },
      // Video Schema for educational content
      {
        '@type': 'VideoObject',
        '@id': 'https://www.pflegebuddy.app/de/learn#video',
        'name': 'PflegeBuddy Learn - Interaktives Lernen Tutorial',
        'description': 'Erfahren Sie, wie Sie mit PflegeBuddy Learn effektiv lernen können. Tägliche Quiz-Fragen zu Pflegegrundlagen, Hygiene und Medikamenten.',
        'thumbnailUrl': 'https://www.pflegebuddy.app/learn-tutorial-thumbnail.jpg',
        'uploadDate': '2024-01-15',
        'duration': 'PT3M45S',
        'contentUrl': 'https://www.pflegebuddy.app/videos/learn-tutorial.mp4',
        'embedUrl': 'https://www.pflegebuddy.app/embed/learn-tutorial',
        'interactionStatistic': {
          '@type': 'InteractionCounter',
          'interactionType': 'https://schema.org/WatchAction',
          'userInteractionCount': 1250
        },
        'publisher': {
          '@id': 'https://www.pflegebuddy.app/#organization'
        },
        'isPartOf': {
          '@id': 'https://www.pflegebuddy.app/de/learn'
        }
      },
      // SoftwareApplication Schema for mobile app
      {
        '@type': 'SoftwareApplication',
        'name': 'PflegeBuddy Learn',
        'applicationCategory': 'EducationalApplication',
        'operatingSystem': 'Web Browser, Android, iOS',
        'url': 'https://www.pflegebuddy.app',
        'description': 'Progressive Web App für interaktives Pflege-Lernen mit Offline-Funktionalität',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'EUR',
          'availability': 'https://schema.org/InStock'
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '4.6',
          'ratingCount': '89',
          'bestRating': '5',
          'worstRating': '1'
        },
        'fileSize': '15MB',
        'screenshot': [
          'https://www.pflegebuddy.app/screenshots/learn-page.jpg',
          'https://www.pflegebuddy.app/screenshots/quiz-interface.jpg',
          'https://www.pflegebuddy.app/screenshots/progress-tracking.jpg'
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
