import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { LEGAL_CONFIG } from '@/lib/constants';

const intlMiddleware = createIntlMiddleware({
  locales: ['de', 'en'],
  defaultLocale: 'de',
  localePrefix: 'always'
});

export async function middleware(req: NextRequest) {
  // Generate CSP nonce for inline scripts/styles (Edge Runtime compatible)
  const nonce = btoa(Array.from({ length: 16 }, () => String.fromCharCode(Math.floor(Math.random() * 256))).join(''));

  // Handle internationalization first
  const intlResponse = intlMiddleware(req);

  // Set user locale cookie if authenticated and no cookie exists
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            getAll() {
              return req.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                req.cookies.set({ name, value, ...options });
                if (intlResponse) {
                  intlResponse.cookies.set({ name, value, ...options });
                }
              });
            },
          },
        }
      );

      const { data: { session } } = await supabase.auth.getSession();
      const existingLocaleCookie = req.cookies.get('NEXT_LOCALE');

      if (session?.user?.id && !existingLocaleCookie) {
        // Load user profile to get locale preference
        const { data: profile } = await supabase
          .from('profiles')
          .select('locale')
          .eq('user_id', session.user.id)
          .single();

        if (profile?.locale && intlResponse) {
          intlResponse.cookies.set('NEXT_LOCALE', profile.locale, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
        }
      }
    } catch (error) {
      // Silently fail - don't break the app
      console.error('Error setting user locale cookie:', error);
    }
  }

  // Skip Supabase auth if environment variables are not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const res = intlResponse || NextResponse.next();
    addSecurityHeaders(res, nonce);
    return res;
  }

  // Create a Supabase client configured to use cookies
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

  // Strip locale prefix (e.g. /de/learn -> /learn) before matching
  const pathname = req.nextUrl.pathname;
  const localeMatch = pathname.match(/^\/(de|en)(?=\/|$)/);
  const pathWithoutLocale = localeMatch
    ? pathname.slice(localeMatch[0].length) || '/'
    : pathname;

  const isProtectedPath = protectedPaths.some((path) =>
    pathWithoutLocale.startsWith(path)
  );

  // Redirect to home if accessing protected route without session
  if (isProtectedPath && !session) {
    const locale = localeMatch?.[1] || 'de';
    const homeUrl = new URL(`/${locale}`, req.url);
    const redirectRes = NextResponse.redirect(homeUrl);
    addSecurityHeaders(redirectRes, nonce);
    return redirectRes;
  }

  // Add security headers to all responses
  const finalResponse = intlResponse || res;
  addSecurityHeaders(finalResponse, nonce);

  return finalResponse;
}

// Add comprehensive security headers for GDPR/DSGVO compliance
function addSecurityHeaders(response: NextResponse, nonce: string) {
  // Content Security Policy with nonce for inline scripts
  const csp = LEGAL_CONFIG.securityHeaders.csp.replace(
    "'self'",
    `'self' 'nonce-${nonce}'`
  );

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', LEGAL_CONFIG.securityHeaders.xContentTypeOptions);
  response.headers.set('X-Frame-Options', LEGAL_CONFIG.securityHeaders.xFrameOptions);
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', LEGAL_CONFIG.securityHeaders.referrerPolicy);
  response.headers.set('Permissions-Policy', LEGAL_CONFIG.securityHeaders.permissionsPolicy);

  // HSTS (HTTP Strict Transport Security) - only in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', LEGAL_CONFIG.securityHeaders.hsts);
  }

  // Add nonce to response for use in components
  response.headers.set('X-Nonce', nonce);

  // Security headers for GDPR compliance
  response.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico|.*\\..*).*))',
  ],
};
