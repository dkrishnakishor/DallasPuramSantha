# Setup comprehensive monitoring and dashboards for Windows
# Includes: Sentry + Vercel + Upstash monitoring

Write-Host "📊 Setting up monitoring and dashboards..." -ForegroundColor Green
Write-Host ""

# Step 1: Install Sentry
Write-Host "📦 Installing @sentry/nextjs for error tracking..." -ForegroundColor Cyan
npm install @sentry/nextjs
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Failed to install @sentry/nextjs" -ForegroundColor Red
  exit 1
}

# Step 2: Display setup instructions
Write-Host ""
Write-Host "🔑 Add these environment variables to your setup:" -ForegroundColor Yellow
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════"
Write-Host ""
Write-Host "1️⃣  SENTRY CONFIGURATION (Error Tracking)" -ForegroundColor Cyan
Write-Host "   Go to: https://sentry.io"
Write-Host "   1. Create account"
Write-Host "   2. Create new project (Next.js)"
Write-Host "   3. Copy your DSN"
Write-Host ""
Write-Host "   Add to .env.local:"
Write-Host "   NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════"
Write-Host ""
Write-Host "2️⃣  UPSTASH MONITORING (Cache Metrics)" -ForegroundColor Cyan
Write-Host "   Go to: https://console.upstash.com"
Write-Host "   1. Select your Redis database"
Write-Host "   2. View Statistics section"
Write-Host "   3. Monitor cache hit rate (target: >80%)"
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════"
Write-Host ""
Write-Host "3️⃣  VERCEL ANALYTICS (Built-in)" -ForegroundColor Cyan
Write-Host "   Go to: https://vercel.com/dashboard"
Write-Host "   1. Select your project"
Write-Host "   2. Click 'Analytics' tab"
Write-Host "   3. Monitor P50, P99, error rates"
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════"
Write-Host ""
Write-Host "✅ Monitoring dependencies installed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Get Sentry DSN from https://sentry.io"
Write-Host "2. Add to .env.local: NEXT_PUBLIC_SENTRY_DSN=..."
Write-Host "3. Add to Vercel env vars: NEXT_PUBLIC_SENTRY_DSN=..."
Write-Host "4. Run: npm run dev"
Write-Host "5. Check /api/monitoring/health endpoint (authenticated)"
Write-Host ""
Write-Host "Files created:" -ForegroundColor Cyan
Write-Host "  - lib/monitoring.ts (Monitoring utilities)"
Write-Host "  - middleware.ts (Auto-tracking)"
Write-Host "  - app/api/monitoring/health/route.ts (Health endpoint)"
Write-Host "  - app/api/monitoring/status/route.ts (Status page)"
Write-Host ""
