## Overview

An internal tester app for evaluating multiple vision AI backends (DiditCamera, Gemini Vision, Anthropic Claude) before integrating them into Sprout. The app enables side-by-side comparison of backends using identical camera inputs.

### Goals

- Quickly determine what each vision backend can reliably do
- Benchmark backends against each other on identical inputs
- Evaluate: boolean accuracy, text descriptions, confidence calibration, latency, stability
- Provide a 24/7 test path independent of any single backend’s availability
- Store test history for analysis and comparison across team members

### Non-Goals (POC Scope)

- Production-grade UX polish
- Child-facing features
- Real parental controls integration
- Anti-cheating enforcement (we observe behavior, not enforce)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Native App                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Camera  │  │  History │  │ Settings │  │ Session Details  │ │
│  │   View   │  │   List   │  │   View   │  │      View        │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
│       │             │             │                  │           │
│       └─────────────┴─────────────┴──────────────────┘           │
│                              │                                   │
│                    ┌─────────┴─────────┐                         │
│                    │   Vision Service  │                         │
│                    │   (Abstraction)   │                         │
│                    └─────────┬─────────┘                         │
│         ┌──────────────┬─────┴─────┬──────────────┐              │
│         ▼              ▼           ▼              ▼              │
│    ┌─────────┐   ┌─────────┐  ┌─────────┐  ┌───────────┐        │
│    │ DidIt   │   │ Gemini  │  │ Claude  │  │ Mock/Test │        │
│    │ Adapter │   │ Adapter │  │ Adapter │  │  Adapter  │        │
│    └────┬────┘   └────┬────┘  └────┬────┘  └─────┬─────┘        │
└─────────┼─────────────┼───────────┼──────────────┼──────────────┘
          │             │           │              │
          ▼             ▼           ▼              ▼
    ┌──────────┐  ┌──────────┐ ┌──────────┐  ┌──────────┐
    │ DiditAPI │  │ Gemini   │ │ Claude   │  │  Local   │
    │          │  │ Vision   │ │ Vision   │  │  Mock    │
    └──────────┘  └──────────┘ └──────────┘  └──────────┘

                         │
                         ▼
              ┌─────────────────────┐
              │      Supabase       │
              │  ┌───────────────┐  │
              │  │   Sessions    │  │
              │  │   Frames      │  │
              │  │   Scenarios   │  │
              │  │   Videos      │  │
              │  └───────────────┘  │
              └─────────────────────┘
```

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run a Vision Test Session (Priority: P1)

As a tester, I want to capture camera frames and send them to a vision AI backend with a question/prompt, so that I can evaluate whether the backend correctly identifies visual conditions (e.g., “Is the room tidy?”).

**Why this priority**: This is the core functionality of the app. Without the ability to run test sessions, no other features have value.

**Independent Test**: Can be fully tested by opening the camera, entering a prompt like “Is the room tidy?”, pressing Start, and observing live results overlaid on the camera view. Delivers immediate value for evaluating vision AI accuracy.

**Acceptance Scenarios**:

1. **Given** the app is open and a backend is configured, **When** I enter a prompt and tap Start, **Then** the app begins capturing frames at the configured interval and displays live AI results
2. **Given** a recording session is active, **When** the AI returns a “true” result, **Then** the app continues recording for 1 additional second (to capture the success moment) and then auto-stops with a completion celebration
3. **Given** a recording session is active, **When** I tap Stop manually, **Then** the session ends and I’m shown a review screen
4. **Given** a session has ended, **When** I’m on the review screen, **Then** I can save, discard, or retry the session

---

### User Story 2 - Select and Switch Between Vision Backends (Priority: P1)

As a tester, I want to easily switch between different vision AI backends (DiditCamera, Gemini, Claude), so that I can compare their performance on the same visual scenarios.

**Why this priority**: Comparing backends is a primary goal of the POC. Users need this to fulfill the app’s core purpose of benchmarking.

**Independent Test**: Can be tested by configuring at least two backends in Settings, then switching between them on the Camera screen and running sessions with each.

**Acceptance Scenarios**:

1. **Given** multiple backends are configured, **When** I’m on the Camera screen, **Then** I can select which backend to use from a picker
2. **Given** I select a different backend, **When** I run a new session, **Then** frames are sent to the newly selected backend
3. **Given** a backend is not configured, **When** I try to select it, **Then** I’m prompted to configure it first

---

### User Story 3 - Configure Backend Credentials (Priority: P1)

As a tester, I want to configure authentication credentials for each vision backend, so that the app can communicate with the AI services.

**Why this priority**: Without credentials, no backends work. This is a prerequisite for all testing functionality.

**Independent Test**: Can be tested by navigating to Settings, adding API keys or login credentials for a backend, and verifying the backend shows as “Active”.

**Acceptance Scenarios**:

1. **Given** I’m on the Settings screen, **When** I tap “Configure” for DiditCamera, **Then** I see a login form for email/password
2. **Given** I’m on the Settings screen, **When** I tap “Add API Key” for Gemini or Claude, **Then** I can paste an API key
3. **Given** I’ve entered valid credentials, **When** I save them, **Then** the backend status shows “Active” and credentials are shared across all team devices
4. **Given** credentials are invalid, **When** I try to save, **Then** I see an appropriate error message

---

### User Story 4 - Review Session History (Priority: P2)

As a tester, I want to browse past test sessions with filtering options, so that I can compare results across different backends, scenarios, and time periods.

**Why this priority**: Historical comparison is essential for meaningful benchmarking but can be done after core recording functionality works.

**Independent Test**: Can be tested by completing a few sessions, navigating to History, and verifying sessions appear with filtering working.

**Acceptance Scenarios**:

1. **Given** I’ve completed multiple sessions, **When** I open the History tab, **Then** I see a list of sessions with summary info (backend, result, timestamp, duration)
2. **Given** I’m viewing the history list, **When** I tap a filter option (backend, scenario, accuracy), **Then** the list updates to show only matching sessions
3. **Given** I’m viewing a session card, **When** I see the accuracy marking, **Then** it displays one of: Correct, Incorrect, Ambiguous, or Unmarked

---

### User Story 5 - View Session Details with Video Playback (Priority: P2)

As a tester, I want to review a session’s recorded video with AI results overlaid, so that I can understand exactly when and how the AI responded during the session.

**Why this priority**: Detailed review enables understanding of AI behavior patterns, but basic session listing provides value first.

**Independent Test**: Can be tested by tapping any session in history and verifying video plays with result overlay and frame timeline.

**Acceptance Scenarios**:

1. **Given** I tap a session in history, **When** the detail view loads, **Then** I see a video player with the recorded session
2. **Given** I’m watching the video, **When** it plays, **Then** I see the AI result (true/false/uncertain) overlaid at each frame’s timestamp
3. **Given** I see the frame timeline, **When** I tap a specific frame marker, **Then** the video jumps to that timestamp
4. **Given** I’m on the session detail, **Then** I see session metadata: prompt, backend, duration, frame count, average latency

---

### User Story 6 - Rate Session Accuracy (Priority: P2)

As a tester, I want to mark whether the AI’s result was correct, incorrect, or ambiguous, so that we can track accuracy metrics across backends.

**Why this priority**: Accuracy marking enables data-driven comparisons but requires session detail view to be functional first.

**Independent Test**: Can be tested by opening a session detail and tapping one of the accuracy rating buttons.

**Acceptance Scenarios**:

1. **Given** I’m viewing a session detail, **When** I see the rating section, **Then** I have options for Correct, Incorrect, and Ambiguous
2. **Given** I tap an accuracy rating, **When** the rating is saved, **Then** it persists and displays on both detail and list views
3. **Given** I’ve rated a session, **When** I change my mind, **Then** I can select a different rating

---

### User Story 7 - Use Predefined Test Scenarios (Priority: P3)

As a tester, I want to select from predefined test scenarios with standard prompts, so that I can run consistent, repeatable tests across backends.

**Why this priority**: Scenarios improve testing consistency but custom prompts provide basic functionality first.

**Independent Test**: Can be tested by selecting a scenario on the Camera screen and verifying the prompt auto-fills.

**Acceptance Scenarios**:

1. **Given** I’m on the Camera screen, **When** I tap “Select Scenario”, **Then** I see a list of predefined scenarios
2. **Given** I select a scenario, **When** the selection completes, **Then** the prompt field auto-fills with the scenario’s question
3. **Given** scenarios exist in the database, **When** new scenarios are added via the backend, **Then** they appear in the app without an update

---

### User Story 8 - Add Tester Notes (Priority: P3)

As a tester, I want to add notes to a session, so that I can record observations that aren’t captured by the AI results.

**Why this priority**: Notes provide context but core functionality works without them.

**Independent Test**: Can be tested by opening a session detail, typing in the notes field, and verifying it saves.

**Acceptance Scenarios**:

1. **Given** I’m viewing a session detail, **When** I see the notes section, **Then** I can type free-form text
2. **Given** I’ve entered notes, **When** I navigate away and return, **Then** my notes persist

---

### User Story 9 - Retry Session with Same or Different Backend (Priority: P3)

As a tester, I want to retry a session with the same prompt using a different backend, so that I can directly compare how different AI systems respond to the same question.

**Why this priority**: Enables direct A/B comparison but requires history and detail views first.

**Independent Test**: Can be tested by viewing a session detail, tapping Retry, selecting a different backend, and running a new session.

**Acceptance Scenarios**:

1. **Given** I’m viewing a session detail, **When** I tap “Retry”, **Then** I’m taken to the Camera screen with the same prompt pre-filled
2. **Given** I’m retrying a session, **When** I select a different backend, **Then** I can run a new session with that backend
3. **Given** I retry a session, **When** the new session completes, **Then** it’s saved as a separate session in history

---

### Edge Cases

| Scenario | Handling |
| --- | --- |
| Network connectivity lost during session | Frames queue locally, session continues recording, uploads resume when online |
| Backend API times out | Retry once, then mark frame as failed, continue session |
| Device storage full | Warn user, prevent starting new sessions |
| Backend authentication expires mid-session | Pause session, prompt re-login |
| Multiple devices configure same backend credentials | Credentials are shared - last writer wins |
| Video compression fails | Fall back to lower quality, warn user |
| Backend returns malformed response | Log raw response, mark frame as error, continue |
| Backend API rate limit hit | End session with error, prompt user to switch backend |
| Video recording fails completely | Discard session entirely (no partial sessions without video) |
| Camera permission revoked | Prompt user to go to Settings to restore permission |

---

## Requirements *(mandatory)*

### Functional Requirements

**Camera & Recording**

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-001 | System MUST capture camera frames at a configurable interval (default 1000ms, range 500-5000ms) | P1 |
| FR-002 | System MUST record video during capture sessions for later playback | P1 |
| FR-003 | System MUST display live AI results overlaid on the camera preview during recording | P1 |
| FR-004 | System MUST auto-stop recording 1 second after AI returns first “true” result (delay captures success moment) | P1 |
| FR-005 | Users MUST be able to manually stop recording at any time | P1 |
| FR-006 | System MUST compress videos to 720p H.264 before upload | P1 |

**Vision Backends**

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-007 | System MUST support DiditCamera backend with email/password authentication | P1 |
| FR-008 | System MUST support Gemini Vision backend with API key authentication | P1 |
| FR-009 | System MUST support Anthropic Claude backend with API key authentication | P1 |
| FR-010 | System MUST support a Mock backend for development/testing | P2 |
| FR-011 | System MUST normalize responses from all backends to a common format | P1 |
| FR-012 | Users MUST be able to switch between backends before starting a session | P1 |

**Data & Storage**

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-013 | System MUST store session results including frames, final result, video URL, and metadata | P1 |
| FR-014 | System MUST share all session data across team devices (no per-user isolation) | P1 |
| FR-015 | System MUST share backend credentials across team devices | P1 |
| FR-016 | System MUST use Supabase Anonymous Auth (no login required) | P1 |
| FR-017 | System MUST NOT store individual frame images (only analysis results) | P1 |

**History & Review**

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-018 | Users MUST be able to browse past sessions in a list view | P2 |
| FR-019 | Users MUST be able to filter sessions by backend, scenario, and accuracy marking | P2 |
| FR-020 | Users MUST be able to play back recorded session videos with result overlays | P2 |
| FR-021 | Users MUST be able to mark session accuracy as correct, incorrect, or ambiguous | P2 |
| FR-022 | Users MUST be able to add free-form notes to sessions | P3 |
| FR-023 | Users MUST be able to delete sessions from history | P3 |

**Scenarios**

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-024 | System MUST provide 7 predefined test scenarios | P3 |
| FR-025 | Users MUST be able to enter custom prompts instead of using scenarios | P1 |
| FR-026 | System MUST seed default scenarios on first launch if none exist | P3 |
| FR-027 | System MUST load scenarios from Supabase (allowing remote additions) | P3 |

**Settings**

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-028 | Users MUST be able to configure the default frame capture interval | P2 |
| FR-029 | Users MUST be able to set a device name for identifying who ran each test | P2 |
| FR-030 | Users MUST be able to clear local cache | P3 |

### Non-Functional Requirements

**Performance**

| ID | Requirement | Target |
| --- | --- | --- |
| NFR-001 | Frame capture latency | < 50ms |
| NFR-002 | Frame upload + response round-trip | < 3000ms (including backend processing) |
| NFR-003 | Backend response time logging | Every frame must log latency |
| NFR-004 | Video playback start time | < 500ms after tap |
| NFR-005 | History list initial load | < 200ms for first 20 items |
| NFR-006 | Video compression time | < 5 seconds for 60-second video |

**Reliability**

| ID | Requirement |
| --- | --- |
| NFR-007 | System MUST continue recording if a single frame upload fails |
| NFR-008 | System MUST retry failed frame uploads once before marking as failed |
| NFR-009 | System MUST gracefully handle backend API errors without crashing |
| NFR-010 | System MUST queue operations when offline and sync when online |

**Storage**

| ID | Requirement |
| --- | --- |
| NFR-011 | Compressed video size SHOULD be < 20KB per second of recording |
| NFR-012 | System SHOULD use < 10GB storage for 10,000 sessions |
| NFR-013 | System MUST warn user when local storage is > 90% full |

**Security**

| ID | Requirement |
| --- | --- |
| NFR-014 | All API communications MUST use HTTPS |
| NFR-015 | Backend credentials MUST NOT be stored in local AsyncStorage |
| NFR-016 | Backend credentials MUST be stored in Supabase (server-side) |

---

## Technical Specifications

### Vision Backend Abstraction

All backends implement a common interface:

```tsx
interface VisionBackend {
  id: 'didit' | 'gemini' | 'anthropic' | 'mock';  name: string;  requiresAuth: boolean;  // Authentication (if required)  login?(credentials: BackendCredentials): Promise<AuthResult>;  verifyAuth?(): Promise<boolean>;  logout?(): Promise<void>;  // Core operations  startSession(config: SessionConfig): Promise<SessionHandle>;  analyzeFrame(session: SessionHandle, frame: ImageData): Promise<FrameAnalysisResult>;  endSession(session: SessionHandle): Promise<void>;}
interface FrameAnalysisResult {
  // Normalized fields (all backends)  success: boolean;  result: boolean | null;           // true/false/null if uncertain  confidence?: number;              // 0-1 if available  textAnswer?: string;              // explanation if available  uncertain?: boolean;  // Timing  latencyMs: number;  // Raw response (backend-specific)  rawResponse: unknown;  // Optional extended fields  tokensUsed?: number;  boundingBoxes?: BoundingBox[];}
interface SessionConfig {
  question: string;  frameIntervalMs: number;  backendConfig?: Record<string, unknown>;  // Model name, etc.}
```

### DiditCamera Backend Integration

**Authentication:** Email + Password → Cookie-based JWT

**Base URL:** `https://api.diditcamera.com`

**API Flow:**
1. `POST /login` with `{ userName, password, rememberMeFlag }` → Receive `access_token` cookie
2. `POST /startSession` with `{ userName, env: "webcam", params: { question } }` → Get `sessionId`
3. `POST /upload?sessionId=xxx` with multipart form (image) → Receive analysis result
4. Optional: `GET /verifyToken` to check session validity

**Response Mapping:**

```tsx
// DiditCamera returns:{ Didit: boolean, isAlertMode: boolean, notifyByEmail: boolean }
// Extended format (requested from Omri):{ Didit: boolean, text_answer?: string, uncertain?: boolean, reason?: string }
// Maps to normalized:{
  result: response.Didit,
  textAnswer: response.text_answer,
  uncertain: response.uncertain ?? false,  confidence: undefined  // DiditCamera doesn't provide confidence}
```

### Gemini Vision Backend Integration

**Authentication:** API Key

**Model:** `gemini-2.5-flash` (configurable)

**Prompt Template:**

```
Analyze this image and answer the following question: "{question}"

Respond ONLY with a JSON object in this exact format:
{
  "result": true or false,
  "confidence": number between 0.0 and 1.0,
  "explanation": "brief explanation in 1-2 sentences",
  "uncertain": true or false
}
```

### Anthropic Claude Backend Integration

**Authentication:** API Key

**Model:** `claude-sonnet-4-20250514` (configurable)

**Prompt Template:** Same as Gemini for fair comparison.

### Mock Backend (Development)

Returns configurable responses for UI development:

```tsx
const mockBackend: VisionBackend = {
  id: 'mock',  name: 'Mock (Development)',  requiresAuth: false,  async analyzeFrame(session, frame) {
    await delay(200 + Math.random() * 300);  // Simulate latency    return {
      success: true,      result: Math.random() > 0.5,      confidence: 0.7 + Math.random() * 0.25,      textAnswer: 'Mock response for testing',      uncertain: Math.random() > 0.9,      latencyMs: 200 + Math.random() * 300,      rawResponse: { mock: true }
    };  }
};
```

---

## Data Model (Supabase)

### Tables

```sql
-- Scenarios: Predefined test scenariosCREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,           -- "RT1", "ST1", etc.  name TEXT NOT NULL,                  -- "Room Very Messy"  task_type TEXT NOT NULL,             -- "ROOM_TIDY", "SINK_TIDY", etc.  prompt TEXT NOT NULL,                -- The question for the AI  uses_reference BOOLEAN DEFAULT FALSE,
  reference_images TEXT[],             -- URLs to reference images (future)  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Sessions: A single test runCREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),  -- Anonymous user ID  -- Configuration  scenario_id UUID REFERENCES scenarios(id),
  custom_prompt TEXT,                  -- If not using a scenario  backend TEXT NOT NULL,               -- "didit", "gemini", "anthropic", "mock"  backend_config JSONB,                -- Model name, etc.  frame_interval_ms INTEGER DEFAULT 1000,
  -- Results  status TEXT DEFAULT 'active',        -- "active", "completed", "cancelled", "error"  final_result BOOLEAN,
  final_confidence REAL,
  auto_stopped BOOLEAN DEFAULT FALSE,  -- TRUE if stopped by auto-stop logic  frame_count INTEGER DEFAULT 0,
  -- Video  video_url TEXT,                      -- Supabase Storage URL (compressed)  video_duration_ms INTEGER,
  -- Evaluation  marked_accuracy TEXT,                -- "correct", "incorrect", "ambiguous", null  tester_notes TEXT,
  -- Metadata (for team tracking)  device_name TEXT,                    -- "Vitalii's iPhone", "Test iPad", etc.  device_info JSONB,                   -- OS, device model, app version  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
-- Frames: Individual frame analyses within a session-- Note: We store analysis results but NOT the actual frame imagesCREATE TABLE frames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  -- Timing  frame_number INTEGER NOT NULL,
  timestamp_ms INTEGER NOT NULL,       -- Offset from session start  -- Analysis result (normalized)  result BOOLEAN,
  confidence REAL,
  text_answer TEXT,
  uncertain BOOLEAN DEFAULT FALSE,
  latency_ms INTEGER,
  error_message TEXT,                  -- If frame analysis failed  -- Raw data  raw_response JSONB,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, frame_number)
);
-- API Credentials (shared across team)CREATE TABLE api_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backend TEXT UNIQUE NOT NULL,        -- "didit", "gemini", "anthropic"  credentials JSONB NOT NULL,          -- { email, password } or { apiKey }  configured_by TEXT,                  -- device name for tracking  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Indexes for common queriesCREATE INDEX idx_sessions_backend ON sessions(backend);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX idx_sessions_marked_accuracy ON sessions(marked_accuracy);
CREATE INDEX idx_frames_session_id ON frames(session_id);
```

### Row Level Security

Since all data is shared across the team (anonymous auth):

```sql
-- Enable RLSALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_credentials ENABLE ROW LEVEL SECURITY;
-- Policies: All authenticated users can access everythingCREATE POLICY "Team access" ON scenarios FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Team access" ON sessions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Team access" ON frames FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Team access" ON api_credentials FOR ALL USING (auth.role() = 'authenticated');
```

### Storage Buckets

```
videos/
  └── {session_id}.mp4     -- Compressed session videos

references/                 -- Future: reference images for scenarios
  └── {scenario_code}/
      └── *.jpg
```

**Storage Policies:**
- Public read access for videos (authenticated users)
- Authenticated write access

---

## Predefined Scenarios

| Code | Name | Task Type | Prompt |
| --- | --- | --- | --- |
| RT1 | Room Very Messy | ROOM_TIDY | “Is this room messy? Check if items are scattered on the floor or surfaces.” |
| RT2 | Room Matches Tidy | ROOM_TIDY | “Does this room appear tidy and organized?” |
| ST1 | Dirty Sink | SINK_TIDY | “Is this sink dirty with visible dishes or mess?” |
| BP1 | Backpack on Hook | BACKPACK_PARKED | “Is there a backpack hanging on a hook?” |
| SH1 | Shoes on Rack | SHOES_PARKED | “Are shoes placed on the shoe rack?” |
| DR1 | Child Drinking | ACTION_DRINKING | “Is the person drinking from a bottle or cup?” |
| RD1 | Child Reading | ACTION_READING | “Is the person reading an open book?” |

**Seeding Logic:**

```tsx
async function ensureScenariosExist() {
  const { count } = await supabase
    .from('scenarios')
    .select('*', { count: 'exact', head: true });  if (count === 0) {
    await supabase.from('scenarios').insert(DEFAULT_SCENARIOS);  }
}
```

---

## Key Entities Summary

| Entity | Description | Key Fields |
| --- | --- | --- |
| **Session** | A single test run | prompt, backend, frames[], video_url, final_result, marked_accuracy, device_name |
| **Frame** | Individual frame analysis | frame_number, timestamp_ms, result, confidence, text_answer, latency_ms |
| **Scenario** | Predefined test configuration | code, name, task_type, prompt |
| **Backend Credentials** | Auth for vision APIs | backend, credentials (apiKey or email/password) |

---

## Design Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Authentication | Supabase Anonymous Auth | No login friction for internal testing |
| Data sharing | All sessions visible to team | Enables collaborative benchmarking |
| Video storage | Supabase Storage, compressed | Cross-device access, manageable costs |
| Frame images | NOT stored | Reduces storage 10x, video provides context |
| Auto-stop trigger | First TRUE result + 1 second video delay | Quick feedback; extra second captures the success moment for review |
| Retry behavior | Opens fresh camera | Allows comparing same prompt across backends |
| Scenarios | Supabase + app defaults | Remote updates without app release |
| Offline mode | Not supported | Real-time feedback is core value |

---

### Compression Strategy

- Resolution: 720p max (1280×720)
- Codec: H.264
- Quality: Medium (CRF 28-30)
- Target: < 20 KB/second of video

---

## File Structure

```
sprout-camera-poc/
├── app/
│   ├── (tabs)/
│   │   ├── camera.tsx
│   │   ├── history/
│   │   │   ├── index.tsx
│   │   │   └── [sessionId].tsx
│   │   ├── settings.tsx
│   │   └── _layout.tsx
│   └── _layout.tsx              # Anonymous auth init
├── components/
│   ├── camera/
│   │   ├── CameraPreview.tsx
│   │   ├── ResultOverlay.tsx
│   │   ├── RecordingControls.tsx
│   │   ├── PromptInput.tsx
│   │   └── BackendPicker.tsx
│   ├── history/
│   │   ├── SessionCard.tsx
│   │   ├── SessionFilter.tsx
│   │   ├── FrameTimeline.tsx
│   │   └── VideoPlayer.tsx
│   ├── settings/
│   │   ├── BackendCard.tsx
│   │   ├── DiditLoginModal.tsx
│   │   └── ApiKeyModal.tsx
│   └── ui/
│       └── ... (shared components)
├── lib/
│   ├── supabase.ts
│   ├── vision/
│   │   ├── types.ts
│   │   ├── VisionService.ts
│   │   ├── adapters/
│   │   │   ├── DiditAdapter.ts
│   │   │   ├── GeminiAdapter.ts
│   │   │   ├── ClaudeAdapter.ts
│   │   │   └── MockAdapter.ts
│   │   └── index.ts
│   ├── camera/
│   │   ├── useFrameCapture.ts
│   │   ├── useVideoRecording.ts
│   │   └── compression.ts
│   └── storage/
│       ├── sessionStorage.ts
│       └── credentialStorage.ts
├── hooks/
│   ├── useSession.ts
│   ├── useAuth.ts
│   ├── useBackend.ts
│   └── useScenarios.ts
├── types/
│   └── index.ts
├── constants/
│   ├── scenarios.ts
│   └── config.ts
└── supabase/
    └── migrations/
        ├── 001_create_scenarios.sql
        ├── 002_create_sessions.sql
        ├── 003_create_frames.sql
        └── 004_create_credentials.sql
```

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

| ID | Criterion | Target |
| --- | --- | --- |
| SC-001 | Complete test session time | < 2 minutes (start to save) |
| SC-002 | Frame capture to result display | < 3 seconds |
| SC-003 | Backend switching | Within single app session |
| SC-004 | History list load time | < 1 second (first 20 items) |
| SC-005 | Video playback start | < 2 seconds |
| SC-006 | Cross-device session visibility | 100% |
| SC-007 | Sessions rated Correct/Incorrect (not Ambiguous) | > 90% |

### Assumptions

- Team size is small (< 10 testers) and all data sharing is intentional
- Network connectivity is required for running sessions
- Video storage costs are negligible for expected POC usage volume
- Testers have access to physical devices (iOS/Android)
- DiditCamera extended response format (text_answer, uncertain) will be available

---

## API Reference

### DiditCamera API

See `diditcamera-openapi.yaml` for full specification.

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/login` | POST | Authenticate with email/password |
| `/verifyToken` | GET | Check session validity |
| `/startSession` | POST | Initialize monitoring session |
| `/upload?sessionId=xxx` | POST | Upload frame for analysis |
| `/ws/session?sessionId=xxx` | WS | Real-time updates (optional) |

### Response Format Comparison

| Field | DiditCamera | Gemini | Claude |
| --- | --- | --- | --- |
| Boolean result | `Didit: boolean` | Parsed JSON `result` | Parsed JSON `result` |
| Text explanation | `text_answer` | `explanation` | `explanation` |
| Confidence | Not provided | `confidence: 0-1` | `confidence: 0-1` |
| Uncertain flag | `uncertain: boolean` | `uncertain: boolean` | `uncertain: boolean` |
| Tokens used | Not provided | API response metadata | API response metadata |

---

## Clarifications

### Session 2025-12-10

- Q: What triggers auto-stop - consecutive TRUE frames or single TRUE? → A: Single TRUE frame triggers auto-stop; the 1-second delay is for video to continue recording post-success so users can see what happened.
- Q: How should the app handle API rate limit errors? → A: Immediately end session with error, prompt user to switch backend.
- Q: How should session completion be tracked (redundant status/auto_stopped fields)? → A: Keep boolean `auto_stopped`, remove “auto_stopped” from status enum. Status = “active” | “completed” | “cancelled” | “error”. Backend adapters must have consistent interface despite different implementations.
- Q: Should sessions be saveable without video? → A: No - discard session entirely if video cannot be saved. Camera permission revoked should prompt user to go to Settings.

---

## Out of Scope (Future)

- Reference image management UI
- Multi-frame context (before/after comparison)
- Batch testing mode (run all scenarios automatically)
- Automated accuracy scoring against ground truth
- Export to CSV/analytics dashboard
- Side-by-side comparison view
- WebSocket real-time mode for DiditCamera
- Offline recording and deferred processing