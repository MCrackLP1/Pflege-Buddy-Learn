import { Metadata } from 'next';
import { LEGAL_CONFIG, getFullLegalAddress } from '@/lib/constants';
import { Mail, MapPin, Shield, Clock } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Kontakt | PflegeBuddy Learn',
    description: 'Kontaktieren Sie das PflegeBuddy Learn Team. Wir helfen Ihnen gerne weiter bei Fragen zur Pflege-Lernapp.',
  };
}

export default function KontaktPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    'name': 'Kontakt - PflegeBuddy Learn',
    'description': 'Kontaktieren Sie das PflegeBuddy Learn Team für Support und Fragen zur Pflege-Lernapp',
    'url': 'https://www.pflegebuddy.app/de/kontakt',
    'mainEntity': {
      '@type': 'Organization',
      'name': LEGAL_CONFIG.provider.brand,
      'contactPoint': {
        '@type': 'ContactPoint',
        'email': LEGAL_CONFIG.provider.email,
        'contactType': 'customer service',
        'areaServed': 'DE',
        'availableLanguage': 'German'
      },
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': LEGAL_CONFIG.provider.address.line1,
        'postalCode': LEGAL_CONFIG.provider.address.postcode,
        'addressLocality': LEGAL_CONFIG.provider.address.city,
        'addressRegion': LEGAL_CONFIG.provider.address.state,
        'addressCountry': 'DE'
      },
      'event': [
        {
          '@type': 'Event',
          'name': 'PflegeBuddy Learn Q&A Session',
          'description': 'Live Q&A Session mit dem PflegeBuddy Team. Stellen Sie Ihre Fragen zu Pflegeweiterbildung und lernen Sie von Experten.',
          'startDate': '2024-02-15T18:00:00+01:00',
          'endDate': '2024-02-15T19:00:00+01:00',
          'eventStatus': 'https://schema.org/EventScheduled',
          'eventAttendanceMode': 'https://schema.org/OnlineEventAttendanceMode',
          'location': {
            '@type': 'VirtualLocation',
            'url': 'https://www.pflegebuddy.app/live-qa'
          },
          'organizer': {
            '@id': 'https://www.pflegebuddy.app/#organization'
          },
          'performer': {
            '@type': 'Organization',
            'name': 'PflegeBuddy Team'
          },
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'EUR',
            'availability': 'https://schema.org/InStock',
            'validFrom': '2024-01-01'
          }
        },
        {
          '@type': 'Event',
          'name': 'Pflege Weiterbildung Webinar',
          'description': 'Kostenloses Webinar: "Digitale Weiterbildung in der Pflege - Trends und Möglichkeiten 2024"',
          'startDate': '2024-03-01T14:00:00+01:00',
          'endDate': '2024-03-01T15:30:00+01:00',
          'eventStatus': 'https://schema.org/EventScheduled',
          'eventAttendanceMode': 'https://schema.org/OnlineEventAttendanceMode',
          'location': {
            '@type': 'VirtualLocation',
            'url': 'https://www.pflegebuddy.app/webinar-2024'
          },
          'organizer': {
            '@id': 'https://www.pflegebuddy.app/#organization'
          },
          'about': {
            '@type': 'Thing',
            'name': 'Pflegeweiterbildung',
            'description': 'Digitale Lernmethoden und Weiterbildungsmöglichkeiten in der Pflege'
          }
        }
      ],
      'potentialAction': {
        '@type': 'CommunicateAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': 'mailto:deinpflegebuddy@gmail.com',
          'inLanguage': 'de-DE',
          'actionPlatform': [
            'http://schema.org/DesktopWebPlatform',
            'http://schema.org/MobileWebPlatform'
          ]
        }
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Kontakt</h1>
        <p className="text-muted-foreground">
          Haben Sie Fragen oder Feedback? Wir freuen uns auf Ihre Nachricht!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="space-y-6">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2 text-primary" />
              E-Mail Kontakt
            </h2>
            <p className="text-muted-foreground mb-4">
              Wir antworten in der Regel innerhalb von 24-48 Stunden.
            </p>
            <a 
              href={`mailto:${LEGAL_CONFIG.provider.email}`}
              className="text-primary hover:underline text-lg font-medium"
            >
              {LEGAL_CONFIG.provider.email}
            </a>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              Anschrift
            </h2>
            <div className="text-muted-foreground space-y-1">
              <p><strong>{LEGAL_CONFIG.provider.name}</strong></p>
              <p>{LEGAL_CONFIG.provider.brand}</p>
              <p>{getFullLegalAddress()}</p>
            </div>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Antwortzeiten
            </h2>
            <div className="text-muted-foreground space-y-2">
              <p><strong>Allgemeine Anfragen:</strong> 24-48 Stunden</p>
              <p><strong>Technische Probleme:</strong> 1-3 Werktage</p>
              <p><strong>Datenschutzanfragen:</strong> 1-2 Wochen</p>
            </div>
          </div>
        </div>

        {/* FAQ and Support */}
        <div className="space-y-6">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Häufige Fragen</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm mb-2">Ist PflegeBuddy kostenlos?</h3>
                <p className="text-muted-foreground text-sm">
                  Die Basis-Funktionen sind kostenlos nutzbar. Premium-Features sind gegen eine kleine Gebühr verfügbar.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm mb-2">Kann ich meine Daten exportieren?</h3>
                <p className="text-muted-foreground text-sm">
                  Ja, in Ihrem Profil können Sie alle Ihre Daten exportieren oder Ihr Konto löschen.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm mb-2">Ist dies medizinische Beratung?</h3>
                <p className="text-muted-foreground text-sm">
                  Nein, PflegeBuddy ist kein Ersatz für professionelle medizinische Beratung oder Notfallhilfe.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 border rounded-lg bg-orange-50 border-orange-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-orange-800">
              <Shield className="h-5 w-5 mr-2" />
              Medizinischer Notfall?
            </h2>
            <p className="text-orange-700 text-sm mb-3">
              Bei medizinischen Notfällen kontaktieren Sie bitte:
            </p>
            <div className="text-orange-800 font-medium space-y-1 text-sm">
              <p>🚨 <strong>Notruf: 112</strong> (Feuerwehr/Rettungsdienst)</p>
              <p>🏥 <strong>Ärztlicher Bereitschaftsdienst: 116 117</strong></p>
              <p>☎️ <strong>Giftnotruf: 089 19240</strong> (Bayern)</p>
            </div>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Feedback & Verbesserungen</h2>
            <p className="text-muted-foreground text-sm mb-3">
              Ihre Meinung ist uns wichtig! Teilen Sie uns mit:
            </p>
            <ul className="text-muted-foreground text-sm space-y-1 ml-4">
              <li>• Fehler oder Probleme in der App</li>
              <li>• Ideen für neue Features</li>
              <li>• Feedback zu Fragen oder Inhalten</li>
              <li>• Verbesserungsvorschläge</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Legal Notice */}
      <div className="p-4 bg-muted rounded-lg text-center">
        <p className="text-xs text-muted-foreground">
          <strong>Wichtiger Hinweis:</strong> PflegeBuddy Learn dient nur zu Bildungszwecken und ersetzt keine 
          professionelle medizinische Beratung, Diagnose oder Behandlung. Bei gesundheitlichen Problemen 
          wenden Sie sich an qualifizierte medizinische Fachkräfte.
        </p>
      </div>
      </div>
    </>
  );
}
