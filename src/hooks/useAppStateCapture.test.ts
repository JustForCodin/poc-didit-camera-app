/**
 * useAppStateCapture Hook Tests
 *
 * Tests for the useAppStateCapture custom hook that handles
 * app backgrounding during capture.
 */

import { renderHook, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native';
import React from 'react';

import { useAppStateCapture } from './useAppStateCapture';
import { frameCaptureService } from '@/src/services/camera/capture';
import captureReducer, {
  startCaptureSuccess,
} from '@/src/store/slices/captureSlice';
import recordingReducer from '@/src/store/slices/recordingSlice';
import settingsReducer from '@/src/store/slices/settingsSlice';
import authReducer from '@/src/store/slices/authSlice';

// Mock the capture service
jest.mock('@/src/services/camera/capture', () => ({
  frameCaptureService: {
    cancelCapture: jest.fn().mockResolvedValue({ success: true }),
  },
}));

// Store the callback for triggering in tests
let appStateCallback: ((state: AppStateStatus) => void) | null = null;
const mockRemove = jest.fn();

// Create a test store
function createTestStore(isCapturing = false) {
  const store = configureStore({
    reducer: {
      capture: captureReducer,
      recording: recordingReducer,
      settings: settingsReducer,
      auth: authReducer,
    },
  });

  // If we want to start in capturing state
  if (isCapturing) {
    store.dispatch(startCaptureSuccess({ startedAt: new Date().toISOString() }));
  }

  return store;
}

// Wrapper component for hooks
function createWrapper(store: ReturnType<typeof createTestStore>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(Provider, { store, children });
  };
}

describe('useAppStateCapture', () => {
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
        () => useAppStateCapture(),
        { wrapper: createWrapper(store) }
      );

      expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should remove AppState listener on unmount', () => {
      const store = createTestStore();

      const { unmount } = renderHook(
        () => useAppStateCapture(),
        { wrapper: createWrapper(store) }
      );

      unmount();

      expect(mockRemove).toHaveBeenCalled();
    });
  });

  describe('background handling when capturing', () => {
    it('should cancel capture when app goes to background', async () => {
      const store = createTestStore(true); // Start with capturing state

      renderHook(
        () => useAppStateCapture(),
        { wrapper: createWrapper(store) }
      );

      // Verify we're capturing
      expect(store.getState().capture.isCapturing).toBe(true);

      // Simulate app going to background (from active state)
      await act(async () => {
        if (appStateCallback) {
          appStateCallback('background');
        }
      });

      expect(frameCaptureService.cancelCapture).toHaveBeenCalled();
    });

    it('should cancel capture when app goes to inactive', async () => {
      const store = createTestStore(true);

      renderHook(
        () => useAppStateCapture(),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        if (appStateCallback) {
          appStateCallback('inactive');
        }
      });

      expect(frameCaptureService.cancelCapture).toHaveBeenCalled();
    });

    it('should call onBackgroundCancel callback when cancelling', async () => {
      const store = createTestStore(true);
      const onBackgroundCancel = jest.fn();

      renderHook(
        () => useAppStateCapture({ onBackgroundCancel }),
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
        () => useAppStateCapture(),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        if (appStateCallback) {
          appStateCallback('background');
        }
      });

      // State should be reset
      expect(store.getState().capture.state).toBe('idle');
      expect(store.getState().capture.isCapturing).toBe(false);
    });

    it('should clear frames when cancelling', async () => {
      const store = createTestStore(true);

      renderHook(
        () => useAppStateCapture(),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        if (appStateCallback) {
          appStateCallback('background');
        }
      });

      // Frames should be cleared
      expect(store.getState().capture.frames).toEqual([]);
      expect(store.getState().capture.frameCount).toBe(0);
    });

    it('should clear startedAt when cancelling', async () => {
      const store = createTestStore(true);

      renderHook(
        () => useAppStateCapture(),
        { wrapper: createWrapper(store) }
      );

      // Verify startedAt is set
      expect(store.getState().capture.startedAt).not.toBeNull();

      await act(async () => {
        if (appStateCallback) {
          appStateCallback('background');
        }
      });

      // startedAt should be cleared
      expect(store.getState().capture.startedAt).toBeNull();
    });
  });

  describe('background handling when not capturing', () => {
    it('should not cancel when not capturing', async () => {
      const store = createTestStore(false); // Not capturing

      renderHook(
        () => useAppStateCapture(),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        if (appStateCallback) {
          appStateCallback('background');
        }
      });

      expect(frameCaptureService.cancelCapture).not.toHaveBeenCalled();
    });

    it('should not call onBackgroundCancel when not capturing', async () => {
      const store = createTestStore(false);
      const onBackgroundCancel = jest.fn();

      renderHook(
        () => useAppStateCapture({ onBackgroundCancel }),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        if (appStateCallback) {
          appStateCallback('background');
        }
      });

      expect(onBackgroundCancel).not.toHaveBeenCalled();
    });

    it('should not call service when app returns to active', async () => {
      const store = createTestStore(false);

      renderHook(
        () => useAppStateCapture(),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        if (appStateCallback) {
          appStateCallback('active');
        }
      });

      expect(frameCaptureService.cancelCapture).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle transition to inactive state', async () => {
      const store = createTestStore(true);

      renderHook(
        () => useAppStateCapture(),
        { wrapper: createWrapper(store) }
      );

      // Transition from active to inactive
      await act(async () => {
        if (appStateCallback) {
          appStateCallback('inactive');
        }
      });

      // Should have cancelled on inactive transition (from active)
      expect(frameCaptureService.cancelCapture).toHaveBeenCalled();
    });

    it('should work without options', () => {
      const store = createTestStore();

      // Should not throw
      expect(() => {
        renderHook(
          () => useAppStateCapture(),
          { wrapper: createWrapper(store) }
        );
      }).not.toThrow();
    });

    it('should work with empty options', () => {
      const store = createTestStore();

      // Should not throw
      expect(() => {
        renderHook(
          () => useAppStateCapture({}),
          { wrapper: createWrapper(store) }
        );
      }).not.toThrow();
    });

    it('should only cancel once per background transition', async () => {
      const store = createTestStore(true);

      renderHook(
        () => useAppStateCapture(),
        { wrapper: createWrapper(store) }
      );

      // First background
      await act(async () => {
        if (appStateCallback) {
          appStateCallback('background');
        }
      });

      // Clear mock
      (frameCaptureService.cancelCapture as jest.Mock).mockClear();

      // Second background (already backgrounded, state not changed from active)
      await act(async () => {
        if (appStateCallback) {
          appStateCallback('background');
        }
      });

      // Should not call again since we're not transitioning from active
      expect(frameCaptureService.cancelCapture).not.toHaveBeenCalled();
    });

    it('should handle rapid state changes', async () => {
      const store = createTestStore(true);

      renderHook(
        () => useAppStateCapture(),
        { wrapper: createWrapper(store) }
      );

      // Rapid state changes
      await act(async () => {
        if (appStateCallback) {
          appStateCallback('inactive');
        }
      });

      await act(async () => {
        if (appStateCallback) {
          appStateCallback('background');
        }
      });

      // Should have cancelled on first transition from active
      expect(frameCaptureService.cancelCapture).toHaveBeenCalledTimes(1);
    });

    it('should preserve lastResult when cancelling', async () => {
      const store = createTestStore(true);
      const mockFrames = [
        {
          uri: 'file://frame1.jpg',
          timestamp: '2025-01-01T00:00:00.000Z',
          width: 1920,
          height: 1080,
        },
      ];
      // Set last result
      store.dispatch({ type: 'capture/stopCaptureSuccess', payload: mockFrames });
      // Start capturing again
      store.dispatch({ type: 'capture/startCaptureSuccess', payload: { startedAt: new Date().toISOString() } });

      renderHook(
        () => useAppStateCapture(),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        if (appStateCallback) {
          appStateCallback('background');
        }
      });

      // lastResult should be preserved
      expect(store.getState().capture.lastResult).toEqual(mockFrames);
    });
  });
});
