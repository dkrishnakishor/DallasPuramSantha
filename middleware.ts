import { NextRequest, NextResponse } from 'next/server';
import { recordMetric, logMetrics } from '@/lib/monitoring';

export function middleware(request: NextRequest) {
  // Track request timing
  const startTime = Date.now();
  const endpoint = request.nextUrl.pathname;

  // Only track API requests
  if (!endpoint.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Continue with request
  const response = NextResponse.next();

  // Calculate metrics
  const duration = Date.now() - startTime;
  const statusCode = response.status;
  const success = statusCode >= 200 && statusCode < 400;
  const cacheHit = response.headers.get('x-cache') === 'HIT';

  // Record metrics
  recordMetric(endpoint, duration, success, cacheHit);

  // Log to Sentry
  logMetrics({
    endpoint,
    method: request.method,
    statusCode,
    duration,
    cacheHit,
  });

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
