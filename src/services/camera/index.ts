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

export {
  VideoRecordingService,
  videoRecordingService,
  startRecording,
  stopRecording,
  isRecording,
  getRecordingState,
  RECORDING_ERROR_MESSAGES,
  getRecordingErrorMessage,
} from './recording';

export type {
  RecordingState,
  RecordingOptions,
  RecordingResult,
} from './recording';
