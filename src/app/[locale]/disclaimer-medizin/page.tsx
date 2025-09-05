import { Metadata } from 'next';
import { LEGAL_CONFIG, LEGAL_CONTENT } from '@/lib/constants';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Medizinischer Haftungsausschluss | PflegeBuddy Learn',
    description: 'Wichtiger medizinischer Haftungsausschluss für PflegeBuddy Learn',
  };
}

export default function DisclaimerMedizinPage() {

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Medizinischer Haftungsausschluss</h1>
        <p className="text-muted-foreground">
          Wichtige rechtliche Hinweise • Stand: {LEGAL_CONTENT.lastUpdated}
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <div className="bg-red-50 dark:bg-red-950 p-6 rounded-lg border-l-4 border-red-400 mb-8">
          <div className="flex items-center mb-4">
            <div className="text-red-600 dark:text-red-400 mr-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-800 dark:text-red-200">
              WICHTIGER HINWEIS
            </h2>
          </div>

          <p className="text-lg font-medium text-red-800 dark:text-red-200 mb-4">
            {LEGAL_CONTENT.common.de.noMedicalAdvice}
          </p>

          <p className="text-red-700 dark:text-red-300">
            Diese App ist kein Ersatz für professionelle medizinische Beratung, Diagnose oder Behandlung.
            Bei gesundheitlichen Problemen oder Notfällen wenden Sie sich bitte sofort an qualifiziertes
            medizinisches Fachpersonal oder rufen Sie den Notruf 112.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Zweck der App</h2>
          <p>
            PflegeBuddy Learn dient ausschließlich der Wissensvermittlung und dem Lernen
            für Pflegekräfte und Auszubildende im Gesundheitswesen. Die Inhalte basieren
            auf allgemeinen pflegerischen Grundsätzen und sollen das Verständnis fördern.
          </p>
          <p>
            Die App ist kein medizinisches Gerät im Sinne des Medizinproduktegesetzes (MPG)
            und erhebt keinen Anspruch auf medizinische Genauigkeit oder Vollständigkeit.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Keine individuelle Beratung</h2>
          <p>
            Die Inhalte dieser App sind allgemeiner Natur und berücksichtigen nicht die
            individuellen Umstände eines konkreten Falls. Medizinische Entscheidungen
            müssen immer auf der Grundlage einer individuellen Bewertung durch qualifiziertes
            Fachpersonal getroffen werden.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Keine Notfallhilfe</h2>
          <p>
            Diese App bietet keine Notfallhilfe und ist nicht für den Einsatz in
            akuten medizinischen Situationen geeignet. Bei Notfällen:
          </p>
          <ul className="list-disc pl-6">
            <li>Rufen Sie sofort den Notruf 112</li>
            <li>Begeben Sie sich in die nächste Notaufnahme</li>
            <li>Nutzen Sie keine Selbstbehandlung ohne ärztlichen Rat</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Qualitätssicherung</h2>
          <p>
            Die Inhalte der App werden sorgfältig zusammengestellt und regelmäßig
            überprüft. Dennoch können Fehler oder veraltete Informationen nicht
            vollständig ausgeschlossen werden.
          </p>
          <p>
            Wir sind dankbar für Rückmeldungen zu Inhalten und streben eine
            kontinuierliche Verbesserung an.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Haftungsausschluss</h2>
          <p>
            Der Betreiber dieser App übernimmt keine Haftung für Schäden, die aus
            der Nutzung oder Nichtnutzung der bereitgestellten Informationen entstehen.
          </p>
          <p>
            Dies gilt insbesondere für:
          </p>
          <ul className="list-disc pl-6">
            <li>Falsche Anwendung von Informationen</li>
            <li>Fehlerhafte oder unvollständige Inhalte</li>
            <li>Technische Probleme oder Ausfälle</li>
            <li>Individuelle Gesundheitsschäden</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Quellen und Aktualität</h2>
          <p>
            Die Inhalte basieren auf anerkannten pflegerischen Standards und Leitlinien.
            Wo möglich, werden Quellen angegeben und verlinkt. Medizinische Leitlinien
            ändern sich jedoch kontinuierlich, daher können Inhalte veralten.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Datenschutz</h2>
          <p>
            Ihre Gesundheitsdaten werden nicht gespeichert oder verarbeitet.
            Die App sammelt nur technische Daten zur Verbesserung des Dienstes,
            wie in unserer Datenschutzerklärung beschrieben.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Kontakt bei Bedenken</h2>
          <p>
            Wenn Sie Bedenken bezüglich der Inhalte haben oder Fehler entdecken,
            kontaktieren Sie uns bitte:
          </p>

          <div className="bg-muted p-4 rounded-lg">
            <p><strong>{LEGAL_CONFIG.provider.name}</strong></p>
            <p>E-Mail: {LEGAL_CONFIG.provider.email}</p>
            <p>Betreff: &quot;Inhaltliche Bedenken PflegeBuddy Learn&quot;</p>
          </div>
        </section>

        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mt-8">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Letzte Überprüfung:</strong> {LEGAL_CONTENT.lastUpdated}
            <br />
            <strong>Nächste geplante Überprüfung:</strong> Alle 6 Monate oder bei wesentlichen Änderungen der medizinischen Leitlinien
          </p>
        </div>
      </div>
    </div>
  );
}
