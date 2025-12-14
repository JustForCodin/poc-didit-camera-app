# Story 1.6: Secure Credential Storage

Status: done

## Story

As a tester,
I want my backend API credentials stored securely on my device,
So that my credentials are protected and persist across app sessions.

## Acceptance Criteria

1. **Given** a user needs to store backend credentials **When** credentials are saved **Then** `expo-secure-store` wrapper exists in `src/services/storage/secureStorage.ts`
2. **And** credentials are encrypted at rest using platform secure storage (iOS Keychain, Android Keystore per NFR15)
3. **And** wrapper provides `getCredential(key)`, `setCredential(key, value)`, `deleteCredential(key)` functions
4. **And** all functions return `Result<T>` type for consistent error handling (per AR9)
5. **And** credentials are never logged in plain text (per NFR17)
6. **And** storage errors are handled gracefully with user-friendly messages
7. **And** wrapper has co-located tests in `secureStorage.test.ts`

## Tasks / Subtasks

- [x] Task 1: Install and configure expo-secure-store (AC: #1, #2)
  - [x] 1.1: Run `npx expo install expo-secure-store`
  - [x] 1.2: Verify package.json includes expo-secure-store
  - [x] 1.3: Verify TypeScript types are available
- [x] Task 2: Create secure storage service wrapper (AC: #1, #3, #4)
  - [x] 2.1: Create `src/services/storage/` directory
  - [x] 2.2: Create `src/services/storage/secureStorage.ts` with wrapper functions
  - [x] 2.3: Implement `getCredential(key: string): Promise<Result<string | null>>`
  - [x] 2.4: Implement `setCredential(key: string, value: string): Promise<Result<void>>`
  - [x] 2.5: Implement `deleteCredential(key: string): Promise<Result<void>>`
  - [x] 2.6: Implement `hasCredential(key: string): Promise<Result<boolean>>` helper
  - [x] 2.7: Export all functions from index.ts barrel
- [x] Task 3: Implement credential key management (AC: #1, #3)
  - [x] 3.1: Define `CredentialKey` type for valid credential keys
  - [x] 3.2: Define keys: `'diditCamera_apiKey'`, `'gemini_apiKey'`, `'claude_apiKey'`
  - [x] 3.3: Export credential key constants for type-safe access
- [x] Task 4: Implement error handling (AC: #5, #6)
  - [x] 4.1: Create STORAGE_ERROR_MESSAGES constant with user-friendly messages
  - [x] 4.2: Implement `getStorageErrorMessage(error)` helper
  - [x] 4.3: Ensure no credential values are logged (only error types/codes)
  - [x] 4.4: Handle platform-specific errors (iOS Keychain, Android Keystore)
- [x] Task 5: Write comprehensive tests (AC: #7)
  - [x] 5.1: Create `src/services/storage/secureStorage.test.ts`
  - [x] 5.2: Mock expo-secure-store module
  - [x] 5.3: Test `getCredential` returns Result<string | null>
  - [x] 5.4: Test `setCredential` returns Result<void>
  - [x] 5.5: Test `deleteCredential` returns Result<void>
  - [x] 5.6: Test `hasCredential` returns Result<boolean>
  - [x] 5.7: Test error handling for storage failures
  - [x] 5.8: Verify no credential values in console output
  - [x] 5.9: Run TypeScript check with no errors
  - [x] 5.10: Ensure all tests pass with no regressions (169 tests, up from 134)

## Dev Notes

### Critical Implementation Details

**Secure Storage Service:**

```typescript
// src/services/storage/secureStorage.ts

import * as SecureStore from 'expo-secure-store';
import type { Result } from '@/src/types/common';

/**
 * Valid credential keys for type-safe storage access
 */
export type CredentialKey =
  | 'diditCamera_apiKey'
  | 'gemini_apiKey'
  | 'claude_apiKey';

/**
 * Credential key constants for type-safe access
 */
export const CREDENTIAL_KEYS = {
  DIDIT_CAMERA: 'diditCamera_apiKey' as const,
  GEMINI: 'gemini_apiKey' as const,
  CLAUDE: 'claude_apiKey' as const,
} as const;

/**
 * User-friendly error messages for storage errors
 */
export const STORAGE_ERROR_MESSAGES: Record<string, string> = {
  unavailable: 'Secure storage is not available on this device.',
  write_failed: 'Failed to save credential. Please try again.',
  read_failed: 'Failed to retrieve credential.',
  delete_failed: 'Failed to remove credential.',
  invalid_key: 'Invalid credential key provided.',
  default: 'Storage operation failed. Please try again.',
};

/**
 * Get user-friendly error message for storage error
 */
export function getStorageErrorMessage(errorCode: string): string {
  return STORAGE_ERROR_MESSAGES[errorCode] ?? STORAGE_ERROR_MESSAGES.default;
}

/**
 * Retrieve a credential from secure storage
 * @param key - The credential key to retrieve
 * @returns Result containing the credential value or null if not found
 */
export async function getCredential(
  key: CredentialKey
): Promise<Result<string | null>> {
  try {
    const value = await SecureStore.getItemAsync(key);
    return { success: true, data: value };
  } catch (error) {
    // Log error type only, never log credential values
    console.error('Secure storage read error:', (error as Error).name);
    return {
      success: false,
      error: getStorageErrorMessage('read_failed'),
    };
  }
}

/**
 * Store a credential in secure storage
 * @param key - The credential key to store
 * @param value - The credential value to store
 * @returns Result indicating success or failure
 */
export async function setCredential(
  key: CredentialKey,
  value: string
): Promise<Result<void>> {
  try {
    await SecureStore.setItemAsync(key, value);
    return { success: true, data: undefined };
  } catch (error) {
    // Log error type only, never log credential values
    console.error('Secure storage write error:', (error as Error).name);
    return {
      success: false,
      error: getStorageErrorMessage('write_failed'),
    };
  }
}

/**
 * Delete a credential from secure storage
 * @param key - The credential key to delete
 * @returns Result indicating success or failure
 */
export async function deleteCredential(
  key: CredentialKey
): Promise<Result<void>> {
  try {
    await SecureStore.deleteItemAsync(key);
    return { success: true, data: undefined };
  } catch (error) {
    // Log error type only, never log credential values
    console.error('Secure storage delete error:', (error as Error).name);
    return {
      success: false,
      error: getStorageErrorMessage('delete_failed'),
    };
  }
}

/**
 * Check if a credential exists in secure storage
 * @param key - The credential key to check
 * @returns Result containing boolean indicating existence
 */
export async function hasCredential(
  key: CredentialKey
): Promise<Result<boolean>> {
  try {
    const value = await SecureStore.getItemAsync(key);
    return { success: true, data: value !== null };
  } catch (error) {
    // Log error type only, never log credential values
    console.error('Secure storage check error:', (error as Error).name);
    return {
      success: false,
      error: getStorageErrorMessage('read_failed'),
    };
  }
}
```

**Barrel Export:**

```typescript
// src/services/storage/index.ts

export {
  getCredential,
  setCredential,
  deleteCredential,
  hasCredential,
  CREDENTIAL_KEYS,
  STORAGE_ERROR_MESSAGES,
  getStorageErrorMessage,
} from './secureStorage';
export type { CredentialKey } from './secureStorage';
```

### Testing Strategy

```typescript
// src/services/storage/secureStorage.test.ts

import {
  getCredential,
  setCredential,
  deleteCredential,
  hasCredential,
  CREDENTIAL_KEYS,
  STORAGE_ERROR_MESSAGES,
  getStorageErrorMessage,
} from './secureStorage';
import * as SecureStore from 'expo-secure-store';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock console.error to suppress expected errors and verify no values logged
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('secureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('getCredential', () => {
    it('should return credential value when found', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('api-key-value');

      const result = await getCredential(CREDENTIAL_KEYS.GEMINI);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('api-key-value');
      }
    });

    it('should return null when credential not found', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await getCredential(CREDENTIAL_KEYS.GEMINI);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it('should return error on storage failure', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
        new Error('Storage unavailable')
      );

      const result = await getCredential(CREDENTIAL_KEYS.GEMINI);

      expect(result.success).toBe(false);
    });
  });

  describe('setCredential', () => {
    it('should store credential successfully', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await setCredential(CREDENTIAL_KEYS.GEMINI, 'new-api-key');

      expect(result.success).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        CREDENTIAL_KEYS.GEMINI,
        'new-api-key'
      );
    });

    it('should return error on storage failure', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(
        new Error('Write failed')
      );

      const result = await setCredential(CREDENTIAL_KEYS.GEMINI, 'api-key');

      expect(result.success).toBe(false);
    });
  });

  describe('error logging security', () => {
    it('should never log credential values on error', async () => {
      const sensitiveValue = 'super-secret-api-key';
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(
        new Error('Write failed')
      );

      await setCredential(CREDENTIAL_KEYS.GEMINI, sensitiveValue);

      // Verify error was logged but value was not
      const logCalls = mockConsoleError.mock.calls.flat().join(' ');
      expect(logCalls).not.toContain(sensitiveValue);
    });
  });
});
```

### expo-secure-store Details

**From Expo Documentation (December 2025):**
- Uses iOS Keychain Services and Android Keystore for secure storage
- Values are encrypted at rest
- Data persists across app reinstalls (iOS) or until app uninstall (Android)
- Maximum value size: ~2KB
- Only string values supported (serialize objects to JSON if needed)

**API Reference:**
```typescript
// Get value (returns null if not found)
const value = await SecureStore.getItemAsync(key);

// Set value
await SecureStore.setItemAsync(key, value);

// Delete value
await SecureStore.deleteItemAsync(key);

// Options (optional)
await SecureStore.setItemAsync(key, value, {
  keychainAccessible: SecureStore.WHEN_UNLOCKED, // iOS only
});
```

### Previous Story Learnings

**From Story 1.5:**
- Result<T> pattern working well for all async functions
- 134 tests passing after code review additions
- Console.error mocking for suppressing expected test errors
- BACKEND_ERROR_MESSAGES pattern for user-friendly errors

**From Architecture:**
- expo-secure-store for encrypted local credential storage
- No plain-text credential logging (NFR17)
- Credentials synced from Supabase for team sharing (future story)

### Architecture Compliance

Per [docs/architecture.md]:
- **Security:** expo-secure-store for encrypted storage (iOS Keychain, Android Keystore)
- **Result<T> Pattern:** Use for all async service functions (AR9)
- **No Plain-Text Logging:** Never log credential values (NFR17)
- **Co-located Tests:** Tests next to source files

**Directory Structure:**
```
src/
  services/
    storage/
      secureStorage.ts      # expo-secure-store wrapper
      secureStorage.test.ts # Co-located tests
      index.ts              # Barrel export
```

### What This Story Does NOT Include

These are explicitly **deferred to later stories**:
- Supabase credential sync (future Epic 5)
- Credential input UI (Story 3.x - Settings Screen)
- Backend configuration using stored credentials (Story 3.x)
- Team credential sharing (future collaboration features)

This story focuses ONLY on the secure storage wrapper implementation.

### Security Notes

**Critical Security Requirements:**
1. Never log credential values (only error names/types)
2. Use typed `CredentialKey` to prevent arbitrary key access
3. All errors return user-friendly messages, not technical details
4. Platform secure storage (Keychain/Keystore) handles encryption

**Error Logging Pattern:**
```typescript
// CORRECT: Log error type only
console.error('Secure storage error:', (error as Error).name);

// WRONG: Never do this - exposes credential values
console.error('Failed to save:', key, value); // NEVER
```

### References

- [Source: docs/architecture.md#Data-Storage-Strategy] - expo-secure-store decision
- [Source: docs/architecture.md#API--Communication-Patterns] - Result<T> pattern
- [Source: docs/epics.md#Story-1.6] - Original story requirements
- [expo-secure-store Documentation](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Source: docs/sprint-artifacts/1-5-backend-abstraction-layer-foundation.md] - Previous story patterns

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- TypeScript check: `npx tsc --noEmit` - passed with no errors
- Test run: `npm test` - 169 tests passed, 0 failed (up from 134 tests)

### Completion Notes List

1. **expo-secure-store Installed**: Package added via `npx expo install expo-secure-store`, plugin added to app.config.ts
2. **Secure Storage Service**: `src/services/storage/secureStorage.ts` with Result<T> pattern
3. **Functions Implemented**: `getCredential`, `setCredential`, `deleteCredential`, `hasCredential`, `clearAllCredentials`
4. **Type Safety**: `CredentialKey` type and `CREDENTIAL_KEYS` constants for type-safe access
5. **Error Handling**: `STORAGE_ERROR_MESSAGES` and `getStorageErrorMessage()` for user-friendly messages
6. **Security Compliance**: No credential values logged (per NFR17), only error names/types
7. **Testing**: 35 new tests covering all functions, error handling, and security verification

### File List

**Created:**
- `src/services/storage/secureStorage.ts` - expo-secure-store wrapper (172 lines)
- `src/services/storage/secureStorage.test.ts` - Co-located tests (35 tests)
- `src/services/storage/index.ts` - Barrel export

**Modified:**
- `package.json` - Added expo-secure-store dependency
- `app.config.ts` - Added expo-secure-store plugin

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-14 | Story created with comprehensive dev notes from architecture and epics | Claude Opus 4.5 |
| 2025-12-14 | Implementation complete - all tasks done, 169 tests passing | Claude Opus 4.5 |
