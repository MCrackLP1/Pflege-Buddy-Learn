import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LEGAL_CONFIG, LEGAL_CONTENT } from '@/lib/constants';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale });

  return {
    title: 'AGB | PflegeBuddy Learn',
    description: 'Allgemeine Geschäftsbedingungen für PflegeBuddy Learn',
  };
}

export default function AgbPage({ params }: { params: { locale: string } }) {
  const isGerman = params.locale === 'de';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Allgemeine Geschäftsbedingungen</h1>
        <p className="text-muted-foreground">
          Nutzungsbedingungen für PflegeBuddy Learn • Version {LEGAL_CONFIG.versions.terms} • Stand: {LEGAL_CONTENT.lastUpdated}
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Geltungsbereich</h2>
          <p>
            Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der
            mobilen Webanwendung "PflegeBuddy Learn" (nachfolgend "App") durch natürliche
            Personen (nachfolgend "Nutzer").
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Leistungsbeschreibung</h2>
          <p>
            PflegeBuddy Learn ist eine Bildungsplattform für Pflegekräfte und Auszubildende
            im Gesundheitswesen. Die App bietet:
          </p>
          <ul className="list-disc pl-6">
            <li>Lernmodule und Quizfragen zu pflegerischen Themen</li>
            <li>Virtuelle Gegenstände (Hinweise, Zeit-Boosts, etc.)</li>
            <li>Fortschrittsverfolgung und Gamification-Elemente</li>
          </ul>

          <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border-l-4 border-red-400 mt-4">
            <p className="font-medium text-red-800 dark:text-red-200">
              {LEGAL_CONTENT.common.de.noMedicalAdvice}
            </p>
            <p className="mt-2 text-sm">
              Die App dient ausschließlich der Wissensvermittlung und ersetzt nicht die
              Beratung durch qualifiziertes medizinisches Fachpersonal.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Nutzungslizenz</h2>
          <p>
            Der Anbieter gewährt dem Nutzer eine nicht-exklusive, nicht-übertragbare
            Lizenz zur Nutzung der App für persönliche, nicht-kommerzielle Zwecke.
            Die Lizenz ist zeitlich unbefristet, solange diese AGB eingehalten werden.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Registrierung und Konto</h2>
          <p>
            Die Nutzung der App erfordert eine Registrierung. Der Nutzer verpflichtet sich,
            wahrheitsgemäße Angaben zu machen und diese aktuell zu halten.
          </p>
          <p>
            Das Konto ist nicht übertragbar und darf nur von einer Person genutzt werden.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Virtuelle Gegenstände</h2>
          <p>
            Die App bietet virtuelle Gegenstände (Hinweise, Zeit-Boosts, Schilde etc.)
            zum Erwerb. Diese Gegenstände:
          </p>
          <ul className="list-disc pl-6">
            <li>Sind nicht erstattungsfähig, außer bei Mängeln oder gesetzlichen Ansprüchen</li>
            <li>Können nach Lieferung nicht mehr zurückgenommen werden</li>
            <li>Verfallen nicht und bleiben im Konto verfügbar</li>
          </ul>

          <p className="mt-4">
            Weitere Informationen zum Widerrufsrecht für digitale Inhalte finden Sie in
            unserer{' '}
            <Link href="/widerruf" className="text-primary hover:underline">
              Widerrufsbelehrung
            </Link>
            .
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Verfügbarkeit</h2>
          <p>
            Der Anbieter bemüht sich um eine möglichst unterbrechungsfreie Verfügbarkeit
            der App. Technische Wartungsarbeiten oder unvorhersehbare Ausfälle können
            jedoch zu Unterbrechungen führen. Der Anbieter haftet nicht für derartige
            Unterbrechungen.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">7. Änderungen der AGB</h2>
          <p>
            Der Anbieter behält sich das Recht vor, diese AGB zu ändern. Wesentliche
            Änderungen werden den Nutzern per E-Mail oder über die App mitgeteilt.
            Die weitere Nutzung der App gilt als Zustimmung zu den geänderten AGB.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">8. Haftungsbeschränkung</h2>
          <p>
            Der Anbieter haftet nur für Schäden aus der Verletzung des Lebens, des Körpers
            oder der Gesundheit sowie für sonstige Schäden, die auf einer vorsätzlichen
            oder grob fahrlässigen Pflichtverletzung des Anbieters beruhen.
          </p>
          <p>
            Bei der Verletzung wesentlicher Vertragspflichten (Kardinalpflichten) ist die
            Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt.
          </p>
          <p>
            Eine Haftung für mittelbare Schäden, Folgeschäden oder entgangenen Gewinn
            ist ausgeschlossen.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">9. Gerichtsstand und anwendbares Recht</h2>
          <p>
            Es gilt ausschließlich deutsches Recht unter Ausschluss des UN-Kaufrechts.
            Für Verbraucher ist der Gerichtsstand Bayern (Deutschland). Der Anbieter
            kann den Nutzer auch an seinem allgemeinen Gerichtsstand verklagen.
          </p>
          <p>
            Bei Streitigkeiten haben Verbraucher die Möglichkeit, die{' '}
            <a href="https://ec.europa.eu/consumers/odr/" className="text-primary hover:underline" target="_blank" rel="noopener">
              Europäische Online-Streitbeilegungsplattform
            </a>
            {' '}zu nutzen.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">10. Salvatorische Klausel</h2>
          <p>
            Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden,
            bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">11. Kontakt</h2>
          <p>
            Bei Fragen zu diesen AGB kontaktieren Sie uns bitte:
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p><strong>{LEGAL_CONFIG.provider.name}</strong></p>
            <p>E-Mail: {LEGAL_CONFIG.provider.email}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
