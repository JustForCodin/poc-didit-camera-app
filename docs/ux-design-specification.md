---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - docs/prd.md
  - docs/00_context/project_brief.md
workflowType: 'ux-design'
lastStep: 5
project_name: 'poc-didit-camera-app'
user_name: 'Oleksii'
date: '2025-12-11'
---

# UX Design Specification poc-didit-camera-app

**Author:** Oleksii
**Date:** 2025-12-11

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

poc-didit-camera-app is an internal testing platform that transforms vision AI backend evaluation from guesswork into systematic, data-driven decision-making. The app enables a small team of testers (< 10) to discover which prompt + backend combinations produce consistent, reliable results across multiple vision AI providers (DiditCamera, Gemini Vision, Anthropic Claude) before integration into Sprout.

The core insight: **prompt stability matters more than raw backend performance.** Testers need to find prompts that work reliably across different visual scenarios (room tidiness, sink cleanliness, book cover detection) with consistent 95%+ accuracy. The app achieves this through dual-capture (real-time frame analysis + video recording), collaborative benchmarking (shared session data across team), and rapid iteration workflows.

### Target Users

**Internal Testing Team (< 10 testers)**

- **Technical Profile:** QA engineers familiar with the tech stack, comfortable with technical concepts like confidence scores, latency metrics, and API backends
- **Core Need:** Discover prompt formulations that produce stable, consistent results (95%+ accuracy) rather than just selecting "the best backend"
- **Testing Context:** Physically moving through spaces (rooms, kitchens, etc.) with iPhone, pointing camera at test scenarios, capturing visual proof-of-concept data
- **Key Behaviors:** Running many rapid test sessions (< 2 minutes each), comparing results across backends, iterating on prompt variations, collaborating on findings

**Success Definition:** Testers can confidently recommend backend + prompt combinations backed by empirical data showing consistent performance across scenarios.

### Key Design Challenges

1. **Prompt Discovery as Core Workflow**
   - The main challenge isn't "which backend is best" but "which prompt + backend combination produces consistent, reliable results"
   - Users need frictionless workflows to test the same prompt across all three backends, then iterate on prompt variations
   - History and comparison views must make prompt performance patterns immediately visible for pattern recognition

2. **Real-Time Feedback During Physical Movement**
   - Testers physically move around spaces while holding iPhone, pointing camera at test scenarios
   - Clear, glanceable feedback is critical while camera is at arm's length
   - One-handed operation likely required since testers hold phone and potentially manipulate test environment

3. **Rapid Iteration Cycles for High Testing Velocity**
   - Testers need to complete many sessions quickly (< 2 minutes per session target)
   - Switching backends and retrying with modified prompts must be frictionless (minimal taps)
   - Review and accuracy marking should be fast to maintain testing momentum and avoid bottlenecks

### Design Opportunities

1. **Prompt-Centric Comparison & Pattern Recognition**
   - Create comparison views that group sessions by prompt, showing backend performance side-by-side
   - Make prompt history searchable and reusable so successful prompts can be easily replicated
   - Visual indicators for "stable prompts" that consistently produce good results across backends
   - Help testers spot patterns: "This prompt works for room tidiness but fails for sink detection"

2. **iPhone-Optimized Mobile Testing Experience**
   - Thumb-friendly controls optimized for one-handed operation while moving
   - Large, clear visual feedback during recording (legible from arm's length while pointing camera)
   - Smart defaults that minimize taps between test runs to maximize testing velocity
   - Camera-first interface that keeps testing workflow front and center

3. **Collaborative Intelligence & Aggregate Insights**
   - Aggregate views showing prompt success rates by scenario type across all team sessions
   - Quick filtering to surface high-performing prompt + backend combinations from shared data
   - Team-wide pattern recognition: leverage collective testing to identify what works
   - Real-time session sharing enables learning from teammates' discoveries

## Core User Experience

### Defining Experience

The core experience of poc-didit-camera-app centers on a rapid, iterative testing loop:

**Core Loop:** Point camera → See real-time AI feedback → Save result → Retry with different backend/prompt → Compare

This loop must be effortless and fast (< 2 minutes per session). The most frequent user action is **testing the same prompt across multiple backends** to discover which combination produces consistent, reliable results. Everything in the UX serves this comparison workflow.

**Primary User Actions (in order of frequency):**
1. Starting a new test session from camera screen (minimal taps)
2. Switching backends to compare same prompt (zero friction, prompt persists)
3. Reviewing video playback with AI results to understand behavior
4. Marking session accuracy (Correct/Incorrect/Ambiguous)
5. Reusing successful prompts from history for new tests

The interaction that must be absolutely perfect: **Prompt persistence when switching backends.** If users lose their prompt when switching from DiditCamera to Gemini to Claude, the comparison workflow breaks entirely.

### Platform Strategy

**Primary Platform:** iPhone (iOS) mobile app built with React Native

**Platform Optimizations:**
- **Touch-first interface** optimized for one-handed operation while holding phone at arm's length
- **Portrait-oriented** camera interface (testers point phone at rooms, sinks, objects)
- **Offline-first architecture** with automatic sync when connectivity restores
- **Real-time feedback** remains critical even when offline (queued frames sync later)

**Cross-platform considerations:**
- UX design optimized specifically for iPhone (primary use case)
- React Native architecture maintains potential Android compatibility for future expansion
- No iOS-specific capabilities required beyond camera, video recording, local storage, and standard permissions

**Platform Requirements:**
- Camera permissions for frame capture and video recording
- Local storage for offline queueing and video caching
- Network state detection for offline/online transitions
- Background sync for queued frame uploads

### Effortless Interactions

The following interactions must feel completely natural and require zero thought:

1. **Starting a New Test Session**
   - Minimal taps from camera screen to "Start" button
   - Prompt field and backend selector immediately visible
   - Smart defaults reduce configuration overhead

2. **Backend Switching for Comparison**
   - One tap to switch from DiditCamera → Gemini → Claude
   - Prompt automatically persists across all backend switches
   - No re-entry, no copy/paste, no manual tracking

3. **Reusing Successful Prompts**
   - Tap any previous session in history to auto-fill its prompt
   - Prompt history is searchable and organized
   - Successful prompts surface to the top

4. **Saving Completed Sessions**
   - Review screen appears immediately after recording stops
   - One tap to "Save" or "Discard"
   - Session automatically syncs across all team devices

5. **Automatic Behaviors (No User Intervention Required):**
   - Auto-stop recording 1 second after AI returns TRUE (captures "success moment")
   - Automatic offline queueing when network unavailable
   - Automatic sync when connectivity restores
   - Cross-device session sharing (all testers see all results in real-time)

**Current Pain Points Addressed:**
- **Manual tracking eliminated:** App automatically tracks which prompt was used with which backend
- **No lost context:** Prompt persistence means users never lose track of what they tested
- **Instant retry workflow:** "Try with Model Y" button on session results enables one-tap comparison

### Critical Success Moments

**"This is Better" Moments (User Realization):**

1. **Instant Backend Comparison**
   - User completes session with DiditCamera, taps "Try with Gemini," and the same prompt is automatically ready to test
   - No manual re-entry, no tracking spreadsheet, just seamless comparison

2. **Video Playback with AI Timeline**
   - User reviews session and sees AI results overlaid on video at exact timestamps
   - They can see precisely when/why the AI changed from FALSE to TRUE
   - Understanding replaces guesswork

3. **Team-Wide Session Visibility**
   - User opens History on their iPhone and sees teammates' test results from other devices
   - Collaborative discovery happens automatically without manual sharing

**User Success Feelings:**

Users feel accomplished when they:
- Complete a session and mark it "Correct" with high confidence scores
- Identify a prompt that works consistently (95%+) across all three backends
- Build sufficient data (pattern recognition) to make a confident backend recommendation

**Make-or-Break Interactions (If These Fail, Experience Breaks):**

1. **Camera Capture + Real-Time AI Feedback**
   - Latency or unreliability here destroys the testing workflow
   - Performance target: < 3 seconds frame upload + AI response

2. **Prompt Persistence Across Backend Switches**
   - Losing the prompt when switching backends makes comparison painful and error-prone
   - This is non-negotiable: prompt MUST persist

3. **Video Playback Synchronization**
   - AI results must align perfectly with video timeline
   - If timestamps are off, users can't understand what the AI detected or when

**Golden Path (Must Work Flawlessly):**

1. Enter prompt → Select backend → Start session
2. Point camera at scenario → See real-time AI feedback (TRUE/FALSE overlay) → Auto-stop or manual stop
3. Review video with results overlaid → Save session
4. Tap "Try with [Different Backend]" → Same prompt auto-fills
5. Repeat session with new backend → Compare results in History

**First-Time User Success:**

A new tester experiences success when they:
- Complete one full session (prompt → capture → review → save)
- See their session appear in History with all metadata (backend, result, video)
- Understand: "I can trust this data to make decisions"

Simple completion = confidence in the system.

### Experience Principles

These principles guide all UX design decisions for poc-didit-camera-app:

1. **Prompt Iteration is Paramount**
   - The core workflow revolves around testing the same prompt across multiple backends with zero friction
   - Prompt persistence when switching backends is non-negotiable
   - Every design decision must ask: "Does this make prompt comparison easier or harder?"
   - History, filtering, and comparison views are optimized for prompt-based analysis

2. **Real-Time Clarity Over Perfection**
   - Testers need instant, glanceable feedback while holding the iPhone at arm's length
   - Performance and responsiveness trump visual polish (prioritize speed over aesthetics)
   - Auto-stop captures the "success moment" without requiring manual intervention
   - Real-time AI results overlaid on camera preview keep testers in flow state

3. **Offline-First, Sync-Second**
   - Testing cannot be blocked by network issues or backend downtime
   - Offline queueing enables continuous testing regardless of connectivity
   - Automatic sync happens transparently when connection restores
   - Real-time feedback remains valuable even when results are queued for later upload

4. **One Session Success = Full Confidence**
   - First-time users should complete one session and immediately understand the value
   - The golden path (enter prompt → capture → review → save → retry with different backend) must be flawless
   - If camera capture, real-time feedback, or prompt persistence fails, the entire experience fails
   - Success feels like: "I can trust this data to make a decision"

5. **Collaborative Discovery, Not Solo Testing**
   - All team members see all sessions in real-time (cross-device sharing is automatic, not opt-in)
   - History and comparison tools surface patterns across the entire team's collective work
   - Tracking what worked/what didn't is automatic, not manual (no spreadsheets, no note-taking)
   - The team learns collectively, discovering patterns faster than individuals working in isolation

## Desired Emotional Response

### Primary Emotional Goals

**Confidence in Data-Driven Decision-Making**

The primary emotional goal is to make users feel **confident** that the test data they're collecting is trustworthy, comprehensive, and will lead them to the right backend selection. This confidence comes from:
- Systematic testing processes (same prompt across multiple backends)
- Complete session metadata (backend, confidence scores, latency, video evidence)
- Reliable data persistence (offline queueing, automatic sync, no data loss)
- Transparent system behavior (visible sync status, clear error communication)

Users should think: *"I can trust this data to make a recommendation backed by evidence."*

**Professional Tool Focus**

This is a productivity tool for QA engineers, not a consumer app. Emotional design prioritizes **clarity, reliability, and efficiency** over delight or surprise. Satisfaction comes from friction removal (automation working seamlessly), not gamification or celebration.

### Emotional Journey Mapping

**First Discovery (Opening the App):**
- **Clarity** - Immediately understand what to do (camera screen with prompt field and backend selector)
- **Readiness** - No friction to start testing (minimal taps from camera to "Start")
- **Curiosity** - Eager to run first test and see how comparison works

**During Core Experience (Recording Session):**
- **In Control** - Actively testing, not passively waiting for results
- **Focused** - In flow state with minimal distractions, clear real-time feedback
- **Engaged** - Watching AI results update in real-time on camera preview

**After Task Completion (Session Saved):**
- **Accomplished** - Completed a meaningful, systematic test
- **Confident** - Data is trustworthy and well-organized in history
- **Momentum** - Ready to run next comparison (backend switching is effortless)

**When Something Goes Wrong (Errors/Failures):**
- **Reassured** - Offline mode has their back, no data loss from network issues
- **Informed** - Clear error messages explain what happened and why
- **Unblocked** - Can continue testing with other backends (no single point of failure)

**Returning Users (10th, 20th Session):**
- **Familiarity** - Muscle memory, efficient workflow feels natural
- **Progress** - Seeing accumulated test data grow across team sessions
- **Value** - Patterns emerging from testing work (prompt performance becoming clear)

### Micro-Emotions (Critical Emotional States)

**1. Confidence vs. Confusion (Most Critical)**
- **Build Confidence Through:**
  - Comprehensive session metadata visible in every session card
  - Video playback with precise AI result timeline for verification
  - All data persisted with visible sync status indicators
  - No ambiguity about which backend was tested or what prompt was used
- **Avoid Confusion By:**
  - Eliminating silent failures or unclear sync states
  - Always showing backend name, prompt text, and device attribution
  - Clear visual distinction between online/offline modes

**2. Trust vs. Skepticism (Essential for Adoption)**
- **Build Trust Through:**
  - Clear offline mode indicators showing queued operations
  - Explicit sync confirmation when data uploads complete
  - No silent failures - all errors communicated with recovery paths
  - Consistent cross-device data visibility (team sees same results)
- **Avoid Skepticism By:**
  - Never losing data during network interruptions
  - Transparent system behavior (users see what's happening)
  - Reliable prompt persistence across backend switches

**3. Accomplishment vs. Frustration (Drives Continued Use)**
- **Build Accomplishment Through:**
  - Session completion flows with clear visual confirmation
  - History view shows accumulated test data (progress over time)
  - Accuracy marking provides closure on each session
  - Visible contribution to team's collective testing effort
- **Avoid Frustration By:**
  - Zero re-typing when switching backends (prompt persists)
  - No manual tracking or lost context between sessions
  - Fast, responsive UI during testing workflow

**4. Satisfaction vs. Tedium (Key Differentiator)**
- **Build Satisfaction Through:**
  - Prompt auto-fills when switching backends (automation working)
  - Automatic session syncing across devices (no manual sharing)
  - One-tap "Try with [Backend]" retry workflow
  - Manual tracking eliminated entirely
- **Avoid Tedium By:**
  - Minimizing taps between test runs (smart defaults)
  - Reusing successful prompts from history (searchable)
  - No repeated data entry or copy/paste workflows

**5. Belonging vs. Isolation (Supports Shared Learning)**
- **Build Belonging Through:**
  - Team sessions visible by default in History
  - Device name attribution shows who ran each test
  - Shared prompt library surfaces what teammates found successful
  - Real-time session sharing creates collective discovery
- **Avoid Isolation By:**
  - Cross-device visibility automatic, not opt-in
  - Team patterns surfaced in aggregate views
  - Collaborative intelligence built into filtering and comparison

### Design Implications

**Emotion-to-Design Connections:**

**1. Confidence (in data quality) → UX Design Approach:**
- Display comprehensive session metadata: backend, timestamp, confidence scores, latency, frame count
- Video playback with precise AI result timeline allows verification of AI behavior
- Persist all data with visible sync status indicators (syncing, synced, offline queued)
- Show raw backend responses in session details for complete transparency

**2. Trust (in system reliability) → UX Design Approach:**
- Clear offline mode indicators showing queued operations (icon in header + queue count)
- Explicit sync confirmation when data uploads complete (toast notification or status badge)
- All errors communicated with recovery paths (never silent failures)
- Consistent data visibility: if teammate sees session on their device, all devices see it

**3. Accomplishment (from completing tests) → UX Design Approach:**
- Session completion flows with clear visual confirmation (review screen immediately after stop)
- History view shows accumulated test data sorted by recency (progress visible)
- Accuracy marking provides closure on each session (Correct/Incorrect/Ambiguous)
- Session count or summary stats available (optional, not required for MVP)

**4. Satisfaction (from automation) → UX Design Approach:**
- Prompt auto-fills when switching backends (zero re-typing, seamless comparison)
- Automatic session syncing across devices (no manual sharing, export, or copy/paste)
- One-tap "Try with [Backend]" retry workflow from session details
- No spreadsheet tracking required - app remembers everything

**5. Belonging (to collaborative team) → UX Design Approach:**
- Team sessions visible by default in History (not filtered to "my sessions")
- Device name attribution shows who ran each test (team visibility, not anonymity)
- Shared prompt library surfaces what teammates found successful (collective learning)
- Filter by device name or backend to surface team patterns

### Emotional Design Principles

**1. Transparency Over Mystery**
- Users should always know what the system is doing and why
- Sync status, backend selection, prompt text, and data state must be visible
- No "black box" behavior - if AI returns a result, show confidence and latency

**2. Reliability Over Novelty**
- Consistent, predictable behavior builds trust faster than surprising features
- Offline queueing, prompt persistence, and auto-sync must work every time
- Performance and stability trump visual polish or experimental UX patterns

**3. Efficiency Over Engagement**
- This is a tool for getting work done, not maximizing time-on-app
- Minimize taps, eliminate friction, enable rapid iteration
- Users should complete sessions quickly and move on (not linger for engagement)

**4. Clarity Over Cleverness**
- Simple, direct UI communication beats clever micro-interactions
- Error messages should be plain-language and actionable
- Labels and states should be self-explanatory (no learning curve)

**5. Collective Intelligence Over Individual Glory**
- Emphasize team discoveries, not individual achievements
- Default views show all team data, not just user's own sessions
- Success is finding the right prompt + backend combo as a team, not personal metrics

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

The design of poc-didit-camera-app draws inspiration from four products that QA engineers and testers already use daily and appreciate for their intuitive interfaces, fast performance, and stability:

**1. Notion**
- **Core Strengths:** Intuitive navigation with breadcrumb/top bar, open documentation on entry pages, easy exploration via quick links
- **Key Pattern:** Clear back navigation and workspace switching enables users to never feel lost in complex information hierarchies
- **What Makes It Compelling:** Users can navigate deep into content while always knowing how to return to previous context

**2. VS Code**
- **Core Strengths:** Quick project opening from terminal or menu, integrated terminal for CLI commands, easily customizable editor layout
- **Key Pattern:** Command center approach where developers can execute any operation without leaving their workflow context
- **What Makes It Compelling:** Zero-friction launch and context switching keeps developers in flow state

**3. Slack**
- **Core Strengths:** Fast switching between chats & channels, seamless external API integrations, wide emoji reactions for quick responses
- **Key Pattern:** Instant context switching with visual indicators of active channel/thread
- **What Makes It Compelling:** Speed and responsiveness make communication feel effortless, not laborious

**4. iPhone Native Camera App**
- **Core Strengths:** Wide variety of out-of-the-box editing capabilities, easy gallery access from the app
- **Key Pattern:** Instant launch, clear mode indication, immediate access to captured content
- **What Makes It Compelling:** Zero latency between intent (capture photo) and action (shutter press), with instant review capability

**Common Success Factors Across All Four:**
- **Intuitive** - No learning curve required, self-explanatory interfaces
- **Fast** - Responsive interactions, minimal wait times, instant feedback
- **Stable** - Reliable performance, no crashes or data loss, consistent behavior
- **Workflow Integration** - Become inseparable parts of daily workflow through friction removal

### Transferable UX Patterns

**Navigation Patterns:**

**1. Breadcrumb/Top Bar Navigation (Notion → Session Detail)**
- **Pattern:** Clear back button and context indication in top bar
- **Application:** Session Detail view shows "< History" back button with current session context
- **Why It Works:** Users always know where they are and how to return to previous view

**2. Fast Context Switching (Slack → Backend Picker)**
- **Pattern:** One-tap switching between contexts with visual active state indicator
- **Application:** Backend picker allows instant switching between DiditCamera/Gemini/Claude with current selection highlighted
- **Why It Works:** Speed reduces friction in comparison workflow (test same prompt across backends)

**Interaction Patterns:**

**3. Command Center Approach (VS Code Terminal → Prompt Field)**
- **Pattern:** Central input field where user types once and executes across multiple contexts
- **Application:** Prompt field where user types prompt once, then switches backends to test same prompt
- **Why It Works:** Eliminates re-typing, supports core workflow of prompt comparison across backends

**4. Instant App Launch (VS Code → Camera Screen)**
- **Pattern:** App opens directly to primary working context, no intermediate screens
- **Application:** App launches directly to Camera screen with prompt field and backend selector visible
- **Why It Works:** Zero friction to start testing, aligns with "Efficiency Over Engagement" principle

**5. Integrated Secondary Context (Camera → History)**
- **Pattern:** Easy access to related content without leaving primary context
- **Application:** Tab bar or thumbnail provides instant History access from Camera screen
- **Why It Works:** Quick reference to past sessions without losing camera context

**Visual/UI Patterns:**

**6. Quick Action Review (Camera Editing → Session Review)**
- **Pattern:** Immediate post-capture actions without navigating to separate editing app
- **Application:** Review screen appears after session stop with immediate actions (Save/Discard/Mark Accuracy/Retry)
- **Why It Works:** Maintains testing momentum, no context switching to different screens for basic operations

**7. Icon-Based Status Indicators (Slack Reactions → Accuracy Marking)**
- **Pattern:** Visual indicators for quick status communication
- **Application:** Icon-based accuracy marking (✓ Correct / ✗ Incorrect / ? Ambiguous)
- **Why It Works:** Professional status indicators (not social reactions) support data quality assessment

### Anti-Patterns to Avoid

**1. Over-Customization (VS Code Risk)**
- **Anti-Pattern:** Too many preference/layout options that slow first-time user experience
- **Why Avoid:** Conflicts with "Efficiency Over Engagement" principle - users need speed, not customization
- **Our Approach:** Smart defaults, minimal configuration required, testing starts immediately

**2. Deep Navigation Hierarchies (Notion Risk)**
- **Anti-Pattern:** Losing track of context in deep folder structures or nested pages
- **Why Avoid:** Testing workflow needs clarity, not exploration - users must know where they are at all times
- **Our Approach:** Flat navigation (Camera/History/Settings - maximum 2 levels deep)

**3. Silent Sync/Unclear State (Slack/Notion Risk)**
- **Anti-Pattern:** Background operations without user visibility, unclear sync status
- **Why Avoid:** Conflicts with "Transparency Over Mystery" principle - users must trust data persistence
- **Our Approach:** Always show sync status, offline mode indicators, queue state visibility

**4. Mode Confusion (Camera Risk)**
- **Anti-Pattern:** Unclear which mode is active (Photo vs Video vs Portrait)
- **Why Avoid:** Prompt + backend combination is critical context that must never be ambiguous
- **Our Approach:** Always display current backend prominently, prompt always visible in UI

**5. Feature Bloat (All Apps Risk)**
- **Anti-Pattern:** Adding features that don't serve core workflow, complexity creep over time
- **Why Avoid:** Users need speed and reliability, not feature discovery
- **Our Approach:** Every feature must answer: "Does this make prompt comparison easier or harder?"

**6. Notification Overload (Slack Risk)**
- **Anti-Pattern:** Too many alerts, badges, or interruptions distracting from core work
- **Why Avoid:** Testing workflow requires focus - interruptions break flow state
- **Our Approach:** Silent automatic sync, minimal interruptions, focus on camera + testing workflow

### Design Inspiration Strategy

**What to Adopt (Use Directly):**

**1. Fast Context Switching (Slack → Backend Picker)**
- Backend picker should feel as instant as Slack's channel switcher
- One tap to switch between DiditCamera/Gemini/Claude with zero lag
- Visual indication of current backend (like Slack's active channel highlight)

**2. Immediate App Launch (VS Code → Camera Screen)**
- App opens directly to Camera screen (like VS Code opens to last project)
- Prompt field and backend selector immediately visible and ready for input
- No splash screens, loading delays, or onboarding friction - start testing instantly

**3. Integrated Access to Secondary Context (Camera → History)**
- Easy access to History from Camera screen (like Camera app's gallery thumbnail)
- Tab bar or bottom sheet for quick context switching without losing camera state
- One tap to view past sessions, one tap to return to camera

**4. Clear Back Navigation (Notion → Session Detail)**
- Top bar with clear back button from Session Detail → History
- Always know where you are and how to get back to previous context
- No navigation confusion or getting "lost" in the app

**What to Adapt (Modify for Your Context):**

**1. Command Center Pattern (VS Code Terminal → Prompt Field)**
- **Adaptation:** Prompt field as the "command center" where you type once and test across all backends
- **Modification:** Unlike VS Code's terminal which executes commands once, your prompt persists across backend switches
- **Why Adapt:** Your use case requires prompt reuse and comparison, not one-time execution

**2. Quick Edit Actions (Camera Editing → Session Review)**
- **Adaptation:** Review screen with immediate actions (Save/Discard/Mark Accuracy/Retry)
- **Modification:** Simpler than Camera's full editing suite - just essential post-session actions
- **Why Adapt:** Testing workflow needs speed over comprehensive editing, focus on data quality assessment

**3. Visual Status Indicators (Slack Reactions → Accuracy Marking)**
- **Adaptation:** Icon-based accuracy marking (✓ Correct / ✗ Incorrect / ? Ambiguous)
- **Modification:** Not emoji reactions but professional status indicators for data quality
- **Why Adapt:** Your users need data quality assessment, not social engagement features

**What to Avoid (Explicit Anti-Patterns):**

**1. Over-Customization (VS Code Risk)**
- **Avoid:** Too many preference/layout options that slow first-time use
- **Your Approach:** Smart defaults, minimal configuration required, instant testing readiness
- **Why Avoid:** Conflicts with "Efficiency Over Engagement" principle - speed trumps personalization

**2. Deep Navigation Hierarchies (Notion Risk)**
- **Avoid:** Losing track of context in deep folder structures or nested views
- **Your Approach:** Flat navigation (Camera/History/Settings - max 2 levels deep)
- **Why Avoid:** Testing workflow needs clarity, not exploration - always clear where you are

**3. Silent Sync/Unclear State (Slack/Notion Risk)**
- **Avoid:** Background operations without user visibility or unclear sync status
- **Your Approach:** Always show sync status, offline mode, queue state with visible indicators
- **Why Avoid:** Transparency Over Mystery principle - users must trust data persistence explicitly

**4. Mode Confusion (Camera Risk)**
- **Avoid:** Unclear which mode is active or what context user is in
- **Your Approach:** Always display current backend prominently, prompt always visible
- **Why Avoid:** Prompt + backend combination is critical context that must never be ambiguous

**5. Feature Bloat (All Apps Risk)**
- **Avoid:** Adding features that don't serve core testing workflow
- **Your Approach:** Every feature must answer: "Does this make prompt comparison easier?"
- **Why Avoid:** Your users need speed and reliability, not feature discovery or complexity

**Strategy Summary:**

**Design Philosophy:** Adopt patterns that support **speed, clarity, and reliability**. Adapt patterns when direct application doesn't match testing workflow requirements. Avoid patterns that introduce complexity, ambiguity, or slow down iteration velocity.

**Guiding Question for Every Design Decision:** 
"Would this pass the Slack speed test, the VS Code launch test, the Camera clarity test, and the Notion navigation test?"

**Pattern Application Priority:**
1. **Speed First** - If a pattern slows down testing, reject it (Slack/VS Code standard)
2. **Clarity Always** - If users can't understand state or context, reject it (Camera/Notion standard)
3. **Simplicity Over Features** - If it adds complexity without serving prompt comparison, reject it
