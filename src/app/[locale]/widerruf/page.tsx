import { Metadata } from 'next';
import { LEGAL_CONFIG, LEGAL_CONTENT, getFullLegalAddress } from '@/lib/constants';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Widerrufsbelehrung | PflegeBuddy Learn',
    description: 'Widerrufsrecht für digitale Inhalte gemäß § 356 BGB',
  };
}

export default function WiderrufPage() {

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Widerrufsbelehrung</h1>
        <p className="text-muted-foreground">
          Widerrufsrecht für digitale Inhalte • Version {LEGAL_CONFIG.versions.withdrawal} • Stand: {LEGAL_CONTENT.lastUpdated}
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Widerrufsrecht für Verbraucher</h2>

          <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border-l-4 border-blue-400">
            <p className="font-medium mb-4">
              Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
            </p>

            <p className="mb-2"><strong>Widerrufsfrist:</strong></p>
            <p>Die Frist beträgt 14 Tage ab dem Tag des Vertragsabschlusses.</p>

            <p className="mb-2 mt-4"><strong>Um Ihr Widerrufsrecht auszuüben:</strong></p>
            <p>
              Sie müssen uns ({LEGAL_CONFIG.provider.name}, {getFullLegalAddress()},
              E-Mail: {LEGAL_CONFIG.provider.email}) mittels einer eindeutigen Erklärung
              (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss,
              diesen Vertrag zu widerrufen, informieren.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Besonderheiten bei digitalen Inhalten (§ 356 BGB)</h2>

          <div className="bg-amber-50 dark:bg-amber-950 p-6 rounded-lg border-l-4 border-amber-400">
            <p className="font-medium mb-4 text-amber-800 dark:text-amber-200">
              Sofortige Ausführung möglich - Erlöschen des Widerrufsrechts
            </p>

            <p className="mb-4">
              Bei Verträgen über die Lieferung von digitalen Inhalten (z. B. virtuelle Hinweise,
              Zeit-Boosts oder andere digitale Gegenstände) erlischt Ihr Widerrufsrecht,
              wenn wir mit der Ausführung des Vertrags begonnen haben, nachdem Sie
            </p>

            <ol className="list-decimal pl-6 mb-4">
              <li>ausdrücklich zugestimmt haben, dass wir vor Ablauf der Widerrufsfrist mit der Ausführung beginnen</li>
              <li>bestätigt haben, dass Ihnen bewusst ist, dass Sie durch Ihre Zustimmung Ihr Widerrufsrecht verlieren</li>
            </ol>

            <p>
              Die Lieferung gilt als erfolgt, sobald die virtuellen Gegenstände Ihrem Konto
              gutgeschrieben wurden und für Sie verfügbar sind.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Muster-Widerrufserklärung</h2>

          <div className="bg-muted p-6 rounded-lg font-mono text-sm">
            <p>An<br />
            {LEGAL_CONFIG.provider.name}<br />
            {getFullLegalAddress()}<br />
            E-Mail: {LEGAL_CONFIG.provider.email}</p>

            <p className="mt-4"><strong>Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)</strong></p>

            <p>Bestellt am (*)/erhalten am (*): __________________</p>
            <p>Name des/der Verbraucher(s): __________________</p>
            <p>Anschrift des/der Verbraucher(s): __________________</p>
            <p>Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): __________________</p>
            <p>Datum: __________________</p>

            <p className="mt-4 text-xs">(*) Unzutreffendes streichen.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Folgen des Widerrufs</h2>

          <p>
            Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von
            Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen
            Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von
            uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und
            spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung
            über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
          </p>

          <p>
            Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der
            ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde
            ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser
            Rückzahlung Entgelte berechnet.
          </p>

          <p>
            Haben Sie verlangt, dass die Dienstleistungen während der Widerrufsfrist beginnen
            sollen, so haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil
            der bis zu dem Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts
            hinsichtlich dieses Vertrags unterrichten, bereits erbrachten Dienstleistungen
            im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Ausschluss des Widerrufsrechts</h2>

          <p>
            Das Widerrufsrecht besteht nicht bei Verträgen zur Lieferung von Waren, die
            nicht vorgefertigt sind und für deren Herstellung eine individuelle Auswahl
            oder Bestimmung durch den Verbraucher maßgeblich ist oder die eindeutig auf
            die persönlichen Bedürfnisse des Verbrauchers zugeschnitten sind.
          </p>

          <p>
            Bei digitalen Inhalten, die nicht auf einem körperlichen Datenträger geliefert
            werden, erlischt das Widerrufsrecht nach Beginn der Ausführung des Vertrags
            mit Ihrer ausdrücklichen Zustimmung.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Kontakt für Widerruf</h2>

          <div className="bg-muted p-4 rounded-lg">
            <p><strong>{LEGAL_CONFIG.provider.name}</strong></p>
            <p>{getFullLegalAddress()}</p>
            <p>E-Mail: {LEGAL_CONFIG.provider.email}</p>
            {LEGAL_CONFIG.provider.phone && <p>Telefon: {LEGAL_CONFIG.provider.phone}</p>}
          </div>

          <p className="text-sm text-muted-foreground">
            Sie können das Muster-Widerrufsformular verwenden, aber Sie müssen nicht.
            Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über
            die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
          </p>
        </section>
      </div>
    </div>
  );
}
