# Story 2.2: Camera Preview Component

Status: done

## Story

As a tester,
I want to see a live camera preview on the Camera screen,
So that I can point my phone at the test scenario and see what the AI will analyze.

## Acceptance Criteria

1. **Given** camera permission is granted **When** viewing the Camera screen **Then** live camera preview fills the screen using `expo-camera`
2. **And** preview uses the rear camera by default
3. **And** preview maintains proper aspect ratio without distortion
4. **And** preview is portrait-oriented (matching typical testing posture)
5. **And** camera preview remains responsive (no lag or frame drops)
6. **And** memory is managed properly to prevent leaks during extended use (via `isActive` prop)

## Tasks / Subtasks

- [x] Task 1: Create CameraPreview component structure (AC: #1, #2)
  - [x] 1.1: Create `src/components/camera/CameraPreview.tsx` with CameraView from expo-camera
  - [x] 1.2: Implement `isActive` prop for resource management (default: true)
  - [x] 1.3: Implement `facing` prop for camera selection (default: 'back')
  - [x] 1.4: Add `onCameraReady` callback for initialization tracking
  - [x] 1.5: Add `onMountError` callback for error handling
  - [x] 1.6: Export CameraPreviewProps interface
- [x] Task 2: Implement visual states (AC: #3, #4)
  - [x] 2.1: Create PreviewContainer with flex:1 and black background
  - [x] 2.2: Add LoadingOverlay with "Initializing camera..." text
  - [x] 2.3: Add InactiveOverlay with "Camera Paused" text
  - [x] 2.4: Add ErrorOverlay with warning icon and error message
  - [x] 2.5: Apply border radius and overflow hidden for rounded corners
- [x] Task 3: Implement memory management (AC: #5, #6)
  - [x] 3.1: Unmount CameraView when `isActive={false}`
  - [x] 3.2: Reset error state when becoming active
  - [x] 3.3: Add cameraRef for future frame capture (Story 2.4)
- [x] Task 4: Integrate with Camera screen (AC: #1)
  - [x] 4.1: Update `app/(tabs)/camera.tsx` to use CameraPreview
  - [x] 4.2: Pass `isActive={true}` and `facing="back"` props
  - [x] 4.3: Add testID for testing
- [x] Task 5: Update barrel exports
  - [x] 5.1: Export CameraPreview from `src/components/camera/index.ts`
  - [x] 5.2: Export CameraPreviewProps type
- [x] Task 6: Write comprehensive tests (AC: #1-6)
  - [x] 6.1: Create `src/components/camera/CameraPreview.test.tsx`
  - [x] 6.2: Mock expo-camera module
  - [x] 6.3: Test component exports and props interface
  - [x] 6.4: Test render with default testID
  - [x] 6.5: Test "Camera Paused" state when inactive
  - [x] 6.6: Test loading text when active
  - [x] 6.7: Test CameraView renders when active with correct facing prop
  - [x] 6.8: Test barrel export integration
  - [x] 6.9: Run TypeScript check with no errors
  - [x] 6.10: Ensure all tests pass (182 tests total)

## Dev Notes

### Critical Implementation Details

**CameraPreview Component:**
- Uses `CameraView` from expo-camera (not deprecated `Camera`)
- `isActive` prop controls camera lifecycle for memory management
- `cameraRef` reserved for future frame capture (Story 2.4)
- Three visual states: loading, active (camera), inactive ("Camera Paused")
- Error state with warning icon and message

**Memory Management:**
- Camera only renders when `isActive={true}`
- Setting `isActive={false}` unmounts CameraView to release resources
- Error state resets when transitioning to active

**Styled Components:**
- PreviewContainer: flex:1, black background, rounded corners
- LoadingOverlay: Centered text with semi-transparent background
- InactiveOverlay: Full coverage with "Camera Paused" message
- ErrorOverlay: Warning icon, error title, error message

### Dependencies

- expo-camera (installed in Story 2.1)
- styled-components/native (existing)
- @testing-library/react-native (added for render tests)

### Architecture Compliance

Per [docs/architecture.md]:
- Component uses expo-camera as specified
- Follows styled-components pattern
- Co-located tests with source files
- TypeScript interfaces exported

### References

- [Source: docs/architecture.md#Camera-Capture] - Camera technology decision
- [Source: docs/epics.md#Story-2.2] - Original story requirements
- [Source: docs/sprint-artifacts/2-1-camera-permission-handling.md] - Previous story

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- TypeScript check: `npx tsc --noEmit` - passed with no errors
- Test run: `npm test` - 182 tests passed, 0 failed (up from 174 tests)

### Completion Notes List

1. **CameraPreview Component**: Created with CameraView, isActive, facing props
2. **Visual States**: Loading overlay, inactive overlay, error overlay
3. **Memory Management**: Camera unmounts when inactive
4. **Integration**: Integrated into camera.tsx with proper props
5. **Testing**: 25 tests (17 interface + 8 render tests) using @testing-library/react-native
6. **Code Review Fixes**: Removed unused imports, documented cameraRef purpose

### File List

**Created:**
- `src/components/camera/CameraPreview.tsx` - Camera preview component (183 lines)
- `src/components/camera/CameraPreview.test.tsx` - Component tests (25 tests)

**Modified:**
- `src/components/camera/index.ts` - Added CameraPreview export
- `app/(tabs)/camera.tsx` - Integrated CameraPreview component
- `package.json` - Added @testing-library/react-native

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-14 | Initial implementation complete | Claude Opus 4.5 |
| 2025-12-14 | Code review: Added render tests, removed unused imports, documented cameraRef | Claude Opus 4.5 |
