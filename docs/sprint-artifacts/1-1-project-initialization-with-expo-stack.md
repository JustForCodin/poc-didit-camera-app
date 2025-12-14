# Story 1.1: Project Initialization with Expo Stack

Status: done

## Story

As a developer,
I want a properly initialized React Native project with TypeScript, Expo Router, and Supabase configuration,
So that I have a working foundation to build the vision AI testing app.

## Acceptance Criteria

1. **Given** a new development environment **When** the project is initialized using `npx create-expo-stack@latest poc-didit-camera-app` **Then** the project includes TypeScript configuration with strict mode
2. **And** Expo Router is configured for file-based routing
3. **And** Supabase client dependencies are installed
4. **And** environment variable configuration is set up via `app.config.ts`
5. **And** `.env.example` file documents required environment variables (SUPABASE_URL, SUPABASE_ANON_KEY)
6. **And** `.gitignore` excludes `.env.local` and other sensitive files
7. **And** the app builds and runs successfully in Expo Go

## Tasks / Subtasks

- [x] Task 1: Initialize project with create-expo-stack (AC: #1, #2, #3)
  - [x] 1.1: Run `npx create-expo-stack@latest poc-didit-camera-app` with interactive options
  - [x] 1.2: Select Expo Router for navigation
  - [x] 1.3: Select TypeScript: Yes
  - [x] 1.4: Select Supabase: Yes
  - [x] 1.5: Select default or none for styling (Styled Components added in Story 1.2)
- [x] Task 2: Verify TypeScript strict mode configuration (AC: #1)
  - [x] 2.1: Check `tsconfig.json` has `strict: true`
  - [x] 2.2: Verify TypeScript path aliases are configured
- [x] Task 3: Configure environment variables (AC: #4, #5)
  - [x] 3.1: Create/update `app.config.ts` with environment variable support using `process.env`
  - [x] 3.2: Create `.env.example` with SUPABASE_URL and SUPABASE_ANON_KEY placeholders
  - [x] 3.3: Create `.env.local` with actual development values (gitignored)
- [x] Task 4: Configure .gitignore (AC: #6)
  - [x] 4.1: Ensure `.env.local` is in .gitignore
  - [x] 4.2: Ensure `.env*.local` pattern covers all local env files
  - [x] 4.3: Verify node_modules, .expo, build artifacts are excluded
- [x] Task 5: Verify Supabase client installation (AC: #3)
  - [x] 5.1: Confirm `@supabase/supabase-js` is in package.json dependencies
  - [x] 5.2: Verify Supabase client initialization file exists
- [x] Task 6: Validate build and run (AC: #7)
  - [x] 6.1: Run `npx expo start` and verify no errors
  - [x] 6.2: Test on iOS Simulator via Expo Go
  - [x] 6.3: Test on Android Emulator via Expo Go (if available)
  - [x] 6.4: Verify hot reload works correctly

## Dev Notes

### Critical Implementation Details

**Initialization Command:**
```bash
npx create-expo-stack@latest poc-didit-camera-app
```

**Interactive Options to Select:**
- Navigation: **Expo Router** (file-based routing)
- TypeScript: **Yes**
- Supabase: **Yes** (for backend integration)
- Styling: Select **default or none** (Styled Components will be added in Story 1.2)

**IMPORTANT: New Architecture is Default**
As of Expo SDK 52 (November 2024), the New Architecture is enabled by default for all new projects. You will see `newArchEnabled: true` in `app.json`. This is correct and expected.

### Platform Requirements

- **iOS:** Minimum iOS 15.1
- **Android:** minSdkVersion 24, compileSdkVersion 35
- **Xcode:** 16+ required (16.1 recommended for SDK 52)
- **Node.js:** LTS version recommended

### Environment Variables Pattern

**app.config.ts:**
```typescript
export default {
  expo: {
    // ... other config
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },
};
```

**.env.example:**
```
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Architecture Compliance

Per [docs/architecture.md](../architecture.md):
- Use Expo SDK 52+ with New Architecture enabled (default)
- TypeScript with strict mode
- File-based routing via Expo Router in `app/` directory
- Environment variables via `app.config.ts` (not babel transform)

### What This Story Does NOT Include

These are explicitly **deferred to Story 1.2**:
- Redux Toolkit setup
- Redux Persist configuration
- Styled Components installation
- Theme provider setup
- Custom component creation

This story focuses ONLY on project initialization and basic configuration.

### Project Structure Notes

After initialization, expected structure:
```
poc-didit-camera-app/
├── app/                    # Expo Router file-based routing
│   ├── _layout.tsx         # Root layout
│   └── index.tsx           # Home screen
├── assets/                 # Static assets
├── .env.example            # Environment template (created manually)
├── .env.local              # Local environment (gitignored, created manually)
├── .gitignore
├── app.config.ts           # Expo configuration
├── app.json                # Expo app manifest
├── babel.config.js
├── package.json
└── tsconfig.json
```

### References

- [Source: docs/architecture.md#Starter-Template-Evaluation] - Starter selection rationale
- [Source: docs/architecture.md#Project-Structure--Boundaries] - Target directory structure
- [Source: docs/epics.md#Story-1.1] - Original story requirements
- [Source: docs/prd.md#Mobile-App-Specific-Requirements] - Platform requirements

### Latest Technical Information (December 2025)

**Expo SDK 54 Features (Used in this project):**
- New Architecture enabled by default
- React Native 0.81.5 with React 19.1.0 support
- Minimum iOS 15.1, Android SDK 24
- React Navigation v7 (automatic via Expo Router)
- New `expo/fetch` with streaming support for AI APIs
- Stable `expo-video` with Picture-in-Picture support

**create-expo-stack:**
- CLI tool for scaffolding Expo projects with TypeScript, Expo Router, and Supabase
- Interactive or CLI flags: `npm create expo-stack --expo-router --bun`
- Alternative command: `npx rn-new`

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Expo dev server started successfully on http://localhost:8081
- TypeScript check passes with `npx tsc --noEmit`
- `.env.local` loaded automatically by Expo

### Completion Notes List

- ✅ Project initialized with create-expo-stack v2.20.1 (Expo SDK 54, React Native 0.81.5)
- ✅ TypeScript strict mode enabled in tsconfig.json
- ✅ Path aliases configured: `@/*` and `~/*` both map to project root
- ✅ Expo Router configured with file-based routing in `app/` directory with tabs layout
- ✅ Supabase client (`@supabase/supabase-js`) installed and configured in `utils/supabase.ts`
- ✅ Environment variables use `EXPO_PUBLIC_` prefix pattern (modern Expo standard)
- ✅ `app.config.ts` created with dynamic config and environment variable support
- ✅ `.env.example` documents required Supabase credentials
- ✅ `.gitignore` excludes `.env.local`, `.env*.local`, node_modules, .expo, build artifacts
- ✅ Expo dev server starts without errors, loads `.env.local` automatically
- ✅ Updated dependencies to Expo-recommended versions (async-storage@2.2.0, react-native@0.81.5)
- ✅ Created `src/types/common.ts` with Result<T> and AsyncState types to support pre-existing test infrastructure

### File List

**New Files Created:**
- app/_layout.tsx
- app/(tabs)/_layout.tsx
- app/(tabs)/index.tsx
- app/(tabs)/two.tsx
- app/+html.tsx
- app/+not-found.tsx
- app/modal.tsx
- app.config.ts
- app.json
- assets/adaptive-icon.png
- assets/favicon.png
- assets/icon.png
- assets/splash.png
- babel.config.js
- components/Button.tsx
- components/Container.tsx
- components/EditScreenInfo.tsx
- components/HeaderButton.tsx
- components/ScreenContent.tsx
- components/TabBarIcon.tsx
- .env.example
- .env.local (gitignored)
- eslint.config.js
- .gitignore
- metro.config.js
- package.json
- prettier.config.js
- tsconfig.json
- src/types/common.ts
- utils/supabase.ts

**Modified Files:**
- tests/support/setupTests.ts (commented out mocks for uninstalled packages)
- tests/support/helpers/testUtils.ts (fixed import path for Result type)
- jest.config.js (fixed path aliases and transformIgnorePatterns for faker-js)
- package.json (added test scripts and Jest dependencies)

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-13 | Story implementation completed - Project initialized with Expo SDK 54, TypeScript strict mode, Expo Router, and Supabase | Claude Opus 4.5 |
| 2025-12-14 | Code review fixes: Installed Jest/jest-expo/jest-junit, added test scripts, fixed path aliases, removed duplicate types folder, updated setupTests.ts mocks | Claude Opus 4.5 |
