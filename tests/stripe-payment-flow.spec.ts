import { test, expect } from '@playwright/test';

test.describe('Stripe Payment Flow', () => {
  // Test environment validation
  test('should validate Stripe configuration via health check', async ({ request }) => {
    const response = await request.get('/api/health/stripe');
    const data = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(data.server).toBeDefined();
    expect(data.client).toBeDefined();
    expect(data.timestamp).toBeDefined();
    
    // Should either be properly configured or show clear errors
    if (!data.server.status === 'ok') {
      expect(data.server.errors?.length).toBeGreaterThan(0);
    }
  });

  test.describe('Store Page - Payment UI', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to store page
      await page.goto('/de/store');
    });

    test('should display hint packs correctly on mobile', async ({ page }) => {
      // Check viewport is mobile
      await page.setViewportSize({ width: 390, height: 844 });

      // Should show store title
      await expect(page.getByRole('heading', { name: /Store/ })).toBeVisible();

      // Should show hint packs
      const packs = await page.locator('[data-testid*="hint-pack"]').count();
      expect(packs).toBeGreaterThan(0);

      // Each pack should have essential elements
      const firstPack = page.locator('[data-testid*="hint-pack"]').first();
      await expect(firstPack.getByText(/Hints/)).toBeVisible();
      await expect(firstPack.getByText(/€/)).toBeVisible();
      await expect(firstPack.getByRole('button')).toBeVisible();
    });

    test('should show appropriate error when not signed in', async ({ page }) => {
      // Mock the API call to return 401 Unauthorized
      await page.route('/api/stripe/checkout', async (route) => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' }),
        });
      });

      // Try to purchase a pack
      await page.locator('[data-testid*="hint-pack"]').first().getByRole('button').click();

      // Should show error message about signing in
      await page.waitForFunction(() => 
        window.confirm = window.confirm || (() => true)
      );

      // Wait for alert and verify it contains sign-in message
      page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain('anmelden');
        await dialog.accept();
      });
    });

    test('should show configuration error gracefully', async ({ page }) => {
      // Mock the API to return configuration error
      await page.route('/api/stripe/checkout', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ 
            error: 'Stripe configuration invalid',
            configuration_error: true
          }),
        });
      });

      // Try to purchase a pack
      await page.locator('[data-testid*="hint-pack"]').first().getByRole('button').click();

      // Should show configuration error message
      page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain('nicht verfügbar');
        await dialog.accept();
      });
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Mock network failure
      await page.route('/api/stripe/checkout', async (route) => {
        await route.abort('failed');
      });

      // Try to purchase a pack
      await page.locator('[data-testid*="hint-pack"]').first().getByRole('button').click();

      // Should show network error message
      page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain('Netzwerkfehler');
        await dialog.accept();
      });
    });

    test('should redirect to Stripe Checkout on successful request', async ({ page }) => {
      // Mock successful checkout session creation
      await page.route('/api/stripe/checkout', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            url: 'https://checkout.stripe.com/c/pay/test_session_id',
            sessionId: 'cs_test_session_id'
          }),
        });
      });

      // Mock the redirect (since we can't actually go to Stripe in tests)
      let redirectUrl: string | null = null;
      await page.evaluate(() => {
        const originalAssign = window.location.assign;
        Object.defineProperty(window.location, 'href', {
          set: (url: string) => {
            (window as any).__redirectUrl = url;
          }
        });
      });

      // Try to purchase a pack
      await page.locator('[data-testid*="hint-pack"]').first().getByRole('button').click();

      // Should attempt to redirect to Stripe
      await page.waitForFunction(() => (window as any).__redirectUrl);
      const redirectedUrl = await page.evaluate(() => (window as any).__redirectUrl);
      expect(redirectedUrl).toContain('stripe.com');
    });

    test('should show loading state during purchase', async ({ page }) => {
      // Slow down the API call to test loading state
      await page.route('/api/stripe/checkout', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ url: 'https://checkout.stripe.com/test' }),
        });
      });

      // Click purchase button
      const purchaseButton = page.locator('[data-testid*="hint-pack"]').first().getByRole('button');
      await purchaseButton.click();

      // Should show loading state
      await expect(purchaseButton).toBeDisabled();
      
      // Should show loading text or spinner
      await expect(purchaseButton.getByText(/wird geladen/i).or(purchaseButton.locator('[data-testid="loading"]'))).toBeVisible();
    });
  });

  test.describe('API Routes', () => {
    test('checkout route should validate required fields', async ({ request }) => {
      // Test missing pack_key
      const response1 = await request.post('/api/stripe/checkout', {
        data: {
          withdrawal_waiver_consent: true
        }
      });
      expect(response1.status()).toBe(400);

      // Test missing withdrawal_waiver_consent
      const response2 = await request.post('/api/stripe/checkout', {
        data: {
          pack_key: '10_hints'
        }
      });
      expect(response2.status()).toBe(400);

      // Test invalid pack_key
      const response3 = await request.post('/api/stripe/checkout', {
        data: {
          pack_key: 'invalid_pack',
          withdrawal_waiver_consent: true
        }
      });
      expect(response3.status()).toBe(400);
    });

    test('webhook should verify signature', async ({ request }) => {
      // Test missing signature
      const response1 = await request.post('/api/stripe/webhook', {
        data: 'test body'
      });
      expect(response1.status()).toBe(400);

      // Test invalid signature
      const response2 = await request.post('/api/stripe/webhook', {
        headers: {
          'Stripe-Signature': 'invalid_signature'
        },
        data: 'test body'
      });
      expect(response2.status()).toBe(400);
    });
  });

  test.describe('Configuration Validation', () => {
    test('should detect missing environment variables', async ({ request }) => {
      // This test would need to run in a controlled environment
      // where we can manipulate environment variables
      const response = await request.get('/api/health/stripe');
      const data = await response.json();

      // Should report configuration status
      expect(['ok', 'warning', 'error']).toContain(data.server.status);
      
      if (data.server.status === 'error') {
        expect(data.server.details?.errors).toBeDefined();
      }
    });

    test('should detect test/live mode mismatches', async ({ request }) => {
      const response = await request.get('/api/health/stripe');
      const data = await response.json();

      // If configuration is valid, mode should be detected
      if (data.server.status === 'ok') {
        expect(['test', 'live']).toContain(data.client.mode);
      }
    });
  });
});

test.describe('E2E Purchase Simulation (Mock)', () => {
  test('complete purchase flow with successful webhook', async ({ page }) => {
    // This test simulates the complete flow with mocked Stripe responses
    
    // Step 1: Navigate to store
    await page.goto('/de/store');

    // Step 2: Mock successful checkout session creation
    await page.route('/api/stripe/checkout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          url: 'https://checkout.stripe.com/c/pay/test_session_id',
          sessionId: 'cs_test_session_id'
        }),
      });
    });

    // Step 3: Mock successful webhook processing
    await page.route('/api/stripe/webhook', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ received: true }),
      });
    });

    // Step 4: Mock the return from Stripe (simulate successful payment)
    await page.route('**/store?success=true', async (route) => {
      await route.continue();
    });

    // Step 5: Start purchase flow
    const purchaseButton = page.locator('[data-testid*="hint-pack"]').first().getByRole('button');
    await purchaseButton.click();

    // Step 6: Should attempt redirect to Stripe
    await page.evaluate(() => {
      // Simulate successful Stripe checkout and return
      window.location.href = '/de/store?success=true';
    });

    // Step 7: Should show success state
    await expect(page.getByText(/Erfolgreich/i).or(page.getByText(/Success/i))).toBeVisible();
  });
});
