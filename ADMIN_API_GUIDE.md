# 🏢 Admin API Guide - Organizations & Transfer Pricing

**Complete reference for managing organizations and inter-org transfers**

---

## 📋 Table of Contents

1. [Organizations API](#organizations-api)
2. [Transfer Pricing API](#transfer-pricing-api)
3. [Transfer Management API](#transfer-management-api)
4. [Examples](#examples)

---

## Organizations API

### GET /api/admin/organizations
List all organizations

**Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/organizations
```

**Response:** (200)
```json
{
  "success": true,
  "count": 3,
  "organizations": [
    {
      "id": "cuid123",
      "name": "pestle",
      "displayName": "Pestle Foods",
      "businessType": "food_beverage",
      "email": "contact@pestle.com",
      "phone": "+1-555-0001",
      "address": {
        "street": "123 Main St",
        "city": "Austin",
        "state": "TX",
        "zipCode": "78701",
        "country": "USA"
      },
      "createdAt": "2026-05-14T10:00:00Z",
      "updatedAt": "2026-05-14T10:00:00Z"
    }
  ]
}
```

---

### POST /api/admin/organizations
Create a new organization

**Request:**
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "pestle",
    "displayName": "Pestle Foods",
    "businessType": "food_beverage",
    "email": "contact@pestle.com",
    "phone": "+1-555-0001",
    "address": {
      "street": "123 Main St",
      "city": "Austin",
      "state": "TX",
      "zipCode": "78701",
      "country": "USA"
    }
  }' \
  http://localhost:3000/api/admin/organizations
```

**Response:** (201)
```json
{
  "success": true,
  "message": "Organization \"Pestle Foods\" created successfully",
  "organization": {
    "id": "cuid123",
    "name": "pestle",
    "displayName": "Pestle Foods",
    ...
  }
}
```

**Errors:**
- `400` - Missing required fields (name, displayName, businessType)
- `409` - Organization name already exists
- `401` - Unauthorized

---

### GET /api/admin/organizations/:id
Get a specific organization with transfer metrics

**Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/organizations/cuid123
```

**Response:** (200)
```json
{
  "success": true,
  "organization": {
    "id": "cuid123",
    "name": "pestle",
    "displayName": "Pestle Foods",
    ...,
    "_count": {
      "transferRulesFrom": 5,
      "transferRulesTo": 3,
      "transfersOut": 12,
      "transfersIn": 8
    }
  }
}
```

---

### PUT /api/admin/organizations/:id
Update an organization

**Request:**
```bash
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Pestle Foods Inc",
    "businessType": "food_beverage",
    "email": "newemail@pestle.com"
  }' \
  http://localhost:3000/api/admin/organizations/cuid123
```

**Response:** (200)
```json
{
  "success": true,
  "message": "Organization updated successfully",
  "organization": { ... }
}
```

---

### DELETE /api/admin/organizations/:id
Delete an organization (with safety checks)

**Request:**
```bash
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/organizations/cuid123
```

**Response:** (200)
```json
{
  "success": true,
  "message": "Organization \"Pestle Foods\" deleted successfully"
}
```

**Errors:**
- `409` - Cannot delete if organization has orders, inventory, customers, or vendors
  ```json
  {
    "error": "Cannot delete organization with existing data",
    "message": "This organization has 5 orders, 10 inventory items, 3 customers, and 2 vendors.",
    "details": {
      "orders": 5,
      "inventory": 10,
      "customers": 3,
      "vendors": 2
    }
  }
  ```

---

## Transfer Pricing API

### GET /api/admin/transfer-pricing
List all transfer pricing rules (with optional filters)

**Query Parameters:**
- `fromBusinessId` - Filter by selling organization
- `toBusinessId` - Filter by buying organization
- `activeOnly` - Filter to active rules only (true/false)

**Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/admin/transfer-pricing?fromBusinessId=biz1&activeOnly=true"
```

**Response:** (200)
```json
{
  "success": true,
  "count": 2,
  "rules": [
    {
      "id": "rule123",
      "fromBusinessId": "biz1",
      "toBusinessId": "biz2",
      "productId": null,
      "markupType": "PERCENTAGE",
      "markupValue": "20",
      "minMargin": null,
      "notes": "Standard wholesale rate",
      "effectiveFrom": "2026-05-14T00:00:00Z",
      "effectiveTo": null,
      "active": true,
      "createdAt": "2026-05-14T10:00:00Z",
      "updatedAt": "2026-05-14T10:00:00Z",
      "fromBusiness": {
        "id": "biz1",
        "displayName": "Pestle Foods"
      },
      "toBusiness": {
        "id": "biz2",
        "displayName": "DallasPuram Santha"
      },
      "product": null
    }
  ]
}
```

---

### POST /api/admin/transfer-pricing
Create a new transfer pricing rule

**Request:**
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fromBusinessId": "biz1",
    "toBusinessId": "biz2",
    "productId": null,
    "markupType": "PERCENTAGE",
    "markupValue": 20,
    "minMargin": 5,
    "notes": "Standard wholesale pricing",
    "effectiveFrom": "2026-05-14T00:00:00Z",
    "effectiveTo": null
  }' \
  http://localhost:3000/api/admin/transfer-pricing
```

**Response:** (201)
```json
{
  "success": true,
  "message": "Transfer pricing rule created successfully",
  "rule": { ... }
}
```

**Markup Types:**
- `PERCENTAGE` - Markup as percentage (e.g., 20 = 20% markup)
- `FIXED_AMOUNT` - Fixed $ amount per unit (e.g., 50 = $50 per unit)

**Errors:**
- `400` - Missing required fields or invalid markupType
- `404` - Organization or product not found

---

### GET /api/admin/transfer-pricing/:id
Get a specific transfer pricing rule

**Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/transfer-pricing/rule123
```

**Response:** (200)
```json
{
  "success": true,
  "rule": {
    "id": "rule123",
    ...
    "transfers": {
      "_count": 15
    }
  }
}
```

---

### PUT /api/admin/transfer-pricing/:id
Update a transfer pricing rule

**Request:**
```bash
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "markupValue": 25,
    "minMargin": 10,
    "active": true
  }' \
  http://localhost:3000/api/admin/transfer-pricing/rule123
```

**Response:** (200)
```json
{
  "success": true,
  "message": "Transfer pricing rule updated successfully",
  "rule": { ... }
}
```

---

### DELETE /api/admin/transfer-pricing/:id
Delete a transfer pricing rule

**Request:**
```bash
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/transfer-pricing/rule123
```

**Response:** (200)
```json
{
  "success": true,
  "message": "Transfer pricing rule deleted successfully"
}
```

---

## Transfer Management API

### GET /api/admin/transfers/report
Get comprehensive transfer analytics and reporting

**Query Parameters:**
- `fromBusinessId` - Filter by selling org
- `toBusinessId` - Filter by buying org
- `startDate` - ISO date string (e.g., "2026-05-01")
- `endDate` - ISO date string
- `status` - pending | completed | returned

**Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/admin/transfers/report?fromBusinessId=biz1&startDate=2026-05-01&status=completed"
```

**Response:** (200)
```json
{
  "success": true,
  "period": {
    "startDate": "2026-05-01",
    "endDate": null
  },
  "summary": {
    "totalTransfers": 12,
    "totalQuantity": 150.5,
    "totalCost": 1500.00,
    "totalTransferValue": 1875.00,
    "totalMargin": 375.00,
    "avgMarginPercent": 25,
    "statusBreakdown": {
      "pending": 0,
      "completed": 12,
      "returned": 0
    }
  },
  "businessPairs": [
    {
      "fromBusiness": { "id": "biz1", "displayName": "Pestle Foods" },
      "toBusiness": { "id": "biz2", "displayName": "DallasPuram Santha" },
      "transferCount": 12,
      "totalQuantity": 150.5,
      "totalCost": 1500.00,
      "totalTransferValue": 1875.00,
      "totalMargin": 375.00,
      "avgMarginPercent": 25
    }
  ],
  "products": [
    {
      "product": { "id": "prod1", "name": "Chili Powder", "sku": "CP001" },
      "transferCount": 8,
      "totalQuantity": 100,
      "totalCost": 800.00,
      "totalTransferValue": 1000.00,
      "totalMargin": 200.00
    }
  ],
  "transfers": [
    {
      "id": "transfer123",
      "fromBusiness": { "id": "biz1", "displayName": "Pestle Foods" },
      "toBusiness": { "id": "biz2", "displayName": "DallasPuram Santha" },
      "product": { "id": "prod1", "name": "Chili Powder", "sku": "CP001" },
      "quantity": 10,
      "costPerUnit": 8.00,
      "transferPrice": 10.00,
      "salePrice": 19.99,
      "markup": 2.00,
      "markupType": "FIXED_AMOUNT",
      "margin": 20.00,
      "status": "completed",
      "transferedAt": "2026-05-14T10:00:00Z"
    }
  ]
}
```

---

### POST /api/admin/transfers/create
Create a new inter-organization transfer

**Request:**
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ruleId": "rule123",
    "fromBusinessId": "biz1",
    "toBusinessId": "biz2",
    "productId": "prod1",
    "quantity": 10,
    "costPerUnit": 8.00,
    "salePrice": 19.99,
    "notes": "Regular wholesale order"
  }' \
  http://localhost:3000/api/admin/transfers/create
```

**Response:** (201)
```json
{
  "success": true,
  "message": "Inter-organization transfer created successfully",
  "transfer": {
    "id": "transfer123",
    "fromBusiness": { "id": "biz1", "displayName": "Pestle Foods" },
    "toBusiness": { "id": "biz2", "displayName": "DallasPuram Santha" },
    "product": { "id": "prod1", "name": "Chili Powder", "sku": "CP001" },
    "quantity": 10,
    "costPerUnit": 8.00,
    "transferPrice": 10.00,
    "salePrice": 19.99,
    "markup": 2.00,
    "markupType": "FIXED_AMOUNT",
    "margin": 20.00,
    "status": "completed",
    "transferedAt": "2026-05-14T10:00:00Z"
  }
}
```

**Features:**
- If `ruleId` is provided, transfer price is calculated automatically
- Respects minimum margin constraints from rule
- Supports PERCENTAGE or FIXED_AMOUNT markup
- Optional `salePrice` for tracking final retail price

---

## Examples

### Example 1: Set up B2B wholesale pricing

```bash
# Create organizations
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"pestle","displayName":"Pestle Foods","businessType":"food_beverage"}' \
  http://localhost:3000/api/admin/organizations

curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"dps","displayName":"DallasPuram Santha","businessType":"retail"}' \
  http://localhost:3000/api/admin/organizations

# Create transfer pricing rule: Pestle → DPS at 25% markup
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fromBusinessId":"pestle_id",
    "toBusinessId":"dps_id",
    "markupType":"PERCENTAGE",
    "markupValue":25,
    "notes":"B2B wholesale pricing"
  }' \
  http://localhost:3000/api/admin/transfer-pricing

# Record a transfer
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ruleId":"rule_id",
    "fromBusinessId":"pestle_id",
    "toBusinessId":"dps_id",
    "productId":"product_id",
    "quantity":100,
    "costPerUnit":10.00
  }' \
  http://localhost:3000/api/admin/transfers/create
```

### Example 2: Get transfer analytics for a period

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/admin/transfers/report?fromBusinessId=pestle_id&startDate=2026-05-01&endDate=2026-05-31"
```

This returns:
- Total transfers and volume
- Margin analysis
- Product breakdown
- Business pair metrics

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (validation error) |
| 401 | Unauthorized |
| 404 | Not found |
| 409 | Conflict (e.g., org name exists) |
| 500 | Server error |

---

## Authentication

All endpoints require:
```bash
Authorization: Bearer YOUR_SUPABASE_TOKEN
```

Get a token from Supabase Auth or generate one for testing.

---

**Last Updated**: 2026-05-15  
**Status**: Ready for testing  
**Deployment**: Ready for production
