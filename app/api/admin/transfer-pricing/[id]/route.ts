import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * GET /api/admin/transfer-pricing/:id
 * Get a specific transfer pricing rule
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rule = await prisma.interOrgTransferRule.findUnique({
      where: { id: params.id },
      include: {
        fromBusiness: { select: { id: true, displayName: true } },
        toBusiness: { select: { id: true, displayName: true } },
        product: { select: { id: true, name: true, sku: true } },
        transfers: { select: { _count: true } },
      },
    });

    if (!rule) {
      return NextResponse.json(
        { error: 'Transfer pricing rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      rule,
    });
  } catch (error) {
    console.error('Error fetching transfer pricing rule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transfer pricing rule' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/transfer-pricing/:id
 * Update a transfer pricing rule
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      markupType,
      markupValue,
      minMargin,
      notes,
      effectiveTo,
      active,
    } = body;

    // Verify rule exists
    const existing = await prisma.interOrgTransferRule.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Transfer pricing rule not found' },
        { status: 404 }
      );
    }

    // Update rule
    const rule = await prisma.interOrgTransferRule.update({
      where: { id: params.id },
      data: {
        ...(markupType && { markupType }),
        ...(markupValue !== undefined && {
          markupValue: new Prisma.Decimal(markupValue),
        }),
        ...(minMargin !== undefined && {
          minMargin: minMargin ? new Prisma.Decimal(minMargin) : null,
        }),
        ...(notes !== undefined && { notes }),
        ...(effectiveTo && { effectiveTo: new Date(effectiveTo) }),
        ...(active !== undefined && { active }),
      },
      include: {
        fromBusiness: { select: { id: true, displayName: true } },
        toBusiness: { select: { id: true, displayName: true } },
        product: { select: { id: true, name: true, sku: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Transfer pricing rule updated successfully',
      rule,
    });
  } catch (error) {
    console.error('Error updating transfer pricing rule:', error);
    return NextResponse.json(
      { error: 'Failed to update transfer pricing rule' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/transfer-pricing/:id
 * Delete a transfer pricing rule
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify rule exists
    const existing = await prisma.interOrgTransferRule.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Transfer pricing rule not found' },
        { status: 404 }
      );
    }

    // Delete rule
    await prisma.interOrgTransferRule.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Transfer pricing rule deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting transfer pricing rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete transfer pricing rule' },
      { status: 500 }
    );
  }
}
