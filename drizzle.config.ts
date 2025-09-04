import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:[YOUR-PASSWORD]@db.tkqofzynpyvmivmxhoef.supabase.co:5432/postgres',
  },
} satisfies Config;
