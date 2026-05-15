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
 * GET /api/analytics/product-profitability
 *
 * Returns product-level profitability analysis by sales channel
 * Used by: Profitability Analyst skill
 *
 * Headers:
 *   - Authorization: Bearer <token> (required)
 *
 * Query parameters:
 *   - business_id: UUID (required)
 *   - channel: 'wholesale_b2b' | 'retail_b2c' | 'food_service' | 'all' (optional)
 *   - period: 'week' | 'month' | 'quarter' | 'year' (optional, default: 'month')
 *
 * Returns: Product profitability metrics per channel
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

    const channel = request.nextUrl.searchParams.get('channel') || 'all';
    const period = request.nextUrl.searchParams.get('period') || 'month';

    // Step 4: Check cache
    const cacheKey = generateCacheKey('product-profitability', businessId, { channel, period });
    const cachedResult = await getCachedData(cacheKey);
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    // Calculate date range based on period
    const now = new Date();
    let dateFrom = new Date();
    if (period === 'week') dateFrom.setDate(now.getDate() - 7);
    else if (period === 'month') dateFrom.setMonth(now.getMonth() - 1);
    else if (period === 'quarter') dateFrom.setMonth(now.getMonth() - 3);
    else if (period === 'year') dateFrom.setFullYear(now.getFullYear() - 1);

    // Get all orders in period
    const orders = await prisma.order.findMany({
      where: {
        businessId: businessId,
        createdAt: {
          gte: dateFrom,
          lte: now,
        },
      },
      include: {
        items: true,
      },
    });

    // Group by product and channel
    const productMetrics = new Map();

    for (const order of orders) {
      const orderChannel = order.salesChannel || 'unknown';

      for (const item of order.items) {
        const key = `${item.productId}-${orderChannel}`;

        if (!productMetrics.has(key)) {
          productMetrics.set(key, {
            productId: item.productId,
            channel: orderChannel,
            revenue: 0,
            cogs: 0,
            unitsPercentSold: 0,
          });
        }

        const metric = productMetrics.get(key);
        metric.revenue += Number(item.totalPrice);
        metric.cogs += Number(item.quantity) * Number(item.unitCost);
        metric.unitsSold += Number(item.quantity);
      }
    }

    // Fetch product names and calculate metrics
    const results = await Promise.all(
      Array.from(productMetrics.values()).map(async (metric) => {
        const product = await prisma.product.findUnique({
          where: { id: metric.productId },
        });

        const grossProfit = metric.revenue - metric.cogs;
        const grossMarginPercent =
          metric.revenue > 0 ? Math.round((grossProfit / metric.revenue) * 10000) / 100 : 0;

        return {
          product_id: metric.productId,
          product_name: product?.name || 'Unknown',
          sku: product?.sku,
          sales_channel: metric.channel,
          period: period,
          units_sold: Math.round(metric.unitsSold * 100) / 100,
          revenue: Math.round(metric.revenue * 100) / 100,
          cogs: Math.round(metric.cogs * 100) / 100,
          gross_profit: Math.round(grossProfit * 100) / 100,
          gross_margin_percent: grossMarginPercent,
          avg_unit_price: metric.unitsSold > 0 ? Math.round((metric.revenue / metric.unitsSold) * 100) / 100 : 0,
          recommendation:
            grossMarginPercent < 15
              ? 'ATTENTION: Low margin product. Consider price increase.'
              : grossMarginPercent < 25
              ? 'CAUTION: Below target margin. Monitor closely.'
              : 'HEALTHY: Good margin. Keep in stock.',
        };
      })
    );

    // Filter by channel if requested
    let filtered = results;
    if (channel !== 'all') {
      filtered = results.filter((r) => r.sales_channel === channel);
    }

    // Sort by gross_margin_percent descending
    filtered.sort((a, b) => b.gross_margin_percent - a.gross_margin_percent);

    const summary = {
      total_revenue: Math.round(filtered.reduce((sum, r) => sum + r.revenue, 0) * 100) / 100,
      total_cogs: Math.round(filtered.reduce((sum, r) => sum + r.cogs, 0) * 100) / 100,
      total_gross_profit: Math.round(filtered.reduce((sum, r) => sum + r.gross_profit, 0) * 100) / 100,
      average_margin_percent:
        Math.round(
          (filtered.reduce((sum, r) => sum + r.gross_margin_percent, 0) / filtered.length) * 100
        ) / 100,
      total_units_sold: filtered.reduce((sum, r) => sum + r.units_sold, 0),
    };

    const response = {
      business_id: businessId,
      period: period,
      channel_filter: channel,
      date_from: dateFrom.toISOString(),
      date_to: now.toISOString(),
      products: filtered,
      summary: summary,
      top_performers: filtered.slice(0, 5),
      bottom_performers: filtered.slice(-5),
    };

    // Cache the response for 1 hour
    await setCachedData(cacheKey, response, { ttl: 3600 });

    return NextResponse.json(response);
  } catch (error) {
    return internalErrorResponse(error);
  }
}
