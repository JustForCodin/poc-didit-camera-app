/**
 * Secure Storage Service
 *
 * Wrapper around expo-secure-store for encrypted credential storage.
 * Uses iOS Keychain and Android Keystore for platform-native encryption.
 *
 * SECURITY: This module never logs credential values (per NFR17).
 * Only error types/names are logged for debugging.
 *
 * @see docs/architecture.md#Data-Storage-Strategy
 */

import * as SecureStore from 'expo-secure-store';
import type { Result } from '@/src/types/common';

/**
 * Valid credential keys for type-safe storage access
 */
export type CredentialKey =
  | 'diditCamera_apiKey'
  | 'gemini_apiKey'
  | 'claude_apiKey';

/**
 * Credential key constants for type-safe access
 */
export const CREDENTIAL_KEYS = {
  DIDIT_CAMERA: 'diditCamera_apiKey' as const,
  GEMINI: 'gemini_apiKey' as const,
  CLAUDE: 'claude_apiKey' as const,
} as const;

/**
 * User-friendly error messages for storage errors
 */
export const STORAGE_ERROR_MESSAGES: Record<string, string> = {
  unavailable: 'Secure storage is not available on this device.',
  write_failed: 'Failed to save credential. Please try again.',
  read_failed: 'Failed to retrieve credential.',
  delete_failed: 'Failed to remove credential.',
  invalid_key: 'Invalid credential key provided.',
  default: 'Storage operation failed. Please try again.',
};

/**
 * Get user-friendly error message for storage error
 * @param errorCode - Error code to look up
 * @returns User-friendly error message
 */
export function getStorageErrorMessage(errorCode: string): string {
  return STORAGE_ERROR_MESSAGES[errorCode] ?? STORAGE_ERROR_MESSAGES.default;
}

/**
 * Retrieve a credential from secure storage
 *
 * @param key - The credential key to retrieve
 * @returns Result containing the credential value or null if not found
 *
 * @example
 * const result = await getCredential(CREDENTIAL_KEYS.GEMINI);
 * if (result.success && result.data) {
 *   // Use credential
 * }
 */
export async function getCredential(
  key: CredentialKey
): Promise<Result<string | null>> {
  try {
    const value = await SecureStore.getItemAsync(key);
    return { success: true, data: value };
  } catch (error) {
    // SECURITY: Log error type only, never log credential values
    console.error('Secure storage read error:', (error as Error).name);
    return {
      success: false,
      error: getStorageErrorMessage('read_failed'),
    };
  }
}

/**
 * Store a credential in secure storage
 *
 * @param key - The credential key to store under
 * @param value - The credential value to store (will be encrypted)
 * @returns Result indicating success or failure
 *
 * @example
 * const result = await setCredential(CREDENTIAL_KEYS.GEMINI, 'my-api-key');
 * if (!result.success) {
 *   showError(result.error);
 * }
 */
export async function setCredential(
  key: CredentialKey,
  value: string
): Promise<Result<void>> {
  try {
    await SecureStore.setItemAsync(key, value);
    return { success: true, data: undefined };
  } catch (error) {
    // SECURITY: Log error type only, never log credential values
    console.error('Secure storage write error:', (error as Error).name);
    return {
      success: false,
      error: getStorageErrorMessage('write_failed'),
    };
  }
}

/**
 * Delete a credential from secure storage
 *
 * @param key - The credential key to delete
 * @returns Result indicating success or failure
 *
 * @example
 * const result = await deleteCredential(CREDENTIAL_KEYS.GEMINI);
 * if (result.success) {
 *   // Credential removed
 * }
 */
export async function deleteCredential(
  key: CredentialKey
): Promise<Result<void>> {
  try {
    await SecureStore.deleteItemAsync(key);
    return { success: true, data: undefined };
  } catch (error) {
    // SECURITY: Log error type only, never log credential values
    console.error('Secure storage delete error:', (error as Error).name);
    return {
      success: false,
      error: getStorageErrorMessage('delete_failed'),
    };
  }
}

/**
 * Check if a credential exists in secure storage
 *
 * @param key - The credential key to check
 * @returns Result containing boolean indicating existence
 *
 * @example
 * const result = await hasCredential(CREDENTIAL_KEYS.GEMINI);
 * if (result.success && result.data) {
 *   // Credential exists
 * }
 */
export async function hasCredential(
  key: CredentialKey
): Promise<Result<boolean>> {
  try {
    const value = await SecureStore.getItemAsync(key);
    return { success: true, data: value !== null };
  } catch (error) {
    // SECURITY: Log error type only, never log credential values
    console.error('Secure storage check error:', (error as Error).name);
    return {
      success: false,
      error: getStorageErrorMessage('read_failed'),
    };
  }
}

/**
 * Clear all stored credentials
 *
 * @returns Result indicating success or failure
 *
 * @example
 * const result = await clearAllCredentials();
 * if (result.success) {
 *   // All credentials cleared
 * }
 */
export async function clearAllCredentials(): Promise<Result<void>> {
  try {
    const keys = Object.values(CREDENTIAL_KEYS);
    await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key)));
    return { success: true, data: undefined };
  } catch (error) {
    // SECURITY: Log error type only, never log credential values
    console.error('Secure storage clear error:', (error as Error).name);
    return {
      success: false,
      error: getStorageErrorMessage('delete_failed'),
    };
  }
}
