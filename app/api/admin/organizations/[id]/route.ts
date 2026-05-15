import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * GET /api/admin/organizations/:id
 * Get a specific organization
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

    const organization = await prisma.business.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        displayName: true,
        businessType: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            transferRulesFrom: true,
            transferRulesTo: true,
            transfersOut: true,
            transfersIn: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      organization,
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/organizations/:id
 * Update an organization
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
    const { displayName, businessType, email, phone, address } = body;

    // Verify organization exists
    const existing = await prisma.business.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Update organization
    const organization = await prisma.business.update({
      where: { id: params.id },
      data: {
        ...(displayName && { displayName }),
        ...(businessType && { businessType }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        businessType: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Organization updated successfully',
      organization,
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/organizations/:id
 * Delete an organization (with safety checks)
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

    // Verify organization exists
    const organization = await prisma.business.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        displayName: true,
        _count: {
          select: {
            orders: true,
            inventory: true,
            customers: true,
            vendors: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Check for existing data
    if (
      organization._count.orders > 0 ||
      organization._count.inventory > 0 ||
      organization._count.customers > 0 ||
      organization._count.vendors > 0
    ) {
      return NextResponse.json(
        {
          error: 'Cannot delete organization with existing data',
          message: `This organization has ${organization._count.orders} orders, ${organization._count.inventory} inventory items, ${organization._count.customers} customers, and ${organization._count.vendors} vendors.`,
          details: {
            orders: organization._count.orders,
            inventory: organization._count.inventory,
            customers: organization._count.customers,
            vendors: organization._count.vendors,
          },
        },
        { status: 409 }
      );
    }

    // Delete organization (CASCADE will handle related data)
    await prisma.business.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: `Organization "${organization.displayName}" deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    );
  }
}
