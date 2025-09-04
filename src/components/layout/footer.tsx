'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { LEGAL_CONFIG } from '@/lib/constants';

interface FooterProps {
  showFullFooter?: boolean;
}

export function Footer({ showFullFooter = true }: FooterProps) {
  const t = useTranslations();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t border-border mt-auto">
      <div className="max-w-md mx-auto px-4 py-6">
        {showFullFooter && (
          <>
            {/* Legal Links */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Link
                href="/impressum"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Impressum
              </Link>
              <Link
                href="/datenschutz"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Datenschutz
              </Link>
              <Link
                href="/agb"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                AGB
              </Link>
              <Link
                href="/widerruf"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Widerruf
              </Link>
              <Link
                href="/cookies"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookies
              </Link>
              <Link
                href="/cookie-einstellungen"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookie-Einstellungen
              </Link>
              <Link
                href="/disclaimer-medizin"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Medizin-Disclaimer
              </Link>
            </div>

            <Separator className="mb-6" />

            {/* Provider Info */}
            <div className="text-center mb-6">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">{LEGAL_CONFIG.provider.name}</p>
                <p>{LEGAL_CONFIG.provider.brand}</p>
                <p className="text-xs mt-1">
                  {LEGAL_CONFIG.provider.address.line1}, {LEGAL_CONFIG.provider.address.postcode} {LEGAL_CONFIG.provider.address.city}
                </p>
                <p className="text-xs">
                  E-Mail: {LEGAL_CONFIG.provider.email}
                </p>
                {LEGAL_CONFIG.provider.phone && (
                  <p className="text-xs">
                    Tel: {LEGAL_CONFIG.provider.phone}
                  </p>
                )}
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Legal Notices */}
            <div className="space-y-3 mb-6">
              <div className="text-xs text-muted-foreground text-center">
                <p>
                  <strong>Medizinischer Haftungsausschluss:</strong> Diese App ist kein Ersatz für
                  professionelle medizinische Beratung. Bei gesundheitlichen Problemen wenden Sie
                  sich an qualifizierte Fachkräfte oder rufen Sie den Notruf 112.
                </p>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                <p>
                  <strong>EU-Streitbeilegung:</strong> Die Europäische Kommission stellt eine
                  Plattform zur Online-Streitbeilegung bereit:{' '}
                  <a
                    href="https://ec.europa.eu/consumers/odr/"
                    className="underline hover:no-underline"
                    target="_blank"
                    rel="noopener"
                  >
                    ec.europa.eu/consumers/odr/
                  </a>
                </p>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                <p>
                  Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                  Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG).
                </p>
              </div>
            </div>

            <Separator className="mb-6" />
          </>
        )}

        {/* Copyright and Version */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            © {currentYear} {LEGAL_CONFIG.provider.brand}. Alle Rechte vorbehalten.
          </p>
          <div className="flex justify-center items-center space-x-4 mt-2">
            <span className="text-xs text-muted-foreground">
              AGB v{LEGAL_CONFIG.versions.terms}
            </span>
            <span className="text-xs text-muted-foreground">
              Datenschutz v{LEGAL_CONFIG.versions.privacy}
            </span>
            <span className="text-xs text-muted-foreground">
              Cookies v{LEGAL_CONFIG.versions.cookie}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
