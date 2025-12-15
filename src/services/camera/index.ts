/**
 * Camera Services
 *
 * Barrel export for camera-related services.
 */

export {
  checkCameraPermission,
  requestCameraPermission,
  openAppSettings,
  PERMISSION_ERROR_MESSAGES,
  getPermissionErrorMessage,
} from './permissions';

export type { PermissionStatus } from './permissions';
