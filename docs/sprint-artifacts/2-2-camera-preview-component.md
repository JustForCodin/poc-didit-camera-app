# Story 2.2: Camera Preview Component

## Story

**As a** tester,
**I want** to see a live camera preview on the Camera screen,
**So that** I can point my phone at the test scenario and see what the AI will analyze.

## Status: Done

## Acceptance Criteria

- [x] Live camera preview fills the screen using `expo-camera`
- [x] Preview uses the rear camera by default
- [x] Preview maintains proper aspect ratio without distortion
- [x] Preview is portrait-oriented (matching typical testing posture)
- [x] Camera preview remains responsive (no lag or frame drops)
- [x] Memory is managed properly to prevent leaks during extended use

## Implementation Notes

### Files Created/Modified

- `src/components/camera/CameraPreview.tsx` - Main camera preview component
- `src/components/camera/CameraPreview.test.tsx` - Unit tests (17 tests)
- `src/components/camera/index.ts` - Updated barrel export
- `app/(tabs)/camera.tsx` - Integrated CameraPreview component

### Component Features

1. **CameraPreview Component**
   - Uses `CameraView` from expo-camera
   - Configurable `isActive` prop for resource management
   - Configurable `facing` prop ('back' or 'front')
   - `onCameraReady` callback for initialization tracking
   - `onMountError` callback for error handling
   - Loading overlay while camera initializes
   - Error state handling with user-friendly message
   - Inactive state shows "Camera Paused" overlay

2. **Memory Management**
   - Camera only renders when `isActive={true}`
   - Setting `isActive={false}` unmounts camera to release resources
   - Proper cleanup via React lifecycle

3. **Error Handling**
   - Mount errors captured and displayed
   - Error state shows warning icon and message
   - Ready state tracked for loading indication

### Testing

- 17 unit tests covering:
  - Component structure and exports
  - Props validation (isActive, facing, callbacks, testID)
  - CameraType values (back/front)
  - Callback type signatures
  - Integration with barrel exports

### Dependencies

- expo-camera (already installed in Story 2.1)
- styled-components (existing)

## Dev Notes

- Camera preview uses `overflow: hidden` with border radius for rounded corners
- Background color is black (#000) to match camera letterboxing
- Loading overlay has semi-transparent background for visibility
- Component is memoization-ready for performance optimization if needed
