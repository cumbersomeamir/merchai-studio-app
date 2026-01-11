/**
 * Unit Tests - Authentication Utilities
 */

import {
  storeTokens,
  getAccessToken,
  getRefreshToken,
  getCurrentUserId,
  isTokenExpired,
  clearAuth,
  checkAuthorization,
} from '../auth';
import * as SecureStorage from '../secureStorage';

jest.mock('../secureStorage');

describe('Authentication Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('storeTokens', () => {
    it('should store tokens securely', async () => {
      (SecureStorage.setSecureItem as jest.Mock).mockResolvedValue(undefined);

      await storeTokens({
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123',
        expiresIn: 3600,
        userId: 'user123',
      });

      expect(SecureStorage.setSecureItem).toHaveBeenCalledTimes(4);
    });
  });

  describe('getAccessToken', () => {
    it('should retrieve access token', async () => {
      (SecureStorage.getSecureItem as jest.Mock).mockResolvedValue('access_token_123');

      const token = await getAccessToken();
      expect(token).toBe('access_token_123');
    });
  });

  describe('isTokenExpired', () => {
    it('should return true for expired token', async () => {
      const pastTime = Date.now() - 10000; // 10 seconds ago
      (SecureStorage.getSecureItem as jest.Mock).mockResolvedValue(pastTime.toString());

      const expired = await isTokenExpired();
      expect(expired).toBe(true);
    });

    it('should return false for valid token', async () => {
      const futureTime = Date.now() + 3600000; // 1 hour from now
      (SecureStorage.getSecureItem as jest.Mock).mockResolvedValue(futureTime.toString());

      const expired = await isTokenExpired();
      expect(expired).toBe(false);
    });
  });

  describe('checkAuthorization', () => {
    it('should return true for matching user ID', async () => {
      (SecureStorage.getSecureItem as jest.Mock).mockResolvedValue('user123');

      const authorized = await checkAuthorization('user123');
      expect(authorized).toBe(true);
    });

    it('should return false for non-matching user ID', async () => {
      (SecureStorage.getSecureItem as jest.Mock).mockResolvedValue('user123');

      const authorized = await checkAuthorization('user456');
      expect(authorized).toBe(false);
    });

    it('should return false if no user ID stored', async () => {
      (SecureStorage.getSecureItem as jest.Mock).mockResolvedValue(null);

      const authorized = await checkAuthorization('user123');
      expect(authorized).toBe(false);
    });
  });

  describe('clearAuth', () => {
    it('should clear all authentication data', async () => {
      (SecureStorage.removeSecureItem as jest.Mock).mockResolvedValue(undefined);

      await clearAuth();

      expect(SecureStorage.removeSecureItem).toHaveBeenCalledTimes(4);
    });
  });
});

