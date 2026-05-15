import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getAuthenticatedUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return null;
    }

    return data.user;
  } catch {
    return null;
  }
}

export async function checkBusinessAccess(userId: string, businessId: string) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const access = await prisma.userBusinessAccess.findUnique({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
    });

    return !!access;
  } finally {
    await prisma.$disconnect();
  }
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized: Authentication required' },
    { status: 401 }
  );
}

export function forbiddenResponse() {
  return NextResponse.json(
    { error: 'Forbidden: No access to this business' },
    { status: 403 }
  );
}

export function badRequestResponse(message: string) {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  );
}

export function internalErrorResponse(error: any) {
  console.error('Internal server error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
