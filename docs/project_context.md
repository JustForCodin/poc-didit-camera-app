---
project_name: 'poc-didit-camera-app'
user_name: 'Oleksii'
date: '2025-12-12'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality', 'workflow_rules', 'critical_rules']
status: 'complete'
rule_count: 35
optimized_for_llm: true
---

# Project Context for AI Agents

_Critical rules and patterns that AI agents must follow when implementing code. Focus on unobvious details._

---

## Technology Stack & Versions

| Technology | Version/Details |
|------------|-----------------|
| React Native | via Expo (managed workflow) |
| TypeScript | Strict mode enabled |
| Expo Router | File-based routing in `app/` |
| Styled Components | For React Native |
| Redux Toolkit | With Redux Persist |
| Supabase | Auth, Database, Storage, Realtime |
| expo-camera | Frame capture |
| expo-av | Video recording/playback |
| expo-secure-store | Encrypted credential storage |
| @react-native-community/netinfo | Offline detection |
| dayjs | Date formatting (display only) |
| Jest | Testing framework |

---

## Critical Implementation Rules

### TypeScript Rules

- **Use Result<T> type for ALL async service functions** - Never throw errors, return Result<T>
  ```typescript
  type Result<T> =
    | { success: true; data: T }
    | { success: false; error: string };
  ```
- **Store dates as ISO strings** - Never use Date objects in state or storage
- **Format dates only at display time** using dayjs
- **Use strict mode** - No `any` types without explicit justification

### Naming Conventions

**Database (Supabase/PostgreSQL):**
- Tables: `snake_case`, plural (`sessions`, `frame_results`)
- Columns: `snake_case` (`session_id`, `created_at`)
- Foreign keys: `{table}_id` pattern
- Indexes: `idx_{table}_{column}`

**TypeScript/React Native:**
- Component files: `PascalCase.tsx` (`SessionCard.tsx`)
- Utility files: `camelCase.ts` (`queueService.ts`)
- Test files: `{name}.test.ts` (co-located with source)
- Functions/variables: `camelCase`
- Types/Interfaces: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Redux slices: `camelCase` (`sessionsSlice`)
- Redux actions: `domain/action` (`sessions/addSession`)

### Redux Toolkit Patterns

- **Use Immer-powered reducers** - Direct mutations are safe inside createSlice
- **Redux Persist whitelist**: `['sessions', 'settings', 'queue']`
- **Redux Persist blacklist**: `['backends']` (credentials in secure store)
- **Async state pattern**:
  ```typescript
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  ```

### Backend Abstraction (Adapter Pattern)

All vision AI backends MUST implement:
```typescript
interface VisionBackend {
  name: BackendType;
  analyze(frame: Frame, prompt: string): Promise<AnalysisResult>;
  isConfigured(): boolean;
}

interface AnalysisResult {
  result: boolean;        // TRUE/FALSE normalized
  confidence: number;     // 0-100 normalized
  rawResponse: unknown;   // Original response preserved
  latencyMs: number;      // Response time tracking
}

type BackendType = 'diditCamera' | 'gemini' | 'claude' | 'mock';
```

### Error Handling Pattern

- Return user-friendly message in `error` field
- Log technical details to console separately
- Never expose raw error messages to users
```typescript
if (error) {
  console.error('Supabase error:', error); // Technical log
  return { success: false, error: 'Failed to load session' }; // User message
}
```

### Offline Queue Pattern

- Queue service processes retries with exponential backoff
- Config: baseDelay 1s, maxDelay 30s, maxAttempts 3
- Redux queueSlice tracks: `items`, `status`, `pendingCount`

---

## Testing Rules

- **Co-locate tests** with source files (`mock.ts` + `mock.test.ts`)
- **Priority testing areas**: Backend adapters, Queue service, Data transformations
- **Deferred testing**: UI components, E2E flows (manual testing for <10 users)
- **Use Jest** (included with Expo)

---

## Code Quality & Style

### File Organization
```
app/                    # Expo Router screens (lowercase with brackets)
src/components/         # Shared UI (PascalCase.tsx)
src/features/           # Feature-specific components
src/services/           # Business logic (camelCase.ts)
src/store/              # Redux slices
src/types/              # TypeScript interfaces
src/utils/              # Utility functions
```

### Imports
- Use TypeScript path aliases for clean imports
- Barrel exports from `index.ts` in each directory

---

## Development Workflow Rules

### Git (from CLAUDE.md)
- **Branch naming**: `feature/[story-name]`, `fix/[issue-name]`, `hotfix/[critical-fix]`
- **Commit format**: `type(scope): description`
  - `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- **Examples**: `feat(camera): add frame capture with configurable interval`

### Build Commands
```bash
npx expo start           # Development server
npx expo run:ios         # iOS simulator
npx expo run:android     # Android emulator
eas build --profile development --platform ios  # Dev build
```

---

## Critical Anti-Patterns (NEVER DO)

1. **NEVER use throwing errors** for expected failures - always return Result<T>
2. **NEVER store Date objects** - use ISO strings only
3. **NEVER put credentials in Redux** - use expo-secure-store
4. **NEVER use snake_case in TypeScript code** - only in database
5. **NEVER use PascalCase for utility files** - only for components
6. **NEVER create separate `__tests__` folders** - co-locate tests
7. **NEVER hardcode endpoints/timeouts** - use configuration
8. **NEVER log credentials or API keys** - not even in development
9. **NEVER block UI during network operations** - use async patterns
10. **NEVER skip offline handling** - queue all failed operations

---

## Edge Cases to Handle

- **Network transitions**: Use NetInfo to detect online/offline
- **App backgrounding**: Complete uploads before app backgrounds (iOS restriction)
- **Storage limits**: Warn at 1GB local storage
- **Backend rate limits**: Respect with exponential backoff
- **Session recovery**: Support crash recovery from Redux Persist

---

## Quick Reference

| What | Where |
|------|-------|
| Database tables | snake_case, plural |
| TypeScript code | camelCase |
| Components | PascalCase.tsx |
| Tests | Co-located, {name}.test.ts |
| Dates | ISO strings, format with dayjs |
| Async returns | Result<T> type |
| Credentials | expo-secure-store |
| State | Redux Toolkit + Persist |
| Offline | Queue + NetInfo |

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Refer to `docs/architecture.md` for detailed decisions

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

---

_Last Updated: 2025-12-12_
