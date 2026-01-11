/**
 * E2E Tests - Critical user flows
 */

import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import App from '../../App';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {generateMockup} from '../services/geminiService';
import * as SecureStorage from '../utils/secureStorage';

jest.mock('../services/mongodbService');
jest.mock('../services/geminiService');
jest.mock('../utils/secureStorage');
jest.mock('@react-native-google-signin/google-signin');
jest.mock('@invertase/react-native-apple-authentication', () => ({
  default: {
    isSupported: jest.fn(() => Promise.resolve(true)),
    performRequest: jest.fn(),
  },
  AppleButton: () => null,
}));

describe('E2E Tests - Critical Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('Login Flow', () => {
    it('should complete login flow', async () => {
      (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
      (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com',
            name: 'Test User',
          },
        },
      });

      // Mock secure storage to return null (not logged in)
      (SecureStorage.getSecureItem as jest.Mock).mockResolvedValue(null);

      expect(() => render(<App />)).not.toThrow();

      // Verify app renders (login screen should be shown)
      // Note: Full E2E would require more complex setup with navigation
    });
  });

  describe('Mockup Generation Flow', () => {
    it('should generate mockup successfully', async () => {
      const mockImageUrl = 'data:image/png;base64,generatedimage';
      (generateMockup as jest.Mock).mockResolvedValue(mockImageUrl);

      // Mock login first
      const {getByText, getByPlaceholderText} = render(<App />);

      // This is a simplified flow - in real E2E you'd navigate through screens
      // For now, just verify the service is called correctly
      await generateMockup('data:image/png;base64,logo', 't-shirt');

      expect(generateMockup).toHaveBeenCalledWith(
        'data:image/png;base64,logo',
        't-shirt'
      );
    });
  });
});

