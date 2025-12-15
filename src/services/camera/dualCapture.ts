/**
 * Dual Capture Service
 *
 * Orchestrates simultaneous video recording and frame capture (Story 2.5).
 * Ensures both processes run concurrently without blocking or degrading each other.
 * Maintains timestamp synchronization between video and frames.
 *
 * Features:
 * - Start/stop video recording + frame capture together
 * - Coordinate shared camera reference
 * - Handle errors gracefully without blocking either process
 * - Maintain frame timestamp alignment with video timeline
 * - Result<T> pattern for consistent error handling
 */

import { CameraView } from 'expo-camera';
import type { Result } from '@/src/types/common';
import {
  VideoRecordingService,
  videoRecordingService,
  RecordingOptions,
  RecordingState,
} from './recording';
import {
  FrameCaptureService,
  frameCaptureService,
  CaptureOptions,
  CaptureState,
  CapturedFrame,
} from './capture';

/**
 * Dual capture state enum
 */
export type DualCaptureState = 'idle' | 'starting' | 'active' | 'stopping' | 'error';

/**
 * Dual capture configuration options
 */
export interface DualCaptureOptions {
  /** Frame capture options */
  captureOptions?: CaptureOptions;
  /** Video recording options */
  recordingOptions?: RecordingOptions;
}

/**
 * Dual capture session data
 */
export interface DualCaptureSession {
  /** Video recording file URI */
  videoUri: string;
  /** All captured frames with timestamps */
  frames: CapturedFrame[];
  /** Session duration in milliseconds */
  durationMs: number;
  /** ISO timestamp when session started */
  startedAt: string;
  /** ISO timestamp when session stopped */
  stoppedAt: string;
  /** Video file size in bytes (if available) */
  videoFileSize?: number;
}

/**
 * Error messages for dual capture operations
 */
export const DUAL_CAPTURE_ERROR_MESSAGES: Record<string, string> = {
  camera_not_ready: 'Camera is not ready for dual capture.',
  already_active: 'Dual capture is already in progress.',
  not_active: 'No dual capture session in progress to stop.',
  recording_failed: 'Failed to start video recording.',
  capture_failed: 'Failed to start frame capture.',
  stop_failed: 'Failed to stop dual capture session.',
  default: 'An unexpected dual capture error occurred.',
};

/**
 * Get user-friendly error message for dual capture error codes
 */
export function getDualCaptureErrorMessage(errorCode: string): string {
  return DUAL_CAPTURE_ERROR_MESSAGES[errorCode] ?? DUAL_CAPTURE_ERROR_MESSAGES.default;
}

/**
 * Dual Capture Service
 *
 * Manages concurrent video recording and frame capture with proper synchronization.
 */
export class DualCaptureService {
  private cameraRef: React.RefObject<CameraView> | null = null;
  private state: DualCaptureState = 'idle';
  private recordingService: VideoRecordingService;
  private captureService: FrameCaptureService;
  private sessionStartTime: Date | null = null;

  constructor(
    recordingService: VideoRecordingService,
    captureService: FrameCaptureService
  ) {
    this.recordingService = recordingService;
    this.captureService = captureService;
  }

  /**
   * Set the camera reference for both recording and capture
   */
  setCameraRef(ref: React.RefObject<CameraView>): void {
    this.cameraRef = ref;
    this.recordingService.setCameraRef(ref);
    this.captureService.setCameraRef(ref);
  }

  /**
   * Get current dual capture state
   */
  getState(): DualCaptureState {
    return this.state;
  }

  /**
   * Check if dual capture is currently active
   */
  isActive(): boolean {
    return this.state === 'active';
  }

  /**
   * Get recording state
   */
  getRecordingState(): RecordingState {
    return this.recordingService.getState();
  }

  /**
   * Get capture state
   */
  getCaptureState(): CaptureState {
    return this.captureService.getState();
  }

  /**
   * Get current frame count
   */
  getFrameCount(): number {
    return this.captureService.getFrameCount();
  }

  /**
   * Set callback for when frames are captured (real-time updates)
   */
  setOnFrameCaptured(callback?: (frame: CapturedFrame) => void): void {
    this.captureService.setOnFrameCaptured(callback);
  }

  /**
   * Start dual capture mode (video recording + frame capture)
   *
   * Both processes start simultaneously to ensure timestamp synchronization.
   * If either fails to start, both are stopped gracefully.
   */
  async startDualCapture(
    options: DualCaptureOptions = {}
  ): Promise<Result<{ startedAt: string }>> {
    // Validate camera ref
    if (!this.cameraRef?.current) {
      return {
        success: false,
        error: getDualCaptureErrorMessage('camera_not_ready'),
      };
    }

    // Check if already active
    if (this.state === 'active' || this.state === 'starting') {
      return {
        success: false,
        error: getDualCaptureErrorMessage('already_active'),
      };
    }

    try {
      this.state = 'starting';
      this.sessionStartTime = new Date();

      // Start both processes concurrently for proper timestamp synchronization
      const [recordingResult, captureResult] = await Promise.all([
        this.recordingService.startRecording(options.recordingOptions),
        this.captureService.startCapture(options.captureOptions),
      ]);

      // Check if both started successfully
      if (!recordingResult.success) {
        // Recording failed - stop capture if it started
        await this.captureService.cancelCapture();
        this.state = 'error';
        return {
          success: false,
          error: getDualCaptureErrorMessage('recording_failed'),
        };
      }

      if (!captureResult.success) {
        // Capture failed - stop recording if it started
        await this.recordingService.cancelRecording();
        this.state = 'error';
        return {
          success: false,
          error: getDualCaptureErrorMessage('capture_failed'),
        };
      }

      this.state = 'active';

      return {
        success: true,
        data: { startedAt: this.sessionStartTime.toISOString() },
      };
    } catch (error) {
      this.state = 'error';
      console.error('[DualCaptureService] Start error:', error);

      // Cleanup - attempt to stop both services
      await Promise.all([
        this.recordingService.cancelRecording(),
        this.captureService.cancelCapture(),
      ]);

      return {
        success: false,
        error: getDualCaptureErrorMessage('default'),
      };
    }
  }

  /**
   * Stop dual capture mode and return session data
   *
   * Stops both processes and returns synchronized session data with video URI and frames.
   * Both processes are stopped concurrently to minimize stopping latency.
   */
  async stopDualCapture(): Promise<Result<DualCaptureSession>> {
    // Check if active
    if (this.state !== 'active') {
      return {
        success: false,
        error: getDualCaptureErrorMessage('not_active'),
      };
    }

    try {
      this.state = 'stopping';
      const stoppedAt = new Date();

      // Stop both processes concurrently
      const [recordingResult, captureResult] = await Promise.all([
        this.recordingService.stopRecording(),
        this.captureService.stopCapture(),
      ]);

      // Check results
      if (!recordingResult.success || !captureResult.success) {
        this.state = 'error';
        return {
          success: false,
          error: getDualCaptureErrorMessage('stop_failed'),
        };
      }

      // Calculate session duration
      const durationMs = this.sessionStartTime
        ? stoppedAt.getTime() - this.sessionStartTime.getTime()
        : recordingResult.data.durationMs;

      // Create session data
      const session: DualCaptureSession = {
        videoUri: recordingResult.data.uri,
        frames: captureResult.data,
        durationMs,
        startedAt: recordingResult.data.startedAt,
        stoppedAt: recordingResult.data.stoppedAt,
        videoFileSize: recordingResult.data.fileSize,
      };

      // Reset state
      this.state = 'idle';
      this.sessionStartTime = null;

      return {
        success: true,
        data: session,
      };
    } catch (error) {
      this.state = 'error';
      console.error('[DualCaptureService] Stop error:', error);
      return {
        success: false,
        error: getDualCaptureErrorMessage('stop_failed'),
      };
    }
  }

  /**
   * Cancel dual capture without saving (for app backgrounding or errors)
   */
  async cancelDualCapture(): Promise<Result<void>> {
    if (this.state !== 'active') {
      return { success: true, data: undefined };
    }

    try {
      // Cancel both processes concurrently
      await Promise.all([
        this.recordingService.cancelRecording(),
        this.captureService.cancelCapture(),
      ]);

      // Reset state
      this.state = 'idle';
      this.sessionStartTime = null;

      return { success: true, data: undefined };
    } catch (error) {
      console.error('[DualCaptureService] Cancel error:', error);
      this.state = 'idle';
      return { success: true, data: undefined };
    }
  }

  /**
   * Reset service state (for cleanup)
   */
  reset(): void {
    this.recordingService.reset();
    this.captureService.reset();
    this.state = 'idle';
    this.sessionStartTime = null;
    this.cameraRef = null;
  }
}

// Export singleton instance
export const dualCaptureService = new DualCaptureService(
  videoRecordingService,
  frameCaptureService
);

// Export standalone functions that use the singleton
export async function startDualCapture(
  cameraRef: React.RefObject<CameraView>,
  options?: DualCaptureOptions
): Promise<Result<{ startedAt: string }>> {
  dualCaptureService.setCameraRef(cameraRef);
  return dualCaptureService.startDualCapture(options);
}

export async function stopDualCapture(): Promise<Result<DualCaptureSession>> {
  return dualCaptureService.stopDualCapture();
}

export function isDualCaptureActive(): boolean {
  return dualCaptureService.isActive();
}

export function getDualCaptureState(): DualCaptureState {
  return dualCaptureService.getState();
}
