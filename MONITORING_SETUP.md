# 📊 Monitoring & Dashboards Setup Guide

**Status**: 🟢 Ready to configure  
**Date**: 2026-05-14  
**Components**: Sentry + Upstash + Vercel + Custom Health API

---

## 🎯 Overview

Three-layer monitoring stack:

```
Layer 1: Error Tracking (Sentry)
  └─ Captures errors, crashes, performance issues
  └─ Real-time alerts
  └─ Source maps for debugging

Layer 2: Infrastructure Monitoring (Upstash, Vercel)
  └─ Redis cache metrics
  └─ API response times
  └─ Deployment status

Layer 3: Custom Health API
  └─ Per-endpoint metrics
  └─ Cache hit rates
  └─ Error rates
  └─ Real-time status dashboard
```

---

## 1️⃣ Sentry Setup (Error Tracking)

### What It Does
- 🔴 Captures all errors and exceptions
- ⚡ Tracks performance slowdowns
- 📧 Sends real-time alerts
- 🔍 Groups similar errors automatically
- 📈 Shows error trends over time

### Step 1: Create Sentry Account

```
1. Go to https://sentry.io
2. Sign up (free tier: 5k events/month)
3. Create new project:
   - Platform: "Next.js"
   - Alert email: your@email.com
```

### Step 2: Get Your Sentry DSN

```
In Sentry dashboard:
Settings → Projects → [Your Project] → Client Keys (DSN)

Example: https://examplePublicKey@o0.ingest.sentry.io/0
```

### Step 3: Add to Environment Variables

**Local (.env.local)**:
```env
NEXT_PUBLIC_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

**Vercel (Settings → Environment Variables)**:
```
NEXT_PUBLIC_SENTRY_DSN = https://examplePublicKey@o0.ingest.sentry.io/0
```

### Step 4: Install Sentry

```bash
npm install @sentry/nextjs
```

### Step 5: Verify It Works

In dev console, trigger an error:
```bash
# Test error tracking
curl http://localhost:3000/api/analytics/batch-profitability?business_id=invalid
# Should see error in Sentry dashboard
```

### Sentry Dashboard Features

**Issues Tab** (Issues.png)
```
Shows all errors grouped by type:
├─ Error message
├─ Stack trace
├─ How many times happened
├─ Affected users
└─ First/last occurrence
```

**Performance Tab** (Performance.png)
```
Shows slow endpoints:
├─ Endpoint name
├─ Response time (P50, P95, P99)
├─ Request count
└─ Error rate
```

**Alerts Tab** (Alerts.png)
```
Set up automatic alerts:
├─ Error rate > 5%
├─ Response time > 500ms
├─ New issue detected
└─ Deploy anomalies
```

---

## 2️⃣ Upstash Dashboard (Cache Monitoring)

### What It Does
- 💾 Monitor Redis cache usage
- 📊 Track cache hit/miss rates
- 📈 View bandwidth usage
- 💰 Monitor costs (free tier)

### Access Upstash Dashboard

```
1. Go to https://console.upstash.com
2. Select your Redis database
3. View metrics:
   - Commands (get, set, etc)
   - Hits / Misses
   - Bandwidth
   - Cost (usually $0 for free tier)
```

### Key Metrics to Monitor

```
Metric              | Target    | What It Means
--------------------|-----------|------------------
Commands/sec        | <1000     | Cache throughput
Hit Rate            | >80%      | Cache effectiveness
Memory Usage        | <256MB    | Database size
Bandwidth           | <1GB/mo   | Data transfer
Cost                | <$20/mo   | Monthly bill
```

### Example: Monitor Cache Hit Rate

```
Upstash Console:
1. Click "Database" → "Statistics"
2. View "Commands" chart
3. Hits vs Misses shows cache effectiveness

Ideal:
- First hour: Low hit rate (80% miss)
- After 1 day: High hit rate (90%+ hit)
- Sustained: 85-95% hit rate
```

---

## 3️⃣ Vercel Analytics Dashboard

### What It Does
- 📊 API response times (P50, P95, P99)
- 📈 Request volume
- 🔴 Error rate
- 🌍 Geographic distribution

### Access Vercel Dashboard

```
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Analytics"
```

### Key Sections

**Web Analytics**:
```
- Response time (P50: <100ms, P99: <500ms)
- Request count
- Error rate
- Top pages
```

**Edge Network**:
```
- Cache hits
- Request origin (geo)
- Response sizes
```

---

## 4️⃣ Custom Health API

### What It Does
- ✅ Real-time endpoint health status
- 📊 Per-endpoint metrics
- 🎯 Cache hit rates
- ⚠️ Error rates
- 🚨 Status: healthy/degraded/down

### Endpoint: GET /api/monitoring/health

```bash
# Get health status of all endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/monitoring/health
```

### Response Example

```json
{
  "timestamp": "2026-05-14T10:30:00Z",
  "summary": {
    "totalEndpoints": 3,
    "healthyEndpoints": 3,
    "degradedEndpoints": 0,
    "downEndpoints": 0,
    "averageResponseTime": 45,
    "averageCacheHitRate": 87,
    "averageErrorRate": 0.02
  },
  "endpoints": [
    {
      "endpoint": "/api/analytics/batch-profitability",
      "status": "healthy",
      "responseTime": 12,
      "errorRate": 0,
      "cacheHitRate": 91,
      "lastChecked": "2026-05-14T10:30:00Z"
    },
    {
      "endpoint": "/api/inventory/critical",
      "status": "healthy",
      "responseTime": 8,
      "errorRate": 0,
      "cacheHitRate": 89,
      "lastChecked": "2026-05-14T10:30:00Z"
    },
    {
      "endpoint": "/api/analytics/product-profitability",
      "status": "healthy",
      "responseTime": 65,
      "errorRate": 0.05,
      "cacheHitRate": 81,
      "lastChecked": "2026-05-14T10:30:00Z"
    }
  ]
}
```

### Use the Health API

**Option A: View in Browser**
```
https://your-app.vercel.app/api/monitoring/health
(Must be authenticated)
```

**Option B: Create a Custom Dashboard**
```javascript
setInterval(async () => {
  const res = await fetch('/api/monitoring/health', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  
  // Display health data
  console.log('Health Status:', data.summary);
  
  // Alert if degraded
  if (data.summary.degradedEndpoints > 0) {
    console.warn('⚠️  Some endpoints degraded!');
  }
}, 60000); // Check every minute
```

---

## 📈 Complete Monitoring Dashboard

Here's what your monitoring looks like:

### Morning Checklist

```
1. Check Sentry (2 min)
   - Any new errors? ✓
   - Error rate trending down? ✓
   - Any performance regressions? ✓

2. Check Vercel Analytics (2 min)
   - P99 response time <500ms? ✓
   - Error rate <0.1%? ✓
   - No deployment failures? ✓

3. Check Upstash (1 min)
   - Cache hit rate >80%? ✓
   - Memory usage normal? ✓
   - Bandwidth under quota? ✓

4. Check Health API (1 min)
   - All endpoints healthy? ✓
   - No alerts triggered? ✓
```

### Weekly Report Template

```
Week of 2026-05-14

ERRORS & CRASHES:
- Total errors: 12 (↓ from 18 last week)
- Error rate: 0.08% (↓ target: <0.1%)
- Most common: Invalid business_id (7x)
- Action: Add validation to business_id param

PERFORMANCE:
- P50 response time: 32ms (↓ from 45ms)
- P99 response time: 156ms (↓ from 245ms)
- Cache hit rate: 89% (↑ from 82%)
- Most affected endpoint: product-profitability (91ms avg)

INFRASTRUCTURE:
- Sentry quota usage: 2.1k events (free tier: 5k)
- Upstash bandwidth: 234MB (quota: 1GB)
- Vercel deployments: 5 (all successful)
- Database size: 42MB

RECOMMENDATIONS:
- Product-profitability cache TTL too short?
- Add index on (businessId, period) for faster queries
- Consider upgrading Sentry plan if error volume grows
```

---

## 🔧 Metrics to Track

### For Each Endpoint

```typescript
interface MetricsTarget {
  endpoint: string;
  p50Latency: number;      // target: <50ms
  p99Latency: number;      // target: <200ms
  errorRate: number;       // target: <0.1%
  cacheHitRate: number;    // target: >80%
}

// Targets:
// batch-profitability:     P50: 15ms, P99: 100ms, Cache: >90%
// inventory-critical:      P50: 10ms, P99: 80ms, Cache: >85%
// product-profitability:   P50: 40ms, P99: 180ms, Cache: >80%
```

### System-Wide Metrics

```
Metric              | Target    | Red Alert  | How to Check
--------------------|-----------|------------|------------------
Overall P99         | <200ms    | >500ms     | Vercel Analytics
Error Rate          | <0.1%     | >1%        | Sentry Issues
Cache Hit Rate      | >80%      | <60%       | Upstash Stats
API Availability    | >99.9%    | <99.5%     | Sentry + Vercel
Deployment Success  | 100%      | <95%       | Vercel Deployments
Sentry Quota        | <50%      | >80%       | Sentry Settings
```

---

## 🚨 Setting Up Alerts

### Sentry Alerts

In Sentry → Alerts, set up:

```
1. Error Rate Alert
   - When: Error rate > 5%
   - For: All projects
   - Action: Send to Slack/Email

2. Performance Alert
   - When: P99 latency > 500ms
   - For: All transactions
   - Action: Create issue

3. Release Anomaly
   - When: Error rate > 2x historical
   - For: New releases
   - Action: Notify team
```

### Vercel Alerts

In Vercel → Settings → Monitoring:

```
1. Failed Deployment
   - Action: Email notification

2. Function Error Rate
   - Alert when: >1%
   - Action: Slack notification
```

### Manual Checks

Set up reminders:
```
- Daily (9am): Check Sentry + Vercel (5 min)
- Weekly (Friday): Full health report (20 min)
- Monthly (1st): Review trends + optimization (1 hr)
```

---

## 📱 Mobile Monitoring

### Slack Integration

Add Sentry to Slack for instant notifications:

```
Sentry → Settings → Integrations → Slack

Select:
✓ Errors
✓ Performance alerts
✓ Releases
✓ Deployment notifications
```

### Mobile Apps

```
iOS/Android:
- Vercel iOS app (real-time deployments)
- Sentry app (error alerts)
- Custom React Native dashboard (if needed)
```

---

## 💾 Data Retention

### Free Tier Limits

```
Sentry (Free):
- 5,000 events/month
- 7-day retention
- 1 team member

Upstash (Free):
- 256MB memory
- 1GB/month bandwidth
- 30-day retention

Vercel (Free):
- Unlimited analytics
- 30-day retention
- 100 functions
```

### Production Recommendations

```
Budget: ~$50-100/month

Sentry Professional:
- $29/month (unlimited events)
- 90-day retention
- 5 team members

Upstash Pro:
- $12/month
- 10GB memory
- 10GB/month bandwidth

Total: ~$40/month
```

---

## 🔍 Troubleshooting

### Issue: Sentry not receiving errors

```
1. Check DSN is correct in .env.local
2. Verify NEXT_PUBLIC_SENTRY_DSN is set
3. Restart dev server: npm run dev
4. Trigger error: curl http://localhost:3000/api/invalid
5. Check Sentry Issues tab
```

### Issue: Cache hit rate dropping

```
1. Check Upstash Redis is connected
   - Verify UPSTASH_REDIS_REST_URL in env
   - Check credentials are correct
   
2. Check cache TTL settings
   - batch-profitability: 1 hour
   - inventory-critical: 30 minutes
   - product-profitability: 1 hour

3. Check for cache invalidation
   - Are you clearing cache too frequently?
   - Check lib/cache.ts invalidate logic

4. Monitor hit rate trend in Upstash
   - Should increase after 1 hour
   - Target: 85-95% hit rate
```

### Issue: Health API endpoint returning wrong data

```
1. Check middleware.ts is being used
2. Verify recordMetric() is called
3. Check lib/monitoring.ts has correct logic
4. Clear in-memory metrics: restart npm run dev
```

---

## ✅ Monitoring Setup Checklist

- [ ] **Sentry Setup**
  - [ ] Create Sentry account
  - [ ] Add DSN to .env.local
  - [ ] Add DSN to Vercel environment
  - [ ] Install @sentry/nextjs
  - [ ] Verify errors are captured
  - [ ] Set up Slack integration

- [ ] **Upstash Monitoring**
  - [ ] Log in to Upstash console
  - [ ] Navigate to Redis database
  - [ ] Check cache hit rate >80%
  - [ ] Monitor memory usage
  - [ ] Set up cost alerts

- [ ] **Vercel Analytics**
  - [ ] Open Vercel dashboard
  - [ ] Navigate to Analytics tab
  - [ ] Verify P99 <200ms
  - [ ] Check error rate <0.1%

- [ ] **Custom Health API**
  - [ ] Test /api/monitoring/health endpoint
  - [ ] Verify all endpoints show correct status
  - [ ] Cache hit rates tracking
  - [ ] Set up periodic health checks

- [ ] **Alerting**
  - [ ] Add Sentry to Slack
  - [ ] Create Sentry alert rules
  - [ ] Enable Vercel email alerts
  - [ ] Test alert notifications

---

## 📞 Quick Reference

### Dashboard URLs

```
Sentry:           https://sentry.io/[org]/[project]/
Upstash:          https://console.upstash.com (Redis DB)
Vercel:           https://vercel.com/[team]/[project]/analytics
Health API:       /api/monitoring/health (authenticated)
```

### Key Files

```
lib/monitoring.ts         - Monitoring utilities
middleware.ts             - Auto-tracking middleware
app/api/monitoring/health/route.ts - Health endpoint
```

### Common Commands

```bash
# Test local
npm run dev

# Deploy to Vercel
git push origin develop

# View Sentry errors
https://sentry.io/issues/

# Check Redis health
https://console.upstash.com → Database → Statistics
```

---

## 🎯 Success Criteria

After setup, you should see:

```
✅ Sentry
   - Issues grouped by error type
   - Performance metrics visible
   - Slack notifications working

✅ Upstash
   - Cache statistics visible
   - Hit rate >80%
   - Memory usage <256MB

✅ Vercel
   - P50 <50ms visible
   - P99 <200ms
   - Error rate <0.1%

✅ Health API
   - Shows all endpoints status
   - Cache hit rates per endpoint
   - Response time tracking
```

---

**Status**: Ready to implement  
**Estimated Setup Time**: 30-45 minutes  
**Maintenance Time**: 5-10 min/day

👉 **Next Action**: Create Sentry account and add DSN to environment variables
