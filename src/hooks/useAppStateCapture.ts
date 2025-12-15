/**
 * useAppStateCapture Hook
 *
 * Handles app state changes (foreground/background) for frame capture.
 * Automatically cancels capture when app goes to background to prevent
 * resource issues and ensure proper cleanup.
 */

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { frameCaptureService } from '@/src/services/camera/capture';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { resetCapture, selectIsCapturing } from '@/src/store/slices/captureSlice';

export interface UseAppStateCaptureOptions {
  /** Callback when capture is cancelled due to backgrounding */
  onBackgroundCancel?: () => void;
}

/**
 * Hook that handles app state changes for frame capture
 *
 * When the app goes to background while capturing:
 * 1. Cancels the current capture
 * 2. Resets Redux state
 * 3. Calls optional callback
 *
 * @example
 * ```tsx
 * useAppStateCapture({
 *   onBackgroundCancel: () => {
 *     Alert.alert('Capture Cancelled', 'Frame capture was cancelled because the app went to background');
 *   }
 * });
 * ```
 */
export function useAppStateCapture(options?: UseAppStateCaptureOptions) {
  const dispatch = useAppDispatch();
  const isCapturing = useAppSelector(selectIsCapturing);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // App is going to background
      if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // If capturing, cancel it
        if (isCapturing) {
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
  }, [isCapturing, dispatch, options]);
}

export default useAppStateCapture;
