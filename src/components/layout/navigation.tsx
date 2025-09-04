'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Home, BookOpen, History, User, ShoppingBag } from 'lucide-react';

  const navigationItems = [
  { key: 'home', icon: Home, href: '/de' },
  { key: 'learn', icon: BookOpen, href: '/de/learn' },
  { key: 'review', icon: History, href: '/de/review' },
  { key: 'store', icon: ShoppingBag, href: '/de/store' },
  { key: 'profile', icon: User, href: '/de/profile' },
];

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();

  // Extract current path without locale
  const currentPath = pathname.split('/').slice(2).join('/') || '/';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {navigationItems.map(({ key, icon: Icon, href }) => {
          const isActive = currentPath === href.slice(1) || (href === '/' && currentPath === '/');
          
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
              aria-label={t(`nav.${key}` as any) || key}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">
                {t(`nav.${key}` as any) || key}
              </span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
