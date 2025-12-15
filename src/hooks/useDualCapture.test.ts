/**
 * useDualCapture Hook Tests
 *
 * Tests for the useDualCapture custom hook.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';

import { useDualCapture } from './useDualCapture';
import { dualCaptureService } from '@/src/services/camera/dualCapture';
import dualCaptureReducer from '@/src/store/slices/dualCaptureSlice';
import captureReducer from '@/src/store/slices/captureSlice';
import recordingReducer from '@/src/store/slices/recordingSlice';
import settingsReducer from '@/src/store/slices/settingsSlice';
import authReducer from '@/src/store/slices/authSlice';
import type { DualCaptureSession } from '@/src/services/camera/dualCapture';
import type { CapturedFrame } from '@/src/services/camera/capture';

// Mock the dual capture service
jest.mock('@/src/services/camera/dualCapture', () => ({
  dualCaptureService: {
    setCameraRef: jest.fn(),
    startDualCapture: jest.fn(),
    stopDualCapture: jest.fn(),
    cancelDualCapture: jest.fn(),
    reset: jest.fn(),
    getFrameCount: jest.fn(),
    getRecordingState: jest.fn(),
    getCaptureState: jest.fn(),
    setOnFrameCaptured: jest.fn(),
  },
}));

// Create a test store
function createTestStore() {
  return configureStore({
    reducer: {
      dualCapture: dualCaptureReducer,
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

describe('useDualCapture', () => {
  let store: ReturnType<typeof createTestStore>;
  let mockCameraRef: React.RefObject<any>;

  const mockSession: DualCaptureSession = {
    videoUri: 'file://video.mp4',
    frames: [
      { frameIndex: 0, capturedAt: '2025-01-01T00:00:00.000Z', uri: 'file://frame1.jpg' },
      { frameIndex: 1, capturedAt: '2025-01-01T00:00:01.000Z', uri: 'file://frame2.jpg' },
    ],
    durationMs: 5000,
    startedAt: '2025-01-01T00:00:00.000Z',
    stoppedAt: '2025-01-01T00:00:05.000Z',
    videoFileSize: 1024000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();
    mockCameraRef = { current: {} } as any;

    // Setup default mock implementations
    (dualCaptureService.getRecordingState as jest.Mock).mockReturnValue('idle');
    (dualCaptureService.getCaptureState as jest.Mock).mockReturnValue('idle');
    (dualCaptureService.getFrameCount as jest.Mock).mockReturnValue(0);
    (dualCaptureService.startDualCapture as jest.Mock).mockResolvedValue({
      success: true,
      data: { startedAt: '2025-01-01T00:00:00.000Z' },
    });
    (dualCaptureService.stopDualCapture as jest.Mock).mockResolvedValue({
      success: true,
      data: mockSession,
    });
    (dualCaptureService.cancelDualCapture as jest.Mock).mockResolvedValue({
      success: true,
      data: undefined,
    });
  });

  describe('initialization', () => {
    it('should initialize with idle state', () => {
      const { result } = renderHook(
        () => useDualCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      expect(result.current.dualCaptureState).toBe('idle');
      expect(result.current.isActive).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.frameCount).toBe(0);
      expect(result.current.error).toBeNull();
    });

    it('should set camera ref on mount', () => {
      renderHook(
        () => useDualCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      expect(dualCaptureService.setCameraRef).toHaveBeenCalledWith(mockCameraRef);
    });

    it('should setup frame captured callback', () => {
      const onFrameCaptured = jest.fn();
      renderHook(
        () => useDualCapture({ cameraRef: mockCameraRef, onFrameCaptured }),
        { wrapper: createWrapper(store) }
      );

      expect(dualCaptureService.setOnFrameCaptured).toHaveBeenCalled();
    });
  });

  describe('startDualCapture', () => {
    it('should start dual capture successfully', async () => {
      const onCaptureStart = jest.fn();
      const { result } = renderHook(
        () => useDualCapture({ cameraRef: mockCameraRef, onCaptureStart }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        await result.current.startDualCapture();
      });

      await waitFor(() => {
        expect(dualCaptureService.startDualCapture).toHaveBeenCalled();
        expect(onCaptureStart).toHaveBeenCalled();
        expect(result.current.isActive).toBe(true);
      });
    });

    it('should pass options to service', async () => {
      const { result } = renderHook(
        () => useDualCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      const options = {
        captureOptions: { interval: 1000 },
        recordingOptions: { maxDuration: 300 },
      };

      await act(async () => {
        await result.current.startDualCapture(options);
      });

      expect(dualCaptureService.startDualCapture).toHaveBeenCalledWith(options);
    });

    it('should handle start failure', async () => {
      (dualCaptureService.startDualCapture as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Start failed',
      });

      const onCaptureError = jest.fn();
      const { result } = renderHook(
        () => useDualCapture({ cameraRef: mockCameraRef, onCaptureError }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        await result.current.startDualCapture();
      });

      await waitFor(() => {
        expect(onCaptureError).toHaveBeenCalledWith('Start failed');
        expect(result.current.error).toBe('Start failed');
      });
    });

    it('should set loading state during start', async () => {
      let resolveStart: ((value: any) => void) | undefined;
      (dualCaptureService.startDualCapture as jest.Mock).mockImplementation(
        () => new Promise((resolve) => { resolveStart = resolve; })
      );

      const { result } = renderHook(
        () => useDualCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      act(() => {
        result.current.startDualCapture();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      act(() => {
        resolveStart?.({ success: true, data: { startedAt: '2025-01-01T00:00:00.000Z' } });
      });
    });
  });

  describe('stopDualCapture', () => {
    beforeEach(async () => {
      // Simulate active dual capture
      (dualCaptureService.getFrameCount as jest.Mock).mockReturnValue(5);
    });

    it('should stop dual capture successfully', async () => {
      const onCaptureStop = jest.fn();
      const { result } = renderHook(
        () => useDualCapture({ cameraRef: mockCameraRef, onCaptureStop }),
        { wrapper: createWrapper(store) }
      );

      // Start first
      await act(async () => {
        await result.current.startDualCapture();
      });

      // Then stop
      let sessionResult: DualCaptureSession | null = null;
      await act(async () => {
        sessionResult = await result.current.stopDualCapture();
      });

      await waitFor(() => {
        expect(dualCaptureService.stopDualCapture).toHaveBeenCalled();
        expect(onCaptureStop).toHaveBeenCalledWith(mockSession);
        expect(sessionResult).toEqual(mockSession);
        expect(result.current.isActive).toBe(false);
        expect(result.current.lastSession).toEqual(mockSession);
      });
    });

    it('should handle stop failure', async () => {
      (dualCaptureService.stopDualCapture as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Stop failed',
      });

      const onCaptureError = jest.fn();
      const { result } = renderHook(
        () => useDualCapture({ cameraRef: mockCameraRef, onCaptureError }),
        { wrapper: createWrapper(store) }
      );

      // Start first
      await act(async () => {
        await result.current.startDualCapture();
      });

      let sessionResult: DualCaptureSession | null = null;
      await act(async () => {
        sessionResult = await result.current.stopDualCapture();
      });

      await waitFor(() => {
        expect(onCaptureError).toHaveBeenCalledWith('Stop failed');
        expect(sessionResult).toBeNull();
        expect(result.current.error).toBe('Stop failed');
      });
    });
  });

  describe('cancelDualCapture', () => {
    it('should cancel dual capture', async () => {
      const { result } = renderHook(
        () => useDualCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      // Start first
      await act(async () => {
        await result.current.startDualCapture();
      });

      // Then cancel
      await act(async () => {
        await result.current.cancelDualCapture();
      });

      await waitFor(() => {
        expect(dualCaptureService.cancelDualCapture).toHaveBeenCalled();
        expect(result.current.isActive).toBe(false);
      });
    });
  });

  describe('reset', () => {
    it('should reset service and state', () => {
      const { result } = renderHook(
        () => useDualCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      act(() => {
        result.current.reset();
      });

      expect(dualCaptureService.reset).toHaveBeenCalled();
      expect(result.current.dualCaptureState).toBe('idle');
    });
  });

  describe('frame captured callback', () => {
    it('should update frame count when frame captured', async () => {
      let capturedCallback: ((frame: CapturedFrame) => void) | undefined;
      (dualCaptureService.setOnFrameCaptured as jest.Mock).mockImplementation((cb) => {
        capturedCallback = cb;
      });
      (dualCaptureService.getFrameCount as jest.Mock).mockReturnValue(3);

      const onFrameCaptured = jest.fn();
      const { result } = renderHook(
        () => useDualCapture({ cameraRef: mockCameraRef, onFrameCaptured }),
        { wrapper: createWrapper(store) }
      );

      // Simulate frame capture
      act(() => {
        capturedCallback?.({
          frameIndex: 0,
          capturedAt: '2025-01-01T00:00:00.000Z',
          uri: 'file://frame1.jpg',
        });
      });

      await waitFor(() => {
        expect(onFrameCaptured).toHaveBeenCalled();
        expect(result.current.frameCount).toBe(3);
      });
    });
  });

  describe('service states', () => {
    it('should expose recording state', () => {
      (dualCaptureService.getRecordingState as jest.Mock).mockReturnValue('recording');

      const { result } = renderHook(
        () => useDualCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      expect(result.current.recordingState).toBe('recording');
    });

    it('should expose capture state', () => {
      (dualCaptureService.getCaptureState as jest.Mock).mockReturnValue('capturing');

      const { result } = renderHook(
        () => useDualCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      expect(result.current.captureState).toBe('capturing');
    });
  });

  describe('concurrent operations', () => {
    it('should handle rapid start/stop', async () => {
      const { result } = renderHook(
        () => useDualCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        await result.current.startDualCapture();
      });

      await act(async () => {
        await result.current.stopDualCapture();
      });

      await act(async () => {
        await result.current.startDualCapture();
      });

      await waitFor(() => {
        expect(dualCaptureService.startDualCapture).toHaveBeenCalledTimes(2);
        expect(dualCaptureService.stopDualCapture).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('cleanup', () => {
    it('should cleanup frame callback on unmount', () => {
      const { unmount } = renderHook(
        () => useDualCapture({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      unmount();

      expect(dualCaptureService.setOnFrameCaptured).toHaveBeenCalledWith(undefined);
    });
  });
});
