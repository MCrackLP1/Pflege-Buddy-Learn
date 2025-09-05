#!/bin/bash

echo "🚀 Setting up PflegeBuddy Learn - Ranked Mode Environment"
echo "======================================================"

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file already exists"
else
    echo "📝 Creating .env.local file from template..."
    cp env.template .env.local
    echo "✅ .env.local file created"
fi

echo ""
echo "🔧 Please complete the following steps:"
echo ""

echo "1. 📋 Get your Supabase credentials:"
echo "   - Go to: https://supabase.com/dashboard/project/tkqofzynpyvmivmxhoef"
echo "   - Go to Settings → API"
echo "   - Copy the following values:"
echo ""

echo "2. ✏️  Edit .env.local file with your credentials:"
echo "   - NEXT_PUBLIC_SUPABASE_URL: https://tkqofzynpyvmivmxhoef.supabase.co"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY: [from Supabase dashboard]"
echo "   - SUPABASE_SERVICE_ROLE: [from Supabase dashboard]"
echo "   - DATABASE_URL: [from Supabase dashboard → Settings → Database]"
echo ""

echo "3. 🗄️ Run database migration:"
echo "   npm run db:migrate"
echo ""

echo "4. 🌱 Seed the database (optional):"
echo "   npm run db:seed"
echo ""

echo "5. 🚀 Start development server:"
echo "   npm run dev"
echo ""

echo "📖 For detailed setup instructions, see: SUPABASE_SETUP.md"
echo ""
echo "⚠️  IMPORTANT: Never commit .env.local to version control!"
echo "======================================================"

