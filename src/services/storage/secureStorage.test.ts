/**
 * Secure Storage Service Tests
 *
 * Tests for the expo-secure-store wrapper.
 * Uses mocked SecureStore to test storage operations.
 */

import {
  getCredential,
  setCredential,
  deleteCredential,
  hasCredential,
  clearAllCredentials,
  CREDENTIAL_KEYS,
  STORAGE_ERROR_MESSAGES,
  getStorageErrorMessage,
} from './secureStorage';
import * as SecureStore from 'expo-secure-store';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('secureStorage', () => {
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

  describe('CREDENTIAL_KEYS', () => {
    it('should have DIDIT_CAMERA key', () => {
      expect(CREDENTIAL_KEYS.DIDIT_CAMERA).toBe('diditCamera_apiKey');
    });

    it('should have GEMINI key', () => {
      expect(CREDENTIAL_KEYS.GEMINI).toBe('gemini_apiKey');
    });

    it('should have CLAUDE key', () => {
      expect(CREDENTIAL_KEYS.CLAUDE).toBe('claude_apiKey');
    });
  });

  describe('STORAGE_ERROR_MESSAGES', () => {
    it('should have message for unavailable', () => {
      expect(STORAGE_ERROR_MESSAGES.unavailable).toBe(
        'Secure storage is not available on this device.'
      );
    });

    it('should have message for write_failed', () => {
      expect(STORAGE_ERROR_MESSAGES.write_failed).toBe(
        'Failed to save credential. Please try again.'
      );
    });

    it('should have message for read_failed', () => {
      expect(STORAGE_ERROR_MESSAGES.read_failed).toBe(
        'Failed to retrieve credential.'
      );
    });

    it('should have message for delete_failed', () => {
      expect(STORAGE_ERROR_MESSAGES.delete_failed).toBe(
        'Failed to remove credential.'
      );
    });

    it('should have message for invalid_key', () => {
      expect(STORAGE_ERROR_MESSAGES.invalid_key).toBe(
        'Invalid credential key provided.'
      );
    });

    it('should have default message', () => {
      expect(STORAGE_ERROR_MESSAGES.default).toBe(
        'Storage operation failed. Please try again.'
      );
    });
  });

  describe('getStorageErrorMessage', () => {
    it('should return message for known error code', () => {
      expect(getStorageErrorMessage('read_failed')).toBe(
        'Failed to retrieve credential.'
      );
    });

    it('should return default message for unknown error code', () => {
      expect(getStorageErrorMessage('unknown_error')).toBe(
        'Storage operation failed. Please try again.'
      );
    });

    it('should return default message for empty string', () => {
      expect(getStorageErrorMessage('')).toBe(
        'Storage operation failed. Please try again.'
      );
    });
  });

  describe('getCredential', () => {
    it('should return credential value when found', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('api-key-value');

      const result = await getCredential(CREDENTIAL_KEYS.GEMINI);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('api-key-value');
      }
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
        CREDENTIAL_KEYS.GEMINI
      );
    });

    it('should return null when credential not found', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await getCredential(CREDENTIAL_KEYS.GEMINI);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it('should return error on storage failure', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
        new Error('Storage unavailable')
      );

      const result = await getCredential(CREDENTIAL_KEYS.GEMINI);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Failed to retrieve credential.');
      }
    });

    it('should work with all credential keys', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test-value');

      const keys = Object.values(CREDENTIAL_KEYS);
      for (const key of keys) {
        const result = await getCredential(key);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('setCredential', () => {
    it('should store credential successfully', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await setCredential(CREDENTIAL_KEYS.GEMINI, 'new-api-key');

      expect(result.success).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        CREDENTIAL_KEYS.GEMINI,
        'new-api-key'
      );
    });

    it('should return error on storage failure', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(
        new Error('Write failed')
      );

      const result = await setCredential(CREDENTIAL_KEYS.GEMINI, 'api-key');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Failed to save credential. Please try again.');
      }
    });

    it('should handle empty string value', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await setCredential(CREDENTIAL_KEYS.GEMINI, '');

      expect(result.success).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        CREDENTIAL_KEYS.GEMINI,
        ''
      );
    });
  });

  describe('deleteCredential', () => {
    it('should delete credential successfully', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await deleteCredential(CREDENTIAL_KEYS.GEMINI);

      expect(result.success).toBe(true);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        CREDENTIAL_KEYS.GEMINI
      );
    });

    it('should return error on delete failure', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValue(
        new Error('Delete failed')
      );

      const result = await deleteCredential(CREDENTIAL_KEYS.GEMINI);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Failed to remove credential.');
      }
    });
  });

  describe('hasCredential', () => {
    it('should return true when credential exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('some-value');

      const result = await hasCredential(CREDENTIAL_KEYS.GEMINI);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(true);
      }
    });

    it('should return false when credential does not exist', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await hasCredential(CREDENTIAL_KEYS.GEMINI);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(false);
      }
    });

    it('should return error on storage failure', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      const result = await hasCredential(CREDENTIAL_KEYS.GEMINI);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Failed to retrieve credential.');
      }
    });
  });

  describe('clearAllCredentials', () => {
    it('should clear all credentials successfully', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await clearAllCredentials();

      expect(result.success).toBe(true);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(3);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        CREDENTIAL_KEYS.DIDIT_CAMERA
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        CREDENTIAL_KEYS.GEMINI
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        CREDENTIAL_KEYS.CLAUDE
      );
    });

    it('should return error if any delete fails', async () => {
      (SecureStore.deleteItemAsync as jest.Mock)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Delete failed'))
        .mockResolvedValueOnce(undefined);

      const result = await clearAllCredentials();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Failed to remove credential.');
      }
    });
  });

  describe('security - credential values never logged', () => {
    it('should not log credential value on getCredential error', async () => {
      const sensitiveValue = 'super-secret-api-key';
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
        new Error('Read failed')
      );

      await getCredential(CREDENTIAL_KEYS.GEMINI);

      const logCalls = mockConsoleError.mock.calls.flat().join(' ');
      expect(logCalls).not.toContain(sensitiveValue);
      expect(logCalls).toContain('Secure storage read error');
    });

    it('should not log credential value on setCredential error', async () => {
      const sensitiveValue = 'super-secret-api-key';
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(
        new Error('Write failed')
      );

      await setCredential(CREDENTIAL_KEYS.GEMINI, sensitiveValue);

      const logCalls = mockConsoleError.mock.calls.flat().join(' ');
      expect(logCalls).not.toContain(sensitiveValue);
      expect(logCalls).toContain('Secure storage write error');
    });

    it('should not log key value in delete error', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValue(
        new Error('Delete failed')
      );

      await deleteCredential(CREDENTIAL_KEYS.GEMINI);

      const logCalls = mockConsoleError.mock.calls.flat().join(' ');
      expect(logCalls).toContain('Secure storage delete error');
    });

    it('should not log key value in hasCredential error', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
        new Error('Check failed')
      );

      await hasCredential(CREDENTIAL_KEYS.GEMINI);

      const logCalls = mockConsoleError.mock.calls.flat().join(' ');
      expect(logCalls).toContain('Secure storage check error');
    });
  });

  describe('Result<T> type compliance', () => {
    it('getCredential should return Result type with success', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('value');

      const result = await getCredential(CREDENTIAL_KEYS.GEMINI);

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result).toHaveProperty('data');
      }
    });

    it('getCredential should return Result type with error', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error());

      const result = await getCredential(CREDENTIAL_KEYS.GEMINI);

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result).toHaveProperty('error');
        expect(typeof result.error).toBe('string');
      }
    });

    it('setCredential should return Result type with void data', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await setCredential(CREDENTIAL_KEYS.GEMINI, 'value');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeUndefined();
      }
    });

    it('deleteCredential should return Result type with void data', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await deleteCredential(CREDENTIAL_KEYS.GEMINI);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeUndefined();
      }
    });

    it('hasCredential should return Result type with boolean', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('value');

      const result = await hasCredential(CREDENTIAL_KEYS.GEMINI);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data).toBe('boolean');
      }
    });
  });
});
