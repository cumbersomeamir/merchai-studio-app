/**
 * Rate Limiter - Client-side throttling
 * Prevents excessive API calls
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  /**
   * Check if request is allowed
   */
  isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove old requests outside the window
    const recentRequests = requests.filter(
      (timestamp) => now - timestamp < config.windowMs
    );

    // Check if limit exceeded
    if (recentRequests.length >= config.maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);

    return true;
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Get remaining requests
   */
  getRemaining(key: string, config: RateLimitConfig): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const recentRequests = requests.filter(
      (timestamp) => now - timestamp < config.windowMs
    );
    return Math.max(0, config.maxRequests - recentRequests.length);
  }
}

export const rateLimiter = new RateLimiter();

// Rate limit configurations
export const RATE_LIMITS = {
  LOGIN: {maxRequests: 5, windowMs: 15 * 60 * 1000}, // 5 per 15 minutes
  MOCKUP_GENERATION: {maxRequests: 10, windowMs: 60 * 1000}, // 10 per minute
  MOCKUP_EDIT: {maxRequests: 20, windowMs: 60 * 1000}, // 20 per minute
  MOCKUP_EXPORT: {maxRequests: 30, windowMs: 60 * 1000}, // 30 per minute
  API_CALL: {maxRequests: 100, windowMs: 60 * 1000}, // 100 per minute
} as const;

