import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * GET /api/admin/transfer-pricing
 * List all transfer pricing rules
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
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const rules = await prisma.interOrgTransferRule.findMany({
      where: {
        ...(fromBusinessId && { fromBusinessId }),
        ...(toBusinessId && { toBusinessId }),
        ...(activeOnly && { active: true }),
      },
      include: {
        fromBusiness: {
          select: { id: true, displayName: true },
        },
        toBusiness: {
          select: { id: true, displayName: true },
        },
        product: {
          select: { id: true, name: true, sku: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      count: rules.length,
      rules,
    });
  } catch (error) {
    console.error('Error fetching transfer pricing rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transfer pricing rules' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/transfer-pricing
 * Create a new transfer pricing rule
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      fromBusinessId,
      toBusinessId,
      productId,
      markupType,
      markupValue,
      minMargin,
      notes,
      effectiveFrom,
      effectiveTo,
    } = body;

    // Validation
    if (!fromBusinessId || !toBusinessId || !markupType || markupValue === undefined) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: fromBusinessId, toBusinessId, markupType, markupValue',
        },
        { status: 400 }
      );
    }

    if (!['PERCENTAGE', 'FIXED_AMOUNT'].includes(markupType)) {
      return NextResponse.json(
        { error: 'markupType must be PERCENTAGE or FIXED_AMOUNT' },
        { status: 400 }
      );
    }

    // Verify both organizations exist
    const [fromBiz, toBiz] = await Promise.all([
      prisma.business.findUnique({ where: { id: fromBusinessId } }),
      prisma.business.findUnique({ where: { id: toBusinessId } }),
    ]);

    if (!fromBiz || !toBiz) {
      return NextResponse.json(
        { error: 'One or both organizations not found' },
        { status: 404 }
      );
    }

    // Verify product if specified
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
    }

    // Create rule
    const rule = await prisma.interOrgTransferRule.create({
      data: {
        fromBusinessId,
        toBusinessId,
        productId: productId || null,
        markupType,
        markupValue: new Prisma.Decimal(markupValue),
        minMargin: minMargin ? new Prisma.Decimal(minMargin) : null,
        notes: notes || null,
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
        active: true,
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
        message: 'Transfer pricing rule created successfully',
        rule,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating transfer pricing rule:', error);
    return NextResponse.json(
      { error: 'Failed to create transfer pricing rule' },
      { status: 500 }
    );
  }
}
