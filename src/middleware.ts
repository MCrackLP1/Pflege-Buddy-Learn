import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createIntlMiddleware({
  locales: ['de', 'en'],
  defaultLocale: 'de',
  localePrefix: 'as-needed'
});

export async function middleware(req: NextRequest) {
  // Handle internationalization first
  const intlResponse = intlMiddleware(req);
  
  // Create a Supabase client configured to use cookies
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set({ name, value, ...options });
            res.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  // Get user session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Protected routes that require authentication
  const protectedPaths = ['/learn', '/quiz', '/review', '/profile', '/store'];
  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  );
  
  // Redirect to home if accessing protected route without session
  if (isProtectedPath && !session) {
    const locale = req.nextUrl.pathname.split('/')[1];
    const homeUrl = new URL(`/${locale}`, req.url);
    return NextResponse.redirect(homeUrl);
  }

  return intlResponse || res;
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico|.*\\..*).*))',
  ],
};
