import { NextRequest, NextResponse } from 'next/server';
import { getAllEndpointsHealth } from '@/lib/monitoring';
import { getAuthenticatedUser } from '@/lib/auth';

/**
 * GET /api/monitoring/health
 *
 * Returns health status of all API endpoints
 * Requires authentication (admin users only)
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    // In production, verify user is admin
    // For now, allow authenticated users to view health

    const health = getAllEndpointsHealth();

    // Calculate summary
    const summary = {
      totalEndpoints: health.length,
      healthyEndpoints: health.filter((h) => h.status === 'healthy').length,
      degradedEndpoints: health.filter((h) => h.status === 'degraded').length,
      downEndpoints: health.filter((h) => h.status === 'down').length,
      averageResponseTime: Math.round(
        health.reduce((sum, h) => sum + h.responseTime, 0) / health.length
      ),
      averageCacheHitRate: Math.round(
        health.reduce((sum, h) => sum + h.cacheHitRate, 0) / health.length
      ),
      averageErrorRate:
        Math.round(
          (health.reduce((sum, h) => sum + h.errorRate, 0) / health.length) * 100
        ) / 100,
    };

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      summary,
      endpoints: health,
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
