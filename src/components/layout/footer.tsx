'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { LEGAL_CONFIG } from '@/lib/constants';
import { createLocalizedPath } from '@/lib/navigation';

interface FooterProps {
  showFullFooter?: boolean;
}

export function Footer({ showFullFooter = true }: FooterProps) {
  const locale = useLocale();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-md mx-auto px-6 py-6">
        {showFullFooter && (
          <>
            {/* Navigation Links */}
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mb-4">
              <Link
                href={createLocalizedPath(locale, 'kontakt')}
                className="text-caption text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                Kontakt
              </Link>
              <Link
                href={createLocalizedPath(locale, 'ueber-uns')}
                className="text-caption text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                Über uns
              </Link>
              <Link
                href={createLocalizedPath(locale, 'datenschutz')}
                className="text-caption text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                Datenschutz
              </Link>
              <Link
                href={createLocalizedPath(locale, 'impressum')}
                className="text-caption text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                Impressum
              </Link>
            </div>

            {/* Additional Legal Links */}
            <div className="flex justify-center space-x-4 mb-4">
              <Link
                href={createLocalizedPath(locale, 'widerruf')}
                className="text-caption text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                Widerruf
              </Link>
              <Link
                href={createLocalizedPath(locale, 'cookies')}
                className="text-caption text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                Cookies
              </Link>
              <Link
                href={createLocalizedPath(locale, 'agb')}
                className="text-caption text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                AGB
              </Link>
              <Link
                href={createLocalizedPath(locale, 'disclaimer-medizin')}
                className="text-caption text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                Medizin-Disclaimer
              </Link>
            </div>

            <Separator className="mb-4" />

            {/* Essential Legal Notices */}
            <div className="space-card mb-6">
              <div className="text-caption text-muted-foreground text-center">
                <p className="mb-2">
                  <strong>Haftungsausschluss:</strong> Kein Ersatz für professionelle medizinische Beratung.
                  Bei gesundheitlichen Problemen qualifizierte Fachkräfte konsultieren oder Notruf 112.
                </p>
              </div>

              <div className="text-caption text-muted-foreground text-center">
                <p>
                  EU-Streitbeilegung:{' '}
                  <a
                    href="https://consumer-redress.ec.europa.eu/index_de"
                    className="text-primary hover:text-primary/80 underline hover:no-underline transition-colors duration-200"
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
        <div className="text-center space-component">
          <p className="text-caption text-muted-foreground">
            © {currentYear} {LEGAL_CONFIG.provider.brand}
          </p>
          <p className="text-caption text-muted-foreground">
            Alle rechtlichen Informationen im Profil verfügbar
          </p>
        </div>
      </div>
    </footer>
  );
}
