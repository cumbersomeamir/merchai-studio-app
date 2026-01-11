/**
 * API Service - POST requests to store user data
 * Includes validation, rate limiting, and authorization
 */

import {insertDocument} from './mongodbService';
import {
  validateAndSanitize,
  LoginDataSchema,
  OnboardingDataSchema,
  MockupGenerationDataSchema,
  MockupEditDataSchema,
  MockupExportDataSchema,
} from '../utils/validation';
import {rateLimiter, RATE_LIMITS} from '../utils/rateLimiter';
import {checkAuthorization, getCurrentUserId} from '../utils/auth';

// ============================================================================
// 1. LOGIN SCHEMA & API
// ============================================================================

export interface LoginData {
  userId: string;
  email: string;
  name: string;
  provider: 'google' | 'apple';
  loginTimestamp: number;
  deviceInfo?: {
    platform: string;
    osVersion?: string;
  };
}

/**
 * Store login data
 */
export const postLoginData = async (data: LoginData): Promise<void> => {
  // Rate limiting
  const rateLimitKey = `login_${data.userId}`;
  if (!rateLimiter.isAllowed(rateLimitKey, RATE_LIMITS.LOGIN)) {
    console.warn('⚠️ Login rate limit exceeded');
    return;
  }

  // Validation
  const validation = validateAndSanitize(LoginDataSchema, data);
  if (!validation.success) {
    console.error('❌ Login data validation failed:', validation.error);
    return;
  }

  // Authorization check
  const isAuthorized = await checkAuthorization(data.userId);
  if (!isAuthorized) {
    console.error('❌ Unauthorized login attempt');
    return;
  }

  await insertDocument<LoginData>('logins', validation.data);
};

// ============================================================================
// 2. ONBOARDING/PRICING CHOICES SCHEMA & API
// ============================================================================

export interface OnboardingData {
  userId: string;
  selectedPlan: 'free' | 'pro';
  skipped: boolean;
  timestamp: number;
  trialInfo?: {
    started: boolean;
    startDate?: number;
  };
}

/**
 * Store onboarding/pricing choices
 */
export const postOnboardingData = async (
  data: OnboardingData
): Promise<void> => {
  // Rate limiting
  const rateLimitKey = `onboarding_${data.userId}`;
  if (!rateLimiter.isAllowed(rateLimitKey, RATE_LIMITS.API_CALL)) {
    console.warn('⚠️ Onboarding rate limit exceeded');
    return;
  }

  // Validation
  const validation = validateAndSanitize(OnboardingDataSchema, data);
  if (!validation.success) {
    console.error('❌ Onboarding data validation failed:', validation.error);
    return;
  }

  // Authorization check
  const isAuthorized = await checkAuthorization(data.userId);
  if (!isAuthorized) {
    console.error('❌ Unauthorized onboarding attempt');
    return;
  }

  await insertDocument<OnboardingData>('onboarding', validation.data);
};

// ============================================================================
// 3. MAIN APP DATA SCHEMA & API
// ============================================================================

export interface MockupGenerationData {
  userId: string;
  mockupId: string;
  productType: string;
  productId: string;
  promptHint: string;
  timestamp: number;
  logoUploaded: boolean;
}

export interface MockupEditData {
  userId: string;
  mockupId: string;
  editPrompt: string;
  timestamp: number;
  isRegeneration: boolean;
}

export interface MockupExportData {
  userId: string;
  mockupId: string;
  exportTimestamp: number;
  exportPath?: string;
}

/**
 * Store mockup generation data
 */
export const postMockupGeneration = async (
  data: MockupGenerationData
): Promise<void> => {
  // Rate limiting
  const rateLimitKey = `mockup_gen_${data.userId}`;
  if (!rateLimiter.isAllowed(rateLimitKey, RATE_LIMITS.MOCKUP_GENERATION)) {
    console.warn('⚠️ Mockup generation rate limit exceeded');
    return;
  }

  // Validation
  const validation = validateAndSanitize(MockupGenerationDataSchema, data);
  if (!validation.success) {
    console.error('❌ Mockup generation data validation failed:', validation.error);
    return;
  }

  // Authorization check
  const isAuthorized = await checkAuthorization(data.userId);
  if (!isAuthorized) {
    console.error('❌ Unauthorized mockup generation attempt');
    return;
  }

  await insertDocument<MockupGenerationData>('mockup_generations', validation.data);
};

/**
 * Store mockup edit data
 */
export const postMockupEdit = async (data: MockupEditData): Promise<void> => {
  // Rate limiting
  const rateLimitKey = `mockup_edit_${data.userId}`;
  if (!rateLimiter.isAllowed(rateLimitKey, RATE_LIMITS.MOCKUP_EDIT)) {
    console.warn('⚠️ Mockup edit rate limit exceeded');
    return;
  }

  // Validation
  const validation = validateAndSanitize(MockupEditDataSchema, data);
  if (!validation.success) {
    console.error('❌ Mockup edit data validation failed:', validation.error);
    return;
  }

  // Authorization check
  const isAuthorized = await checkAuthorization(data.userId);
  if (!isAuthorized) {
    console.error('❌ Unauthorized mockup edit attempt');
    return;
  }

  await insertDocument<MockupEditData>('mockup_edits', validation.data);
};

/**
 * Store mockup export data
 */
export const postMockupExport = async (data: MockupExportData): Promise<void> => {
  // Rate limiting
  const rateLimitKey = `mockup_export_${data.userId}`;
  if (!rateLimiter.isAllowed(rateLimitKey, RATE_LIMITS.MOCKUP_EXPORT)) {
    console.warn('⚠️ Mockup export rate limit exceeded');
    return;
  }

  // Validation
  const validation = validateAndSanitize(MockupExportDataSchema, data);
  if (!validation.success) {
    console.error('❌ Mockup export data validation failed:', validation.error);
    return;
  }

  // Authorization check
  const isAuthorized = await checkAuthorization(data.userId);
  if (!isAuthorized) {
    console.error('❌ Unauthorized mockup export attempt');
    return;
  }

  await insertDocument<MockupExportData>('mockup_exports', validation.data);
};

