/**
 * useFrameCapture Hook Tests
 *
 * Tests for the useFrameCapture custom hook.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';

import { useFrameCapture } from './useFrameCapture';
import { frameCaptureService } from '@/src/services/camera/capture';
import captureReducer from '@/src/store/slices/captureSlice';
import recordingReducer from '@/src/store/slices/recordingSlice';
import settingsReducer from '@/src/store/slices/settingsSlice';
import authReducer from '@/src/store/slices/authSlice';
import type { CapturedFrame } from '@/src/services/camera/capture';

// Mock the capture service
jest.mock('@/src/services/camera/capture', () => ({
  frameCaptureService: {
    setCameraRef: jest.fn(),
    startCapture: jest.fn(),
    stopCapture: jest.fn(),
    cancelCapture: jest.fn(),
    reset: jest.fn(),
    getFrameCount: jest.fn(),
    getFrames: jest.fn(),
    setOnFrameCaptured: jest.fn(),
    clearFrames: jest.fn(),
  },
  CaptureOptions: {},
  CapturedFrame: {},
}));

// Create a test store
function createTestStore() {
  return configureStore({
    reducer: {
      capture: captureReducer,
      recording: recordingReducer,
      settings: settingsReducer,
      auth: authReducer,
    },
  });
}

// Wrapper component for hooks
function createWrapper(store: ReturnType<typeof createTestStore>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(Provider, { store, children });
  };
}

describe('useFrameCapture', () => {
  let store: ReturnType<typeof createTestStore>;
  let mockCameraRef: React.RefObject<any>;

  const mockCapturedFrames: CapturedFrame[] = [
    {
      frameIndex: 0,
      capturedAt: '2025-01-01T00:00:00.000Z',
      uri: 'file://frame1.jpg',
    },
    {
      frameIndex: 1,
      capturedAt: '2025-01-01T00:00:01.000Z',
      uri: 'file://frame2.jpg',
    },
    {
      frameIndex: 2,
      capturedAt: '2025-01-01T00:00:02.000Z',
      uri: 'file://frame3.jpg',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    store = createTestStore();
    mockCameraRef = { current: { takePictureAsync: jest.fn() } };
    (frameCaptureService.getFrameCount as jest.Mock).mockReturnValue(0);
    (frameCaptureService.getFrames as jest.Mock).mockReturnValue([]);
  });

  describe('initial state', () => {
    it('should return initial capture state', () => {
      const { result } = renderHook(
        () => useFrameCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      expect(result.current.captureState).toBe('idle');
      expect(result.current.isCapturing).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.frameCount).toBe(0);
      expect(result.current.frames).toEqual([]);
      expect(result.current.lastResult).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should set camera ref on mount', () => {
      renderHook(
        () => useFrameCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      expect(frameCaptureService.setCameraRef).toHaveBeenCalledWith(mockCameraRef);
    });
  });

  describe('startCapture', () => {
    it('should call service and update state on success', async () => {
      const startedAt = new Date().toISOString();
      (frameCaptureService.startCapture as jest.Mock).mockResolvedValue({
        success: true,
        data: { startedAt },
      });

      const onCaptureStart = jest.fn();
      const { result } = renderHook(
        () => useFrameCapture({ cameraRef: mockCameraRef, onCaptureStart }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        await result.current.startCapture();
      });

      expect(frameCaptureService.startCapture).toHaveBeenCalled();
      expect(result.current.captureState).toBe('capturing');
      expect(result.current.isCapturing).toBe(true);
      expect(onCaptureStart).toHaveBeenCalled();
    });

    it('should call service and set error on failure', async () => {
      (frameCaptureService.startCapture as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Camera not ready',
      });

      const onCaptureError = jest.fn();
      const { result } = renderHook(
        () => useFrameCapture({ cameraRef: mockCameraRef, onCaptureError }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        await result.current.startCapture();
      });

      expect(result.current.captureState).toBe('error');
      expect(result.current.error).toBe('Camera not ready');
      expect(onCaptureError).toHaveBeenCalledWith('Camera not ready');
    });

    it('should pass options to service', async () => {
      (frameCaptureService.startCapture as jest.Mock).mockResolvedValue({
        success: true,
        data: { startedAt: new Date().toISOString() },
      });

      const { result } = renderHook(
        () => useFrameCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        await result.current.startCapture({ interval: 2000 });
      });

      expect(frameCaptureService.startCapture).toHaveBeenCalledWith({ interval: 2000 });
    });

    it('should transition from starting to capturing', async () => {
      const startedAt = new Date().toISOString();
      (frameCaptureService.startCapture as jest.Mock).mockResolvedValue({
        success: true,
        data: { startedAt },
      });

      const { result } = renderHook(
        () => useFrameCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      // Initial state
      expect(result.current.captureState).toBe('idle');

      // Start capture and verify final state
      await act(async () => {
        await result.current.startCapture();
      });

      // Should be capturing
      expect(result.current.captureState).toBe('capturing');
    });
  });

  describe('stopCapture', () => {
    it('should call service and update state on success', async () => {
      // First start capturing
      (frameCaptureService.startCapture as jest.Mock).mockResolvedValue({
        success: true,
        data: { startedAt: new Date().toISOString() },
      });
      (frameCaptureService.stopCapture as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCapturedFrames,
      });

      const onCaptureStop = jest.fn();
      const { result } = renderHook(
        () => useFrameCapture({ cameraRef: mockCameraRef, onCaptureStop }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        await result.current.startCapture();
      });

      await act(async () => {
        const stopResult = await result.current.stopCapture();
        expect(stopResult).toEqual(mockCapturedFrames);
      });

      expect(frameCaptureService.stopCapture).toHaveBeenCalled();
      expect(result.current.captureState).toBe('idle');
      expect(result.current.isCapturing).toBe(false);
      expect(result.current.lastResult).toEqual(mockCapturedFrames);
      expect(onCaptureStop).toHaveBeenCalledWith(mockCapturedFrames);
    });

    it('should return null and set error on failure', async () => {
      (frameCaptureService.stopCapture as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Stop failed',
      });

      const onCaptureError = jest.fn();
      const { result } = renderHook(
        () => useFrameCapture({ cameraRef: mockCameraRef, onCaptureError }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        const stopResult = await result.current.stopCapture();
        expect(stopResult).toBeNull();
      });

      expect(result.current.error).toBe('Stop failed');
      expect(onCaptureError).toHaveBeenCalledWith('Stop failed');
    });

    it('should transition from stopping to idle', async () => {
      (frameCaptureService.startCapture as jest.Mock).mockResolvedValue({
        success: true,
        data: { startedAt: new Date().toISOString() },
      });
      (frameCaptureService.stopCapture as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCapturedFrames,
      });

      const { result } = renderHook(
        () => useFrameCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        await result.current.startCapture();
      });

      expect(result.current.captureState).toBe('capturing');

      await act(async () => {
        await result.current.stopCapture();
      });

      expect(result.current.captureState).toBe('idle');
    });
  });

  describe('cancelCapture', () => {
    it('should cancel capture and reset state', async () => {
      (frameCaptureService.cancelCapture as jest.Mock).mockResolvedValue({
        success: true,
        data: undefined,
      });

      const { result } = renderHook(
        () => useFrameCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        await result.current.cancelCapture();
      });

      expect(frameCaptureService.cancelCapture).toHaveBeenCalled();
      expect(result.current.captureState).toBe('idle');
      expect(result.current.isCapturing).toBe(false);
    });

    it('should reset frames and frame count', async () => {
      (frameCaptureService.startCapture as jest.Mock).mockResolvedValue({
        success: true,
        data: { startedAt: new Date().toISOString() },
      });
      (frameCaptureService.cancelCapture as jest.Mock).mockResolvedValue({
        success: true,
        data: undefined,
      });

      const { result } = renderHook(
        () => useFrameCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        await result.current.startCapture();
      });

      await act(async () => {
        await result.current.cancelCapture();
      });

      expect(result.current.frames).toEqual([]);
      expect(result.current.frameCount).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset service and Redux state', () => {
      const { result } = renderHook(
        () => useFrameCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      act(() => {
        result.current.reset();
      });

      expect(frameCaptureService.reset).toHaveBeenCalled();
      expect(result.current.captureState).toBe('idle');
    });

    it('should reset all state fields', async () => {
      (frameCaptureService.startCapture as jest.Mock).mockResolvedValue({
        success: true,
        data: { startedAt: new Date().toISOString() },
      });

      const { result } = renderHook(
        () => useFrameCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        await result.current.startCapture();
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.captureState).toBe('idle');
      expect(result.current.isCapturing).toBe(false);
      expect(result.current.frameCount).toBe(0);
      expect(result.current.frames).toEqual([]);
    });
  });

  describe('frame capture callback', () => {
    it('should register callback with service on mount', () => {
      renderHook(
        () => useFrameCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      expect(frameCaptureService.setOnFrameCaptured).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it('should notify onFrameCaptured when service calls callback', async () => {
      const newFrame = mockCapturedFrames[0];
      const onFrameCaptured = jest.fn();

      renderHook(
        () => useFrameCapture({ cameraRef: mockCameraRef, onFrameCaptured }),
        { wrapper: createWrapper(store) }
      );

      // Get the registered callback
      const registeredCallback = (frameCaptureService.setOnFrameCaptured as jest.Mock).mock.calls[0][0];

      // Simulate service calling the callback
      await act(async () => {
        registeredCallback(newFrame);
      });

      expect(onFrameCaptured).toHaveBeenCalledWith(newFrame);
    });

    it('should unregister callback on unmount', () => {
      const { unmount } = renderHook(
        () => useFrameCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      (frameCaptureService.setOnFrameCaptured as jest.Mock).mockClear();

      unmount();

      expect(frameCaptureService.setOnFrameCaptured).toHaveBeenCalledWith(undefined);
    });

    it('should add multiple frames via callback', async () => {
      const onFrameCaptured = jest.fn();

      renderHook(
        () => useFrameCapture({ cameraRef: mockCameraRef, onFrameCaptured }),
        { wrapper: createWrapper(store) }
      );

      // Get the registered callback
      const registeredCallback = (frameCaptureService.setOnFrameCaptured as jest.Mock).mock.calls[0][0];

      // Simulate service calling the callback multiple times
      await act(async () => {
        registeredCallback(mockCapturedFrames[0]);
        registeredCallback(mockCapturedFrames[1]);
      });

      expect(onFrameCaptured).toHaveBeenCalledTimes(2);
      expect(onFrameCaptured).toHaveBeenCalledWith(mockCapturedFrames[0]);
      expect(onFrameCaptured).toHaveBeenCalledWith(mockCapturedFrames[1]);
    });
  });

  describe('return value types', () => {
    it('should return all expected properties', () => {
      const { result } = renderHook(
        () => useFrameCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      expect(result.current).toHaveProperty('captureState');
      expect(result.current).toHaveProperty('isCapturing');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('frameCount');
      expect(result.current).toHaveProperty('frames');
      expect(result.current).toHaveProperty('lastResult');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('startCapture');
      expect(result.current).toHaveProperty('stopCapture');
      expect(result.current).toHaveProperty('cancelCapture');
      expect(result.current).toHaveProperty('reset');
    });

    it('should have functions that are callable', () => {
      const { result } = renderHook(
        () => useFrameCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      expect(typeof result.current.startCapture).toBe('function');
      expect(typeof result.current.stopCapture).toBe('function');
      expect(typeof result.current.cancelCapture).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });
});
