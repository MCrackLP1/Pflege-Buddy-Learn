#!/usr/bin/env tsx

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { generateReviewTemplate } from '../src/lib/content/medical-review';

/**
 * Generate medical expert review template from generated content
 */
async function generateReviewTemplates(): Promise<void> {
  console.log('📋 Generating medical expert review templates...');
  
  const contentDir = join(process.cwd(), 'data', 'generated-content');
  const reviewDir = join(process.cwd(), 'data', 'medical-review');
  
  // Ensure review directory exists
  if (!require('fs').existsSync(reviewDir)) {
    require('fs').mkdirSync(reviewDir, { recursive: true });
  }

  // Find all generated content files
  const contentFiles = readdirSync(contentDir)
    .filter(f => f.includes('verified_') && f.endsWith('.json'));

  if (contentFiles.length === 0) {
    console.log('⚠️  No generated content found. Run content:generate-verified first.');
    return;
  }

  for (const file of contentFiles) {
    console.log(`\n📄 Processing: ${file}`);
    
    try {
      const content = JSON.parse(readFileSync(join(contentDir, file), 'utf-8'));
      const questions = content.questions || [];
      
      // Filter questions that require expert review
      const reviewRequired = questions.filter(q => 
        q.medical_review?.requires_expert_review || 
        q.medical_review?.ai_confidence < 90
      );

      if (reviewRequired.length === 0) {
        console.log('   ✅ No expert review required for this batch');
        continue;
      }

      const template = generateReviewTemplate(reviewRequired);
      
      const reviewFilename = file.replace('_verified_', '_review_').replace('.json', '.md');
      const reviewPath = join(reviewDir, reviewFilename);
      
      writeFileSync(reviewPath, template);
      
      console.log(`   📋 Review template created: ${reviewFilename}`);
      console.log(`   🔍 Questions requiring review: ${reviewRequired.length}/${questions.length}`);
      
    } catch (error) {
      console.error(`   ❌ Error processing ${file}:`, error);
    }
  }

  console.log(`\n📊 Review Template Generation Complete`);
  console.log(`📁 Review templates saved to: data/medical-review/`);
  console.log(`\n📋 Next Steps:`);
  console.log('   1. Share review templates with medical experts');
  console.log('   2. Collect completed reviews');
  console.log('   3. Run content:import --expert-approved after approval');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateReviewTemplates();
}
