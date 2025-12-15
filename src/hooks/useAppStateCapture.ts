/**
 * useAppStateCapture Hook
 *
 * Handles app state changes (foreground/background) for frame capture and dual capture.
 * Automatically cancels capture/dual capture when app goes to background to prevent
 * resource issues and ensure proper cleanup.
 */

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { frameCaptureService } from '@/src/services/camera/capture';
import { dualCaptureService } from '@/src/services/camera/dualCapture';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { resetCapture, selectIsCapturing } from '@/src/store/slices/captureSlice';
import { resetDualCapture, selectIsDualCaptureActive } from '@/src/store/slices/dualCaptureSlice';

export interface UseAppStateCaptureOptions {
  /** Callback when capture is cancelled due to backgrounding */
  onBackgroundCancel?: () => void;
  /** Enable dual capture mode (default: false) */
  enableDualCapture?: boolean;
}

/**
 * Hook that handles app state changes for frame capture and dual capture
 *
 * When the app goes to background while capturing:
 * 1. Cancels the current capture (or dual capture if enabled)
 * 2. Resets Redux state
 * 3. Calls optional callback
 *
 * @example
 * ```tsx
 * // Frame capture only
 * useAppStateCapture({
 *   onBackgroundCancel: () => {
 *     Alert.alert('Capture Cancelled', 'Frame capture was cancelled because the app went to background');
 *   }
 * });
 *
 * // Dual capture mode
 * useAppStateCapture({
 *   enableDualCapture: true,
 *   onBackgroundCancel: () => {
 *     Alert.alert('Session Cancelled', 'Recording was cancelled because the app went to background');
 *   }
 * });
 * ```
 */
export function useAppStateCapture(options?: UseAppStateCaptureOptions) {
  const dispatch = useAppDispatch();
  const isCapturing = useAppSelector(selectIsCapturing);
  const isDualCaptureActive = useAppSelector(selectIsDualCaptureActive);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // App is going to background
      if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // Handle dual capture if enabled
        if (options?.enableDualCapture && isDualCaptureActive) {
          await dualCaptureService.cancelDualCapture();
          dispatch(resetDualCapture());
          options?.onBackgroundCancel?.();
        }
        // Handle frame capture only if not in dual capture mode
        else if (!options?.enableDualCapture && isCapturing) {
          await frameCaptureService.cancelCapture();
          dispatch(resetCapture());
          options?.onBackgroundCancel?.();
        }
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isCapturing, isDualCaptureActive, dispatch, options]);
}

export default useAppStateCapture;
