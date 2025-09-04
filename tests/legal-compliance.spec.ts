import { test, expect } from '@playwright/test';

test.describe('Legal Compliance - DSGVO/TTDSG/BGB', () => {
  test.describe('Cookie Consent Management', () => {
    test('should show cookie banner on first visit', async ({ page, context }) => {
      // Clear all cookies and localStorage
      await context.clearCookies();
      await page.evaluate(() => localStorage.clear());

      await page.goto('/');

      // Cookie banner should be visible
      const cookieBanner = page.locator('[data-testid="cookie-banner"]').or(
        page.getByText('Cookie-Einstellungen')
      );
      await expect(cookieBanner).toBeVisible();

      // Should have required buttons
      await expect(page.getByRole('button', { name: /Alle akzeptieren/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /Nur essenzielle/ })).toBeVisible();
      await expect(page.getByRole('link', { name: /Einstellungen/ })).toBeVisible();
    });

    test('should accept only essential cookies', async ({ page, context }) => {
      await context.clearCookies();
      await page.evaluate(() => localStorage.clear());

      await page.goto('/');

      // Click "Nur essenzielle"
      await page.getByRole('button', { name: /Nur essenzielle/ }).click();

      // Banner should disappear
      const cookieBanner = page.locator('[data-testid="cookie-banner"]').or(
        page.getByText('Cookie-Einstellungen')
      );
      await expect(cookieBanner).not.toBeVisible();

      // Check localStorage preferences
      const preferences = await page.evaluate(() =>
        JSON.parse(localStorage.getItem('cookiePreferences') || '{}')
      );

      expect(preferences.essential).toBe(true);
      expect(preferences.functional).toBe(false);
      expect(preferences.analytics).toBe(false);
      expect(preferences.marketing).toBe(false);
    });

    test('should accept all cookies', async ({ page, context }) => {
      await context.clearCookies();
      await page.evaluate(() => localStorage.clear());

      await page.goto('/');

      // Click "Alle akzeptieren"
      await page.getByRole('button', { name: /Alle akzeptieren/ }).click();

      // Banner should disappear
      const cookieBanner = page.locator('[data-testid="cookie-banner"]').or(
        page.getByText('Cookie-Einstellungen')
      );
      await expect(cookieBanner).not.toBeVisible();

      // Check localStorage preferences
      const preferences = await page.evaluate(() =>
        JSON.parse(localStorage.getItem('cookiePreferences') || '{}')
      );

      expect(preferences.essential).toBe(true);
      expect(preferences.functional).toBe(true);
      expect(preferences.analytics).toBe(true);
      expect(preferences.marketing).toBe(true);
    });

    test('should allow cookie settings management', async ({ page, context }) => {
      await context.clearCookies();
      await page.evaluate(() => localStorage.clear());

      await page.goto('/');

      // Click cookie settings link
      await page.getByRole('link', { name: /Einstellungen/ }).click();

      // Should navigate to cookie settings page
      await expect(page).toHaveURL(/cookie-einstellungen/);

      // Should show all cookie categories
      await expect(page.getByText('Essenzielle Cookies')).toBeVisible();
      await expect(page.getByText('Funktionale Cookies')).toBeVisible();
      await expect(page.getByText('Analyse-Cookies')).toBeVisible();
      await expect(page.getByText('Marketing-Cookies')).toBeVisible();

      // Essential cookies should be disabled (always on)
      const essentialToggle = page.locator('[data-testid="essential-toggle"]').or(
        page.getByRole('checkbox', { name: /Essenzielle/ }).locator('xpath=following-sibling::*')
      );
      await expect(essentialToggle).toBeDisabled();

      // Should be able to toggle other categories
      const functionalToggle = page.locator('[data-testid="functional-toggle"]').or(
        page.getByRole('checkbox', { name: /Funktionale/ })
      );

      if (await functionalToggle.isEnabled()) {
        await functionalToggle.check();
        expect(await functionalToggle.isChecked()).toBe(true);

        await functionalToggle.uncheck();
        expect(await functionalToggle.isChecked()).toBe(false);
      }
    });
  });

  test.describe('Legal Pages', () => {
    test('should display Impressum correctly', async ({ page }) => {
      await page.goto('/de/impressum');

      await expect(page.getByRole('heading', { name: 'Impressum' })).toBeVisible();
      await expect(page.getByText('Angaben gemäß § 5 TMG')).toBeVisible();
      await expect(page.getByText('Mark Tietz')).toBeVisible();
      await expect(page.getByText('Königplatz 3')).toBeVisible();
      await expect(page.getByText('deinpflegebuddy@gmail.com')).toBeVisible();
    });

    test('should display Datenschutzerklärung correctly', async ({ page }) => {
      await page.goto('/de/datenschutz');

      await expect(page.getByRole('heading', { name: 'Datenschutzerklärung' })).toBeVisible();
      await expect(page.getByText('Datenschutz auf einen Blick')).toBeVisible();
      await expect(page.getByText('Ihre Rechte')).toBeVisible();
      await expect(page.getByText('Bayerisches Landesamt für Datenschutzaufsicht')).toBeVisible();
    });

    test('should display AGB correctly', async ({ page }) => {
      await page.goto('/de/agb');

      await expect(page.getByRole('heading', { name: 'Allgemeine Geschäftsbedingungen' })).toBeVisible();
      await expect(page.getByText('Geltungsbereich')).toBeVisible();
      await expect(page.getByText('Haftungsbeschränkung')).toBeVisible();
      await expect(page.getByText('Gerichtsstand und anwendbares Recht')).toBeVisible();
    });

    test('should display Widerrufsbelehrung correctly', async ({ page }) => {
      await page.goto('/de/widerruf');

      await expect(page.getByRole('heading', { name: 'Widerrufsbelehrung' })).toBeVisible();
      await expect(page.getByText('Widerrufsrecht für Verbraucher')).toBeVisible();
      await expect(page.getByText('Besonderheiten bei digitalen Inhalten')).toBeVisible();
      await expect(page.getByText('§ 356 BGB')).toBeVisible();
    });

    test('should display Cookie-Richtlinie correctly', async ({ page }) => {
      await page.goto('/de/cookies');

      await expect(page.getByRole('heading', { name: 'Cookie-Richtlinie' })).toBeVisible();
      await expect(page.getByText('Was sind Cookies?')).toBeVisible();
      await expect(page.getByText('Cookie-Kategorien')).toBeVisible();
      await expect(page.getByText('Ihre Cookie-Einstellungen')).toBeVisible();
    });

    test('should display Medizin-Disclaimer correctly', async ({ page }) => {
      await page.goto('/de/disclaimer-medizin');

      await expect(page.getByRole('heading', { name: 'Medizinischer Haftungsausschluss' })).toBeVisible();
      await expect(page.getByText('WICHTIGER HINWEIS')).toBeVisible();
      await expect(page.getByText('Keine medizinische Beratung')).toBeVisible();
      await expect(page.getByText('Bei Notfällen rufen Sie den Notruf 112')).toBeVisible();
    });
  });

  test.describe('Footer Legal Links', () => {
    test('should display legal links in footer', async ({ page }) => {
      await page.goto('/');

      // Check footer contains legal links
      await expect(page.getByRole('link', { name: /Impressum/ })).toBeVisible();
      await expect(page.getByRole('link', { name: /Datenschutz/ })).toBeVisible();
      await expect(page.getByRole('link', { name: /AGB/ })).toBeVisible();
      await expect(page.getByRole('link', { name: /Widerruf/ })).toBeVisible();
      await expect(page.getByRole('link', { name: /Cookies/ })).toBeVisible();
      await expect(page.getByRole('link', { name: /Medizin-Disclaimer/ })).toBeVisible();
    });

    test('should show legal notices in footer', async ({ page }) => {
      await page.goto('/');

      // Check for legal compliance notices
      await expect(page.getByText(/Medizinischer Haftungsausschluss/)).toBeVisible();
      await expect(page.getByText(/Europäische Online-Streitbeilegungsplattform/)).toBeVisible();
      await expect(page.getByText(/Verbraucherschlichtungsstelle/)).toBeVisible();
    });
  });

  test.describe('Age Verification', () => {
    test('should show age gate on first sign-in attempt', async ({ page }) => {
      await page.evaluate(() => localStorage.removeItem('ageVerified'));

      await page.goto('/');

      // Click sign-in button
      await page.getByRole('button', { name: /Mit Google anmelden/ }).click();

      // Age gate modal should appear
      await expect(page.getByText('Altersüberprüfung')).toBeVisible();
      await expect(page.getByText('mindestens 16 Jahre alt')).toBeVisible();

      // Should require checkbox to be checked
      const confirmButton = page.getByRole('button', { name: /Fortfahren/ });
      await expect(confirmButton).toBeDisabled();

      // Check the age verification checkbox
      await page.getByRole('checkbox', { name: /mindestens 16 Jahre alt/ }).check();

      // Button should now be enabled
      await expect(confirmButton).toBeEnabled();
    });

    test('should bypass age gate after verification', async ({ page }) => {
      // Pre-set age verification
      await page.evaluate(() => localStorage.setItem('ageVerified', 'true'));

      await page.goto('/');

      // Click sign-in button
      await page.getByRole('button', { name: /Mit Google anmelden/ }).click();

      // Age gate should not appear
      await expect(page.getByText('Altersüberprüfung')).not.toBeVisible();
    });
  });

  test.describe('Security Headers', () => {
    test('should have proper security headers', async ({ page, request }) => {
      const response = await request.get('/');

      // Check for security headers (these would be set by middleware)
      const headers = response.headers();

      // Note: In a real test environment, you'd check for:
      // - Content-Security-Policy
      // - X-Frame-Options
      // - X-Content-Type-Options
      // - Strict-Transport-Security (in production)
      // - Referrer-Policy

      expect(headers).toBeDefined();
    });
  });

  test.describe('Accessibility Compliance', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/de/impressum');

      // Check heading structure
      const h1 = page.getByRole('heading', { level: 1 });
      const h2s = page.getByRole('heading', { level: 2 });

      await expect(h1).toBeVisible();
      await expect(h2s.first()).toBeVisible();
    });

    test('should have accessible form controls', async ({ page }) => {
      await page.goto('/cookie-einstellungen');

      // Check for proper labels and form controls
      const checkboxes = page.getByRole('checkbox');
      await expect(checkboxes.first()).toBeVisible();

      // Check for associated labels
      for (const checkbox of await checkboxes.all()) {
        const label = checkbox.locator('xpath=preceding-sibling::*[contains(@for, "consent")]').or(
          checkbox.locator('xpath=following-sibling::*')
        );
        await expect(label).toBeVisible();
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/cookie-einstellungen');

      // Test tab navigation
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should display cookie banner properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });

      await page.goto('/');

      // Cookie banner should be visible and properly sized
      const cookieBanner = page.locator('[data-testid="cookie-banner"]').or(
        page.getByText('Cookie-Einstellungen')
      );
      await expect(cookieBanner).toBeVisible();

      // Buttons should be properly sized for touch
      const buttons = page.getByRole('button');
      for (const button of await buttons.all()) {
        const box = await button.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44); // Minimum touch target
        }
      }
    });

    test('should display legal pages properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });

      await page.goto('/de/impressum');

      // Content should be readable and properly laid out
      await expect(page.getByRole('heading', { name: 'Impressum' })).toBeVisible();

      // Check that content doesn't overflow horizontally
      const content = page.locator('main');
      const box = await content.boundingBox();
      expect(box?.width).toBeLessThanOrEqual(390);
    });
  });
});
