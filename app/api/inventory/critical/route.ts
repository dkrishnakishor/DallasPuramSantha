import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/inventory/critical
 *
 * Returns products at risk of stockout or low inventory
 * Used by: Transfer Optimizer skill
 *
 * Query parameters:
 *   - business_id: UUID (required)
 *   - severity: 'critical' | 'low' | 'all' (optional, default: 'all')
 *
 * Returns: Products that need immediate attention
 */
export async function GET(request: NextRequest) {
  try {
    const businessId = request.nextUrl.searchParams.get('business_id');
    const severity = request.nextUrl.searchParams.get('severity') || 'all';

    if (!businessId) {
      return NextResponse.json(
        { error: 'business_id parameter required' },
        { status: 400 }
      );
    }

    // Get all inventory for this business
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
      // Get average daily sales
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const salesLast30 = await prisma.orderItem.findMany({
        where: {
          productId: inv.productId,
          order: {
            businessId: businessId,
            createdAt: {
              gte: last30Days,
            },
          },
        },
      });

      const avgDailySales =
        salesLast30.reduce((sum, item) => sum + Number(item.quantity), 0) / 30;
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

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Error fetching critical inventory:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
