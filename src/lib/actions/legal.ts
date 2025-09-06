'use server';

import { createServerClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { legalConsentEvents } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';
import crypto from 'crypto';

interface ConsentEventData {
  type: 'terms' | 'privacy' | 'cookie' | 'withdrawal';
  version: string;
  locale: string;
  categories?: Record<string, boolean>;
  userId?: string; // Allow passing user ID directly
}

/**
 * Log a consent event for GDPR compliance
 */
export async function logConsentEvent(data: ConsentEventData) {
  try {
    let userId: string;
    
    if (data.userId) {
      // Use directly passed user ID (for API routes where user is already authenticated)
      userId = data.userId;
    } else {
      // Fall back to getting session (for client-side usage)
      const supabase = createServerClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        throw new Error(`No valid session: ${sessionError?.message || 'Session not found'}`);
      }

      userId = session.user.id;
    }

    // Get IP address (hashed for privacy)
    const headersList = headers();
    const ipAddress = headersList.get('x-forwarded-for') ||
                     headersList.get('x-real-ip') ||
                     'unknown';
    const ipHash = crypto.createHash('sha256').update(ipAddress).digest('hex');

    // Get user agent
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Create consent event record
    await db.insert(legalConsentEvents).values({
      userId: userId,
      type: data.type,
      version: data.version,
      locale: data.locale,
      categories: data.categories ? JSON.stringify(data.categories) : null,
      ipHash: ipHash,
      userAgent: userAgent,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to log consent event:', error);
    throw new Error('Failed to log consent event');
  }
}

/**
 * Get user's consent history
 */
export async function getUserConsentHistory(userId: string) {
  try {
    const consentEvents = await db
      .select()
      .from(legalConsentEvents)
      .where(eq(legalConsentEvents.userId, userId))
      .orderBy(legalConsentEvents.createdAt);

    return consentEvents;
  } catch (error) {
    console.error('Failed to get consent history:', error);
    throw new Error('Failed to get consent history');
  }
}

/**
 * Check if user has given consent for a specific type and version
 */
export async function checkUserConsent(userId: string, type: 'terms' | 'privacy' | 'cookie' | 'withdrawal', version: string) {
  try {
    // Use a more explicit type assertion to help TypeScript
    const typeValue = type as typeof type;
    const latestConsent = await db
      .select()
      .from(legalConsentEvents)
      .where(and(
        eq(legalConsentEvents.userId, userId),
        eq(legalConsentEvents.type, typeValue)
      ))
      .orderBy(legalConsentEvents.createdAt)
      .limit(1);

    if (latestConsent.length === 0) {
      return { hasConsent: false, version: null };
    }

    const consent = latestConsent[0];
    return {
      hasConsent: consent.version === version,
      version: consent.version,
      consentedAt: consent.createdAt,
    };
  } catch (error) {
    console.error('Failed to check user consent:', error);
    return { hasConsent: false, version: null };
  }
}

