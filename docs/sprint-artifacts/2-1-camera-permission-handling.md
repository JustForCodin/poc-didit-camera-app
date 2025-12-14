# Story 2.1: Camera Permission Handling

Status: done

## Story

As a tester,
I want the app to request camera permissions with clear explanations,
So that I understand why the permission is needed and can grant access to start testing.

## Acceptance Criteria

1. **Given** the app needs camera access **When** the tester navigates to the Camera tab for the first time **Then** a permission request is displayed with clear explanation: "Camera access is required to capture frames for AI analysis"
2. **And** if permission is granted, the camera preview becomes active
3. **And** if permission is denied, a helpful error message is shown with a link to device Settings
4. **And** permission state is checked on each app launch
5. **And** the app handles "restricted" and "undetermined" permission states gracefully
6. **And** permission handling works correctly on both iOS and Android

## Tasks / Subtasks

- [x] Task 1: Install and configure expo-camera (AC: #1, #6)
  - [x] 1.1: Run `npx expo install expo-camera`
  - [x] 1.2: Add expo-camera plugin to app.config.ts
  - [x] 1.3: Verify TypeScript types are available
- [x] Task 2: Create camera permission service (AC: #1, #4, #5, #6)
  - [x] 2.1: Create `src/services/camera/` directory
  - [x] 2.2: Create `src/services/camera/permissions.ts` with permission functions
  - [x] 2.3: Implement `checkCameraPermission(): Promise<Result<PermissionStatus>>`
  - [x] 2.4: Implement `requestCameraPermission(): Promise<Result<PermissionStatus>>`
  - [x] 2.5: Implement `openAppSettings(): Promise<Result<void>>` for denied state
  - [x] 2.6: Define `PermissionStatus` type: 'granted' | 'denied' | 'undetermined' | 'restricted'
  - [x] 2.7: Export all functions from index.ts barrel
- [x] Task 3: Create permission UI components (AC: #1, #2, #3)
  - [x] 3.1: Create `src/components/camera/PermissionRequest.tsx` for initial request
  - [x] 3.2: Create `src/components/camera/PermissionDenied.tsx` for denied state
  - [x] 3.3: Implement "Camera access is required to capture frames for AI analysis" message
  - [x] 3.4: Add "Go to Settings" button that opens app settings
  - [x] 3.5: Style components with Styled Components matching theme
- [x] Task 4: Integrate permission handling into Camera tab (AC: #1, #2, #3, #4)
  - [x] 4.1: Update `app/(tabs)/camera.tsx` to check permission on mount
  - [x] 4.2: Show PermissionRequest component when status is 'undetermined'
  - [x] 4.3: Show PermissionDenied component when status is 'denied' or 'restricted'
  - [x] 4.4: Show camera preview placeholder when status is 'granted'
  - [x] 4.5: Re-check permission when app returns from background (AppState listener)
- [x] Task 5: Write comprehensive tests (AC: #5, #6)
  - [x] 5.1: Create `src/services/camera/permissions.test.ts`
  - [x] 5.2: Mock expo-camera permission functions
  - [x] 5.3: Test `checkCameraPermission` for all permission states
  - [x] 5.4: Test `requestCameraPermission` returns correct Result type
  - [x] 5.5: Test Result<T> type compliance
  - [x] 5.6: Run TypeScript check with no errors
  - [x] 5.7: Ensure all tests pass with no regressions (192 tests, up from 169)

## Dev Notes

### Critical Implementation Details

**Permission Service:**

```typescript
// src/services/camera/permissions.ts

import { Camera } from 'expo-camera';
import * as Linking from 'expo-linking';
import type { Result } from '@/src/types/common';

/**
 * Permission status types matching expo-camera
 */
export type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'restricted';

/**
 * Check current camera permission status
 * @returns Result containing the current permission status
 */
export async function checkCameraPermission(): Promise<Result<PermissionStatus>> {
  try {
    const { status } = await Camera.getCameraPermissionsAsync();
    return { success: true, data: status as PermissionStatus };
  } catch (error) {
    console.error('Permission check error:', (error as Error).name);
    return {
      success: false,
      error: 'Failed to check camera permission.',
    };
  }
}

/**
 * Request camera permission from user
 * @returns Result containing the permission status after request
 */
export async function requestCameraPermission(): Promise<Result<PermissionStatus>> {
  try {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return { success: true, data: status as PermissionStatus };
  } catch (error) {
    console.error('Permission request error:', (error as Error).name);
    return {
      success: false,
      error: 'Failed to request camera permission.',
    };
  }
}

/**
 * Open device settings to allow manual permission grant
 * Used when permission is denied and user needs to enable manually
 */
export async function openAppSettings(): Promise<Result<void>> {
  try {
    await Linking.openSettings();
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Open settings error:', (error as Error).name);
    return {
      success: false,
      error: 'Failed to open app settings.',
    };
  }
}
```

**Barrel Export:**

```typescript
// src/services/camera/index.ts

export {
  checkCameraPermission,
  requestCameraPermission,
  openAppSettings,
} from './permissions';

export type { PermissionStatus } from './permissions';
```

**Permission Request Component:**

```typescript
// src/components/camera/PermissionRequest.tsx

import React from 'react';
import styled from 'styled-components/native';

interface PermissionRequestProps {
  onRequestPermission: () => void;
}

export function PermissionRequest({ onRequestPermission }: PermissionRequestProps) {
  return (
    <Container>
      <IconPlaceholder>📷</IconPlaceholder>
      <Title>Camera Access Required</Title>
      <Description>
        Camera access is required to capture frames for AI analysis
      </Description>
      <RequestButton onPress={onRequestPermission}>
        <ButtonText>Enable Camera Access</ButtonText>
      </RequestButton>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const IconPlaceholder = styled.Text`
  font-size: 64px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.sizes.xl}px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  text-align: center;
`;

const Description = styled.Text`
  font-size: ${({ theme }) => theme.typography.sizes.md}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const RequestButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.xl}px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: ${({ theme }) => theme.typography.sizes.md}px;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
`;
```

**Permission Denied Component:**

```typescript
// src/components/camera/PermissionDenied.tsx

import React from 'react';
import styled from 'styled-components/native';

interface PermissionDeniedProps {
  onOpenSettings: () => void;
}

export function PermissionDenied({ onOpenSettings }: PermissionDeniedProps) {
  return (
    <Container>
      <IconPlaceholder>🚫</IconPlaceholder>
      <Title>Camera Access Denied</Title>
      <Description>
        To use this app, please enable camera access in your device settings.
      </Description>
      <SettingsButton onPress={onOpenSettings}>
        <ButtonText>Go to Settings</ButtonText>
      </SettingsButton>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const IconPlaceholder = styled.Text`
  font-size: 64px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.sizes.xl}px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  text-align: center;
`;

const Description = styled.Text`
  font-size: ${({ theme }) => theme.typography.sizes.md}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const SettingsButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.xl}px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: ${({ theme }) => theme.typography.sizes.md}px;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
`;
```

**Camera Tab Integration:**

```typescript
// app/(tabs)/camera.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import styled from 'styled-components/native';
import {
  checkCameraPermission,
  requestCameraPermission,
  openAppSettings,
  type PermissionStatus,
} from '@/src/services/camera';
import { PermissionRequest } from '@/src/components/camera/PermissionRequest';
import { PermissionDenied } from '@/src/components/camera/PermissionDenied';

export default function CameraScreen() {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkPermission = useCallback(async () => {
    const result = await checkCameraPermission();
    if (result.success) {
      setPermissionStatus(result.data);
    }
    setIsLoading(false);
  }, []);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Re-check when app returns from background (user may have changed settings)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkPermission();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [checkPermission]);

  const handleRequestPermission = async () => {
    const result = await requestCameraPermission();
    if (result.success) {
      setPermissionStatus(result.data);
    }
  };

  const handleOpenSettings = async () => {
    await openAppSettings();
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingText>Loading...</LoadingText>
      </LoadingContainer>
    );
  }

  if (permissionStatus === 'undetermined') {
    return <PermissionRequest onRequestPermission={handleRequestPermission} />;
  }

  if (permissionStatus === 'denied' || permissionStatus === 'restricted') {
    return <PermissionDenied onOpenSettings={handleOpenSettings} />;
  }

  // Permission granted - show camera preview (placeholder for Story 2.2)
  return (
    <Container>
      <PlaceholderText>Camera Preview</PlaceholderText>
      <PlaceholderSubtext>Permission granted - camera ready</PlaceholderSubtext>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

const LoadingText = styled.Text`
  font-size: ${({ theme }) => theme.typography.sizes.md}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const PlaceholderText = styled.Text`
  font-size: ${({ theme }) => theme.typography.sizes.xl}px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const PlaceholderSubtext = styled.Text`
  font-size: ${({ theme }) => theme.typography.sizes.md}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
```

### expo-camera API Reference

**From Expo Documentation (December 2025):**

```typescript
import { Camera } from 'expo-camera';

// Check current permission status
const { status } = await Camera.getCameraPermissionsAsync();
// status: 'granted' | 'denied' | 'undetermined'

// Request permission
const { status } = await Camera.requestCameraPermissionsAsync();

// Permission status types
type PermissionStatus = 'granted' | 'denied' | 'undetermined';
```

**iOS Info.plist (auto-added by expo-camera plugin):**
```xml
<key>NSCameraUsageDescription</key>
<string>Camera access is required to capture frames for AI analysis</string>
```

**Android permissions (auto-added by expo-camera plugin):**
```xml
<uses-permission android:name="android.permission.CAMERA" />
```

### Testing Strategy

```typescript
// src/services/camera/permissions.test.ts

import {
  checkCameraPermission,
  requestCameraPermission,
  openAppSettings,
} from './permissions';
import { Camera } from 'expo-camera';
import * as Linking from 'expo-linking';

// Mock expo-camera
jest.mock('expo-camera', () => ({
  Camera: {
    getCameraPermissionsAsync: jest.fn(),
    requestCameraPermissionsAsync: jest.fn(),
  },
}));

// Mock expo-linking
jest.mock('expo-linking', () => ({
  openSettings: jest.fn(),
}));

describe('camera permissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkCameraPermission', () => {
    it('should return granted status', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await checkCameraPermission();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('granted');
      }
    });

    it('should return denied status', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await checkCameraPermission();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('denied');
      }
    });

    it('should return undetermined status', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });

      const result = await checkCameraPermission();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('undetermined');
      }
    });

    it('should return error on failure', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Permission check failed')
      );

      const result = await checkCameraPermission();

      expect(result.success).toBe(false);
    });
  });

  describe('requestCameraPermission', () => {
    it('should return granted status after request', async () => {
      (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await requestCameraPermission();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('granted');
      }
    });
  });

  describe('openAppSettings', () => {
    it('should open settings successfully', async () => {
      (Linking.openSettings as jest.Mock).mockResolvedValue(undefined);

      const result = await openAppSettings();

      expect(result.success).toBe(true);
      expect(Linking.openSettings).toHaveBeenCalled();
    });
  });
});
```

### Architecture Compliance

Per [docs/architecture.md]:
- **Camera Library:** expo-camera for permission handling and preview (AR4)
- **Result<T> Pattern:** Use for all async service functions (AR9)
- **Co-located Tests:** Tests next to source files (AR11)
- **Permission Message:** "Camera access is required to capture frames for AI analysis" (per PRD)

**Directory Structure:**
```
src/
  services/
    camera/
      permissions.ts       # Permission handling functions
      permissions.test.ts  # Co-located tests
      index.ts             # Barrel export
  components/
    camera/
      PermissionRequest.tsx  # Request permission UI
      PermissionDenied.tsx   # Denied state UI
      index.ts               # Barrel export
```

### Previous Story Learnings

**From Story 1.6:**
- Result<T> pattern working well for all async functions
- Console.error mocking for suppressing expected test errors
- Jest mock setup in beforeEach for clean test isolation

### What This Story Does NOT Include

These are explicitly **deferred to later stories**:
- Camera preview rendering (Story 2.2)
- Video recording functionality (Story 2.3)
- Frame capture at intervals (Story 2.4)
- Microphone permission (not required per PRD)

This story focuses ONLY on camera permission request, check, and error handling.

### References

- [Source: docs/architecture.md#Camera-Video-Libraries] - expo-camera decision
- [Source: docs/architecture.md#API--Communication-Patterns] - Result<T> pattern
- [Source: docs/epics.md#Story-2.1] - Original story requirements
- [expo-camera Documentation](https://docs.expo.dev/versions/latest/sdk/camera/)
- [expo-linking Documentation](https://docs.expo.dev/versions/latest/sdk/linking/)
- [Source: docs/sprint-artifacts/1-6-secure-credential-storage.md] - Previous story patterns

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- TypeScript check: `npx tsc --noEmit` - passed with no errors
- Test run: `npm test` - 192 tests passed, 0 failed (up from 169 tests)

### Completion Notes List

1. **expo-camera Installed**: Package added via `npx expo install expo-camera`, plugin configured in app.config.ts with custom permission message
2. **Permission Service**: `src/services/camera/permissions.ts` with Result<T> pattern
3. **Functions Implemented**: `checkCameraPermission`, `requestCameraPermission`, `openAppSettings`
4. **Type Safety**: `PermissionStatus` type for type-safe permission state handling
5. **Error Handling**: `PERMISSION_ERROR_MESSAGES` and `getPermissionErrorMessage()` for user-friendly messages
6. **UI Components**: PermissionRequest and PermissionDenied components with themed styling
7. **Camera Tab Integration**: Full permission flow with AppState listener for background return
8. **Testing**: 23 new tests covering all permission functions and Result<T> compliance

### File List

**Created:**
- `src/services/camera/permissions.ts` - Permission handling functions (110 lines)
- `src/services/camera/permissions.test.ts` - Co-located tests (23 tests)
- `src/services/camera/index.ts` - Barrel export
- `src/components/camera/PermissionRequest.tsx` - Request permission UI
- `src/components/camera/PermissionDenied.tsx` - Denied state UI
- `src/components/camera/index.ts` - Component barrel export

**Modified:**
- `package.json` - Added expo-camera dependency
- `app.config.ts` - Added expo-camera plugin with permission message
- `app/(tabs)/camera.tsx` - Integrated full permission handling flow

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-14 | Story created with comprehensive dev notes from architecture and epics | Claude Opus 4.5 |
| 2025-12-14 | Implementation complete - all tasks done, 192 tests passing | Claude Opus 4.5 |
