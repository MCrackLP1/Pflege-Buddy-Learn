# Deployment Guide

## Local Development

1. **Clone and install dependencies**:
   ```bash
   git clone <repo>
   cd pflegebuddy-learn
   npm install
   ```

2. **Set up environment variables** (copy from README.md)

3. **Database setup**:
   ```bash
   npm run db:generate  # Generate migration files
   npm run db:migrate   # Run migrations
   npm run db:seed     # Seed with sample data
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## Production Deployment

### Vercel Deployment

1. **Connect to Vercel**:
   - Push code to GitHub
   - Connect repository in Vercel dashboard
   - Configure environment variables

2. **Environment Variables in Vercel**:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE
   DATABASE_URL
   NEXT_PUBLIC_APP_NAME
   NEXT_PUBLIC_DEFAULT_LOCALE
   NEXT_PUBLIC_SUPPORTED_LOCALES
   STRIPE_SECRET_KEY
   STRIPE_WEBHOOK_SECRET
   NEXT_PUBLIC_STRIPE_PRICE_IDS
   OPENAI_API_KEY (optional)
   ```

3. **Deploy automatically on push to main branch**

### Supabase Production Setup

1. **Create production project**:
   - Create new project in Supabase dashboard (EU region)
   - Note the project URL and keys

2. **Configure authentication**:
   - Enable Google OAuth provider
   - Add production domain to allowed origins

3. **Run migrations**:
   ```bash
   # Set production DATABASE_URL
   npm run db:migrate
   npm run db:seed
   ```

4. **Set up RLS policies** (copy from README.md)

### Stripe Production Setup

1. **Create products**:
   - 10 Hints: €2.99
   - 50 Hints: €9.99 
   - 200 Hints: €24.99

2. **Configure webhook**:
   - Endpoint: `https://your-domain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `checkout.session.expired`

3. **Update price IDs in environment**

## Mobile Testing Checklist

- [ ] Test on 390px viewport (primary)
- [ ] Touch targets ≥44px
- [ ] Readable text on small screens
- [ ] Navigation accessible via touch
- [ ] Forms work with mobile keyboards
- [ ] Performance good on slow connections

## Post-Deployment

1. **Test authentication flow**
2. **Verify quiz functionality** 
3. **Test hint purchasing** (small amount)
4. **Check mobile responsiveness**
5. **Verify accessibility** with screen reader
6. **Monitor error logs** in Supabase/Vercel

## Monitoring

- **Supabase Dashboard**: Database performance, auth metrics
- **Vercel Analytics**: Page performance, user behavior  
- **Stripe Dashboard**: Payment success rates
- **Error Tracking**: Check logs for TypeScript/runtime errors
