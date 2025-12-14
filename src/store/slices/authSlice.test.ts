/**
 * Auth Slice Tests
 *
 * Tests for the authentication Redux slice.
 */

import { createTestStore } from '../store';
import authReducer, {
  setSession,
  clearSession,
  setAuthStatus,
  setAuthError,
  selectIsAuthenticated,
  selectUser,
  selectSession,
  selectIsAnonymous,
  selectAuthStatus,
  selectAuthError,
  selectAuthIsLoading,
  AuthState,
} from './authSlice';
import type { User, Session } from '@supabase/supabase-js';

// Helper to create mock user
const createMockUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 'test-user-id',
    email: null,
    is_anonymous: true,
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }) as User;

// Helper to create mock session
const createMockSession = (overrides: Partial<Session> = {}): Session =>
  ({
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() / 1000 + 3600,
    token_type: 'bearer',
    user: createMockUser(),
    ...overrides,
  }) as Session;

describe('authSlice', () => {
  describe('reducer', () => {
    const initialState: AuthState = {
      user: null,
      session: null,
      isAuthenticated: false,
      isAnonymous: false,
      status: 'idle',
      error: null,
    };

    it('should return initial state', () => {
      expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    describe('setSession', () => {
      it('should set session and user when authenticated', () => {
        const mockUser = createMockUser();
        const mockSession = createMockSession({ user: mockUser });

        const state = authReducer(
          initialState,
          setSession({ user: mockUser, session: mockSession })
        );

        expect(state.user).toEqual(mockUser);
        expect(state.session).toEqual(mockSession);
        expect(state.isAuthenticated).toBe(true);
        expect(state.isAnonymous).toBe(true);
        expect(state.status).toBe('authenticated');
        expect(state.error).toBeNull();
      });

      it('should set isAnonymous to false for non-anonymous users', () => {
        const mockUser = createMockUser({ is_anonymous: false });
        const mockSession = createMockSession({ user: mockUser });

        const state = authReducer(
          initialState,
          setSession({ user: mockUser, session: mockSession })
        );

        expect(state.isAnonymous).toBe(false);
      });

      it('should clear previous error when session is set', () => {
        const stateWithError: AuthState = {
          ...initialState,
          status: 'error',
          error: 'Previous error',
        };
        const mockUser = createMockUser();
        const mockSession = createMockSession({ user: mockUser });

        const state = authReducer(
          stateWithError,
          setSession({ user: mockUser, session: mockSession })
        );

        expect(state.error).toBeNull();
        expect(state.status).toBe('authenticated');
      });
    });

    describe('clearSession', () => {
      it('should clear session and reset state', () => {
        const mockUser = createMockUser();
        const mockSession = createMockSession({ user: mockUser });
        const authenticatedState: AuthState = {
          user: mockUser,
          session: mockSession,
          isAuthenticated: true,
          isAnonymous: true,
          status: 'authenticated',
          error: null,
        };

        const state = authReducer(authenticatedState, clearSession());

        expect(state.user).toBeNull();
        expect(state.session).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.isAnonymous).toBe(false);
        expect(state.status).toBe('idle');
        expect(state.error).toBeNull();
      });
    });

    describe('setAuthStatus', () => {
      it('should set status to loading', () => {
        const state = authReducer(initialState, setAuthStatus('loading'));

        expect(state.status).toBe('loading');
        expect(state.error).toBeNull();
      });

      it('should set status to authenticated', () => {
        const state = authReducer(initialState, setAuthStatus('authenticated'));

        expect(state.status).toBe('authenticated');
      });

      it('should clear error when status changes to non-error state', () => {
        const stateWithError: AuthState = {
          ...initialState,
          status: 'error',
          error: 'Some error',
        };

        const state = authReducer(stateWithError, setAuthStatus('loading'));

        expect(state.error).toBeNull();
      });
    });

    describe('setAuthError', () => {
      it('should set error and status to error', () => {
        const errorMessage = 'Authentication failed';

        const state = authReducer(initialState, setAuthError(errorMessage));

        expect(state.status).toBe('error');
        expect(state.error).toBe(errorMessage);
      });
    });
  });

  describe('selectors', () => {
    it('should select isAuthenticated', () => {
      const store = createTestStore({
        auth: {
          user: null,
          session: null,
          isAuthenticated: true,
          isAnonymous: false,
          status: 'authenticated',
          error: null,
        },
      });

      expect(selectIsAuthenticated(store.getState())).toBe(true);
    });

    it('should select user', () => {
      const mockUser = createMockUser();
      const store = createTestStore({
        auth: {
          user: mockUser,
          session: null,
          isAuthenticated: true,
          isAnonymous: true,
          status: 'authenticated',
          error: null,
        },
      });

      expect(selectUser(store.getState())).toEqual(mockUser);
    });

    it('should select session', () => {
      const mockSession = createMockSession();
      const store = createTestStore({
        auth: {
          user: mockSession.user,
          session: mockSession,
          isAuthenticated: true,
          isAnonymous: true,
          status: 'authenticated',
          error: null,
        },
      });

      expect(selectSession(store.getState())).toEqual(mockSession);
    });

    it('should select isAnonymous', () => {
      const store = createTestStore({
        auth: {
          user: null,
          session: null,
          isAuthenticated: true,
          isAnonymous: true,
          status: 'authenticated',
          error: null,
        },
      });

      expect(selectIsAnonymous(store.getState())).toBe(true);
    });

    it('should select authStatus', () => {
      const store = createTestStore({
        auth: {
          user: null,
          session: null,
          isAuthenticated: false,
          isAnonymous: false,
          status: 'loading',
          error: null,
        },
      });

      expect(selectAuthStatus(store.getState())).toBe('loading');
    });

    it('should select authError', () => {
      const errorMessage = 'Test error';
      const store = createTestStore({
        auth: {
          user: null,
          session: null,
          isAuthenticated: false,
          isAnonymous: false,
          status: 'error',
          error: errorMessage,
        },
      });

      expect(selectAuthError(store.getState())).toBe(errorMessage);
    });

    it('should select authIsLoading', () => {
      const store = createTestStore({
        auth: {
          user: null,
          session: null,
          isAuthenticated: false,
          isAnonymous: false,
          status: 'loading',
          error: null,
        },
      });

      expect(selectAuthIsLoading(store.getState())).toBe(true);
    });

    it('should return false for authIsLoading when not loading', () => {
      const store = createTestStore({
        auth: {
          user: null,
          session: null,
          isAuthenticated: false,
          isAnonymous: false,
          status: 'idle',
          error: null,
        },
      });

      expect(selectAuthIsLoading(store.getState())).toBe(false);
    });
  });

  describe('integration with store', () => {
    it('should handle full authentication flow', () => {
      const store = createTestStore();

      // Initial state
      expect(selectIsAuthenticated(store.getState())).toBe(false);
      expect(selectAuthStatus(store.getState())).toBe('idle');

      // Start loading
      store.dispatch(setAuthStatus('loading'));
      expect(selectAuthStatus(store.getState())).toBe('loading');
      expect(selectAuthIsLoading(store.getState())).toBe(true);

      // Set session
      const mockUser = createMockUser();
      const mockSession = createMockSession({ user: mockUser });
      store.dispatch(setSession({ user: mockUser, session: mockSession }));

      expect(selectIsAuthenticated(store.getState())).toBe(true);
      expect(selectIsAnonymous(store.getState())).toBe(true);
      expect(selectAuthStatus(store.getState())).toBe('authenticated');
      expect(selectUser(store.getState())).toEqual(mockUser);
      expect(selectSession(store.getState())).toEqual(mockSession);

      // Clear session (sign out)
      store.dispatch(clearSession());
      expect(selectIsAuthenticated(store.getState())).toBe(false);
      expect(selectAuthStatus(store.getState())).toBe('idle');
    });

    it('should handle authentication error flow', () => {
      const store = createTestStore();

      // Start loading
      store.dispatch(setAuthStatus('loading'));
      expect(selectAuthIsLoading(store.getState())).toBe(true);

      // Set error
      const errorMessage = 'Network error';
      store.dispatch(setAuthError(errorMessage));

      expect(selectAuthStatus(store.getState())).toBe('error');
      expect(selectAuthError(store.getState())).toBe(errorMessage);
      expect(selectIsAuthenticated(store.getState())).toBe(false);
    });
  });
});
