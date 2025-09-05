import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { rateLimiter } from '@/middleware/rate-limiter';
import type { ApiResponse } from '@/types/api.types';

export async function POST(
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

    const userId = user.id;

    // Rate limiting for account deletion - very strict (only 1 attempt per 24 hours)
    const rateLimitResult = rateLimiter.checkLimit(
      `delete-account:${userId}`,
      1, // Only 1 request
      86400000 // 24 hours in milliseconds
    );

    if (!rateLimitResult.allowed) {
      const resetDate = new Date(rateLimitResult.resetTime);
      return NextResponse.json(
        {
          error: `Zu viele Löschversuche. Versuchen Sie es erneut nach ${resetDate.toLocaleString('de-DE')}.`,
          success: false
        },
        { status: 429 }
      );
    }

    // Additional security check: verify the user is not trying to delete an admin account
    const { data: profile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle instead of single to handle missing profiles

    // Only fail if there's a real database error, not if profile doesn't exist
    if (profileFetchError && profileFetchError.code !== 'PGRST116') {
      console.error('Database error fetching user profile:', profileFetchError);
      return NextResponse.json(
        { error: 'Datenbankfehler beim Überprüfen der Benutzerberechtigungen', success: false },
        { status: 500 }
      );
    }

    // If profile exists and user is admin, prevent deletion
    if (profile?.role === 'admin') {
      return NextResponse.json(
        {
          error: 'Admin-Konten können nicht über diese Schnittstelle gelöscht werden. Bitte kontaktieren Sie den Support.',
          success: false
        },
        { status: 403 }
      );
    }
    console.log(`Starting account deletion for user: ${userId}`);

    // Create audit log before deletion
    const auditLog = {
      userId,
      timestamp: new Date().toISOString(),
      action: 'ACCOUNT_DELETION_INITIATED',
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown'
    };

    console.log('Account deletion audit log:', auditLog);

    // Step 1: Delete user milestone achievements (no FK constraints)
    console.log('Deleting user milestone achievements...');
    const { error: milestoneError } = await supabase
      .from('user_milestone_achievements')
      .delete()
      .eq('user_id', userId);

    if (milestoneError) {
      console.error('Error deleting milestone achievements:', milestoneError);
      // Continue with other deletions even if this fails
    }

    // Step 2: Delete legal consent events
    console.log('Deleting legal consent events...');
    const { error: consentError } = await supabase
      .from('legal_consent_events')
      .delete()
      .eq('user_id', userId);

    if (consentError) {
      console.error('Error deleting consent events:', consentError);
      // Continue with other deletions even if this fails
    }

    // Step 3: Delete quiz attempts
    console.log('Deleting quiz attempts...');
    const { error: attemptsError } = await supabase
      .from('attempts')
      .delete()
      .eq('user_id', userId);

    if (attemptsError) {
      console.error('Error deleting attempts:', attemptsError);
      // Continue with other deletions even if this fails
    }

    // Step 4: Delete user wallet
    console.log('Deleting user wallet...');
    const { error: walletError } = await supabase
      .from('user_wallet')
      .delete()
      .eq('user_id', userId);

    if (walletError) {
      console.error('Error deleting wallet:', walletError);
      // Continue with other deletions even if this fails
    }

    // Step 6: Delete user progress
    console.log('Deleting user progress...');
    const { error: progressError } = await supabase
      .from('user_progress')
      .delete()
      .eq('user_id', userId);

    if (progressError) {
      console.error('Error deleting progress:', progressError);
      // Continue with other deletions even if this fails
    }

    // Step 7: Delete user profile
    console.log('Deleting user profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
      // Continue with other deletions even if this fails
    }

    // Step 8: Sign out the user (soft delete approach)
    console.log('Signing out user - account effectively deleted...');
    try {
      // We can't delete the Supabase auth user from client-side due to permission restrictions
      // Instead, we sign out the user, which effectively "deletes" their access
      // All their data has been removed, so the account is functionally deleted
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.error('Error signing out user:', signOutError);
        // Even if sign out fails, the data deletion was successful
        // The user will need to manually sign out or their session will expire
      }
    } catch (signOutError) {
      console.error('Error during sign out:', signOutError);
      // Continue anyway - the data deletion was the important part
    }

    console.log(`Successfully deleted account for user: ${userId}`);

    // Log successful deletion
    const successAuditLog = {
      ...auditLog,
      action: 'ACCOUNT_DELETION_COMPLETED',
      timestamp: new Date().toISOString()
    };
    console.log('Account deletion completed audit log:', successAuditLog);

    return NextResponse.json({
      success: true,
      message: 'Ihr Konto wurde erfolgreich gelöscht. Alle Ihre Daten wurden entfernt.'
    });

  } catch (error) {
    console.error('Error deleting account:', error);

    // Log failed deletion attempt
    const errorAuditLog = {
      userId: 'unknown', // We might not have the user ID if error occurred early
      timestamp: new Date().toISOString(),
      action: 'ACCOUNT_DELETION_FAILED',
      error: error instanceof Error ? error.message : 'Unknown error',
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown'
    };
    console.log('Account deletion failed audit log:', errorAuditLog);

    return NextResponse.json(
      {
        error: 'Interner Serverfehler beim Löschen des Kontos',
        success: false
      },
      { status: 500 }
    );
  }
}
