/**
 * Stripe configuration validation and utilities
 * Ensures proper environment setup and prevents test/live mode mismatches
 */

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  publishableKey: string;
  priceIds: Record<string, string>;
  mode: 'test' | 'live';
}

export interface EnvironmentValidationResult {
  isValid: boolean;
  mode: 'test' | 'live' | 'mixed' | 'unknown';
  errors: string[];
  warnings: string[];
}

/**
 * Detect Stripe mode from key prefixes
 */
function detectStripeMode(key: string): 'test' | 'live' | 'unknown' {
  if (key.startsWith('sk_test_') || key.startsWith('pk_test_') || key.startsWith('whsec_test_')) {
    return 'test';
  }
  if (key.startsWith('sk_live_') || key.startsWith('pk_live_') || key.startsWith('whsec_live_')) {
    return 'live';
  }
  return 'unknown';
}

/**
 * Validate Stripe environment configuration
 */
export function validateStripeEnvironment(): EnvironmentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required environment variables
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const priceIdsJson = process.env.NEXT_PUBLIC_STRIPE_PRICE_IDS;

  if (!secretKey) {
    errors.push('STRIPE_SECRET_KEY is required');
  }
  if (!webhookSecret) {
    errors.push('STRIPE_WEBHOOK_SECRET is required');
  }
  if (!publishableKey) {
    errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required');
  }
  if (!priceIdsJson) {
    errors.push('NEXT_PUBLIC_STRIPE_PRICE_IDS is required');
  }

  // Parse price IDs
  let priceIds: Record<string, string> = {};
  if (priceIdsJson) {
    try {
      priceIds = JSON.parse(priceIdsJson);
      
      // Validate required price keys
      const requiredKeys = ['10_hints', '50_hints', '200_hints'];
      for (const key of requiredKeys) {
        if (!priceIds[key]) {
          errors.push(`Missing price ID for pack: ${key}`);
        } else if (typeof priceIds[key] !== 'string' || priceIds[key].trim() === '') {
          errors.push(`Invalid price ID for pack ${key}: must be non-empty string`);
        }
      }
    } catch (e) {
      errors.push('NEXT_PUBLIC_STRIPE_PRICE_IDS must be valid JSON');
    }
  }

  // Detect modes and check for mismatches
  const modes: Set<'test' | 'live' | 'unknown'> = new Set();
  
  if (secretKey) modes.add(detectStripeMode(secretKey));
  if (webhookSecret) modes.add(detectStripeMode(webhookSecret));
  if (publishableKey) modes.add(detectStripeMode(publishableKey));

  // Check price ID modes (if they follow Stripe patterns)
  for (const priceId of Object.values(priceIds)) {
    if (typeof priceId === 'string') {
      if (priceId.includes('test_')) {
        modes.add('test');
      } else if (priceId.startsWith('price_') && !priceId.includes('test_')) {
        modes.add('live');
      }
    }
  }

  // Remove unknown from mode detection
  modes.delete('unknown');

  let overallMode: 'test' | 'live' | 'mixed' | 'unknown';
  if (modes.size === 0) {
    overallMode = 'unknown';
    errors.push('Could not determine Stripe mode from keys');
  } else if (modes.size > 1) {
    overallMode = 'mixed';
    errors.push('Mixed test/live mode detected - all Stripe keys must be in the same mode');
  } else {
    overallMode = [...modes][0];
  }

  // Environment-specific validation
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && overallMode === 'test') {
    warnings.push('Using test mode in production environment');
  }
  if (!isProduction && overallMode === 'live') {
    warnings.push('Using live mode in development environment - be careful!');
  }

  return {
    isValid: errors.length === 0,
    mode: overallMode,
    errors,
    warnings,
  };
}

/**
 * Get validated Stripe configuration
 * Throws error if configuration is invalid
 */
export function getStripeConfig(): StripeConfig {
  const validation = validateStripeEnvironment();
  
  if (!validation.isValid) {
    throw new Error(`Invalid Stripe configuration: ${validation.errors.join(', ')}`);
  }

  // Log warnings in development
  if (process.env.NODE_ENV !== 'production' && validation.warnings.length > 0) {
    console.warn('Stripe configuration warnings:', validation.warnings.join(', '));
  }

  const priceIds = JSON.parse(process.env.NEXT_PUBLIC_STRIPE_PRICE_IDS!);

  return {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    priceIds,
    mode: validation.mode as 'test' | 'live',
  };
}

/**
 * Runtime environment check for startup validation
 * Returns human-readable status for health checks
 */
export function checkStripeEnvironment(): { status: 'ok' | 'warning' | 'error'; message: string; details?: any } {
  try {
    const validation = validateStripeEnvironment();
    
    if (!validation.isValid) {
      return {
        status: 'error',
        message: 'Stripe configuration invalid',
        details: { errors: validation.errors, warnings: validation.warnings }
      };
    }
    
    if (validation.warnings.length > 0) {
      return {
        status: 'warning',
        message: `Stripe configured (${validation.mode} mode) with warnings`,
        details: { warnings: validation.warnings }
      };
    }
    
    return {
      status: 'ok',
      message: `Stripe configured correctly in ${validation.mode} mode`
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Failed to validate Stripe configuration',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

/**
 * Client-safe configuration check (no secrets)
 * For use in browser/client components
 */
export function validateClientStripeConfig() {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const priceIdsJson = process.env.NEXT_PUBLIC_STRIPE_PRICE_IDS;
  
  const errors: string[] = [];
  
  if (!publishableKey) {
    errors.push('Stripe publishable key not configured');
  } else {
    const mode = detectStripeMode(publishableKey);
    if (mode === 'unknown') {
      errors.push('Invalid Stripe publishable key format');
    }
  }
  
  if (!priceIdsJson) {
    errors.push('Stripe price IDs not configured');
  } else {
    try {
      const priceIds = JSON.parse(priceIdsJson);
      const requiredKeys = ['10_hints', '50_hints', '200_hints'];
      for (const key of requiredKeys) {
        if (!priceIds[key]) {
          errors.push(`Missing price configuration for: ${key}`);
        }
      }
    } catch {
      errors.push('Invalid price configuration format');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    mode: publishableKey ? detectStripeMode(publishableKey) : 'unknown'
  };
}
