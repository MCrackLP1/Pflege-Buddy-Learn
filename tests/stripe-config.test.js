/**
 * Unit tests for Stripe configuration utilities
 * 
 * These tests validate the environment validation and configuration
 * functions work correctly with different combinations of environment variables.
 */

describe('Stripe Configuration Validation', () => {
  let originalEnv;

  beforeAll(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Reset environment to original state
    process.env = { ...originalEnv };
  });

  describe('validateStripeEnvironment', () => {
    it('should detect missing required environment variables', async () => {
      // Clear Stripe env vars
      delete process.env.STRIPE_SECRET_KEY;
      delete process.env.STRIPE_WEBHOOK_SECRET;
      delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      delete process.env.NEXT_PUBLIC_STRIPE_PRICE_IDS;

      // Import after clearing env vars
      const { validateStripeEnvironment } = await import('../src/lib/stripe/config');
      
      const result = validateStripeEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(4); // All 4 required vars missing
      expect(result.errors).toContain('STRIPE_SECRET_KEY is required');
      expect(result.errors).toContain('STRIPE_WEBHOOK_SECRET is required');
      expect(result.errors).toContain('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required');
      expect(result.errors).toContain('NEXT_PUBLIC_STRIPE_PRICE_IDS is required');
    });

    it('should detect test mode correctly', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123456789';
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789';
      process.env.NEXT_PUBLIC_STRIPE_PRICE_IDS = '{"10_hints":"price_test_123","50_hints":"price_test_456","200_hints":"price_test_789"}';

      const { validateStripeEnvironment } = await import('../src/lib/stripe/config');
      
      const result = validateStripeEnvironment();

      expect(result.isValid).toBe(true);
      expect(result.mode).toBe('test');
      expect(result.errors).toHaveLength(0);
    });

    it('should detect live mode correctly', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_live_123456789';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_live_123456789';
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_live_123456789';
      process.env.NEXT_PUBLIC_STRIPE_PRICE_IDS = '{"10_hints":"price_123","50_hints":"price_456","200_hints":"price_789"}';

      const { validateStripeEnvironment } = await import('../src/lib/stripe/config');
      
      const result = validateStripeEnvironment();

      expect(result.isValid).toBe(true);
      expect(result.mode).toBe('live');
      expect(result.errors).toHaveLength(0);
    });

    it('should detect mixed test/live mode as error', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789'; // test
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_live_123456789'; // live
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789'; // test
      process.env.NEXT_PUBLIC_STRIPE_PRICE_IDS = '{"10_hints":"price_123","50_hints":"price_456","200_hints":"price_789"}';

      const { validateStripeEnvironment } = await import('../src/lib/stripe/config');
      
      const result = validateStripeEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.mode).toBe('mixed');
      expect(result.errors).toContain('Mixed test/live mode detected - all Stripe keys must be in the same mode');
    });

    it('should validate price IDs format', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123456789';
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789';
      process.env.NEXT_PUBLIC_STRIPE_PRICE_IDS = 'invalid_json';

      const { validateStripeEnvironment } = await import('../src/lib/stripe/config');
      
      const result = validateStripeEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('NEXT_PUBLIC_STRIPE_PRICE_IDS must be valid JSON');
    });

    it('should validate required price ID keys', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123456789';
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789';
      process.env.NEXT_PUBLIC_STRIPE_PRICE_IDS = '{"10_hints":"price_123"}'; // Missing 50_hints and 200_hints

      const { validateStripeEnvironment } = await import('../src/lib/stripe/config');
      
      const result = validateStripeEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing price ID for pack: 50_hints');
      expect(result.errors).toContain('Missing price ID for pack: 200_hints');
    });

    it('should detect production with test mode as warning', async () => {
      process.env.NODE_ENV = 'production';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123456789';
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789';
      process.env.NEXT_PUBLIC_STRIPE_PRICE_IDS = '{"10_hints":"price_test_123","50_hints":"price_test_456","200_hints":"price_test_789"}';

      const { validateStripeEnvironment } = await import('../src/lib/stripe/config');
      
      const result = validateStripeEnvironment();

      expect(result.isValid).toBe(true);
      expect(result.mode).toBe('test');
      expect(result.warnings).toContain('Using test mode in production environment');
    });
  });

  describe('getStripeConfig', () => {
    it('should return valid configuration when environment is correct', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123456789';
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789';
      process.env.NEXT_PUBLIC_STRIPE_PRICE_IDS = '{"10_hints":"price_test_123","50_hints":"price_test_456","200_hints":"price_test_789"}';

      const { getStripeConfig } = await import('../src/lib/stripe/config');
      
      const config = getStripeConfig();

      expect(config.secretKey).toBe('sk_test_123456789');
      expect(config.webhookSecret).toBe('whsec_test_123456789');
      expect(config.publishableKey).toBe('pk_test_123456789');
      expect(config.mode).toBe('test');
      expect(config.priceIds).toEqual({
        '10_hints': 'price_test_123',
        '50_hints': 'price_test_456',
        '200_hints': 'price_test_789'
      });
    });

    it('should throw error when configuration is invalid', async () => {
      delete process.env.STRIPE_SECRET_KEY;

      const { getStripeConfig } = await import('../src/lib/stripe/config');
      
      expect(() => getStripeConfig()).toThrow('Invalid Stripe configuration');
    });
  });

  describe('checkStripeEnvironment', () => {
    it('should return ok status for valid configuration', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123456789';
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789';
      process.env.NEXT_PUBLIC_STRIPE_PRICE_IDS = '{"10_hints":"price_test_123","50_hints":"price_test_456","200_hints":"price_test_789"}';

      const { checkStripeEnvironment } = await import('../src/lib/stripe/config');
      
      const result = checkStripeEnvironment();

      expect(result.status).toBe('ok');
      expect(result.message).toContain('configured correctly');
      expect(result.message).toContain('test mode');
    });

    it('should return error status for invalid configuration', async () => {
      delete process.env.STRIPE_SECRET_KEY;

      const { checkStripeEnvironment } = await import('../src/lib/stripe/config');
      
      const result = checkStripeEnvironment();

      expect(result.status).toBe('error');
      expect(result.message).toContain('configuration invalid');
      expect(result.details?.errors).toBeDefined();
    });

    it('should return warning status for configuration with warnings', async () => {
      process.env.NODE_ENV = 'production';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123456789';
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789';
      process.env.NEXT_PUBLIC_STRIPE_PRICE_IDS = '{"10_hints":"price_test_123","50_hints":"price_test_456","200_hints":"price_test_789"}';

      const { checkStripeEnvironment } = await import('../src/lib/stripe/config');
      
      const result = checkStripeEnvironment();

      expect(result.status).toBe('warning');
      expect(result.message).toContain('with warnings');
      expect(result.details?.warnings).toBeDefined();
    });
  });

  describe('validateClientStripeConfig', () => {
    it('should validate client-safe configuration', async () => {
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789';
      process.env.NEXT_PUBLIC_STRIPE_PRICE_IDS = '{"10_hints":"price_test_123","50_hints":"price_test_456","200_hints":"price_test_789"}';

      const { validateClientStripeConfig } = await import('../src/lib/stripe/config');
      
      const result = validateClientStripeConfig();

      expect(result.isValid).toBe(true);
      expect(result.mode).toBe('test');
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing client configuration', async () => {
      delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

      const { validateClientStripeConfig } = await import('../src/lib/stripe/config');
      
      const result = validateClientStripeConfig();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Stripe publishable key not configured');
    });
  });
});
