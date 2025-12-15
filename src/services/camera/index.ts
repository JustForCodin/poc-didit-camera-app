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

export {
  FrameCaptureService,
  frameCaptureService,
  startCapture,
  stopCapture,
  isCapturing,
  getCaptureState,
  CAPTURE_ERROR_MESSAGES,
  getCaptureErrorMessage,
} from './capture';

export type {
  CaptureState,
  CaptureOptions,
  CapturedFrame,
} from './capture';

export {
  DualCaptureService,
  dualCaptureService,
  startDualCapture,
  stopDualCapture,
  isDualCaptureActive,
  getDualCaptureState,
  DUAL_CAPTURE_ERROR_MESSAGES,
  getDualCaptureErrorMessage,
} from './dualCapture';

export type {
  DualCaptureState,
  DualCaptureOptions,
  DualCaptureSession,
} from './dualCapture';
