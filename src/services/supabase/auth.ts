/**
 * Supabase Authentication Service
 *
 * Provides authentication functions using the Result<T> pattern.
 * Handles anonymous authentication for device-based access.
 *
 * Per architecture (FR58): Device-Based Anonymous Auth
 * Per architecture (AR9): Result<T> pattern for all async functions
 */

import { supabase } from '@/utils/supabase';
import type { Result } from '@/src/types/common';
import type { Session, User, AuthError } from '@supabase/supabase-js';

/**
 * User-friendly error messages for common auth failures.
 * Technical details are logged to console separately.
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  network_error: 'Unable to connect. Please check your internet connection.',
  invalid_credentials: 'Authentication failed. Please try again.',
  rate_limited: 'Too many attempts. Please wait a moment.',
  session_not_found: 'Session not found. Please restart the app.',
  anonymous_provider_disabled:
    'Anonymous sign-in is not enabled. Please contact support.',
  default: 'Something went wrong. Please try again.',
};

/**
 * Get a user-friendly error message from an AuthError.
 * Logs technical details to console (per NFR17: no plain-text credentials in logs).
 */
function getAuthErrorMessage(error: AuthError | Error): string {
  // Log technical details without exposing sensitive data
  console.error('Auth error code:', (error as AuthError).code ?? 'unknown');
  console.error('Auth error message:', error.message);

  // Map error codes to user-friendly messages
  const errorCode = (error as AuthError).code ?? error.message;
  return AUTH_ERROR_MESSAGES[errorCode] ?? AUTH_ERROR_MESSAGES.default;
}

/**
 * Initialize authentication on app launch.
 * Checks for existing session first, then creates anonymous user if none exists.
 *
 * @returns Result containing the session (or null if offline/no session yet)
 */
export async function initializeAuth(): Promise<Result<Session | null>> {
  try {
    // Check for existing session first (handles returning users)
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      return {
        success: false,
        error: getAuthErrorMessage(sessionError),
      };
    }

    // If session exists, use it (returning user)
    if (sessionData.session) {
      return { success: true, data: sessionData.session };
    }

    // No session - create anonymous user (first launch)
    const { data: signInData, error: signInError } =
      await supabase.auth.signInAnonymously();

    if (signInError) {
      return {
        success: false,
        error: getAuthErrorMessage(signInError),
      };
    }

    return { success: true, data: signInData.session };
  } catch (error) {
    // Handle unexpected errors (network issues, etc.)
    console.error('Auth initialization error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? getAuthErrorMessage(error)
          : AUTH_ERROR_MESSAGES.default,
    };
  }
}

/**
 * Get the current session.
 * Returns null if no session exists.
 *
 * @returns Result containing the current session or null
 */
export async function getSession(): Promise<Result<Session | null>> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error),
      };
    }

    return { success: true, data: data.session };
  } catch (error) {
    console.error('Get session error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? getAuthErrorMessage(error)
          : AUTH_ERROR_MESSAGES.default,
    };
  }
}

/**
 * Get the current user.
 * Returns null if no user is authenticated.
 *
 * @returns Result containing the current user or null
 */
export async function getUser(): Promise<Result<User | null>> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error),
      };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error('Get user error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? getAuthErrorMessage(error)
          : AUTH_ERROR_MESSAGES.default,
    };
  }
}

/**
 * Sign in anonymously.
 * Creates a new anonymous user if not already authenticated.
 *
 * @returns Result containing the session
 */
export async function signInAnonymously(): Promise<Result<Session | null>> {
  try {
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error),
      };
    }

    return { success: true, data: data.session };
  } catch (error) {
    console.error('Anonymous sign-in error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? getAuthErrorMessage(error)
          : AUTH_ERROR_MESSAGES.default,
    };
  }
}

/**
 * Sign out the current user.
 * Clears the session from local storage.
 *
 * @returns Result indicating success or failure
 */
export async function signOut(): Promise<Result<void>> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error),
      };
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? getAuthErrorMessage(error)
          : AUTH_ERROR_MESSAGES.default,
    };
  }
}

/**
 * Subscribe to auth state changes.
 * Returns unsubscribe function.
 *
 * @param callback Function called when auth state changes
 * @returns Unsubscribe function
 */
export function onAuthStateChange(
  callback: (session: Session | null) => void
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return () => {
    subscription.unsubscribe();
  };
}

// Re-export types for convenience
export type { Session, User } from '@supabase/supabase-js';
