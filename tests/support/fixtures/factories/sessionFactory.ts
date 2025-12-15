/**
 * Session Factory
 *
 * Creates test session data matching the Session type from architecture.
 * Includes frame results, backend responses, and timing data.
 */

import { faker } from '@faker-js/faker';

export type BackendType = 'diditCamera' | 'gemini' | 'claude' | 'mock';

export interface AnalysisResult {
  result: boolean;
  confidence: number;
  rawResponse: unknown;
  latencyMs: number;
}

export interface FrameResult {
  id: string;
  sessionId: string;
  frameNumber: number;
  timestamp: string;
  backend: BackendType;
  analysisResult: AnalysisResult;
  prompt: string;
}

export interface Session {
  id: string;
  deviceName: string;
  prompt: string;
  selectedBackends: BackendType[];
  frameInterval: number;
  status: 'idle' | 'recording' | 'processing' | 'completed' | 'error';
  startedAt: string | null;
  endedAt: string | null;
  videoPath: string | null;
  videoUrl: string | null;
  frameResults: FrameResult[];
  autoStopOnTrue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionOverrides {
  id?: string;
  deviceName?: string;
  prompt?: string;
  selectedBackends?: BackendType[];
  frameInterval?: number;
  status?: Session['status'];
  startedAt?: string | null;
  endedAt?: string | null;
  videoPath?: string | null;
  videoUrl?: string | null;
  frameResults?: FrameResult[];
  autoStopOnTrue?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FrameResultOverrides {
  id?: string;
  sessionId?: string;
  frameNumber?: number;
  timestamp?: string;
  backend?: BackendType;
  analysisResult?: Partial<AnalysisResult>;
  prompt?: string;
}

/**
 * Creates an analysis result with realistic values
 */
export function createAnalysisResult(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    result: overrides.result ?? faker.datatype.boolean(),
    confidence: overrides.confidence ?? faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
    rawResponse: overrides.rawResponse ?? { raw: faker.lorem.sentence() },
    latencyMs: overrides.latencyMs ?? faker.number.int({ min: 100, max: 2500 }),
  };
}

/**
 * Creates a frame result
 */
export function createFrameResult(overrides: FrameResultOverrides = {}): FrameResult {
  const sessionId = overrides.sessionId ?? faker.string.uuid();
  return {
    id: overrides.id ?? faker.string.uuid(),
    sessionId,
    frameNumber: overrides.frameNumber ?? faker.number.int({ min: 1, max: 100 }),
    timestamp: overrides.timestamp ?? new Date().toISOString(),
    backend: overrides.backend ?? faker.helpers.arrayElement(['diditCamera', 'gemini', 'claude', 'mock'] as BackendType[]),
    analysisResult: createAnalysisResult(overrides.analysisResult),
    prompt: overrides.prompt ?? 'Is there a person in this image?',
  };
}

/**
 * Creates a session with default values and optional overrides
 */
export function createSession(overrides: SessionOverrides = {}): Session {
  const id = overrides.id ?? faker.string.uuid();
  const now = new Date().toISOString();

  return {
    id,
    deviceName: overrides.deviceName ?? `${faker.word.adjective()}-${faker.word.noun()}`,
    prompt: overrides.prompt ?? 'Is there a person in this image?',
    selectedBackends: overrides.selectedBackends ?? ['mock'],
    frameInterval: overrides.frameInterval ?? 1000,
    status: overrides.status ?? 'idle',
    startedAt: overrides.startedAt ?? null,
    endedAt: overrides.endedAt ?? null,
    videoPath: overrides.videoPath ?? null,
    videoUrl: overrides.videoUrl ?? null,
    frameResults: overrides.frameResults ?? [],
    autoStopOnTrue: overrides.autoStopOnTrue ?? true,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
}

/**
 * Creates a completed session with frame results
 */
export function createCompletedSession(
  frameCount: number = 10,
  overrides: SessionOverrides = {}
): Session {
  const id = overrides.id ?? faker.string.uuid();
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + frameCount * 1000);

  const frameResults: FrameResult[] = Array.from({ length: frameCount }, (_, i) => {
    const frameTime = new Date(startTime.getTime() + i * 1000);
    return createFrameResult({
      sessionId: id,
      frameNumber: i + 1,
      timestamp: frameTime.toISOString(),
    });
  });

  return createSession({
    id,
    status: 'completed',
    startedAt: startTime.toISOString(),
    endedAt: endTime.toISOString(),
    videoPath: `/mock/documents/sessions/${id}.mp4`,
    videoUrl: `https://mock-storage.supabase.co/sessions/${id}.mp4`,
    frameResults,
    ...overrides,
  });
}

/**
 * Creates multiple sessions
 */
export function createSessions(count: number, overrides: SessionOverrides = {}): Session[] {
  return Array.from({ length: count }, () => createSession(overrides));
}
