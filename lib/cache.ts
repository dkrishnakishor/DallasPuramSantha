import { Redis } from '@upstash/redis';

// Initialize Upstash Redis (serverless, no setup required)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export interface CacheOptions {
  ttl?: number; // TTL in seconds (default: 3600 = 1 hour)
  prefix?: string;
}

const DEFAULT_TTL = 3600; // 1 hour
const CACHE_PREFIX = 'dps:'; // DallasPuram Santha prefix

/**
 * Generate cache key from business_id and optional filters
 */
export function generateCacheKey(
  endpoint: string,
  businessId: string,
  filters?: Record<string, string | null>
): string {
  let key = `${CACHE_PREFIX}${endpoint}:${businessId}`;

  if (filters) {
    const filterStr = Object.entries(filters)
      .filter(([_, v]) => v !== null)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join(':');

    if (filterStr) key += `:${filterStr}`;
  }

  return key;
}

/**
 * Get cached value
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      console.log(`✓ Cache HIT: ${key}`);
      return cached as T;
    }
    console.log(`✗ Cache MISS: ${key}`);
    return null;
  } catch (error) {
    console.error(`Cache GET error for ${key}:`, error);
    return null; // Fail gracefully, fetch from DB
  }
}

/**
 * Set cache value with TTL
 */
export async function setCachedData<T>(
  key: string,
  data: T,
  options?: CacheOptions
): Promise<void> {
  try {
    const ttl = options?.ttl || DEFAULT_TTL;
    await redis.setex(key, ttl, JSON.stringify(data));
    console.log(`✓ Cache SET: ${key} (TTL: ${ttl}s)`);
  } catch (error) {
    console.error(`Cache SET error for ${key}:`, error);
    // Continue execution even if cache fails
  }
}

/**
 * Invalidate cache by key or pattern
 */
export async function invalidateCache(keyOrPattern: string): Promise<void> {
  try {
    await redis.del(keyOrPattern);
    console.log(`✓ Cache INVALIDATED: ${keyOrPattern}`);
  } catch (error) {
    console.error(`Cache INVALIDATE error for ${keyOrPattern}:`, error);
  }
}

/**
 * Invalidate all cache for a business
 */
export async function invalidateBusinessCache(businessId: string): Promise<void> {
  try {
    // Note: Upstash doesn't support pattern deletion, so we invalidate known keys
    const keysToInvalidate = [
      generateCacheKey('batch-profitability', businessId),
      generateCacheKey('inventory-critical', businessId),
      generateCacheKey('product-profitability', businessId),
    ];

    await Promise.all(keysToInvalidate.map((key) => redis.del(key)));
    console.log(`✓ Cache INVALIDATED for business: ${businessId}`);
  } catch (error) {
    console.error(`Cache INVALIDATE error for business ${businessId}:`, error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  hits: number;
  misses: number;
  hitRate: number;
}> {
  try {
    const hits = (await redis.get('cache:hits')) as number | null;
    const misses = (await redis.get('cache:misses')) as number | null;

    const totalHits = hits || 0;
    const totalMisses = misses || 0;
    const total = totalHits + totalMisses;

    return {
      hits: totalHits,
      misses: totalMisses,
      hitRate: total > 0 ? (totalHits / total) * 100 : 0,
    };
  } catch (error) {
    console.error('Cache STATS error:', error);
    return { hits: 0, misses: 0, hitRate: 0 };
  }
}

export default redis;
