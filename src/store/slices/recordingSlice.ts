/**
 * Recording Slice
 *
 * Redux slice for managing video recording state in the UI.
 *
 * IMPORTANT: This slice is NOT persisted via Redux Persist.
 * Recording state is transient and should reset on app restart.
 * The actual recording service (VideoRecordingService) manages the hardware.
 *
 * This slice is for UI state only (recording status, duration, error states).
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { RecordingState as ServiceRecordingState, RecordingResult } from '@/src/services/camera/recording';

/**
 * Recording state interface for Redux store
 */
export interface RecordingSliceState {
  /** Current recording state */
  state: ServiceRecordingState;
  /** Whether currently recording */
  isRecording: boolean;
  /** Timestamp when recording started (ISO string) */
  startedAt: string | null;
  /** Current recording duration in milliseconds (updated periodically) */
  durationMs: number;
  /** Last recording result (after stopping) */
  lastResult: RecordingResult | null;
  /** Error message if recording failed */
  error: string | null;
}

/**
 * Initial recording state
 */
const initialState: RecordingSliceState = {
  state: 'idle',
  isRecording: false,
  startedAt: null,
  durationMs: 0,
  lastResult: null,
  error: null,
};

/**
 * Recording slice
 */
const recordingSlice = createSlice({
  name: 'recording',
  initialState,
  reducers: {
    /**
     * Set recording state to starting
     * Called when recording is initiated
     */
    startRecordingRequest: (state) => {
      state.state = 'starting';
      state.isRecording = false;
      state.error = null;
    },

    /**
     * Set recording state to active
     * Called when recording successfully starts
     */
    startRecordingSuccess: (state, action: PayloadAction<{ startedAt: string }>) => {
      state.state = 'recording';
      state.isRecording = true;
      state.startedAt = action.payload.startedAt;
      state.durationMs = 0;
      state.error = null;
    },

    /**
     * Update current recording duration
     * Called periodically during recording
     */
    updateDuration: (state, action: PayloadAction<number>) => {
      state.durationMs = action.payload;
    },

    /**
     * Set recording state to stopping
     * Called when stop is initiated
     */
    stopRecordingRequest: (state) => {
      state.state = 'stopping';
    },

    /**
     * Set recording complete with result
     * Called when recording successfully stops
     */
    stopRecordingSuccess: (state, action: PayloadAction<RecordingResult>) => {
      state.state = 'idle';
      state.isRecording = false;
      state.lastResult = action.payload;
      state.startedAt = null;
      state.error = null;
    },

    /**
     * Set recording error
     * Called when recording operation fails
     */
    setRecordingError: (state, action: PayloadAction<string>) => {
      state.state = 'error';
      state.isRecording = false;
      state.error = action.payload;
    },

    /**
     * Reset recording state
     * Called on cleanup or app backgrounding
     */
    resetRecording: (state) => {
      state.state = 'idle';
      state.isRecording = false;
      state.startedAt = null;
      state.durationMs = 0;
      state.error = null;
      // Note: lastResult is preserved for review
    },

    /**
     * Clear last recording result
     * Called when navigating away from review
     */
    clearLastResult: (state) => {
      state.lastResult = null;
    },
  },
});

// Export actions
export const {
  startRecordingRequest,
  startRecordingSuccess,
  updateDuration,
  stopRecordingRequest,
  stopRecordingSuccess,
  setRecordingError,
  resetRecording,
  clearLastResult,
} = recordingSlice.actions;

// Export reducer
export default recordingSlice.reducer;

// Selectors
/**
 * Select current recording state
 */
export const selectRecordingState = (state: RootState): ServiceRecordingState =>
  state.recording.state;

/**
 * Select whether currently recording
 */
export const selectIsRecording = (state: RootState): boolean =>
  state.recording.isRecording;

/**
 * Select recording start timestamp
 */
export const selectRecordingStartedAt = (state: RootState): string | null =>
  state.recording.startedAt;

/**
 * Select current recording duration in milliseconds
 */
export const selectRecordingDuration = (state: RootState): number =>
  state.recording.durationMs;

/**
 * Select last recording result
 */
export const selectLastRecordingResult = (state: RootState): RecordingResult | null =>
  state.recording.lastResult;

/**
 * Select recording error
 */
export const selectRecordingError = (state: RootState): string | null =>
  state.recording.error;

/**
 * Select whether recording is loading (starting or stopping)
 */
export const selectRecordingIsLoading = (state: RootState): boolean =>
  state.recording.state === 'starting' || state.recording.state === 'stopping';
