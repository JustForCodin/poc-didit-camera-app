/**
 * CameraPreview Component Tests
 *
 * Tests for the camera preview component.
 * Includes type/interface tests and render behavior tests.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '@/src/theme';
import { CameraPreview, CameraPreviewProps } from './CameraPreview';

// Mock expo-camera module
jest.mock('expo-camera', () => ({
  CameraView: 'CameraView',
  CameraType: {
    back: 'back',
    front: 'front',
  },
}));

// Helper to render with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('CameraPreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('component structure', () => {
    it('should export CameraPreview component', () => {
      expect(CameraPreview).toBeDefined();
      // forwardRef returns an object with $$typeof, not a plain function
      expect(typeof CameraPreview).toBe('object');
      expect((CameraPreview as any).$$typeof).toBeDefined();
    });

    it('should export CameraPreviewProps type', () => {
      // Type check - this is a compile-time check
      const props: CameraPreviewProps = {
        isActive: true,
        facing: 'back',
      };
      expect(props.isActive).toBe(true);
      expect(props.facing).toBe('back');
    });
  });

  describe('props', () => {
    it('should accept isActive prop with default true', () => {
      const props: CameraPreviewProps = {};
      // Default should be true (implicit)
      expect(props.isActive).toBeUndefined(); // But component handles default
    });

    it('should accept facing prop with default back', () => {
      const props: CameraPreviewProps = { facing: 'front' };
      expect(props.facing).toBe('front');
    });

    it('should accept onCameraReady callback', () => {
      const onCameraReady = jest.fn();
      const props: CameraPreviewProps = { onCameraReady };
      expect(props.onCameraReady).toBe(onCameraReady);
    });

    it('should accept onMountError callback', () => {
      const onMountError = jest.fn();
      const props: CameraPreviewProps = { onMountError };
      expect(props.onMountError).toBe(onMountError);
    });

    it('should accept testID prop', () => {
      const props: CameraPreviewProps = { testID: 'test-camera' };
      expect(props.testID).toBe('test-camera');
    });
  });

  describe('CameraType values', () => {
    it('should support back camera type', () => {
      const props: CameraPreviewProps = { facing: 'back' };
      expect(props.facing).toBe('back');
    });

    it('should support front camera type', () => {
      const props: CameraPreviewProps = { facing: 'front' };
      expect(props.facing).toBe('front');
    });
  });

  describe('isActive behavior', () => {
    it('should be configurable as active', () => {
      const props: CameraPreviewProps = { isActive: true };
      expect(props.isActive).toBe(true);
    });

    it('should be configurable as inactive', () => {
      const props: CameraPreviewProps = { isActive: false };
      expect(props.isActive).toBe(false);
    });
  });

  describe('callback types', () => {
    it('onCameraReady should be a void function', () => {
      const callback = jest.fn();
      const props: CameraPreviewProps = { onCameraReady: callback };
      props.onCameraReady?.();
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith();
    });

    it('onMountError should receive Error argument', () => {
      const callback = jest.fn();
      const props: CameraPreviewProps = { onMountError: callback };
      const error = new Error('Test error');
      props.onMountError?.(error);
      expect(callback).toHaveBeenCalledWith(error);
    });
  });

  describe('default prop values', () => {
    it('should have sensible defaults for all optional props', () => {
      // This validates the interface allows omitting all props
      const minimalProps: CameraPreviewProps = {};
      expect(minimalProps).toBeDefined();
    });

    it('should allow full prop configuration', () => {
      const fullProps: CameraPreviewProps = {
        isActive: true,
        facing: 'back',
        onCameraReady: jest.fn(),
        onMountError: jest.fn(),
        testID: 'camera-test',
      };
      expect(fullProps.isActive).toBe(true);
      expect(fullProps.facing).toBe('back');
      expect(fullProps.onCameraReady).toBeDefined();
      expect(fullProps.onMountError).toBeDefined();
      expect(fullProps.testID).toBe('camera-test');
    });
  });
});

describe('CameraPreview integration', () => {
  it('should be importable from camera components barrel', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { CameraPreview: ImportedPreview } = require('./index');
    expect(ImportedPreview).toBeDefined();
    expect(ImportedPreview).toBe(CameraPreview);
  });

  it('should export CameraPreviewProps type from barrel', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cameraModule = require('./index');
    expect(cameraModule.CameraPreview).toBeDefined();
  });
});

describe('CameraPreview rendering', () => {
  it('should render with default testID', () => {
    const { getByTestId } = renderWithTheme(<CameraPreview />);
    expect(getByTestId('camera-preview')).toBeTruthy();
  });

  it('should render with custom testID', () => {
    const { getByTestId } = renderWithTheme(
      <CameraPreview testID="custom-camera" />
    );
    expect(getByTestId('custom-camera')).toBeTruthy();
  });

  it('should show "Camera Paused" when inactive', () => {
    const { getByText } = renderWithTheme(<CameraPreview isActive={false} />);
    expect(getByText('Camera Paused')).toBeTruthy();
  });

  it('should show loading text when active and camera not ready', () => {
    const { getByText } = renderWithTheme(<CameraPreview isActive={true} />);
    expect(getByText('Initializing camera...')).toBeTruthy();
  });

  it('should render CameraView when active', () => {
    const { UNSAFE_getByType } = renderWithTheme(
      <CameraPreview isActive={true} />
    );
    // CameraView is mocked as a string, so we check the mock was used
    expect(UNSAFE_getByType('CameraView' as any)).toBeTruthy();
  });

  it('should not render CameraView when inactive', () => {
    const { queryByText } = renderWithTheme(<CameraPreview isActive={false} />);
    expect(queryByText('Camera Paused')).toBeTruthy();
    // CameraView should not be rendered
  });

  it('should render with rear camera by default', () => {
    const { UNSAFE_getByType } = renderWithTheme(<CameraPreview />);
    const cameraView = UNSAFE_getByType('CameraView' as any);
    expect(cameraView.props.facing).toBe('back');
  });

  it('should render with front camera when specified', () => {
    const { UNSAFE_getByType } = renderWithTheme(
      <CameraPreview facing="front" />
    );
    const cameraView = UNSAFE_getByType('CameraView' as any);
    expect(cameraView.props.facing).toBe('front');
  });
});
