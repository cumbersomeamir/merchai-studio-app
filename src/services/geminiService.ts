/**
 * Gemini AI Service for generating and editing merchandise mockups
 * Uses Google Gemini API via REST API (compatible with React Native)
 */

import {GEMINI_API_KEY} from '../config/env';
import {rateLimiter, RATE_LIMITS} from '../utils/rateLimiter';
import {sanitizeString} from '../utils/validation';

// Using Gemini 2.5 Flash Image - EXACT model from original repo
// DO NOT CHANGE THIS - using the exact same model name as original
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

interface GeminiPart {
  inlineData?: {
    mimeType: string;
    data: string;
  };
  text?: string;
}

interface GeminiRequest {
  contents: Array<{
    parts: GeminiPart[];
  }>;
}

/**
 * Get AI client configuration
 */
const getAIConfig = () => {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set. Please set it in your environment variables.');
  }
  return {
    apiKey: GEMINI_API_KEY,
    apiUrl: GEMINI_API_URL,
  };
};

/**
 * Generate a mockup image by placing a logo on a product
 */
export const generateMockup = async (
  logoBase64: string,
  productPrompt: string
): Promise<string> => {
  // Rate limiting
  const rateLimitKey = 'gemini_generate';
  if (!rateLimiter.isAllowed(rateLimitKey, RATE_LIMITS.MOCKUP_GENERATION)) {
    throw new Error('Rate limit exceeded. Please wait a moment and try again.');
  }

  // Sanitize prompt
  const sanitizedPrompt = sanitizeString(productPrompt);
  if (sanitizedPrompt.length < 1) {
    throw new Error('Invalid product prompt');
  }

  const config = getAIConfig();
  
  // Clean base64 string (remove data URL prefix if present)
  const base64Data = logoBase64.includes(',') 
    ? logoBase64.split(',')[1] 
    : logoBase64;

  // Validate base64 data size (10MB limit)
  if (base64Data.length > 10 * 1024 * 1024) {
    throw new Error('Image too large. Maximum size is 10MB.');
  }
  
  const requestBody: GeminiRequest = {
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Data,
            },
          },
          {
            text: `Create a professional, high-end studio product photograph of ${sanitizedPrompt}. 
Place the provided logo prominently and realistically on the product. 
Use cinematic lighting and a clean, neutral background.
The logo should look like it is physically printed on the material.`,
          },
        ],
      },
    ],
  };

    try {
      const response = await fetch(
        `${config.apiUrl}?key=${config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
        
        // Check for quota exceeded error
        if (errorMessage.includes('quota') || errorMessage.includes('Quota') || errorMessage.includes('exceeded')) {
          throw new Error(
            'API quota exceeded. Please wait a few minutes and try again, or check your Google Cloud billing plan at https://console.cloud.google.com/'
          );
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // LOG FULL RESPONSE - DO NOT REMOVE
      const fullResponse = JSON.stringify(data, null, 2);
      console.log('=== FULL API RESPONSE ===');
      console.log(fullResponse);
      console.log('=== END API RESPONSE ===');
      
      // Store response in a way that can be accessed from frontend
      (global as any).lastGeminiResponse = fullResponse;
      
      // Extract image from response - try multiple possible structures
      let imageData = null;
      
      // Try standard structure: data.candidates[0].content.parts[].inlineData
      const candidates = data.candidates || [];
      if (candidates.length > 0) {
        const parts = candidates[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            imageData = part.inlineData.data;
            break;
          }
        }
      }
      
      // Try alternative structure: data.parts[].inlineData
      if (!imageData && data.parts) {
        for (const part of data.parts) {
          if (part.inlineData && part.inlineData.data) {
            imageData = part.inlineData.data;
            break;
          }
        }
      }
      
      // Try another structure: data.content.parts[].inlineData
      if (!imageData && data.content && data.content.parts) {
        for (const part of data.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            imageData = part.inlineData.data;
            break;
          }
        }
      }
      
      if (imageData) {
        return `data:image/png;base64,${imageData}`;
      }

      // If no image found, throw error with full response
      throw new Error(`NO_IMAGE_IN_RESPONSE:${fullResponse}`);
  } catch (error: any) {
    console.error('Error generating mockup:', error);
    throw new Error(error.message || 'Failed to generate mockup');
  }
};

/**
 * Edit an existing mockup image based on a text prompt
 */
export const editMockup = async (
  imageBase64: string,
  editPrompt: string
): Promise<string> => {
  // Rate limiting
  const rateLimitKey = 'gemini_edit';
  if (!rateLimiter.isAllowed(rateLimitKey, RATE_LIMITS.MOCKUP_EDIT)) {
    throw new Error('Rate limit exceeded. Please wait a moment and try again.');
  }

  // Sanitize prompt
  const sanitizedPrompt = sanitizeString(editPrompt);
  if (sanitizedPrompt.length < 1 || sanitizedPrompt.length > 500) {
    throw new Error('Invalid edit prompt. Must be between 1 and 500 characters.');
  }

  const config = getAIConfig();
  
  // Clean base64 string
  const base64Data = imageBase64.includes(',') 
    ? imageBase64.split(',')[1] 
    : imageBase64;

  // Validate base64 data size (10MB limit)
  if (base64Data.length > 10 * 1024 * 1024) {
    throw new Error('Image too large. Maximum size is 10MB.');
  }
  
  const requestBody: GeminiRequest = {
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Data,
            },
          },
          {
            text: `Modify this image based on the following instruction: "${sanitizedPrompt}". 
Maintain the overall composition and the integrity of the product and logo, but apply the requested changes accurately.`,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(
      `${config.apiUrl}?key=${config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
      
      // Check for quota exceeded error
      if (errorMessage.includes('quota') || errorMessage.includes('Quota') || errorMessage.includes('exceeded')) {
        throw new Error(
          'API quota exceeded. Please wait a few minutes and try again, or check your Google Cloud billing plan at https://console.cloud.google.com/'
        );
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // LOG FULL RESPONSE - DO NOT REMOVE
    const fullResponse = JSON.stringify(data, null, 2);
    console.log('=== FULL EDIT API RESPONSE ===');
    console.log(fullResponse);
    console.log('=== END EDIT API RESPONSE ===');
    
      // Store response in a way that can be accessed from frontend
      (global as any).lastGeminiEditResponse = fullResponse;
    
    // Extract image from response - try multiple possible structures
    let imageData = null;
    
    // Try standard structure
    const candidates = data.candidates || [];
    if (candidates.length > 0) {
      const parts = candidates[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          imageData = part.inlineData.data;
          break;
        }
      }
    }
    
    // Try alternative structures
    if (!imageData && data.parts) {
      for (const part of data.parts) {
        if (part.inlineData && part.inlineData.data) {
          imageData = part.inlineData.data;
          break;
        }
      }
    }
    
    if (!imageData && data.content && data.content.parts) {
      for (const part of data.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          imageData = part.inlineData.data;
          break;
        }
      }
    }
    
    if (imageData) {
      return `data:image/png;base64,${imageData}`;
    }

    // If no image found, throw error with full response
    throw new Error(`NO_IMAGE_IN_EDIT_RESPONSE:${fullResponse}`);
  } catch (error: any) {
    console.error('Error editing mockup:', error);
    throw new Error(error.message || 'Failed to edit mockup');
  }
};

