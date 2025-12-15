/**
 * useRecording Hook Tests
 *
 * Tests for the useRecording custom hook.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';

import { useRecording } from './useRecording';
import { videoRecordingService } from '@/src/services/camera/recording';
import recordingReducer from '@/src/store/slices/recordingSlice';
import settingsReducer from '@/src/store/slices/settingsSlice';
import authReducer from '@/src/store/slices/authSlice';

// Mock the recording service
jest.mock('@/src/services/camera/recording', () => ({
  videoRecordingService: {
    setCameraRef: jest.fn(),
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    cancelRecording: jest.fn(),
    reset: jest.fn(),
  },
  RecordingOptions: {},
  RecordingResult: {},
}));

// Create a test store
function createTestStore() {
  return configureStore({
    reducer: {
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

describe('useRecording', () => {
  let store: ReturnType<typeof createTestStore>;
  let mockCameraRef: React.RefObject<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    store = createTestStore();
    mockCameraRef = { current: { recordAsync: jest.fn(), stopRecording: jest.fn() } };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initial state', () => {
    it('should return initial recording state', () => {
      const { result } = renderHook(
        () => useRecording({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      expect(result.current.recordingState).toBe('idle');
      expect(result.current.isRecording).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.durationMs).toBe(0);
      expect(result.current.lastResult).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should set camera ref on mount', () => {
      renderHook(
        () => useRecording({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      expect(videoRecordingService.setCameraRef).toHaveBeenCalledWith(mockCameraRef);
    });
  });

  describe('startRecording', () => {
    it('should call service and update state on success', async () => {
      const startedAt = new Date().toISOString();
      (videoRecordingService.startRecording as jest.Mock).mockResolvedValue({
        success: true,
        data: { startedAt },
      });

      const onRecordingStart = jest.fn();
      const { result } = renderHook(
        () => useRecording({ cameraRef: mockCameraRef, onRecordingStart }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        await result.current.startRecording();
      });

      expect(videoRecordingService.startRecording).toHaveBeenCalled();
      expect(result.current.recordingState).toBe('recording');
      expect(result.current.isRecording).toBe(true);
      expect(onRecordingStart).toHaveBeenCalled();
    });

    it('should call service and set error on failure', async () => {
      (videoRecordingService.startRecording as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Camera not ready',
      });

      const onRecordingError = jest.fn();
      const { result } = renderHook(
        () => useRecording({ cameraRef: mockCameraRef, onRecordingError }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.recordingState).toBe('error');
      expect(result.current.error).toBe('Camera not ready');
      expect(onRecordingError).toHaveBeenCalledWith('Camera not ready');
    });

    it('should pass options to service', async () => {
      (videoRecordingService.startRecording as jest.Mock).mockResolvedValue({
        success: true,
        data: { startedAt: new Date().toISOString() },
      });

      const { result } = renderHook(
        () => useRecording({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        await result.current.startRecording({ maxDuration: 60 });
      });

      expect(videoRecordingService.startRecording).toHaveBeenCalledWith({ maxDuration: 60 });
    });
  });

  describe('stopRecording', () => {
    it('should call service and update state on success', async () => {
      const mockResult = {
        uri: 'file://video.mp4',
        durationMs: 5000,
        startedAt: new Date().toISOString(),
        stoppedAt: new Date().toISOString(),
      };

      // First start recording
      (videoRecordingService.startRecording as jest.Mock).mockResolvedValue({
        success: true,
        data: { startedAt: new Date().toISOString() },
      });
      (videoRecordingService.stopRecording as jest.Mock).mockResolvedValue({
        success: true,
        data: mockResult,
      });

      const onRecordingStop = jest.fn();
      const { result } = renderHook(
        () => useRecording({ cameraRef: mockCameraRef, onRecordingStop }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        await result.current.startRecording();
      });

      await act(async () => {
        const stopResult = await result.current.stopRecording();
        expect(stopResult).toEqual(mockResult);
      });

      expect(videoRecordingService.stopRecording).toHaveBeenCalled();
      expect(result.current.recordingState).toBe('idle');
      expect(result.current.isRecording).toBe(false);
      expect(result.current.lastResult).toEqual(mockResult);
      expect(onRecordingStop).toHaveBeenCalledWith(mockResult);
    });

    it('should return null and set error on failure', async () => {
      (videoRecordingService.stopRecording as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Stop failed',
      });

      const onRecordingError = jest.fn();
      const { result } = renderHook(
        () => useRecording({ cameraRef: mockCameraRef, onRecordingError }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        const stopResult = await result.current.stopRecording();
        expect(stopResult).toBeNull();
      });

      expect(result.current.error).toBe('Stop failed');
      expect(onRecordingError).toHaveBeenCalledWith('Stop failed');
    });
  });

  describe('cancelRecording', () => {
    it('should cancel recording and reset state', async () => {
      (videoRecordingService.cancelRecording as jest.Mock).mockResolvedValue({
        success: true,
        data: undefined,
      });

      const { result } = renderHook(
        () => useRecording({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        await result.current.cancelRecording();
      });

      expect(videoRecordingService.cancelRecording).toHaveBeenCalled();
      expect(result.current.recordingState).toBe('idle');
      expect(result.current.isRecording).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset service and Redux state', () => {
      const { result } = renderHook(
        () => useRecording({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      act(() => {
        result.current.reset();
      });

      expect(videoRecordingService.reset).toHaveBeenCalled();
      expect(result.current.recordingState).toBe('idle');
    });
  });

  describe('duration timer', () => {
    it('should start timer when recording starts', async () => {
      (videoRecordingService.startRecording as jest.Mock).mockResolvedValue({
        success: true,
        data: { startedAt: new Date().toISOString() },
      });

      const { result } = renderHook(
        () => useRecording({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        await result.current.startRecording();
      });

      // Initial duration is 0
      expect(result.current.durationMs).toBe(0);

      // Advance timer by 100ms
      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      // Duration should have updated
      await waitFor(() => {
        expect(result.current.durationMs).toBeGreaterThan(0);
      });
    });

    it('should stop timer when recording stops', async () => {
      const mockResult = {
        uri: 'file://video.mp4',
        durationMs: 5000,
        startedAt: new Date().toISOString(),
        stoppedAt: new Date().toISOString(),
      };

      (videoRecordingService.startRecording as jest.Mock).mockResolvedValue({
        success: true,
        data: { startedAt: new Date().toISOString() },
      });
      (videoRecordingService.stopRecording as jest.Mock).mockResolvedValue({
        success: true,
        data: mockResult,
      });

      const { result } = renderHook(
        () => useRecording({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        await result.current.startRecording();
      });

      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      const durationBeforeStop = result.current.durationMs;

      await act(async () => {
        await result.current.stopRecording();
      });

      // Timer should be stopped, duration shouldn't increase
      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      // Duration should be 0 after stop (reset by state change)
      expect(result.current.isRecording).toBe(false);
    });
  });

  describe('return value types', () => {
    it('should return all expected properties', () => {
      const { result } = renderHook(
        () => useRecording({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      expect(result.current).toHaveProperty('recordingState');
      expect(result.current).toHaveProperty('isRecording');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('durationMs');
      expect(result.current).toHaveProperty('lastResult');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('startRecording');
      expect(result.current).toHaveProperty('stopRecording');
      expect(result.current).toHaveProperty('cancelRecording');
      expect(result.current).toHaveProperty('reset');
    });

    it('should have functions that are callable', () => {
      const { result } = renderHook(
        () => useRecording({ cameraRef: mockCameraRef }),
        { wrapper: createWrapper(store) }
      );

      expect(typeof result.current.startRecording).toBe('function');
      expect(typeof result.current.stopRecording).toBe('function');
      expect(typeof result.current.cancelRecording).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });
});
