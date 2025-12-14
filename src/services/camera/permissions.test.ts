/**
 * Camera Permission Service Tests
 *
 * Tests for camera permission handling functions.
 * Uses mocked expo-camera and expo-linking.
 */

import {
  checkCameraPermission,
  requestCameraPermission,
  openAppSettings,
  PERMISSION_ERROR_MESSAGES,
  getPermissionErrorMessage,
} from './permissions';
import { Camera } from 'expo-camera';
import * as Linking from 'expo-linking';

// Mock expo-camera
jest.mock('expo-camera', () => ({
  Camera: {
    getCameraPermissionsAsync: jest.fn(),
    requestCameraPermissionsAsync: jest.fn(),
  },
}));

// Mock expo-linking
jest.mock('expo-linking', () => ({
  openSettings: jest.fn(),
}));

describe('camera permissions', () => {
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    mockConsoleError.mockRestore();
  });

  describe('PERMISSION_ERROR_MESSAGES', () => {
    it('should have message for check_failed', () => {
      expect(PERMISSION_ERROR_MESSAGES.check_failed).toBe(
        'Failed to check camera permission.'
      );
    });

    it('should have message for request_failed', () => {
      expect(PERMISSION_ERROR_MESSAGES.request_failed).toBe(
        'Failed to request camera permission.'
      );
    });

    it('should have message for settings_failed', () => {
      expect(PERMISSION_ERROR_MESSAGES.settings_failed).toBe(
        'Failed to open app settings.'
      );
    });

    it('should have default message', () => {
      expect(PERMISSION_ERROR_MESSAGES.default).toBe(
        'Camera permission operation failed.'
      );
    });
  });

  describe('getPermissionErrorMessage', () => {
    it('should return message for known error code', () => {
      expect(getPermissionErrorMessage('check_failed')).toBe(
        'Failed to check camera permission.'
      );
    });

    it('should return default message for unknown error code', () => {
      expect(getPermissionErrorMessage('unknown_error')).toBe(
        'Camera permission operation failed.'
      );
    });

    it('should return default message for empty string', () => {
      expect(getPermissionErrorMessage('')).toBe(
        'Camera permission operation failed.'
      );
    });
  });

  describe('checkCameraPermission', () => {
    it('should return granted status', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await checkCameraPermission();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('granted');
      }
      expect(Camera.getCameraPermissionsAsync).toHaveBeenCalled();
    });

    it('should return denied status', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await checkCameraPermission();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('denied');
      }
    });

    it('should return undetermined status', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });

      const result = await checkCameraPermission();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('undetermined');
      }
    });

    it('should return error on failure', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Permission check failed')
      );

      const result = await checkCameraPermission();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Failed to check camera permission.');
      }
    });

    it('should log error type only on failure', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Test error')
      );

      await checkCameraPermission();

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Permission check error:',
        'Error'
      );
    });
  });

  describe('requestCameraPermission', () => {
    it('should return granted status after request', async () => {
      (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await requestCameraPermission();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('granted');
      }
      expect(Camera.requestCameraPermissionsAsync).toHaveBeenCalled();
    });

    it('should return denied status after request', async () => {
      (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await requestCameraPermission();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('denied');
      }
    });

    it('should return error on request failure', async () => {
      (Camera.requestCameraPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Request failed')
      );

      const result = await requestCameraPermission();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Failed to request camera permission.');
      }
    });

    it('should log error type only on failure', async () => {
      (Camera.requestCameraPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Test error')
      );

      await requestCameraPermission();

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Permission request error:',
        'Error'
      );
    });
  });

  describe('openAppSettings', () => {
    it('should open settings successfully', async () => {
      (Linking.openSettings as jest.Mock).mockResolvedValue(undefined);

      const result = await openAppSettings();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeUndefined();
      }
      expect(Linking.openSettings).toHaveBeenCalled();
    });

    it('should return error on settings open failure', async () => {
      (Linking.openSettings as jest.Mock).mockRejectedValue(
        new Error('Settings unavailable')
      );

      const result = await openAppSettings();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Failed to open app settings.');
      }
    });

    it('should log error type only on failure', async () => {
      (Linking.openSettings as jest.Mock).mockRejectedValue(
        new Error('Test error')
      );

      await openAppSettings();

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Open settings error:',
        'Error'
      );
    });
  });

  describe('Result<T> type compliance', () => {
    it('checkCameraPermission should return Result type with success', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await checkCameraPermission();

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result).toHaveProperty('data');
      }
    });

    it('checkCameraPermission should return Result type with error', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error()
      );

      const result = await checkCameraPermission();

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result).toHaveProperty('error');
        expect(typeof result.error).toBe('string');
      }
    });

    it('requestCameraPermission should return Result type with success', async () => {
      (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await requestCameraPermission();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data).toBe('string');
      }
    });

    it('openAppSettings should return Result type with void data', async () => {
      (Linking.openSettings as jest.Mock).mockResolvedValue(undefined);

      const result = await openAppSettings();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeUndefined();
      }
    });
  });
});
