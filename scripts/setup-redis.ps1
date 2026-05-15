# Setup Redis caching layer for Windows
# This script installs Upstash Redis (serverless, no local setup needed)

Write-Host "🚀 Setting up Redis caching layer..." -ForegroundColor Green
Write-Host ""

# Step 1: Install Upstash Redis SDK
Write-Host "📦 Installing @upstash/redis..." -ForegroundColor Cyan
npm install @upstash/redis
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Failed to install @upstash/redis" -ForegroundColor Red
  exit 1
}

# Step 2: Check .env.local
Write-Host ""
Write-Host "🔑 Checking environment configuration..." -ForegroundColor Cyan

$envFile = ".env.local"

if (Test-Path $envFile) {
  $content = Get-Content $envFile
  if ($content -like "*UPSTASH_REDIS_REST_URL*") {
    Write-Host "✅ Redis environment variables already configured" -ForegroundColor Green
  }
  else {
    Write-Host "⚠️  .env.local exists but missing Redis variables" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Add these to your .env.local:" -ForegroundColor Cyan
    Write-Host "UPSTASH_REDIS_REST_URL=https://[your-database].upstash.io"
    Write-Host "UPSTASH_REDIS_REST_TOKEN=[your-token]"
  }
}
else {
  Write-Host "⏭️  To complete setup, create .env.local with these variables:" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "# Redis Caching (from Upstash.com)" -ForegroundColor Gray
  Write-Host "UPSTASH_REDIS_REST_URL=https://[your-database].upstash.io"
  Write-Host "UPSTASH_REDIS_REST_TOKEN=[your-token]"
  Write-Host ""
}

Write-Host ""
Write-Host "✅ Redis dependencies installed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Get Upstash credentials from https://console.upstash.com"
Write-Host "2. Add to .env.local:"
Write-Host "   - UPSTASH_REDIS_REST_URL"
Write-Host "   - UPSTASH_REDIS_REST_TOKEN"
Write-Host "3. Add the same to Vercel environment variables"
Write-Host "4. Run: npm run dev"
Write-Host ""
