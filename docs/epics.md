---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - docs/prd.md
  - docs/architecture.md
  - docs/ux-design-specification.md
workflowType: 'epics'
lastStep: 4
project_name: 'poc-didit-camera-app'
user_name: 'Oleksii'
date: '2025-12-12'
status: 'complete'
---

# poc-didit-camera-app - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for poc-didit-camera-app, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**1. Session Management & Testing Workflow (FR1-FR9):**
- FR1: Testers can create new test sessions with descriptive names and scenario selection
- FR2: Testers can select which vision AI backends to test (DiditCamera, Gemini, Claude, Mock)
- FR3: Testers can configure session parameters including frame capture interval (500-5000ms) and test duration
- FR4: Testers can start/stop test sessions with one-tap control
- FR5: Testers can view real-time progress indicators during active sessions (time elapsed, frames captured, responses received)
- FR6: System can automatically stop sessions when TRUE result is detected (+1 second buffer)
- FR7: Testers can pause and resume sessions without losing captured data
- FR8: Testers can access session history with all previously completed test runs
- FR9: Testers can delete individual sessions to remove test data

**2. Camera & Media Capture (FR10-FR17):**
- FR10: System can capture video continuously during test sessions using device camera
- FR11: System can extract frames from video stream at configured intervals for AI analysis
- FR12: System can maintain dual-capture mode (video recording + frame extraction) simultaneously
- FR13: System can compress recorded video to H.264 720p format for storage efficiency
- FR14: System can store captured video files locally on device
- FR15: Testers can review captured video playback with synchronized AI response timeline
- FR16: System can request and manage camera permissions appropriately for iOS/Android
- FR17: System can request and manage video recording permissions for both platforms

**3. Backend Integration & Response Management (FR18-FR26):**
- FR18: System can send captured frames to multiple vision AI backends concurrently
- FR19: System can authenticate with DiditCamera backend using email/password credentials
- FR20: System can authenticate with Gemini Vision backend using API key
- FR21: System can authenticate with Claude backend using API key
- FR22: System can use Mock backend for testing without live API dependencies
- FR23: System can handle backend response latency variations without blocking UI
- FR24: System can capture and store complete response data from each backend (result, confidence, response time, metadata)
- FR25: System can retry failed backend requests with exponential backoff
- FR26: System can continue session execution even if individual backends fail

**4. Offline Mode & Data Synchronization (FR27-FR34):**
- FR27: Testers can run complete test sessions while device is offline
- FR28: System can queue all backend requests when offline for later processing
- FR29: System can store all session data (video, frames, metadata) locally when offline
- FR30: System can detect when device connectivity is restored
- FR31: System can automatically sync queued requests to backends when online
- FR32: System can update session records with backend responses after sync completes
- FR33: Testers can view sync status indicators showing pending/in-progress/completed sync operations
- FR34: System can manage local storage capacity and warn when storage is low

**5. Results Analysis & Comparison (FR35-FR42):**
- FR35: Testers can view side-by-side comparison of all backend responses for each frame
- FR36: Testers can see timing data for each backend response (latency, processing time)
- FR37: Testers can see confidence scores reported by each backend
- FR38: Testers can identify which backend first returned TRUE result with visual indicators
- FR39: Testers can filter session results by backend to focus analysis
- FR40: Testers can see aggregate statistics across session (accuracy rate, average latency, consistency)
- FR41: Testers can compare performance across different prompts using same scenario
- FR42: Testers can export session results data for external analysis

**6. Prompt Management & Iteration (FR43-FR49):**
- FR43: Testers can create and save custom prompts for vision AI analysis
- FR44: Testers can edit existing prompts and test variations
- FR45: Testers can associate specific prompts with test sessions
- FR46: Testers can view prompt performance history across multiple sessions
- FR47: Testers can compare results from different prompt variations side-by-side
- FR48: Testers can mark prompts as "working" or "needs refinement" based on results
- FR49: System can suggest prompt improvements based on inconsistent results (future capability)

**7. Scenario Management (FR50-FR54):**
- FR50: Testers can select from predefined test scenarios when creating sessions
- FR51: System can provide scenario-specific guidance and success criteria
- FR52: Testers can view which backends perform best for specific scenarios
- FR53: Testers can access scenario library with descriptions and expected outcomes
- FR54: Testers can filter session history by scenario type

**8. Collaboration & Team Features (FR55-FR60):**
- FR55: Testers can share session results with team members via unique links
- FR56: Testers can add notes and observations to session results
- FR57: Testers can view test results contributed by other team members
- FR58: System can maintain user identity using Supabase anonymous authentication
- FR59: Testers can access shared prompt library with team contributions
- FR60: Testers can see aggregate team insights across all testing sessions

### Non-Functional Requirements

**Performance:**
- NFR1: Frame capture latency < 50ms (camera remains responsive)
- NFR2: Frame upload + AI response < 3000ms (maintains real-time feel)
- NFR3: Video playback start < 500ms after tap (instant review)
- NFR4: History list load < 200ms for first 20 items (snappy navigation)
- NFR5: Backend switching < 100ms (seamless A/B testing workflow)
- NFR6: Session save to database < 1000ms (quick completion)
- NFR7: Video compression < 5 seconds for 60-second recording
- NFR8: Support 1-5 FPS frame capture without video degradation

**Reliability:**
- NFR9: Zero data loss during network interruptions (offline queueing)
- NFR10: Perfect frame/video timestamp synchronization for overlay playback
- NFR11: Individual backend failures cannot block session continuation
- NFR12: Session recovery after app crashes using local cache
- NFR13: 100% cross-device session visibility with < 5 second sync latency
- NFR14: Failed frame uploads retry with exponential backoff

**Security:**
- NFR15: Credential encryption at rest (iOS Keychain, Android Keystore)
- NFR16: HTTPS/TLS 1.2+ for all external communication
- NFR17: No plain-text credential logging
- NFR18: Team-level access control via Supabase row-level security

**Integration:**
- NFR19: Multi-backend abstraction normalizing diverse API responses
- NFR20: Hot-swappable backends within single session
- NFR21: Concurrent backend requests without mutual blocking
- NFR22: Real-time Supabase subscriptions for team collaboration

**Maintainability:**
- NFR23: New backends addable via < 200 lines implementing standard interface
- NFR24: Configuration-driven endpoints, timeouts, and intervals
- NFR25: Cross-platform parity (no iOS/Android exclusive features)

### Additional Requirements

**From Architecture - Starter Template:**
- AR1: Project initialization using `create-expo-stack` with TypeScript, Expo Router, Supabase
- AR2: Redux Toolkit + Redux Persist for state management
- AR3: Styled Components for component-level styling
- AR4: expo-camera + expo-av for camera and video functionality
- AR5: expo-secure-store for encrypted credential storage
- AR6: @react-native-community/netinfo for network state detection
- AR7: Supabase client for Auth, Database, Storage, and Realtime

**From Architecture - Patterns:**
- AR8: Adapter pattern for backend abstraction (VisionBackend interface)
- AR9: Result<T> type for all async service functions
- AR10: Local-first architecture with optimistic updates
- AR11: Co-located test files next to source files
- AR12: Feature-based component organization

**From UX Design - Interactions:**
- UX1: Prompt persistence across backend switches (critical for comparison workflow)
- UX2: One-handed operation while moving (thumb-friendly controls)
- UX3: Glanceable feedback at arm's length during recording
- UX4: One-tap "Try with [Backend]" retry workflow from session review
- UX5: Auto-stop captures "success moment" (+1 second after TRUE result)

**From UX Design - Navigation:**
- UX6: Camera-first interface (app opens directly to camera screen)
- UX7: Tab-based navigation (Camera/History/Settings tabs)
- UX8: Maximum 2 levels deep navigation hierarchy
- UX9: Clear back navigation from session detail to history

**From UX Design - Emotional Design:**
- UX10: Visible sync status indicators (syncing/synced/offline)
- UX11: Clear offline mode indicator in app header
- UX12: No silent failures - all errors communicated with recovery paths
- UX13: Comprehensive session metadata display (backend, confidence, latency, device)

### FR Coverage Map

**Session Management & Testing Workflow:**
- FR1: Epic 4 - Create test sessions with names/scenarios
- FR2: Epic 3 - Select vision AI backends
- FR3: Epic 3 - Configure frame capture interval
- FR4: Epic 2 - Start/stop test sessions
- FR5: Epic 3 - Real-time progress indicators
- FR6: Epic 3 - Auto-stop on TRUE detection
- FR7: Epic 4 - Pause/resume sessions
- FR8: Epic 4 - Access session history
- FR9: Epic 4 - Delete sessions

**Camera & Media Capture:**
- FR10: Epic 2 - Capture video continuously
- FR11: Epic 2 - Extract frames at intervals
- FR12: Epic 2 - Dual-capture mode
- FR13: Epic 2 - Compress to H.264 720p
- FR14: Epic 2 - Store video locally
- FR15: Epic 4 - Video playback with AI timeline
- FR16: Epic 1 - Camera permissions
- FR17: Epic 1 - Video recording permissions

**Backend Integration & Response Management:**
- FR18: Epic 3 - Send frames to multiple backends
- FR19: Epic 3 - DiditCamera authentication
- FR20: Epic 3 - Gemini authentication
- FR21: Epic 3 - Claude authentication
- FR22: Epic 3 - Mock backend
- FR23: Epic 3 - Handle latency without blocking
- FR24: Epic 3 - Capture complete response data
- FR25: Epic 3 - Retry with exponential backoff
- FR26: Epic 3 - Continue if backend fails

**Offline Mode & Data Synchronization:**
- FR27: Epic 5 - Run sessions offline
- FR28: Epic 5 - Queue requests when offline
- FR29: Epic 5 - Store data locally offline
- FR30: Epic 5 - Detect connectivity restored
- FR31: Epic 5 - Auto-sync when online
- FR32: Epic 5 - Update records after sync
- FR33: Epic 5 - Sync status indicators
- FR34: Epic 5 - Storage capacity warnings

**Results Analysis & Comparison:**
- FR35: Epic 6 - Side-by-side backend comparison
- FR36: Epic 6 - Timing data per backend
- FR37: Epic 6 - Confidence scores
- FR38: Epic 6 - First TRUE indicator
- FR39: Epic 6 - Filter by backend
- FR40: Epic 6 - Aggregate statistics
- FR41: Epic 6 - Compare across prompts
- FR42: Epic 6 - Export results

**Prompt Management & Iteration:**
- FR43: Epic 4 - Create custom prompts
- FR44: Epic 4 - Edit prompts
- FR45: Epic 4 - Associate prompts with sessions
- FR46: Epic 6 - Prompt performance history
- FR47: Epic 6 - Compare prompt variations
- FR48: Epic 6 - Mark prompt status
- FR49: Epic 6 - Suggest improvements (future)

**Scenario Management:**
- FR50: Epic 6 - Select predefined scenarios
- FR51: Epic 6 - Scenario guidance
- FR52: Epic 6 - Backend performance by scenario
- FR53: Epic 6 - Scenario library
- FR54: Epic 6 - Filter by scenario

**Collaboration & Team Features:**
- FR55: Epic 6 - Share via unique links
- FR56: Epic 4 - Add notes to sessions
- FR57: Epic 6 - View team results
- FR58: Epic 1 - Supabase anonymous auth
- FR59: Epic 6 - Shared prompt library
- FR60: Epic 6 - Team aggregate insights

## Epic List

### Epic 1: Project Foundation & Core Infrastructure
Development team has a working application shell with navigation, state management, and backend connectivity ready for feature development.
**FRs covered:** FR16, FR17, FR58
**NFRs addressed:** NFR15, NFR16, NFR17, NFR18, NFR23, NFR24, NFR25
**Additional Requirements:** AR1-AR12, UX6, UX7, UX8

### Epic 2: Camera Capture & Recording
Testers can capture camera frames and record video during test sessions, with proper permission handling and local storage.
**FRs covered:** FR4, FR10, FR11, FR12, FR13, FR14
**NFRs addressed:** NFR1, NFR7, NFR8, NFR10

### Epic 3: Backend Integration & AI Analysis
Testers can send captured frames to vision AI backends and see real-time analysis results overlaid on camera preview.
**FRs covered:** FR2, FR3, FR5, FR6, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26
**NFRs addressed:** NFR2, NFR5, NFR11, NFR19, NFR20, NFR21

### Epic 4: Session Management & History
Testers can save completed sessions, view session history, review video playback with AI timeline overlay, and manage their test data.
**FRs covered:** FR1, FR7, FR8, FR9, FR15, FR43, FR44, FR45, FR56
**NFRs addressed:** NFR3, NFR4, NFR6
**Additional Requirements:** UX1, UX4, UX9, UX13

### Epic 5: Offline Mode & Synchronization
Testers can run complete test sessions offline with automatic sync when connectivity restores, ensuring no data loss.
**FRs covered:** FR27, FR28, FR29, FR30, FR31, FR32, FR33, FR34
**NFRs addressed:** NFR9, NFR12, NFR13, NFR14
**Additional Requirements:** UX10, UX11, UX12

### Epic 6: Results Analysis & Team Collaboration
Testers can analyze results across sessions, compare backend performance, collaborate with team members, and make data-driven decisions.
**FRs covered:** FR35, FR36, FR37, FR38, FR39, FR40, FR41, FR42, FR46, FR47, FR48, FR49, FR50, FR51, FR52, FR53, FR54, FR55, FR57, FR59, FR60
**NFRs addressed:** NFR22

---

## Epic 1: Project Foundation & Core Infrastructure

Development team has a working application shell with navigation, state management, and backend connectivity ready for feature development.

### Story 1.1: Project Initialization with Expo Stack

**As a** developer,
**I want** a properly initialized React Native project with TypeScript, Expo Router, and Supabase configuration,
**So that** I have a working foundation to build the vision AI testing app.

**Acceptance Criteria:**

**Given** a new development environment
**When** the project is initialized using `npx create-expo-stack@latest poc-didit-camera-app`
**Then** the project includes TypeScript configuration with strict mode
**And** Expo Router is configured for file-based routing
**And** Supabase client dependencies are installed
**And** environment variable configuration is set up via `app.config.ts`
**And** `.env.example` file documents required environment variables (SUPABASE_URL, SUPABASE_ANON_KEY)
**And** `.gitignore` excludes `.env.local` and other sensitive files
**And** the app builds and runs successfully in Expo Go

### Story 1.2: Redux Toolkit & Styled Components Setup

**As a** developer,
**I want** Redux Toolkit with Redux Persist and Styled Components configured,
**So that** I have consistent state management and styling patterns for the application.

**Acceptance Criteria:**

**Given** the initialized Expo project from Story 1.1
**When** Redux Toolkit and Styled Components are configured
**Then** Redux store is created with `@reduxjs/toolkit` and `redux-persist`
**And** typed hooks (`useAppSelector`, `useAppDispatch`) are available in `src/store/hooks.ts`
**And** AsyncStorage is configured as the persistence storage engine
**And** Styled Components theme provider wraps the app in root layout
**And** theme definition exists in `src/theme/theme.ts` with TypeScript types
**And** base styled components (Button, Card, Text) are created in `src/components/`
**And** the app renders correctly with theme applied

### Story 1.3: Tab Navigation Structure

**As a** tester,
**I want** a tab-based navigation with Camera, History, and Settings tabs,
**So that** I can quickly navigate between the main app sections.

**Acceptance Criteria:**

**Given** the app is launched
**When** the tester views the main screen
**Then** a bottom tab bar displays three tabs: Camera, History, Settings
**And** Camera tab is the default/initial tab (app opens to camera screen per UX6)
**And** each tab displays its corresponding screen placeholder
**And** tab icons visually indicate the active tab
**And** tab switching is instant (< 100ms per NFR5)
**And** navigation state persists correctly when switching tabs
**And** the navigation follows Expo Router file-based routing in `app/(tabs)/`

### Story 1.4: Supabase Client & Anonymous Authentication

**As a** tester,
**I want** the app to automatically authenticate me anonymously on first launch,
**So that** I can start testing immediately without creating an account.

**Acceptance Criteria:**

**Given** the app is launched for the first time on a device
**When** the app initializes
**Then** Supabase client is configured with environment variables
**And** anonymous authentication is triggered automatically via `supabase.auth.signInAnonymously()`
**And** the anonymous session is persisted locally
**And** subsequent app launches use the existing anonymous session
**And** all API requests include the authentication token
**And** authentication errors are handled gracefully with user-friendly messages
**And** HTTPS/TLS is used for all Supabase communication (per NFR16)

### Story 1.5: Backend Abstraction Layer Foundation

**As a** developer,
**I want** a VisionBackend interface with a Mock backend implementation,
**So that** I can develop and test UI without live API dependencies.

**Acceptance Criteria:**

**Given** the backend abstraction layer structure
**When** a backend adapter is used
**Then** `VisionBackend` interface is defined in `src/services/backends/types.ts`
**And** interface includes `name`, `analyze(frame, prompt)`, and `isConfigured()` methods
**And** `AnalysisResult` type includes `result` (boolean), `confidence` (0-100), `rawResponse`, `latencyMs`
**And** Mock backend is implemented in `src/services/backends/mock.ts`
**And** Mock backend returns configurable responses with simulated latency
**And** Backend factory/selector exists in `src/services/backends/index.ts`
**And** Mock backend has co-located tests in `mock.test.ts`
**And** Result<T> type pattern is used for all async operations (per AR9)

### Story 1.6: Secure Credential Storage

**As a** tester,
**I want** my backend API credentials stored securely on my device,
**So that** my credentials are protected and persist across app sessions.

**Acceptance Criteria:**

**Given** a user needs to store backend credentials
**When** credentials are saved
**Then** `expo-secure-store` wrapper exists in `src/services/storage/secureStorage.ts`
**And** credentials are encrypted at rest using platform secure storage (iOS Keychain, Android Keystore per NFR15)
**And** wrapper provides `getCredential(key)`, `setCredential(key, value)`, `deleteCredential(key)` functions
**And** all functions return `Result<T>` type for consistent error handling
**And** credentials are never logged in plain text (per NFR17)
**And** storage errors are handled gracefully with user-friendly messages
**And** wrapper has co-located tests

---

## Epic 2: Camera Capture & Recording

Testers can capture camera frames and record video during test sessions, with proper permission handling and local storage.

### Story 2.1: Camera Permission Handling

**As a** tester,
**I want** the app to request camera permissions with clear explanations,
**So that** I understand why the permission is needed and can grant access to start testing.

**Acceptance Criteria:**

**Given** the app needs camera access
**When** the tester navigates to the Camera tab for the first time
**Then** a permission request is displayed with clear explanation: "Camera access is required to capture frames for AI analysis"
**And** if permission is granted, the camera preview becomes active
**And** if permission is denied, a helpful error message is shown with a link to device Settings
**And** permission state is checked on each app launch
**And** the app handles "restricted" and "undetermined" permission states gracefully
**And** permission handling works correctly on both iOS and Android

### Story 2.2: Camera Preview Component

**As a** tester,
**I want** to see a live camera preview on the Camera screen,
**So that** I can point my phone at the test scenario and see what the AI will analyze.

**Acceptance Criteria:**

**Given** camera permission has been granted
**When** the tester views the Camera tab
**Then** a live camera preview fills the screen using `expo-camera`
**And** the preview uses the rear camera by default
**And** the preview maintains proper aspect ratio without distortion
**And** the preview is portrait-oriented (matching typical testing posture)
**And** the camera preview remains responsive (no lag or frame drops)
**And** memory is managed properly to prevent leaks during extended use

### Story 2.3: Video Recording Service

**As a** tester,
**I want** to record video during my test sessions,
**So that** I can review what the camera captured and verify AI analysis accuracy.

**Acceptance Criteria:**

**Given** camera preview is active
**When** recording is started
**Then** video recording begins using `expo-av` Video component
**And** recording captures the full camera view continuously
**And** recording state is tracked in Redux store
**And** recording can be stopped programmatically or manually
**And** the recorded video file is accessible after recording stops
**And** recording handles app backgrounding gracefully (completes current recording)
**And** recording errors are caught and reported to the user

### Story 2.4: Frame Capture at Configurable Intervals

**As a** tester,
**I want** frames extracted from the camera at my configured interval,
**So that** each frame can be sent to vision AI backends for analysis.

**Acceptance Criteria:**

**Given** a test session is active
**When** frame capture is running
**Then** JPEG frames are extracted from the camera stream at the configured interval
**And** default interval is 1000ms (1 frame per second)
**And** interval is configurable from 500ms to 5000ms (per FR3)
**And** frame capture latency is < 50ms (per NFR1)
**And** each frame includes a timestamp for synchronization
**And** frames are stored temporarily in memory for processing
**And** frames are released after processing to prevent memory bloat

### Story 2.5: Dual-Capture Mode (Video + Frames)

**As a** tester,
**I want** video recording and frame capture to run simultaneously,
**So that** I get both continuous video and individual frames for AI analysis.

**Acceptance Criteria:**

**Given** a test session is started
**When** dual-capture mode is active
**Then** video recording and frame capture run concurrently (per FR12)
**And** neither process blocks or degrades the other
**And** frame capture maintains configured interval accuracy (±50ms tolerance)
**And** video recording maintains stable quality without dropped frames
**And** system supports 1-5 FPS frame capture without video degradation (per NFR8)
**And** frame timestamps align with video timeline for later synchronization (per NFR10)
**And** CPU/memory usage remains within acceptable bounds during extended sessions

### Story 2.6: Video Compression & Local Storage

**As a** tester,
**I want** recorded videos compressed and stored locally,
**So that** storage is used efficiently and videos are available for review.

**Acceptance Criteria:**

**Given** a video recording has completed
**When** the video is processed for storage
**Then** video is compressed to H.264 codec at 720p resolution (per FR13)
**And** compression achieves approximately 20KB per second target
**And** compression completes within 5 seconds for 60-second recordings (per NFR7)
**And** compressed video is saved to Expo FileSystem document directory (per FR14)
**And** video file path is stored with session metadata
**And** file storage service provides `saveVideo()`, `getVideo()`, `deleteVideo()` functions
**And** storage errors are handled gracefully with user notification

### Story 2.7: Recording Controls UI

**As a** tester,
**I want** clear Start/Stop controls for recording sessions,
**So that** I can easily control when testing begins and ends.

**Acceptance Criteria:**

**Given** the tester is on the Camera screen with permissions granted
**When** viewing recording controls
**Then** a prominent Start button is displayed when not recording
**And** tapping Start begins dual-capture mode (video + frames)
**And** the button changes to Stop during active recording
**And** a recording indicator (red dot or timer) shows recording is active
**And** elapsed time is displayed during recording
**And** tapping Stop ends the recording session
**And** controls are thumb-friendly and accessible one-handed (per UX2)
**And** controls are visible and usable at arm's length (per UX3)

---

## Epic 3: Backend Integration & AI Analysis

Testers can send captured frames to vision AI backends and see real-time analysis results overlaid on camera preview.

### Story 3.1: Backend Picker UI

**As a** tester,
**I want** to select which vision AI backend to use for my test session,
**So that** I can compare results across different AI providers.

**Acceptance Criteria:**

**Given** the tester is on the Camera screen
**When** viewing the backend picker
**Then** a picker/selector displays available backends: DiditCamera, Gemini, Claude, Mock
**And** the currently selected backend is visually highlighted
**And** tapping a backend switches the selection instantly (< 100ms per NFR5)
**And** backends without configured credentials show "Not configured" indicator
**And** tapping an unconfigured backend prompts navigation to Settings
**And** the selected backend is persisted in Redux store
**And** backend selection is preserved across app sessions

### Story 3.2: Prompt Input Component

**As a** tester,
**I want** to enter a custom prompt for AI analysis that persists across backend switches,
**So that** I can test the same question across multiple backends without re-typing.

**Acceptance Criteria:**

**Given** the tester is on the Camera screen
**When** entering a prompt
**Then** a text input field is visible for entering the analysis prompt
**And** the prompt field supports multi-line input for complex questions
**And** the prompt persists when switching between backends (critical per UX1)
**And** the prompt is stored in Redux and persists across app sessions
**And** the prompt field is accessible while camera preview is active
**And** placeholder text guides the user: "Enter your prompt (e.g., 'Is this room messy?')"
**And** the prompt is associated with the session when recording starts

### Story 3.3: DiditCamera Backend Adapter

**As a** tester,
**I want** to send frames to DiditCamera backend for AI analysis,
**So that** I can evaluate DiditCamera's vision AI capabilities.

**Acceptance Criteria:**

**Given** DiditCamera credentials are configured
**When** a frame is sent for analysis
**Then** DiditCamera adapter implements the `VisionBackend` interface
**And** adapter authenticates using email/password credentials (per FR19)
**And** adapter sends frame data with prompt to DiditCamera API
**And** adapter normalizes DiditCamera response to `AnalysisResult` format
**And** adapter captures complete response data including raw response (per FR24)
**And** adapter measures and reports latency in milliseconds
**And** `isConfigured()` returns true only when valid credentials exist
**And** adapter has co-located tests

### Story 3.4: Gemini Vision Backend Adapter

**As a** tester,
**I want** to send frames to Gemini Vision backend for AI analysis,
**So that** I can evaluate Google's vision AI capabilities.

**Acceptance Criteria:**

**Given** Gemini API key is configured
**When** a frame is sent for analysis
**Then** Gemini adapter implements the `VisionBackend` interface
**And** adapter authenticates using API key (per FR20)
**And** adapter sends frame as base64 image with prompt to Gemini Vision API
**And** adapter normalizes Gemini response to `AnalysisResult` format
**And** adapter extracts boolean result and confidence from Gemini's response
**And** adapter captures complete response data including raw response (per FR24)
**And** adapter measures and reports latency in milliseconds
**And** `isConfigured()` returns true only when valid API key exists
**And** adapter has co-located tests

### Story 3.5: Claude Backend Adapter

**As a** tester,
**I want** to send frames to Claude (Anthropic) backend for AI analysis,
**So that** I can evaluate Anthropic's vision AI capabilities.

**Acceptance Criteria:**

**Given** Claude API key is configured
**When** a frame is sent for analysis
**Then** Claude adapter implements the `VisionBackend` interface
**And** adapter authenticates using API key (per FR21)
**And** adapter sends frame as base64 image with prompt to Claude Vision API
**And** adapter normalizes Claude response to `AnalysisResult` format
**And** adapter extracts boolean result and confidence from Claude's response
**And** adapter captures complete response data including raw response (per FR24)
**And** adapter measures and reports latency in milliseconds
**And** `isConfigured()` returns true only when valid API key exists
**And** adapter has co-located tests

### Story 3.6: Frame Analysis Pipeline

**As a** tester,
**I want** captured frames automatically sent to the selected backend for analysis,
**So that** I receive AI analysis results in real-time during my test session.

**Acceptance Criteria:**

**Given** a test session is active with a backend selected
**When** a frame is captured
**Then** the frame is sent to the selected backend's `analyze()` method
**And** the prompt from the input field is included with each frame
**And** analysis runs asynchronously without blocking camera/video (per FR23)
**And** each frame result is stored with timestamp in session state
**And** frame upload + AI response completes within 3000ms target (per NFR2)
**And** multiple frames can be in-flight simultaneously
**And** results are received and processed in order

### Story 3.7: Real-Time Result Overlay

**As a** tester,
**I want** to see AI analysis results overlaid on the camera preview in real-time,
**So that** I get immediate feedback while testing.

**Acceptance Criteria:**

**Given** a test session is active and frames are being analyzed
**When** an analysis result is received
**Then** the result (TRUE/FALSE) is displayed prominently on camera preview
**And** confidence score is displayed (e.g., "TRUE 85%")
**And** TRUE results are visually distinct (e.g., green) from FALSE results (e.g., red)
**And** the overlay is legible from arm's length (per UX3)
**And** the overlay updates with each new frame result
**And** latency for the current frame is optionally visible
**And** the overlay does not obstruct critical camera view areas

### Story 3.8: Progress Indicators During Recording

**As a** tester,
**I want** to see real-time progress during my test session,
**So that** I know how many frames have been captured and analyzed.

**Acceptance Criteria:**

**Given** a test session is active
**When** viewing the Camera screen during recording
**Then** elapsed recording time is displayed (per FR5)
**And** frame count (captured) is displayed
**And** response count (received from backend) is displayed
**And** indicators update in real-time as frames are captured/analyzed
**And** any pending/in-flight frames are indicated
**And** progress indicators are visible but not distracting
**And** indicators are positioned for glanceability during testing

### Story 3.9: Auto-Stop on TRUE Detection

**As a** tester,
**I want** recording to automatically stop shortly after AI detects TRUE,
**So that** the "success moment" is captured without manual intervention.

**Acceptance Criteria:**

**Given** a test session is active and recording
**When** the backend returns a TRUE result for the first time
**Then** a 1-second countdown begins (per FR6)
**And** recording continues during the countdown to capture the moment
**And** after 1 second, recording automatically stops
**And** the auto-stop is visually indicated to the user
**And** the session proceeds to review screen with captured video
**And** if user manually stops before countdown completes, that takes precedence
**And** auto-stop only triggers on first TRUE (not subsequent TRUEs)

### Story 3.10: Backend Error Handling & Retry Logic

**As a** tester,
**I want** backend failures handled gracefully with automatic retry,
**So that** temporary issues don't ruin my test session.

**Acceptance Criteria:**

**Given** a frame analysis request fails
**When** the error is detected
**Then** the system retries with exponential backoff (1s, 2s, 4s, max 30s per FR25)
**And** maximum retry attempts is configurable (default: 3)
**And** the session continues even if individual frames fail (per FR26, NFR11)
**And** failed frames are marked as failed in session data
**And** user is notified of persistent failures without blocking the session
**And** different error types are handled appropriately (network, auth, rate limit)
**And** retry logic has co-located tests

### Story 3.11: Settings Screen - Backend Configuration

**As a** tester,
**I want** to configure my backend credentials in Settings,
**So that** I can authenticate with each vision AI provider.

**Acceptance Criteria:**

**Given** the tester navigates to Settings tab
**When** viewing backend configuration
**Then** each backend (DiditCamera, Gemini, Claude) has a configuration section
**And** DiditCamera shows email/password input fields
**And** Gemini shows API key input field
**And** Claude shows API key input field
**And** each backend shows status indicator (Active/Inactive/Error)
**And** saving credentials stores them securely via expo-secure-store
**And** credentials are validated on save (test connection)
**And** invalid credentials show clear error message
**And** Mock backend shows "Always available" status (no config needed)
**And** frame capture interval setting is configurable (500-5000ms slider/input)

---

## Epic 4: Session Management & History

Testers can save completed sessions, view session history, review video playback with AI timeline overlay, and manage their test data.

### Story 4.1: Session Review Screen

**As a** tester,
**I want** to see a review screen immediately after recording stops,
**So that** I can decide whether to save or discard the session.

**Acceptance Criteria:**

**Given** a recording session has ended (manual stop or auto-stop)
**When** the review screen appears
**Then** the review screen displays immediately after recording stops
**And** a video thumbnail or preview of the recorded session is shown
**And** session summary displays: backend used, prompt, duration, frame count
**And** "Save" button saves the session and navigates to session detail
**And** "Discard" button deletes the recording and returns to camera
**And** "Retry" option allows re-recording with same prompt/backend
**And** the user can play the video to review before deciding

### Story 4.2: Session Data Model & Redux Slice

**As a** developer,
**I want** a well-defined session data model and Redux slice,
**So that** session state is managed consistently throughout the app.

**Acceptance Criteria:**

**Given** the need to track session data
**When** the sessions slice is implemented
**Then** `Session` type is defined with: id, prompt, backendType, deviceName, createdAt, duration, videoPath, videoUrl, accuracyRating, notes
**And** `FrameResult` type is defined with: id, sessionId, timestamp, result, confidence, latencyMs, rawResponse
**And** `sessionsSlice` is created with actions: addSession, updateSession, deleteSession, setCurrentSession
**And** selectors are provided: selectAllSessions, selectSessionById, selectCurrentSession
**And** dates are stored as ISO strings (per architecture patterns)
**And** Redux Persist includes sessions in whitelist for persistence

### Story 4.3: Save Session to Supabase

**As a** tester,
**I want** my session data saved to Supabase,
**So that** my test results are backed up and shared with the team.

**Acceptance Criteria:**

**Given** a session is saved from the review screen
**When** the save operation completes
**Then** session metadata is inserted into Supabase `sessions` table
**And** frame results are inserted into Supabase `frame_results` table
**And** save operation completes within 1000ms target (per NFR6)
**And** local Redux state is updated optimistically before server confirms
**And** save errors are handled gracefully with retry option
**And** Supabase row-level security ensures team access (per NFR18)
**And** session service uses Result<T> pattern for error handling

### Story 4.4: Upload Video to Supabase Storage

**As a** tester,
**I want** my session videos uploaded to cloud storage,
**So that** videos are accessible from any device and backed up.

**Acceptance Criteria:**

**Given** a session is saved with a recorded video
**When** the video upload process runs
**Then** compressed video is uploaded to Supabase Storage `session-videos` bucket
**And** upload runs in background after session metadata is saved
**And** upload progress is trackable (for future UI display)
**And** video URL is stored in session record after upload completes
**And** local video file can be deleted after successful upload to free space
**And** upload failures are queued for retry (integrated with Epic 5 offline queue)
**And** video is accessible via public URL for playback

### Story 4.5: History Tab - Session List

**As a** tester,
**I want** to see a list of all past sessions on the History tab,
**So that** I can browse and review my testing work.

**Acceptance Criteria:**

**Given** the tester navigates to History tab
**When** the session list loads
**Then** all sessions are displayed in reverse chronological order (newest first)
**And** history list loads within 200ms for first 20 items (per NFR4)
**And** each session card shows: backend, prompt (truncated), result, timestamp, duration, device name
**And** accuracy rating (Correct/Incorrect/Ambiguous) is displayed if set
**And** sessions from all team members are visible (per FR57, team collaboration)
**And** list supports pull-to-refresh to sync latest sessions
**And** empty state shows helpful message when no sessions exist

### Story 4.6: Session Detail Screen

**As a** tester,
**I want** to view detailed information about a specific session,
**So that** I can analyze the AI's behavior and results.

**Acceptance Criteria:**

**Given** the tester taps a session in the History list
**When** the session detail screen opens
**Then** navigation shows clear back button to History (per UX9)
**And** comprehensive metadata is displayed: backend, prompt, timestamp, duration, frame count, device name (per UX13)
**And** final result (TRUE/FALSE) and confidence are prominently shown
**And** average latency across all frames is displayed
**And** list of all frame results with timestamps is available
**And** raw backend response is viewable for debugging
**And** accuracy rating and notes sections are accessible

### Story 4.7: Video Playback with AI Timeline

**As a** tester,
**I want** to play back session video with AI results synchronized,
**So that** I can see exactly when and why the AI changed its assessment.

**Acceptance Criteria:**

**Given** the tester views a session detail with video
**When** playing the video
**Then** video playback starts within 500ms of tap (per NFR3)
**And** AI results are overlaid on video at corresponding timestamps (per FR15)
**And** result overlay shows TRUE/FALSE and confidence at each frame time
**And** frame timeline below video allows tap-to-jump navigation
**And** current playback position is indicated on timeline
**And** frame markers show result changes (FALSE→TRUE moments highlighted)
**And** video controls include play/pause and scrubbing

### Story 4.8: Accuracy Rating

**As a** tester,
**I want** to rate sessions as Correct, Incorrect, or Ambiguous,
**So that** I can track AI accuracy and identify patterns.

**Acceptance Criteria:**

**Given** the tester is viewing a session detail
**When** rating accuracy
**Then** three rating options are available: Correct, Incorrect, Ambiguous
**And** rating selection is visually clear (icon + text)
**And** selected rating is saved to session record immediately
**And** rating is synced to Supabase for team visibility
**And** rating can be changed at any time
**And** rating is visible on session cards in History list
**And** unrated sessions show "Not rated" indicator

### Story 4.9: Session Notes

**As a** tester,
**I want** to add notes and observations to my sessions,
**So that** I can capture insights not reflected in the AI results.

**Acceptance Criteria:**

**Given** the tester is viewing a session detail
**When** adding or editing notes
**Then** a notes text field is available on session detail (per FR56)
**And** notes support multi-line free-form text
**And** notes are saved automatically or on blur
**And** notes are synced to Supabase for team visibility
**And** notes are visible in session detail view
**And** character limit or guidance prevents excessively long notes
**And** empty notes show placeholder encouraging note-taking

### Story 4.10: Delete Session

**As a** tester,
**I want** to delete sessions I no longer need,
**So that** I can keep my history clean and remove test data.

**Acceptance Criteria:**

**Given** the tester wants to delete a session
**When** initiating deletion
**Then** delete option is available on session detail screen (per FR9)
**And** confirmation dialog prevents accidental deletion
**And** deletion removes session from local Redux state
**And** deletion removes session from Supabase database
**And** associated video is deleted from Supabase Storage
**And** local video file is deleted if present
**And** deletion is reflected immediately in History list
**And** deletion errors are handled gracefully with user notification

### Story 4.11: Retry with Different Backend

**As a** tester,
**I want** to quickly retry a session with a different backend,
**So that** I can compare how different AI providers analyze the same scenario.

**Acceptance Criteria:**

**Given** the tester is viewing a session detail
**When** tapping "Try with [Backend]" button
**Then** a retry option is prominently available (per UX4)
**And** tapping retry navigates to Camera screen
**And** the original session's prompt is pre-filled in prompt input
**And** backend picker allows selection of different backend
**And** tester can immediately start a new recording
**And** this enables rapid A/B comparison workflow
**And** "Try with Gemini" / "Try with Claude" / etc. buttons are context-aware

---

## Epic 5: Offline Mode & Synchronization

Testers can run complete test sessions offline with automatic sync when connectivity restores, ensuring no data loss.

### Story 5.1: Network State Detection

**As a** tester,
**I want** the app to detect my network connectivity status,
**So that** the app can adapt its behavior when I'm offline.

**Acceptance Criteria:**

**Given** the app is running
**When** network connectivity changes
**Then** network state is detected using `@react-native-community/netinfo` (per AR6)
**And** network state (online/offline) is stored in Redux store
**And** network state is globally accessible via `useAppSelector`
**And** state updates are triggered within 1 second of connectivity change (per FR30)
**And** both WiFi and cellular connectivity are detected
**And** network quality (e.g., slow connection) is optionally tracked
**And** network service has co-located tests

### Story 5.2: Offline Mode Indicator

**As a** tester,
**I want** to see a clear indicator when my device is offline,
**So that** I understand the app is working in offline mode.

**Acceptance Criteria:**

**Given** the device loses network connectivity
**When** viewing any screen
**Then** an offline indicator appears in the app header (per UX11)
**And** indicator is visually distinct (e.g., banner or icon with text)
**And** indicator text reads "Offline" or "No Connection"
**And** indicator disappears when connectivity is restored
**And** indicator does not obstruct critical UI elements
**And** indicator transitions smoothly (fade in/out)
**And** offline state is communicated without causing alarm

### Story 5.3: Local Session Storage (Offline)

**As a** tester,
**I want** to run complete test sessions while offline,
**So that** I can continue testing without network connectivity.

**Acceptance Criteria:**

**Given** the device is offline
**When** the tester runs a test session
**Then** session can be started, recorded, and stopped normally (per FR27)
**And** video recording works fully offline
**And** frame capture continues at configured intervals
**And** all session metadata is stored locally in Redux/AsyncStorage (per FR29)
**And** frame data (images) are stored locally
**And** session appears in History with "Pending sync" indicator
**And** zero data loss occurs during network interruptions (per NFR9)
**And** local storage follows same data model as online sessions

### Story 5.4: Offline Request Queue

**As a** tester,
**I want** backend analysis requests queued when I'm offline,
**So that** frames can be analyzed once I'm back online.

**Acceptance Criteria:**

**Given** a frame is captured while offline
**When** backend analysis would normally run
**Then** the analysis request is queued instead of executed (per FR28)
**And** queue stores: frame data, prompt, backend type, timestamp, session ID
**And** queue is persisted using Redux Persist
**And** queue items maintain order (FIFO)
**And** queue handles multiple sessions' frames
**And** queue size is limited to prevent storage overflow
**And** user can view queue size in Settings or sync status
**And** queue service uses Result<T> pattern

### Story 5.5: Auto-Sync on Connectivity Restore

**As a** tester,
**I want** queued requests automatically synced when I go back online,
**So that** my offline sessions get AI analysis without manual intervention.

**Acceptance Criteria:**

**Given** queued requests exist and device comes online
**When** connectivity is restored
**Then** sync process starts automatically within 5 seconds (per FR31)
**And** queued frames are sent to their respective backends
**And** sync processes requests in order (oldest first)
**And** sync respects rate limits and doesn't flood backends
**And** sync runs in background without blocking UI
**And** sync handles partial failures gracefully (continues with remaining items)
**And** failed requests retry with exponential backoff (per NFR14)
**And** sync completes all queued items systematically

### Story 5.6: Sync Status Indicators

**As a** tester,
**I want** to see sync status for my sessions and queued operations,
**So that** I know what's pending, in progress, and completed.

**Acceptance Criteria:**

**Given** sessions or requests need synchronization
**When** viewing the app
**Then** sync status indicators show: pending, syncing, synced, failed (per FR33, UX10)
**And** session cards in History show sync status badge
**And** a global sync indicator shows when sync is in progress
**And** pending count is visible (e.g., "3 sessions pending sync")
**And** sync progress is shown during active sync (e.g., "Syncing 2/5...")
**And** completed sync shows brief success indicator
**And** failed sync shows error state with retry option
**And** no silent failures - all errors are communicated (per UX12)

### Story 5.7: Session Record Updates After Sync

**As a** tester,
**I want** my session records updated with AI results after sync completes,
**So that** offline sessions show full analysis data.

**Acceptance Criteria:**

**Given** queued frame analyses complete after sync
**When** backend responses are received
**Then** session frame results are updated with backend responses (per FR32)
**And** session result (TRUE/FALSE) is determined from synced frame results
**And** session confidence and latency statistics are calculated
**And** updated sessions are synced to Supabase
**And** History list refreshes to show updated session data
**And** session detail shows full frame-by-frame results
**And** cross-device sync reflects updates within 5 seconds (per NFR13)
**And** local state and Supabase remain consistent

### Story 5.8: Storage Capacity Management

**As a** tester,
**I want** to be warned when local storage is running low,
**So that** I can manage space before it impacts my testing.

**Acceptance Criteria:**

**Given** local storage is being used for offline sessions
**When** storage capacity is checked
**Then** system monitors available storage space (per FR34)
**And** warning is shown when storage drops below threshold (e.g., 100MB)
**And** warning indicates approximate remaining session capacity
**And** Settings screen shows current storage usage
**And** option to clear synced sessions' local data is provided
**And** critical low storage prevents new recordings with clear message
**And** storage service provides `getUsage()`, `clearSyncedData()` functions
**And** storage warnings are non-blocking but visible

### Story 5.9: Session Recovery After Crash

**As a** tester,
**I want** my in-progress session recovered if the app crashes,
**So that** I don't lose work due to unexpected app termination.

**Acceptance Criteria:**

**Given** an app crash occurs during an active session
**When** the app is relaunched
**Then** in-progress session data is recovered from local cache (per NFR12)
**And** recovery check runs on app startup
**And** if recoverable session exists, user is prompted: "Resume session?" or "Discard"
**And** resuming presents the session review screen with captured data
**And** video recorded before crash is preserved (if file was written)
**And** frame results captured before crash are preserved
**And** recovery works for both recording and queued-sync states
**And** no data loss occurs from crash scenario

---

## Epic 6: Results Analysis & Team Collaboration

Testers can analyze results across sessions, compare backend performance, collaborate with team members, and make data-driven decisions.

### Story 6.1: Side-by-Side Backend Comparison

**As a** tester,
**I want** to see all backend responses for each frame side-by-side,
**So that** I can compare how different AI providers analyzed the same image.

**Acceptance Criteria:**

**Given** a session has results from multiple backends
**When** viewing the session comparison view
**Then** frame results from all backends are displayed side-by-side (per FR35)
**And** each backend column shows: result (TRUE/FALSE), confidence, latency
**And** frames are listed chronologically with timestamps
**And** differences between backends are visually highlighted
**And** comparison view is scrollable for sessions with many frames
**And** tapping a frame row expands to show raw response details
**And** comparison is accessible from session detail screen

### Story 6.2: Timing & Performance Data

**As a** tester,
**I want** to see detailed timing data for each backend response,
**So that** I can evaluate which backends are fastest.

**Acceptance Criteria:**

**Given** a session with backend responses
**When** viewing timing data
**Then** latency (total round-trip time) is displayed per frame per backend (per FR36)
**And** timing is shown in milliseconds with appropriate precision
**And** timing data is available in both list and chart format
**And** average, min, max latency is calculated per backend
**And** timing outliers are visually indicated
**And** timing comparison helps identify performance patterns
**And** slow responses (>3000ms) are flagged

### Story 6.3: Confidence Score Display

**As a** tester,
**I want** to see confidence scores from each backend clearly,
**So that** I can evaluate AI certainty levels.

**Acceptance Criteria:**

**Given** backends return confidence scores
**When** viewing results
**Then** confidence scores (0-100%) are displayed for each frame result (per FR37)
**And** confidence is visualized (progress bar, color gradient, or numeric)
**And** low confidence results (<50%) are visually distinct
**And** high confidence results (>80%) are highlighted
**And** average confidence per backend is calculated for session
**And** confidence trends over session duration are visible
**And** raw confidence values are accessible in detail view

### Story 6.4: First TRUE Detection Indicator

**As a** tester,
**I want** to see which backend first detected TRUE with clear visual indicators,
**So that** I can identify the fastest accurate detection.

**Acceptance Criteria:**

**Given** multiple backends analyzed the same frames
**When** viewing session results
**Then** the first TRUE detection is highlighted with visual indicator (per FR38)
**And** indicator shows: backend name, timestamp, frame number
**And** "First TRUE" badge is prominently displayed
**And** time-to-first-TRUE is calculated for each backend
**And** if backends tied on same frame, both are indicated
**And** sessions with no TRUE result show "No TRUE detected"
**And** first TRUE is shown on session card in History list

### Story 6.5: Filter Results by Backend

**As a** tester,
**I want** to filter session results to focus on a specific backend,
**So that** I can analyze one provider's performance in isolation.

**Acceptance Criteria:**

**Given** a session with multiple backend results
**When** applying a filter
**Then** filter dropdown allows selecting specific backend (per FR39)
**And** "All backends" option shows all results
**And** filtered view shows only selected backend's results
**And** filter state is preserved while navigating within session
**And** aggregate statistics update to reflect filtered data
**And** filter is available on comparison and detail views
**And** filter selection is visually indicated

### Story 6.6: Aggregate Session Statistics

**As a** tester,
**I want** to see overall statistics for my session,
**So that** I can quickly assess session performance.

**Acceptance Criteria:**

**Given** a completed session with results
**When** viewing session summary
**Then** aggregate statistics are prominently displayed (per FR40)
**And** statistics include: accuracy rate (based on user rating), average latency, result consistency
**And** consistency metric shows TRUE/FALSE flip count
**And** statistics are calculated per backend for comparison
**And** visual charts/graphs summarize performance
**And** statistics export is available
**And** session-level insights highlight notable patterns

### Story 6.7: Prompt Performance History

**As a** tester,
**I want** to view how a specific prompt performed across multiple sessions,
**So that** I can evaluate prompt effectiveness over time.

**Acceptance Criteria:**

**Given** multiple sessions used the same prompt
**When** viewing prompt performance
**Then** prompt history shows all sessions using that prompt (per FR46)
**And** performance metrics are aggregated: success rate, average confidence, average latency
**And** performance is broken down by backend
**And** timeline shows prompt performance over time
**And** prompt history is accessible from prompt management section
**And** comparisons show if prompt improved or degraded
**And** prompt is linked from session detail

### Story 6.8: Compare Prompt Variations

**As a** tester,
**I want** to compare results from different prompt variations side-by-side,
**So that** I can determine which wording works best.

**Acceptance Criteria:**

**Given** multiple prompts tested on similar scenarios
**When** viewing prompt comparison
**Then** prompt variations are displayed side-by-side (per FR47)
**And** same scenario sessions with different prompts are aligned
**And** success rate per prompt variation is calculated
**And** confidence levels per prompt are compared
**And** comparison highlights statistically significant differences
**And** "Best performing" prompt is indicated
**And** comparison can be exported for documentation

### Story 6.9: Prompt Status Marking

**As a** tester,
**I want** to mark prompts with status labels,
**So that** I can track which prompts work and which need refinement.

**Acceptance Criteria:**

**Given** a prompt exists in the system
**When** marking prompt status
**Then** status options include: Working, Needs Refinement, Experimental, Deprecated (per FR48)
**And** status is visually indicated with color/icon
**And** status is saved to prompt record
**And** status is visible in prompt list and selection
**And** team can see prompt statuses
**And** filtering prompts by status is available
**And** status changes are tracked (optionally with timestamp)

### Story 6.10: Scenario Library & Selection

**As a** tester,
**I want** to select from predefined test scenarios when creating sessions,
**So that** I have structured test cases with clear objectives.

**Acceptance Criteria:**

**Given** the tester is creating a new session
**When** selecting a scenario
**Then** scenario library is accessible with list of predefined scenarios (per FR50, FR53)
**And** each scenario shows: name, description, expected outcome
**And** scenarios cover common vision AI use cases
**And** scenarios include at least: messy room, object detection, person present, etc.
**And** selecting a scenario associates it with the session
**And** scenario selection is optional (custom testing allowed)
**And** scenario library is searchable/filterable

### Story 6.11: Scenario-Specific Guidance

**As a** tester,
**I want** to see guidance and success criteria for each scenario,
**So that** I know how to properly test and evaluate results.

**Acceptance Criteria:**

**Given** a scenario is selected
**When** viewing scenario details
**Then** guidance is displayed explaining what to test (per FR51)
**And** success criteria define what TRUE result means
**And** setup instructions help tester prepare the test
**And** example prompts are suggested for the scenario
**And** common pitfalls or edge cases are documented
**And** guidance is accessible during recording
**And** guidance helps standardize testing across team

### Story 6.12: Backend Performance by Scenario

**As a** tester,
**I want** to see which backends perform best for specific scenarios,
**So that** I can choose the optimal backend for production use.

**Acceptance Criteria:**

**Given** multiple sessions exist for a scenario
**When** viewing scenario analytics
**Then** backend performance is ranked for that scenario (per FR52)
**And** ranking considers: accuracy, confidence, latency
**And** "Best backend" recommendation is highlighted
**And** performance data includes sample size (number of sessions)
**And** confidence interval or reliability indicator is shown
**And** trend over time is available (if sufficient data)
**And** analytics help inform backend selection decisions

### Story 6.13: Filter History by Scenario

**As a** tester,
**I want** to filter session history by scenario type,
**So that** I can focus on specific test categories.

**Acceptance Criteria:**

**Given** sessions are associated with scenarios
**When** filtering History list
**Then** scenario filter dropdown is available (per FR54)
**And** filter options include all scenarios plus "No scenario"
**And** filtered list shows only matching sessions
**And** filter can be combined with other filters (backend, date)
**And** filter selection is visually indicated
**And** "Clear filters" option resets to show all
**And** empty results show helpful message

### Story 6.14: Share Session via Link

**As a** tester,
**I want** to share session results with team members via a unique link,
**So that** others can view my test results.

**Acceptance Criteria:**

**Given** a completed session exists
**When** sharing the session
**Then** a unique shareable link is generated (per FR55)
**And** link is copied to clipboard or shared via native share sheet
**And** link opens session detail in app (deep link)
**And** link works for other team members with app installed
**And** shared session shows all results, video, notes
**And** link respects team access permissions via Supabase RLS
**And** share button is accessible from session detail

### Story 6.15: View Team Results

**As a** tester,
**I want** to see test sessions from other team members,
**So that** I can learn from their testing and avoid duplicating work.

**Acceptance Criteria:**

**Given** team members have run sessions
**When** viewing History list
**Then** sessions from all team members are visible (per FR57)
**And** session cards indicate who created the session
**And** real-time updates show new team sessions via Supabase Realtime (per NFR22)
**And** team sessions sync within 5 seconds (per NFR13)
**And** filtering by "My sessions" vs "Team sessions" is available
**And** device name helps identify session origin
**And** team visibility respects Supabase row-level security

### Story 6.16: Shared Prompt Library

**As a** tester,
**I want** access to a team-shared prompt library,
**So that** I can reuse proven prompts and share my own.

**Acceptance Criteria:**

**Given** the team uses various prompts
**When** accessing the prompt library
**Then** shared prompts from team are visible (per FR59)
**And** prompts can be marked as "shared" or "private"
**And** shared prompts include creator name
**And** prompts can be copied to current session
**And** performance data is shown for shared prompts
**And** new prompts can be added to shared library
**And** real-time sync keeps library current

### Story 6.17: Team Aggregate Insights

**As a** tester,
**I want** to see aggregate analytics across all team testing,
**So that** I can understand overall testing trends and insights.

**Acceptance Criteria:**

**Given** the team has completed multiple sessions
**When** viewing team insights
**Then** aggregate statistics across all team sessions are displayed (per FR60)
**And** metrics include: total sessions, backend distribution, success rates
**And** insights show which backends perform best overall
**And** insights highlight most tested scenarios
**And** trend data shows testing volume over time
**And** top performing prompts are highlighted
**And** insights help inform team decisions

### Story 6.18: Export Session Results

**As a** tester,
**I want** to export session results data,
**So that** I can analyze results in external tools or share with stakeholders.

**Acceptance Criteria:**

**Given** a completed session exists
**When** exporting results
**Then** export option is available on session detail (per FR42)
**And** export formats include: JSON, CSV
**And** exported data includes: session metadata, frame results, timing, confidence
**And** export file is downloadable or shareable
**And** bulk export of multiple sessions is available
**And** export respects data privacy (no credentials)
**And** export success/failure is communicated to user
