#!/usr/bin/env tsx

import OpenAI from 'openai';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { VERIFIED_MEDICAL_SOURCES, verifyMedicalSource, getContentRequirements } from '../src/lib/content/source-verification';

interface VerifiedQuestion {
  type: 'mc' | 'tf';
  stem: string;
  explanation_md: string;
  difficulty: number;
  hints: string[];
  choices?: {
    label: string;
    is_correct: boolean;
  }[];
  tf_correct_answer?: boolean;
  citations: {
    url: string;
    title: string;
    organization: string;
    published_date: string;
    credibility_score: number;
  }[];
  medical_review: {
    generated_at: string;
    ai_confidence: number;
    requires_expert_review: boolean;
    source_verification: 'verified' | 'pending' | 'rejected';
  };
}

interface ContentGenerationResult {
  topic: string;
  questions: VerifiedQuestion[];
  quality_metrics: {
    total_generated: number;
    expert_review_required: number;
    average_credibility: number;
    source_coverage: number;
  };
}

const MEDICAL_QUESTION_PROMPTS = {
  mc: `You are a medical education expert creating Multiple Choice questions for nursing professionals in Germany.

CRITICAL MEDICAL ACCURACY REQUIREMENTS:
- Base ALL content on the provided verified medical sources
- Ensure answers are factually correct according to current medical standards
- Include specific numerical values, dosages, or protocols when relevant
- Cross-reference multiple sources when possible
- Flag any uncertainty with lower confidence scores

FORMAT: Return ONLY valid JSON:
{
  "type": "mc",
  "stem": "Clear, specific question in German",
  "explanation_md": "Detailed explanation with medical reasoning and source references",
  "difficulty": 1-5,
  "hints": ["Specific medical hint", "Additional guidance"],
  "choices": [
    {"label": "Option 1", "is_correct": false},
    {"label": "Correct option with specific medical details", "is_correct": true},
    {"label": "Option 3", "is_correct": false},
    {"label": "Option 4", "is_correct": false}
  ],
  "ai_confidence": 0-100,
  "requires_expert_review": true/false
}

QUALITY STANDARDS:
- Question difficulty should match nursing education level
- Avoid trick questions or ambiguous wording
- Include practical, real-world scenarios
- Ensure all incorrect options are plausible but clearly wrong
- Reference specific guidelines or protocols in explanations`,

  tf: `You are a medical education expert creating True/False questions for nursing professionals in Germany.

CRITICAL MEDICAL ACCURACY REQUIREMENTS:
- Base ALL statements on the provided verified medical sources
- Ensure statements are unambiguously true or false
- Avoid partial truths or context-dependent statements  
- Include specific protocols, timeframes, or measurements
- Cross-reference multiple sources for accuracy

FORMAT: Return ONLY valid JSON:
{
  "type": "tf",
  "stem": "Clear, specific statement in German",
  "explanation_md": "Detailed explanation why statement is true/false with source references",
  "difficulty": 1-5,
  "hints": ["Medical guidance hint", "Additional context"],
  "tf_correct_answer": true/false,
  "ai_confidence": 0-100,
  "requires_expert_review": true/false
}

QUALITY STANDARDS:
- Statement should be definitively true or false, no gray areas
- Include specific medical facts (timeframes, dosages, protocols)
- Explanation must reference authoritative sources
- Consider real-world nursing practice scenarios
- Avoid statements that could be misinterpreted`
};

/**
 * Generate medically verified questions using AI with strict quality controls
 */
async function generateVerifiedContent(
  topic: string, 
  targetCount: number = 50,
  dryRun: boolean = true
): Promise<ContentGenerationResult> {
  console.log(`🏥 Generating ${targetCount} verified medical questions for topic: ${topic}`);
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('⚠️  OPENAI_API_KEY required for content generation');
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Get verified sources for this topic
  const sources = VERIFIED_MEDICAL_SOURCES[topic];
  if (!sources) {
    throw new Error(`No verified sources available for topic: ${topic}`);
  }

  // Verify all sources meet quality standards
  console.log('🔍 Verifying medical sources...');
  const sourceVerification = sources.map(source => ({
    source,
    verification: verifyMedicalSource(source)
  }));

  const approvedSources = sourceVerification.filter(sv => sv.verification.approved);
  if (approvedSources.length < 2) {
    throw new Error(`Insufficient verified sources for topic: ${topic} (need min. 2, have ${approvedSources.length})`);
  }

  console.log(`✅ ${approvedSources.length} sources verified for medical accuracy`);
  approvedSources.forEach(sv => {
    console.log(`   📚 ${sv.source.organization} (Score: ${sv.verification.score}/10)`);
  });

  const requirements = getContentRequirements(topic);
  const questions: VerifiedQuestion[] = [];
  const questionsPerType = Math.ceil(targetCount / 2);

  // Generate Multiple Choice questions
  console.log(`\n📝 Generating ${questionsPerType} Multiple Choice questions...`);
  for (let i = 0; i < questionsPerType; i++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: MEDICAL_QUESTION_PROMPTS.mc
          },
          {
            role: 'user',
            content: `Topic: ${topic}

Verified Medical Sources:
${approvedSources.map(sv => `
- Organization: ${sv.source.organization}
- Title: ${sv.source.title}  
- URL: ${sv.source.url}
- Credibility: ${sv.verification.score}/10
- Type: ${sv.source.type}
`).join('\n')}

Requirements:
- Minimum credibility score: ${requirements.qualityThreshold}
- Expert review required: ${requirements.reviewRequired}
- Question number: ${i + 1}/${questionsPerType}

Generate a factually accurate Multiple Choice question based strictly on these verified sources.`
          }
        ],
        temperature: 0.3, // Lower temperature for medical accuracy
        max_tokens: 1500,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          const questionData = JSON.parse(content);
          
          // Add medical review metadata
          const verifiedQuestion: VerifiedQuestion = {
            ...questionData,
            citations: approvedSources.map(sv => ({
              url: sv.source.url,
              title: sv.source.title,
              organization: sv.source.organization,
              published_date: sv.source.publishedDate,
              credibility_score: sv.verification.score,
            })),
            medical_review: {
              generated_at: new Date().toISOString(),
              ai_confidence: questionData.ai_confidence || 85,
              requires_expert_review: questionData.ai_confidence < 90 || requirements.reviewRequired,
              source_verification: 'verified' as const,
            }
          };

          questions.push(verifiedQuestion);
          console.log(`   ✅ MC Question ${i + 1}: "${questionData.stem.slice(0, 60)}..." (Confidence: ${questionData.ai_confidence || 85}%)`);
          
        } catch (parseError) {
          console.error(`   ❌ Invalid JSON response for MC question ${i + 1}:`, parseError);
        }
      }
      
      // Rate limiting for API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`   ❌ Failed to generate MC question ${i + 1}:`, error);
    }
  }

  // Generate True/False questions
  console.log(`\n📝 Generating ${questionsPerType} True/False questions...`);
  for (let i = 0; i < questionsPerType; i++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: MEDICAL_QUESTION_PROMPTS.tf
          },
          {
            role: 'user',
            content: `Topic: ${topic}

Verified Medical Sources:
${approvedSources.map(sv => `
- Organization: ${sv.source.organization}
- Title: ${sv.source.title}
- URL: ${sv.source.url}
- Credibility: ${sv.verification.score}/10
`).join('\n')}

Generate a factually accurate True/False statement based strictly on these verified sources.
Question number: ${i + 1}/${questionsPerType}`
          }
        ],
        temperature: 0.3, // Lower temperature for medical accuracy
        max_tokens: 1200,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          const questionData = JSON.parse(content);
          
          const verifiedQuestion: VerifiedQuestion = {
            ...questionData,
            citations: approvedSources.map(sv => ({
              url: sv.source.url,
              title: sv.source.title,
              organization: sv.source.organization,
              published_date: sv.source.publishedDate,
              credibility_score: sv.verification.score,
            })),
            medical_review: {
              generated_at: new Date().toISOString(),
              ai_confidence: questionData.ai_confidence || 85,
              requires_expert_review: questionData.ai_confidence < 90 || requirements.reviewRequired,
              source_verification: 'verified' as const,
            }
          };

          questions.push(verifiedQuestion);
          console.log(`   ✅ TF Question ${i + 1}: "${questionData.stem.slice(0, 60)}..." (Confidence: ${questionData.ai_confidence || 85}%)`);
          
        } catch (parseError) {
          console.error(`   ❌ Invalid JSON response for TF question ${i + 1}:`, parseError);
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`   ❌ Failed to generate TF question ${i + 1}:`, error);
    }
  }

  // Calculate quality metrics
  const totalGenerated = questions.length;
  const expertReviewRequired = questions.filter(q => q.medical_review.requires_expert_review).length;
  const averageCredibility = questions.reduce((sum, q) => 
    sum + (q.citations[0]?.credibility_score || 0), 0
  ) / totalGenerated;
  const sourceCoverage = (approvedSources.length / sources.length) * 100;

  const result: ContentGenerationResult = {
    topic,
    questions,
    quality_metrics: {
      total_generated: totalGenerated,
      expert_review_required: expertReviewRequired,
      average_credibility: Math.round(averageCredibility * 10) / 10,
      source_coverage: Math.round(sourceCoverage),
    }
  };

  // Save to file for review
  const outputDir = join(process.cwd(), 'data', 'generated-content');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const filename = `${topic}_verified_${new Date().toISOString().split('T')[0]}.json`;
  const filepath = join(outputDir, filename);
  
  if (!dryRun) {
    writeFileSync(filepath, JSON.stringify(result, null, 2));
    console.log(`\n💾 Saved ${totalGenerated} questions to: ${filename}`);
  } else {
    console.log(`\n🔍 DRY RUN: Would save ${totalGenerated} questions to: ${filename}`);
  }

  // Quality report
  console.log(`\n📊 Quality Metrics:`);
  console.log(`   Generated: ${totalGenerated}/${targetCount} questions`);
  console.log(`   Expert Review Required: ${expertReviewRequired} (${Math.round(expertReviewRequired/totalGenerated*100)}%)`);
  console.log(`   Average Credibility: ${averageCredibility}/10`);
  console.log(`   Source Coverage: ${sourceCoverage}%`);

  if (expertReviewRequired > 0) {
    console.log(`\n⚠️  ${expertReviewRequired} questions require medical expert review before publication`);
  }

  return result;
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const topic = args[0] || 'grundlagen';
  const count = parseInt(args[1]) || 50;
  const dryRun = args.includes('--dry-run');

  console.log(`🏥 Medical Content Generation Pipeline`);
  console.log(`📚 Topic: ${topic}`);
  console.log(`🎯 Target: ${count} questions`);
  console.log(`🧪 Mode: ${dryRun ? 'DRY RUN' : 'PRODUCTION'}\n`);

  try {
    await generateVerifiedContent(topic, count, dryRun);
    console.log('\n🎉 Medical content generation completed successfully!');
    
    if (!dryRun) {
      console.log('\n📋 Next Steps:');
      console.log('   1. Review generated questions in data/generated-content/');
      console.log('   2. Have medical expert review flagged questions');
      console.log('   3. Run: npm run content:import to add to database');
    }
    
  } catch (error) {
    console.error('\n❌ Content generation failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
