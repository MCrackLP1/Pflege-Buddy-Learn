import { Metadata } from 'next';
import { LEGAL_CONFIG, LEGAL_CONTENT, getFullLegalAddress, getVatNotice } from '@/lib/constants';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Impressum | PflegeBuddy Learn',
    description: 'Impressum und rechtliche Informationen gemäß § 5 TMG',
  };
}

export default function ImpressumPage() {

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Impressum</h1>
        <p className="text-muted-foreground">
          Angaben gemäß § 5 TMG • Stand: {LEGAL_CONTENT.lastUpdated}
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Angaben gemäß § 5 TMG</h2>

          <div className="bg-muted p-6 rounded-lg space-y-3">
            <div>
              <strong>{LEGAL_CONFIG.provider.name}</strong>
              <br />
              {LEGAL_CONFIG.provider.brand}
            </div>

            <div>
              <strong>Adresse:</strong>
              <br />
              {getFullLegalAddress()}
            </div>

            <div>
              <strong>Kontakt:</strong>
              <br />
              E-Mail: {LEGAL_CONFIG.provider.email}
              {LEGAL_CONFIG.provider.phone && (
                <>
                  <br />
                  Telefon: {LEGAL_CONFIG.provider.phone}
                </>
              )}
            </div>

            {LEGAL_CONFIG.provider.vatId && (
              <div>
                <strong>Umsatzsteuer-ID:</strong>
                <br />
                {LEGAL_CONFIG.provider.vatId}
              </div>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <p className="text-sm">
              <strong>Hinweis zur Umsatzsteuer:</strong> {getVatNotice()}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
          <p>{LEGAL_CONFIG.provider.name}</p>
          <p>{getFullLegalAddress()}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Haftungsausschluss</h2>

          <h3 className="text-xl font-medium">Haftung für Inhalte</h3>
          <p>
            Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
            Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
            nach den allgemeinen Gesetzen verantwortlich.
          </p>

          <h3 className="text-xl font-medium">Haftung für Links</h3>
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
            Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
            Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
            der Seiten verantwortlich.
          </p>

          <h3 className="text-xl font-medium">Urheberrecht</h3>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
            dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
            der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
            Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Medizinische Haftungsausschluss</h2>
          <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border-l-4 border-red-400">
            <p className="font-medium text-red-800 dark:text-red-200">
              {LEGAL_CONTENT.common.de.noMedicalAdvice}
            </p>
            <p className="mt-2 text-sm">
              Die Inhalte dieser App dienen ausschließlich der Wissensvermittlung und ersetzen
              nicht die Beratung durch qualifiziertes medizinisches Fachpersonal. Bei gesundheitlichen
              Beschwerden oder Notfällen wenden Sie sich bitte an einen Arzt oder rufen Sie den
              Notruf 112.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Streitbeilegung</h2>
          <p>{LEGAL_CONTENT.common.de.euOdr}</p>
          <p>{LEGAL_CONTENT.common.de.vsbgNotice}</p>
        </section>
      </div>
    </div>
  );
}
