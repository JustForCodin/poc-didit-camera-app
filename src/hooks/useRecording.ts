/**
 * useRecording Hook
 *
 * Custom hook that integrates the VideoRecordingService with Redux state.
 * Provides a simple API for components to control video recording.
 */

import { useCallback, useEffect, useRef } from 'react';
import { CameraView } from 'expo-camera';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
  startRecordingRequest,
  startRecordingSuccess,
  updateDuration,
  stopRecordingRequest,
  stopRecordingSuccess,
  setRecordingError,
  resetRecording,
  selectRecordingState,
  selectIsRecording,
  selectRecordingDuration,
  selectRecordingError,
  selectRecordingIsLoading,
  selectLastRecordingResult,
} from '@/src/store/slices/recordingSlice';
import {
  videoRecordingService,
  RecordingOptions,
  RecordingResult,
} from '@/src/services/camera/recording';

export interface UseRecordingOptions {
  /** Camera ref for recording */
  cameraRef: React.RefObject<CameraView>;
  /** Callback when recording starts successfully */
  onRecordingStart?: () => void;
  /** Callback when recording stops with result */
  onRecordingStop?: (result: RecordingResult) => void;
  /** Callback when recording encounters an error */
  onRecordingError?: (error: string) => void;
}

export interface UseRecordingReturn {
  /** Current recording state */
  recordingState: ReturnType<typeof selectRecordingState>;
  /** Whether currently recording */
  isRecording: boolean;
  /** Whether recording is starting or stopping */
  isLoading: boolean;
  /** Current recording duration in milliseconds */
  durationMs: number;
  /** Last recording result */
  lastResult: RecordingResult | null;
  /** Error message if any */
  error: string | null;
  /** Start recording */
  startRecording: (options?: RecordingOptions) => Promise<void>;
  /** Stop recording */
  stopRecording: () => Promise<RecordingResult | null>;
  /** Cancel recording (for app backgrounding) */
  cancelRecording: () => Promise<void>;
  /** Reset recording state */
  reset: () => void;
}

/**
 * Hook for managing video recording with Redux state
 */
export function useRecording({
  cameraRef,
  onRecordingStart,
  onRecordingStop,
  onRecordingError,
}: UseRecordingOptions): UseRecordingReturn {
  const dispatch = useAppDispatch();

  // Selectors
  const recordingState = useAppSelector(selectRecordingState);
  const isRecording = useAppSelector(selectIsRecording);
  const isLoading = useAppSelector(selectRecordingIsLoading);
  const durationMs = useAppSelector(selectRecordingDuration);
  const error = useAppSelector(selectRecordingError);
  const lastResult = useAppSelector(selectLastRecordingResult);

  // Duration timer ref
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Set camera ref on mount and when it changes
  useEffect(() => {
    if (cameraRef.current) {
      videoRecordingService.setCameraRef(cameraRef);
    }
  }, [cameraRef]);

  // Duration timer management
  useEffect(() => {
    if (isRecording && !durationIntervalRef.current) {
      startTimeRef.current = Date.now();
      durationIntervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Date.now() - startTimeRef.current;
          dispatch(updateDuration(elapsed));
        }
      }, 100); // Update every 100ms
    } else if (!isRecording && durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
      startTimeRef.current = null;
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };
  }, [isRecording, dispatch]);

  /**
   * Start recording
   */
  const startRecording = useCallback(
    async (options?: RecordingOptions) => {
      dispatch(startRecordingRequest());

      const result = await videoRecordingService.startRecording(options);

      if (result.success) {
        dispatch(startRecordingSuccess({ startedAt: result.data.startedAt }));
        onRecordingStart?.();
      } else {
        dispatch(setRecordingError(result.error));
        onRecordingError?.(result.error);
      }
    },
    [dispatch, onRecordingStart, onRecordingError]
  );

  /**
   * Stop recording
   */
  const stopRecording = useCallback(async (): Promise<RecordingResult | null> => {
    dispatch(stopRecordingRequest());

    const result = await videoRecordingService.stopRecording();

    if (result.success) {
      dispatch(stopRecordingSuccess(result.data));
      onRecordingStop?.(result.data);
      return result.data;
    } else {
      dispatch(setRecordingError(result.error));
      onRecordingError?.(result.error);
      return null;
    }
  }, [dispatch, onRecordingStop, onRecordingError]);

  /**
   * Cancel recording (for app backgrounding)
   */
  const cancelRecording = useCallback(async () => {
    await videoRecordingService.cancelRecording();
    dispatch(resetRecording());
  }, [dispatch]);

  /**
   * Reset recording state
   */
  const reset = useCallback(() => {
    videoRecordingService.reset();
    dispatch(resetRecording());
  }, [dispatch]);

  return {
    recordingState,
    isRecording,
    isLoading,
    durationMs,
    lastResult,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    reset,
  };
}

export default useRecording;
