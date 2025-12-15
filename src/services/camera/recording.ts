/**
 * Video Recording Service
 *
 * Handles video recording using expo-camera's CameraView recording capabilities.
 * Uses Result<T> pattern for consistent error handling.
 *
 * Features:
 * - Start/stop video recording
 * - Track recording state
 * - Handle app backgrounding gracefully
 * - Provide recorded video file path
 */

import { CameraView } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import type { Result } from '@/src/types/common';

/**
 * Recording state enum
 */
export type RecordingState = 'idle' | 'starting' | 'recording' | 'stopping' | 'error';

/**
 * Recording configuration options
 */
export interface RecordingOptions {
  /** Maximum recording duration in seconds (default: 300 = 5 minutes) */
  maxDuration?: number;
  /** Maximum file size in bytes */
  maxFileSize?: number;
}

/**
 * Recording result returned after stopping
 */
export interface RecordingResult {
  /** Path to the recorded video file */
  uri: string;
  /** Duration of the recording in milliseconds */
  durationMs: number;
  /** File size in bytes (if available) */
  fileSize?: number;
  /** Timestamp when recording started */
  startedAt: string;
  /** Timestamp when recording stopped */
  stoppedAt: string;
}

/**
 * Default recording options
 */
const DEFAULT_OPTIONS: Required<RecordingOptions> = {
  maxDuration: 300, // 5 minutes
  maxFileSize: 0, // No limit by default
};

/**
 * Recording option constraints
 */
const OPTION_CONSTRAINTS = {
  maxDuration: { min: 1, max: 3600 }, // 1 second to 1 hour
  maxFileSize: { min: 0, max: 1024 * 1024 * 1024 * 2 }, // 0 to 2GB
};

/**
 * Validate and sanitize recording options
 * Clamps values to valid ranges and ensures positive numbers
 */
function validateRecordingOptions(options: RecordingOptions): Required<RecordingOptions> {
  const merged = { ...DEFAULT_OPTIONS, ...options };

  // Clamp maxDuration to valid range
  merged.maxDuration = Math.max(
    OPTION_CONSTRAINTS.maxDuration.min,
    Math.min(OPTION_CONSTRAINTS.maxDuration.max, Math.floor(merged.maxDuration))
  );

  // Clamp maxFileSize to valid range (0 means no limit)
  merged.maxFileSize = Math.max(
    OPTION_CONSTRAINTS.maxFileSize.min,
    Math.min(OPTION_CONSTRAINTS.maxFileSize.max, Math.floor(merged.maxFileSize))
  );

  return merged;
}

/**
 * Error messages for recording operations
 */
export const RECORDING_ERROR_MESSAGES: Record<string, string> = {
  camera_not_ready: 'Camera is not ready for recording.',
  already_recording: 'Recording is already in progress.',
  not_recording: 'No recording in progress to stop.',
  start_failed: 'Failed to start recording.',
  stop_failed: 'Failed to stop recording.',
  file_not_found: 'Recorded video file not found.',
  permission_denied: 'Camera permission required for recording.',
  default: 'An unexpected recording error occurred.',
};

/**
 * Get user-friendly error message for recording error codes
 */
export function getRecordingErrorMessage(errorCode: string): string {
  return RECORDING_ERROR_MESSAGES[errorCode] ?? RECORDING_ERROR_MESSAGES.default;
}

/**
 * Recording state manager class
 */
export class VideoRecordingService {
  private cameraRef: React.RefObject<CameraView> | null = null;
  private state: RecordingState = 'idle';
  private startTime: Date | null = null;
  private recordingPromise: Promise<{ uri: string }> | null = null;

  /**
   * Set the camera reference for recording
   */
  setCameraRef(ref: React.RefObject<CameraView>): void {
    this.cameraRef = ref;
  }

  /**
   * Get current recording state
   */
  getState(): RecordingState {
    return this.state;
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.state === 'recording';
  }

  /**
   * Start video recording
   */
  async startRecording(
    options: RecordingOptions = {}
  ): Promise<Result<{ startedAt: string }>> {
    // Validate camera ref
    if (!this.cameraRef?.current) {
      return {
        success: false,
        error: getRecordingErrorMessage('camera_not_ready'),
      };
    }

    // Check if already recording
    if (this.state === 'recording' || this.state === 'starting') {
      return {
        success: false,
        error: getRecordingErrorMessage('already_recording'),
      };
    }

    try {
      this.state = 'starting';
      const validatedOptions = validateRecordingOptions(options);

      // Start recording - this returns a promise that resolves when recording stops
      this.startTime = new Date();
      const recordingOptions: { maxDuration?: number; maxFileSize?: number } = {
        maxDuration: validatedOptions.maxDuration,
      };
      if (validatedOptions.maxFileSize > 0) {
        recordingOptions.maxFileSize = validatedOptions.maxFileSize;
      }
      this.recordingPromise = this.cameraRef.current.recordAsync(recordingOptions) as Promise<{ uri: string }>;

      this.state = 'recording';

      return {
        success: true,
        data: { startedAt: this.startTime.toISOString() },
      };
    } catch (error) {
      this.state = 'error';
      console.error('Recording start error:', (error as Error).name);
      return {
        success: false,
        error: getRecordingErrorMessage('start_failed'),
      };
    }
  }

  /**
   * Stop video recording and get the result
   */
  async stopRecording(): Promise<Result<RecordingResult>> {
    // Check if recording
    if (this.state !== 'recording') {
      return {
        success: false,
        error: getRecordingErrorMessage('not_recording'),
      };
    }

    // Validate camera ref
    if (!this.cameraRef?.current) {
      return {
        success: false,
        error: getRecordingErrorMessage('camera_not_ready'),
      };
    }

    try {
      this.state = 'stopping';
      const stoppedAt = new Date();

      // Stop the recording
      this.cameraRef.current.stopRecording();

      // Wait for the recording promise to resolve with the video URI
      if (!this.recordingPromise) {
        return {
          success: false,
          error: getRecordingErrorMessage('stop_failed'),
        };
      }

      const result = await this.recordingPromise;

      // Calculate duration
      const durationMs = this.startTime
        ? stoppedAt.getTime() - this.startTime.getTime()
        : 0;

      // Get file info if possible
      let fileSize: number | undefined;
      try {
        const fileInfo = await FileSystem.getInfoAsync(result.uri);
        if (fileInfo.exists && 'size' in fileInfo) {
          fileSize = fileInfo.size;
        }
      } catch {
        // File size is optional, ignore errors
      }

      const recordingResult: RecordingResult = {
        uri: result.uri,
        durationMs,
        fileSize,
        startedAt: this.startTime?.toISOString() ?? stoppedAt.toISOString(),
        stoppedAt: stoppedAt.toISOString(),
      };

      // Reset state
      this.state = 'idle';
      this.startTime = null;
      this.recordingPromise = null;

      return {
        success: true,
        data: recordingResult,
      };
    } catch (error) {
      this.state = 'error';
      console.error('Recording stop error:', (error as Error).name);
      return {
        success: false,
        error: getRecordingErrorMessage('stop_failed'),
      };
    }
  }

  /**
   * Cancel recording without saving (for app backgrounding)
   */
  async cancelRecording(): Promise<Result<void>> {
    if (this.state !== 'recording') {
      return { success: true, data: undefined };
    }

    try {
      if (this.cameraRef?.current) {
        this.cameraRef.current.stopRecording();
      }

      // Reset state
      this.state = 'idle';
      this.startTime = null;
      this.recordingPromise = null;

      return { success: true, data: undefined };
    } catch (error) {
      console.error('Recording cancel error:', (error as Error).name);
      this.state = 'idle';
      return { success: true, data: undefined };
    }
  }

  /**
   * Reset service state (for cleanup)
   */
  reset(): void {
    this.state = 'idle';
    this.startTime = null;
    this.recordingPromise = null;
    this.cameraRef = null;
  }
}

// Export singleton instance
export const videoRecordingService = new VideoRecordingService();

// Export standalone functions that use the singleton
export async function startRecording(
  cameraRef: React.RefObject<CameraView>,
  options?: RecordingOptions
): Promise<Result<{ startedAt: string }>> {
  videoRecordingService.setCameraRef(cameraRef);
  return videoRecordingService.startRecording(options);
}

export async function stopRecording(): Promise<Result<RecordingResult>> {
  return videoRecordingService.stopRecording();
}

export function isRecording(): boolean {
  return videoRecordingService.isRecording();
}

export function getRecordingState(): RecordingState {
  return videoRecordingService.getState();
}
