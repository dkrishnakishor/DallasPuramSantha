import * as Sentry from '@sentry/nextjs';

// Initialize Sentry for error tracking and performance monitoring
export function initializeMonitoring() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection(),
    ],
    beforeSend(event) {
      // Filter out specific errors if needed
      return event;
    },
  });
}

// Performance monitoring metrics
export interface PerformanceMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number; // milliseconds
  cacheHit: boolean;
  userId?: string;
  businessId?: string;
  errorMessage?: string;
}

/**
 * Log performance metrics to Sentry
 */
export function logMetrics(metrics: PerformanceMetrics) {
  const transaction = Sentry.startTransaction({
    op: 'http.request',
    name: `${metrics.method} ${metrics.endpoint}`,
    data: {
      'http.method': metrics.method,
      'http.status_code': metrics.statusCode,
      'cache.hit': metrics.cacheHit,
      'user.id': metrics.userId,
      'business.id': metrics.businessId,
    },
  });

  // Finish immediately (duration already measured)
  transaction.setEndTimestamp(Date.now() / 1000 - metrics.duration / 1000);
  transaction.finish();

  // Log to console in dev
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[METRICS] ${metrics.method} ${metrics.endpoint} - ${metrics.duration}ms (${metrics.cacheHit ? 'cache hit' : 'db'}) - ${metrics.statusCode}`
    );
  }
}

/**
 * Log API errors to Sentry
 */
export function logError(error: Error, context: Record<string, any> = {}) {
  Sentry.captureException(error, {
    contexts: {
      api: context,
    },
  });

  console.error('[ERROR]', error.message, context);
}

/**
 * Log info message
 */
export function logInfo(message: string, context: Record<string, any> = {}) {
  Sentry.captureMessage(message, 'info');
  console.log('[INFO]', message, context);
}

/**
 * Track API endpoint health
 */
export interface EndpointHealth {
  endpoint: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  errorRate: number;
  cacheHitRate: number;
  lastChecked: Date;
}

// Store metrics in memory (in production, use a database)
const metricsStore = new Map<
  string,
  {
    totalRequests: number;
    totalDuration: number;
    cacheHits: number;
    errors: number;
    lastError?: string;
  }
>();

/**
 * Record endpoint metrics
 */
export function recordMetric(
  endpoint: string,
  duration: number,
  success: boolean,
  cacheHit: boolean
) {
  if (!metricsStore.has(endpoint)) {
    metricsStore.set(endpoint, {
      totalRequests: 0,
      totalDuration: 0,
      cacheHits: 0,
      errors: 0,
    });
  }

  const stats = metricsStore.get(endpoint)!;
  stats.totalRequests++;
  stats.totalDuration += duration;
  if (cacheHit) stats.cacheHits++;
  if (!success) stats.errors++;

  // Log to Sentry periodically (every 100 requests)
  if (stats.totalRequests % 100 === 0) {
    const avgDuration = stats.totalDuration / stats.totalRequests;
    const cacheHitRate = (stats.cacheHits / stats.totalRequests) * 100;
    const errorRate = (stats.errors / stats.totalRequests) * 100;

    console.log(`[HEALTH] ${endpoint}:`);
    console.log(`  - Avg Response: ${Math.round(avgDuration)}ms`);
    console.log(`  - Cache Hit Rate: ${Math.round(cacheHitRate)}%`);
    console.log(`  - Error Rate: ${Math.round(errorRate)}%`);
  }
}

/**
 * Get endpoint health status
 */
export function getEndpointHealth(endpoint: string): EndpointHealth | null {
  const stats = metricsStore.get(endpoint);
  if (!stats) return null;

  const avgDuration = stats.totalRequests > 0 ? stats.totalDuration / stats.totalRequests : 0;
  const errorRate =
    stats.totalRequests > 0 ? (stats.errors / stats.totalRequests) * 100 : 0;
  const cacheHitRate =
    stats.totalRequests > 0 ? (stats.cacheHits / stats.totalRequests) * 100 : 0;

  let status: 'healthy' | 'degraded' | 'down' = 'healthy';
  if (errorRate > 5) status = 'degraded';
  if (errorRate > 10) status = 'down';

  return {
    endpoint,
    status,
    responseTime: Math.round(avgDuration),
    errorRate: Math.round(errorRate * 100) / 100,
    cacheHitRate: Math.round(cacheHitRate * 100) / 100,
    lastChecked: new Date(),
  };
}

/**
 * Get all endpoints health
 */
export function getAllEndpointsHealth(): EndpointHealth[] {
  const endpoints = Array.from(metricsStore.keys());
  return endpoints.map((endpoint) => getEndpointHealth(endpoint)!).filter(Boolean);
}

export default {
  initializeMonitoring,
  logMetrics,
  logError,
  logInfo,
  recordMetric,
  getEndpointHealth,
  getAllEndpointsHealth,
};
