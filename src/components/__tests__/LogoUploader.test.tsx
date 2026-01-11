/**
 * Unit Tests - LogoUploader Component
 */

import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import LogoUploader from '../LogoUploader';

jest.mock('react-native-image-picker');

describe('LogoUploader Component', () => {
  const mockOnUpload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const {getByText} = render(
      <LogoUploader onUpload={mockOnUpload} currentLogo={null} />
    );

    expect(getByText(/Tap to change logo/)).toBeTruthy();
  });

  it('should handle image selection', async () => {
    (launchImageLibrary as jest.Mock).mockImplementation((options, callback) => {
      callback({
        assets: [
          {
            base64: 'testbase64data',
            type: 'image/png',
            fileSize: 1024,
          },
        ],
      });
    });

    const {getByText} = render(
      <LogoUploader onUpload={mockOnUpload} currentLogo={null} />
    );

    fireEvent.press(getByText(/Tap to change logo/));

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalled();
    });
  });

  it('should reject images over 10MB', async () => {
    (launchImageLibrary as jest.Mock).mockImplementation((options, callback) => {
      callback({
        assets: [
          {
            base64: 'test',
            type: 'image/png',
            fileSize: 11 * 1024 * 1024, // 11MB
          },
        ],
      });
    });

    const {getByText} = render(
      <LogoUploader onUpload={mockOnUpload} currentLogo={null} />
    );

    fireEvent.press(getByText(/Tap to change logo/));

    await waitFor(() => {
      expect(mockOnUpload).not.toHaveBeenCalled();
    });
  });

  it('should reject invalid MIME types', async () => {
    (launchImageLibrary as jest.Mock).mockImplementation((options, callback) => {
      callback({
        assets: [
          {
            base64: 'test',
            type: 'image/gif',
            fileSize: 1024,
          },
        ],
      });
    });

    const {getByText} = render(
      <LogoUploader onUpload={mockOnUpload} currentLogo={null} />
    );

    fireEvent.press(getByText(/Tap to change logo/));

    await waitFor(() => {
      expect(mockOnUpload).not.toHaveBeenCalled();
    });
  });
});

