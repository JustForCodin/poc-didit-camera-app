/**
 * Auth Service Tests
 *
 * Tests for the Supabase authentication service.
 * Uses mocked Supabase client to test auth flows.
 */

import {
  initializeAuth,
  getSession,
  getUser,
  signInAnonymously,
  signOut,
  onAuthStateChange,
} from './auth';
import { supabase } from '@/utils/supabase';
import type { Session, User, AuthError } from '@supabase/supabase-js';

// Mock console.error BEFORE any imports to suppress error logs in tests
const mockConsoleError = jest
  .spyOn(console, 'error')
  .mockImplementation(() => {});

// Mock the Supabase client
jest.mock('@/utils/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      signInAnonymously: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

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

// Helper to create mock auth error
const createMockAuthError = (
  message: string,
  code?: string
): AuthError =>
  ({
    message,
    code,
    name: 'AuthError',
    status: 400,
  }) as AuthError;

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('initializeAuth', () => {
    it('should return existing session when user is already authenticated', async () => {
      const mockSession = createMockSession();
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await initializeAuth();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockSession);
      }
      expect(supabase.auth.signInAnonymously).not.toHaveBeenCalled();
    });

    it('should create anonymous user when no session exists (first launch)', async () => {
      const mockSession = createMockSession();
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      (supabase.auth.signInAnonymously as jest.Mock).mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      });

      const result = await initializeAuth();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockSession);
      }
      expect(supabase.auth.signInAnonymously).toHaveBeenCalled();
    });

    it('should return error when getSession fails', async () => {
      const mockError = createMockAuthError('Session check failed', 'session_not_found');
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: mockError,
      });

      const result = await initializeAuth();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('should return error when anonymous sign-in fails', async () => {
      const mockError = createMockAuthError(
        'Anonymous sign-in disabled',
        'anonymous_provider_disabled'
      );
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      (supabase.auth.signInAnonymously as jest.Mock).mockResolvedValue({
        data: { session: null, user: null },
        error: mockError,
      });

      const result = await initializeAuth();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('should handle unexpected errors gracefully', async () => {
      (supabase.auth.getSession as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const result = await initializeAuth();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('getSession', () => {
    it('should return current session when authenticated', async () => {
      const mockSession = createMockSession();
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await getSession();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockSession);
      }
    });

    it('should return null when no session exists', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await getSession();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it('should return error when getSession fails', async () => {
      const mockError = createMockAuthError('Failed to get session');
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: mockError,
      });

      const result = await getSession();

      expect(result.success).toBe(false);
    });
  });

  describe('getUser', () => {
    it('should return current user when authenticated', async () => {
      const mockUser = createMockUser();
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await getUser();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockUser);
      }
    });

    it('should return null when no user exists', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getUser();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it('should return error when getUser fails', async () => {
      const mockError = createMockAuthError('Failed to get user');
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      const result = await getUser();

      expect(result.success).toBe(false);
    });
  });

  describe('signInAnonymously', () => {
    it('should successfully sign in anonymously', async () => {
      const mockSession = createMockSession();
      (supabase.auth.signInAnonymously as jest.Mock).mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      });

      const result = await signInAnonymously();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockSession);
      }
    });

    it('should return error when sign-in fails', async () => {
      const mockError = createMockAuthError('Sign-in failed', 'rate_limited');
      (supabase.auth.signInAnonymously as jest.Mock).mockResolvedValue({
        data: { session: null, user: null },
        error: mockError,
      });

      const result = await signInAnonymously();

      expect(result.success).toBe(false);
    });
  });

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await signOut();

      expect(result.success).toBe(true);
    });

    it('should return error when sign-out fails', async () => {
      const mockError = createMockAuthError('Sign-out failed');
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: mockError,
      });

      const result = await signOut();

      expect(result.success).toBe(false);
    });
  });

  describe('onAuthStateChange', () => {
    it('should subscribe to auth state changes and return unsubscribe function', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      const unsubscribe = onAuthStateChange(mockCallback);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');

      // Call unsubscribe
      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should call callback with session when auth state changes', () => {
      const mockCallback = jest.fn();
      const mockSession = createMockSession();
      let capturedCallback: (event: string, session: Session | null) => void;

      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
        (callback) => {
          capturedCallback = callback;
          return {
            data: { subscription: { unsubscribe: jest.fn() } },
          };
        }
      );

      onAuthStateChange(mockCallback);

      // Simulate auth state change
      capturedCallback!('SIGNED_IN', mockSession);

      expect(mockCallback).toHaveBeenCalledWith(mockSession);
    });

    it('should call callback with null when session is cleared', () => {
      const mockCallback = jest.fn();
      let capturedCallback: (event: string, session: Session | null) => void;

      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
        (callback) => {
          capturedCallback = callback;
          return {
            data: { subscription: { unsubscribe: jest.fn() } },
          };
        }
      );

      onAuthStateChange(mockCallback);

      // Simulate sign out
      capturedCallback!('SIGNED_OUT', null);

      expect(mockCallback).toHaveBeenCalledWith(null);
    });
  });
});
