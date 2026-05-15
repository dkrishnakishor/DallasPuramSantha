import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * GET /api/admin/organizations
 * List all organizations
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, verify user is admin
    // For now, allow authenticated users

    const organizations = await prisma.business.findMany({
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      count: organizations.length,
      organizations,
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/organizations
 * Create a new organization
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, verify user is admin
    // For now, allow authenticated users

    const body = await request.json();
    const { name, displayName, businessType, email, phone, address } = body;

    // Validation
    if (!name || !displayName || !businessType) {
      return NextResponse.json(
        {
          error: 'Missing required fields: name, displayName, businessType',
        },
        { status: 400 }
      );
    }

    // Check if organization already exists
    const existing = await prisma.business.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Organization with name "${name}" already exists` },
        { status: 409 }
      );
    }

    // Create organization
    const organization = await prisma.business.create({
      data: {
        name,
        displayName,
        businessType,
        email: email || null,
        phone: phone || null,
        address: address || null,
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

    return NextResponse.json(
      {
        success: true,
        message: `Organization "${displayName}" created successfully`,
        organization,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
