/**
 * Jest Setup File
 *
 * This file runs before each test file.
 * Use it to configure global mocks and test utilities.
 */

import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  })),
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-camera
jest.mock('expo-camera', () => ({
  Camera: {
    useCameraPermissions: jest.fn(() => [{ granted: true }, jest.fn()]),
    Constants: {
      Type: { back: 'back', front: 'front' },
    },
  },
  CameraView: jest.fn(),
}));

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn(),
    Recording: jest.fn(),
  },
  Video: jest.fn(),
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock/documents/',
  cacheDirectory: '/mock/cache/',
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: false })),
  makeDirectoryAsync: jest.fn(),
}));

// Mock Supabase client
jest.mock('@/services/supabase/client', () => ({
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
