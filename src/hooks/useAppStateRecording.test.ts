/**
 * useAppStateRecording Hook Tests
 *
 * Tests for the useAppStateRecording custom hook that handles
 * app backgrounding during recording.
 */

import { renderHook, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native';
import React from 'react';

import { useAppStateRecording } from './useAppStateRecording';
import { videoRecordingService } from '@/src/services/camera/recording';
import recordingReducer, {
  startRecordingSuccess,
} from '@/src/store/slices/recordingSlice';
import settingsReducer from '@/src/store/slices/settingsSlice';
import authReducer from '@/src/store/slices/authSlice';

// Mock the recording service
jest.mock('@/src/services/camera/recording', () => ({
  videoRecordingService: {
    cancelRecording: jest.fn().mockResolvedValue({ success: true }),
  },
}));

// Store the callback for triggering in tests
let appStateCallback: ((state: AppStateStatus) => void) | null = null;
const mockRemove = jest.fn();

// Create a test store
function createTestStore(isRecording = false) {
  const store = configureStore({
    reducer: {
      recording: recordingReducer,
      settings: settingsReducer,
      auth: authReducer,
    },
  });

  // If we want to start in recording state
  if (isRecording) {
    store.dispatch(startRecordingSuccess({ startedAt: new Date().toISOString() }));
  }

  return store;
}

// Wrapper component for hooks
function createWrapper(store: ReturnType<typeof createTestStore>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(Provider, { store, children });
  };
}

describe('useAppStateRecording', () => {
  // Store original values
  const originalAddEventListener = AppState.addEventListener;
  const originalCurrentState = Object.getOwnPropertyDescriptor(AppState, 'currentState');

  beforeEach(() => {
    jest.clearAllMocks();
    appStateCallback = null;

    // Mock currentState to be 'active' (simulating app in foreground)
    // This is important because the hook uses useRef(AppState.currentState) on mount
    Object.defineProperty(AppState, 'currentState', {
      value: 'active',
      writable: true,
      configurable: true,
    });

    // Mock addEventListener to capture callback
    (AppState as any).addEventListener = jest.fn((event: string, callback: (state: AppStateStatus) => void) => {
      appStateCallback = callback;
      return { remove: mockRemove } as NativeEventSubscription;
    });
  });

  afterEach(() => {
    // Restore original addEventListener
    (AppState as any).addEventListener = originalAddEventListener;
    // Restore original currentState
    if (originalCurrentState) {
      Object.defineProperty(AppState, 'currentState', originalCurrentState);
    }
  });

  describe('AppState listener', () => {
    it('should add AppState listener on mount', () => {
      const store = createTestStore();

      renderHook(
        () => useAppStateRecording(),
        { wrapper: createWrapper(store) }
      );

      expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should remove AppState listener on unmount', () => {
      const store = createTestStore();

      const { unmount } = renderHook(
        () => useAppStateRecording(),
        { wrapper: createWrapper(store) }
      );

      unmount();

      expect(mockRemove).toHaveBeenCalled();
    });
  });

  describe('background handling when recording', () => {
    it('should cancel recording when app goes to background', async () => {
      const store = createTestStore(true); // Start with recording state

      renderHook(
        () => useAppStateRecording(),
        { wrapper: createWrapper(store) }
      );

      // Verify we're recording
      expect(store.getState().recording.isRecording).toBe(true);

      // Simulate app going to background (from active state)
      await act(async () => {
        if (appStateCallback) {
          appStateCallback('background');
        }
      });

      expect(videoRecordingService.cancelRecording).toHaveBeenCalled();
    });

    it('should cancel recording when app goes to inactive', async () => {
      const store = createTestStore(true);

      renderHook(
        () => useAppStateRecording(),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        if (appStateCallback) {
          appStateCallback('inactive');
        }
      });

      expect(videoRecordingService.cancelRecording).toHaveBeenCalled();
    });

    it('should call onBackgroundCancel callback when cancelling', async () => {
      const store = createTestStore(true);
      const onBackgroundCancel = jest.fn();

      renderHook(
        () => useAppStateRecording({ onBackgroundCancel }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        if (appStateCallback) {
          appStateCallback('background');
        }
      });

      expect(onBackgroundCancel).toHaveBeenCalled();
    });

    it('should reset Redux state when cancelling', async () => {
      const store = createTestStore(true);

      renderHook(
        () => useAppStateRecording(),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        if (appStateCallback) {
          appStateCallback('background');
        }
      });

      // State should be reset
      expect(store.getState().recording.state).toBe('idle');
      expect(store.getState().recording.isRecording).toBe(false);
    });
  });

  describe('background handling when not recording', () => {
    it('should not cancel when not recording', async () => {
      const store = createTestStore(false); // Not recording

      renderHook(
        () => useAppStateRecording(),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        if (appStateCallback) {
          appStateCallback('background');
        }
      });

      expect(videoRecordingService.cancelRecording).not.toHaveBeenCalled();
    });

    it('should not call onBackgroundCancel when not recording', async () => {
      const store = createTestStore(false);
      const onBackgroundCancel = jest.fn();

      renderHook(
        () => useAppStateRecording({ onBackgroundCancel }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        if (appStateCallback) {
          appStateCallback('background');
        }
      });

      expect(onBackgroundCancel).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle transition to inactive state', async () => {
      const store = createTestStore(true);

      renderHook(
        () => useAppStateRecording(),
        { wrapper: createWrapper(store) }
      );

      // Transition from active to inactive
      await act(async () => {
        if (appStateCallback) {
          appStateCallback('inactive');
        }
      });

      // Should have cancelled on inactive transition (from active)
      expect(videoRecordingService.cancelRecording).toHaveBeenCalled();
    });

    it('should work without options', () => {
      const store = createTestStore();

      // Should not throw
      expect(() => {
        renderHook(
          () => useAppStateRecording(),
          { wrapper: createWrapper(store) }
        );
      }).not.toThrow();
    });

    it('should work with empty options', () => {
      const store = createTestStore();

      // Should not throw
      expect(() => {
        renderHook(
          () => useAppStateRecording({}),
          { wrapper: createWrapper(store) }
        );
      }).not.toThrow();
    });
  });
});
