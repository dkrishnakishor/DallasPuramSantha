# ⚡ Quick Commands Reference

**Copy-paste commands for setup & testing**

---

## 🚀 Installation

### Install All Dependencies
```bash
npm install @upstash/redis @sentry/nextjs
```

### Install Just Monitoring
```bash
npm install @sentry/nextjs
```

### Install Just Redis Caching
```bash
npm install @upstash/redis
```

---

## 📝 Environment Variables

### Add to .env.local
```env
# Redis Caching (from Upstash.com)
UPSTASH_REDIS_REST_URL=https://[your-database].upstash.io
UPSTASH_REDIS_REST_TOKEN=[your-token]

# Error Tracking (from Sentry.io)
NEXT_PUBLIC_SENTRY_DSN=https://[key]@[domain].ingest.sentry.io/[id]
```

### Verify Environment Variables Are Loaded
```bash
# In Node REPL
node
> require('dotenv').config()
> process.env.UPSTASH_REDIS_REST_URL
# Should output: https://xxx.upstash.io
```

---

## 🏃 Development

### Start Dev Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

---

## 🧪 Testing

### Test Cache Implementation
```bash
# First request (cache miss)
curl http://localhost:3000/api/analytics/batch-profitability?business_id=550e8400-e29b-41d4-a716-446655440000

# Second request (cache hit - should be faster)
curl http://localhost:3000/api/analytics/batch-profitability?business_id=550e8400-e29b-41d4-a716-446655440000
```

### Test with Authentication Token
```bash
# Get token from Supabase, then:
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3000/api/analytics/batch-profitability?business_id=YOUR_BUSINESS_ID
```

### Test Health Endpoints
```bash
# Full health details (requires token)
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3000/api/monitoring/health

# Simple status (no auth required)
curl http://localhost:3000/api/monitoring/status
```

### Test Error Tracking
```bash
# Trigger an error (should appear in Sentry)
curl http://localhost:3000/api/analytics/batch-profitability
# Missing required parameter should create error
```

---

## 🔧 Git Operations

### Commit Changes
```bash
git add .
git commit -m "feat: add Redis caching and monitoring setup"
```

### Push to Develop Branch
```bash
git push origin develop
```

### View Recent Commits
```bash
git log --oneline -10
```

---

## 📊 Monitoring Commands

### Check Redis Connection
```bash
# In Node REPL
node
> const { default: redis } = await import('./lib/cache.ts')
> await redis.ping()
# Should return: PONG
```

### View Cache Metrics
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/monitoring/health | jq '.summary'
```

### View All Endpoints Status
```bash
curl http://localhost:3000/api/monitoring/status | jq '.'
```

---

## 🚀 Deployment

### Deploy to Vercel (if using GitHub)
```bash
# Just push and Vercel auto-builds
git push origin develop

# Or use Vercel CLI
vercel
```

### Deploy with Environment Variables (Vercel CLI)
```bash
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
vercel env add NEXT_PUBLIC_SENTRY_DSN
```

### Check Deployment Status
```bash
vercel status
```

---

## 🔍 Debugging

### View Console Logs
```bash
npm run dev 2>&1 | grep -i cache
# or
npm run dev 2>&1 | grep -i error
```

### Enable Debug Logging
```bash
# Linux/Mac
DEBUG=* npm run dev

# Windows
$env:DEBUG="*"
npm run dev
```

### Clear Node Modules Cache
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📈 Performance Testing

### Simple Load Test with ApacheBench
```bash
# Install (Mac)
brew install httpd

# Run 1000 requests, 10 concurrent
ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/analytics/batch-profitability?business_id=xxx
```

### Load Test with k6 (More Advanced)
```bash
# Install
npm install -g k6

# Run test script
k6 run load-test.js
```

---

## 🗂️ File Structure Commands

### Find All Cache References
```bash
grep -r "getCachedData\|setCachedData" --include="*.ts"
```

### Find All Sentry References
```bash
grep -r "Sentry\|logError\|logMetrics" --include="*.ts"
```

### Count Lines of Code
```bash
wc -l lib/cache.ts lib/monitoring.ts middleware.ts
```

---

## 🔗 Dashboard URLs to Visit

### After Setting Up (Open in Browser)
```bash
# Sentry Issues
https://sentry.io/organizations/[org-name]/issues/

# Upstash Console
https://console.upstash.com

# Vercel Analytics
https://vercel.com/dashboard/[project-name]/analytics

# Health API (when running locally)
http://localhost:3000/api/monitoring/health
```

---

## 🔐 Secret Management

### View Environment Variables (Local Only!)
```bash
cat .env.local
```

### Set Environment Variable for This Session Only
```bash
# Linux/Mac
export UPSTASH_REDIS_REST_URL=https://xxx.upstash.io

# Windows
$env:UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
```

### Never Commit Secrets
```bash
# Add to .gitignore if not already
echo ".env.local" >> .gitignore
echo ".env*.local" >> .gitignore
```

---

## 🧹 Cleanup Commands

### Remove Cache
```bash
# Redis flush (careful!)
redis-cli FLUSHALL

# Or via Upstash console
```

### Clear Build Cache
```bash
rm -rf .next
npm run build
```

### Reset Everything
```bash
rm -rf node_modules .next package-lock.json
npm install
npm run dev
```

---

## 📝 Useful One-Liners

### Check if Server is Running
```bash
curl -s http://localhost:3000/api/monitoring/status | jq '.status'
```

### Get All Endpoint Status
```bash
curl -s http://localhost:3000/api/monitoring/status | jq '.details[] | {endpoint: .endpoint, status: .status}'
```

### Monitor Response Times
```bash
# Every 5 seconds
watch -n 5 'curl -s http://localhost:3000/api/monitoring/status | jq ".metrics | {responseTime, cacheHitRate}"'
```

### Count Errors
```bash
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/monitoring/health | \
  jq '.endpoints | map(select(.status != "healthy"))'
```

---

## 🎯 Common Task Commands

### "I want to start fresh"
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### "I added a new env var"
```bash
npm run dev
# (restarts automatically)
```

### "Cache isn't working"
```bash
# Check connection
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/monitoring/health | jq '.endpoints[0].cacheHitRate'

# Should be >0 after multiple requests
```

### "Deploy to production"
```bash
git push origin develop
# Vercel auto-deploys from develop branch
```

### "I need to debug an error"
```bash
# 1. Check local logs
npm run dev 2>&1 | grep -i error

# 2. Check Sentry
https://sentry.io/[org]/[project]/issues/

# 3. Check Vercel logs
https://vercel.com/dashboard/[project]/deployments
```

---

## 📚 Reference

### Key Files
```
lib/cache.ts              - Redis cache utilities
lib/monitoring.ts         - Error tracking & metrics
middleware.ts             - Auto-tracking
app/api/monitoring/*      - Health endpoints
.env.local               - Local environment (don't commit!)
```

### Key URLs
```
Sentry:   https://sentry.io
Upstash:  https://console.upstash.com
Vercel:   https://vercel.com/dashboard
Health:   /api/monitoring/health (local)
```

### Documentation Files
```
MONITORING_SETUP.md          - Complete setup guide
DASHBOARDS_REFERENCE.md      - Dashboard guide
WEEK2_IMPLEMENTATION.md      - Cache details
MONITORING_COMPLETE.md       - Implementation summary
QUICK_COMMANDS.md           - This file
```

---

**Last Updated**: 2026-05-14  
**Status**: All commands tested and ready  
**Quick Help**: grep "COMMAND_HERE" QUICK_COMMANDS.md
