# Security Review: DallasPuram Santha CRM

## Risk Assessment

- **Overall Risk Level**: 🔴 **CRITICAL** (Do not deploy to production)
- **Most Urgent**: Implement API authentication immediately
- **Exploitability**: Very high - unauthenticated data access
- **Likelihood of Breach**: High if exposed to internet
- **Data at Risk**: Business intelligence, pricing, costs, customer info

---

## Vulnerabilities Found

### Vuln 1: Unauthenticated API Endpoints

**Severity**: 🔴 **CRITICAL**  
**CWE**: CWE-306 (Missing Authentication for Critical Function)  
**Type**: Authentication Bypass

#### Description
All three API endpoints expose sensitive business data without any authentication or authorization checks:
- `/api/analytics/batch-profitability`
- `/api/inventory/critical`
- `/api/analytics/product-profitability`

Any unauthenticated user, even without credentials, can access these endpoints.

#### Affected Code
```typescript
// app/api/analytics/batch-profitability/route.ts - Line 20
export async function GET(request: NextRequest) {
  // ❌ NO authentication check
  const businessId = request.nextUrl.searchParams.get('business_id');
  // Returns sensitive data immediately
}
```

#### Exploitation Path

**Attack Scenario 1: Competitive Intelligence**
```bash
# Attacker discovers your API endpoint
curl "https://yoursite.com/api/analytics/batch-profitability?business_id=xyz"

# Returns complete profitability data:
{
  "batches": [
    {
      "product_name": "Fresh Tomatoes",
      "cost_of_batch": 250,
      "total_revenue": 180,
      "total_profit": -70,
      "roi_percent": -28,
      "status": "loss"
    }
  ],
  "summary": {
    "total_revenue": 5000,
    "total_cogs": 6200,
    "total_profit": -1200
  }
}

# Attacker learns: product costs, margins, pricing strategy
```

**Attack Scenario 2: Inventory Intelligence**
```bash
curl "https://yoursite.com/api/inventory/critical?business_id=xyz"

# Reveals current inventory levels for all products
# Attacker knows: what you have in stock, reorder points, suppliers
```

**Attack Scenario 3: Customer Data Inference**
From product profitability by channel, attacker infers:
- Which sales channels are most profitable
- Approximate customer volumes by channel
- Pricing strategy differences

#### Proof of Concept
```bash
#!/bin/bash

# Get all business IDs (iterate through UUIDs if needed)
for business_id in "business-1" "business-2" "business-3"; do
  
  # Extract profitability data
  curl -s "https://yoursite.com/api/analytics/batch-profitability?business_id=$business_id" \
    | jq '.batches[] | {product: .product_name, cost: .cost_of_batch, roi: .roi_percent}'
  
  # Extract inventory data
  curl -s "https://yoursite.com/api/inventory/critical?business_id=$business_id" \
    | jq '.products[] | {product: .product_name, on_hand: .quantity_on_hand, cost_per_unit: .cost_per_unit}'
done

# Results: Complete competitive analysis without authentication
```

#### Business Impact
- **Confidentiality**: 🔴 Complete loss (all business data exposed)
- **Integrity**: 🟡 Medium risk (endpoints are read-only currently)
- **Availability**: 🟢 Low risk (endpoints don't modify data)
- **Compliance**: Violates PCI DSS, GDPR, most data protection laws

#### Fix: Implement API Authentication

**Option 1: Supabase Auth (Recommended)**
```typescript
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  // 1. Extract token from header
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Verify token with Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // 3. Now user is authenticated
  // Continue with existing logic
}
```

**Estimated Effort**: 2-3 hours (all endpoints)

---

### Vuln 2: Missing Authorization Checks (Privilege Escalation)

**Severity**: 🔴 **CRITICAL**  
**CWE**: CWE-639 (Authorization Bypass Through User-Controlled Key)  
**Type**: Authorization Bypass

#### Description
Even if authentication is added, there's no check that the user is authorized to access the requested `business_id`.

#### Affected Code
```typescript
// app/api/analytics/batch-profitability/route.ts - Line 22-30
const businessId = request.nextUrl.searchParams.get('business_id');

if (!businessId) {
  return NextResponse.json(
    { error: 'business_id parameter required' },
    { status: 400 }
  );
}

// ❌ NO CHECK: Is the authenticated user allowed to access this business?
// Proceeds directly to query data
const batches = await prisma.productBatch.findMany({
  where: { /* filter by businessId */ }
});
```

#### Exploitation Path

**Attack Scenario: Multi-Tenant Data Breach**
```
1. Attacker creates legitimate account (user@company.com)
2. Gets assigned to "Business A" in UserBusinessAccess
3. Receives valid auth token
4. Modifies API request:
   
   GET /api/analytics/batch-profitability?business_id=BUSINESS_B_ID
   
5. Server has no check that user is authorized for Business B
6. Returns Business B's confidential data
```

#### Proof of Concept
```typescript
// Attacker has valid token for Business A
const token = "valid-jwt-token-for-user-at-business-a";

// Attacker can query any business_id
const response = await fetch(
  "/api/analytics/batch-profitability?business_id=competitor-business-uuid",
  { headers: { Authorization: `Bearer ${token}` } }
);

// Gets competitor's complete profitability data
```

#### Business Impact
- **Confidentiality**: 🔴 Complete loss
- **Compliance Violation**: GDPR breach (accessing other user's data), HIPAA
- **Legal**: Lawsuit liability if customer data is exposed
- **Trust**: Loss of customer confidence

#### Fix: Add Authorization Check

```typescript
export async function GET(request: NextRequest) {
  const token = await verifyAuth(request); // From previous fix
  if (!token) return unauthorized();

  const businessId = request.nextUrl.searchParams.get('business_id');
  
  // ✅ NEW: Check if user is authorized for this business
  const hasAccess = await prisma.userBusinessAccess.findUnique({
    where: {
      userId_businessId: {
        userId: token.user.id,
        businessId: businessId // Must match
      }
    }
  });

  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Forbidden: No access to this business' },
      { status: 403 }
    );
  }

  // Safe to proceed with query
  const batches = await prisma.productBatch.findMany({ /* ... */ });
}
```

**Estimated Effort**: 1 hour per endpoint (3 endpoints = 3 hours total)

---

## Security Practices Review

### ✅ What You're Doing Right

1. **Parameterized Queries**
   - Using Prisma ORM prevents SQL injection
   - No string concatenation in SQL
   ```typescript
   // ✅ Safe: Parameterized
   await prisma.orderItem.findMany({
     where: { batchId: batch.id }  // Prisma handles safely
   });
   ```

2. **Database-Level Foreign Keys**
   - Relations enforced at database level
   - Prevents orphaned records
   ```prisma
   batch  ProductBatch @relation(fields: [batchId], references: [id])
   ```

3. **Password Hashing in Seed**
   - Using `bcryptjs` for admin password
   - Not storing plaintext credentials
   ```typescript
   const hashedPassword = await hash('password', 10);
   ```

4. **Environment Variables**
   - Database credentials in `.env.local`
   - Not hardcoded
   - `.gitignore` prevents commit

5. **Schema Isolation**
   - `businessId` required on all multi-tenant tables
   - Prevents accidental cross-tenant data access

### ⚠️ What Needs Attention

1. **No Authentication Mechanism**
   - ❌ No JWT tokens, sessions, or API keys
   - ❌ No login/logout functionality
   - Endpoints completely open

2. **No HTTPS Enforcement**
   - ❌ No `strict-transport-security` headers
   - Credentials could be sniffed

3. **No Rate Limiting**
   - ❌ Could be DDoS'd
   - ❌ Brute force attacks possible (if login added)

4. **No CSRF Protection**
   - ❌ API endpoints lack CSRF tokens
   - POST/PUT operations vulnerable

5. **No Input Validation on Enums**
   - ⚠️ `statusFilter` not validated (low risk due to filtering)
   - Should whitelist allowed values

---

## Threat Model Analysis

### Assume:
- 🔴 **Attacker has network access** (external user)
- 🔴 **Can read HTTP traffic** if HTTPS not enforced
- 🟡 **Has basic programming skills** (can craft API calls)
- 🟡 **Knows about your business** (from public info)

### Attack Vectors

| Vector | Risk | Current Status | Mitigation |
|--------|------|-----------------|------------|
| Unauthenticated API access | CRITICAL | ❌ Vulnerable | Add auth |
| Privilege escalation | CRITICAL | ❌ Vulnerable | Add authz |
| SQL injection | LOW | ✅ Protected | Prisma parameterization |
| XSS in forms | LOW | ✅ Protected | React escaping |
| Plaintext passwords | HIGH | ❌ Vulnerable | Use `bcryptjs` everywhere |
| DDoS | MEDIUM | ⚠️ Unmitigated | Add rate limiting |
| CSRF on mutations | MEDIUM | ⚠️ Unmitigated | Add CSRF tokens |

---

## Compliance & Standards

### OWASP Top 10 Alignment

| Issue | Status | Severity |
|-------|--------|----------|
| A1: Broken Access Control | ❌ FAILS | CRITICAL |
| A2: Cryptographic Failures | ⚠️ PARTIAL | MEDIUM |
| A3: Injection | ✅ PASS | - |
| A4: Insecure Design | ⚠️ PARTIAL | MEDIUM |
| A5: Security Misconfiguration | ❌ FAILS | CRITICAL |
| A6: Vulnerable Components | ✓ Review | - |
| A7: Authentication Failures | ❌ FAILS | CRITICAL |
| A8: Software & Data Integrity | ⚠️ PARTIAL | MEDIUM |
| A9: Logging & Monitoring | ❌ FAILS | MEDIUM |
| A10: SSRF | ✅ PASS | - |

### CWE Violations

- **CWE-306**: Missing authentication ✅ Identified
- **CWE-639**: Authorization bypass ✅ Identified
- **CWE-352**: CSRF ✅ Identified (future risk)
- **CWE-93**: Improper neutralization ✅ Will fix with validation

---

## Priority Fixes

### 🔴 CRITICAL (Stop deployment)

1. **Implement API Authentication** (2-3 hours)
   - Add Supabase Auth integration
   - Extract + verify JWT tokens
   - Reject requests without token
   - **Tests**: Token required, invalid token rejected, valid token accepted

2. **Implement Authorization Checks** (3 hours)
   - Query `UserBusinessAccess` for each request
   - Reject requests to unauthorized business
   - Return 403 Forbidden for access denied
   - **Tests**: User can access own business, can't access other business

3. **Add HTTPS Enforcement** (1 hour)
   - Set `strict-transport-security` header
   - Redirect HTTP to HTTPS
   - Configure Supabase to enforce SSL

### 🟡 HIGH (Fix before scale)

4. **Add Rate Limiting** (2 hours)
   - 100 requests/minute per IP
   - 1000 requests/minute per authenticated user
   - Tools: Upstash Redis or simple in-memory

5. **Add Input Validation** (1 hour)
   - Whitelist `statusFilter` values
   - Validate `period` parameter (week|month|quarter|year)
   - Return 400 for invalid values

6. **CORS Configuration** (1 hour)
   - Restrict to specific origins
   - Don't allow `*` (all origins)

### 🟢 MEDIUM (Plan for next sprint)

7. **Add Logging & Monitoring** (4 hours)
   - Log all auth failures
   - Alert on suspicious patterns
   - Tools: Supabase logs, Sentry

8. **API Key for AI Agents** (3 hours)
   - Separate auth for Claude/AI
   - Can't use user auth
   - Short-lived, scoped to specific endpoints

9. **Add CSRF Tokens** (2 hours)
   - Needed for POST/PUT mutations
   - Generate per-request, validate on submit

---

## Security Testing Checklist

Before any deployment, verify:

- [ ] Can access endpoint without auth → Rejected (401)
- [ ] Can access with invalid token → Rejected (401)
- [ ] Can access with valid token for Business A → Success
- [ ] Can access with valid token but wrong business → Rejected (403)
- [ ] All three endpoints protected (batch, product, inventory)
- [ ] HTTPS enforced (HSTS header present)
- [ ] CORS not set to `*`
- [ ] Rate limiting working (exceeding limit → 429)
- [ ] Passwords hashed in all scenarios
- [ ] No secrets in error messages
- [ ] No sensitive data in logs

---

## Security Roadmap

**Week 1 (URGENT)**:
```
[ ] Implement auth middleware
[ ] Add authorization checks
[ ] Enable HTTPS
[ ] Test with valid/invalid tokens
```

**Week 2**:
```
[ ] Add rate limiting
[ ] Input validation on enums
[ ] CORS configuration
[ ] Security headers (CSP, X-Frame-Options, etc.)
```

**Week 3**:
```
[ ] Logging & monitoring
[ ] API key for agents
[ ] Penetration testing
[ ] Security audit
```

---

## Questions for Security Governance

1. **Compliance requirements?** (HIPAA, GDPR, PCI DSS?)
2. **Expected authentication method?** (Supabase Auth, OAuth, custom?)
3. **Data classification?** (Public, internal, confidential, restricted?)
4. **Incident response plan?** (What if breached?)
5. **Security testing frequency?** (Per release? Monthly? Annual?)

---

## Summary

**Current Status**: 🔴 **NOT PRODUCTION READY**

The application has a solid technical foundation but is **critically vulnerable to data exposure** due to missing authentication and authorization. 

**Required Actions Before Deployment**:
1. Implement API authentication (2-3 hours)
2. Add authorization checks (3 hours)
3. Enforce HTTPS (1 hour)
4. Test security thoroughly (4 hours)

**Estimated Timeline**: 1 week with experienced developer  
**Risk if Deployed Without Fixes**: Data breach, compliance violation, legal liability

**Recommendation**: Complete security implementation before any external access. The database schema and query patterns are secure (good ORM usage), but the API layer is completely exposed.
