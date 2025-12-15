/**
 * Capture Slice Tests
 *
 * Tests for the capture Redux slice.
 */

import captureReducer, {
  startCaptureRequest,
  startCaptureSuccess,
  addCapturedFrame,
  updateFrameCount,
  stopCaptureRequest,
  stopCaptureSuccess,
  setCaptureError,
  resetCapture,
  clearLastResult,
  selectCaptureState,
  selectIsCapturing,
  selectCaptureStartedAt,
  selectFrameCount,
  selectCapturedFrames,
  selectLastCaptureResult,
  selectCaptureError,
  selectCaptureIsLoading,
  CaptureSliceState,
} from './captureSlice';
import type { CapturedFrame } from '@/src/services/camera/capture';

describe('captureSlice', () => {
  const initialState: CaptureSliceState = {
    state: 'idle',
    isCapturing: false,
    startedAt: null,
    frameCount: 0,
    frames: [],
    lastResult: null,
    error: null,
  };

  const mockCapturedFrame: CapturedFrame = {
    frameIndex: 0,
        capturedAt: '2025-01-01T00:00:00.000Z',
        uri: 'file://frame1.jpg',
    timestamp: '2025-01-01T00:00:00.000Z',
  };

  const mockCapturedFrames: CapturedFrame[] = [
    {
      frameIndex: 0,
        capturedAt: '2025-01-01T00:00:00.000Z',
        uri: 'file://frame1.jpg',
      timestamp: '2025-01-01T00:00:00.000Z',
    },
    {
      frameIndex: 0,
        capturedAt: '2025-01-01T00:00:00.000Z',
        uri: 'file://frame2.jpg',
      timestamp: '2025-01-01T00:00:01.000Z',
    },
    {
      frameIndex: 0,
        capturedAt: '2025-01-01T00:00:00.000Z',
        uri: 'file://frame3.jpg',
      timestamp: '2025-01-01T00:00:02.000Z',
    },
  ];

  describe('initial state', () => {
    it('should return the initial state', () => {
      expect(captureReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('startCaptureRequest', () => {
    it('should set state to starting', () => {
      const state = captureReducer(initialState, startCaptureRequest());

      expect(state.state).toBe('starting');
      expect(state.isCapturing).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should clear any existing error', () => {
      const stateWithError = { ...initialState, error: 'Previous error' };
      const state = captureReducer(stateWithError, startCaptureRequest());

      expect(state.error).toBeNull();
    });

    it('should clear frames array', () => {
      const stateWithFrames = {
        ...initialState,
        frames: mockCapturedFrames,
        frameCount: 3,
      };
      const state = captureReducer(stateWithFrames, startCaptureRequest());

      expect(state.frames).toEqual([]);
      expect(state.frameCount).toBe(0);
    });

    it('should reset frame count', () => {
      const stateWithFrameCount = { ...initialState, frameCount: 10 };
      const state = captureReducer(stateWithFrameCount, startCaptureRequest());

      expect(state.frameCount).toBe(0);
    });

    it('should preserve lastResult', () => {
      const stateWithResult = {
        ...initialState,
        lastResult: mockCapturedFrames,
      };
      const state = captureReducer(stateWithResult, startCaptureRequest());

      expect(state.lastResult).toEqual(mockCapturedFrames);
    });
  });

  describe('startCaptureSuccess', () => {
    it('should set state to capturing', () => {
      const startedAt = '2025-01-01T00:00:00.000Z';
      const state = captureReducer(
        initialState,
        startCaptureSuccess({ startedAt })
      );

      expect(state.state).toBe('capturing');
      expect(state.isCapturing).toBe(true);
      expect(state.startedAt).toBe(startedAt);
      expect(state.error).toBeNull();
    });

    it('should clear any existing error', () => {
      const stateWithError = { ...initialState, error: 'Previous error' };
      const startedAt = '2025-01-01T00:00:00.000Z';
      const state = captureReducer(
        stateWithError,
        startCaptureSuccess({ startedAt })
      );

      expect(state.error).toBeNull();
    });

    it('should set isCapturing to true', () => {
      const startedAt = '2025-01-01T00:00:00.000Z';
      const state = captureReducer(
        initialState,
        startCaptureSuccess({ startedAt })
      );

      expect(state.isCapturing).toBe(true);
    });

    it('should preserve frames array', () => {
      const stateWithFrames = {
        ...initialState,
        frames: mockCapturedFrames,
        frameCount: 3,
      };
      const startedAt = '2025-01-01T00:00:00.000Z';
      const state = captureReducer(
        stateWithFrames,
        startCaptureSuccess({ startedAt })
      );

      expect(state.frames).toEqual(mockCapturedFrames);
    });
  });

  describe('addCapturedFrame', () => {
    it('should add frame to frames array', () => {
      const state = captureReducer(
        initialState,
        addCapturedFrame(mockCapturedFrame)
      );

      expect(state.frames).toHaveLength(1);
      expect(state.frames[0]).toEqual(mockCapturedFrame);
    });

    it('should update frame count', () => {
      const state = captureReducer(
        initialState,
        addCapturedFrame(mockCapturedFrame)
      );

      expect(state.frameCount).toBe(1);
    });

    it('should append to existing frames', () => {
      const stateWithFrame = {
        ...initialState,
        frames: [mockCapturedFrame],
        frameCount: 1,
      };
      const newFrame: CapturedFrame = {
        frameIndex: 0,
        capturedAt: '2025-01-01T00:00:00.000Z',
        uri: 'file://frame2.jpg',
        timestamp: '2025-01-01T00:00:01.000Z',
      };

      const state = captureReducer(stateWithFrame, addCapturedFrame(newFrame));

      expect(state.frames).toHaveLength(2);
      expect(state.frames[1]).toEqual(newFrame);
      expect(state.frameCount).toBe(2);
    });

    it('should handle multiple frames', () => {
      let state = initialState;

      mockCapturedFrames.forEach((frame) => {
        state = captureReducer(state, addCapturedFrame(frame));
      });

      expect(state.frames).toHaveLength(3);
      expect(state.frameCount).toBe(3);
      expect(state.frames).toEqual(mockCapturedFrames);
    });
  });

  describe('updateFrameCount', () => {
    it('should update frame count', () => {
      const state = captureReducer(initialState, updateFrameCount(5));

      expect(state.frameCount).toBe(5);
    });

    it('should update to zero', () => {
      const stateWithCount = { ...initialState, frameCount: 10 };
      const state = captureReducer(stateWithCount, updateFrameCount(0));

      expect(state.frameCount).toBe(0);
    });

    it('should handle large numbers', () => {
      const state = captureReducer(initialState, updateFrameCount(1000));

      expect(state.frameCount).toBe(1000);
    });

    it('should not affect frames array', () => {
      const stateWithFrames = {
        ...initialState,
        frames: mockCapturedFrames,
        frameCount: 3,
      };
      const state = captureReducer(stateWithFrames, updateFrameCount(10));

      expect(state.frames).toEqual(mockCapturedFrames);
      expect(state.frameCount).toBe(10);
    });
  });

  describe('stopCaptureRequest', () => {
    it('should set state to stopping', () => {
      const capturingState = {
        ...initialState,
        state: 'capturing' as const,
        isCapturing: true,
      };
      const state = captureReducer(capturingState, stopCaptureRequest());

      expect(state.state).toBe('stopping');
    });

    it('should preserve isCapturing flag', () => {
      const capturingState = {
        ...initialState,
        state: 'capturing' as const,
        isCapturing: true,
      };
      const state = captureReducer(capturingState, stopCaptureRequest());

      expect(state.isCapturing).toBe(true);
    });

    it('should preserve frames and frame count', () => {
      const capturingState = {
        ...initialState,
        state: 'capturing' as const,
        isCapturing: true,
        frames: mockCapturedFrames,
        frameCount: 3,
      };
      const state = captureReducer(capturingState, stopCaptureRequest());

      expect(state.frames).toEqual(mockCapturedFrames);
      expect(state.frameCount).toBe(3);
    });
  });

  describe('stopCaptureSuccess', () => {
    it('should set state to idle with result', () => {
      const capturingState = {
        ...initialState,
        state: 'stopping' as const,
        isCapturing: true,
        startedAt: '2025-01-01T00:00:00.000Z',
        frames: mockCapturedFrames,
        frameCount: 3,
      };
      const state = captureReducer(
        capturingState,
        stopCaptureSuccess(mockCapturedFrames)
      );

      expect(state.state).toBe('idle');
      expect(state.isCapturing).toBe(false);
      expect(state.lastResult).toEqual(mockCapturedFrames);
      expect(state.startedAt).toBeNull();
      expect(state.error).toBeNull();
    });

    it('should clear startedAt', () => {
      const capturingState = {
        ...initialState,
        state: 'stopping' as const,
        isCapturing: true,
        startedAt: '2025-01-01T00:00:00.000Z',
      };
      const state = captureReducer(
        capturingState,
        stopCaptureSuccess(mockCapturedFrames)
      );

      expect(state.startedAt).toBeNull();
    });

    it('should set isCapturing to false', () => {
      const capturingState = {
        ...initialState,
        state: 'stopping' as const,
        isCapturing: true,
      };
      const state = captureReducer(
        capturingState,
        stopCaptureSuccess(mockCapturedFrames)
      );

      expect(state.isCapturing).toBe(false);
    });

    it('should handle empty frames array', () => {
      const capturingState = {
        ...initialState,
        state: 'stopping' as const,
        isCapturing: true,
      };
      const state = captureReducer(capturingState, stopCaptureSuccess([]));

      expect(state.lastResult).toEqual([]);
      expect(state.state).toBe('idle');
    });
  });

  describe('setCaptureError', () => {
    it('should set error state', () => {
      const state = captureReducer(
        initialState,
        setCaptureError('Capture failed')
      );

      expect(state.state).toBe('error');
      expect(state.isCapturing).toBe(false);
      expect(state.error).toBe('Capture failed');
    });

    it('should set isCapturing to false', () => {
      const capturingState = {
        ...initialState,
        state: 'capturing' as const,
        isCapturing: true,
      };
      const state = captureReducer(
        capturingState,
        setCaptureError('Camera error')
      );

      expect(state.isCapturing).toBe(false);
    });

    it('should preserve frames and frame count', () => {
      const capturingState = {
        ...initialState,
        frames: mockCapturedFrames,
        frameCount: 3,
      };
      const state = captureReducer(
        capturingState,
        setCaptureError('Error occurred')
      );

      expect(state.frames).toEqual(mockCapturedFrames);
      expect(state.frameCount).toBe(3);
    });
  });

  describe('resetCapture', () => {
    it('should reset to idle state', () => {
      const capturingState = {
        ...initialState,
        state: 'capturing' as const,
        isCapturing: true,
        startedAt: '2025-01-01T00:00:00.000Z',
        frameCount: 5,
        frames: mockCapturedFrames,
        error: 'Some error',
      };
      const state = captureReducer(capturingState, resetCapture());

      expect(state.state).toBe('idle');
      expect(state.isCapturing).toBe(false);
      expect(state.startedAt).toBeNull();
      expect(state.frameCount).toBe(0);
      expect(state.frames).toEqual([]);
      expect(state.error).toBeNull();
    });

    it('should preserve lastResult', () => {
      const stateWithResult = {
        ...initialState,
        lastResult: mockCapturedFrames,
        state: 'capturing' as const,
        isCapturing: true,
      };
      const state = captureReducer(stateWithResult, resetCapture());

      expect(state.lastResult).toEqual(mockCapturedFrames);
    });

    it('should clear frames array', () => {
      const stateWithFrames = {
        ...initialState,
        frames: mockCapturedFrames,
        frameCount: 3,
      };
      const state = captureReducer(stateWithFrames, resetCapture());

      expect(state.frames).toEqual([]);
    });

    it('should clear error', () => {
      const stateWithError = {
        ...initialState,
        error: 'Previous error',
        state: 'error' as const,
      };
      const state = captureReducer(stateWithError, resetCapture());

      expect(state.error).toBeNull();
    });
  });

  describe('clearLastResult', () => {
    it('should clear lastResult', () => {
      const stateWithResult = {
        ...initialState,
        lastResult: mockCapturedFrames,
      };
      const state = captureReducer(stateWithResult, clearLastResult());

      expect(state.lastResult).toBeNull();
    });

    it('should not affect other state', () => {
      const stateWithData = {
        ...initialState,
        lastResult: mockCapturedFrames,
        frames: mockCapturedFrames,
        frameCount: 3,
        state: 'idle' as const,
      };
      const state = captureReducer(stateWithData, clearLastResult());

      expect(state.lastResult).toBeNull();
      expect(state.frames).toEqual(mockCapturedFrames);
      expect(state.frameCount).toBe(3);
      expect(state.state).toBe('idle');
    });

    it('should work when lastResult is already null', () => {
      const state = captureReducer(initialState, clearLastResult());

      expect(state.lastResult).toBeNull();
    });
  });

  describe('selectors', () => {
    const mockRootState = {
      capture: {
        state: 'capturing' as const,
        isCapturing: true,
        startedAt: '2025-01-01T00:00:00.000Z',
        frameCount: 5,
        frames: mockCapturedFrames,
        lastResult: mockCapturedFrames,
        error: null,
      },
      recording: {
        state: 'idle' as const,
        isRecording: false,
        startedAt: null,
        durationMs: 0,
        lastResult: null,
        error: null,
      },
      settings: { deviceName: '', frameInterval: 1000 },
      auth: {
        user: null,
        session: null,
        isAuthenticated: false,
        isAnonymous: false,
        status: 'idle' as const,
        error: null,
      },
    };

    it('selectCaptureState should return state', () => {
      expect(selectCaptureState(mockRootState as any)).toBe('capturing');
    });

    it('selectIsCapturing should return isCapturing', () => {
      expect(selectIsCapturing(mockRootState as any)).toBe(true);
    });

    it('selectCaptureStartedAt should return startedAt', () => {
      expect(selectCaptureStartedAt(mockRootState as any)).toBe('2025-01-01T00:00:00.000Z');
    });

    it('selectFrameCount should return frameCount', () => {
      expect(selectFrameCount(mockRootState as any)).toBe(5);
    });

    it('selectCapturedFrames should return frames', () => {
      expect(selectCapturedFrames(mockRootState as any)).toEqual(mockCapturedFrames);
    });

    it('selectLastCaptureResult should return lastResult', () => {
      expect(selectLastCaptureResult(mockRootState as any)).toEqual(mockCapturedFrames);
    });

    it('selectCaptureError should return error', () => {
      expect(selectCaptureError(mockRootState as any)).toBeNull();
    });

    it('selectCaptureIsLoading should return true for starting state', () => {
      const loadingState = {
        ...mockRootState,
        capture: { ...mockRootState.capture, state: 'starting' as const },
      };
      expect(selectCaptureIsLoading(loadingState as any)).toBe(true);
    });

    it('selectCaptureIsLoading should return true for stopping state', () => {
      const loadingState = {
        ...mockRootState,
        capture: { ...mockRootState.capture, state: 'stopping' as const },
      };
      expect(selectCaptureIsLoading(loadingState as any)).toBe(true);
    });

    it('selectCaptureIsLoading should return false for capturing state', () => {
      expect(selectCaptureIsLoading(mockRootState as any)).toBe(false);
    });

    it('selectCaptureIsLoading should return false for idle state', () => {
      const idleState = {
        ...mockRootState,
        capture: { ...mockRootState.capture, state: 'idle' as const },
      };
      expect(selectCaptureIsLoading(idleState as any)).toBe(false);
    });

    it('selectCaptureError should return error when present', () => {
      const errorState = {
        ...mockRootState,
        capture: { ...mockRootState.capture, error: 'Camera not available' },
      };
      expect(selectCaptureError(errorState as any)).toBe('Camera not available');
    });

    it('selectIsCapturing should return false when not capturing', () => {
      const notCapturingState = {
        ...mockRootState,
        capture: { ...mockRootState.capture, isCapturing: false },
      };
      expect(selectIsCapturing(notCapturingState as any)).toBe(false);
    });
  });

  describe('action types', () => {
    it('should have correct action type for startCaptureRequest', () => {
      expect(startCaptureRequest.type).toBe('capture/startCaptureRequest');
    });

    it('should have correct action type for startCaptureSuccess', () => {
      expect(startCaptureSuccess.type).toBe('capture/startCaptureSuccess');
    });

    it('should have correct action type for addCapturedFrame', () => {
      expect(addCapturedFrame.type).toBe('capture/addCapturedFrame');
    });

    it('should have correct action type for updateFrameCount', () => {
      expect(updateFrameCount.type).toBe('capture/updateFrameCount');
    });

    it('should have correct action type for stopCaptureRequest', () => {
      expect(stopCaptureRequest.type).toBe('capture/stopCaptureRequest');
    });

    it('should have correct action type for stopCaptureSuccess', () => {
      expect(stopCaptureSuccess.type).toBe('capture/stopCaptureSuccess');
    });

    it('should have correct action type for setCaptureError', () => {
      expect(setCaptureError.type).toBe('capture/setCaptureError');
    });

    it('should have correct action type for resetCapture', () => {
      expect(resetCapture.type).toBe('capture/resetCapture');
    });

    it('should have correct action type for clearLastResult', () => {
      expect(clearLastResult.type).toBe('capture/clearLastResult');
    });
  });
});
