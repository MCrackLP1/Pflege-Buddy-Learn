#!/usr/bin/env tsx

/**
 * Client Bundle Security Check
 * 
 * This script analyzes the Next.js client bundle to ensure no server secrets
 * are accidentally exposed to the client-side code.
 * 
 * Usage:
 *   npm run build && npm run check:secrets
 */

import fs from 'fs';
import path from 'path';
import glob from 'fast-glob';

console.log('🔍 Checking client bundles for leaked secrets...\n');

// Build output directory
const buildDir = '.next';
const staticDir = path.join(buildDir, 'static');

// Secret patterns to detect
const SECRET_PATTERNS = [
  // Stripe secret keys (should never be in client)
  /sk_live_[a-zA-Z0-9]{99}/g,
  /sk_test_[a-zA-Z0-9]{99}/g,
  /whsec_[a-zA-Z0-9]+/g,
  
  // Generic secret patterns
  /STRIPE_SECRET_KEY/g,
  /STRIPE_WEBHOOK_SECRET/g,
  /DATABASE_URL/g,
  /SUPABASE_SERVICE_ROLE/g,
  
  // Common secret formats
  /['\"]sk_[a-z]+_[a-zA-Z0-9]{20,}['\"]/g,
  /['\"]whsec_[a-zA-Z0-9]{20,}['\"]/g,
  
  // Environment variable access patterns that should be server-only
  /process\.env\.STRIPE_SECRET_KEY/g,
  /process\.env\.STRIPE_WEBHOOK_SECRET/g,
  /process\.env\.DATABASE_URL/g,
];

// Allowed public patterns (these are OK in client)
const ALLOWED_PATTERNS = [
  /NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY/g,
  /NEXT_PUBLIC_STRIPE_PRICE_IDS/g,
  /pk_[a-z]+_[a-zA-Z0-9]+/g, // Publishable keys are OK
];

interface SecurityIssue {
  file: string;
  line: number;
  column: number;
  pattern: string;
  context: string;
  severity: 'high' | 'medium' | 'low';
}

async function checkClientBundles(): Promise<SecurityIssue[]> {
  const issues: SecurityIssue[] = [];

  try {
    // Find all JavaScript files in the static directory
    const jsFiles = await glob([
      `${staticDir}/**/*.js`,
      `${buildDir}/server/**/*.js`, // Check server files too for leakage
    ]);

    console.log(`📁 Checking ${jsFiles.length} files...\n`);

    for (const filePath of jsFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        // Check each pattern
        for (const pattern of SECRET_PATTERNS) {
          const matches = Array.from(content.matchAll(pattern));
          
          for (const match of matches) {
            if (!match.index) continue;

            // Get line and column number
            const beforeMatch = content.substring(0, match.index);
            const lineNumber = beforeMatch.split('\n').length;
            const lastLineBreak = beforeMatch.lastIndexOf('\n');
            const columnNumber = match.index - lastLineBreak;

            // Get context (surrounding text)
            const line = lines[lineNumber - 1] || '';
            const contextStart = Math.max(0, match.index - 50);
            const contextEnd = Math.min(content.length, match.index + 50);
            const context = content.substring(contextStart, contextEnd);

            // Check if this is an allowed pattern
            const isAllowed = ALLOWED_PATTERNS.some(allowedPattern => 
              allowedPattern.test(match[0])
            );

            if (!isAllowed) {
              issues.push({
                file: path.relative(process.cwd(), filePath),
                line: lineNumber,
                column: columnNumber,
                pattern: match[0],
                context: context.replace(/\s+/g, ' ').trim(),
                severity: getSeverity(match[0])
              });
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️  Could not read file ${filePath}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error scanning files:', error);
    throw error;
  }

  return issues;
}

function getSeverity(pattern: string): 'high' | 'medium' | 'low' {
  if (pattern.includes('sk_live_') || pattern.includes('whsec_')) {
    return 'high';
  }
  if (pattern.includes('sk_test_') || pattern.includes('DATABASE_URL')) {
    return 'medium';
  }
  return 'low';
}

function printResults(issues: SecurityIssue[]) {
  if (issues.length === 0) {
    console.log('✅ No secrets detected in client bundles!');
    console.log('\n📊 Security Check Summary:');
    console.log('   • Client bundle: SAFE');
    console.log('   • No secret keys detected');
    console.log('   • No sensitive environment variables found');
    return;
  }

  console.log(`❌ Found ${issues.length} potential security issue(s):\n`);

  // Group by severity
  const highSeverity = issues.filter(i => i.severity === 'high');
  const mediumSeverity = issues.filter(i => i.severity === 'medium');
  const lowSeverity = issues.filter(i => i.severity === 'low');

  if (highSeverity.length > 0) {
    console.log('🚨 HIGH SEVERITY ISSUES (CRITICAL):');
    highSeverity.forEach(issue => printIssue(issue));
    console.log();
  }

  if (mediumSeverity.length > 0) {
    console.log('⚠️  MEDIUM SEVERITY ISSUES:');
    mediumSeverity.forEach(issue => printIssue(issue));
    console.log();
  }

  if (lowSeverity.length > 0) {
    console.log('ℹ️  LOW SEVERITY ISSUES:');
    lowSeverity.forEach(issue => printIssue(issue));
    console.log();
  }

  console.log('🔧 RECOMMENDED ACTIONS:');
  console.log('   1. Move server secrets to server-only files');
  console.log('   2. Use NEXT_PUBLIC_ prefix only for client-safe values');
  console.log('   3. Use getStaticProps/getServerSideProps for server data');
  console.log('   4. Review your environment variable usage');
  console.log('   5. Consider using runtime configuration instead of build-time');
}

function printIssue(issue: SecurityIssue) {
  console.log(`   File: ${issue.file}:${issue.line}:${issue.column}`);
  console.log(`   Pattern: ${issue.pattern}`);
  console.log(`   Context: ...${issue.context}...`);
  console.log('   ---');
}

async function main() {
  try {
    // Check if build directory exists
    if (!fs.existsSync(buildDir)) {
      console.error('❌ Build directory not found. Please run "npm run build" first.');
      process.exit(1);
    }

    const issues = await checkClientBundles();
    printResults(issues);

    // Exit with error code if high or medium severity issues found
    const criticalIssues = issues.filter(i => i.severity === 'high' || i.severity === 'medium');
    if (criticalIssues.length > 0) {
      console.log(`\n💥 ${criticalIssues.length} critical security issue(s) detected!`);
      process.exit(1);
    }

    console.log('\n🎉 Client bundle security check passed!');
    process.exit(0);

  } catch (error) {
    console.error('💥 Security check failed:', error);
    process.exit(1);
  }
}

// Add fast-glob as a simple alternative
async function glob(patterns: string[]): Promise<string[]> {
  const fs = await import('fs');
  const path = await import('path');
  
  const results: string[] = [];
  
  for (const pattern of patterns) {
    try {
      const dir = pattern.replace('/**/*.js', '');
      if (fs.existsSync(dir)) {
        const files = getAllJsFiles(dir);
        results.push(...files);
      }
    } catch (error) {
      // Ignore errors for missing directories
    }
  }
  
  return results;
}

function getAllJsFiles(dir: string): string[] {
  const files: string[] = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...getAllJsFiles(fullPath));
      } else if (entry.name.endsWith('.js')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Ignore errors
  }
  
  return files;
}

main();
