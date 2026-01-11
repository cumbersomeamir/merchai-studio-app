/**
 * Unit Tests - Rate Limiter
 */

import {rateLimiter, RATE_LIMITS} from '../rateLimiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Reset rate limiter before each test
    rateLimiter.reset('test_key');
  });

  it('should allow requests within limit', () => {
    const key = 'test_key';
    const config = {maxRequests: 5, windowMs: 60000};

    for (let i = 0; i < 5; i++) {
      expect(rateLimiter.isAllowed(key, config)).toBe(true);
    }
  });

  it('should block requests exceeding limit', () => {
    const key = 'test_key';
    const config = {maxRequests: 3, windowMs: 60000};

    // Make 3 requests (allowed)
    rateLimiter.isAllowed(key, config);
    rateLimiter.isAllowed(key, config);
    rateLimiter.isAllowed(key, config);

    // 4th request should be blocked
    expect(rateLimiter.isAllowed(key, config)).toBe(false);
  });

  it('should reset after window expires', (done) => {
    const key = 'test_key';
    const config = {maxRequests: 2, windowMs: 100}; // 100ms window

    // Exceed limit
    rateLimiter.isAllowed(key, config);
    rateLimiter.isAllowed(key, config);
    expect(rateLimiter.isAllowed(key, config)).toBe(false);

    // Wait for window to expire
    setTimeout(() => {
      expect(rateLimiter.isAllowed(key, config)).toBe(true);
      done();
    }, 150);
  });

  it('should track remaining requests correctly', () => {
    const key = 'test_key';
    const config = {maxRequests: 5, windowMs: 60000};

    expect(rateLimiter.getRemaining(key, config)).toBe(5);
    rateLimiter.isAllowed(key, config);
    expect(rateLimiter.getRemaining(key, config)).toBe(4);
    rateLimiter.isAllowed(key, config);
    expect(rateLimiter.getRemaining(key, config)).toBe(3);
  });
});

