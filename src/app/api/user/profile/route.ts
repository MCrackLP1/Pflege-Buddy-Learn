import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types/api.types';

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    // Check if Supabase environment variables are configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase environment variables not configured');
      return NextResponse.json(
        {
          error: 'Server-Konfiguration unvollständig. Bitte wenden Sie sich an den Support.',
          success: false
        },
        { status: 500 }
      );
    }

    const supabase = createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert', success: false },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, display_name, role, locale')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Fehler beim Laden des Profils', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile || { user_id: user.id, display_name: null, role: 'user', locale: 'de' }
    });

  } catch (error) {
    console.error('Error getting profile:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Interner Serverfehler', success: false },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // Check if Supabase environment variables are configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase environment variables not configured');
      return NextResponse.json(
        {
          error: 'Server-Konfiguration unvollständig. Bitte wenden Sie sich an den Support.',
          success: false
        },
        { status: 500 }
      );
    }

    const supabase = createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert', success: false },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { displayName, locale } = body;

    // Validate inputs
    if (displayName !== undefined && (!displayName || typeof displayName !== 'string' || displayName.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Ungültiger Anzeigename', success: false },
        { status: 400 }
      );
    }

    if (locale !== undefined && (!locale || typeof locale !== 'string' || !['de', 'en'].includes(locale))) {
      return NextResponse.json(
        { error: 'Ungültige Sprache', success: false },
        { status: 400 }
      );
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id, display_name, role, locale')
      .eq('user_id', user.id)
      .single();

    // Prepare update object
    const updateData: Record<string, string> = {};
    if (displayName !== undefined) {
      updateData.display_name = displayName.trim();
    }
    if (locale !== undefined) {
      updateData.locale = locale;
    }

    let result;
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select('user_id, display_name, role, locale')
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new profile with defaults
      const newProfileData = {
        user_id: user.id,
        display_name: displayName ? displayName.trim() : null,
        role: 'user',
        locale: locale || 'de'
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(newProfileData)
        .select('user_id, display_name, role, locale')
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Profils', success: false },
      { status: 500 }
    );
  }
}
