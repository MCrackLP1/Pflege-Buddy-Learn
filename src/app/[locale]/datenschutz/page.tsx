import { Metadata } from 'next';
import { LEGAL_CONFIG, LEGAL_CONTENT, getFullLegalAddress } from '@/lib/constants';
import Link from 'next/link';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Datenschutzerklärung | PflegeBuddy Learn',
    description: 'Datenschutzerklärung gemäß DSGVO für PflegeBuddy Learn',
  };
}

export default function DatenschutzPage() {

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Datenschutzerklärung</h1>
        <p className="text-muted-foreground">
          Gemäß DSGVO • Version {LEGAL_CONFIG.versions.privacy} • Stand: {LEGAL_CONTENT.lastUpdated}
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Datenschutz auf einen Blick</h2>

          <h3 className="text-xl font-medium">Allgemeine Hinweise</h3>
          <p>
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
            personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene
            Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
          </p>

          <h3 className="text-xl font-medium">Verantwortlicher</h3>
          <div className="bg-muted p-4 rounded-lg">
            <p><strong>{LEGAL_CONFIG.provider.name}</strong></p>
            <p>{LEGAL_CONFIG.provider.brand}</p>
            <p>{getFullLegalAddress()}</p>
            <p>E-Mail: {LEGAL_CONFIG.provider.email}</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Datenerfassung auf dieser Website</h2>

          <h3 className="text-xl font-medium">Cookies</h3>
          <p>
            Unsere Internetseiten verwenden teilweise so genannte Cookies. Cookies richten
            auf Ihrem Rechner keinen Schaden an und enthalten keine Viren. Cookies dienen dazu,
            unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen.
          </p>
          <p>
            Sie können Ihre Cookie-Einstellungen jederzeit ändern:{' '}
            <Link href="/cookie-einstellungen" className="text-primary hover:underline">
              Cookie-Einstellungen
            </Link>
          </p>

          <h3 className="text-xl font-medium">Server-Log-Dateien</h3>
          <p>
            Der Provider der Seiten erhebt und speichert automatisch Informationen in so
            genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt.
            Dies sind:
          </p>
          <ul className="list-disc pl-6">
            <li>Browsertyp und Browserversion</li>
            <li>verwendetes Betriebssystem</li>
            <li>Referrer URL</li>
            <li>Hostname des zugreifenden Rechners</li>
            <li>Uhrzeit der Serveranfrage</li>
            <li>IP-Adresse</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Zwecke und Rechtsgrundlagen der Verarbeitung</h2>

          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium">Authentifizierung (Art. 6 Abs. 1 lit. b DSGVO)</h4>
              <p>Supabase verarbeitet Ihre Daten für die Benutzeranmeldung und -verwaltung.</p>
              <p className="text-sm text-muted-foreground">DPA: {LEGAL_CONFIG.processors.supabase}</p>
            </div>


            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-medium">Hosting und Bereitstellung (Art. 6 Abs. 1 lit. f DSGVO)</h4>
              <p>Vercel stellt die technische Infrastruktur für die App bereit.</p>
              <p className="text-sm text-muted-foreground">DPA: {LEGAL_CONFIG.processors.vercel}</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Ihre Rechte</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Auskunftsrecht (Art. 15 DSGVO)</h4>
              <p className="text-sm">Sie haben das Recht, Auskunft über die Verarbeitung Ihrer Daten zu erhalten.</p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Berichtigungsrecht (Art. 16 DSGVO)</h4>
              <p className="text-sm">Sie haben das Recht auf Berichtigung unrichtiger Daten.</p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Löschungsrecht (Art. 17 DSGVO)</h4>
              <p className="text-sm">Sie haben das Recht auf Löschung Ihrer Daten unter bestimmten Voraussetzungen.</p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Einschränkungsrecht (Art. 18 DSGVO)</h4>
              <p className="text-sm">Sie haben das Recht auf Einschränkung der Verarbeitung.</p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Datenübertragbarkeit (Art. 20 DSGVO)</h4>
              <p className="text-sm">Sie haben das Recht, Ihre Daten in einem strukturierten Format zu erhalten.</p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Widerspruchsrecht (Art. 21 DSGVO)</h4>
              <p className="text-sm">Sie haben das Recht, der Verarbeitung Ihrer Daten zu widersprechen.</p>
            </div>
          </div>

          <p>
            Zur Ausübung Ihrer Rechte kontaktieren Sie uns bitte über:{' '}
            <a href={`mailto:${LEGAL_CONFIG.provider.email}`} className="text-primary hover:underline">
              {LEGAL_CONFIG.provider.email}
            </a>
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Datenspeicherung und -löschung</h2>
          <p>
            Personenbezogene Daten werden nur so lange gespeichert, wie es für die genannten
            Zwecke erforderlich ist oder wie es gesetzliche Aufbewahrungspflichten vorschreiben.
            Nach Wegfall des Zwecks oder Ablauf der Aufbewahrungspflichten werden die Daten
            routinemäßig und entsprechend den gesetzlichen Vorschriften gelöscht.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Internationale Datenübermittlung</h2>
          <p>
            Ihre Daten können in Länder außerhalb der EU übermittelt werden. Wir stellen
            sicher, dass angemessene Schutzmaßnahmen getroffen werden, um den Schutz Ihrer
            Daten zu gewährleisten.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">7. Beschwerderecht</h2>
          <p>
            Sie haben das Recht, sich bei einer Aufsichtsbehörde zu beschweren. Die für uns
            zuständige Aufsichtsbehörde ist:
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p><strong>Bayerisches Landesamt für Datenschutzaufsicht</strong></p>
            <p>Promenade 18</p>
            <p>91522 Ansbach</p>
            <p>Telefon: +49 981 180093-0</p>
            <p>E-Mail: poststelle@lda.bayern.de</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">8. Datensicherheit</h2>
          <p>
            Wir verwenden technische und organisatorische Sicherheitsmaßnahmen, um Ihre
            personenbezogenen Daten gegen zufällige oder vorsätzliche Manipulationen,
            Verlust, Zerstörung oder gegen den Zugriff unberechtigter Personen zu schützen.
          </p>
        </section>
      </div>
    </div>
  );
}
