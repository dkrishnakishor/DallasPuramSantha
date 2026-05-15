#!/bin/bash

# Setup comprehensive monitoring and dashboards
# Includes: Sentry error tracking + Vercel analytics + Upstash metrics

set -e

echo "📊 Setting up monitoring and dashboards..."
echo ""

# Step 1: Install Sentry
echo "📦 Installing @sentry/nextjs for error tracking..."
npm install @sentry/nextjs

# Step 2: Environment variables info
echo ""
echo "🔑 Add these environment variables to your setup:"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1️⃣  SENTRY CONFIGURATION (Error Tracking)"
echo "   Go to: https://sentry.io"
echo "   1. Create account"
echo "   2. Create new project (Next.js)"
echo "   3. Copy your DSN"
echo ""
echo "   Add to .env.local:"
echo "   NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "2️⃣  UPSTASH MONITORING (Cache Metrics)"
echo "   Go to: https://console.upstash.com"
echo "   1. Select your Redis database"
echo "   2. View Statistics section"
echo "   3. Monitor cache hit rate (target: >80%)"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "3️⃣  VERCEL ANALYTICS (Built-in)"
echo "   Go to: https://vercel.com/dashboard"
echo "   1. Select your project"
echo "   2. Click 'Analytics' tab"
echo "   3. Monitor P50, P99, error rates"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✅ Monitoring dependencies installed!"
echo ""
echo "Next steps:"
echo "1. Get Sentry DSN from https://sentry.io"
echo "2. Add to .env.local: NEXT_PUBLIC_SENTRY_DSN=..."
echo "3. Add to Vercel env vars: NEXT_PUBLIC_SENTRY_DSN=..."
echo "4. Run: npm run dev"
echo "5. Check /api/monitoring/health endpoint (authenticated)"
echo ""
echo "Files created:"
echo "  - lib/monitoring.ts (Monitoring utilities)"
echo "  - middleware.ts (Auto-tracking)"
echo "  - app/api/monitoring/health/route.ts (Health endpoint)"
echo "  - app/api/monitoring/status/route.ts (Status page)"
echo ""
