/**
 * Frame Capture Service
 *
 * Handles frame capture from camera stream at configurable intervals using expo-camera's takePictureAsync.
 * Uses Result<T> pattern for consistent error handling.
 *
 * Features:
 * - Start/stop frame capture at configurable intervals (500-5000ms)
 * - Track capture state and frame collection
 * - Handle app backgrounding gracefully
 * - Provide captured frame array with timestamps
 */

import { CameraView } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import type { Result } from '@/src/types/common';

/**
 * Capture state enum
 */
export type CaptureState = 'idle' | 'starting' | 'capturing' | 'stopping' | 'error';

/**
 * Frame capture configuration options
 */
export interface CaptureOptions {
  /** Capture interval in milliseconds (default: 1000 = 1 FPS) */
  interval?: number;
  /** Maximum number of frames to capture (default: 300 = 5 minutes at 1 FPS) */
  maxFrames?: number;
  /** JPEG quality 0-100 (default: 80) */
  quality?: number;
}

/**
 * Captured frame information
 */
export interface CapturedFrame {
  /** Path to the captured JPEG frame */
  uri: string;
  /** Sequential frame number (0-based) */
  frameIndex: number;
  /** ISO timestamp when frame was captured (for synchronization) */
  capturedAt: string;
  /** Frame file size in bytes (if available) */
  fileSize?: number;
}

/**
 * Default capture options
 */
const DEFAULT_OPTIONS: Required<CaptureOptions> = {
  interval: 1000, // 1 second = 1 FPS
  maxFrames: 300, // 5 minutes at 1 FPS
  quality: 80, // 80% JPEG quality
};

/**
 * Capture option constraints
 */
const OPTION_CONSTRAINTS = {
  interval: { min: 500, max: 5000 }, // 500ms to 5 seconds
  maxFrames: { min: 1, max: 600 }, // 1 frame to 600 frames (10 min at 1 FPS)
  quality: { min: 50, max: 100 }, // JPEG quality 50-100%
};

/**
 * Validate and sanitize capture options
 * Clamps values to valid ranges and ensures positive numbers
 */
function validateCaptureOptions(options: CaptureOptions): Required<CaptureOptions> {
  const merged = { ...DEFAULT_OPTIONS, ...options };

  // Clamp interval to valid range
  merged.interval = Math.max(
    OPTION_CONSTRAINTS.interval.min,
    Math.min(OPTION_CONSTRAINTS.interval.max, Math.floor(merged.interval))
  );

  // Clamp maxFrames to valid range
  merged.maxFrames = Math.max(
    OPTION_CONSTRAINTS.maxFrames.min,
    Math.min(OPTION_CONSTRAINTS.maxFrames.max, Math.floor(merged.maxFrames))
  );

  // Clamp quality to valid range
  merged.quality = Math.max(
    OPTION_CONSTRAINTS.quality.min,
    Math.min(OPTION_CONSTRAINTS.quality.max, Math.floor(merged.quality))
  );

  return merged;
}

/**
 * Error messages for capture operations
 */
export const CAPTURE_ERROR_MESSAGES: Record<string, string> = {
  camera_not_ready: 'Camera is not ready for frame capture.',
  already_capturing: 'Frame capture is already in progress.',
  not_capturing: 'No capture in progress to stop.',
  start_failed: 'Failed to start frame capture.',
  capture_failed: 'Failed to capture frame.',
  stop_failed: 'Failed to stop frame capture.',
  interval_invalid: 'Capture interval must be between 500ms and 5000ms.',
  default: 'An unexpected capture error occurred.',
};

/**
 * Get user-friendly error message for capture error codes
 */
export function getCaptureErrorMessage(errorCode: string): string {
  return CAPTURE_ERROR_MESSAGES[errorCode] ?? CAPTURE_ERROR_MESSAGES.default;
}

/**
 * Frame capture state manager class
 */
export class FrameCaptureService {
  private cameraRef: React.RefObject<CameraView> | null = null;
  private state: CaptureState = 'idle';
  private startTime: Date | null = null;
  private captureInterval: NodeJS.Timeout | null = null;
  private frameCount: number = 0;
  private frames: CapturedFrame[] = [];
  private options: Required<CaptureOptions> = DEFAULT_OPTIONS;
  private onFrameCapturedCallback?: (frame: CapturedFrame) => void;

  /**
   * Set the camera reference for capture
   */
  setCameraRef(ref: React.RefObject<CameraView>): void {
    this.cameraRef = ref;
  }

  /**
   * Get current capture state
   */
  getState(): CaptureState {
    return this.state;
  }

  /**
   * Check if currently capturing
   */
  isCapturing(): boolean {
    return this.state === 'capturing';
  }

  /**
   * Get current frame count
   */
  getFrameCount(): number {
    return this.frameCount;
  }

  /**
   * Get all captured frames
   */
  getFrames(): CapturedFrame[] {
    return [...this.frames]; // Return copy to prevent external modification
  }

  /**
   * Set callback to be notified when a frame is captured
   */
  setOnFrameCaptured(callback?: (frame: CapturedFrame) => void): void {
    this.onFrameCapturedCallback = callback;
  }

  /**
   * Clear captured frames to free memory
   * Call this after frames have been uploaded/processed
   */
  clearFrames(): void {
    this.frames = [];
    this.frameCount = 0;
  }

  /**
   * Start frame capture at configured interval
   */
  async startCapture(
    options: CaptureOptions = {}
  ): Promise<Result<{ startedAt: string }>> {
    // Validate camera ref
    if (!this.cameraRef?.current) {
      return {
        success: false,
        error: getCaptureErrorMessage('camera_not_ready'),
      };
    }

    // Check if already capturing
    if (this.state === 'capturing' || this.state === 'starting') {
      return {
        success: false,
        error: getCaptureErrorMessage('already_capturing'),
      };
    }

    try {
      this.state = 'starting';
      this.options = validateCaptureOptions(options);
      this.startTime = new Date();
      this.frameCount = 0;
      this.frames = [];

      // Start interval-based frame capture
      this.captureInterval = setInterval(() => {
        this.captureFrame();
      }, this.options.interval);

      this.state = 'capturing';

      return {
        success: true,
        data: { startedAt: this.startTime.toISOString() },
      };
    } catch (error) {
      this.state = 'error';
      console.error('[FrameCaptureService] Start error:', error);
      return {
        success: false,
        error: getCaptureErrorMessage('start_failed'),
      };
    }
  }

  /**
   * Stop frame capture and return all captured frames
   */
  async stopCapture(): Promise<Result<CapturedFrame[]>> {
    // Check if capturing
    if (this.state !== 'capturing') {
      return {
        success: false,
        error: getCaptureErrorMessage('not_capturing'),
      };
    }

    try {
      this.state = 'stopping';

      // Clear the capture interval
      if (this.captureInterval) {
        clearInterval(this.captureInterval);
        this.captureInterval = null;
      }

      // Return captured frames
      const capturedFrames = [...this.frames];

      // Reset state
      this.state = 'idle';
      this.startTime = null;

      return {
        success: true,
        data: capturedFrames,
      };
    } catch (error) {
      this.state = 'error';
      console.error('[FrameCaptureService] Stop error:', error);
      return {
        success: false,
        error: getCaptureErrorMessage('stop_failed'),
      };
    }
  }

  /**
   * Cancel capture without saving (for app backgrounding)
   */
  async cancelCapture(): Promise<Result<void>> {
    if (this.state !== 'capturing') {
      return { success: true, data: undefined };
    }

    try {
      // Clear the capture interval
      if (this.captureInterval) {
        clearInterval(this.captureInterval);
        this.captureInterval = null;
      }

      // Reset state
      this.state = 'idle';
      this.startTime = null;
      this.frameCount = 0;
      this.frames = [];

      return { success: true, data: undefined };
    } catch (error) {
      console.error('[FrameCaptureService] Cancel error:', error);
      this.state = 'idle';
      return { success: true, data: undefined };
    }
  }

  /**
   * Reset service state (for cleanup)
   */
  reset(): void {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }
    this.state = 'idle';
    this.startTime = null;
    this.frameCount = 0;
    this.frames = [];
    this.cameraRef = null;
  }

  /**
   * Private method to capture a single frame
   */
  private async captureFrame(): Promise<void> {
    // Guard against concurrent stops or invalid state
    if (this.state !== 'capturing') {
      return;
    }

    if (!this.cameraRef?.current) {
      console.error('[FrameCaptureService] Camera ref not available');
      return;
    }

    // Check max frames limit
    if (this.frameCount >= this.options.maxFrames) {
      await this.stopCapture();
      return;
    }

    try {
      // Use expo-camera's takePictureAsync
      const photo = await this.cameraRef.current.takePictureAsync({
        quality: this.options.quality / 100, // Convert 0-100 to 0-1
        skipProcessing: true, // Minimize latency (< 50ms target)
        exif: false, // Don't include EXIF data (faster)
      });

      // Get file size (optional)
      let fileSize: number | undefined;
      try {
        const fileInfo = await FileSystem.getInfoAsync(photo.uri);
        if (fileInfo.exists && 'size' in fileInfo) {
          fileSize = fileInfo.size;
        }
      } catch {
        // File size is optional, ignore errors
      }

      // Create frame record
      const frame: CapturedFrame = {
        uri: photo.uri,
        frameIndex: this.frameCount,
        capturedAt: new Date().toISOString(),
        fileSize,
      };

      this.frames.push(frame);
      this.frameCount++;

      // Notify callback immediately when frame is captured
      this.onFrameCapturedCallback?.(frame);
    } catch (error) {
      console.error('[FrameCaptureService] Frame capture failed:', error);
      // Don't stop capture on individual frame failure - continue
    }
  }
}

// Export singleton instance
export const frameCaptureService = new FrameCaptureService();

// Export standalone functions that use the singleton
export async function startCapture(
  cameraRef: React.RefObject<CameraView>,
  options?: CaptureOptions
): Promise<Result<{ startedAt: string }>> {
  frameCaptureService.setCameraRef(cameraRef);
  return frameCaptureService.startCapture(options);
}

export async function stopCapture(): Promise<Result<CapturedFrame[]>> {
  return frameCaptureService.stopCapture();
}

export function isCapturing(): boolean {
  return frameCaptureService.isCapturing();
}

export function getCaptureState(): CaptureState {
  return frameCaptureService.getState();
}
