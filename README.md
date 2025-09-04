# PflegeBuddy Learn

**Mobile-first web app for daily nursing knowledge drills**

> ⚠️ **Wichtiger Hinweis**: Diese App ist kein Ersatz für medizinische Beratung oder professionelle Ausbildung.

## Features

- 📱 **Mobile-first**: Optimiert für Smartphones (390px primary viewport)
- 🎯 **Daily Drills**: 5-minütige Wissenstraining mit Multiple-Choice und Wahr/Falsch-Fragen
- 🤖 **AI-Generated Content**: Automatische Fragenerstellung aus vertrauenswürdigen Quellen
- 🎮 **Gamification**: XP-System, Streak-Tracking, Hint-Economy
- 🌐 **Internationalisierung**: Deutsch (Standard) und Englisch
- ♿ **Accessibility**: WCAG AA+ konform
- 🔐 **Sichere Auth**: Supabase Google OAuth
- 💳 **Stripe Integration**: Hint-Packs kaufen

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS, shadcn/ui, Lucide React
- **Database**: Supabase (Postgres), Drizzle ORM
- **Auth**: Supabase Auth (Google OAuth)
- **Payments**: Stripe Checkout + Webhooks
- **i18n**: next-intl
- **Testing**: Playwright (mobile-focused)

## Quick Start

### 1. Installation

\`\`\`bash
npm install
\`\`\`

### 2. Environment Setup

Create \`.env.local\`:

\`\`\`env
# Supabase Configuration - PflegeBuddy Learn  
NEXT_PUBLIC_SUPABASE_URL=https://tkqofzynpyvmivmxhoef.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrcW9menlucHl2bWl2bXhob2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MzYyNDAsImV4cCI6MjA3MjUxMjI0MH0.cFcq5cCiAevBz_ZmOZ1rwjYxvy-lplVGHKj2pztj30c
SUPABASE_SERVICE_ROLE=your-service-role-key
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.tkqofzynpyvmivmxhoef.supabase.co:5432/postgres

# App Configuration
NEXT_PUBLIC_APP_NAME="PflegeBuddy Learn"
NEXT_PUBLIC_DEFAULT_LOCALE=de
NEXT_PUBLIC_SUPPORTED_LOCALES=de,en

# Stripe Configuration (Optional for local dev)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_IDS={"10_hints":"price_1234","50_hints":"price_5678","200_hints":"price_9999"}

# AI Content Generation (Optional)
OPENAI_API_KEY=sk-...
\`\`\`

### 3. Database Setup

\`\`\`bash
# Generate and run migrations
npm run db:generate
npm run db:migrate

# Seed with sample data
npm run db:seed
\`\`\`

### 4. Supabase Setup

#### Row Level Security Policies

Execute these in your Supabase SQL editor:

\`\`\`sql
-- Enable RLS on all tables
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Public read access for topics, questions, choices, citations
CREATE POLICY "Public read topics" ON topics FOR SELECT USING (true);
CREATE POLICY "Public read questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Public read choices" ON choices FOR SELECT USING (true);
CREATE POLICY "Public read citations" ON citations FOR SELECT USING (true);

-- User-specific access for personal data
CREATE POLICY "Users can manage own attempts" ON attempts 
  FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can manage own progress" ON user_progress 
  FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can manage own profile" ON profiles 
  FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can manage own wallet" ON user_wallet 
  FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can manage own purchases" ON purchases 
  FOR ALL USING (auth.uid()::text = user_id);
\`\`\`

#### Google OAuth Setup

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google OAuth
3. Add your Google OAuth client credentials
4. Set redirect URL: \`https://your-project.supabase.co/auth/v1/callback\`

### 5. Stripe Setup (Optional)

1. Create products in Stripe Dashboard:
   - 10 Hints: €2.99
   - 50 Hints: €9.99
   - 200 Hints: €24.99

2. Copy price IDs to \`NEXT_PUBLIC_STRIPE_PRICE_IDS\` env var

3. Set up webhook endpoint: \`/api/stripe/webhook\`
   - Events: \`checkout.session.completed\`, \`checkout.session.expired\`

### 6. Content Generation

\`\`\`bash
# Discover reliable sources (manual curation)
npm run content:discover

# Generate questions with AI (requires OPENAI_API_KEY)
npm run content:generate

# Seed database with generated content
npm run db:seed
\`\`\`

### 7. Development

\`\`\`bash
# Start development server
npm run dev

# Run type checking
npm run type-check

# Run tests
npm test
\`\`\`

## Mobile Testing

The app is designed mobile-first. Test on these viewports:

- **Primary**: 390px (iPhone 12 Pro size)
- **Tablet**: 768px 
- **Desktop**: 1280px+

### Testing with Playwright

\`\`\`bash
# Run mobile-focused tests
npm test

# Interactive mode
npm run test:ui
\`\`\`

### Browser DevTools

1. Open DevTools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Set to 390px width for primary testing
4. Test touch interactions and responsive behavior

## Deployment

### Vercel Deployment

1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Supabase Production

1. Create production project
2. Run migrations: \`npm run db:migrate\`
3. Set up RLS policies (see above)
4. Update environment variables

### Stripe Production

1. Switch to live keys in production
2. Set up production webhook endpoints
3. Test payment flow thoroughly

## Project Structure

\`\`\`
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes
│   └── api/               # API endpoints
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── pages/            # Page components
│   └── providers/        # React providers
├── lib/                  # Utilities
│   ├── db/              # Database schema & client
│   └── supabase/        # Supabase utilities
└── i18n/                # Internationalization
    └── messages/        # Translation files

scripts/                  # Database & content scripts
data/                    # Generated content data
tests/                   # Playwright tests
\`\`\`

## Key Features Implementation

### Hints Economy
- 2 free hints per day (resets at midnight Europe/Berlin)
- Additional hints purchasable via Stripe
- Hints stored in user wallet with daily tracking

### Gamification
- XP calculation based on difficulty, speed, hints used
- Daily streak tracking
- Progress visualization with charts

### Content Pipeline
- AI-powered question generation from reliable sources
- Manual curation of trustworthy medical sources
- Citation tracking for transparency
- Fallback manual questions for offline development

### Accessibility
- WCAG AA+ compliance
- 44px minimum touch targets
- Proper focus management
- Screen reader friendly
- Reduced motion support

## Contributing

1. Follow mobile-first development
2. Test on 390px viewport primarily
3. Ensure accessibility compliance
4. Add proper TypeScript types
5. Include tests for new features

## License

MIT License - Educational use only. Not for medical advice.
