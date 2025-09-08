'use client';

import { useTranslations, useLocale } from 'next-intl';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { createLocalizedPath } from '@/lib/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbNav({ items, className = '' }: BreadcrumbNavProps) {
  const locale = useLocale();
  const t = useTranslations();

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}>
      <Link
        href={createLocalizedPath(locale, '/')}
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">{t('nav.home', { defaultValue: 'Home' })}</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          {item.href && !item.isActive ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={`font-medium ${item.isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

// Utility function to generate breadcrumb items for common pages
export function getBreadcrumbItems(page: string, locale: string, params?: Record<string, string>) {
  const isGerman = locale === 'de';

  switch (page) {
    case 'learn':
      return [
        {
          label: isGerman ? 'Lernen' : 'Learn',
          isActive: true
        }
      ];

    case 'quiz':
      return [
        {
          label: isGerman ? 'Lernen' : 'Learn',
          href: createLocalizedPath(locale, '/learn')
        },
        {
          label: isGerman ? 'Quiz' : 'Quiz',
          isActive: true
        }
      ];

    case 'quiz-topic':
      const topic = params?.topic || '';
      const topicNames: Record<string, { de: string; en: string }> = {
        grundlagen: { de: 'Pflegegrundlagen', en: 'Nursing Basics' },
        hygiene: { de: 'Hygiene & Infektionsschutz', en: 'Hygiene & Infection Control' },
        medikamente: { de: 'Medikamentengabe', en: 'Medication Administration' },
        dokumentation: { de: 'Pflegedokumentation', en: 'Nursing Documentation' }
      };

      return [
        {
          label: isGerman ? 'Lernen' : 'Learn',
          href: createLocalizedPath(locale, '/learn')
        },
        {
          label: topicNames[topic]?.[locale as 'de' | 'en'] || topic,
          isActive: true
        }
      ];

    case 'profile':
      return [
        {
          label: isGerman ? 'Profil' : 'Profile',
          isActive: true
        }
      ];

    case 'ranked':
      return [
        {
          label: isGerman ? 'Rangliste' : 'Ranked',
          isActive: true
        }
      ];

    case 'review':
      return [
        {
          label: isGerman ? 'Rezension' : 'Review',
          isActive: true
        }
      ];

    case 'shop':
      return [
        {
          label: isGerman ? 'Shop' : 'Shop',
          isActive: true
        }
      ];

    case 'contact':
      return [
        {
          label: isGerman ? 'Kontakt' : 'Contact',
          isActive: true
        }
      ];

    case 'about':
      return [
        {
          label: isGerman ? 'Über uns' : 'About Us',
          isActive: true
        }
      ];

    default:
      return [];
  }
}
