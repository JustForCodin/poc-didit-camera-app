---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11]
inputDocuments:
  - docs/00_context/project_brief.md
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 0
  projectDocs: 0
workflowType: 'prd'
lastStep: 11
project_name: 'poc-didit-camera-app'
user_name: 'Oleksii'
date: '2025-12-11'
completedAt: '2025-12-11'
---

# Product Requirements Document - poc-didit-camera-app

**Author:** Oleksii
**Date:** 2025-12-11

## Executive Summary

**poc-didit-camera-app** is an internal testing platform that enables systematic evaluation and comparison of multiple vision AI backends (DiditCamera, Gemini Vision, Anthropic Claude) before integration into Sprout. The app provides a mobile environment where testers can run identical visual scenarios against different AI backends, capturing both real-time frame analysis and complete video recordings for comprehensive review.

### Vision & Purpose

Before committing to a vision AI backend for Sprout, the team needs empirical answers to critical questions: What can each backend reliably detect? How fast does it respond? How well-calibrated is its confidence scoring? Which prompt formulations produce stable, consistent results?

This app transforms backend evaluation from guesswork into a systematic discovery process. Testers capture camera sessions with custom prompts, receive real-time AI analysis overlaid on the preview, and build a shared repository of test results that reveals patterns, strengths, and weaknesses across backends.

### Target Users

Internal testing team (< 10 testers) who need to:
- Run controlled vision AI evaluation sessions
- Compare backend performance on identical visual inputs
- Validate AI accuracy against ground truth observations
- Discover reliable prompt formulations for production use
- Share findings and collaborate on benchmarking decisions

### What Makes This Special

This app delivers three interlocking capabilities that transform AI backend evaluation:

**1. Resilient Testing Infrastructure**
No single point of failure blocks evaluation work. If one backend experiences downtime or rate limits, testing continues with other backends. The app provides a 24/7 testing path independent of any single provider's availability, ensuring evaluation velocity isn't blocked by external dependencies.

**2. Collaborative Benchmarking**
All session data is shared across the team in real-time. When any tester runs a session, everyone sees the results, accuracy markings, and notes. This transforms isolated testing into collective learning—patterns emerge across multiple testers' observations, and the team builds shared understanding of what works and what doesn't.

**3. Prompt Engineering Loop**
The app enables systematic discovery of which prompt formulations produce stable, consistent results. Testers can retry sessions with refined prompts, compare results across backends using the same question, and review video playback to understand exactly why a prompt succeeded or failed. This iterative refinement process identifies production-ready prompt patterns for Sprout integration.

### The Key Insight

**"We can't integrate vision AI into Sprout blindly—we need empirical data on what each backend reliably detects, how it responds under real conditions, and which prompt strategies work consistently."**

The dual-capture approach (real-time frames for AI analysis + video recording for review) means decisions can be verified in context. The auto-stop feature captures the exact moment when AI detects a target condition, preserving the "success moment" in video for validation and learning.

## Project Classification

**Technical Type:** Mobile App (React Native)
**Domain:** General (Internal Testing Tool)
**Complexity:** Medium
**Project Context:** Greenfield - new project

### Classification Rationale

**Mobile App Architecture:**
- React Native cross-platform implementation (iOS/Android)
- Native device capabilities: camera access, video recording, local storage
- Real-time frame capture and processing pipeline
- Supabase backend for shared data and anonymous authentication

**Medium Technical Complexity:**
- Multi-backend abstraction layer normalizing diverse API responses
- Real-time camera frame capture at configurable intervals (500-5000ms)
- Concurrent video recording with H.264 compression to 720p
- Frame upload + AI analysis within 3-second target latency
- Offline queueing with automatic sync when connectivity restores

**General Domain (Low Regulatory Complexity):**
- Internal testing tool with no regulatory requirements
- Small team usage (< 10 testers) with shared anonymous authentication
- No HIPAA, GDPR, PCI-DSS, or industry-specific compliance needs
- Standard software security practices (HTTPS, secure credential storage)

The primary challenges are **technical** (backend abstraction, real-time processing, video handling) rather than **domain-specific** (compliance, regulations, specialized knowledge). This allows focus on building robust comparison infrastructure without navigating complex regulatory landscapes.

## Success Criteria

### User Success

Testers achieve success when they can confidently answer critical questions about vision AI backend integration. Success manifests in three key outcomes:

**1. Confident Backend Selection**
Testers have sufficient empirical data to recommend which backend(s) to integrate into Sprout with confidence. This means understanding not just "which is best overall" but which backend excels at which types of visual detection tasks.

**2. Reliable Prompt Discovery**
Testers identify prompt formulations that produce stable, consistent results across backends. Through iterative testing and video review, they discover production-ready prompt patterns that work reliably in real-world conditions.

**3. Scenario-Specific Performance Mapping**
Testers build a clear understanding of where each backend excels and where it fails. This creates a performance map that guides integration decisions based on Sprout's actual use cases.

**User Experience Success Indicators:**
- Complete test session cycle in < 2 minutes (from start to save)
- Real-time feedback within 3 seconds per frame
- Seamless backend switching within single app session
- Instant session history and video review (< 1-2 seconds)
- Confident accuracy assessments (> 90% of sessions rated definitively as Correct/Incorrect, not Ambiguous)

### Business Success

**At 3 Months:**
- Team has comprehensive scenario coverage across all predefined test cases
- Clear winner identified for specific use cases (which backend for which detection task)
- Library of validated, production-ready prompts documented and ready for Sprout integration
- Data-backed recommendation on backend selection completed

**At 12 Months:**
- Ongoing evaluation capability for new backends as they emerge
- Continuous prompt refinement supporting Sprout feature evolution
- Historical benchmark data tracking backend improvements and regressions over time
- Platform supports iterative testing as Sprout's vision AI requirements expand

**Key Business Metrics:**
- **Scenario Coverage:** All 7 predefined scenarios tested across all 3 backends
- **Backend Performance Map:** Clear documentation of which backend excels at which visual detection tasks
- **Prompt Library:** Collection of stable, validated prompt formulations for production use
- **Decision Confidence:** Team consensus on backend selection backed by empirical data

### Technical Success

**Performance Targets:**
- Frame capture latency < 50ms (camera remains responsive)
- Frame upload + AI response < 3000ms (maintains real-time feel during recording)
- Video playback starts < 500ms after tap (instant review)
- History list loads < 200ms for first 20 items (snappy navigation)
- Video compression completes < 5 seconds for 60-second recording

**Reliability Requirements:**
- Sessions continue recording despite individual frame upload failures
- Offline queueing functions seamlessly with automatic sync when connectivity restores
- Backend API errors handled gracefully without app crashes
- 100% cross-device session visibility (all team members see all test results in real-time)
- Failed frame uploads retry once before marking as failed

**Data Integrity:**
- Every frame logs latency for accurate backend comparison
- Video and frame data perfectly synchronized for overlay playback
- Compressed videos achieve < 20KB per second (storage efficiency)
- No data loss during network interruptions (queueing and sync work correctly)
- Raw backend responses captured for post-analysis

### Measurable Outcomes

| Metric | Target | Validates |
|--------|--------|-----------|
| Complete test session time | < 2 minutes (start to save) | User efficiency |
| Frame capture to result display | < 3 seconds | Real-time feedback quality |
| Backend switching | Within single app session | Testing flexibility |
| History list load time | < 1 second (first 20 items) | Review experience |
| Video playback start | < 2 seconds | Analysis workflow |
| Cross-device session visibility | 100% | Collaborative capability |
| Sessions rated definitively | > 90% (Correct/Incorrect vs Ambiguous) | Data quality for decisions |
| Scenario coverage | 100% (all 7 scenarios × 3 backends) | Comprehensive evaluation |

## Product Scope

### MVP - Minimum Viable Product

**Core Testing Capability (Must Work Day 1):**

**User Story 1: Run a Vision Test Session (P1)**
- Capture camera frames at configurable intervals (default 1000ms, range 500-5000ms)
- Send frames to selected backend with custom prompt
- Display live AI results overlaid on camera preview
- Record video during entire session
- Auto-stop recording 1 second after AI returns first "true" result
- Manual stop capability at any time
- Session review screen (save, discard, retry options)

**User Story 2: Select and Switch Between Backends (P1)**
- Backend picker on camera screen
- Switch between DiditCamera, Gemini, Claude, and Mock backends
- Prompt to configure if backend not set up

**User Story 3: Configure Backend Credentials (P1)**
- Settings screen with backend configuration
- DiditCamera: email/password login form
- Gemini/Claude: API key input
- Backend status indicators (Active/Inactive)
- Credentials shared across all team devices via Supabase

**User Story 25: Custom Prompts (P1)**
- Free-form prompt input on camera screen
- Prompt persists across backend switches for comparison

**MVP Scope Rationale:**
Without these four capabilities, the app cannot fulfill its basic purpose: running test sessions, comparing backends, and capturing results. This is the minimum to start generating comparison data.

### Growth Features (Post-MVP)

**Collaborative Benchmarking & Review (P2):**

**User Story 4: Review Session History**
- History tab showing all past sessions across team
- Session cards with summary info (backend, result, timestamp, duration, device name)
- Filter by backend, scenario, accuracy marking
- Sort by date, backend, or accuracy

**User Story 5: View Session Details with Video Playback**
- Video player with recorded session
- AI results overlaid at each frame timestamp
- Frame timeline with tap-to-jump navigation
- Session metadata display (prompt, backend, duration, frame count, average latency)

**User Story 6: Rate Session Accuracy**
- Accuracy rating options: Correct, Incorrect, Ambiguous
- Ratings persist and display on both detail and list views
- Update rating capability

**Configuration & Settings (P2):**
- Configure default frame capture interval
- Set device name for test attribution
- Mock backend for UI development

**Growth Scope Rationale:**
These features transform the tool from basic recording into a collaborative discovery platform. History, playback, and accuracy marking enable the team to build shared understanding and make data-driven decisions. Essential for achieving business success metrics, but MVP can function without them initially.

### Vision (Future)

**Enhanced Testing Workflow (P3):**

**User Story 7: Predefined Test Scenarios**
- 7 predefined scenarios with standard prompts
- Scenario picker auto-fills prompt field
- Remote scenario updates without app release

**User Story 8: Add Tester Notes**
- Free-form notes on session details
- Capture observations not reflected in AI results

**User Story 9: Retry with Different Backend**
- One-tap retry from session detail
- Pre-fill same prompt, switch backend
- Direct A/B comparison workflow

**Additional Settings (P3):**
- Clear local cache
- Delete sessions from history

**Advanced Features (Out of Scope for POC):**
- Reference image management UI
- Multi-frame context (before/after comparison)
- Batch testing mode (automated scenario runs)
- Automated accuracy scoring against ground truth
- CSV export / analytics dashboard
- Side-by-side comparison view
- WebSocket real-time mode for DiditCamera
- Performance analytics and trending

**Vision Scope Rationale:**
These features improve testing consistency and workflow efficiency but aren't required for initial backend evaluation. They can be prioritized based on actual usage patterns and team feedback after Growth features are validated.

## User Journeys

### Journey 1: Alex Chen - First Test Session & Backend Discovery

**Opening Scene: The Assignment**

Alex Chen, a QA engineer on the Sprout team, receives a challenging assignment from the product lead: "We need to integrate vision AI for detecting room tidiness, but we have three backend options—DiditCamera, Gemini, and Claude. Which one should we use?" Alex has done manual testing before, taking photos and sending them to different APIs, but comparing results across backends has always been messy. Different test runs use different prompts, screenshots get lost, and there's no systematic way to track what actually works.

The team needs a recommendation in three months, backed by data. Alex downloads the poc-didit-camera-app on their iPhone, hoping this structured approach will finally bring clarity.

**Rising Action: Configuration & First Session**

Opening the app for the first time, Alex is greeted by a clean Camera screen with a backend picker showing "No backend selected." They tap Settings and see three backends waiting to be configured: DiditCamera, Gemini, and Claude. Alex starts with DiditCamera, entering the team's shared email and password. The backend status immediately changes to "Active" with a green indicator.

Back on the Camera screen, Alex selects DiditCamera from the backend picker and types their first prompt: "Is this room messy? Check if items are scattered on the floor or surfaces." They point their phone at their deliberately messy home office—papers scattered on the desk, a backpack on the floor, shoes by the door. Perfect test scenario.

Alex taps "Start" and watches the magic happen. The camera preview shows live, with "FALSE" appearing as an overlay every second as frames are captured. After 8 seconds, enough items are visible that the AI suddenly returns "TRUE" with 85% confidence. The overlay turns green, and exactly one second later (capturing that "success moment"), the recording auto-stops.

**Climax: The Review Revelation**

The review screen appears instantly, showing the recorded video. Alex taps "Play" and watches the session unfold with AI results overlaid at each frame timestamp. They can see exactly when and why the AI changed its answer—the moment enough mess entered the frame. This is completely different from their old workflow of manually comparing static screenshots.

Alex taps "Save" and the session is stored. The entire process—from start to save—took under 90 seconds. They immediately open History and see their first session listed with all metadata: DiditCamera backend, TRUE result, 9-second duration, 9 frames captured.

**Resolution: Building Momentum**

For the first time, Alex feels like they're running a real experiment instead of ad-hoc testing. They can see the exact AI behavior, replay the video to understand decisions, and all the data is automatically organized. Tomorrow, they'll run the same test with Gemini and Claude to start building their comparison dataset.

More importantly, when Alex checks History on their iPad later that evening, they see not just their own session but also three sessions from their teammate Vitalii who tested the "dirty sink" scenario with all three backends. The collaborative benchmarking is already happening.

**This journey reveals requirements for:**
- Backend credential configuration
- Real-time camera capture with live AI overlays
- Auto-stop functionality that captures the "success moment"
- Video recording with synchronized frame analysis
- Session review with video playback
- Cross-device session visibility
- History tracking with filtering

### Journey 2: Alex Chen - Systematic Backend Comparison

**Opening Scene: The Comparison Challenge**

Two weeks into testing, Alex has a problem. They've run dozens of sessions, but the prompts vary slightly each time, making it hard to do fair comparisons. Yesterday's Gemini test used "Is this room tidy?" while today's Claude test used "Is this room messy?"—opposite questions that produce opposite results. How can they compare accuracy when they're not even asking the same question?

Alex decides to run a systematic comparison: same room setup, same prompt, all three backends, back-to-back.

**Rising Action: The Controlled Experiment**

Alex sets up their office in a deliberately "borderline messy" state—a few items on the desk, one shoe on the floor, but not completely chaotic. This ambiguous scenario will reveal which backend is most confident in its assessment.

They open the app and craft a careful prompt: "Is this room messy? Check if items are scattered on the floor or surfaces." They type it into the prompt field, select DiditCamera, and tap Start. The session runs, capturing the scene. Result: TRUE (room is messy), confidence 72%, auto-stopped after 11 seconds.

Here's where the app shines: Alex doesn't need to re-type the prompt. They simply tap the backend picker, switch to Gemini, and tap Start again. The prompt persists automatically. Same room, same question, different backend. Result: FALSE (room is NOT messy), confidence 68%, manually stopped after 15 seconds (never reached TRUE threshold).

Alex switches one more time to Claude. Result: TRUE (room is messy), confidence 81%, auto-stopped after 8 seconds.

**Climax: The Pattern Emerges**

Opening History, Alex now has three sessions stacked together, all with the same prompt timestamp. They can filter by backend and see the pattern immediately:

- **DiditCamera**: TRUE, 72% confidence, 11 seconds
- **Gemini**: FALSE, 68% confidence, 15 seconds
- **Claude**: TRUE, 81% confidence, 8 seconds

For this borderline messy scenario, Gemini disagrees with the other two and has lower confidence. Alex taps each session to review the videos. In Gemini's video, they notice the AI waffled between TRUE and FALSE several times before settling on FALSE—the frame timeline shows the flip-flopping clearly.

**Resolution: Data-Driven Insights**

Alex marks all three sessions with accuracy ratings:
- DiditCamera: "Correct" (room was indeed messy)
- Gemini: "Incorrect" (wrong assessment)
- Claude: "Correct" (and fastest to decide)

This single systematic test reveals something important: for ambiguous "borderline messy" scenarios, Claude appears more decisive and accurate. Alex adds a note to Claude's session: "Best for ambiguous scenarios? High confidence, fast decision." They share the insight in Slack, and within an hour, two teammates have run similar borderline tests and confirmed the pattern.

The shared history means everyone sees everyone's results. Patterns emerge not from one tester's hunches, but from collective observation. Alex is building the backend performance map they need for the final recommendation.

**This journey reveals requirements for:**
- Prompt persistence across backend switches
- Quick backend switching for A/B comparison
- Session filtering by backend
- Accuracy marking (Correct/Incorrect/Ambiguous)
- Video playback showing frame-by-frame AI behavior
- Notes capability for capturing insights
- Collaborative filtering and pattern detection

### Journey 3: Alex Chen - Prompt Refinement & Team Decision

**Opening Scene: The Confidence Problem**

One month into testing, Alex reviews the aggregated data and notices a troubling pattern. The prompt "Is this room messy?" works well for DiditCamera and Claude, but Gemini consistently returns low confidence scores (55-70%) even when it's correct. Meanwhile, the prompt "Does this room appear tidy and organized?" seems to produce higher confidence from Gemini but lower confidence from Claude.

The team needs stable prompts that work reliably across all backends. Alex decides to systematically test prompt variations to find the "Goldilocks prompt" that produces consistent high-confidence results.

**Rising Action: The Prompt Engineering Loop**

Alex opens History and filters to their "room tidiness" sessions. They have 47 sessions across all backends now. Looking at the session list, they spot a session from last week where they accidentally used a more detailed prompt: "Is this room messy? Check if items are scattered on the floor or surfaces." That session with Claude had 91% confidence—much higher than the simple version.

This is the refinement loop the app enables. Alex can see what prompt was used in every session, review the video to see how the AI responded, and iterate. They decide to test three prompt variations across all three backends:

1. Simple: "Is this room messy?"
2. Detailed: "Is this room messy? Check if items are scattered on the floor or surfaces."
3. Explicit: "Answer with TRUE if this room is messy (items scattered) or FALSE if tidy."

Over the next two days, Alex runs 9 sessions (3 prompts × 3 backends) in identical room conditions. They carefully mark accuracy for each and note the confidence scores.

**Climax: The Winning Prompt**

The data tells a clear story. The Detailed prompt (variation 2) produces:
- **DiditCamera**: 89% average confidence, 95% accuracy
- **Gemini**: 84% average confidence, 90% accuracy
- **Claude**: 91% average confidence, 100% accuracy

This prompt is production-ready. It works consistently across all backends with high confidence and accuracy. Alex documents it in a shared note and pins it in Slack: "Use this prompt for room tidiness detection."

But there's more. Looking at the full History data (now over 150 sessions from the whole team), Alex filters by "Correct" accuracy markings and exports the patterns. A clear backend recommendation emerges:

- **Claude**: Best for ambiguous/borderline scenarios (highest confidence, fastest detection)
- **DiditCamera**: Best for clear-cut scenarios (fastest response time, < 2.5s average latency)
- **Gemini**: Acceptable backup but lower confidence in general

**Resolution: The Confident Recommendation**

Three months after starting, Alex prepares the final report for the product team. They don't just say "use Claude"—they provide nuanced guidance:

- Primary integration: **Claude** for production (highest accuracy and confidence across scenarios)
- Backup: **DiditCamera** for performance-critical paths (lowest latency)
- Validated prompts: Library of 12 tested, high-confidence prompt formulations ready for Sprout integration

The team makes the decision confidently, backed by 200+ test sessions, video evidence, and systematic A/B comparisons. When they integrate Claude into Sprout two weeks later, the prompts work flawlessly in production because they've already been battle-tested.

Alex reflects on the transformation: three months ago, backend selection felt like guesswork. Today, it's data-driven science. The app didn't just help them test—it helped them learn, collaborate, and make confident decisions as a team.

**This journey reveals requirements for:**
- Session history with comprehensive filtering
- Prompt visibility in all session records
- Accuracy marking and aggregate analysis
- Video playback for understanding AI behavior patterns
- Team-wide visibility for pattern detection
- Notes and documentation capability
- Systematic retry capability for prompt iteration
- Performance metrics (latency, confidence, accuracy) tracking

### Journey Requirements Summary

These three journeys reveal the complete capability set needed for the app:

**Core Testing Infrastructure:**
- Backend configuration and credential management
- Real-time camera capture at configurable intervals
- Live AI result overlays during recording
- Video recording with frame synchronization
- Auto-stop functionality on TRUE result (+ 1 second)
- Manual stop capability
- Session save/discard workflow

**Comparison & Analysis:**
- Prompt persistence across backend switches
- Quick backend switching within session
- Session history with filtering (backend, accuracy, date)
- Video playback with frame timeline
- Accuracy marking (Correct/Incorrect/Ambiguous)
- Performance metrics (latency, confidence, frame count)

**Collaborative Learning:**
- Cross-device session visibility (100% sharing)
- Device name attribution for tracking testers
- Notes capability for insight capture
- Aggregate pattern detection across team sessions
- Systematic retry with different backends/prompts

## Mobile App Specific Requirements

### Project-Type Overview

poc-didit-camera-app is built as a **React Native cross-platform mobile application** targeting iOS and Android devices. The choice of React Native enables rapid development with a single codebase while maintaining access to critical native device capabilities (camera, video recording, local storage) required for vision AI evaluation.

As an internal testing tool with a small team (< 10 users), the app prioritizes functionality and developer velocity over platform-specific optimizations. The focus is on delivering robust backend comparison capabilities rather than consumer-grade polish.

### Platform Requirements

**Cross-Platform Strategy:**
- **Framework:** React Native (single codebase for iOS and Android)
- **Minimum iOS Version:** iOS 13+ (for modern camera and video APIs)
- **Minimum Android Version:** Android 8.0 (API level 26) for modern camera2 API support
- **Target Devices:** Modern smartphones with rear cameras (iPhone 8+, Android equivalents)
- **Tablet Support:** Optional but beneficial for larger preview screens during testing

**Native Module Requirements:**
- React Native Camera library for frame capture and video recording
- React Native Video for session playback with precise frame control
- File system access for local video storage and offline queueing
- Network state detection for offline/online mode transitions

### Device Permissions

**Required Permissions (Critical for Core Functionality):**

| Permission | Platform | Justification | User-Facing Description |
|------------|----------|---------------|-------------------------|
| Camera | iOS, Android | Frame capture and video recording during test sessions | "Camera access is required to capture frames for AI analysis" |
| Photo Library / Storage | iOS, Android | Save compressed videos and manage local cache | "Storage access is needed to save session videos and manage offline data" |
| Network State | Android | Detect offline mode and trigger sync when connectivity restores | Background permission, no user prompt needed |

**Permission Handling Strategy:**
- Request camera permission on first app launch with clear explanation
- Request storage permission when first session is saved
- Graceful degradation: if permissions denied, show clear error with link to Settings
- No background permissions required (all capture happens while app is active)

### Offline Mode Strategy

**Full Offline Capability:**

The app supports complete offline operation with automatic synchronization when connectivity restores.

**Offline Capabilities:**
- **Run test sessions offline:** Camera capture, video recording, and local AI analysis queueing work without network
- **Store sessions locally:** Videos compressed and stored in local file system until upload succeeds
- **Queue frame analysis:** Failed frame uploads queue locally with retry logic
- **Browse local history:** View locally-stored sessions even when offline (remote sessions unavailable)
- **Automatic sync:** When connectivity restores, queued uploads resume automatically in background

**Implementation Approach:**
- Use React Native's NetInfo to detect network state changes
- Implement local-first architecture: write to local SQLite/AsyncStorage, sync to Supabase when online
- Frame uploads: queue failed requests with exponential backoff retry
- Video uploads: background upload with progress tracking and resume capability
- Session metadata: optimistic updates to local DB, sync conflicts resolved server-side

**Offline User Experience:**
- Clear "Offline Mode" indicator in app header
- Session list shows "Syncing..." status for queued uploads
- Estimated sync time/data size displayed when returning online
- User can manually trigger sync or clear local cache if needed

### Push Notifications

**Not Required:** Push notifications are unnecessary for this internal testing tool. Team coordination happens via existing channels (Slack, email) rather than in-app notifications.

**Future Consideration:** If the tool scales beyond 10 testers or session volume increases dramatically, push notifications could notify testers when:
- A teammate completes testing on a high-priority scenario
- Backend credentials expire and need renewal
- New predefined scenarios are added

For MVP and Growth phases, notifications are explicitly **out of scope**.

### Store Compliance & Distribution

**Internal Distribution Only (No Public App Store Release)**

**iOS Distribution:**
- **Method:** TestFlight internal testing
- **Team Size:** < 100 testers (within TestFlight limits)
- **No App Store Review:** Avoids App Store guidelines compliance overhead
- **Privacy Policy:** Basic privacy notice for TestFlight (camera/storage usage disclosure)
- **Certificate:** Enterprise or Developer certificate for internal distribution

**Android Distribution:**
- **Method:** Internal app sharing via Google Play Console or direct APK distribution
- **No Play Store Release:** Avoids Play Store policy compliance
- **Permissions:** Standard camera/storage permissions (no special justifications needed)
- **Installation:** Enable "Install from Unknown Sources" for team devices if using APK

**Compliance Implications:**
- **Simplified privacy requirements:** No GDPR/CCPA compliance burden (internal use only)
- **No age rating needed:** Internal tool, not public-facing
- **Faster iteration:** Updates pushed directly via TestFlight/Internal Track without review delays
- **Device management:** Team devices can be pre-configured with necessary permissions

### Technical Architecture Considerations

**Camera & Video Processing:**
- **Real-time frame capture:** Camera stream at 1-5 FPS (configurable interval) without dropping video recording
- **Concurrent recording:** Video recording runs parallel to frame capture/upload
- **Format:** H.264 video compression to 720p (balance quality/size)
- **Frame extraction:** Extract JPEG frames from camera stream for AI upload
- **Memory management:** Release captured frames after upload to prevent memory bloat

**Local Storage Management:**
- **Video storage:** Compressed videos stored locally until Supabase upload succeeds
- **Frame queue:** Failed frame uploads stored in local DB with retry metadata
- **Cache limits:** Warn user when local storage exceeds 1GB (approximately 50-100 session videos)
- **Purge strategy:** After successful upload, delete local video copy (keep remote URL)

**Cross-Device Synchronization:**
- **Supabase real-time subscriptions:** Live updates when teammates complete sessions
- **Anonymous auth:** No login friction, all team members share same auth context
- **Conflict resolution:** Last-write-wins for session metadata updates
- **Device identification:** Device name set in Settings for attribution

### Implementation Considerations

**Development Priorities:**
1. **Camera/Video MVP:** Get frame capture + video recording working reliably first
2. **Offline queueing:** Implement local-first architecture for resilience
3. **Cross-device sync:** Supabase integration with real-time subscriptions
4. **Performance optimization:** Ensure < 50ms frame capture latency

**Risk Mitigation:**
- **Camera permissions denial:** Clear error messaging with Settings deeplink
- **Storage full:** Proactive warnings before starting sessions
- **Video corruption:** Validate video file before marking session complete
- **Network instability:** Offline queue ensures no data loss

**Platform-Specific Considerations:**
- **iOS:** Background video upload may be restricted; ensure upload completes before app backgrounds
- **Android:** Handle lifecycle (app pause/resume) gracefully during recording
- **Battery drain:** Camera + video + uploads are battery-intensive; consider low-power mode warnings

## Functional Requirements

### Overview

The functional requirements below define the complete capability contract for poc-didit-camera-app. These requirements synthesize capabilities discovered through user journeys, success criteria analysis, mobile app requirements, and the product brief. They represent what the product MUST do to deliver value to internal testers evaluating vision AI backends.

**Organization**: Requirements are organized by capability area, not by technology or implementation.

### FR Capability Areas

#### 1. Session Management & Testing Workflow

- **FR1**: Testers can create new test sessions with descriptive names and scenario selection
- **FR2**: Testers can select which vision AI backends to test in a session (DiditCamera, Gemini, Claude, Mock)
- **FR3**: Testers can configure session parameters including frame capture interval (500-5000ms) and test duration
- **FR4**: Testers can start/stop test sessions with one-tap control
- **FR5**: Testers can view real-time progress indicators during active sessions (time elapsed, frames captured, responses received)
- **FR6**: System can automatically stop sessions when TRUE result is detected across all backends (+1 second buffer)
- **FR7**: Testers can pause and resume sessions without losing captured data
- **FR8**: Testers can access session history with all previously completed test runs
- **FR9**: Testers can delete individual sessions to remove test data

#### 2. Camera & Media Capture

- **FR10**: System can capture video continuously during test sessions using device camera
- **FR11**: System can extract frames from video stream at configured intervals for AI analysis
- **FR12**: System can maintain dual-capture mode (video recording + frame extraction) simultaneously
- **FR13**: System can compress recorded video to H.264 720p format for storage efficiency
- **FR14**: System can store captured video files locally on device
- **FR15**: Testers can review captured video playback with synchronized AI response timeline
- **FR16**: System can request and manage camera permissions appropriately for iOS/Android
- **FR17**: System can request and manage video recording permissions for both platforms

#### 3. Backend Integration & Response Management

- **FR18**: System can send captured frames to multiple vision AI backends concurrently
- **FR19**: System can authenticate with DiditCamera backend using email/password credentials
- **FR20**: System can authenticate with Gemini Vision backend using API key
- **FR21**: System can authenticate with Claude backend using API key
- **FR22**: System can use Mock backend for testing without live API dependencies
- **FR23**: System can handle backend response latency variations without blocking UI
- **FR24**: System can capture and store complete response data from each backend (result, confidence, response time, metadata)
- **FR25**: System can retry failed backend requests with exponential backoff
- **FR26**: System can continue session execution even if individual backends fail

#### 4. Offline Mode & Data Synchronization

- **FR27**: Testers can run complete test sessions while device is offline
- **FR28**: System can queue all backend requests when offline for later processing
- **FR29**: System can store all session data (video, frames, metadata) locally when offline
- **FR30**: System can detect when device connectivity is restored
- **FR31**: System can automatically sync queued requests to backends when online
- **FR32**: System can update session records with backend responses after sync completes
- **FR33**: Testers can view sync status indicators showing pending/in-progress/completed sync operations
- **FR34**: System can manage local storage capacity and warn when storage is low

#### 5. Results Analysis & Comparison

- **FR35**: Testers can view side-by-side comparison of all backend responses for each frame
- **FR36**: Testers can see timing data for each backend response (latency, processing time)
- **FR37**: Testers can see confidence scores reported by each backend
- **FR38**: Testers can identify which backend first returned TRUE result with visual indicators
- **FR39**: Testers can filter session results by backend to focus analysis
- **FR40**: Testers can see aggregate statistics across session (accuracy rate, average latency, consistency)
- **FR41**: Testers can compare performance across different prompts using same scenario
- **FR42**: Testers can export session results data for external analysis

#### 6. Prompt Management & Iteration

- **FR43**: Testers can create and save custom prompts for vision AI analysis
- **FR44**: Testers can edit existing prompts and test variations
- **FR45**: Testers can associate specific prompts with test sessions
- **FR46**: Testers can view prompt performance history across multiple sessions
- **FR47**: Testers can compare results from different prompt variations side-by-side
- **FR48**: Testers can mark prompts as "working" or "needs refinement" based on results
- **FR49**: System can suggest prompt improvements based on inconsistent results (future capability)

#### 7. Scenario Management

- **FR50**: Testers can select from predefined test scenarios when creating sessions
- **FR51**: System can provide scenario-specific guidance and success criteria
- **FR52**: Testers can view which backends perform best for specific scenarios
- **FR53**: Testers can access scenario library with descriptions and expected outcomes
- **FR54**: Testers can filter session history by scenario type

#### 8. Collaboration & Team Features

- **FR55**: Testers can share session results with team members via unique links
- **FR56**: Testers can add notes and observations to session results
- **FR57**: Testers can view test results contributed by other team members
- **FR58**: System can maintain user identity using Supabase anonymous authentication
- **FR59**: Testers can access shared prompt library with team contributions
- **FR60**: Testers can see aggregate team insights across all testing sessions

### Functional Requirements Summary

**Total FRs**: 60 functional requirements across 8 capability areas

**Coverage**:
- Session Management & Testing Workflow: 9 FRs
- Camera & Media Capture: 8 FRs
- Backend Integration & Response Management: 9 FRs
- Offline Mode & Data Synchronization: 8 FRs
- Results Analysis & Comparison: 8 FRs
- Prompt Management & Iteration: 7 FRs
- Scenario Management: 5 FRs
- Collaboration & Team Features: 6 FRs

**Validation Against Success Criteria**:
✅ Confident backend selection → Supported by FRs 35-42 (comparison & analysis)
✅ Reliable prompt discovery → Supported by FRs 43-49 (prompt management)
✅ Scenario-specific performance mapping → Supported by FRs 50-54 (scenario management)

**Validation Against User Journeys**:
✅ First test session journey → Supported by FRs 1-9, 10-17, 35-42
✅ Systematic comparison journey → Supported by FRs 35-42, 50-54
✅ Prompt refinement journey → Supported by FRs 43-49, 55-60

## Non-Functional Requirements

### Performance

Performance is critical for poc-didit-camera-app because testers need real-time feedback during camera capture sessions. Slow performance degrades the testing experience and reduces the number of sessions testers can complete.

**Response Time Requirements:**

| Operation | Target | Justification |
|-----------|--------|---------------|
| Frame capture from camera stream | < 50ms | Keeps camera responsive, prevents dropped frames |
| Frame upload + AI backend response | < 3000ms | Maintains "real-time" feel during recording |
| Video playback start | < 500ms | Instant review after session completes |
| History list load (first 20 items) | < 200ms | Snappy navigation through past sessions |
| Backend switching | < 100ms | Seamless A/B testing workflow |
| Session save to database | < 1000ms | Quick completion of test cycle |

**Processing Requirements:**

- **Video compression**: Complete within 5 seconds for 60-second recording (H.264 to 720p)
- **Frame extraction**: Extract JPEG frames at configured intervals (500-5000ms) without blocking video recording
- **Concurrent operations**: Video recording + frame capture + frame upload must run in parallel without degradation
- **Memory management**: Release captured frames after upload to prevent memory bloat during long sessions

**Throughput Requirements:**

- **Frame capture rate**: Support 1-5 frames per second (configurable interval) consistently
- **Video bitrate**: Maintain stable 720p H.264 encoding at ~20KB/second
- **Upload queue**: Process up to 100 queued frame uploads when connectivity restores without blocking UI

### Security

Security requirements focus on protecting backend API credentials and ensuring test data integrity. Since this is an internal tool with no sensitive user data, security needs are moderate rather than high.

**Credential Protection:**

- **Storage encryption**: All backend credentials (API keys, email/password) encrypted at rest using platform secure storage (iOS Keychain, Android Keystore)
- **Transmission security**: All API requests use HTTPS/TLS 1.2+ for communication with backends and Supabase
- **Credential sharing**: Team credentials stored in Supabase with encryption, accessible only to authenticated devices
- **No plain-text logging**: API keys and passwords never logged in plain text to device logs or crash reports

**Data Privacy:**

- **Anonymous authentication**: Supabase anonymous auth ensures no personal account creation required
- **Device identification**: Device names are user-configurable, not tied to personal identifiers
- **Session data**: Test sessions contain camera footage but no personal or sensitive information
- **Local storage**: Videos and session data stored in app sandbox, not accessible to other apps

**Access Control:**

- **Team-level access**: All authenticated devices on the team can read/write session data (shared workspace model)
- **No public access**: Supabase row-level security ensures data only accessible to authenticated team members
- **Credential revocation**: Ability to update/change backend credentials across all devices via Settings sync

### Reliability

Reliability is paramount because data loss during testing would undermine the entire evaluation process. The app must preserve all test data even in adverse conditions.

**Data Integrity Requirements:**

- **No data loss during network interruptions**: Offline queueing ensures all session data (video, frames, metadata) survives connectivity issues
- **Perfect frame/video synchronization**: AI response timestamps must precisely align with video timeline for accurate review
- **Atomicity**: Session saves are all-or-nothing (no partial sessions that corrupt analysis)
- **Raw response preservation**: Complete backend responses captured for post-analysis (no data truncation)
- **Video validation**: Verify video file integrity before marking session complete

**Fault Tolerance:**

- **Individual backend failures**: Sessions continue even if one backend fails (resilient multi-backend testing)
- **Failed frame uploads**: Retry once with exponential backoff before marking as failed (don't block session)
- **Storage overflow**: Warn user before starting session if local storage exceeds 1GB (prevent mid-session failures)
- **App crashes**: Recover in-progress sessions on restart using local cache
- **Network instability**: Queue operations offline, resume automatically when connectivity restores

**Availability:**

- **Offline operation**: 100% of core functionality (capture, record, review local sessions) works offline
- **Cross-device sync**: Real-time updates when teammates complete sessions (< 5 second latency)
- **Backend independence**: No single backend failure blocks testing (can test with other backends)
- **Local-first architecture**: Write to local storage first, sync to Supabase asynchronously

**Data Recovery:**

- **Session recovery**: Resume incomplete sessions after app restart or crash
- **Sync retry**: Automatic retry of failed uploads when connectivity restores (exponential backoff)
- **Conflict resolution**: Last-write-wins for session metadata updates across devices
- **Storage purge**: Delete local video copies after successful remote upload to free space

### Integration

Integration requirements define how the app connects with external systems (vision AI backends, Supabase backend) and ensures consistent behavior across diverse APIs.

**Backend Integration Standards:**

- **Multi-backend abstraction**: Normalize responses from DiditCamera, Gemini, Claude, and Mock backends to common schema
- **Authentication flexibility**: Support email/password (DiditCamera) and API key (Gemini, Claude) authentication patterns
- **Response format normalization**: Map diverse backend responses (JSON structures, confidence formats) to unified internal model
- **Error handling**: Gracefully handle backend-specific errors (rate limits, timeouts, invalid credentials) without crashing

**API Reliability:**

- **Timeout handling**: Set reasonable timeouts per backend (3-5 seconds) to prevent indefinite waits
- **Retry logic**: Exponential backoff for failed requests (retry once, then queue for later sync)
- **Rate limit compliance**: Respect backend rate limits (don't spam APIs during rapid testing)
- **Concurrent requests**: Send frames to multiple backends in parallel without blocking each other

**Backend Configuration:**

- **Hot-swappable backends**: Switch between backends within single session without restart
- **Credential validation**: Test backend connectivity when credentials are saved in Settings
- **Status indicators**: Display backend health (Active/Inactive/Error) in UI
- **Mock backend**: Provide test backend with configurable latency and responses for offline development

**Supabase Integration:**

- **Real-time subscriptions**: Subscribe to session updates for team collaboration (live sync)
- **Optimistic updates**: Update local DB immediately, sync to Supabase in background
- **Conflict resolution**: Handle concurrent session updates across devices (last-write-wins)
- **Schema versioning**: Support backward-compatible schema changes for future updates

**Data Format Standards:**

- **Video format**: H.264 codec, 720p resolution, MP4 container (cross-platform compatibility)
- **Frame format**: JPEG images with quality 80% (balance size/quality)
- **Timestamp precision**: Millisecond precision for frame timestamps to enable accurate video overlay
- **Metadata schema**: Consistent JSON structure for session metadata across all backends

### Maintainability

Maintainability requirements ensure the codebase remains manageable as the tool evolves and new backends are added.

**Code Structure:**

- **Backend abstraction layer**: New backends can be added by implementing standardized interface (< 200 lines of code)
- **Separation of concerns**: Camera, video, networking, and storage logic in separate modules
- **Configuration-driven**: Backend endpoints, timeouts, and intervals configurable without code changes
- **Error logging**: Structured logging for debugging (but no sensitive data logged)

**Testing Support:**

- **Mock backend**: Simulate backend responses for UI testing without live API dependencies
- **Local development**: Run app in simulator/emulator with mock backend for rapid iteration
- **Debug mode**: Enable verbose logging and performance metrics for troubleshooting

**Platform Compatibility:**

- **React Native version**: Stay within one major version of latest stable React Native release
- **iOS compatibility**: Support last 3 iOS versions (iOS 13-15+)
- **Android compatibility**: Support API 26+ (Android 8.0+)
- **Cross-platform parity**: Maintain feature parity between iOS and Android (no platform-exclusive features)
