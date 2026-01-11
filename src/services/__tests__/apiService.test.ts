/**
 * Integration Tests - API Service
 * Tests API calls with validation, rate limiting, and authorization
 */

import {
  postLoginData,
  postOnboardingData,
  postMockupGeneration,
  postMockupEdit,
  postMockupExport,
} from '../apiService';
import {insertDocument} from '../mongodbService';
import {rateLimiter} from '../../utils/rateLimiter';
import {checkAuthorization} from '../../utils/auth';

jest.mock('../mongodbService');
jest.mock('../../utils/rateLimiter');
jest.mock('../../utils/auth');

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (rateLimiter.isAllowed as jest.Mock).mockReturnValue(true);
    (checkAuthorization as jest.Mock).mockResolvedValue(true);
  });

  describe('postLoginData', () => {
    it('should store login data when valid', async () => {
      const data = {
        userId: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        provider: 'google' as const,
        loginTimestamp: Date.now(),
      };

      await postLoginData(data);

      expect(rateLimiter.isAllowed).toHaveBeenCalled();
      expect(checkAuthorization).toHaveBeenCalledWith('user123');
      expect(insertDocument).toHaveBeenCalledWith('logins', expect.objectContaining(data));
    });

    it('should skip when rate limit exceeded', async () => {
      (rateLimiter.isAllowed as jest.Mock).mockReturnValue(false);

      await postLoginData({
        userId: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        provider: 'google' as const,
        loginTimestamp: Date.now(),
      });

      expect(insertDocument).not.toHaveBeenCalled();
    });

    it('should skip when unauthorized', async () => {
      (checkAuthorization as jest.Mock).mockResolvedValue(false);

      await postLoginData({
        userId: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        provider: 'google' as const,
        loginTimestamp: Date.now(),
      });

      expect(insertDocument).not.toHaveBeenCalled();
    });
  });

  describe('postOnboardingData', () => {
    it('should store onboarding data when valid', async () => {
      const data = {
        userId: 'user123',
        selectedPlan: 'pro' as const,
        skipped: false,
        timestamp: Date.now(),
      };

      await postOnboardingData(data);

      expect(rateLimiter.isAllowed).toHaveBeenCalled();
      expect(checkAuthorization).toHaveBeenCalledWith('user123');
      expect(insertDocument).toHaveBeenCalledWith('onboarding', expect.objectContaining(data));
    });
  });

  describe('postMockupGeneration', () => {
    it('should store mockup generation data when valid', async () => {
      const data = {
        userId: 'user123',
        mockupId: 'mockup123',
        productType: 'T-Shirt',
        productId: 'tshirt',
        promptHint: 'a premium cotton t-shirt',
        timestamp: Date.now(),
        logoUploaded: true,
      };

      await postMockupGeneration(data);

      expect(rateLimiter.isAllowed).toHaveBeenCalled();
      expect(checkAuthorization).toHaveBeenCalledWith('user123');
      expect(insertDocument).toHaveBeenCalledWith('mockup_generations', expect.objectContaining(data));
    });
  });

  describe('postMockupEdit', () => {
    it('should store mockup edit data when valid', async () => {
      const data = {
        userId: 'user123',
        mockupId: 'mockup123',
        editPrompt: 'Add a retro filter',
        timestamp: Date.now(),
        isRegeneration: false,
      };

      await postMockupEdit(data);

      expect(rateLimiter.isAllowed).toHaveBeenCalled();
      expect(checkAuthorization).toHaveBeenCalledWith('user123');
      expect(insertDocument).toHaveBeenCalledWith('mockup_edits', expect.objectContaining(data));
    });
  });

  describe('postMockupExport', () => {
    it('should store mockup export data when valid', async () => {
      const data = {
        userId: 'user123',
        mockupId: 'mockup123',
        exportTimestamp: Date.now(),
        exportPath: '/path/to/file.png',
      };

      await postMockupExport(data);

      expect(rateLimiter.isAllowed).toHaveBeenCalled();
      expect(checkAuthorization).toHaveBeenCalledWith('user123');
      expect(insertDocument).toHaveBeenCalledWith('mockup_exports', expect.objectContaining(data));
    });
  });
});

