import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  getAuthenticatedUser,
  checkBusinessAccess,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse,
  internalErrorResponse,
} from '@/lib/auth';
import { generateCacheKey, getCachedData, setCachedData } from '@/lib/cache';

const prisma = new PrismaClient();

/**
 * GET /api/inventory/critical
 *
 * Returns products at risk of stockout or low inventory
 * Used by: Transfer Optimizer skill
 *
 * Headers:
 *   - Authorization: Bearer <token> (required)
 *
 * Query parameters:
 *   - business_id: UUID (required)
 *   - severity: 'critical' | 'low' | 'all' (optional, default: 'all')
 *
 * Returns: Products that need immediate attention
 */
export async function GET(request: NextRequest) {
  try {
    // Step 1: Authenticate user
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    // Step 2: Get business_id parameter
    const businessId = request.nextUrl.searchParams.get('business_id');
    if (!businessId) {
      return badRequestResponse('business_id parameter required');
    }

    // Step 3: Authorize access to business
    const hasAccess = await checkBusinessAccess(user.id, businessId);
    if (!hasAccess) {
      return forbiddenResponse();
    }

    const severity = request.nextUrl.searchParams.get('severity') || 'all';

    // Step 4: Check cache
    const cacheKey = generateCacheKey('inventory-critical', businessId, { severity });
    const cachedResult = await getCachedData(cacheKey);
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    // Get all inventory for this business
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    // Optimize: Fetch all sales data in one query with aggregation
    const salesByProduct = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          businessId: businessId,
          createdAt: {
            gte: last30Days,
          },
        },
      },
      _sum: {
        quantity: true,
      },
    });

    // Create lookup map for quick access
    const salesMap = new Map(
      salesByProduct.map((s) => [s.productId, Number(s._sum.quantity) || 0])
    );

    const inventory = await prisma.inventory.findMany({
      where: {
        businessId: businessId,
      },
      include: {
        product: true,
      },
    });

    // Calculate days supply for each product
    const critical = [];

    for (const inv of inventory) {
      const totalSalesLast30 = salesMap.get(inv.productId) || 0;

      const avgDailySales = totalSalesLast30 / 30;
      const daysSupply = avgDailySales > 0 ? Number(inv.quantityOnHand) / avgDailySales : 999;

      // Determine severity
      let status = 'ok';
      if (daysSupply <= 2) status = 'critical';
      else if (daysSupply <= Number(inv.product.minStockLevel) / avgDailySales)
        status = 'low';

      // Add to critical list
      if (status !== 'ok') {
        critical.push({
          product_id: inv.productId,
          product_name: inv.product.name,
          sku: inv.product.sku,
          quantity_on_hand: Number(inv.quantityOnHand),
          quantity_reserved: Number(inv.quantityReserved),
          quantity_available: Number(inv.quantityOnHand) - Number(inv.quantityReserved),
          min_stock_level: Number(inv.product.minStockLevel),
          avg_daily_sales: Math.round(avgDailySales * 100) / 100,
          days_supply: Math.round(daysSupply * 10) / 10,
          status: status,
          unit_of_measure: inv.product.unitOfMeasure,
          cost_per_unit: Number(inv.costPerUnit),
          retail_price: Number(inv.retailPrice),
        });
      }
    }

    // Filter by severity if requested
    let filtered = critical;
    if (severity === 'critical') {
      filtered = critical.filter((c) => c.status === 'critical');
    } else if (severity === 'low') {
      filtered = critical.filter((c) => c.status === 'low');
    }

    // Sort by days_supply ascending (most critical first)
    filtered.sort((a, b) => a.days_supply - b.days_supply);

    const response = {
      business_id: businessId,
      severity_filter: severity,
      total_at_risk: filtered.length,
      critical_count: filtered.filter((c) => c.status === 'critical').length,
      low_count: filtered.filter((c) => c.status === 'low').length,
      products: filtered,
      recommended_actions: filtered.map((p) => ({
        product_id: p.product_id,
        action:
          p.status === 'critical'
            ? 'URGENT: Check for cross-store transfers or emergency PO'
            : 'Reorder from vendor to prevent stockout',
        urgency: p.status === 'critical' ? 'HIGH' : 'MEDIUM',
      })),
    };

    // Cache the response for 30 minutes (inventory changes more frequently)
    await setCachedData(cacheKey, response, { ttl: 1800 });

    return NextResponse.json(response);
  } catch (error) {
    return internalErrorResponse(error);
  }
}
