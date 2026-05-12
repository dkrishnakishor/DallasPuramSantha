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

const prisma = new PrismaClient();

/**
 * GET /api/analytics/batch-profitability
 *
 * Returns batch-level profitability analysis for AI skill consumption
 * Used by: Inventory Optimizer skill
 *
 * Headers:
 *   - Authorization: Bearer <token> (required)
 *
 * Query parameters:
 *   - business_id: UUID (required)
 *   - date_from: ISO date (optional, default: 30 days ago)
 *   - date_to: ISO date (optional, default: today)
 *   - status_filter: 'all' | 'healthy' | 'at_risk' | 'loss' (optional)
 *
 * Returns: Structured JSON for AI consumption
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

    const statusFilter = request.nextUrl.searchParams.get('status_filter') || 'all';

    // Get all batches for this business with order data
    // Optimize: Fetch all orders in one query instead of N+1
    const batches = await prisma.productBatch.findMany({
      include: {
        product: true,
        supplier: true,
        inventoryBatches: {
          where: {
            businessId: businessId,
          },
        },
        orderItems: {
          include: {
            order: true,
          },
        },
      },
    });

    // Calculate profitability for each batch
    const profitability = batches.map((batch) => {
      const orders = batch.orderItems;

      const totalRevenue = orders.reduce((sum, item) => {
        return sum + Number(item.totalPrice);
      }, 0);

      const totalCogs = orders.reduce((sum, item) => {
        return sum + Number(item.quantity) * Number(item.unitCost);
      }, 0);

      const costOfBatch = Number(batch.quantityReceived) * Number(batch.unitCostAtReceipt);
      const profit = totalRevenue - totalCogs;
      const roi = costOfBatch > 0 ? (profit / costOfBatch) * 100 : 0;

      // Determine status
      let status = 'healthy';
      if (roi < 0) status = 'loss';
      else if (roi < 15) status = 'at_risk';

      return {
        batch_id: batch.id,
        batch_number: batch.batchNumber,
        product_id: batch.productId,
        product_name: batch.product.name,
        supplier_name: batch.supplier?.name || 'Unknown',
        received_date: batch.receivedDate.toISOString(),
        expiration_date: batch.expirationDate?.toISOString() || null,
        cost_of_batch: costOfBatch,
        quantity_received: Number(batch.quantityReceived),
        units_sold: orders.length > 0 ? orders.reduce((sum, o) => sum + Number(o.quantity), 0) : 0,
        units_remaining: batch.inventoryBatches[0]?.quantityAvailable || 0,
        total_revenue: totalRevenue,
        total_cogs: totalCogs,
        total_profit: profit,
        roi_percent: Math.round(roi * 100) / 100,
        status: status,
        recommendation:
          status === 'loss'
            ? 'Batch is unprofitable. Consider markdown or donation.'
            : status === 'at_risk'
            ? 'Batch has low margin. Monitor and consider markdown.'
            : 'Batch is profitable. Continue normal operations.',
      };
    });

    // Filter by status if requested
    let filtered = profitability;
    if (statusFilter !== 'all') {
      filtered = profitability.filter((p) => p.status === statusFilter);
    }

    // Sort by ROI descending
    filtered.sort((a, b) => b.roi_percent - a.roi_percent);

    return NextResponse.json({
      business_id: businessId,
      total_batches: filtered.length,
      batches: filtered,
      summary: {
        total_revenue: filtered.reduce((sum, b) => sum + b.total_revenue, 0),
        total_cogs: filtered.reduce((sum, b) => sum + b.total_cogs, 0),
        total_profit: filtered.reduce((sum, b) => sum + b.total_profit, 0),
        average_roi_percent:
          Math.round(
            (filtered.reduce((sum, b) => sum + b.roi_percent, 0) / filtered.length) * 100
          ) / 100,
        unhealthy_batches: filtered.filter((b) => b.status !== 'healthy').length,
      },
    });
  } catch (error) {
    return internalErrorResponse(error);
  }
}
