/**
 * Input Validation & Sanitization
 * Uses Zod for schema validation
 */

import {z} from 'zod';

// ============================================================================
// Login Validation
// ============================================================================

export const LoginDataSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  provider: z.enum(['google', 'apple'], {
    errorMap: () => ({message: 'Invalid provider'}),
  }),
  loginTimestamp: z.number().positive(),
  deviceInfo: z
    .object({
      platform: z.string(),
      osVersion: z.string().optional(),
    })
    .optional(),
});

export type LoginData = z.infer<typeof LoginDataSchema>;

// ============================================================================
// Onboarding Validation
// ============================================================================

export const OnboardingDataSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  selectedPlan: z.enum(['free', 'pro']),
  skipped: z.boolean(),
  timestamp: z.number().positive(),
  trialInfo: z
    .object({
      started: z.boolean(),
      startDate: z.number().positive().optional(),
    })
    .optional(),
});

export type OnboardingData = z.infer<typeof OnboardingDataSchema>;

// ============================================================================
// Mockup Generation Validation
// ============================================================================

export const MockupGenerationDataSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  mockupId: z.string().min(1, 'Mockup ID is required'),
  productType: z.string().min(1).max(100),
  productId: z.string().min(1),
  promptHint: z.string().max(500, 'Prompt too long'),
  timestamp: z.number().positive(),
  logoUploaded: z.boolean(),
});

export type MockupGenerationData = z.infer<typeof MockupGenerationDataSchema>;

// ============================================================================
// Mockup Edit Validation
// ============================================================================

export const MockupEditDataSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  mockupId: z.string().min(1, 'Mockup ID is required'),
  editPrompt: z
    .string()
    .min(1, 'Edit prompt is required')
    .max(500, 'Edit prompt too long')
    .refine(
      (val) => {
        // Sanitize: remove potential script tags and dangerous patterns
        const dangerousPatterns = [
          /<script/i,
          /javascript:/i,
          /on\w+\s*=/i,
          /eval\(/i,
          /expression\(/i,
        ];
        return !dangerousPatterns.some((pattern) => pattern.test(val));
      },
      {message: 'Edit prompt contains invalid characters'}
    ),
  timestamp: z.number().positive(),
  isRegeneration: z.boolean(),
});

export type MockupEditData = z.infer<typeof MockupEditDataSchema>;

// ============================================================================
// Mockup Export Validation
// ============================================================================

export const MockupExportDataSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  mockupId: z.string().min(1, 'Mockup ID is required'),
  exportTimestamp: z.number().positive(),
  exportPath: z.string().max(500).optional(),
});

export type MockupExportData = z.infer<typeof MockupExportDataSchema>;

// ============================================================================
// Image Upload Validation
// ============================================================================

export const ImageUploadSchema = z.object({
  base64: z
    .string()
    .min(100, 'Image data too short')
    .max(10 * 1024 * 1024, 'Image too large (max 10MB)'), // 10MB limit
  mimeType: z.enum(['image/png', 'image/jpeg', 'image/jpg']),
});

// ============================================================================
// Sanitization Helpers
// ============================================================================

/**
 * Sanitize string input
 */
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 1000); // Max length
};

/**
 * Validate and sanitize user input
 */
export const validateAndSanitize = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {success: true; data: T} | {success: false; error: string} => {
  try {
    const result = schema.safeParse(data);
    if (result.success) {
      return {success: true, data: result.data};
    } else {
      const errors = result.error.errors.map((e) => e.message).join(', ');
      return {success: false, error: errors};
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Validation failed',
    };
  }
};

