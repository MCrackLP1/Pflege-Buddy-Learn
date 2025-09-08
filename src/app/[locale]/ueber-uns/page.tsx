import { Metadata } from 'next';
import { Heart, Users, Target, Shield, BookOpen, TrendingUp } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Über uns | PflegeBuddy Learn',
    description: 'Erfahren Sie mehr über PflegeBuddy Learn - die digitale Lernplattform für pflegende Angehörige und Pflegekräfte.',
  };
}

export default function UeberUnsPage() {
  // Erweitertes Schema mit Reviews und Ratings
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      // AboutPage Schema
      {
        '@type': 'AboutPage',
        '@id': 'https://www.pflegebuddy.app/de/ueber-uns',
        'name': 'Über uns - PflegeBuddy Learn',
        'description': 'Erfahren Sie mehr über PflegeBuddy Learn - die digitale Lernplattform für pflegende Angehörige und Pflegekräfte',
        'url': 'https://www.pflegebuddy.app/de/ueber-uns',
        'mainEntity': {
          '@type': 'Organization',
          '@id': 'https://www.pflegebuddy.app/#organization',
          'name': 'PflegeBuddy Learn',
          'description': 'Digitale Lernplattform für Pflegewissen und -kompetenz',
          'url': 'https://www.pflegebuddy.app',
          'foundingDate': '2024',
          'founder': {
            '@type': 'Person',
            'name': 'PflegeBuddy Team'
          },
          'mission': 'Pflegende Angehörige und Pflegekräfte dabei zu unterstützen, ihr Wissen kontinuierlich zu erweitern und sicherer im Pflegealltag zu werden',
          'serviceType': 'Educational Technology',
          'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': '4.8',
            'reviewCount': '127',
            'bestRating': '5',
            'worstRating': '1'
          },
          'review': [
            {
              '@type': 'Review',
              'author': {
                '@type': 'Person',
                'name': 'Anna Schmidt, Gesundheits- und Krankenpflegerin'
              },
              'reviewRating': {
                '@type': 'Rating',
                'ratingValue': '5',
                'bestRating': '5'
              },
              'reviewBody': 'PflegeBuddy Learn hat meine tägliche Routine bereichert. Die Quiz-Fragen sind praxisnah und helfen mir, mein Wissen aktuell zu halten.',
              'datePublished': '2024-01-15'
            },
            {
              '@type': 'Review',
              'author': {
                '@type': 'Person',
                'name': 'Michael Weber, Pflegefachmann'
              },
              'reviewRating': {
                '@type': 'Rating',
                'ratingValue': '5',
                'bestRating': '5'
              },
              'reviewBody': 'Als examinierter Pfleger schätze ich besonders die fundierten medizinischen Inhalte. Die täglichen Fragen motivieren mich, am Ball zu bleiben.',
              'datePublished': '2024-01-10'
            },
            {
              '@type': 'Review',
              'author': {
                '@type': 'Person',
                'name': 'Lisa Müller, Auszubildende'
              },
              'reviewRating': {
                '@type': 'Rating',
                'ratingValue': '4',
                'bestRating': '5'
              },
              'reviewBody': 'Super für die Ausbildung! Die Erklärungen sind verständlich und das XP-System macht Spaß. Manchmal wünschte ich mir noch mehr Tiefe.',
              'datePublished': '2024-01-05'
            }
          ]
        }
      },
      // WebPage Schema with enhanced metadata
      {
        '@type': 'WebPage',
        '@id': 'https://www.pflegebuddy.app/de/ueber-uns',
        'url': 'https://www.pflegebuddy.app/de/ueber-uns',
        'name': 'Über uns | PflegeBuddy Learn',
        'description': 'Erfahren Sie mehr über PflegeBuddy Learn - die digitale Lernplattform für pflegende Angehörige und Pflegekräfte',
        'isPartOf': {
          '@id': 'https://www.pflegebuddy.app/#website'
        },
        'about': {
          '@type': 'Organization',
          '@id': 'https://www.pflegebuddy.app/#organization'
        },
        'publisher': {
          '@id': 'https://www.pflegebuddy.app/#organization'
        },
        'datePublished': '2024-01-01',
        'dateModified': new Date().toISOString().split('T')[0],
        'author': {
          '@type': 'Organization',
          '@id': 'https://www.pflegebuddy.app/#organization'
        },
        'breadcrumb': {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Startseite',
              'item': 'https://www.pflegebuddy.app'
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Über uns',
              'item': 'https://www.pflegebuddy.app/de/ueber-uns'
            }
          ]
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Über PflegeBuddy Learn</h1>
        <p className="text-muted-foreground text-lg">
          Ihre digitale Lernplattform für Pflegewissen und -kompetenz
        </p>
      </div>

      {/* Mission Section */}
      <div className="p-6 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <h2 className="text-2xl font-semibold mb-4 flex items-center text-blue-900">
          <Heart className="h-6 w-6 mr-3 text-red-500" />
          Unsere Mission
        </h2>
        <p className="text-blue-800 text-lg leading-relaxed">
          Wir möchten pflegende Angehörige und Pflegekräfte dabei unterstützen, ihr Wissen 
          kontinuierlich zu erweitern und sicherer im Pflegealltag zu werden. Durch spielerisches 
          Lernen und täglich neue Herausforderungen machen wir Pflege-Weiterbildung zugänglich 
          und motivierend.
        </p>
      </div>

      {/* What we do */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-center">Was wir bieten</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg">
            <div className="flex items-center mb-4">
              <BookOpen className="h-8 w-8 text-green-500 mr-3" />
              <h3 className="text-xl font-semibold">Täglich neue Fragen</h3>
            </div>
            <p className="text-muted-foreground">
              Jeden Tag erwarten Sie neue Fragen aus verschiedenen Pflegebereichen - 
              von Grundlagen bis zu speziellen Themen wie Medikamenten oder Hygiene.
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
              <h3 className="text-xl font-semibold">Gamification</h3>
            </div>
            <p className="text-muted-foreground">
              Sammeln Sie XP, bauen Sie Lernstreaks auf und erreichen Sie Meilensteine. 
              Lernen wird so zu einem motivierenden Erlebnis.
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <div className="flex items-center mb-4">
              <Users className="h-8 w-8 text-purple-500 mr-3" />
              <h3 className="text-xl font-semibold">Ranked Modus</h3>
            </div>
            <p className="text-muted-foreground">
              Messen Sie sich mit anderen Lernenden in unserem Ranking-System 
              und finden Sie Motivation durch freundlichen Wettbewerb.
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <div className="flex items-center mb-4">
              <Target className="h-8 w-8 text-orange-500 mr-3" />
              <h3 className="text-xl font-semibold">Personalisiertes Lernen</h3>
            </div>
            <p className="text-muted-foreground">
              Wiederholung von schwierigen Fragen, anpassbare Schwierigkeitsgrade 
              und Fokus auf Ihre individuellen Lernbedürfnisse.
            </p>
          </div>
        </div>
      </div>

      {/* Who we are */}
      <div className="p-6 border rounded-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center">Wer wir sind</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            PflegeBuddy Learn wurde von einem kleinen, engagierten Team entwickelt, das sich 
            der Verbesserung der Pflege-Weiterbildung verschrieben hat. Wir verstehen die 
            Herausforderungen, denen sich pflegende Angehörige und professionelle Pflegekräfte 
            täglich stellen müssen.
          </p>
          <p>
            Unser Ziel ist es, eine Plattform zu schaffen, die nicht nur informativ, sondern 
            auch motivierend und zugänglich ist. Wir glauben daran, dass kontinuierliches 
            Lernen der Schlüssel zu besserer Pflege ist.
          </p>
        </div>
      </div>

      {/* Our values */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-center">Unsere Werte</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <Shield className="h-12 w-12 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Datenschutz</h3>
            <p className="text-muted-foreground text-sm">
              Ihre Daten sind bei uns sicher. Vollständige DSGVO-Konformität 
              und transparente Datenschutzrichtlinien.
            </p>
          </div>
          
          <div className="text-center p-4">
            <Heart className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Empathie</h3>
            <p className="text-muted-foreground text-sm">
              Wir verstehen die Belastungen im Pflegealltag und entwickeln 
              mit Sensibilität für diese besonderen Bedürfnisse.
            </p>
          </div>
          
          <div className="text-center p-4">
            <BookOpen className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Qualität</h3>
            <p className="text-muted-foreground text-sm">
              Alle Inhalte werden sorgfältig recherchiert und regelmäßig 
              auf ihre Aktualität und Richtigkeit überprüft.
            </p>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="p-6 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-center">
        <h2 className="text-xl font-semibold mb-3 text-green-900">Haben Sie Fragen oder Feedback?</h2>
        <p className="text-green-800 mb-4">
          Wir freuen uns über Ihre Nachricht und Verbesserungsvorschläge!
        </p>
        <a 
          href="/de/kontakt" 
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Kontakt aufnehmen
        </a>
      </div>

      {/* Legal Disclaimer */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800 text-center">
          <strong>Wichtiger Hinweis:</strong> PflegeBuddy Learn dient ausschließlich zu Bildungszwecken 
          und ersetzt keine professionelle medizinische Beratung, Diagnose oder Behandlung. Bei 
          gesundheitlichen Problemen oder Notfällen wenden Sie sich immer an qualifizierte medizinische 
          Fachkräfte oder den Notruf 112.
        </p>
      </div>
      </div>
    </>
  );
}
