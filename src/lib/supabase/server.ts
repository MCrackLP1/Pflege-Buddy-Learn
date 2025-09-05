import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const createServerClient = (useServiceRole = false) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!url || url.includes('your-project')) {
    throw new Error('Missing or placeholder Supabase URL. Please configure your actual Supabase credentials in .env.local.');
  }

  // For webhooks and admin operations, use service role key (bypasses RLS)
  if (useServiceRole) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE;
    
    if (!serviceRoleKey || serviceRoleKey.includes('your_')) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE key. Required for webhook operations that bypass RLS.');
    }
    
    // Using service role for admin operations (bypasses RLS)
    
    return createSupabaseClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  // For regular user operations, use anon key with cookies
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key || key.includes('your_')) {
    throw new Error('Missing or placeholder Supabase anon key.');
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
