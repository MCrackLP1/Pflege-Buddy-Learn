'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { LEGAL_CONFIG } from '@/lib/constants';
import { createLocalizedPath } from '@/lib/navigation';

interface FooterProps {
  showFullFooter?: boolean;
}

export function Footer({ showFullFooter = true }: FooterProps) {
  const t = useTranslations();
  const locale = useLocale();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t border-border mt-auto">
      <div className="max-w-md mx-auto px-4 py-4">
        {showFullFooter && (
          <>
            {/* Essential Legal Links - only show what's not in profile */}
            <div className="flex justify-center space-x-4 mb-4">
              <Link
                href={createLocalizedPath(locale, 'widerruf')}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Widerruf
              </Link>
              <Link
                href={createLocalizedPath(locale, 'disclaimer-medizin')}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Medizin-Disclaimer
              </Link>
            </div>

            <Separator className="mb-4" />

            {/* Essential Legal Notices */}
            <div className="space-y-2 mb-4">
              <div className="text-xs text-muted-foreground text-center">
                <p>
                  <strong>Haftungsausschluss:</strong> Kein Ersatz für professionelle medizinische Beratung.
                  Bei gesundheitlichen Problemen qualifizierte Fachkräfte konsultieren oder Notruf 112.
                </p>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                <p>
                  EU-Streitbeilegung:{' '}
                  <a
                    href="https://consumer-redress.ec.europa.eu/index_de"
                    className="underline hover:no-underline"
                    target="_blank"
                    rel="noopener"
                  >
                    consumer-redress.ec.europa.eu
                  </a>
                </p>
              </div>
            </div>

            <Separator className="mb-4" />
          </>
        )}

        {/* Copyright */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            © {currentYear} {LEGAL_CONFIG.provider.brand}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Alle rechtlichen Informationen im Profil verfügbar
          </p>
        </div>
      </div>
    </footer>
  );
}
