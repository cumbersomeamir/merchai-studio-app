/**
 * Unit Tests - Validation Utilities
 */

import {
  validateAndSanitize,
  LoginDataSchema,
  OnboardingDataSchema,
  MockupGenerationDataSchema,
  MockupEditDataSchema,
  sanitizeString,
} from '../validation';

describe('Validation Utils', () => {
  describe('sanitizeString', () => {
    it('should remove dangerous patterns', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeString(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
    });

    it('should remove javascript: protocol', () => {
      const input = 'javascript:alert("xss")';
      const result = sanitizeString(input);
      expect(result).not.toContain('javascript:');
    });

    it('should remove event handlers', () => {
      const input = 'onclick=alert("xss")';
      const result = sanitizeString(input);
      expect(result).not.toContain('onclick=');
    });

    it('should trim and limit length', () => {
      const input = '  ' + 'a'.repeat(2000) + '  ';
      const result = sanitizeString(input);
      expect(result.length).toBeLessThanOrEqual(1000);
      expect(result).not.toMatch(/^\s+/);
    });
  });

  describe('LoginDataSchema', () => {
    it('should validate correct login data', () => {
      const data = {
        userId: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        provider: 'google' as const,
        loginTimestamp: Date.now(),
      };
      const result = validateAndSanitize(LoginDataSchema, data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = {
        userId: 'user123',
        email: 'invalid-email',
        name: 'Test User',
        provider: 'google' as const,
        loginTimestamp: Date.now(),
      };
      const result = validateAndSanitize(LoginDataSchema, data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid provider', () => {
      const data = {
        userId: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        provider: 'facebook' as any,
        loginTimestamp: Date.now(),
      };
      const result = validateAndSanitize(LoginDataSchema, data);
      expect(result.success).toBe(false);
    });
  });

  describe('OnboardingDataSchema', () => {
    it('should validate correct onboarding data', () => {
      const data = {
        userId: 'user123',
        selectedPlan: 'pro' as const,
        skipped: false,
        timestamp: Date.now(),
      };
      const result = validateAndSanitize(OnboardingDataSchema, data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid plan', () => {
      const data = {
        userId: 'user123',
        selectedPlan: 'premium' as any,
        skipped: false,
        timestamp: Date.now(),
      };
      const result = validateAndSanitize(OnboardingDataSchema, data);
      expect(result.success).toBe(false);
    });
  });

  describe('MockupEditDataSchema', () => {
    it('should reject prompts with script tags', () => {
      const data = {
        userId: 'user123',
        mockupId: 'mockup123',
        editPrompt: '<script>alert("xss")</script>',
        timestamp: Date.now(),
        isRegeneration: false,
      };
      const result = validateAndSanitize(MockupEditDataSchema, data);
      expect(result.success).toBe(false);
    });

    it('should reject prompts over 500 characters', () => {
      const data = {
        userId: 'user123',
        mockupId: 'mockup123',
        editPrompt: 'a'.repeat(501),
        timestamp: Date.now(),
        isRegeneration: false,
      };
      const result = validateAndSanitize(MockupEditDataSchema, data);
      expect(result.success).toBe(false);
    });

    it('should accept valid edit prompts', () => {
      const data = {
        userId: 'user123',
        mockupId: 'mockup123',
        editPrompt: 'Add a retro filter',
        timestamp: Date.now(),
        isRegeneration: false,
      };
      const result = validateAndSanitize(MockupEditDataSchema, data);
      expect(result.success).toBe(true);
    });
  });
});

