# Story 2.3: Video Recording Service

Status: done

## Story

As a tester,
I want to record video during my test sessions,
So that I can review what the camera captured and verify AI analysis accuracy.

## Acceptance Criteria

1. **Given** camera preview is active **When** recording is started **Then** video recording begins using expo-camera's CameraView recording capabilities
2. **And** recording captures the full camera view continuously
3. **And** recording state is tracked in Redux store
4. **And** recording can be stopped programmatically or manually
5. **And** the recorded video file is accessible after recording stops
6. **And** recording handles app backgrounding gracefully (cancels recording on background)
7. **And** recording errors are caught and reported to the user

## Tasks / Subtasks

- [x] Task 1: Create VideoRecordingService class (AC: #1, #2, #4, #5)
  - [x] 1.1: Create `src/services/camera/recording.ts` with VideoRecordingService
  - [x] 1.2: Implement `setCameraRef(ref)` to set camera reference
  - [x] 1.3: Implement `startRecording(options)` returning Result<{ startedAt: string }>
  - [x] 1.4: Implement `stopRecording()` returning Result<RecordingResult>
  - [x] 1.5: Implement `cancelRecording()` for graceful cancellation
  - [x] 1.6: Implement `reset()` for cleanup
  - [x] 1.7: Define RecordingState, RecordingOptions, RecordingResult types
  - [x] 1.8: Export singleton instance and standalone functions
  - [x] 1.9: Update barrel export in `src/services/camera/index.ts`
- [x] Task 2: Create Redux slice for recording state (AC: #3)
  - [x] 2.1: Create `src/store/slices/recordingSlice.ts`
  - [x] 2.2: Define RecordingSliceState interface
  - [x] 2.3: Implement actions: startRecordingRequest, startRecordingSuccess, updateDuration, stopRecordingRequest, stopRecordingSuccess, setRecordingError, resetRecording, clearLastResult
  - [x] 2.4: Implement selectors for state, isRecording, duration, lastResult, error, isLoading
  - [x] 2.5: Add recordingReducer to store in `src/store/store.ts`
  - [x] 2.6: Update barrel export in `src/store/slices/index.ts`
- [x] Task 3: Create useRecording hook (AC: #1, #3, #4)
  - [x] 3.1: Create `src/hooks/useRecording.ts` integrating service with Redux
  - [x] 3.2: Implement startRecording, stopRecording, cancelRecording, reset functions
  - [x] 3.3: Implement duration timer with 100ms updates
  - [x] 3.4: Wire up callbacks: onRecordingStart, onRecordingStop, onRecordingError
  - [x] 3.5: Export UseRecordingOptions and UseRecordingReturn types
  - [x] 3.6: Create barrel export in `src/hooks/index.ts`
- [x] Task 4: Implement app backgrounding handling (AC: #6)
  - [x] 4.1: Create `src/hooks/useAppStateRecording.ts` hook
  - [x] 4.2: Listen to AppState changes
  - [x] 4.3: Cancel recording when app goes to background
  - [x] 4.4: Reset Redux state on background cancel
  - [x] 4.5: Provide onBackgroundCancel callback option
- [x] Task 5: Write comprehensive tests (AC: #1-7)
  - [x] 5.1: Create `src/services/camera/recording.test.ts`
  - [x] 5.2: Mock expo-camera and expo-file-system modules
  - [x] 5.3: Test RECORDING_ERROR_MESSAGES and getRecordingErrorMessage
  - [x] 5.4: Test VideoRecordingService class methods
  - [x] 5.5: Test singleton instance
  - [x] 5.6: Test standalone functions
  - [x] 5.7: Test type exports
  - [x] 5.8: Test Result<T> type compliance
  - [x] 5.9: Create `src/store/slices/recordingSlice.test.ts`
  - [x] 5.10: Test reducer initial state and all actions
  - [x] 5.11: Test all selectors
  - [x] 5.12: Run TypeScript check with no errors
  - [x] 5.13: Ensure all tests pass (253 total tests)

## Dev Notes

### Critical Implementation Details

**VideoRecordingService:**

```typescript
// src/services/camera/recording.ts

export type RecordingState = 'idle' | 'starting' | 'recording' | 'stopping' | 'error';

export interface RecordingOptions {
  maxDuration?: number;  // Default: 300 seconds (5 minutes)
  maxFileSize?: number;  // In bytes, 0 = no limit
}

export interface RecordingResult {
  uri: string;           // Path to recorded video file
  durationMs: number;    // Recording duration in milliseconds
  fileSize?: number;     // File size in bytes (if available)
  startedAt: string;     // ISO timestamp
  stoppedAt: string;     // ISO timestamp
}

export class VideoRecordingService {
  private cameraRef: React.RefObject<CameraView> | null = null;
  private state: RecordingState = 'idle';
  private startTime: Date | null = null;
  private recordingPromise: Promise<{ uri: string }> | null = null;

  setCameraRef(ref: React.RefObject<CameraView>): void;
  getState(): RecordingState;
  isRecording(): boolean;
  async startRecording(options?: RecordingOptions): Promise<Result<{ startedAt: string }>>;
  async stopRecording(): Promise<Result<RecordingResult>>;
  async cancelRecording(): Promise<Result<void>>;
  reset(): void;
}

// Singleton instance
export const videoRecordingService = new VideoRecordingService();

// Standalone functions using singleton
export async function startRecording(
  cameraRef: React.RefObject<CameraView>,
  options?: RecordingOptions
): Promise<Result<{ startedAt: string }>>;
export async function stopRecording(): Promise<Result<RecordingResult>>;
export function isRecording(): boolean;
export function getRecordingState(): RecordingState;
```

**Recording Redux Slice:**

```typescript
// src/store/slices/recordingSlice.ts

export interface RecordingSliceState {
  state: RecordingState;
  isRecording: boolean;
  startedAt: string | null;
  durationMs: number;
  lastResult: RecordingResult | null;
  error: string | null;
}

// Actions
export const {
  startRecordingRequest,   // Set state to 'starting'
  startRecordingSuccess,   // Set state to 'recording' with startedAt
  updateDuration,          // Update durationMs (called every 100ms)
  stopRecordingRequest,    // Set state to 'stopping'
  stopRecordingSuccess,    // Set state to 'idle' with lastResult
  setRecordingError,       // Set state to 'error' with message
  resetRecording,          // Reset to idle (preserves lastResult)
  clearLastResult,         // Clear lastResult
} = recordingSlice.actions;

// Selectors
export const selectRecordingState;
export const selectIsRecording;
export const selectRecordingStartedAt;
export const selectRecordingDuration;
export const selectLastRecordingResult;
export const selectRecordingError;
export const selectRecordingIsLoading;  // true when starting or stopping
```

**useRecording Hook:**

```typescript
// src/hooks/useRecording.ts

export interface UseRecordingOptions {
  cameraRef: React.RefObject<CameraView>;
  onRecordingStart?: () => void;
  onRecordingStop?: (result: RecordingResult) => void;
  onRecordingError?: (error: string) => void;
}

export interface UseRecordingReturn {
  recordingState: RecordingState;
  isRecording: boolean;
  isLoading: boolean;
  durationMs: number;
  lastResult: RecordingResult | null;
  error: string | null;
  startRecording: (options?: RecordingOptions) => Promise<void>;
  stopRecording: () => Promise<RecordingResult | null>;
  cancelRecording: () => Promise<void>;
  reset: () => void;
}

export function useRecording(options: UseRecordingOptions): UseRecordingReturn;
```

**App Backgrounding Hook:**

```typescript
// src/hooks/useAppStateRecording.ts

export interface UseAppStateRecordingOptions {
  onBackgroundCancel?: () => void;
}

// Automatically cancels recording when app goes to background
export function useAppStateRecording(options?: UseAppStateRecordingOptions): void;
```

### expo-camera Recording API

**From expo-camera documentation:**

```typescript
import { CameraView } from 'expo-camera';

// Start recording - returns promise that resolves when recording stops
const recordingPromise = cameraRef.current.recordAsync({
  maxDuration: 300,    // Optional: max duration in seconds
  maxFileSize: number, // Optional: max file size in bytes
});

// Stop recording - triggers the promise to resolve
cameraRef.current.stopRecording();

// Recording result
const { uri } = await recordingPromise;  // uri: path to video file
```

**Important Notes:**
- `recordAsync()` returns a promise that resolves when recording is stopped
- Must call `stopRecording()` to trigger the promise resolution
- The `mute` option is a CameraView prop, not a recording option
- Recording mode requires `mode="video"` prop on CameraView

### Dependencies

- expo-camera (installed in Story 2.1)
- expo-file-system (for file info)
- @reduxjs/toolkit (existing)
- react-native AppState API (for backgrounding)

### Architecture Compliance

Per [docs/architecture.md]:
- Uses expo-camera CameraView for recording (AR4)
- Result<T> pattern for all async functions (AR9)
- Redux Toolkit for state management (AR2)
- Co-located tests next to source files (AR11)
- Feature-based component organization (AR12)

### Previous Story Learnings

**From Story 2.2:**
- CameraView ref needed for recording operations
- isActive prop controls camera lifecycle
- Component already has cameraRef reserved for frame capture (also used for recording)

**From Story 2.1:**
- Permission handling is complete
- Camera module is properly configured

### What This Story Does NOT Include

Deferred to later stories:
- Frame capture at intervals (Story 2.4)
- Dual-capture mode video + frames (Story 2.5)
- Video compression (Story 2.6)
- Recording controls UI (Story 2.7)
- Session persistence to Supabase (Epic 4)

This story focuses ONLY on the video recording service, Redux state, and hooks.

### References

- [Source: docs/architecture.md#Camera-Video-Libraries] - expo-camera decision
- [Source: docs/architecture.md#State-Management] - Redux Toolkit patterns
- [Source: docs/epics.md#Story-2.3] - Original story requirements
- [expo-camera Recording](https://docs.expo.dev/versions/latest/sdk/camera/#recording-videos)
- [Source: docs/sprint-artifacts/2-2-camera-preview-component.md] - Previous story

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- TypeScript check: `npx tsc --noEmit` - passed with no errors
- Test run: `npm test` - 253 tests passed (71 new recording tests), 0 failed

### Completion Notes List

1. **VideoRecordingService**: Created with Result<T> pattern, state management
2. **Recording Types**: RecordingState, RecordingOptions, RecordingResult defined
3. **Redux Slice**: recordingSlice with 8 actions and 7 selectors
4. **useRecording Hook**: Integrates service with Redux, duration timer (100ms updates)
5. **useAppStateRecording Hook**: Handles app backgrounding gracefully
6. **Tests**: 42 service tests + 29 Redux slice tests = 71 new tests

### File List

**Created:**
- `src/services/camera/recording.ts` - Video recording service (300 lines)
- `src/services/camera/recording.test.ts` - Service tests (42 tests)
- `src/store/slices/recordingSlice.ts` - Recording Redux slice (160 lines)
- `src/store/slices/recordingSlice.test.ts` - Redux slice tests (29 tests)
- `src/hooks/useRecording.ts` - Recording hook (190 lines)
- `src/hooks/useAppStateRecording.ts` - App state handling hook (60 lines)
- `src/hooks/index.ts` - Hooks barrel export
- `docs/sprint-artifacts/2-3-video-recording-service.md` - Story artifact

**Modified:**
- `src/services/camera/index.ts` - Added recording exports
- `src/store/slices/index.ts` - Added recordingReducer export
- `src/store/store.ts` - Added recording to rootReducer
- `docs/sprint-artifacts/sprint-status.yaml` - Updated epic-1 to done, 1-6 to done, 2-3 to in-progress

## Code Review

### Review Date: 2025-12-15
### Reviewer: Claude Opus 4.5 (Adversarial Code Review)

**Review Result:** PASSED with fixes applied

**Issues Found:** 0 Critical, 3 Medium, 2 Low

### Issues Fixed:

**M1: Missing Hook Tests (FIXED)**
- Added `src/hooks/useRecording.test.ts` (13 tests)
- Added `src/hooks/useAppStateRecording.test.ts` (11 tests)
- Total tests now: 281 (was 253)

**M2: CameraPreview Doesn't Expose cameraRef (FIXED)**
- Added `forwardRef` to CameraPreview component
- Added `CameraPreviewRef` interface with `getCameraRef()` method
- Updated barrel export to include `CameraPreviewRef` type
- Story 2.7 (Recording Controls UI) can now access camera ref

**M3: No Input Validation for Recording Options (FIXED)**
- Added `validateRecordingOptions()` function
- Clamps `maxDuration` to 1-3600 seconds
- Clamps `maxFileSize` to 0-2GB
- Floors decimal values to integers
- Added 4 validation tests

### Low Issues (Documented, Not Fixed):
- L1: Stale camera ref potential - edge case, monitoring
- L2: Minor documentation gap - epics mention expo-av but implementation correctly uses expo-camera

### Final Test Results:
- TypeScript: Compiles with no errors
- Tests: 281 passed, 0 failed (28 new tests added)

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-15 | Story created, implementation in progress | Claude Opus 4.5 |
| 2025-12-15 | Implementation complete, all 253 tests passing, moved to review | Claude Opus 4.5 |
| 2025-12-15 | Code review completed, 3 medium issues fixed, 28 tests added, status: done | Claude Opus 4.5 |
