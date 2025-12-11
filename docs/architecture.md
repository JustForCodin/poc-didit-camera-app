---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - docs/prd.md
workflowType: 'architecture'
lastStep: 3
project_name: 'poc-didit-camera-app'
user_name: 'Oleksii'
date: '2025-12-11'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

The application defines 60 functional requirements across 8 capability areas:

1. **Session Management & Testing Workflow (9 FRs)**: Create/configure test sessions, start/stop recording, auto-stop on TRUE detection, session history management
2. **Camera & Media Capture (8 FRs)**: Continuous video recording, frame extraction at configurable intervals, dual-capture mode, H.264 compression, permission management
3. **Backend Integration & Response Management (9 FRs)**: Concurrent frame sending to multiple backends, authentication handling (email/password for DiditCamera, API keys for Gemini/Claude), retry logic, graceful failure handling
4. **Offline Mode & Data Synchronization (8 FRs)**: Complete offline operation, request queueing, automatic sync on connectivity restore, local storage management
5. **Results Analysis & Comparison (8 FRs)**: Side-by-side backend comparison, timing/latency data, confidence scores, performance filtering and analytics
6. **Prompt Management & Iteration (7 FRs)**: Custom prompt creation, variation testing, performance tracking, prompt library
7. **Scenario Management (5 FRs)**: Predefined test scenarios, scenario-specific guidance, performance mapping by scenario
8. **Collaboration & Team Features (6 FRs)**: Session sharing, team notes, cross-device visibility via Supabase, shared prompt library

**Architecturally significant patterns:**
- Multi-backend abstraction requiring normalized response handling across diverse API schemas
- Real-time concurrent operations (video recording + frame capture + upload) without UI blocking
- Local-first data model with optimistic updates and background synchronization
- Team collaboration requiring real-time subscriptions and conflict resolution

**Non-Functional Requirements:**

Critical NFRs that will drive architectural decisions:

**Performance:**
- Frame capture latency < 50ms (camera responsiveness)
- Frame upload + AI response < 3000ms (real-time feel)
- Video playback start < 500ms (instant review)
- History list load < 200ms for first 20 items
- Video compression < 5 seconds for 60-second recording
- Support 1-5 FPS frame capture without video degradation

**Reliability:**
- Zero data loss during network interruptions (offline queueing)
- Perfect frame/video timestamp synchronization for overlay playback
- Individual backend failures cannot block session continuation
- Session recovery after app crashes
- 100% cross-device session visibility with < 5 second sync latency

**Security:**
- Credential encryption at rest (iOS Keychain, Android Keystore)
- HTTPS/TLS 1.2+ for all external communication
- No plain-text credential logging
- Team-level access control via Supabase row-level security

**Integration:**
- Multi-backend abstraction layer normalizing DiditCamera, Gemini, Claude, Mock responses
- Hot-swappable backends within single session
- Concurrent backend requests without mutual blocking
- Exponential backoff retry logic
- Real-time Supabase subscriptions for team collaboration

**Maintainability:**
- New backends addable via < 200 lines implementing standard interface
- Configuration-driven endpoints/timeouts/intervals
- Mock backend for UI development without live APIs
- Cross-platform parity (no iOS/Android exclusive features)

### Scale & Complexity

**Project Classification:**
- **Technical Type:** Mobile App (React Native)
- **Domain:** General (Internal Testing Tool)
- **Complexity:** Medium
- **Project Context:** Greenfield

**Complexity Assessment:**

The project achieves Medium complexity through technical challenges rather than domain-specific regulations:

**Technical Complexity Drivers:**
- Multi-backend abstraction layer normalizing diverse API responses
- Real-time camera frame capture at configurable intervals (500-5000ms)
- Concurrent video recording with H.264 compression to 720p
- Frame upload + AI analysis within 3-second target latency
- Offline queueing with automatic sync when connectivity restores
- Cross-platform React Native implementation (iOS/Android)

**Low Regulatory Complexity:**
- Internal testing tool (< 10 testers)
- No HIPAA, GDPR, PCI-DSS, or industry-specific compliance
- Anonymous authentication (no personal account creation)
- TestFlight/Internal Track distribution (no public app store review)

**Estimated Architectural Components:** 8-12 major components
- Camera/Video capture module
- Backend abstraction layer (with 4 backend adapters)
- Offline queue manager
- Supabase sync engine
- Session management
- Video playback/timeline overlay
- Settings/credential management
- UI/navigation framework

### Technical Constraints & Dependencies

**Platform Constraints:**
- **React Native:** Must maintain compatibility with stable RN versions
- **iOS 13+:** Required for modern camera and video APIs
- **Android 8.0+ (API 26):** Required for camera2 API support
- **Native modules required:**
  - React Native Camera (frame capture + video recording)
  - React Native Video (playback with precise frame control)
  - File system access for local storage
  - Network state detection for offline/online transitions

**Backend API Dependencies:**
- DiditCamera: Email/password authentication, proprietary response format
- Gemini Vision: API key authentication, Google-specific JSON schema
- Claude (Anthropic): API key authentication, Anthropic response format
- Each backend has different rate limits, timeout characteristics, and confidence scoring formats

**Storage Constraints:**
- Local storage target: < 1GB total (approximately 50-100 session videos)
- Video compression: < 20KB per second target (720p H.264)
- Warn users before storage overflow to prevent mid-session failures

**Network Assumptions:**
- Intermittent connectivity expected (mobile testing environment)
- Must function 100% offline for core testing workflow
- Background uploads may be restricted on iOS (ensure completion before app backgrounds)

### Cross-Cutting Concerns Identified

**Performance Optimization:**
- Memory management: Release captured frames after upload to prevent bloat during long sessions
- Concurrent operations: Video recording + frame capture + uploads must run in parallel without degradation
- Battery efficiency: Camera + video + uploads are battery-intensive (consider low-power warnings)

**Error Resilience:**
- Individual backend failures cannot block testing (resilient multi-backend approach)
- Failed frame uploads retry once before queueing for later sync
- Session recovery after crashes using local cache
- Video validation before marking session complete

**Data Synchronization:**
- Local-first architecture: Write to local storage first, sync asynchronously
- Optimistic updates: Update local DB immediately, background sync to Supabase
- Conflict resolution: Last-write-wins for session metadata across devices
- Real-time subscriptions: Live updates when teammates complete sessions

**Security:**
- Credential protection: Encryption at rest, secure transmission, no plain-text logging
- Team-level access: Shared workspace model with row-level security
- Credential synchronization: Backend credentials shared across all team devices via Supabase

**Maintainability:**
- Backend abstraction: Standardized interface for adding new vision AI backends
- Separation of concerns: Camera, video, networking, storage in separate modules
- Configuration-driven: Avoid hardcoding endpoints, timeouts, intervals

## Starter Template Evaluation

### Technical Preferences Established

**Language & Framework:**
- TypeScript for type safety and better developer experience
- Expo Router for file-based routing
- React Native via Expo for cross-platform mobile development

**Styling:**
- Styled Components for component-level styling

**State Management:**
- Redux Toolkit for global state management
- Optimized for offline-first architecture with Redux Persist

**Backend & Services:**
- Supabase for backend, authentication, real-time sync, and storage
- Expo EAS for managed builds and distribution

**Development Context:**
- Team is learning React Native/Expo while building
- Internal testing tool (< 10 users)
- TestFlight/Internal Track distribution

### Primary Technology Domain

**Mobile App (React Native with Expo)** based on project requirements for cross-platform iOS/Android camera application with offline-first architecture.

### Starter Options Considered

**1. create-expo-stack (Selected)**
- Interactive CLI with TypeScript, Expo Router, and Supabase configuration
- Clean foundation for adding custom preferences (Redux Toolkit, Styled Components)
- Learning-friendly with minimal opinionation
- Command: `npx create-expo-stack@latest`

**2. Obytes Starter (Evaluated)**
- Production-ready with comprehensive CI/CD and testing infrastructure
- Uses TailwindCSS (NativeWind) and Zustand instead of preferred stack
- Excellent for production but less suitable for learning with specific preferences

**3. Official Expo CLI (Evaluated)**
- Minimal blank TypeScript template
- Maximum flexibility but requires manual configuration of all features
- More setup overhead than create-expo-stack

**4. React Native Community CLI (Evaluated)**
- Bare React Native without Expo managed workflow
- Increased complexity, not ideal for learning or rapid development

### Selected Starter: create-expo-stack

**Rationale for Selection:**

create-expo-stack provides the optimal balance for this project:

1. **Learning-Friendly Setup:** Interactive CLI guides through configuration choices, making it easier to understand each decision while learning React Native/Expo
2. **Matches Core Preferences:** Configures TypeScript, Expo Router, and Supabase during initialization
3. **Flexibility for Custom Stack:** Provides clean foundation to add Redux Toolkit and Styled Components without removing conflicting opinionated choices
4. **Modern Best Practices:** Maintained by the community with current Expo SDK support
5. **Supabase Integration:** Built-in Supabase configuration option saves setup time for backend integration

**Initialization Command:**

```bash
npx create-expo-stack@latest poc-didit-camera-app
```

**Interactive Options to Select:**
- Navigation: **Expo Router** (file-based routing)
- TypeScript: **Yes**
- Supabase: **Yes** (for backend integration)
- Styling: Select default or none (we'll add Styled Components manually)

**Post-Initialization Setup:**

After initialization, manually add:
```bash
# Redux Toolkit for state management
npm install @reduxjs/toolkit react-redux redux-persist

# Styled Components for styling
npm install styled-components
npm install -D @types/styled-components-react-native
```

### Architectural Decisions Provided by Starter

**Language & Runtime:**
- TypeScript with strict mode configuration
- Latest Expo SDK with managed workflow
- Node.js package management (npm/yarn/pnpm support)

**Project Structure:**
- File-based routing via Expo Router (`app/` directory)
- TypeScript path aliases for clean imports
- Environment variable configuration via `app.config.ts`

**Build Tooling:**
- Metro bundler for React Native
- Expo EAS Build configuration for iOS/Android
- TypeScript compilation and type checking
- Fast Refresh for development

**Supabase Integration:**
- Supabase client initialization
- Environment variables for Supabase URL and anon key
- Authentication helpers (to be extended for anonymous auth)
- Real-time subscription setup patterns

**Development Experience:**
- Expo Go app support for rapid testing
- Development builds for native module testing
- Hot reloading during development
- TypeScript IntelliSense and autocomplete

**Code Organization:**
- Feature-based structure via Expo Router
- Separation of screens (`app/`), components, utilities
- Type definitions in dedicated files
- Configuration-driven setup

**Additional Manual Setup Required:**

1. **Redux Toolkit Integration:**
   - Configure store with Redux Toolkit
   - Set up Redux Persist for offline-first architecture
   - Create slices for sessions, backends, settings, queue
   - Integrate with React components via hooks

2. **Styled Components Setup:**
   - Configure styled-components for React Native
   - Create theme provider for consistent styling
   - Define base components and design system
   - Set up TypeScript types for theme

3. **Camera/Video Capabilities:**
   - Install `react-native-vision-camera` or `expo-camera`
   - Install `expo-av` for video playback
   - Configure permissions for iOS/Android
   - Set up native module in EAS Build

4. **Offline Queue & Sync:**
   - Configure Redux Persist with AsyncStorage
   - Implement network state detection (`@react-native-community/netinfo`)
   - Build offline queue middleware for Redux
   - Set up Supabase real-time subscriptions

**Note:** Project initialization using this command should be the first implementation story in the development phase.
