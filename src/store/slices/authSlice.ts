/**
 * Auth Slice
 *
 * Redux slice for managing authentication state in the UI.
 *
 * IMPORTANT: This slice is NOT persisted via Redux Persist.
 * Supabase handles session persistence via AsyncStorage internally.
 * On app restart, initializeAuth() reads the persisted session from Supabase.
 *
 * This slice is for UI state only (loading, error states, current session info).
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User, Session } from '@supabase/supabase-js';
import type { RootState } from '../store';

/**
 * Auth status states
 */
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

/**
 * Auth state interface
 */
export interface AuthState {
  /** Current authenticated user (null if not authenticated) */
  user: User | null;
  /** Current session (null if not authenticated) */
  session: Session | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether user is anonymous (vs permanent account) */
  isAnonymous: boolean;
  /** Current auth status for UI feedback */
  status: AuthStatus;
  /** Error message if auth failed */
  error: string | null;
}

/**
 * Initial auth state
 */
const initialState: AuthState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isAnonymous: false,
  status: 'idle',
  error: null,
};

/**
 * Payload for setSession action
 */
interface SetSessionPayload {
  user: User;
  session: Session;
}

/**
 * Auth slice
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Set the current session and user.
     * Called when auth succeeds or session is restored.
     */
    setSession: (state, action: PayloadAction<SetSessionPayload>) => {
      state.user = action.payload.user;
      state.session = action.payload.session;
      state.isAuthenticated = true;
      // Check if user is anonymous - Supabase stores this in user metadata
      state.isAnonymous = action.payload.user?.is_anonymous ?? false;
      state.status = 'authenticated';
      state.error = null;
    },

    /**
     * Clear the current session.
     * Called when user signs out or session expires.
     */
    clearSession: (state) => {
      state.user = null;
      state.session = null;
      state.isAuthenticated = false;
      state.isAnonymous = false;
      state.status = 'idle';
      state.error = null;
    },

    /**
     * Set the auth status.
     * Used for loading states during auth operations.
     */
    setAuthStatus: (state, action: PayloadAction<AuthStatus>) => {
      state.status = action.payload;
      // Clear error when status changes to non-error state
      if (action.payload !== 'error') {
        state.error = null;
      }
    },

    /**
     * Set auth error.
     * Called when auth operation fails.
     */
    setAuthError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
    },
  },
});

// Export actions
export const { setSession, clearSession, setAuthStatus, setAuthError } =
  authSlice.actions;

// Export reducer
export default authSlice.reducer;

// Selectors
/**
 * Select whether user is authenticated
 */
export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.isAuthenticated;

/**
 * Select current user
 */
export const selectUser = (state: RootState): User | null => state.auth.user;

/**
 * Select current session
 */
export const selectSession = (state: RootState): Session | null =>
  state.auth.session;

/**
 * Select whether user is anonymous
 */
export const selectIsAnonymous = (state: RootState): boolean =>
  state.auth.isAnonymous;

/**
 * Select current auth status
 */
export const selectAuthStatus = (state: RootState): AuthStatus =>
  state.auth.status;

/**
 * Select auth error message
 */
export const selectAuthError = (state: RootState): string | null =>
  state.auth.error;

/**
 * Select whether auth is loading
 */
export const selectAuthIsLoading = (state: RootState): boolean =>
  state.auth.status === 'loading';
