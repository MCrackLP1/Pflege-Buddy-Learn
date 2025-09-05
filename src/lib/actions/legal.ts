'use server';

import { createServerClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { legalConsentEvents, purchases } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';
import crypto from 'crypto';

interface ConsentEventData {
  type: 'terms' | 'privacy' | 'cookie' | 'withdrawal';
  version: string;
  locale: string;
  categories?: Record<string, boolean>;
}

/**
 * Log a consent event for GDPR compliance
 */
export async function logConsentEvent(data: ConsentEventData) {
  try {
    const supabase = createServerClient();

    // Get the current session explicitly
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      throw new Error(`No valid session: ${sessionError?.message || 'Session not found'}`);
    }

    const user = session.user;

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
      userId: user.id,
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

/**
 * Update purchase with withdrawal waiver information
 */
export async function updatePurchaseWithdrawalWaiver(
  stripeSessionId: string,
  waiverVersion: string
) {
  try {
    await db
      .update(purchases)
      .set({
        withdrawalWaiverVersion: waiverVersion,
        withdrawalWaiverAt: new Date(),
      })
      .where(eq(purchases.stripeSessionId, stripeSessionId));

    return { success: true };
  } catch (error) {
    console.error('Failed to update purchase withdrawal waiver:', error);
    throw new Error('Failed to update purchase withdrawal waiver');
  }
}
