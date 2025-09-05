#!/usr/bin/env tsx

/**
 * Stripe Configuration Checker
 * 
 * This script validates your Stripe environment setup and provides
 * actionable feedback for configuration issues.
 * 
 * Usage:
 *   npm run stripe:check
 *   pnpm run stripe:check
 */

import { validateStripeEnvironment, checkStripeEnvironment } from '../src/lib/stripe/config';
import fs from 'fs';
import path from 'path';

// Load environment variables manually (Next.js style)
function loadEnvFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      content.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0 && !key.startsWith('#')) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value.trim();
          }
        }
      });
    }
  } catch (error) {
    // Ignore errors loading env files
  }
}

// Load environment files in order
loadEnvFile('.env.local');
loadEnvFile('.env');

console.log('🔍 Stripe Configuration Check\n');

try {
  // Validate environment
  const validation = validateStripeEnvironment();
  const healthCheck = checkStripeEnvironment();

  // Display results
  console.log(`📊 Status: ${healthCheck.status.toUpperCase()}`);
  console.log(`📝 Message: ${healthCheck.message}\n`);

  if (validation.mode && validation.mode !== 'unknown') {
    console.log(`🎯 Mode: ${validation.mode.toUpperCase()}`);
    
    const isProduction = process.env.NODE_ENV === 'production';
    if (validation.mode === 'test' && isProduction) {
      console.log('⚠️  Warning: Using TEST mode in production environment');
    }
    if (validation.mode === 'live' && !isProduction) {
      console.log('⚠️  Warning: Using LIVE mode in development - be careful with real money!');
    }
  }

  // Show errors
  if (validation.errors.length > 0) {
    console.log('\n❌ Errors:');
    validation.errors.forEach(error => console.log(`   • ${error}`));
  }

  // Show warnings
  if (validation.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    validation.warnings.forEach(warning => console.log(`   • ${warning}`));
  }

  // Configuration details
  if (validation.isValid) {
    console.log('\n✅ Configuration Details:');
    
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (secretKey) {
      console.log(`   • Secret Key: ${secretKey.substring(0, 7)}...`);
    }
    if (webhookSecret) {
      console.log(`   • Webhook Secret: ${webhookSecret.substring(0, 7)}...`);
    }
    if (publishableKey) {
      console.log(`   • Publishable Key: ${publishableKey.substring(0, 7)}...`);
    }

    // Price IDs
    try {
      const priceIds = JSON.parse(process.env.NEXT_PUBLIC_STRIPE_PRICE_IDS || '{}');
      console.log('   • Price IDs:');
      Object.entries(priceIds).forEach(([key, value]) => {
        console.log(`     - ${key}: ${value}`);
      });
    } catch (e) {
      console.log('   • Price IDs: Invalid JSON format');
    }
  }

  // Recommendations
  console.log('\n💡 Recommendations:');
  
  if (!validation.isValid) {
    console.log('   1. Fix the configuration errors above');
    console.log('   2. Copy env.template to .env.local and fill in your values');
    console.log('   3. Get your keys from: https://dashboard.stripe.com/apikeys');
    console.log('   4. Set up webhooks at: https://dashboard.stripe.com/webhooks');
  } else {
    if (validation.mode === 'test') {
      console.log('   1. Test your integration with test cards: https://stripe.com/docs/testing#cards');
      console.log('   2. Use Stripe CLI for webhook testing: stripe listen --forward-to localhost:3000/api/stripe/webhook');
      console.log('   3. When ready for production, replace with live keys');
    } else {
      console.log('   1. Ensure your webhook endpoint is accessible from the internet');
      console.log('   2. Monitor transactions in Stripe Dashboard');
      console.log('   3. Test thoroughly before going live');
    }
  }

  console.log('\n📚 Documentation:');
  console.log('   • Stripe Setup Guide: README.md (Stripe Setup section)');
  console.log('   • Test webhook locally: npm run stripe:test:webhook');
  console.log('   • Health check API: /api/health/stripe');

  // Exit with appropriate code
  if (!validation.isValid) {
    process.exit(1);
  }

  console.log('\n🎉 Stripe configuration looks good!');
  process.exit(0);

} catch (error) {
  console.error('\n💥 Error during configuration check:');
  console.error(error instanceof Error ? error.message : 'Unknown error');
  
  console.log('\n🔧 Troubleshooting:');
  console.log('   1. Ensure .env.local exists with Stripe configuration');
  console.log('   2. Check that all required environment variables are set');
  console.log('   3. Verify your Stripe keys are valid');
  
  process.exit(1);
}
