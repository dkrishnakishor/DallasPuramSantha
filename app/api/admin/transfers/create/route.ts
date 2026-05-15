import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * POST /api/admin/transfers/create
 * Create a new inter-organization transfer
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      ruleId,
      fromBusinessId,
      toBusinessId,
      productId,
      quantity,
      costPerUnit,
      salePrice,
      notes,
    } = body;

    // Validation
    if (
      !fromBusinessId ||
      !toBusinessId ||
      !productId ||
      quantity === undefined ||
      costPerUnit === undefined
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: fromBusinessId, toBusinessId, productId, quantity, costPerUnit',
        },
        { status: 400 }
      );
    }

    // Verify businesses and product exist
    const [fromBiz, toBiz, product] = await Promise.all([
      prisma.business.findUnique({ where: { id: fromBusinessId } }),
      prisma.business.findUnique({ where: { id: toBusinessId } }),
      prisma.product.findUnique({ where: { id: productId } }),
    ]);

    if (!fromBiz || !toBiz || !product) {
      return NextResponse.json(
        { error: 'One or more organizations/products not found' },
        { status: 404 }
      );
    }

    let transferPrice = new Prisma.Decimal(costPerUnit);
    let markup = new Prisma.Decimal(0);
    let markupType = 'PERCENTAGE';

    // If rule is provided, calculate transfer price based on rule
    if (ruleId) {
      const rule = await prisma.interOrgTransferRule.findUnique({
        where: { id: ruleId },
      });

      if (!rule) {
        return NextResponse.json(
          { error: 'Transfer pricing rule not found' },
          { status: 404 }
        );
      }

      markup = rule.markupValue;
      markupType = rule.markupType;

      const cost = new Prisma.Decimal(costPerUnit);
      if (rule.markupType === 'PERCENTAGE') {
        transferPrice = cost.mul(new Prisma.Decimal(1).add(markup.div(100)));
      } else {
        transferPrice = cost.add(markup);
      }

      // Check minimum margin if specified
      if (rule.minMargin) {
        const margin = transferPrice.sub(cost);
        if (margin.lessThan(rule.minMargin)) {
          transferPrice = cost.add(rule.minMargin);
        }
      }
    }

    // Create transfer
    const transfer = await prisma.interOrgTransfer.create({
      data: {
        ruleId: ruleId || null,
        fromBusinessId,
        toBusinessId,
        productId,
        quantity: new Prisma.Decimal(quantity),
        costPerUnit: new Prisma.Decimal(costPerUnit),
        transferPrice,
        salePrice: salePrice ? new Prisma.Decimal(salePrice) : null,
        markup,
        markupType,
        margin: transferPrice
          .sub(new Prisma.Decimal(costPerUnit))
          .mul(new Prisma.Decimal(quantity)),
        notes: notes || null,
        status: 'completed',
      },
      include: {
        fromBusiness: { select: { id: true, displayName: true } },
        toBusiness: { select: { id: true, displayName: true } },
        product: { select: { id: true, name: true, sku: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Inter-organization transfer created successfully',
        transfer: {
          id: transfer.id,
          fromBusiness: transfer.fromBusiness,
          toBusiness: transfer.toBusiness,
          product: transfer.product,
          quantity: Number(transfer.quantity),
          costPerUnit: Number(transfer.costPerUnit),
          transferPrice: Number(transfer.transferPrice),
          salePrice: transfer.salePrice ? Number(transfer.salePrice) : null,
          markup: Number(transfer.markup),
          markupType: transfer.markupType,
          margin: Number(transfer.margin),
          status: transfer.status,
          transferedAt: transfer.transferedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating transfer:', error);
    return NextResponse.json(
      { error: 'Failed to create transfer' },
      { status: 500 }
    );
  }
}
