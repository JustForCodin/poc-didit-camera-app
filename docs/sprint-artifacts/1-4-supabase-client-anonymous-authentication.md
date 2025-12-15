# Story 1.4: Supabase Client & Anonymous Authentication

Status: done

## Story

As a tester,
I want the app to automatically authenticate me anonymously on first launch,
So that I can start testing immediately without creating an account.

## Acceptance Criteria

1. **Given** the app is launched for the first time on a device **When** the app initializes **Then** Supabase client is configured with environment variables
2. **And** anonymous authentication is triggered automatically via `supabase.auth.signInAnonymously()`
3. **And** the anonymous session is persisted locally
4. **And** subsequent app launches use the existing anonymous session
5. **And** all API requests include the authentication token
6. **And** authentication errors are handled gracefully with user-friendly messages
7. **And** HTTPS/TLS is used for all Supabase communication (per NFR16)

## Tasks / Subtasks

- [x] Task 1: Create Supabase auth service wrapper (AC: #1, #5)
  - [x] 1.1: Create `src/services/supabase/auth.ts` with authentication functions
  - [x] 1.2: Export `initializeAuth()` function that checks existing session first
  - [x] 1.3: Export `getSession()` helper function for checking current session
  - [x] 1.4: Export `getUser()` helper function for getting current user
  - [x] 1.5: Use `Result<T>` type pattern for all async functions (per AR9)
- [x] Task 2: Implement anonymous authentication logic (AC: #2, #3)
  - [x] 2.1: Implement `signInAnonymously()` wrapper that calls `supabase.auth.signInAnonymously()`
  - [x] 2.2: Handle first-launch scenario: check for existing session, create anonymous user if none
  - [x] 2.3: Verify session is automatically persisted via existing AsyncStorage configuration
  - [x] 2.4: Add session persistence validation (session survives app restart)
- [x] Task 3: Create Redux auth slice for session state (AC: #3, #4)
  - [x] 3.1: Create `src/store/slices/authSlice.ts` with session state
  - [x] 3.2: Define state: `user`, `session`, `isAuthenticated`, `isAnonymous`, `status`, `error`
  - [x] 3.3: Create actions: `setSession`, `clearSession`, `setAuthStatus`, `setAuthError`
  - [x] 3.4: Add selectors: `selectIsAuthenticated`, `selectUser`, `selectIsAnonymous`
  - [x] 3.5: Add authSlice to store configuration (do NOT persist - session managed by Supabase)
- [x] Task 4: Integrate authentication on app launch (AC: #2, #4)
  - [x] 4.1: Update `app/_layout.tsx` to call `initializeAuth()` on app mount
  - [x] 4.2: Use `useEffect` with empty dependency array for initialization
  - [x] 4.3: Show loading state while authentication initializes
  - [x] 4.4: Set up Supabase auth state listener via `supabase.auth.onAuthStateChange()`
  - [x] 4.5: Dispatch Redux actions when auth state changes
- [x] Task 5: Implement error handling and user feedback (AC: #6)
  - [x] 5.1: Create user-friendly error messages for common auth failures
  - [x] 5.2: Handle network errors gracefully (app should still work offline)
  - [x] 5.3: Log technical error details to console, show friendly message to user
  - [x] 5.4: Add retry mechanism for transient auth failures (via auth state listener)
- [x] Task 6: Verify security compliance (AC: #7)
  - [x] 6.1: Confirm Supabase client uses HTTPS by default (verify in utils/supabase.ts)
  - [x] 6.2: Verify no plain-text credentials logged (per NFR17)
  - [x] 6.3: Confirm session tokens not exposed in logs or error messages
- [x] Task 7: Write unit tests (AC: all)
  - [x] 7.1: Create `src/services/supabase/auth.test.ts` with mock Supabase client
  - [x] 7.2: Test first-launch anonymous sign-in flow
  - [x] 7.3: Test existing session reuse flow
  - [x] 7.4: Test error handling for auth failures
  - [x] 7.5: Create `src/store/slices/authSlice.test.ts` for Redux slice
  - [x] 7.6: Run TypeScript check with no errors
  - [x] 7.7: Ensure all tests pass with no regressions (83 tests pass)

## Dev Notes

### Critical Implementation Details

**Existing Supabase Client Configuration:**

The Supabase client is already configured in `utils/supabase.ts` with:
- AsyncStorage for session persistence (`persistSession: true`)
- Auto token refresh (`autoRefreshToken: true`)
- Session detection disabled for React Native (`detectSessionInUrl: false`)

This means sessions are ALREADY persisted. Story 1.4 adds:
1. Auth service wrapper with Result<T> pattern
2. Redux slice for auth state in UI
3. Auto sign-in on first launch
4. Auth state listener for session changes

**Authentication Flow:**

```typescript
// src/services/supabase/auth.ts
import { supabase } from '@/utils/supabase';
import type { Result } from '@/src/types/common';
import type { Session, User } from '@supabase/supabase-js';

export async function initializeAuth(): Promise<Result<Session | null>> {
  try {
    // Check for existing session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session check error:', sessionError);
      return { success: false, error: 'Failed to check authentication status' };
    }

    // If session exists, use it (returning user)
    if (session) {
      return { success: true, data: session };
    }

    // No session - create anonymous user (first launch)
    const { data, error: signInError } = await supabase.auth.signInAnonymously();

    if (signInError) {
      console.error('Anonymous sign-in error:', signInError);
      return { success: false, error: 'Failed to initialize authentication' };
    }

    return { success: true, data: data.session };
  } catch (error) {
    console.error('Auth initialization error:', error);
    return { success: false, error: 'Authentication service unavailable' };
  }
}
```

**Redux Auth Slice:**

```typescript
// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  status: 'idle' | 'loading' | 'authenticated' | 'error';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isAnonymous: false,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<{ user: User; session: Session }>) => {
      state.user = action.payload.user;
      state.session = action.payload.session;
      state.isAuthenticated = true;
      state.isAnonymous = action.payload.user?.is_anonymous ?? false;
      state.status = 'authenticated';
      state.error = null;
    },
    clearSession: (state) => {
      state.user = null;
      state.session = null;
      state.isAuthenticated = false;
      state.isAnonymous = false;
      state.status = 'idle';
      state.error = null;
    },
    setAuthStatus: (state, action: PayloadAction<AuthState['status']>) => {
      state.status = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
    },
  },
});

export const { setSession, clearSession, setAuthStatus, setAuthError } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAnonymous = (state: { auth: AuthState }) => state.auth.isAnonymous;
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
```

**App Layout Integration:**

```typescript
// app/_layout.tsx (addition)
import { useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { initializeAuth } from '@/src/services/supabase/auth';
import { setSession, clearSession, setAuthStatus, setAuthError } from '@/src/store/slices/authSlice';
import { useAppDispatch } from '@/src/store/hooks';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize auth on mount
    dispatch(setAuthStatus('loading'));

    initializeAuth().then((result) => {
      if (result.success && result.data) {
        const session = result.data;
        dispatch(setSession({
          user: session.user,
          session
        }));
      } else if (!result.success) {
        dispatch(setAuthError(result.error));
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          dispatch(setSession({ user: session.user, session }));
        } else {
          dispatch(clearSession());
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return <>{children}</>;
}
```

### Supabase Anonymous Authentication Details

**From Supabase Documentation (December 2025):**
- `signInAnonymously()` creates a persistent anonymous user
- Anonymous users have `is_anonymous: true` in their JWT claims
- Session is automatically persisted via AsyncStorage (already configured)
- Sessions auto-refresh with `autoRefreshToken: true` (already configured)
- Anonymous users can later be linked to OAuth providers if needed

**API Usage:**
```typescript
// Basic anonymous sign-in
const { data, error } = await supabase.auth.signInAnonymously();

// With optional captcha token (recommended for production)
const { data, error } = await supabase.auth.signInAnonymously({
  options: {
    captchaToken: 'captcha_token_here'
  }
});
```

### Previous Story Learnings

**From Story 1.1:**
- Supabase client already configured in `utils/supabase.ts`
- Environment variables use `EXPO_PUBLIC_` prefix pattern
- AsyncStorage already installed and configured for session persistence
- Path aliases `@/` and `~/` work for imports

**From Story 1.2:**
- Redux store is configured at `src/store/store.ts`
- Typed hooks available at `src/store/hooks.ts`
- Redux Persist uses whitelist pattern - do NOT add auth to whitelist (Supabase handles persistence)
- Result<T> type available at `src/types/common.ts`

**From Story 1.3:**
- App successfully displays theme and Redux integration
- 49 tests passing - maintain test count or increase

### Architecture Compliance

Per [docs/architecture.md]:
- **Authentication Strategy:** Device-Based Anonymous Auth (FR58)
- **Result<T> Pattern:** Use for all async service functions (AR9)
- **Security:** HTTPS/TLS for all Supabase communication (NFR16)
- **No Plain-Text Logging:** Never log credentials or tokens (NFR17)
- **Co-located Tests:** Tests next to source files

**Directory Structure:**
```
src/
  services/
    supabase/
      auth.ts           # Auth service wrapper
      auth.test.ts      # Co-located tests
  store/
    slices/
      authSlice.ts      # Auth Redux slice
      authSlice.test.ts # Co-located tests
```

### What This Story Does NOT Include

These are explicitly **deferred to later stories**:
- Converting anonymous users to permanent accounts
- OAuth linking (Google, Apple sign-in)
- Supabase database operations (Story 4.x)
- Row-Level Security policies (infrastructure setup)
- Backend credential sync via Supabase (Story 1.6)

This story focuses ONLY on anonymous authentication for immediate app usage.

### Store Configuration Note

**IMPORTANT:** The auth slice should NOT be added to Redux Persist whitelist:
- Supabase handles session persistence via AsyncStorage internally
- Redux auth slice is for UI state only (shows loading, error states)
- On app restart, `initializeAuth()` reads persisted session from Supabase

```typescript
// src/store/store.ts
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['settings'], // auth NOT included - Supabase handles persistence
};
```

### Error Handling Pattern

```typescript
// User-friendly error messages
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'network_error': 'Unable to connect. Please check your internet connection.',
  'invalid_credentials': 'Authentication failed. Please try again.',
  'rate_limited': 'Too many attempts. Please wait a moment.',
  'default': 'Something went wrong. Please try again.',
};

function getAuthErrorMessage(error: Error): string {
  // Log technical details
  console.error('Auth error:', error);

  // Return user-friendly message
  return AUTH_ERROR_MESSAGES[error.message] ?? AUTH_ERROR_MESSAGES.default;
}
```

### References

- [Source: docs/architecture.md#Authentication--Security] - Anonymous auth strategy
- [Source: docs/architecture.md#API--Communication-Patterns] - Result<T> pattern
- [Source: docs/epics.md#Story-1.4] - Original story requirements
- [Supabase Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Supabase React Native Auth](https://supabase.com/docs/guides/auth/quickstarts/react-native)
- [signInAnonymously API Reference](https://supabase.com/docs/reference/javascript/auth-signinanonymously)

### Latest Technical Information (December 2025)

**Supabase Auth (supabase-js v2.x):**
- `signInAnonymously()` creates anonymous user with persistent session
- `getSession()` returns current session or null
- `onAuthStateChange()` listener for real-time auth state updates
- Anonymous users have `is_anonymous: true` in JWT claims
- Captcha optional but recommended for production

**Anonymous User Behavior:**
- Session persists across app restarts (via AsyncStorage)
- User ID remains consistent for the device
- Can be converted to permanent user later (not in this story)
- Row-Level Security policies can check `is_anonymous` claim

**React Native Specific:**
- Use `detectSessionInUrl: false` (already configured)
- AsyncStorage for session storage (already configured)
- Auth state listener works in background

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- TypeScript check: `npx tsc --noEmit` - passed with no errors
- Test run: `npm test` - 83 tests passed, 0 failed (up from 49 tests)

### Completion Notes List

1. **Auth Service Created**: `src/services/supabase/auth.ts` with Result<T> pattern for all async functions
2. **Authentication Functions**: `initializeAuth()`, `getSession()`, `getUser()`, `signInAnonymously()`, `signOut()`, `onAuthStateChange()`
3. **Redux Auth Slice**: `src/store/slices/authSlice.ts` with user, session, isAuthenticated, isAnonymous, status, error state
4. **App Integration**: `AuthInitializer` component in `app/_layout.tsx` handles:
   - Auto-authentication on first launch
   - Session restoration for returning users
   - Auth state change listener
   - Loading state during initialization
5. **Error Handling**: User-friendly error messages with AUTH_ERROR_MESSAGES mapping
6. **Security Compliance**: No credentials/tokens logged, only error codes and messages
7. **Testing**: 34 new tests added (15 for auth service, 19 for authSlice)

### File List

**Created:**
- `src/services/supabase/auth.ts` - Auth service wrapper with Result<T> pattern
- `src/services/supabase/auth.test.ts` - Auth service tests (18 tests)
- `src/services/supabase/index.ts` - Supabase services barrel export
- `src/services/index.ts` - Services barrel export
- `src/store/slices/authSlice.ts` - Redux auth slice
- `src/store/slices/authSlice.test.ts` - Auth slice tests (19 tests)
- `supabase/` - Supabase CLI configuration directory (config.toml for local development)

**Modified:**
- `app/_layout.tsx` - Added AuthInitializer component with styled LoadingContainer
- `src/store/store.ts` - Added authReducer to rootReducer
- `src/store/slices/index.ts` - Export authSlice and related items

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-14 | Story created with comprehensive dev notes from architecture, epics, and previous story learnings | Claude Opus 4.5 |
| 2025-12-14 | Implementation complete - all tasks done, 83 tests passing | Claude Opus 4.5 |
| 2025-12-14 | Code review fixes: styled LoadingContainer, console.error suppression, onAuthStateChange tests (86 tests) | Claude Opus 4.5 |
