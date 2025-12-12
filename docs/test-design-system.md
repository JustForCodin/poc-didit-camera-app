# System-Level Test Design

**Date:** 2025-12-12
**Author:** Oleksii
**Status:** Draft
**Project:** poc-didit-camera-app
**Architecture Review:** Based on docs/architecture.md
**PRD Reference:** docs/prd.md

---

## Executive Summary

This document provides the **System-Level Testability Review** for poc-didit-camera-app, a React Native mobile application for evaluating vision AI backends. The review assesses architecture testability, identifies Architecturally Significant Requirements (ASRs), defines test level strategy, and flags testability concerns before implementation begins.

**Recommendation:** PASS with CONCERNS - Architecture is generally testable with minor gaps requiring attention in Sprint 0.

---

## Testability Assessment

### Controllability: PASS

**Can we control system state for testing?**

| Aspect | Assessment | Evidence |
|--------|------------|----------|
| API seeding | ✅ Available | Supabase client enables direct database manipulation for test data setup |
| Mock backend | ✅ Designed | Mock backend adapter explicitly included in architecture (src/services/backends/mock.ts) |
| Dependency injection | ✅ Supported | VisionBackend interface + adapter pattern enables backend swapping |
| Configuration control | ✅ Supported | Configuration-driven endpoints, timeouts, intervals (NFR24) |
| State reset | ✅ Available | Redux store + AsyncStorage can be cleared between tests |

**Controllability Strengths:**
- Mock backend explicitly architected for testing without live API dependencies
- Adapter pattern allows injecting test doubles for all vision AI backends
- Supabase client provides direct database access for test data seeding
- Redux store enables state manipulation and inspection

**Controllability Gaps:**
- None identified - architecture explicitly supports test controllability

### Observability: PASS with CONCERNS

**Can we inspect system state and validate outcomes?**

| Aspect | Assessment | Evidence |
|--------|------------|----------|
| State inspection | ✅ Available | Redux DevTools integration, state accessible via selectors |
| API responses | ✅ Captured | AnalysisResult type captures result, confidence, rawResponse, latencyMs |
| Logging | ⚠️ Not specified | No structured logging strategy defined in architecture |
| Metrics | ⚠️ Not specified | Performance metrics captured per-frame but no APM integration |
| Error visibility | ✅ Supported | Result<T> pattern surfaces errors explicitly |

**Observability Strengths:**
- Comprehensive response capture: result, confidence, rawResponse, latencyMs for every frame
- Redux state management provides full application state visibility
- Result<T> pattern ensures errors are never silently swallowed
- Session metadata captures complete test context

**Observability Concerns:**
- **Missing structured logging**: No Sentry, Datadog, or crash reporting integration defined
- **No APM integration**: Performance metrics (NFR1-NFR8) captured but not exported to monitoring system
- **Recommendation**: Add optional crash reporting (Sentry) and consider performance monitoring for production builds

### Reliability: PASS

**Are tests isolated and reproducible?**

| Aspect | Assessment | Evidence |
|--------|------------|----------|
| Test isolation | ✅ Supported | Local-first architecture, database can be reset between tests |
| Parallel-safe | ✅ Supported | Unique session IDs, no global mutable state |
| Deterministic waits | ⚠️ Requires attention | Network waits via NetInfo, but frame timing may introduce flakiness |
| Cleanup discipline | ✅ Supported | Supabase RLS + test user isolation |
| Seed data | ✅ Available | Factory pattern recommended (createUser, createSession) |

**Reliability Strengths:**
- Local-first architecture: Tests can run fully offline using Mock backend
- Session isolation: Each test session has unique ID, no cross-contamination
- Cleanup via Supabase: Test data can be scoped to test users with RLS

**Reliability Concerns:**
- **Frame capture timing**: 500-5000ms intervals may introduce timing-dependent test failures
- **Recommendation**: Use Mock backend with deterministic latency for integration tests

---

## Architecturally Significant Requirements (ASRs)

ASRs are quality requirements that drive architecture decisions and pose testability challenges.

### High-Risk ASRs (Score >= 6)

| ASR ID | Category | Requirement | Probability | Impact | Score | Testability Challenge |
|--------|----------|-------------|-------------|--------|-------|----------------------|
| ASR-001 | PERF | Frame capture latency < 50ms (NFR1) | 3 | 2 | 6 | Requires native performance profiling, device-specific variation |
| ASR-002 | PERF | Frame upload + AI response < 3000ms (NFR2) | 2 | 3 | 6 | Depends on network conditions, backend availability |
| ASR-003 | DATA | Zero data loss during network interruptions (NFR9) | 2 | 3 | 6 | Requires simulating network disconnection scenarios |
| ASR-004 | PERF | Dual-capture without degradation (NFR8) | 3 | 2 | 6 | CPU/memory intensive, device-dependent |
| ASR-005 | SEC | Credential encryption at rest (NFR15) | 2 | 3 | 6 | Platform-specific secure storage validation |

### Medium-Risk ASRs (Score 3-5)

| ASR ID | Category | Requirement | Probability | Impact | Score | Testability Challenge |
|--------|----------|-------------|-------------|--------|-------|----------------------|
| ASR-006 | PERF | Video playback start < 500ms (NFR3) | 2 | 2 | 4 | Video decoding performance varies by device |
| ASR-007 | PERF | History list load < 200ms (NFR4) | 2 | 2 | 4 | Requires data volume testing |
| ASR-008 | TECH | Backend switching < 100ms (NFR5) | 2 | 2 | 4 | Redux state update timing |
| ASR-009 | PERF | Video compression < 5s for 60s video (NFR7) | 2 | 2 | 4 | Device CPU dependent |
| ASR-010 | TECH | Frame/video timestamp sync (NFR10) | 2 | 2 | 4 | Timing alignment precision |
| ASR-011 | TECH | Backend failures don't block session (NFR11) | 2 | 2 | 4 | Error isolation testing |
| ASR-012 | DATA | Session recovery after crash (NFR12) | 2 | 2 | 4 | Crash simulation required |
| ASR-013 | DATA | Cross-device sync < 5s (NFR13) | 2 | 2 | 4 | Real-time subscription testing |
| ASR-014 | TECH | New backends addable in < 200 lines (NFR23) | 1 | 2 | 2 | Architecture validation |

### ASR Mitigation Strategies

**ASR-001, ASR-004 (Frame Performance):**
- Test on target devices (iPhone 8+, Android API 26+)
- Use performance profiling in development builds
- Establish baseline measurements in Sprint 0
- Monitor for regression with automated performance tests

**ASR-002 (End-to-End Latency):**
- Use Mock backend with configurable latency for deterministic testing
- Separate unit/integration tests from performance tests
- Performance tests run against staging with real backends

**ASR-003 (Offline Data Integrity):**
- Test offline queue with network disconnection simulation
- Verify data integrity after sync completes
- Test crash recovery scenarios

**ASR-005 (Credential Security):**
- Validate expo-secure-store integration on both platforms
- Verify credentials never appear in logs or crash reports
- Security-focused code review for credential handling

---

## Test Levels Strategy

Based on architecture analysis (React Native mobile app, multi-backend integration, offline-first):

### Recommended Test Pyramid

```
         /\
        /  \    E2E: 20%
       /----\   Critical user journeys
      /      \
     /--------\  Integration: 30%
    /          \ Backend adapters, Queue service, Supabase sync
   /------------\
  /              \ Unit: 50%
 /________________\ Business logic, data transformations, utilities
```

### Test Level Distribution

| Level | Coverage | Rationale |
|-------|----------|-----------|
| **Unit** | 50% | Backend adapters normalize diverse APIs, Queue service has complex retry logic, data transformations require edge case coverage |
| **Integration** | 30% | Backend + Supabase integration, offline queue processing, real-time sync |
| **E2E** | 20% | Camera capture flow, session recording, cross-device visibility |

### Test Level Details

**Unit Tests (Jest - Fast Feedback)**

Focus areas:
- Backend adapters: Response normalization, error handling, latency measurement
- Queue service: Retry logic, exponential backoff, queue ordering
- Data transformations: Date formatting, confidence normalization, Result<T> handling
- Redux reducers: State updates, action handling

Characteristics:
- No external dependencies
- Run in < 10 seconds total
- Mock all network calls
- Target: 80% code coverage for services/

**Integration Tests (Jest + Supabase Test Instance)**

Focus areas:
- Backend adapter + network: Real API contract validation (staging environment)
- Queue service + Supabase: Offline queue processing and sync
- Session persistence: Redux Persist + AsyncStorage
- Credential storage: expo-secure-store integration

Characteristics:
- Use Supabase test project (not production)
- Network calls allowed but controlled
- Run in < 2 minutes total
- Focus on component boundaries

**E2E Tests (Detox or Maestro)**

Focus areas:
- Camera permission flow
- Recording session (start → capture → stop → review → save)
- Auto-stop on TRUE detection
- Offline session → sync flow
- Backend switching during session

Characteristics:
- Run on simulator/emulator
- Real device testing for performance validation
- Target: < 10 minutes for full suite
- Focus on critical user journeys only

---

## NFR Testing Approach

### Security Testing

| NFR | Approach | Tools |
|-----|----------|-------|
| NFR15: Credential encryption | Verify expo-secure-store usage, no plain-text storage | Manual code review + integration test |
| NFR16: HTTPS/TLS | Verify all external calls use HTTPS | Network inspection in tests |
| NFR17: No plain-text logging | Search codebase for credential logging, verify error handling | Static analysis + code review |
| NFR18: Team-level RLS | Test Supabase RLS policies block unauthorized access | Integration tests with multiple users |

**Security Test Strategy:**
- Code review checklist for credential handling
- Integration tests verify RLS policies
- No automated penetration testing (internal tool, low risk)
- Manual security review before each major release

### Performance Testing

| NFR | Approach | Tools |
|-----|----------|-------|
| NFR1: Frame capture < 50ms | Measure in dev builds, establish baseline | Native profiler, console.time() |
| NFR2: Upload + response < 3000ms | Test with Mock backend (deterministic), validate with staging | Integration test with timing assertions |
| NFR3: Video playback < 500ms | Measure on target devices | Manual testing + automated baseline |
| NFR4: History load < 200ms | Test with 100+ sessions | Integration test with data volume |
| NFR7: Compression < 5s | Test on target devices | Manual testing with various video lengths |

**Performance Test Strategy:**
- Establish baselines in Sprint 0 using Mock backend
- Unit/integration tests verify logic correctness (not performance)
- Performance tests run separately on real devices
- Monitor performance trends across releases
- k6 NOT applicable (mobile app, not web API)

### Reliability Testing

| NFR | Approach | Tools |
|-----|----------|-------|
| NFR9: Zero data loss offline | Simulate network disconnection, verify queue | Integration test with NetInfo mock |
| NFR10: Frame/video sync | Verify timestamps align within tolerance | Unit test + manual verification |
| NFR11: Backend failure isolation | Test single backend failure | Unit test with error injection |
| NFR12: Crash recovery | Test session recovery after simulated crash | Integration test |
| NFR13: Cross-device sync | Test real-time subscription | Integration test with multiple clients |
| NFR14: Retry with backoff | Verify retry logic | Unit test for QueueService |

**Reliability Test Strategy:**
- Offline scenarios: Mock NetInfo, simulate disconnection during session
- Error handling: Inject failures into backend adapters
- Crash recovery: Test AsyncStorage persistence and recovery flow
- Real-time sync: Test Supabase subscription with multiple test clients

### Maintainability Testing

| NFR | Approach | Tools |
|-----|----------|-------|
| NFR23: Backend extensibility | Verify interface contract, test Mock adapter as example | Architecture validation |
| NFR24: Configuration-driven | Verify no hardcoded values for endpoints/timeouts | Code review |
| NFR25: Cross-platform parity | Test on both iOS and Android | CI matrix testing |

**Maintainability Test Strategy:**
- Mock backend serves as reference implementation for new adapters
- TypeScript compiler enforces VisionBackend interface
- ESLint rules enforce naming conventions
- Test coverage threshold: 80% for services/

---

## Test Environment Requirements

### Local Development Environment

| Component | Setup |
|-----------|-------|
| React Native | Expo SDK (latest stable) |
| Jest | Included with Expo, for unit/integration tests |
| Mock Backend | Built-in, configurable latency/responses |
| Supabase | Local Supabase CLI or test project |
| Simulator | iOS Simulator, Android Emulator |

### CI Environment

| Component | Setup |
|-----------|-------|
| GitHub Actions | Primary CI platform |
| Unit Tests | Run on every PR |
| Integration Tests | Run on every PR (Supabase test project) |
| E2E Tests | Run nightly or on-demand (Detox/Maestro) |
| Coverage | jest --coverage with 80% threshold |

### Staging Environment

| Component | Setup |
|-----------|-------|
| Supabase | Staging project (separate from production) |
| Backend APIs | Real DiditCamera, Gemini, Claude (test credentials) |
| Distribution | TestFlight (iOS), Internal Track (Android) |

### Test Data Strategy

| Data Type | Strategy |
|-----------|----------|
| Users | Factory functions with faker (unique per test) |
| Sessions | Factory functions, cleanup after test |
| Backend credentials | Test credentials stored in CI secrets |
| Video files | Pre-recorded test videos in fixtures |

---

## Testability Concerns

### Minor Concerns (CONCERNS)

| Concern | Impact | Mitigation |
|---------|--------|------------|
| **No structured logging** | Difficult to debug production issues | Add Sentry/crash reporting in Sprint 0 |
| **Frame timing flakiness** | Integration tests may be unstable | Use Mock backend with deterministic timing |
| **Device-specific performance** | NFR validation varies by device | Document target devices, test on reference devices |
| **No E2E framework selected** | Need to choose Detox vs Maestro | Evaluate in Sprint 0, recommend Maestro for simplicity |

### Blockers (None Identified)

No architectural decisions block testability. All major components are designed with testing in mind:
- Mock backend for offline development
- Adapter pattern for backend substitution
- Redux for state inspection
- Supabase for test data management

---

## Recommendations for Sprint 0

### Test Infrastructure Setup

1. **Jest Configuration**
   - Configure jest with Expo preset
   - Set up coverage reporting with 80% threshold
   - Add co-located test file support (*.test.ts)

2. **Mock Backend Enhancement**
   - Add configurable latency (immediate, 500ms, 2000ms, timeout)
   - Add configurable responses (TRUE, FALSE, error, rate limit)
   - Add response sequence support for scenario testing

3. **E2E Framework Selection**
   - Evaluate Maestro (simpler, YAML-based) vs Detox (more powerful, complex)
   - Recommend Maestro for internal tool with <10 users
   - Set up basic smoke test suite

4. **CI Pipeline**
   - GitHub Actions workflow for unit/integration tests
   - Coverage reporting and threshold enforcement
   - Supabase test project for integration tests

5. **Test Data Factories**
   - createUser() - generates unique user with faker
   - createSession() - generates session with frames
   - createBackendResponse() - generates AnalysisResult

6. **Performance Baseline**
   - Measure frame capture latency on target devices
   - Document baseline metrics for NFR validation
   - Set up manual performance test protocol

### Test Infrastructure Checklist

- [ ] Jest configured with Expo preset
- [ ] Coverage threshold set to 80%
- [ ] Mock backend with configurable latency/responses
- [ ] Factory functions for test data
- [ ] Supabase test project created
- [ ] GitHub Actions workflow for tests
- [ ] E2E framework selected and smoke test created
- [ ] Performance baseline documented

---

## Quality Gate Criteria

### Pre-Implementation Gate (Sprint 0)

- [ ] Test infrastructure setup complete
- [ ] Mock backend enhanced for testing
- [ ] Factory functions created
- [ ] CI pipeline running
- [ ] Performance baseline documented

### Per-Epic Gate

- [ ] Unit tests for all new services (80% coverage)
- [ ] Integration tests for component boundaries
- [ ] E2E tests for critical user journeys
- [ ] No high-risk (score >= 6) items unmitigated
- [ ] All P0 tests pass (100%)

### Release Gate

- [ ] All tests pass
- [ ] Coverage >= 80% for services/
- [ ] No critical security issues
- [ ] Performance within NFR targets
- [ ] Cross-platform testing complete (iOS + Android)

---

## Summary

**Assessment:** PASS with CONCERNS

**Strengths:**
- Architecture explicitly supports testing (Mock backend, adapter pattern, Redux state)
- Clear separation of concerns enables isolated testing
- Offline-first design supports deterministic test scenarios
- Comprehensive response capture (result, confidence, latency, rawResponse)

**Concerns:**
- Missing structured logging/monitoring (add Sentry)
- E2E framework not selected (evaluate Maestro vs Detox)
- Performance testing requires real device validation

**Next Steps:**
1. Complete Sprint 0 test infrastructure setup
2. Select E2E framework (recommend Maestro)
3. Add crash reporting (Sentry recommended)
4. Establish performance baselines on target devices
5. Run `testarch-framework` workflow to scaffold test infrastructure
6. Run `testarch-ci` workflow to configure CI pipeline

---

**Generated by:** BMad TEA Agent - Test Architect Module
**Workflow:** `.bmad/bmm/testarch/test-design`
**Version:** 4.0 (BMad v6)
