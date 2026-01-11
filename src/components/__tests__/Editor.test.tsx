/**
 * Unit Tests - Editor Component
 */

import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import Editor from '../Editor';
import {postMockupExport} from '../../services/apiService';

jest.mock('../../services/apiService');
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/path',
  writeFile: jest.fn(() => Promise.resolve()),
}));

describe('Editor Component', () => {
  const mockProps = {
    imageUrl: 'data:image/png;base64,test123',
    onEdit: jest.fn(),
    isEditing: false,
    onExport: jest.fn(),
    mockupId: 'mockup123',
    userId: 'user123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const {getByText, getByPlaceholderText} = render(<Editor {...mockProps} />);

    expect(getByPlaceholderText(/Type instructions to edit/)).toBeTruthy();
    expect(getByText('Apply')).toBeTruthy();
    expect(getByText('💾 Export')).toBeTruthy();
  });

  it('should sanitize input on change', () => {
    const {getByPlaceholderText} = render(<Editor {...mockProps} />);
    const input = getByPlaceholderText(/Type instructions to edit/);

    fireEvent.changeText(input, '<script>alert("xss")</script>Hello');

    expect(input.props.value).not.toContain('<script>');
  });

  it('should limit input to 500 characters', () => {
    const {getByPlaceholderText} = render(<Editor {...mockProps} />);
    const input = getByPlaceholderText(/Type instructions to edit/);

    const longText = 'a'.repeat(600);
    fireEvent.changeText(input, longText);

    expect(input.props.value.length).toBeLessThanOrEqual(500);
  });

  it('should call onEdit with sanitized prompt', () => {
    const {getByPlaceholderText, getByText} = render(<Editor {...mockProps} />);
    const input = getByPlaceholderText(/Type instructions to edit/);
    const applyButton = getByText('Apply');

    fireEvent.changeText(input, 'Add a retro filter');
    fireEvent.press(applyButton);

    expect(mockProps.onEdit).toHaveBeenCalledWith('Add a retro filter');
  });

  it('should handle export', async () => {
    const {getByText} = render(<Editor {...mockProps} />);
    const exportButton = getByText('💾 Export');

    fireEvent.press(exportButton);

    await waitFor(() => {
      expect(postMockupExport).toHaveBeenCalled();
    });
  });

  it('should show loading state when editing', () => {
    const {getByText} = render(<Editor {...mockProps} isEditing={true} />);

    expect(getByText(/AI is remastering/)).toBeTruthy();
  });
});

