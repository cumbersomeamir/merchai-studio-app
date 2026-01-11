/**
 * Smoke Tests - App boots and health checks
 */

import React from 'react';
import {render} from '@testing-library/react-native';
import App from '../../App';
import {connectToMongoDB} from '../services/mongodbService';

jest.mock('../services/mongodbService');
jest.mock('../screens/LoginScreen', () => {
  const React = require('react');
  return function MockLoginScreen() {
    return require('react-native').View;
  };
});

describe('Smoke Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (connectToMongoDB as jest.Mock).mockResolvedValue(undefined);
  });

  it('should render app without crashing', () => {
    expect(() => render(<App />)).not.toThrow();
  });

  it('should initialize MongoDB on mount', () => {
    render(<App />);
    expect(connectToMongoDB).toHaveBeenCalled();
  });

  it('should handle MongoDB connection failure gracefully', () => {
    (connectToMongoDB as jest.Mock).mockRejectedValue(new Error('Connection failed'));

    expect(() => render(<App />)).not.toThrow();
  });
});

