/**
 * Authentication & Authorization Utilities
 * Handles token management, refresh tokens, and authorization checks
 */

import {getSecureItem, setSecureItem, removeSecureItem} from './secureStorage';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';
const USER_ID_KEY = 'user_id';

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  userId: string;
}

/**
 * Store authentication tokens securely
 */
export const storeTokens = async (tokenData: TokenData): Promise<void> => {
  const expiryTime = Date.now() + tokenData.expiresIn * 1000;
  
  await Promise.all([
    setSecureItem(ACCESS_TOKEN_KEY, tokenData.accessToken),
    setSecureItem(REFRESH_TOKEN_KEY, tokenData.refreshToken),
    setSecureItem(TOKEN_EXPIRY_KEY, expiryTime.toString()),
    setSecureItem(USER_ID_KEY, tokenData.userId),
  ]);
};

/**
 * Get access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  return await getSecureItem(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token
 */
export const getRefreshToken = async (): Promise<string | null> => {
  return await getSecureItem(REFRESH_TOKEN_KEY);
};

/**
 * Get current user ID
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  return await getSecureItem(USER_ID_KEY);
};

/**
 * Check if token is expired
 */
export const isTokenExpired = async (): Promise<boolean> => {
  const expiryStr = await getSecureItem(TOKEN_EXPIRY_KEY);
  if (!expiryStr) return true;
  
  const expiry = parseInt(expiryStr, 10);
  return Date.now() >= expiry;
};

/**
 * Rotate refresh token (for token rotation)
 */
export const rotateRefreshToken = async (
  newAccessToken: string,
  newRefreshToken: string,
  expiresIn: number
): Promise<void> => {
  await storeTokens({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn,
    userId: (await getCurrentUserId()) || '',
  });
};

/**
 * Clear all authentication data
 */
export const clearAuth = async (): Promise<void> => {
  await Promise.all([
    removeSecureItem(ACCESS_TOKEN_KEY),
    removeSecureItem(REFRESH_TOKEN_KEY),
    removeSecureItem(TOKEN_EXPIRY_KEY),
    removeSecureItem(USER_ID_KEY),
  ]);
};

/**
 * Check authorization - verify user has permission
 */
export const checkAuthorization = async (
  userId: string,
  requiredRole?: string
): Promise<boolean> => {
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) return false;
  
  // Basic check: user must match
  if (currentUserId !== userId) return false;
  
  // Additional role-based checks can be added here
  // For now, just verify user matches
  
  return true;
};

