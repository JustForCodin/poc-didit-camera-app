/**
 * useDualCapture Hook
 *
 * Custom hook that integrates the DualCaptureService with Redux state.
 * Provides a simple API for components to control dual capture (video + frames).
 */

import { useCallback, useEffect } from 'react';
import { CameraView } from 'expo-camera';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
  startDualCaptureRequest,
  startDualCaptureSuccess,
  updateDualCaptureFrameCount,
  stopDualCaptureRequest,
  stopDualCaptureSuccess,
  setDualCaptureError,
  resetDualCapture,
  selectDualCaptureState,
  selectIsDualCaptureActive,
  selectDualCaptureFrameCount,
  selectLastDualCaptureSession,
  selectDualCaptureError,
  selectDualCaptureIsLoading,
} from '@/src/store/slices';
import {
  dualCaptureService,
  DualCaptureOptions,
  DualCaptureSession,
} from '@/src/services/camera/dualCapture';
import type { RecordingState } from '@/src/services/camera/recording';
import type { CaptureState, CapturedFrame } from '@/src/services/camera/capture';

export interface UseDualCaptureOptions {
  /** Camera ref for dual capture */
  cameraRef: React.RefObject<CameraView>;
  /** Callback when dual capture starts successfully */
  onCaptureStart?: () => void;
  /** Callback when dual capture stops with session data */
  onCaptureStop?: (session: DualCaptureSession) => void;
  /** Callback when a new frame is captured */
  onFrameCaptured?: (frame: CapturedFrame) => void;
  /** Callback when dual capture encounters an error */
  onCaptureError?: (error: string) => void;
}

export interface UseDualCaptureReturn {
  /** Current dual capture state */
  dualCaptureState: ReturnType<typeof selectDualCaptureState>;
  /** Whether currently active */
  isActive: boolean;
  /** Whether dual capture is starting or stopping */
  isLoading: boolean;
  /** Current frame count */
  frameCount: number;
  /** Recording state */
  recordingState: RecordingState;
  /** Capture state */
  captureState: CaptureState;
  /** Last completed session */
  lastSession: DualCaptureSession | null;
  /** Error message if any */
  error: string | null;
  /** Start dual capture */
  startDualCapture: (options?: DualCaptureOptions) => Promise<void>;
  /** Stop dual capture */
  stopDualCapture: () => Promise<DualCaptureSession | null>;
  /** Cancel dual capture (for app backgrounding) */
  cancelDualCapture: () => Promise<void>;
  /** Reset dual capture state */
  reset: () => void;
}

/**
 * Hook for managing dual capture with Redux state
 */
export function useDualCapture({
  cameraRef,
  onCaptureStart,
  onCaptureStop,
  onFrameCaptured,
  onCaptureError,
}: UseDualCaptureOptions): UseDualCaptureReturn {
  const dispatch = useAppDispatch();

  // Selectors
  const dualCaptureState = useAppSelector(selectDualCaptureState);
  const isActive = useAppSelector(selectIsDualCaptureActive);
  const isLoading = useAppSelector(selectDualCaptureIsLoading);
  const frameCount = useAppSelector(selectDualCaptureFrameCount);
  const error = useAppSelector(selectDualCaptureError);
  const lastSession = useAppSelector(selectLastDualCaptureSession);

  // Get individual service states
  const recordingState = dualCaptureService.getRecordingState();
  const captureState = dualCaptureService.getCaptureState();

  // Set camera ref on mount and when it changes
  useEffect(() => {
    if (cameraRef.current) {
      dualCaptureService.setCameraRef(cameraRef);
    }
  }, [cameraRef]);

  // Set up frame capture callback for real-time updates
  useEffect(() => {
    const handleFrameCaptured = (frame: CapturedFrame) => {
      // Update Redux with real-time frame count
      dispatch(updateDualCaptureFrameCount(dualCaptureService.getFrameCount()));
      onFrameCaptured?.(frame);
    };

    dualCaptureService.setOnFrameCaptured(handleFrameCaptured);

    return () => {
      dualCaptureService.setOnFrameCaptured(undefined);
    };
  }, [dispatch, onFrameCaptured]);

  /**
   * Start dual capture
   */
  const startDualCapture = useCallback(
    async (options?: DualCaptureOptions) => {
      dispatch(startDualCaptureRequest());

      const result = await dualCaptureService.startDualCapture(options);

      if (result.success) {
        dispatch(startDualCaptureSuccess({ startedAt: result.data.startedAt }));
        onCaptureStart?.();
      } else {
        dispatch(setDualCaptureError(result.error));
        onCaptureError?.(result.error);
      }
    },
    [dispatch, onCaptureStart, onCaptureError]
  );

  /**
   * Stop dual capture
   */
  const stopDualCapture = useCallback(async (): Promise<DualCaptureSession | null> => {
    dispatch(stopDualCaptureRequest());

    const result = await dualCaptureService.stopDualCapture();

    if (result.success) {
      dispatch(stopDualCaptureSuccess(result.data));
      onCaptureStop?.(result.data);
      return result.data;
    } else {
      dispatch(setDualCaptureError(result.error));
      onCaptureError?.(result.error);
      return null;
    }
  }, [dispatch, onCaptureStop, onCaptureError]);

  /**
   * Cancel dual capture (for app backgrounding)
   */
  const cancelDualCapture = useCallback(async () => {
    await dualCaptureService.cancelDualCapture();
    dispatch(resetDualCapture());
  }, [dispatch]);

  /**
   * Reset dual capture state
   */
  const reset = useCallback(() => {
    dualCaptureService.reset();
    dispatch(resetDualCapture());
  }, [dispatch]);

  return {
    dualCaptureState,
    isActive,
    isLoading,
    frameCount,
    recordingState,
    captureState,
    lastSession,
    error,
    startDualCapture,
    stopDualCapture,
    cancelDualCapture,
    reset,
  };
}

export default useDualCapture;
