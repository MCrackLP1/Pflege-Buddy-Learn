import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LEGAL_CONFIG, LEGAL_CONTENT } from '@/lib/constants';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale });

  return {
    title: 'Cookie-Richtlinie | PflegeBuddy Learn',
    description: 'Cookie-Richtlinie und Datenschutzbestimmungen für PflegeBuddy Learn',
  };
}

export default function CookiesPage({ params }: { params: { locale: string } }) {
  const isGerman = params.locale === 'de';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Cookie-Richtlinie</h1>
        <p className="text-muted-foreground">
          Cookie- und Tracking-Richtlinie • Version {LEGAL_CONFIG.versions.cookie} • Stand: {LEGAL_CONTENT.lastUpdated}
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Was sind Cookies?</h2>
          <p>
            Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden,
            wenn Sie unsere Website besuchen. Sie helfen uns, Ihnen ein besseres
            Nutzererlebnis zu bieten und unsere Dienste zu verbessern.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Cookie-Kategorien</h2>

          <div className="space-y-6">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-xl font-medium text-green-700 dark:text-green-300">Essenzielle Cookies</h3>
              <p className="mb-2">Diese Cookies sind für den Betrieb der Website unbedingt erforderlich.</p>
              <div className="bg-green-50 dark:bg-green-950 p-3 rounded">
                <p className="text-sm"><strong>Anbieter:</strong> {LEGAL_CONFIG.cookieCategories.essential.providers.join(', ')}</p>
                <p className="text-sm"><strong>Zweck:</strong> Authentifizierung, Sicherheit, grundlegende Funktionalität</p>
                <p className="text-sm"><strong>Speicherdauer:</strong> Session bis 1 Jahr</p>
                <p className="text-sm"><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</p>
              </div>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-xl font-medium text-blue-700 dark:text-blue-300">Funktionale Cookies</h3>
              <p className="mb-2">Diese Cookies verbessern die Benutzerfreundlichkeit und merken sich Ihre Präferenzen.</p>
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded">
                <p className="text-sm"><strong>Anbieter:</strong> {LEGAL_CONFIG.cookieCategories.functional.providers.join(', ')}</p>
                <p className="text-sm"><strong>Zweck:</strong> Sprachauswahl, Theme-Einstellungen, Personalisierung</p>
                <p className="text-sm"><strong>Speicherdauer:</strong> 1 Jahr</p>
                <p className="text-sm"><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</p>
              </div>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-xl font-medium text-purple-700 dark:text-purple-300">Analyse-Cookies</h3>
              <p className="mb-2">Diese Cookies helfen uns zu verstehen, wie unsere Website genutzt wird.</p>
              <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded">
                <p className="text-sm"><strong>Anbieter:</strong> {LEGAL_CONFIG.cookieCategories.analytics.providers.join(', ')}</p>
                <p className="text-sm"><strong>Zweck:</strong> Nutzungsanalyse, Fehlerbehebung, Performance-Monitoring</p>
                <p className="text-sm"><strong>Speicherdauer:</strong> 26 Monate</p>
                <p className="text-sm"><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</p>
              </div>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="text-xl font-medium text-orange-700 dark:text-orange-300">Marketing-Cookies</h3>
              <p className="mb-2">Diese Cookies werden verwendet, um Werbung zu personalisieren.</p>
              <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded">
                <p className="text-sm"><strong>Anbieter:</strong> {LEGAL_CONFIG.cookieCategories.marketing.providers.join(', ')}</p>
                <p className="text-sm"><strong>Zweck:</strong> Personalisierte Werbung, Conversion-Tracking</p>
                <p className="text-sm"><strong>Speicherdauer:</strong> 13 Monate</p>
                <p className="text-sm"><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Ihre Cookie-Einstellungen</h2>
          <p>
            Sie können Ihre Cookie-Einstellungen jederzeit ändern oder widerrufen.
            Essenzielle Cookies können nicht deaktiviert werden, da sie für den
            Betrieb der Website erforderlich sind.
          </p>

          <div className="bg-muted p-4 rounded-lg">
            <p className="mb-2"><strong>Cookie-Einstellungen ändern:</strong></p>
            <Link href="/cookie-einstellungen" className="text-primary hover:underline">
              Cookie-Einstellungen öffnen →
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Browser-Einstellungen</h2>
          <p>
            Sie können Cookies auch über die Einstellungen Ihres Browsers verwalten.
            Beachten Sie jedoch, dass die Deaktivierung von Cookies die Funktionalität
            unserer Website einschränken kann.
          </p>

          <div className="space-y-2 text-sm">
            <p><strong>Chrome:</strong> Einstellungen → Datenschutz und Sicherheit → Cookies</p>
            <p><strong>Firefox:</strong> Einstellungen → Datenschutz & Sicherheit → Cookies</p>
            <p><strong>Safari:</strong> Einstellungen → Datenschutz → Cookies verwalten</p>
            <p><strong>Edge:</strong> Einstellungen → Cookies und Websiteberechtigungen</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Datenverarbeitung und Speicherung</h2>
          <p>
            Cookie-Daten werden gemäß unserer Datenschutzerklärung verarbeitet.
            Essenzielle Cookies werden für die Dauer Ihrer Session gespeichert.
            Andere Cookies haben eine begrenzte Speicherdauer und werden automatisch gelöscht.
          </p>

          <p>
            Weitere Informationen finden Sie in unserer{' '}
            <Link href="/datenschutz" className="text-primary hover:underline">
              Datenschutzerklärung
            </Link>
            .
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Internationale Datenübermittlung</h2>
          <p>
            Einige unserer Dienstleister (z. B. Google, Vercel) haben Server in den USA
            oder anderen Ländern außerhalb der EU. In diesen Fällen stellen wir sicher,
            dass angemessene Schutzmaßnahmen (z. B. Standardvertragsklauseln) getroffen werden.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Ihre Rechte</h2>
          <p>
            Sie haben das Recht, Auskunft über die von uns gespeicherten Daten zu erhalten,
            diese zu berichtigen oder zu löschen. Bei Fragen zu Cookies kontaktieren Sie uns bitte.
          </p>

          <div className="bg-muted p-4 rounded-lg">
            <p><strong>Kontakt:</strong></p>
            <p>E-Mail: {LEGAL_CONFIG.provider.email}</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Änderungen dieser Richtlinie</h2>
          <p>
            Wir behalten uns das Recht vor, diese Cookie-Richtlinie zu aktualisieren.
            Wesentliche Änderungen werden Ihnen mitgeteilt. Die weitere Nutzung unserer
            Website gilt als Zustimmung zu den geänderten Bedingungen.
          </p>
        </section>
      </div>
    </div>
  );
}
