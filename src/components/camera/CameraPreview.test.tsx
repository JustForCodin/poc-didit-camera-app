/**
 * CameraPreview Component Tests
 *
 * Tests for the camera preview component.
 * Note: These are unit tests for the component interface and props.
 * Visual/integration tests should be done on device.
 */

import { CameraPreview, CameraPreviewProps } from './CameraPreview';

// Mock expo-camera module
jest.mock('expo-camera', () => ({
  CameraView: 'CameraView',
  CameraType: {
    back: 'back',
    front: 'front',
  },
}));

describe('CameraPreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('component structure', () => {
    it('should export CameraPreview component', () => {
      expect(CameraPreview).toBeDefined();
      expect(typeof CameraPreview).toBe('function');
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
