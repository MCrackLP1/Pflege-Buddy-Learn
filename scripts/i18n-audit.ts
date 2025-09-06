#!/usr/bin/env node

/**
 * i18n Audit Script
 * 
 * Scans the codebase for hardcoded German strings that should be externalized.
 * This helps maintain consistent i18n practices and catches new hardcoded strings.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Common German words/patterns that indicate hardcoded strings
const GERMAN_PATTERNS = [
  // Common German words
  /["'].*(?:Sie |Ihr |ihre |Diese |Dieser |Das |Der |Die |Mit |Ohne |Für |Wählen |Geben |Keine |Kein ).*["']/,
  // German umlauts
  /["'][^"']*[äöüßÄÖÜ][^"']*["']/,
  // Common German phrases
  /["'].*(?:Fehler|Speichern|Löschen|Bearbeiten|Abbrechen|Bestätigen|Weiter|Zurück|Schließen).*["']/,
  // German compound words with typical patterns
  /["'].*(?:einstellungen|verwaltung|anmeldung|registrierung|bestätigung).*["']/i,
];

// Files to exclude from scanning
const EXCLUDED_PATHS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'coverage',
  'scripts/', // Exclude all scripts (these are build/seed scripts, not UI)
  'src/i18n/messages', // Exclude translation files
  'data/', // Exclude data files
  'tests/', // Exclude test files
  'playwright-report',
  'test-results',
  'src/lib/content/', // Exclude content generation utilities
];

// File extensions to scan
const INCLUDED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

interface Finding {
  file: string;
  line: number;
  content: string;
  pattern: string;
}

function shouldExcludeFile(filePath: string): boolean {
  return EXCLUDED_PATHS.some(excluded => filePath.includes(excluded));
}

function scanFile(filePath: string): Finding[] {
  const findings: Finding[] = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Skip comments
      if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) {
        return;
      }
      
      GERMAN_PATTERNS.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          findings.push({
            file: filePath,
            line: index + 1,
            content: line.trim(),
            pattern: pattern.toString(),
          });
        }
      });
    });
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}:`, error);
  }
  
  return findings;
}

function getAllFiles(dir: string): string[] {
  let results: string[] = [];
  
  try {
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
      const filePath = path.join(dir, file);
      
      if (shouldExcludeFile(filePath)) {
        return;
      }
      
      const stat = fs.statSync(filePath);
      
      if (stat && stat.isDirectory()) {
        results = results.concat(getAllFiles(filePath));
      } else {
        const ext = path.extname(file);
        if (INCLUDED_EXTENSIONS.includes(ext)) {
          results.push(filePath);
        }
      }
    });
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}:`, error);
  }
  
  return results;
}

function main() {
  console.log('🔍 Starting i18n audit...\n');
  
  const rootDir = process.cwd();
  const files = getAllFiles(rootDir);
  
  console.log(`📁 Scanning ${files.length} files...`);
  
  const allFindings: Finding[] = [];
  
  files.forEach(file => {
    const findings = scanFile(file);
    allFindings.push(...findings);
  });
  
  if (allFindings.length === 0) {
    console.log('✅ No hardcoded German strings found! Great job! 🎉');
    process.exit(0);
  }
  
  console.log(`\n❌ Found ${allFindings.length} potential hardcoded German strings:\n`);
  
  // Group findings by file
  const findingsByFile = allFindings.reduce((acc, finding) => {
    if (!acc[finding.file]) {
      acc[finding.file] = [];
    }
    acc[finding.file].push(finding);
    return acc;
  }, {} as Record<string, Finding[]>);
  
  Object.entries(findingsByFile).forEach(([file, findings]) => {
    console.log(`📄 ${file}:`);
    findings.forEach(finding => {
      console.log(`   Line ${finding.line}: ${finding.content}`);
    });
    console.log('');
  });
  
  console.log('💡 Tips for fixing:');
  console.log('   1. Move hardcoded strings to src/i18n/messages/de.json and src/i18n/messages/en.json');
  console.log('   2. Use useTranslations() hook to access translated strings');
  console.log('   3. Use proper namespaces: common, legal, components, errors, validation, etc.');
  console.log('   4. For server components, use getTranslations() instead');
  console.log('');
  console.log('📖 Documentation: Check README.md for i18n guidelines');
  
  process.exit(1);
}

if (require.main === module) {
  main();
}
