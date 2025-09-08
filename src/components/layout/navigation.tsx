'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createLocalizedPath } from '@/lib/navigation';
import { Home, BookOpen, History, User, Trophy, ShoppingCart } from 'lucide-react';

const navigationItems = [
  { key: 'home', icon: Home, path: '' },
  { key: 'learn', icon: BookOpen, path: 'learn' },
  { key: 'shop', icon: ShoppingCart, path: 'shop' },
  { key: 'ranked', icon: Trophy, path: 'ranked' },
  { key: 'review', icon: History, path: 'review' },
  { key: 'profile', icon: User, path: 'profile' },
];

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();

  // Extract current path without locale
  const currentPath = pathname.split('/').slice(2).join('/') || '';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {navigationItems.map(({ key, icon: Icon, path }) => {
          const href = createLocalizedPath(locale, path);
          const isActive = currentPath === path || (path === '' && currentPath === '');
          
          return (
            <Button
              key={key}
              variant="ghost"
              size="sm"
              onClick={() => router.push(href)}
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-3 min-h-[44px]",
                isActive && "text-primary"
              )}
              aria-label={t(`nav.${key}` as keyof typeof t) || key}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">
                {t(`nav.${key}` as keyof typeof t) || key}
              </span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
