/**
 * useFrameCapture Hook
 *
 * Custom hook that integrates the FrameCaptureService with Redux state.
 * Provides a simple API for components to control frame capture.
 */

import { useCallback, useEffect, useRef } from 'react';
import { CameraView } from 'expo-camera';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
  startCaptureRequest,
  startCaptureSuccess,
  addCapturedFrame,
  updateFrameCount,
  stopCaptureRequest,
  stopCaptureSuccess,
  setCaptureError,
  resetCapture,
  selectCaptureState,
  selectIsCapturing,
  selectFrameCount,
  selectCapturedFrames,
  selectCaptureError,
  selectCaptureIsLoading,
  selectLastCaptureResult,
} from '@/src/store/slices/captureSlice';
import {
  frameCaptureService,
  CaptureOptions,
  CapturedFrame,
} from '@/src/services/camera/capture';

export interface UseFrameCaptureOptions {
  /** Camera ref for capture */
  cameraRef: React.RefObject<CameraView>;
  /** Callback when capture starts successfully */
  onCaptureStart?: () => void;
  /** Callback when capture stops with result */
  onCaptureStop?: (frames: CapturedFrame[]) => void;
  /** Callback when a new frame is captured */
  onFrameCaptured?: (frame: CapturedFrame) => void;
  /** Callback when capture encounters an error */
  onCaptureError?: (error: string) => void;
}

export interface UseFrameCaptureReturn {
  /** Current capture state */
  captureState: ReturnType<typeof selectCaptureState>;
  /** Whether currently capturing */
  isCapturing: boolean;
  /** Whether capture is starting or stopping */
  isLoading: boolean;
  /** Current frame count */
  frameCount: number;
  /** Captured frames array */
  frames: CapturedFrame[];
  /** Last capture result */
  lastResult: CapturedFrame[] | null;
  /** Error message if any */
  error: string | null;
  /** Start capture */
  startCapture: (options?: CaptureOptions) => Promise<void>;
  /** Stop capture */
  stopCapture: () => Promise<CapturedFrame[] | null>;
  /** Cancel capture (for app backgrounding) */
  cancelCapture: () => Promise<void>;
  /** Reset capture state */
  reset: () => void;
}

/**
 * Hook for managing frame capture with Redux state
 */
export function useFrameCapture({
  cameraRef,
  onCaptureStart,
  onCaptureStop,
  onFrameCaptured,
  onCaptureError,
}: UseFrameCaptureOptions): UseFrameCaptureReturn {
  const dispatch = useAppDispatch();

  // Selectors
  const captureState = useAppSelector(selectCaptureState);
  const isCapturing = useAppSelector(selectIsCapturing);
  const isLoading = useAppSelector(selectCaptureIsLoading);
  const frameCount = useAppSelector(selectFrameCount);
  const frames = useAppSelector(selectCapturedFrames);
  const error = useAppSelector(selectCaptureError);
  const lastResult = useAppSelector(selectLastCaptureResult);

  // Frame polling ref
  const framePollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Set camera ref on mount and when it changes
  useEffect(() => {
    if (cameraRef.current) {
      frameCaptureService.setCameraRef(cameraRef);
    }
  }, [cameraRef]);

  // Frame polling management - poll service for new frames
  useEffect(() => {
    if (isCapturing && !framePollingIntervalRef.current) {
      // Poll every 100ms for new frames
      framePollingIntervalRef.current = setInterval(() => {
        const serviceFrameCount = frameCaptureService.getFrameCount();
        if (serviceFrameCount > frameCount) {
          // New frames captured - update Redux
          const allFrames = frameCaptureService.getFrames();
          const newFrames = allFrames.slice(frameCount);
          newFrames.forEach((frame) => {
            dispatch(addCapturedFrame(frame));
            onFrameCaptured?.(frame);
          });
        }
      }, 100); // Poll every 100ms for UI updates
    } else if (!isCapturing && framePollingIntervalRef.current) {
      clearInterval(framePollingIntervalRef.current);
      framePollingIntervalRef.current = null;
    }

    return () => {
      if (framePollingIntervalRef.current) {
        clearInterval(framePollingIntervalRef.current);
        framePollingIntervalRef.current = null;
      }
    };
  }, [isCapturing, frameCount, dispatch, onFrameCaptured]);

  /**
   * Start capture
   */
  const startCapture = useCallback(
    async (options?: CaptureOptions) => {
      dispatch(startCaptureRequest());

      const result = await frameCaptureService.startCapture(options);

      if (result.success) {
        dispatch(startCaptureSuccess({ startedAt: result.data.startedAt }));
        onCaptureStart?.();
      } else {
        dispatch(setCaptureError(result.error));
        onCaptureError?.(result.error);
      }
    },
    [dispatch, onCaptureStart, onCaptureError]
  );

  /**
   * Stop capture
   */
  const stopCapture = useCallback(async (): Promise<CapturedFrame[] | null> => {
    dispatch(stopCaptureRequest());

    const result = await frameCaptureService.stopCapture();

    if (result.success) {
      dispatch(stopCaptureSuccess(result.data));
      onCaptureStop?.(result.data);
      return result.data;
    } else {
      dispatch(setCaptureError(result.error));
      onCaptureError?.(result.error);
      return null;
    }
  }, [dispatch, onCaptureStop, onCaptureError]);

  /**
   * Cancel capture (for app backgrounding)
   */
  const cancelCapture = useCallback(async () => {
    await frameCaptureService.cancelCapture();
    dispatch(resetCapture());
  }, [dispatch]);

  /**
   * Reset capture state
   */
  const reset = useCallback(() => {
    frameCaptureService.reset();
    dispatch(resetCapture());
  }, [dispatch]);

  return {
    captureState,
    isCapturing,
    isLoading,
    frameCount,
    frames,
    lastResult,
    error,
    startCapture,
    stopCapture,
    cancelCapture,
    reset,
  };
}

export default useFrameCapture;
