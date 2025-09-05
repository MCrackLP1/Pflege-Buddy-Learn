# PowerShell setup script for PflegeBuddy Learn - Ranked Mode Environment
Write-Host "🚀 Setting up PflegeBuddy Learn - Ranked Mode Environment" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Yellow

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local file already exists" -ForegroundColor Green
} else {
    Write-Host "📝 Creating .env.local file from template..." -ForegroundColor Yellow
    Copy-Item "env.template" ".env.local"
    Write-Host "✅ .env.local file created" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔧 Please complete the following steps:" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. 📋 Get your Supabase credentials:" -ForegroundColor Yellow
Write-Host "   - Go to: https://supabase.com/dashboard/project/tkqofzynpyvmivmxhoef" -ForegroundColor White
Write-Host "   - Go to Settings → API" -ForegroundColor White
Write-Host "   - Copy the following values:" -ForegroundColor White
Write-Host ""

Write-Host "2. ✏️  Edit .env.local file with your credentials:" -ForegroundColor Yellow
Write-Host "   - NEXT_PUBLIC_SUPABASE_URL: https://tkqofzynpyvmivmxhoef.supabase.co" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_SUPABASE_ANON_KEY: [from Supabase dashboard]" -ForegroundColor White
Write-Host "   - SUPABASE_SERVICE_ROLE: [from Supabase dashboard]" -ForegroundColor White
Write-Host "   - DATABASE_URL: [from Supabase dashboard → Settings → Database]" -ForegroundColor White
Write-Host ""

Write-Host "3. 🗄️ Run database migration:" -ForegroundColor Yellow
Write-Host "   npx drizzle-kit migrate" -ForegroundColor White
Write-Host ""

Write-Host "4. 🌱 Seed the database (optional):" -ForegroundColor Yellow
Write-Host "   npm run db:seed" -ForegroundColor White
Write-Host ""

Write-Host "5. 🚀 Start development server:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "📖 For detailed setup instructions, see: SUPABASE_SETUP.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: Never commit .env.local to version control!" -ForegroundColor Red
Write-Host "======================================================" -ForegroundColor Yellow

