/**
 * Unit Tests - Gemini Service
 * Tests AI service with rate limiting and validation
 */

import {generateMockup, editMockup} from '../geminiService';
import {rateLimiter} from '../../utils/rateLimiter';

jest.mock('../../utils/rateLimiter');

describe('Gemini Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (rateLimiter.isAllowed as jest.Mock).mockReturnValue(true);
    global.fetch = jest.fn();
  });

  describe('generateMockup', () => {
    it('should call API with correct parameters', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    data: 'base64imagedata',
                  },
                },
              ],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const logoBase64 = 'data:image/png;base64,test123';
      const productPrompt = 'a premium t-shirt';

      await generateMockup(logoBase64, productPrompt);

      expect(rateLimiter.isAllowed).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should throw error when rate limit exceeded', async () => {
      (rateLimiter.isAllowed as jest.Mock).mockReturnValue(false);

      await expect(
        generateMockup('data:image/png;base64,test', 't-shirt')
      ).rejects.toThrow('Rate limit exceeded');
    });

    it('should throw error for invalid image size', async () => {
      const largeBase64 = 'a'.repeat(11 * 1024 * 1024); // 11MB

      await expect(
        generateMockup(`data:image/png;base64,${largeBase64}`, 't-shirt')
      ).rejects.toThrow('Image too large');
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({error: {message: 'Invalid request'}}),
      });

      await expect(
        generateMockup('data:image/png;base64,test', 't-shirt')
      ).rejects.toThrow();
    });
  });

  describe('editMockup', () => {
    it('should call API with sanitized prompt', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    data: 'base64imagedata',
                  },
                },
              ],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await editMockup('data:image/png;base64,test', 'Add a retro filter');

      expect(rateLimiter.isAllowed).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should reject prompts over 500 characters', async () => {
      const longPrompt = 'a'.repeat(501);

      await expect(
        editMockup('data:image/png;base64,test', longPrompt)
      ).rejects.toThrow();
    });
  });
});

