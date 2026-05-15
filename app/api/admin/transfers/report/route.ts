import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * GET /api/admin/transfers/report
 * Get inter-organization transfer analytics and reporting
 *
 * Query params:
 * - fromBusinessId: Filter by selling organization
 * - toBusinessId: Filter by buying organization
 * - startDate: ISO date string
 * - endDate: ISO date string
 * - status: pending | completed | returned
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const fromBusinessId = searchParams.get('fromBusinessId');
    const toBusinessId = searchParams.get('toBusinessId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Get all transfers with the filters
    const transfers = await prisma.interOrgTransfer.findMany({
      where: {
        ...(fromBusinessId && { fromBusinessId }),
        ...(toBusinessId && { toBusinessId }),
        ...(status && { status }),
        ...(Object.keys(dateFilter).length > 0 && {
          transferedAt: dateFilter,
        }),
      },
      include: {
        fromBusiness: { select: { id: true, displayName: true } },
        toBusiness: { select: { id: true, displayName: true } },
        product: { select: { id: true, name: true, sku: true } },
      },
      orderBy: { transferedAt: 'desc' },
    });

    // Calculate analytics
    const totalTransfers = transfers.length;
    const totalQuantity = transfers.reduce((sum, t) => sum + Number(t.quantity), 0);
    const totalCost = transfers.reduce((sum, t) => sum + Number(t.costPerUnit) * Number(t.quantity), 0);
    const totalTransferValue = transfers.reduce((sum, t) => sum + Number(t.transferPrice) * Number(t.quantity), 0);
    const totalMargin = transfers.reduce((sum, t) => sum + Number(t.margin), 0);

    // Group by business pairs
    const businessPairAnalysis = new Map<string, any>();
    transfers.forEach((transfer) => {
      const key = `${transfer.fromBusinessId}-${transfer.toBusinessId}`;
      if (!businessPairAnalysis.has(key)) {
        businessPairAnalysis.set(key, {
          fromBusiness: transfer.fromBusiness,
          toBusiness: transfer.toBusiness,
          transferCount: 0,
          totalQuantity: 0,
          totalCost: 0,
          totalTransferValue: 0,
          totalMargin: 0,
          avgMarginPercent: 0,
        });
      }
      const pair = businessPairAnalysis.get(key);
      pair.transferCount += 1;
      pair.totalQuantity += Number(transfer.quantity);
      pair.totalCost += Number(transfer.costPerUnit) * Number(transfer.quantity);
      pair.totalTransferValue += Number(transfer.transferPrice) * Number(transfer.quantity);
      pair.totalMargin += Number(transfer.margin);
    });

    // Calculate margin percentages
    businessPairAnalysis.forEach((pair) => {
      if (pair.totalCost > 0) {
        pair.avgMarginPercent = Math.round((pair.totalMargin / pair.totalCost) * 10000) / 100;
      }
    });

    // Group by product
    const productAnalysis = new Map<string, any>();
    transfers.forEach((transfer) => {
      const key = transfer.productId;
      if (!productAnalysis.has(key)) {
        productAnalysis.set(key, {
          product: transfer.product,
          transferCount: 0,
          totalQuantity: 0,
          totalCost: 0,
          totalTransferValue: 0,
          totalMargin: 0,
        });
      }
      const product = productAnalysis.get(key);
      product.transferCount += 1;
      product.totalQuantity += Number(transfer.quantity);
      product.totalCost += Number(transfer.costPerUnit) * Number(transfer.quantity);
      product.totalTransferValue += Number(transfer.transferPrice) * Number(transfer.quantity);
      product.totalMargin += Number(transfer.margin);
    });

    // Group by status
    const statusBreakdown = {
      pending: transfers.filter((t) => t.status === 'pending').length,
      completed: transfers.filter((t) => t.status === 'completed').length,
      returned: transfers.filter((t) => t.status === 'returned').length,
    };

    return NextResponse.json({
      success: true,
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
      summary: {
        totalTransfers,
        totalQuantity: Math.round(totalQuantity * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        totalTransferValue: Math.round(totalTransferValue * 100) / 100,
        totalMargin: Math.round(totalMargin * 100) / 100,
        avgMarginPercent: totalCost > 0 ? Math.round((totalMargin / totalCost) * 10000) / 100 : 0,
        statusBreakdown,
      },
      businessPairs: Array.from(businessPairAnalysis.values()),
      products: Array.from(productAnalysis.values()),
      transfers: transfers.map((t) => ({
        id: t.id,
        fromBusiness: t.fromBusiness,
        toBusiness: t.toBusiness,
        product: t.product,
        quantity: Number(t.quantity),
        costPerUnit: Number(t.costPerUnit),
        transferPrice: Number(t.transferPrice),
        markup: Number(t.markup),
        markupType: t.markupType,
        margin: Math.round(Number(t.margin) * 100) / 100,
        status: t.status,
        transferedAt: t.transferedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching transfer report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transfer report' },
      { status: 500 }
    );
  }
}
