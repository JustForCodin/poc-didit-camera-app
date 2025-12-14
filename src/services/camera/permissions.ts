/**
 * Camera Permission Service
 *
 * Handles camera permission checking, requesting, and settings navigation.
 * Uses expo-camera for permission management and expo-linking for settings.
 *
 * @see docs/architecture.md#Camera-Video-Libraries
 */

import { Camera } from 'expo-camera';
import * as Linking from 'expo-linking';
import type { Result } from '@/src/types/common';

/**
 * Permission status types matching expo-camera
 */
export type PermissionStatus =
  | 'granted'
  | 'denied'
  | 'undetermined'
  | 'restricted';

/**
 * User-friendly error messages for permission errors
 */
export const PERMISSION_ERROR_MESSAGES: Record<string, string> = {
  check_failed: 'Failed to check camera permission.',
  request_failed: 'Failed to request camera permission.',
  settings_failed: 'Failed to open app settings.',
  default: 'Camera permission operation failed.',
};

/**
 * Get user-friendly error message for permission error
 * @param errorCode - Error code to look up
 * @returns User-friendly error message
 */
export function getPermissionErrorMessage(errorCode: string): string {
  return PERMISSION_ERROR_MESSAGES[errorCode] ?? PERMISSION_ERROR_MESSAGES.default;
}

/**
 * Check current camera permission status
 *
 * @returns Result containing the current permission status
 *
 * @example
 * const result = await checkCameraPermission();
 * if (result.success && result.data === 'granted') {
 *   // Camera is available
 * }
 */
export async function checkCameraPermission(): Promise<
  Result<PermissionStatus>
> {
  try {
    const { status } = await Camera.getCameraPermissionsAsync();
    return { success: true, data: status as PermissionStatus };
  } catch (error) {
    console.error('Permission check error:', (error as Error).name);
    return {
      success: false,
      error: getPermissionErrorMessage('check_failed'),
    };
  }
}

/**
 * Request camera permission from user
 *
 * @returns Result containing the permission status after request
 *
 * @remarks
 * On iOS, this shows the native permission dialog.
 * On Android, this shows the permission dialog if not previously denied.
 * If previously denied, user must manually enable in Settings.
 *
 * @example
 * const result = await requestCameraPermission();
 * if (result.success && result.data === 'granted') {
 *   // Permission granted, can use camera
 * }
 */
export async function requestCameraPermission(): Promise<
  Result<PermissionStatus>
> {
  try {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return { success: true, data: status as PermissionStatus };
  } catch (error) {
    console.error('Permission request error:', (error as Error).name);
    return {
      success: false,
      error: getPermissionErrorMessage('request_failed'),
    };
  }
}

/**
 * Open device settings to allow manual permission grant
 *
 * Used when permission is denied and user needs to enable manually.
 * Opens the app-specific settings page on both iOS and Android.
 *
 * @returns Result indicating success or failure
 *
 * @example
 * const result = await openAppSettings();
 * if (!result.success) {
 *   // Handle settings open failure
 * }
 */
export async function openAppSettings(): Promise<Result<void>> {
  try {
    await Linking.openSettings();
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Open settings error:', (error as Error).name);
    return {
      success: false,
      error: getPermissionErrorMessage('settings_failed'),
    };
  }
}
