/**
 * useAppStateRecording Hook
 *
 * Handles app state changes (foreground/background) for video recording.
 * Automatically cancels recording when app goes to background to prevent
 * resource issues and ensure proper cleanup.
 */

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { videoRecordingService } from '@/src/services/camera/recording';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { resetRecording, selectIsRecording } from '@/src/store/slices/recordingSlice';

export interface UseAppStateRecordingOptions {
  /** Callback when recording is cancelled due to backgrounding */
  onBackgroundCancel?: () => void;
}

/**
 * Hook that handles app state changes for recording
 *
 * When the app goes to background while recording:
 * 1. Cancels the current recording
 * 2. Resets Redux state
 * 3. Calls optional callback
 *
 * @example
 * ```tsx
 * useAppStateRecording({
 *   onBackgroundCancel: () => {
 *     Alert.alert('Recording Cancelled', 'Recording was cancelled because the app went to background');
 *   }
 * });
 * ```
 */
export function useAppStateRecording(options?: UseAppStateRecordingOptions) {
  const dispatch = useAppDispatch();
  const isRecording = useAppSelector(selectIsRecording);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // App is going to background
      if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // If recording, cancel it
        if (isRecording) {
          await videoRecordingService.cancelRecording();
          dispatch(resetRecording());
          options?.onBackgroundCancel?.();
        }
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isRecording, dispatch, options]);
}

export default useAppStateRecording;
