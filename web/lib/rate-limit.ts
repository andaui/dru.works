/**
 * Simple in-memory rate limiter
 * For production with multiple instances, consider using Redis
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if an IP has exceeded rate limit
 * @param identifier - IP address or other identifier
 * @param maxAttempts - Maximum attempts allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if within limit, false if exceeded
 */
export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired one
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }
  
  if (entry.count >= maxAttempts) {
    return false; // Rate limit exceeded
  }
  
  // Increment count
  entry.count++;
  return true;
}

/**
 * Get remaining attempts for an identifier
 */
export function getRemainingAttempts(
  identifier: string,
  maxAttempts: number = 5
): number {
  const entry = rateLimitStore.get(identifier);
  if (!entry || Date.now() > entry.resetTime) {
    return maxAttempts;
  }
  return Math.max(0, maxAttempts - entry.count);
}

