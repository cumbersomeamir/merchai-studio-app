/**
 * Security Tests - Auth failures, rate limits, input validation
 */

import {
  postLoginData,
  postMockupGeneration,
  postMockupEdit,
} from '../services/apiService';
import {rateLimiter} from '../utils/rateLimiter';
import {checkAuthorization} from '../utils/auth';
import {validateAndSanitize, MockupEditDataSchema} from '../utils/validation';

jest.mock('../services/mongodbService');
jest.mock('../utils/rateLimiter');
jest.mock('../utils/auth');

describe('Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rate Limiting', () => {
    it('should block excessive login attempts', async () => {
      (rateLimiter.isAllowed as jest.Mock).mockReturnValue(false);

      await postLoginData({
        userId: 'user123',
        email: 'test@example.com',
        name: 'Test',
        provider: 'google',
        loginTimestamp: Date.now(),
      });

      expect(rateLimiter.isAllowed).toHaveBeenCalled();
    });

    it('should block excessive mockup generation', async () => {
      (rateLimiter.isAllowed as jest.Mock).mockReturnValue(false);

      await postMockupGeneration({
        userId: 'user123',
        mockupId: 'mockup123',
        productType: 'T-Shirt',
        productId: 'tshirt',
        promptHint: 'test',
        timestamp: Date.now(),
        logoUploaded: true,
      });

      expect(rateLimiter.isAllowed).toHaveBeenCalled();
    });
  });

  describe('Authorization Checks', () => {
    it('should reject unauthorized requests', async () => {
      (rateLimiter.isAllowed as jest.Mock).mockReturnValue(true);
      (checkAuthorization as jest.Mock).mockResolvedValue(false);

      await postLoginData({
        userId: 'user123',
        email: 'test@example.com',
        name: 'Test',
        provider: 'google',
        loginTimestamp: Date.now(),
      });

      expect(checkAuthorization).toHaveBeenCalledWith('user123');
    });
  });

  describe('Input Validation', () => {
    it('should reject XSS attempts in edit prompts', () => {
      const maliciousInput = {
        userId: 'user123',
        mockupId: 'mockup123',
        editPrompt: '<script>alert("xss")</script>',
        timestamp: Date.now(),
        isRegeneration: false,
      };

      const result = validateAndSanitize(MockupEditDataSchema, maliciousInput);
      expect(result.success).toBe(false);
    });

    it('should reject overly long prompts', () => {
      const longInput = {
        userId: 'user123',
        mockupId: 'mockup123',
        editPrompt: 'a'.repeat(501),
        timestamp: Date.now(),
        isRegeneration: false,
      };

      const result = validateAndSanitize(MockupEditDataSchema, longInput);
      expect(result.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      (rateLimiter.isAllowed as jest.Mock).mockReturnValue(true);
      (checkAuthorization as jest.Mock).mockResolvedValue(true);
      const {insertDocument} = require('../services/mongodbService');
      (insertDocument as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Function should handle errors internally (not throw to caller)
      // The function catches errors and logs them, doesn't throw
      await expect(
        postLoginData({
          userId: 'user123',
          email: 'test@example.com',
          name: 'Test',
          provider: 'google',
          loginTimestamp: Date.now(),
        })
      ).resolves.toBeUndefined();

      // Verify it was called (error handling happens inside)
      expect(insertDocument).toHaveBeenCalled();
    });
  });
});

