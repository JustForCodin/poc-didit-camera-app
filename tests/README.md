# Test Infrastructure

**Framework:** Jest (via jest-expo preset)
**Coverage Target:** 80% for all code, 90% for critical services
**Test Location:** Co-located with source files + dedicated `tests/` directory

---

## Quick Start

```bash
# Install dependencies (after project initialization)
npm install

# Install test dependencies
npm install -D jest-expo @testing-library/jest-native @testing-library/react-native @faker-js/faker jest-junit

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

---

## Directory Structure

```
tests/
├── unit/                    # Dedicated unit test files
│   └── example.test.ts      # Example tests demonstrating patterns
├── integration/             # Integration tests (API, Supabase)
├── support/                 # Test infrastructure
│   ├── fixtures/            # Test fixtures and setup
│   │   └── factories/       # Data factories (faker-based)
│   │       ├── userFactory.ts
│   │       ├── sessionFactory.ts
│   │       ├── backendFactory.ts
│   │       └── index.ts
│   ├── helpers/             # Test utilities
│   │   ├── mockBackend.ts   # Configurable mock backend
│   │   ├── testUtils.ts     # Common test utilities
│   │   └── index.ts
│   └── setupTests.ts        # Jest setup (mocks, global config)
└── README.md                # This file
```

---

## Test Patterns

### Co-located Tests

Tests for source files live next to the source:

```
src/
  services/
    backends/
      mock.ts
      mock.test.ts          # Co-located test
    queue/
      queueService.ts
      queueService.test.ts  # Co-located test
```

### Data Factories

Use factories to create unique test data:

```typescript
import {
  createUser,
  createSession,
  createCompletedSession,
  createTrueResponse,
  createAutoStopSequence,
} from '@tests/support/fixtures/factories';

// Create user with defaults
const user = createUser();

// Create user with overrides
const admin = createUser({ name: 'Admin User' });

// Create completed session with 10 frames
const session = createCompletedSession(10);

// Create auto-stop sequence (5 FALSE + 1 TRUE)
const responses = createAutoStopSequence(5);
```

### Mock Backend

Use the mock backend for deterministic testing:

```typescript
import { mockBackend, createAutoStopSequence } from '@tests/support/helpers';

beforeEach(() => {
  mockBackend.reset();
});

it('should auto-stop on TRUE detection', async () => {
  // Set up response sequence
  mockBackend.setResponseSequence(createAutoStopSequence(3));
  mockBackend.setLatency(100);

  // Responses will be: FALSE, FALSE, FALSE, TRUE
  const r1 = await mockBackend.analyze({}, 'test');
  const r2 = await mockBackend.analyze({}, 'test');
  const r3 = await mockBackend.analyze({}, 'test');
  const r4 = await mockBackend.analyze({}, 'test');

  expect(r1.result).toBe(false);
  expect(r4.result).toBe(true);
});
```

### Result Type Pattern

Use the Result<T> pattern for all async operations:

```typescript
import { mockSuccess, mockError, expectSuccess, expectError } from '@tests/support/helpers';

// Create mock results
const success = mockSuccess({ id: '123' });
const error = mockError('Not found');

// Assert and extract
const data = expectSuccess(success);  // Returns { id: '123' }
const msg = expectError(error);       // Returns 'Not found'
```

---

## Running Tests

### npm Scripts

Add these to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --reporters=default --reporters=jest-junit"
  }
}
```

### Coverage Thresholds

Jest is configured with these thresholds:

| Scope | Threshold |
|-------|-----------|
| Global | 80% |
| Backend adapters (`src/services/backends/`) | 90% |
| Queue service (`src/services/queue/`) | 90% |

### Test Focus Areas

Per architecture decision, prioritize testing:

1. **Backend adapters** - Response normalization, error handling
2. **Queue service** - Retry logic, exponential backoff
3. **Data transformations** - Date formatting, confidence normalization

Lower priority (defer to manual testing):
- UI components
- E2E flows (use Detox/Maestro when ready)

---

## Mocking Strategy

### Expo Modules

Mocks are configured in `tests/support/setupTests.ts`:

- `@react-native-async-storage/async-storage`
- `@react-native-community/netinfo`
- `expo-secure-store`
- `expo-camera`
- `expo-av`
- `expo-file-system`

### Supabase

The Supabase client is mocked in setup. For integration tests, use a test Supabase project.

### Network State

```typescript
import { createMockNetworkState } from '@tests/support/helpers';

// Online
const online = createMockNetworkState(true);

// Offline
const offline = createMockNetworkState(false);
```

---

## E2E Testing (Future)

E2E tests will use **Detox** or **Maestro** (evaluate during Sprint 0):

### Maestro (Recommended for Simplicity)

```yaml
# maestro/flows/session-recording.yaml
appId: com.yourcompany.diditcamera
---
- launchApp
- tapOn: "Start Session"
- assertVisible: "Recording..."
- waitForEvent:
    timeout: 10000
    element: "TRUE Detected"
- assertVisible: "Session Complete"
```

### Detox (More Powerful)

```typescript
// e2e/session.test.ts
describe('Session Recording', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should record session and auto-stop on TRUE', async () => {
    await element(by.text('Start Session')).tap();
    await expect(element(by.text('Recording...'))).toBeVisible();
    await waitFor(element(by.text('TRUE Detected')))
      .toBeVisible()
      .withTimeout(10000);
  });
});
```

---

## CI Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run test:ci

      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info

      - uses: dorny/test-reporter@v1
        if: always()
        with:
          name: Jest Tests
          path: test-results/junit.xml
          reporter: jest-junit
```

---

## Best Practices

### DO

- Use factories for all test data
- Reset mocks in `beforeEach`
- Use `expectSuccess`/`expectError` for Result types
- Keep tests focused (one assertion per test ideal)
- Use descriptive test names

### DON'T

- Don't use hardcoded IDs or emails (use faker)
- Don't skip cleanup (let Jest handle it)
- Don't use `waitForTimeout` (use deterministic waits)
- Don't test React Native framework behavior
- Don't duplicate coverage across unit/integration/E2E

---

## Knowledge Base References

- Architecture patterns: `docs/architecture.md`
- Test design: `docs/test-design-system.md`
- Result<T> type: `src/types/common.ts` (after project init)

---

**Generated by:** BMad TEA Agent - Test Framework Module
**Date:** 2025-12-12
