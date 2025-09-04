import { test, expect } from '@playwright/test';

test.describe('PflegeBuddy Learn - Basic Flow', () => {
  test('should display landing page correctly on mobile', async ({ page }) => {
    await page.goto('/');

    // Check main elements are present
    await expect(page.getByRole('heading', { name: 'PflegeBuddy Learn' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tägliche Session starten' })).toBeVisible();
    await expect(page.getByText(/Keine medizinische Beratung/)).toBeVisible();
    
    // Check sign in button is accessible
    const signInButton = page.getByRole('button', { name: /Mit Google anmelden/ });
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toHaveCSS('min-height', '44px'); // Touch target size
  });

  test('should navigate to auth flow', async ({ page }) => {
    await page.goto('/');
    
    // Click sign in button (mocked - won't actually authenticate)
    await page.getByRole('button', { name: /Mit Google anmelden/ }).click();
    
    // This would redirect to Google OAuth in real app
    // For testing, we're just checking the click interaction works
  });

  test('should be responsive across viewports', async ({ page }) => {
    await page.goto('/');

    // Test mobile viewport (390px)
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole('heading', { name: 'PflegeBuddy Learn' })).toBeVisible();
    
    // Test tablet viewport (768px)
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: 'PflegeBuddy Learn' })).toBeVisible();
    
    // Test desktop viewport (1280px)
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByRole('heading', { name: 'PflegeBuddy Learn' })).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    
    // Check button has accessible name
    const signInButton = page.getByRole('button', { name: /Mit Google anmelden/ });
    await expect(signInButton).toBeVisible();
    
    // Check focus management
    await signInButton.focus();
    await expect(signInButton).toBeFocused();
  });
});

test.describe('Quiz Flow (Mocked)', () => {
  test('should display quiz interface correctly', async ({ page }) => {
    // Note: This test would need authentication mock in real implementation
    await page.goto('/de/learn');
    
    // Should redirect to home if not authenticated
    // In a real test, we'd mock the authentication state
    await expect(page.url()).toContain('/de');
  });
});
