/**
 * Dual Capture Slice
 *
 * Redux slice for managing dual capture state in the UI.
 *
 * IMPORTANT: This slice is NOT persisted via Redux Persist.
 * Dual capture state is transient and should reset on app restart.
 * The actual dual capture service (DualCaptureService) manages the hardware coordination.
 *
 * This slice is for UI state only (capture status, frame count, error states, last session).
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { DualCaptureState as ServiceDualCaptureState, DualCaptureSession } from '@/src/services/camera/dualCapture';

/**
 * Dual capture state interface for Redux store
 */
export interface DualCaptureSliceState {
  /** Current dual capture state */
  state: ServiceDualCaptureState;
  /** Whether currently active */
  isActive: boolean;
  /** Timestamp when session started (ISO string) */
  startedAt: string | null;
  /** Current frame count (updated as frames are captured) */
  frameCount: number;
  /** Last completed session data */
  lastSession: DualCaptureSession | null;
  /** Error message if dual capture failed */
  error: string | null;
}

/**
 * Initial dual capture state
 */
const initialState: DualCaptureSliceState = {
  state: 'idle',
  isActive: false,
  startedAt: null,
  frameCount: 0,
  lastSession: null,
  error: null,
};

/**
 * Dual capture slice
 */
const dualCaptureSlice = createSlice({
  name: 'dualCapture',
  initialState,
  reducers: {
    /**
     * Set dual capture state to starting
     * Called when dual capture is initiated
     */
    startDualCaptureRequest: (state) => {
      state.state = 'starting';
      state.isActive = false;
      state.error = null;
      state.frameCount = 0;
    },

    /**
     * Set dual capture state to active
     * Called when dual capture successfully starts
     */
    startDualCaptureSuccess: (state, action: PayloadAction<{ startedAt: string }>) => {
      state.state = 'active';
      state.isActive = true;
      state.startedAt = action.payload.startedAt;
      state.error = null;
    },

    /**
     * Update current frame count
     * Called periodically during capture (real-time updates)
     */
    updateFrameCount: (state, action: PayloadAction<number>) => {
      state.frameCount = action.payload;
    },

    /**
     * Set dual capture state to stopping
     * Called when stop is initiated
     */
    stopDualCaptureRequest: (state) => {
      state.state = 'stopping';
    },

    /**
     * Set dual capture complete with session data
     * Called when dual capture successfully stops
     */
    stopDualCaptureSuccess: (state, action: PayloadAction<DualCaptureSession>) => {
      state.state = 'idle';
      state.isActive = false;
      state.lastSession = action.payload;
      state.startedAt = null;
      state.frameCount = 0;
      state.error = null;
    },

    /**
     * Set dual capture error
     * Called when dual capture operation fails
     */
    setDualCaptureError: (state, action: PayloadAction<string>) => {
      state.state = 'error';
      state.isActive = false;
      state.error = action.payload;
    },

    /**
     * Reset dual capture state
     * Called on cleanup or app backgrounding
     */
    resetDualCapture: (state) => {
      state.state = 'idle';
      state.isActive = false;
      state.startedAt = null;
      state.frameCount = 0;
      state.error = null;
      // Note: lastSession is preserved for review
    },

    /**
     * Clear last session data
     * Called when navigating away from review
     */
    clearLastSession: (state) => {
      state.lastSession = null;
    },
  },
});

// Export actions
export const {
  startDualCaptureRequest,
  startDualCaptureSuccess,
  updateFrameCount,
  stopDualCaptureRequest,
  stopDualCaptureSuccess,
  setDualCaptureError,
  resetDualCapture,
  clearLastSession,
} = dualCaptureSlice.actions;

// Export reducer
export default dualCaptureSlice.reducer;

// Selectors
/**
 * Select current dual capture state
 */
export const selectDualCaptureState = (state: RootState): ServiceDualCaptureState =>
  state.dualCapture.state;

/**
 * Select whether currently active
 */
export const selectIsDualCaptureActive = (state: RootState): boolean =>
  state.dualCapture.isActive;

/**
 * Select dual capture start timestamp
 */
export const selectDualCaptureStartedAt = (state: RootState): string | null =>
  state.dualCapture.startedAt;

/**
 * Select current frame count
 */
export const selectDualCaptureFrameCount = (state: RootState): number =>
  state.dualCapture.frameCount;

/**
 * Select last completed session
 */
export const selectLastDualCaptureSession = (state: RootState): DualCaptureSession | null =>
  state.dualCapture.lastSession;

/**
 * Select dual capture error
 */
export const selectDualCaptureError = (state: RootState): string | null =>
  state.dualCapture.error;

/**
 * Select whether dual capture is loading (starting or stopping)
 */
export const selectDualCaptureIsLoading = (state: RootState): boolean =>
  state.dualCapture.state === 'starting' || state.dualCapture.state === 'stopping';
