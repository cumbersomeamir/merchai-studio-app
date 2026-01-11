/**
 * Unit Tests - Secure Storage
 */

import * as Keychain from 'react-native-keychain';
import {
  setSecureItem,
  getSecureItem,
  removeSecureItem,
  isSecureStorageAvailable,
} from '../secureStorage';

jest.mock('react-native-keychain');

describe('Secure Storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setSecureItem', () => {
    it('should store item securely', async () => {
      (Keychain.setInternetCredentials as jest.Mock).mockResolvedValue(undefined);

      await setSecureItem('test_key', 'test_value');

      expect(Keychain.setInternetCredentials).toHaveBeenCalledWith(
        'com.merchaistudio.secure.test_key',
        'test_key',
        'test_value'
      );
    });

    it('should handle errors gracefully', async () => {
      (Keychain.setInternetCredentials as jest.Mock).mockRejectedValue(
        new Error('Storage failed')
      );

      await expect(setSecureItem('test_key', 'test_value')).rejects.toThrow();
    });
  });

  describe('getSecureItem', () => {
    it('should retrieve stored item', async () => {
      (Keychain.getInternetCredentials as jest.Mock).mockResolvedValue({
        username: 'test_key',
        password: 'test_value',
      });

      const result = await getSecureItem('test_key');
      expect(result).toBe('test_value');
    });

    it('should return null if item not found', async () => {
      (Keychain.getInternetCredentials as jest.Mock).mockResolvedValue(null);

      const result = await getSecureItem('test_key');
      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      (Keychain.getInternetCredentials as jest.Mock).mockRejectedValue(
        new Error('Retrieval failed')
      );

      const result = await getSecureItem('test_key');
      expect(result).toBeNull();
    });
  });

  describe('removeSecureItem', () => {
    it('should remove stored item', async () => {
      (Keychain.resetInternetCredentials as jest.Mock).mockResolvedValue(undefined);

      await removeSecureItem('test_key');

      expect(Keychain.resetInternetCredentials).toHaveBeenCalledWith(
        'com.merchaistudio.secure.test_key'
      );
    });
  });

  describe('isSecureStorageAvailable', () => {
    it('should return true if keychain is available', async () => {
      (Keychain.getSupportedBiometryType as jest.Mock).mockResolvedValue('FaceID');

      const result = await isSecureStorageAvailable();
      expect(result).toBe(true);
    });

    it('should return false if keychain is not available', async () => {
      (Keychain.getSupportedBiometryType as jest.Mock).mockRejectedValue(
        new Error('Not available')
      );

      const result = await isSecureStorageAvailable();
      expect(result).toBe(false);
    });
  });
});

