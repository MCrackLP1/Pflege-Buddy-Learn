import { Metadata } from 'next';
import { HelpCircle, Search, Users, BookOpen, Shield, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Häufig gestellte Fragen | PflegeBuddy Learn',
    description: 'Alle wichtigen Fragen zu PflegeBuddy Learn beantwortet. Erfahren Sie mehr über unser interaktives Lernquiz, Registrierung, Datenschutz und Funktionen.',
    keywords: 'FAQ, häufige Fragen, Pflege lernen, Quiz, Registrierung, Datenschutz, PflegeBuddy',
    alternates: {
      canonical: 'https://www.pflegebuddy.app/de/faq',
    },
    openGraph: {
      title: 'Häufig gestellte Fragen | PflegeBuddy Learn',
      description: 'Alle wichtigen Fragen zu PflegeBuddy Learn beantwortet.',
      url: 'https://www.pflegebuddy.app/de/faq',
      type: 'website',
    },
  };
}

export default function FAQPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'Wie funktioniert PflegeBuddy Learn?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'PflegeBuddy Learn ist eine interaktive Lernplattform für Pflegekräfte. Sie beantworten täglich neue Multiple-Choice Fragen zu verschiedenen Pflegethemen, sammeln XP-Punkte und verbessern kontinuierlich Ihr Fachwissen. Die Plattform ist kostenlos und erfordert keine Registrierung.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Ist PflegeBuddy Learn kostenlos?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Ja, PflegeBuddy Learn ist vollständig kostenlos. Alle Funktionen, Quiz-Fragen und Lerninhalte stehen Ihnen ohne jegliche Kosten zur Verfügung. Sie können die Plattform ohne Registrierung nutzen.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Für wen ist PflegeBuddy Learn geeignet?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'PflegeBuddy Learn ist geeignet für Pflegefachkräfte, Pflegehelfer, Auszubildende in der Pflege, examinierte Pflegekräfte und alle, die sich in der Pflege weiterbilden möchten. Auch pflegende Angehörige finden hier nützliche Informationen.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Wie werden die Fragen erstellt?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Alle Fragen werden von medizinischen Fachkräften entwickelt und basieren auf aktuellen Leitlinien von Organisationen wie dem Robert Koch-Institut (RKI), der Weltgesundheitsorganisation (WHO) und der Arbeitsgemeinschaft der Wissenschaftlichen Medizinischen Fachgesellschaften (AWMF).'
        }
      },
      {
        '@type': 'Question',
        'name': 'Wie sammle ich XP-Punkte?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Sie erhalten XP-Punkte für jede beantwortete Frage. Richtig beantwortete Fragen geben mehr Punkte als falsche. Zusätzlich erhalten Sie Boni für Lernstreaks (tägliches Lernen) und Meilensteine. Die Punkte helfen Ihnen, Ihren Lernfortschritt zu verfolgen.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Was ist der Ranked-Modus?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Im Ranked-Modus können Sie sich mit anderen Lernenden messen. Sie erhalten Punkte basierend auf der Schwierigkeit der Fragen und Ihrer Antwortgeschwindigkeit. Dies fördert den gesunden Wettbewerb und motiviert zum regelmäßigen Lernen.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Wie kann ich meinen Fortschritt verfolgen?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Auf Ihrem Profil können Sie Ihren Lernfortschritt in verschiedenen Kategorien einsehen. Sie sehen, wie viele Fragen Sie pro Thema beantwortet haben, Ihre XP-Punkte, Lernstreaks und erreichte Meilensteine. So behalten Sie immer den Überblick über Ihre Entwicklung.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Sind meine Daten sicher?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Ja, der Datenschutz hat für uns höchste Priorität. Wir halten uns strikt an die DSGVO-Richtlinien. Ihre Lernfortschritte werden lokal in Ihrem Browser gespeichert und nicht an Server übertragen, es sei denn, Sie registrieren sich freiwillig. Wir verwenden keine Tracking-Cookies ohne Ihre Zustimmung.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Kann ich mich registrieren?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Eine Registrierung ist optional und kostenlos. Mit einem Account können Sie Ihre Lernfortschritte geräteübergreifend synchronisieren und an erweiterten Funktionen teilnehmen. Ohne Registrierung können Sie die Plattform trotzdem voll nutzen.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Wie oft werden neue Fragen hinzugefügt?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Wir fügen kontinuierlich neue Fragen hinzu, um Ihnen stets frische Lerninhalte zu bieten. In der Regel kommen mehrmals pro Woche neue Fragen zu verschiedenen Pflegethemen hinzu. Zusätzlich aktualisieren wir regelmäßig vorhandene Fragen entsprechend aktueller Leitlinien.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Kann ich die Plattform auf dem Smartphone nutzen?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Ja, PflegeBuddy Learn ist vollständig für mobile Geräte optimiert. Die Plattform funktioniert einwandfrei auf Smartphones und Tablets. Wir empfehlen die Nutzung über den Browser Ihres Mobilgeräts für die beste Erfahrung.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Was passiert bei falschen Antworten?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Falsche Antworten sind Teil des Lernprozesses! Bei jeder Frage erhalten Sie eine detaillierte Erklärung, warum die Antwort richtig oder falsch ist. Dies hilft Ihnen, Ihr Wissen zu vertiefen und Missverständnisse zu korrigieren. Sie erhalten weniger XP-Punkte, aber das Lernen steht im Vordergrund.'
        }
      }
    ]
  };

  const faqCategories = [
    {
      title: 'Plattform & Funktionen',
      icon: <BookOpen className="h-6 w-6" />,
      questions: faqSchema.mainEntity.slice(0, 4)
    },
    {
      title: 'Lernen & Fortschritt',
      icon: <Award className="h-6 w-6" />,
      questions: faqSchema.mainEntity.slice(4, 8)
    },
    {
      title: 'Datenschutz & Technik',
      icon: <Shield className="h-6 w-6" />,
      questions: faqSchema.mainEntity.slice(8, 12)
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
            <HelpCircle className="h-8 w-8 text-blue-600" />
            Häufig gestellte Fragen
          </h1>
          <p className="text-muted-foreground text-lg">
            Hier finden Sie Antworten auf die wichtigsten Fragen zu PflegeBuddy Learn
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Suchen Sie nach Fragen..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {category.icon}
                  </div>
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {category.questions.map((faq: { '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }, index: number) => (
                    <details key={index} className="group">
                      <summary className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                        <span className="font-medium text-left pr-4">
                          {faq.name}
                        </span>
                        <span className="text-2xl group-open:rotate-45 transition-transform text-gray-400">
                          +
                        </span>
                      </summary>
                      <div className="mt-2 p-4 bg-white border border-gray-100 rounded-lg">
                        <p className="text-muted-foreground leading-relaxed">
                          {faq.acceptedAnswer.text}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact CTA */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-green-900">
              Haben Sie weitere Fragen?
            </h3>
            <p className="text-green-800 mb-4">
              Wir helfen Ihnen gerne weiter! Kontaktieren Sie unser Team für individuelle Unterstützung.
            </p>
            <a
              href="/de/kontakt"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Kontakt aufnehmen
            </a>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Schnellzugriff</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/de/learn" className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors">
              <BookOpen className="h-4 w-4 mr-2" />
              Jetzt lernen
            </a>
            <a href="/de/ueber-uns" className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors">
              <Users className="h-4 w-4 mr-2" />
              Über uns
            </a>
            <a href="/de/datenschutz" className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
              <Shield className="h-4 w-4 mr-2" />
              Datenschutz
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
