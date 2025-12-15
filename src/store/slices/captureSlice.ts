/**
 * Capture Slice
 *
 * Redux slice for managing frame capture state in the UI.
 *
 * IMPORTANT: This slice is NOT persisted via Redux Persist.
 * Capture state is transient and should reset on app restart.
 * The actual capture service (FrameCaptureService) manages the hardware.
 *
 * This slice is for UI state only (capture status, frame count, error states).
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { CaptureState as ServiceCaptureState, CapturedFrame } from '@/src/services/camera/capture';

/**
 * Capture state interface for Redux store
 */
export interface CaptureSliceState {
  /** Current capture state */
  state: ServiceCaptureState;
  /** Whether currently capturing */
  isCapturing: boolean;
  /** Timestamp when capture started (ISO string) */
  startedAt: string | null;
  /** Current frame count (updated as frames are captured) */
  frameCount: number;
  /** Captured frames array */
  frames: CapturedFrame[];
  /** Last capture result (after stopping) */
  lastResult: CapturedFrame[] | null;
  /** Error message if capture failed */
  error: string | null;
}

/**
 * Initial capture state
 */
const initialState: CaptureSliceState = {
  state: 'idle',
  isCapturing: false,
  startedAt: null,
  frameCount: 0,
  frames: [],
  lastResult: null,
  error: null,
};

/**
 * Capture slice
 */
const captureSlice = createSlice({
  name: 'capture',
  initialState,
  reducers: {
    /**
     * Set capture state to starting
     * Called when capture is initiated
     */
    startCaptureRequest: (state) => {
      state.state = 'starting';
      state.isCapturing = false;
      state.error = null;
      state.frames = [];
      state.frameCount = 0;
    },

    /**
     * Set capture state to active
     * Called when capture successfully starts
     */
    startCaptureSuccess: (state, action: PayloadAction<{ startedAt: string }>) => {
      state.state = 'capturing';
      state.isCapturing = true;
      state.startedAt = action.payload.startedAt;
      state.error = null;
    },

    /**
     * Add a captured frame to the collection
     * Called when a new frame is captured
     */
    addCapturedFrame: (state, action: PayloadAction<CapturedFrame>) => {
      state.frames.push(action.payload);
      state.frameCount = state.frames.length;
    },

    /**
     * Update current frame count
     * Called periodically during capture
     */
    updateFrameCount: (state, action: PayloadAction<number>) => {
      state.frameCount = action.payload;
    },

    /**
     * Set capture state to stopping
     * Called when stop is initiated
     */
    stopCaptureRequest: (state) => {
      state.state = 'stopping';
    },

    /**
     * Set capture complete with result
     * Called when capture successfully stops
     */
    stopCaptureSuccess: (state, action: PayloadAction<CapturedFrame[]>) => {
      state.state = 'idle';
      state.isCapturing = false;
      state.lastResult = action.payload;
      state.startedAt = null;
      state.error = null;
    },

    /**
     * Set capture error
     * Called when capture operation fails
     */
    setCaptureError: (state, action: PayloadAction<string>) => {
      state.state = 'error';
      state.isCapturing = false;
      state.error = action.payload;
    },

    /**
     * Reset capture state
     * Called on cleanup or app backgrounding
     */
    resetCapture: (state) => {
      state.state = 'idle';
      state.isCapturing = false;
      state.startedAt = null;
      state.frameCount = 0;
      state.frames = [];
      state.error = null;
      // Note: lastResult is preserved for review
    },

    /**
     * Clear last capture result
     * Called when navigating away from review
     */
    clearLastResult: (state) => {
      state.lastResult = null;
    },
  },
});

// Export actions
export const {
  startCaptureRequest,
  startCaptureSuccess,
  addCapturedFrame,
  updateFrameCount,
  stopCaptureRequest,
  stopCaptureSuccess,
  setCaptureError,
  resetCapture,
  clearLastResult,
} = captureSlice.actions;

// Export reducer
export default captureSlice.reducer;

// Selectors
/**
 * Select current capture state
 */
export const selectCaptureState = (state: RootState): ServiceCaptureState =>
  state.capture.state;

/**
 * Select whether currently capturing
 */
export const selectIsCapturing = (state: RootState): boolean =>
  state.capture.isCapturing;

/**
 * Select capture start timestamp
 */
export const selectCaptureStartedAt = (state: RootState): string | null =>
  state.capture.startedAt;

/**
 * Select current frame count
 */
export const selectFrameCount = (state: RootState): number =>
  state.capture.frameCount;

/**
 * Select captured frames array
 */
export const selectCapturedFrames = (state: RootState): CapturedFrame[] =>
  state.capture.frames;

/**
 * Select last capture result
 */
export const selectLastCaptureResult = (state: RootState): CapturedFrame[] | null =>
  state.capture.lastResult;

/**
 * Select capture error
 */
export const selectCaptureError = (state: RootState): string | null =>
  state.capture.error;

/**
 * Select whether capture is loading (starting or stopping)
 */
export const selectCaptureIsLoading = (state: RootState): boolean =>
  state.capture.state === 'starting' || state.capture.state === 'stopping';
