/**
 * Jest Setup - Global test configuration
 */

import 'jest-fetch-mock';

// Mock react-native modules
jest.mock('react-native-keychain', () => ({
  setInternetCredentials: jest.fn(() => Promise.resolve()),
  getInternetCredentials: jest.fn(() => Promise.resolve(null)),
  resetInternetCredentials: jest.fn(() => Promise.resolve()),
  getSupportedBiometryType: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn(),
}));

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/path',
  writeFile: jest.fn(() => Promise.resolve()),
  readFile: jest.fn(() => Promise.resolve('mock-data')),
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getCurrentUser: jest.fn(),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

jest.mock('@invertase/react-native-apple-authentication', () => ({
  default: {
    isSupported: jest.fn(() => Promise.resolve(true)),
    performRequest: jest.fn(),
    getCredentialStateForUser: jest.fn(),
    Error: {
      CANCELED: 'CANCELED',
    },
  },
  AppleButton: {
    Style: {WHITE: 'WHITE', BLACK: 'BLACK'},
    Type: {SIGN_IN: 'SIGN_IN', SIGN_UP: 'SIGN_UP'},
  },
  AppleAuthRequestOperation: {
    LOGIN: 'LOGIN',
  },
  AppleAuthRequestScope: {
    EMAIL: 'EMAIL',
    FULL_NAME: 'FULL_NAME',
  },
  AppleAuthCredentialState: {
    AUTHORIZED: 'AUTHORIZED',
  },
}));

// Mock Platform - use a more targeted approach
jest.mock('react-native/Libraries/Utilities/Platform', () => {
  const Platform = jest.requireActual('react-native/Libraries/Utilities/Platform');
  return {
    ...Platform,
    OS: 'ios',
    Version: 15,
    select: jest.fn((dict) => dict.ios),
  };
}, {virtual: true});

// Global fetch mock
global.fetch = jest.fn();

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
