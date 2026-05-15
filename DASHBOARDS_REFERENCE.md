# 📊 Monitoring Dashboards Quick Reference

**All monitoring tools at a glance**

---

## 🗺️ Dashboard Map

```
Your Application
│
├─ 🔴 ERROR TRACKING (Sentry)
│  ├─ Issues: https://sentry.io/issues/
│  ├─ Performance: https://sentry.io/performance/
│  └─ Alerts: https://sentry.io/alerts/
│
├─ 📦 CACHE MONITORING (Upstash)
│  ├─ Database: https://console.upstash.com
│  ├─ Stats: Commands, Hits/Misses, Bandwidth
│  └─ Cost: Free tier monitoring
│
├─ 🚀 DEPLOYMENT (Vercel)
│  ├─ Analytics: https://vercel.com/dashboard/[project]/analytics
│  ├─ Metrics: P50, P99, Error Rate, Requests
│  └─ Deployments: https://vercel.com/dashboard/[project]/deployments
│
└─ 🏥 CUSTOM HEALTH API
   ├─ Endpoint: GET /api/monitoring/health
   ├─ Status Page: GET /api/monitoring/status
   └─ Per-Endpoint: Cache hit rate, response time, error rate
```

---

## 📱 Daily Monitoring Routine (5-10 minutes)

### 9:00 AM - Start of Day Check

```
1. Sentry Issues (1 min)
   https://sentry.io/[org]/[project]/issues/
   
   ✓ Any new critical errors?
   ✓ Error rate trending down?
   ✓ Recent deployments show errors?

2. Vercel Analytics (2 min)
   https://vercel.com/dashboard/[project]/analytics
   
   ✓ P99 response time <200ms?
   ✓ Error rate <0.1%?
   ✓ No failed deployments?

3. Upstash Cache (1 min)
   https://console.upstash.com
   → Select Redis DB → Statistics
   
   ✓ Cache hit rate >80%?
   ✓ Memory usage <256MB?

4. Health API (1 min)
   GET /api/monitoring/health
   (in your app or Terminal)
   
   ✓ All endpoints showing "healthy"?
   ✓ Response times <100ms?
```

---

## 🔴 Error Tracking (Sentry)

### Dashboard: https://sentry.io

```
Tab: ISSUES
├─ Shows all errors grouped by type
├─ Click error → See stack trace
├─ Shows affected users & frequency
└─ Set status: Resolved / Unresolved

Tab: PERFORMANCE
├─ Shows slowest endpoints
├─ Response time graphs (P50, P95, P99)
├─ Database query analysis
└─ Transaction breakdown

Tab: ALERTS
├─ Create alert rules
├─ Error rate > 5%? Alert
├─ Response time > 500ms? Alert
└─ Integration: Slack, Email, PagerDuty
```

### Key Metrics

```
Error Rate:
  Current: Check "Issues" tab → "Events in last 24h"
  Target: <0.1%
  Alert: Red if >1%

Response Time:
  P50 (50th percentile): ~32ms
  P95 (95th percentile): ~150ms
  P99 (99th percentile): <200ms
  Alert: Red if P99 > 500ms

Most Frequent Errors:
  1. Invalid business_id (7x)
  2. Unauthorized (2x)
  3. Cache timeout (1x)
```

---

## 📦 Cache Monitoring (Upstash)

### Dashboard: https://console.upstash.com

```
1. Select your Redis database
2. Navigate to "Statistics" section
3. View these metrics:

Commands (chart)
├─ GET: Shows cache hits
├─ SET: Shows cache writes
├─ DEL: Shows cache invalidations
└─ Hit Ratio: Percentage of successful cache hits

Memory Usage
├─ Current: Show DB size
├─ Quota: 256MB (free tier)
└─ Alert: Red if >90%

Bandwidth
├─ Daily usage in MB
├─ Monthly quota: 1GB (free tier)
└─ Cost: Usually $0
```

### Expected Patterns

```
Hour 1:
  ├─ Commands: 100+ (new requests)
  ├─ Hit Rate: 20-30% (mostly cache misses)
  └─ Memory: Growing (caching data)

Hour 24:
  ├─ Commands: 1000+ (sustained traffic)
  ├─ Hit Rate: 85-95% (mostly cache hits)
  └─ Memory: Stable (~50-100MB)
```

---

## 🚀 API Deployment & Performance (Vercel)

### Dashboard: https://vercel.com/dashboard/[project]

```
Tab: ANALYTICS
├─ Top section: Live requests
├─ Response Time graph (P50, P95, P99)
├─ Error Rate graph
└─ Request volume chart

Tab: DEPLOYMENTS
├─ Recent deployment history
├─ Build logs (if failed)
├─ Commit message & author
└─ Status: ✓ Building / ✓ Ready / ✗ Failed

Tab: EDGE NETWORK
├─ Cache hit rate
├─ Request origin (geographic)
└─ Top paths
```

### Key Metrics

```
Response Time (GET /api/analytics/batch-profitability)
  P50: <50ms ✓
  P99: <200ms ✓
  Max seen: ~400ms (on first request)

Error Rate
  Target: <0.1%
  Alert: Red if >1%
  Current: Check "Analytics" tab

Request Count
  Peak: ~500/minute
  Average: ~100/minute
  Trend: Should be consistent
```

---

## 🏥 Custom Health API

### Endpoint 1: GET /api/monitoring/health

**Purpose**: Full health details for all endpoints

**Access**: https://your-app.vercel.app/api/monitoring/health
(Requires authentication token)

**Response**:
```json
{
  "summary": {
    "averageResponseTime": 45,
    "averageCacheHitRate": 87,
    "averageErrorRate": 0.02
  },
  "endpoints": [
    {
      "endpoint": "/api/analytics/batch-profitability",
      "status": "healthy",
      "responseTime": 12,
      "cacheHitRate": 91,
      "errorRate": 0
    }
  ]
}
```

### Endpoint 2: GET /api/monitoring/status

**Purpose**: Simple status for status pages (public)

**Access**: https://your-app.vercel.app/api/monitoring/status

**Response**:
```json
{
  "status": "operational",
  "metrics": {
    "upEndpoints": 3,
    "downEndpoints": 0,
    "avgResponseTime": 45,
    "avgCacheHitRate": 87
  }
}
```

### Usage

**Command Line**:
```bash
# Check health with token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-app.vercel.app/api/monitoring/health
```

**React Component**:
```typescript
useEffect(() => {
  const checkHealth = async () => {
    const res = await fetch('/api/monitoring/health', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setHealth(data);
  };
  
  const interval = setInterval(checkHealth, 60000); // Every minute
  return () => clearInterval(interval);
}, []);
```

---

## 📈 Example Morning Report

```
═══════════════════════════════════════════════════════════
DallasPuram Santha - Morning Health Check
2026-05-14 9:00 AM
═══════════════════════════════════════════════════════════

🔴 SENTRY (Error Tracking)
   Status: ✓ Healthy
   Errors (24h): 8 events
   Error Rate: 0.08% ✓ (Target: <0.1%)
   Top Issue: Invalid business_id (5x)
   Action: Need validation on API

📦 UPSTASH (Cache)
   Status: ✓ Healthy
   Hit Rate: 89% ✓ (Target: >80%)
   Memory Used: 84MB / 256MB
   Commands: 2,341
   Cost: $0 (Free tier)

🚀 VERCEL (Deployment)
   Status: ✓ All Systems Go
   Last Deploy: 2026-05-13 22:34 ✓
   P50 Latency: 32ms ✓
   P99 Latency: 156ms ✓
   Error Rate: 0.05% ✓

🏥 CUSTOM HEALTH API
   Status: ✓ All Endpoints Healthy
   batch-profitability: 12ms, 91% cache hit
   inventory-critical: 8ms, 89% cache hit
   product-profitability: 65ms, 81% cache hit

═══════════════════════════════════════════════════════════
OVERALL STATUS: ✓ OPERATIONAL
═══════════════════════════════════════════════════════════
```

---

## 🚨 Alert Rules to Set Up

### In Sentry

```
1. Error Rate Alert
   ├─ Condition: Error rate > 5%
   ├─ For: All projects
   ├─ Notify: Slack #alerts channel
   └─ Actions: Create issue, Notify team

2. Performance Regression
   ├─ Condition: P99 latency > 500ms
   ├─ For: All transactions
   ├─ Notify: Email to team@company.com
   └─ Actions: Auto-assign to on-call

3. New Error Patterns
   ├─ Condition: >10 events/hour
   ├─ For: Errors not seen before
   ├─ Notify: Slack #critical channel
   └─ Actions: Page on-call engineer
```

### In Vercel

```
1. Failed Deployment
   ├─ Condition: Build fails
   ├─ Notify: Email + Slack
   └─ Action: Rollback or retry

2. High Error Rate
   ├─ Condition: >1% error rate
   ├─ Time: 5 min sustained
   ├─ Notify: Email to team
   └─ Action: Check logs, possible rollback
```

---

## 📊 Weekly Report Template

```
═══════════════════════════════════════════════════════════
WEEKLY REPORT: Week of 2026-05-14
═══════════════════════════════════════════════════════════

ERRORS & INCIDENTS
├─ Total Errors: 47 (↓ from 63 last week) 🟢
├─ Error Rate: 0.09% (↓ from 0.12%) 🟢
├─ Incidents: 0 critical, 1 medium
├─ MTTR (Mean Time to Resolution): 34 min
└─ Action: Monitor invalid_business_id errors

PERFORMANCE
├─ P50 Response Time: 32ms (↓ from 45ms) 🟢
├─ P99 Response Time: 156ms (↓ from 245ms) 🟢
├─ Cache Hit Rate: 89% (↑ from 82%) 🟢
├─ Slowest Endpoint: product-profitability (91ms)
└─ Action: Investigate product-profitability query

INFRASTRUCTURE
├─ Upstash Cache: 84MB / 256MB (33% used)
├─ Redis Commands: 2,341/week
├─ Deployments: 5 (all successful) ✓
├─ Downtime: 0 minutes
└─ Cost: $0 (free tier)

DEPLOYMENT QUALITY
├─ Build Success Rate: 100%
├─ Average Build Time: 3min 42sec
├─ Failed Deploys: 0
└─ Rollbacks: 0

RECOMMENDATIONS
1. ✓ Cache optimization working well
2. ⚠️ Add validation to business_id parameter
3. 🔍 Investigate product-profitability latency
4. 📈 Monitor error trends (improving)

═══════════════════════════════════════════════════════════
```

---

## 🔗 All Dashboard Links

| Tool | URL | Purpose |
|------|-----|---------|
| **Sentry Issues** | https://sentry.io/[org]/[project]/issues/ | Error tracking |
| **Sentry Performance** | https://sentry.io/[org]/[project]/performance/ | Performance bottlenecks |
| **Upstash Console** | https://console.upstash.com | Redis cache metrics |
| **Vercel Analytics** | https://vercel.com/dashboard/[project]/analytics | API metrics |
| **Vercel Deployments** | https://vercel.com/dashboard/[project]/deployments | Build history |
| **Health API** | /api/monitoring/health | Custom endpoint metrics |
| **Status Page** | /api/monitoring/status | Public status page |

---

## ⏰ Monitoring Schedule

```
Daily (9am):     5-10 min   Review Sentry, Vercel, Upstash
Weekly (Friday): 30 min     Full health report, trends
Monthly (1st):   1 hour     Deep analysis, optimization
Quarterly:       2 hours    Planning, capacity planning
```

---

## 📞 Quick Troubleshooting

| Issue | Check | Fix |
|-------|-------|-----|
| Error rate spiking | Sentry Issues → Recent | Check recent deploy |
| Slow responses | Vercel Analytics → P99 | Check database queries |
| Cache hit rate low | Upstash Statistics | Check Redis connection |
| Health API down | /api/monitoring/health | Restart server |

---

**Last Updated**: 2026-05-14  
**Next Review**: 2026-05-21  
**Status**: 🟢 All systems operational
