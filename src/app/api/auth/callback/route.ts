import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle OAuth errors from Google
  if (error) {
    console.error('OAuth callback error:', error, errorDescription);

    // Redirect to home page with error parameter
    const errorRedirectUrl = new URL('/', requestUrl.origin);
    errorRedirectUrl.searchParams.set('auth_error', error);
    if (errorDescription) {
      errorRedirectUrl.searchParams.set('auth_error_description', errorDescription);
    }

    return NextResponse.redirect(errorRedirectUrl);
  }

  if (code) {
    try {
      const cookieStore = cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError);

        // Redirect to home page with error
        const errorRedirectUrl = new URL('/', requestUrl.origin);
        errorRedirectUrl.searchParams.set('auth_error', 'code_exchange_failed');
        errorRedirectUrl.searchParams.set('auth_error_description', exchangeError.message);

        return NextResponse.redirect(errorRedirectUrl);
      }
    } catch (err: any) {
      console.error('Auth callback processing error:', err);

      // Redirect to home page with generic error
      const errorRedirectUrl = new URL('/', requestUrl.origin);
      errorRedirectUrl.searchParams.set('auth_error', 'callback_processing_failed');
      errorRedirectUrl.searchParams.set('auth_error_description', 'Ein Fehler ist bei der Verarbeitung der Anmeldung aufgetreten.');

      return NextResponse.redirect(errorRedirectUrl);
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin);
}
