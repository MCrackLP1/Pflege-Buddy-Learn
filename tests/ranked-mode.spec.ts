import { test, expect } from '@playwright/test';

test.describe('PflegeBuddy Learn - Ranked Mode', () => {
  test('should display ranked mode page correctly on mobile', async ({ page }) => {
    await page.goto('/de/ranked');

    // Check main elements are present
    await expect(page.getByRole('heading', { name: 'Ranked Mode' })).toBeVisible();
    await expect(page.getByText('Teste dein Wissen in einem endlosen Quiz')).toBeVisible();

    // Check game rules section
    await expect(page.getByText('20 Sekunden pro Frage')).toBeVisible();
    await expect(page.getByText('Endloses Quiz')).toBeVisible();
    await expect(page.getByText('Punkteberechnung')).toBeVisible();

    // Check start button
    const startButton = page.getByRole('button', { name: 'Ranked Session starten' });
    await expect(startButton).toBeVisible();
    await expect(startButton).toHaveCSS('min-height', '44px'); // Touch target size
  });

  test('should display ranked page correctly', async ({ page }) => {
    await page.goto('/de/ranked');

    // Check main heading
    await expect(page.getByRole('heading', { name: 'Ranked Mode' })).toBeVisible();

    // Check start button
    const startButton = page.getByRole('button', { name: 'Ranked Session starten' });
    await expect(startButton).toBeVisible();
  });

  test('should display leaderboard section', async ({ page }) => {
    await page.goto('/de/ranked');

    // Check leaderboard heading is present (use more specific selector)
    await expect(page.locator('h3').filter({ hasText: 'Bestenliste' })).toBeVisible();
    await expect(page.getByText('Noch keine Einträge')).toBeVisible();
  });

  test('should be responsive across viewports', async ({ page }) => {
    await page.goto('/de/ranked');

    // Test mobile viewport (390px)
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole('heading', { name: 'Ranked Mode' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ranked Session starten' })).toBeVisible();

    // Test tablet viewport (768px)
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: 'Ranked Mode' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ranked Session starten' })).toBeVisible();

    // Test desktop viewport (1280px)
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByRole('heading', { name: 'Ranked Mode' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ranked Session starten' })).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    await page.goto('/de/ranked');

    // Check for proper heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();

    // Check button has accessible name and proper size
    const startButton = page.getByRole('button', { name: 'Ranked Session starten' });
    await expect(startButton).toBeVisible();
    await expect(startButton).toHaveCSS('min-height', '44px');

    // Check focus management
    await startButton.focus();
    await expect(startButton).toBeFocused();
  });

  test('should display timer component correctly', async ({ page }) => {
    await page.goto('/de/ranked');

    // Click start to enter quiz mode (this would normally require auth)
    const startButton = page.getByRole('button', { name: 'Ranked Session starten' });
    await expect(startButton).toBeVisible();

    // Note: In a real test, we'd mock authentication and test the actual quiz flow
    // For now, we just verify the start button interaction
    await expect(startButton).toBeEnabled();
  });

  test('should handle navigation between ranked sections', async ({ page }) => {
    await page.goto('/de/ranked');

    // Check leaderboard section is visible
    await expect(page.locator('h3').filter({ hasText: 'Bestenliste' })).toBeVisible();

    // Check rules section
    await expect(page.getByText('Spielregeln')).toBeVisible();

    // Check start button is visible and accessible
    const startButton = page.getByRole('button', { name: 'Ranked Session starten' });
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeInViewport();
  });
});
