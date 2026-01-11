/**
 * Integration Tests - Login Screen
 */

import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

jest.mock('@react-native-google-signin/google-signin');
jest.mock('@invertase/react-native-apple-authentication', () => ({
  default: {
    isSupported: jest.fn(() => Promise.resolve(true)),
    performRequest: jest.fn(),
  },
  AppleButton: () => null,
}));

describe('LoginScreen', () => {
  const mockOnLoginSuccess = jest.fn();
  const mockOnSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
  });

  it('should render correctly', () => {
    const {getByText} = render(
      <LoginScreen onSkip={mockOnSkip} onUpgrade={mockOnLoginSuccess} />
    );

    expect(getByText('MerchAI')).toBeTruthy();
    expect(getByText(/Continue with Google/)).toBeTruthy();
  });

  it('should handle Google sign-in', async () => {
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
      data: {
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
        },
      },
    });

    const {getByText} = render(
      <LoginScreen onSkip={mockOnSkip} onUpgrade={mockOnLoginSuccess} />
    );

    fireEvent.press(getByText(/Continue with Google/));

    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalled();
    });
  });

  it('should handle sign-in cancellation', async () => {
    (GoogleSignin.signIn as jest.Mock).mockRejectedValue({
      code: 'SIGN_IN_CANCELLED',
    });

    const {getByText} = render(
      <LoginScreen onSkip={mockOnSkip} onUpgrade={mockOnLoginSuccess} />
    );

    fireEvent.press(getByText(/Continue with Google/));

    await waitFor(() => {
      expect(mockOnLoginSuccess).not.toHaveBeenCalled();
    });
  });
});

