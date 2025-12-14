/**
 * Recording Slice Tests
 *
 * Tests for the recording Redux slice.
 */

import recordingReducer, {
  startRecordingRequest,
  startRecordingSuccess,
  updateDuration,
  stopRecordingRequest,
  stopRecordingSuccess,
  setRecordingError,
  resetRecording,
  clearLastResult,
  selectRecordingState,
  selectIsRecording,
  selectRecordingStartedAt,
  selectRecordingDuration,
  selectLastRecordingResult,
  selectRecordingError,
  selectRecordingIsLoading,
  RecordingSliceState,
} from './recordingSlice';
import type { RecordingResult } from '@/src/services/camera/recording';

describe('recordingSlice', () => {
  const initialState: RecordingSliceState = {
    state: 'idle',
    isRecording: false,
    startedAt: null,
    durationMs: 0,
    lastResult: null,
    error: null,
  };

  const mockRecordingResult: RecordingResult = {
    uri: 'file://video.mp4',
    durationMs: 5000,
    fileSize: 1024000,
    startedAt: '2025-01-01T00:00:00.000Z',
    stoppedAt: '2025-01-01T00:00:05.000Z',
  };

  describe('initial state', () => {
    it('should return the initial state', () => {
      expect(recordingReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('startRecordingRequest', () => {
    it('should set state to starting', () => {
      const state = recordingReducer(initialState, startRecordingRequest());

      expect(state.state).toBe('starting');
      expect(state.isRecording).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should clear any existing error', () => {
      const stateWithError = { ...initialState, error: 'Previous error' };
      const state = recordingReducer(stateWithError, startRecordingRequest());

      expect(state.error).toBeNull();
    });
  });

  describe('startRecordingSuccess', () => {
    it('should set state to recording', () => {
      const startedAt = '2025-01-01T00:00:00.000Z';
      const state = recordingReducer(
        initialState,
        startRecordingSuccess({ startedAt })
      );

      expect(state.state).toBe('recording');
      expect(state.isRecording).toBe(true);
      expect(state.startedAt).toBe(startedAt);
      expect(state.durationMs).toBe(0);
      expect(state.error).toBeNull();
    });
  });

  describe('updateDuration', () => {
    it('should update duration', () => {
      const recordingState = {
        ...initialState,
        state: 'recording' as const,
        isRecording: true,
      };
      const state = recordingReducer(recordingState, updateDuration(5000));

      expect(state.durationMs).toBe(5000);
    });
  });

  describe('stopRecordingRequest', () => {
    it('should set state to stopping', () => {
      const recordingState = {
        ...initialState,
        state: 'recording' as const,
        isRecording: true,
      };
      const state = recordingReducer(recordingState, stopRecordingRequest());

      expect(state.state).toBe('stopping');
    });
  });

  describe('stopRecordingSuccess', () => {
    it('should set state to idle with result', () => {
      const recordingState = {
        ...initialState,
        state: 'stopping' as const,
        isRecording: true,
        startedAt: '2025-01-01T00:00:00.000Z',
      };
      const state = recordingReducer(
        recordingState,
        stopRecordingSuccess(mockRecordingResult)
      );

      expect(state.state).toBe('idle');
      expect(state.isRecording).toBe(false);
      expect(state.lastResult).toEqual(mockRecordingResult);
      expect(state.startedAt).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('setRecordingError', () => {
    it('should set error state', () => {
      const state = recordingReducer(
        initialState,
        setRecordingError('Recording failed')
      );

      expect(state.state).toBe('error');
      expect(state.isRecording).toBe(false);
      expect(state.error).toBe('Recording failed');
    });
  });

  describe('resetRecording', () => {
    it('should reset to idle state', () => {
      const recordingState = {
        ...initialState,
        state: 'recording' as const,
        isRecording: true,
        startedAt: '2025-01-01T00:00:00.000Z',
        durationMs: 5000,
        error: 'Some error',
      };
      const state = recordingReducer(recordingState, resetRecording());

      expect(state.state).toBe('idle');
      expect(state.isRecording).toBe(false);
      expect(state.startedAt).toBeNull();
      expect(state.durationMs).toBe(0);
      expect(state.error).toBeNull();
    });

    it('should preserve lastResult', () => {
      const stateWithResult = {
        ...initialState,
        lastResult: mockRecordingResult,
      };
      const state = recordingReducer(stateWithResult, resetRecording());

      expect(state.lastResult).toEqual(mockRecordingResult);
    });
  });

  describe('clearLastResult', () => {
    it('should clear lastResult', () => {
      const stateWithResult = {
        ...initialState,
        lastResult: mockRecordingResult,
      };
      const state = recordingReducer(stateWithResult, clearLastResult());

      expect(state.lastResult).toBeNull();
    });
  });

  describe('selectors', () => {
    const mockRootState = {
      recording: {
        state: 'recording' as const,
        isRecording: true,
        startedAt: '2025-01-01T00:00:00.000Z',
        durationMs: 5000,
        lastResult: mockRecordingResult,
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

    it('selectRecordingState should return state', () => {
      expect(selectRecordingState(mockRootState as any)).toBe('recording');
    });

    it('selectIsRecording should return isRecording', () => {
      expect(selectIsRecording(mockRootState as any)).toBe(true);
    });

    it('selectRecordingStartedAt should return startedAt', () => {
      expect(selectRecordingStartedAt(mockRootState as any)).toBe('2025-01-01T00:00:00.000Z');
    });

    it('selectRecordingDuration should return durationMs', () => {
      expect(selectRecordingDuration(mockRootState as any)).toBe(5000);
    });

    it('selectLastRecordingResult should return lastResult', () => {
      expect(selectLastRecordingResult(mockRootState as any)).toEqual(mockRecordingResult);
    });

    it('selectRecordingError should return error', () => {
      expect(selectRecordingError(mockRootState as any)).toBeNull();
    });

    it('selectRecordingIsLoading should return true for starting state', () => {
      const loadingState = {
        ...mockRootState,
        recording: { ...mockRootState.recording, state: 'starting' as const },
      };
      expect(selectRecordingIsLoading(loadingState as any)).toBe(true);
    });

    it('selectRecordingIsLoading should return true for stopping state', () => {
      const loadingState = {
        ...mockRootState,
        recording: { ...mockRootState.recording, state: 'stopping' as const },
      };
      expect(selectRecordingIsLoading(loadingState as any)).toBe(true);
    });

    it('selectRecordingIsLoading should return false for recording state', () => {
      expect(selectRecordingIsLoading(mockRootState as any)).toBe(false);
    });

    it('selectRecordingIsLoading should return false for idle state', () => {
      const idleState = {
        ...mockRootState,
        recording: { ...mockRootState.recording, state: 'idle' as const },
      };
      expect(selectRecordingIsLoading(idleState as any)).toBe(false);
    });
  });

  describe('action types', () => {
    it('should have correct action type for startRecordingRequest', () => {
      expect(startRecordingRequest.type).toBe('recording/startRecordingRequest');
    });

    it('should have correct action type for startRecordingSuccess', () => {
      expect(startRecordingSuccess.type).toBe('recording/startRecordingSuccess');
    });

    it('should have correct action type for updateDuration', () => {
      expect(updateDuration.type).toBe('recording/updateDuration');
    });

    it('should have correct action type for stopRecordingRequest', () => {
      expect(stopRecordingRequest.type).toBe('recording/stopRecordingRequest');
    });

    it('should have correct action type for stopRecordingSuccess', () => {
      expect(stopRecordingSuccess.type).toBe('recording/stopRecordingSuccess');
    });

    it('should have correct action type for setRecordingError', () => {
      expect(setRecordingError.type).toBe('recording/setRecordingError');
    });

    it('should have correct action type for resetRecording', () => {
      expect(resetRecording.type).toBe('recording/resetRecording');
    });

    it('should have correct action type for clearLastResult', () => {
      expect(clearLastResult.type).toBe('recording/clearLastResult');
    });
  });
});
