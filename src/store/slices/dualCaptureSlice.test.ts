/**
 * Dual Capture Slice Tests
 *
 * Tests for the dual capture Redux slice.
 */

import dualCaptureReducer, {
  startDualCaptureRequest,
  startDualCaptureSuccess,
  updateFrameCount,
  stopDualCaptureRequest,
  stopDualCaptureSuccess,
  setDualCaptureError,
  resetDualCapture,
  clearLastSession,
  selectDualCaptureState,
  selectIsDualCaptureActive,
  selectDualCaptureStartedAt,
  selectDualCaptureFrameCount,
  selectLastDualCaptureSession,
  selectDualCaptureError,
  selectDualCaptureIsLoading,
  DualCaptureSliceState,
} from './dualCaptureSlice';
import type { DualCaptureSession } from '@/src/services/camera/dualCapture';
import type { RootState } from '../store';

describe('dualCaptureSlice', () => {
  const initialState: DualCaptureSliceState = {
    state: 'idle',
    isActive: false,
    startedAt: null,
    frameCount: 0,
    lastSession: null,
    error: null,
  };

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

  describe('initial state', () => {
    it('should return the initial state', () => {
      expect(dualCaptureReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('startDualCaptureRequest', () => {
    it('should set state to starting', () => {
      const state = dualCaptureReducer(initialState, startDualCaptureRequest());

      expect(state.state).toBe('starting');
      expect(state.isActive).toBe(false);
      expect(state.error).toBeNull();
      expect(state.frameCount).toBe(0);
    });

    it('should clear any existing error', () => {
      const stateWithError = { ...initialState, error: 'Previous error' };
      const state = dualCaptureReducer(stateWithError, startDualCaptureRequest());

      expect(state.error).toBeNull();
    });

    it('should reset frame count', () => {
      const stateWithFrameCount = { ...initialState, frameCount: 10 };
      const state = dualCaptureReducer(stateWithFrameCount, startDualCaptureRequest());

      expect(state.frameCount).toBe(0);
    });
  });

  describe('startDualCaptureSuccess', () => {
    it('should set state to active', () => {
      const state = dualCaptureReducer(
        { ...initialState, state: 'starting' },
        startDualCaptureSuccess({ startedAt: '2025-01-01T00:00:00.000Z' })
      );

      expect(state.state).toBe('active');
      expect(state.isActive).toBe(true);
      expect(state.startedAt).toBe('2025-01-01T00:00:00.000Z');
      expect(state.error).toBeNull();
    });

    it('should store the started timestamp', () => {
      const timestamp = '2025-01-01T12:00:00.000Z';
      const state = dualCaptureReducer(
        initialState,
        startDualCaptureSuccess({ startedAt: timestamp })
      );

      expect(state.startedAt).toBe(timestamp);
    });
  });

  describe('updateFrameCount', () => {
    it('should update frame count', () => {
      const state = dualCaptureReducer(initialState, updateFrameCount(5));

      expect(state.frameCount).toBe(5);
    });

    it('should update existing frame count', () => {
      const stateWithCount = { ...initialState, frameCount: 3 };
      const state = dualCaptureReducer(stateWithCount, updateFrameCount(7));

      expect(state.frameCount).toBe(7);
    });
  });

  describe('stopDualCaptureRequest', () => {
    it('should set state to stopping', () => {
      const activeState = { ...initialState, state: 'active' as const, isActive: true };
      const state = dualCaptureReducer(activeState, stopDualCaptureRequest());

      expect(state.state).toBe('stopping');
    });
  });

  describe('stopDualCaptureSuccess', () => {
    it('should set state to idle', () => {
      const stoppingState = { ...initialState, state: 'stopping' as const };
      const state = dualCaptureReducer(stoppingState, stopDualCaptureSuccess(mockSession));

      expect(state.state).toBe('idle');
      expect(state.isActive).toBe(false);
    });

    it('should store the session data', () => {
      const state = dualCaptureReducer(initialState, stopDualCaptureSuccess(mockSession));

      expect(state.lastSession).toEqual(mockSession);
    });

    it('should reset startedAt and frameCount', () => {
      const activeState = {
        ...initialState,
        startedAt: '2025-01-01T00:00:00.000Z',
        frameCount: 5,
      };
      const state = dualCaptureReducer(activeState, stopDualCaptureSuccess(mockSession));

      expect(state.startedAt).toBeNull();
      expect(state.frameCount).toBe(0);
    });

    it('should clear any error', () => {
      const stateWithError = { ...initialState, error: 'Some error' };
      const state = dualCaptureReducer(stateWithError, stopDualCaptureSuccess(mockSession));

      expect(state.error).toBeNull();
    });
  });

  describe('setDualCaptureError', () => {
    it('should set error state', () => {
      const state = dualCaptureReducer(initialState, setDualCaptureError('Error message'));

      expect(state.state).toBe('error');
      expect(state.isActive).toBe(false);
      expect(state.error).toBe('Error message');
    });

    it('should overwrite existing error', () => {
      const stateWithError = { ...initialState, error: 'Old error' };
      const state = dualCaptureReducer(stateWithError, setDualCaptureError('New error'));

      expect(state.error).toBe('New error');
    });
  });

  describe('resetDualCapture', () => {
    it('should reset state to idle', () => {
      const activeState = {
        ...initialState,
        state: 'active' as const,
        isActive: true,
        startedAt: '2025-01-01T00:00:00.000Z',
        frameCount: 10,
        error: 'Some error',
      };
      const state = dualCaptureReducer(activeState, resetDualCapture());

      expect(state.state).toBe('idle');
      expect(state.isActive).toBe(false);
      expect(state.startedAt).toBeNull();
      expect(state.frameCount).toBe(0);
      expect(state.error).toBeNull();
    });

    it('should preserve lastSession', () => {
      const stateWithSession = { ...initialState, lastSession: mockSession };
      const state = dualCaptureReducer(stateWithSession, resetDualCapture());

      expect(state.lastSession).toEqual(mockSession);
    });
  });

  describe('clearLastSession', () => {
    it('should clear lastSession', () => {
      const stateWithSession = { ...initialState, lastSession: mockSession };
      const state = dualCaptureReducer(stateWithSession, clearLastSession());

      expect(state.lastSession).toBeNull();
    });

    it('should not affect other state', () => {
      const stateWithSession = {
        ...initialState,
        lastSession: mockSession,
        frameCount: 5,
        error: 'Some error',
      };
      const state = dualCaptureReducer(stateWithSession, clearLastSession());

      expect(state.frameCount).toBe(5);
      expect(state.error).toBe('Some error');
    });
  });

  describe('selectors', () => {
    const mockRootState = {
      dualCapture: {
        state: 'active' as const,
        isActive: true,
        startedAt: '2025-01-01T00:00:00.000Z',
        frameCount: 5,
        lastSession: mockSession,
        error: null,
      },
    } as RootState;

    describe('selectDualCaptureState', () => {
      it('should select the dual capture state', () => {
        expect(selectDualCaptureState(mockRootState)).toBe('active');
      });
    });

    describe('selectIsDualCaptureActive', () => {
      it('should select isActive', () => {
        expect(selectIsDualCaptureActive(mockRootState)).toBe(true);
      });

      it('should return false when not active', () => {
        const inactiveState = {
          dualCapture: { ...mockRootState.dualCapture, isActive: false },
        } as RootState;
        expect(selectIsDualCaptureActive(inactiveState)).toBe(false);
      });
    });

    describe('selectDualCaptureStartedAt', () => {
      it('should select startedAt timestamp', () => {
        expect(selectDualCaptureStartedAt(mockRootState)).toBe('2025-01-01T00:00:00.000Z');
      });

      it('should return null when not started', () => {
        const notStartedState = {
          dualCapture: { ...mockRootState.dualCapture, startedAt: null },
        } as RootState;
        expect(selectDualCaptureStartedAt(notStartedState)).toBeNull();
      });
    });

    describe('selectDualCaptureFrameCount', () => {
      it('should select frame count', () => {
        expect(selectDualCaptureFrameCount(mockRootState)).toBe(5);
      });

      it('should return 0 when no frames', () => {
        const noFramesState = {
          dualCapture: { ...mockRootState.dualCapture, frameCount: 0 },
        } as RootState;
        expect(selectDualCaptureFrameCount(noFramesState)).toBe(0);
      });
    });

    describe('selectLastDualCaptureSession', () => {
      it('should select last session', () => {
        expect(selectLastDualCaptureSession(mockRootState)).toEqual(mockSession);
      });

      it('should return null when no session', () => {
        const noSessionState = {
          dualCapture: { ...mockRootState.dualCapture, lastSession: null },
        } as RootState;
        expect(selectLastDualCaptureSession(noSessionState)).toBeNull();
      });
    });

    describe('selectDualCaptureError', () => {
      it('should select error', () => {
        const errorState = {
          dualCapture: { ...mockRootState.dualCapture, error: 'Test error' },
        } as RootState;
        expect(selectDualCaptureError(errorState)).toBe('Test error');
      });

      it('should return null when no error', () => {
        expect(selectDualCaptureError(mockRootState)).toBeNull();
      });
    });

    describe('selectDualCaptureIsLoading', () => {
      it('should return true when starting', () => {
        const startingState = {
          dualCapture: { ...mockRootState.dualCapture, state: 'starting' as const },
        } as RootState;
        expect(selectDualCaptureIsLoading(startingState)).toBe(true);
      });

      it('should return true when stopping', () => {
        const stoppingState = {
          dualCapture: { ...mockRootState.dualCapture, state: 'stopping' as const },
        } as RootState;
        expect(selectDualCaptureIsLoading(stoppingState)).toBe(true);
      });

      it('should return false when idle', () => {
        const idleState = {
          dualCapture: { ...mockRootState.dualCapture, state: 'idle' as const },
        } as RootState;
        expect(selectDualCaptureIsLoading(idleState)).toBe(false);
      });

      it('should return false when active', () => {
        expect(selectDualCaptureIsLoading(mockRootState)).toBe(false);
      });

      it('should return false when error', () => {
        const errorState = {
          dualCapture: { ...mockRootState.dualCapture, state: 'error' as const },
        } as RootState;
        expect(selectDualCaptureIsLoading(errorState)).toBe(false);
      });
    });
  });
});
