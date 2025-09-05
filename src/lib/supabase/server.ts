import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createServerClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes('your-project') || key.includes('your_')) {
    throw new Error('Missing or placeholder Supabase environment variables. Please configure your actual Supabase credentials in .env.local. Visit https://supabase.com/dashboard/project/tkqofzynpyvmivmxhoef/settings/api');
  }
  
  const cookieStore = cookies();
  
  return createSupabaseServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Handle server component context where cookies cannot be set
          }
        },
      },
    }
  );
};
