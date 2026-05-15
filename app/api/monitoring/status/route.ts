import { NextRequest, NextResponse } from 'next/server';
import { getAllEndpointsHealth } from '@/lib/monitoring';
import { getAuthenticatedUser } from '@/lib/auth';

/**
 * GET /api/monitoring/status
 *
 * Returns simplified status for a status page / dashboard widget
 * Public endpoint (no auth required for status pages)
 */
export async function GET(request: NextRequest) {
  try {
    const health = getAllEndpointsHealth();

    // Simple status: all healthy, some degraded, or down
    const downCount = health.filter((h) => h.status === 'down').length;
    const degradedCount = health.filter((h) => h.status === 'degraded').length;

    let overallStatus = 'operational';
    if (downCount > 0) overallStatus = 'degraded';
    if (downCount >= health.length / 2) overallStatus = 'down';

    return NextResponse.json({
      status: overallStatus,
      lastChecked: new Date().toISOString(),
      metrics: {
        totalRequests: health.reduce((sum, h) => sum + Math.round(h.responseTime), 0),
        upEndpoints: health.filter((h) => h.status === 'healthy').length,
        downEndpoints: downCount,
        avgResponseTime: Math.round(
          health.reduce((sum, h) => sum + h.responseTime, 0) / health.length
        ),
        avgCacheHitRate: Math.round(
          health.reduce((sum, h) => sum + h.cacheHitRate, 0) / health.length
        ),
      },
      details: health.map((h) => ({
        endpoint: h.endpoint.split('/').pop(),
        status: h.status,
        responseTime: h.responseTime,
        cacheHitRate: h.cacheHitRate,
      })),
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      {
        status: 'unknown',
        error: 'Failed to check status',
      },
      { status: 500 }
    );
  }
}
