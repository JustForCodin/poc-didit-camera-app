/**
 * Test Data Factories
 *
 * Centralized exports for all test data factories.
 * Use these factories to create consistent, unique test data.
 *
 * @example
 * import { createUser, createSession, createTrueResponse } from '@tests/support/fixtures/factories';
 *
 * const user = createUser({ name: 'Test User' });
 * const session = createCompletedSession(10);
 */

// User factories
export {
  createUser,
  createUsers,
  type User,
  type UserOverrides,
} from './userFactory';

// Session factories
export {
  createSession,
  createSessions,
  createCompletedSession,
  createFrameResult,
  createAnalysisResult,
  type Session,
  type SessionOverrides,
  type FrameResult,
  type FrameResultOverrides,
  type AnalysisResult as SessionAnalysisResult,
} from './sessionFactory';

// Backend factories
export {
  createBackendConfig,
  createBackendCredentials,
  createTrueResponse,
  createFalseResponse,
  createErrorResponse,
  createAutoStopSequence,
  createDiditCameraRawResponse,
  createGeminiRawResponse,
  createClaudeRawResponse,
  type BackendType,
  type BackendConfig,
  type BackendCredentials,
  type AnalysisResult,
} from './backendFactory';
