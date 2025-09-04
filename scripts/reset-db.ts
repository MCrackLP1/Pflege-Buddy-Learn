#!/usr/bin/env tsx

import { db } from '../src/lib/db';
import { topics, questions, choices, attempts, userProgress, profiles, userWallet, purchases, citations } from '../src/lib/db/schema';

async function resetDatabase(): Promise<void> {
  console.log('🗑️  Resetting database...');

  try {
    // Delete all data in dependency order
    await db.delete(citations);
    await db.delete(choices);
    await db.delete(attempts);
    await db.delete(purchases);
    await db.delete(userWallet);
    await db.delete(userProgress);
    await db.delete(profiles);
    await db.delete(questions);
    await db.delete(topics);

    console.log('✅ Database reset completed!');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  resetDatabase().catch(console.error);
}

export { resetDatabase };
