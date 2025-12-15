/**
 * Jest Setup File
 *
 * This file runs before each test file.
 * Use it to configure global mocks and test utilities.
 *
 * NOTE: Some mocks are commented out until their packages are installed in future stories.
 */

// TODO: Re-enable when @testing-library/jest-native supports React 19
// import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage with complete promise-returning implementation
// This ensures redux-persist doesn't crash after tests complete
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
    mergeItem: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
    getAllKeys: jest.fn().mockResolvedValue([]),
    multiGet: jest.fn().mockResolvedValue([]),
    multiSet: jest.fn().mockResolvedValue(undefined),
    multiRemove: jest.fn().mockResolvedValue(undefined),
    multiMerge: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock redux-persist to avoid async storage issues in tests
jest.mock('redux-persist', () => {
  const actual = jest.requireActual('redux-persist');
  return {
    ...actual,
    persistStore: jest.fn(() => ({
      pause: jest.fn(),
      persist: jest.fn(),
      purge: jest.fn().mockResolvedValue(undefined),
      flush: jest.fn().mockResolvedValue(undefined),
      dispatch: jest.fn(),
      getState: jest.fn(),
      subscribe: jest.fn(() => jest.fn()),
    })),
    persistReducer: jest.fn((_config, reducer) => reducer),
  };
});

// TODO: Uncomment when @react-native-community/netinfo is installed (Story 1.2+)
// jest.mock('@react-native-community/netinfo', () => ({
//   addEventListener: jest.fn(() => jest.fn()),
//   fetch: jest.fn(() => Promise.resolve({
//     isConnected: true,
//     isInternetReachable: true,
//     type: 'wifi',
//   })),
// }));

// TODO: Uncomment when expo-secure-store is installed (Story 1.2+)
// jest.mock('expo-secure-store', () => ({
//   getItemAsync: jest.fn(() => Promise.resolve(null)),
//   setItemAsync: jest.fn(() => Promise.resolve()),
//   deleteItemAsync: jest.fn(() => Promise.resolve()),
// }));

// TODO: Uncomment when expo-camera is installed (Story 2.1+)
// jest.mock('expo-camera', () => ({
//   Camera: {
//     useCameraPermissions: jest.fn(() => [{ granted: true }, jest.fn()]),
//     Constants: {
//       Type: { back: 'back', front: 'front' },
//     },
//   },
//   CameraView: jest.fn(),
// }));

// TODO: Uncomment when expo-av is installed (Story 2.1+)
// jest.mock('expo-av', () => ({
//   Audio: {
//     setAudioModeAsync: jest.fn(),
//     Recording: jest.fn(),
//   },
//   Video: jest.fn(),
// }));

// TODO: Uncomment when expo-file-system is installed (Story 2.1+)
// jest.mock('expo-file-system', () => ({
//   documentDirectory: '/mock/documents/',
//   cacheDirectory: '/mock/cache/',
//   readAsStringAsync: jest.fn(),
//   writeAsStringAsync: jest.fn(),
//   deleteAsync: jest.fn(),
//   getInfoAsync: jest.fn(() => Promise.resolve({ exists: false })),
//   makeDirectoryAsync: jest.fn(),
// }));

// Mock Supabase client (installed in Story 1.1)
jest.mock('~/utils/supabase', () => ({
  supabase: {
    auth: {
      signInAnonymously: jest.fn(() => Promise.resolve({ data: { user: { id: 'mock-user-id' } }, error: null })),
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({ data: { path: 'mock-path' }, error: null })),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://mock-url.com/file' } })),
      })),
    },
  },
}));

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests (comment out to debug)
  // log: jest.fn(),
  // Keep errors and warnings visible
  error: console.error,
  warn: console.warn,
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Flush pending timers and cleanup redux-persist after all tests
afterAll(async () => {
  // Clear all pending timers to prevent redux-persist from trying to write
  jest.useRealTimers();
  // Give a moment for any pending promises to settle
  await new Promise((resolve) => setTimeout(resolve, 100));
});
