/**
 * Secure Storage - Uses Keychain/Keystore instead of AsyncStorage
 * Provides secure token storage for React Native
 */

import Keychain from 'react-native-keychain';

const SERVICE_NAME = 'com.merchaistudio.secure';

/**
 * Store secure data (tokens, credentials)
 */
export const setSecureItem = async (key: string, value: string): Promise<void> => {
  try {
    await Keychain.setInternetCredentials(
      `${SERVICE_NAME}.${key}`,
      key,
      value
    );
  } catch (error) {
    console.error(`Error storing secure item ${key}:`, error);
    throw error;
  }
};

/**
 * Get secure data
 */
export const getSecureItem = async (key: string): Promise<string | null> => {
  try {
    const credentials = await Keychain.getInternetCredentials(`${SERVICE_NAME}.${key}`);
    if (credentials) {
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error(`Error getting secure item ${key}:`, error);
    return null;
  }
};

/**
 * Remove secure data
 */
export const removeSecureItem = async (key: string): Promise<void> => {
  try {
    await Keychain.resetInternetCredentials(`${SERVICE_NAME}.${key}`);
  } catch (error) {
    console.error(`Error removing secure item ${key}:`, error);
  }
};

/**
 * Check if secure storage is available
 */
export const isSecureStorageAvailable = async (): Promise<boolean> => {
  try {
    await Keychain.getSupportedBiometryType();
    return true;
  } catch {
    return false;
  }
};

