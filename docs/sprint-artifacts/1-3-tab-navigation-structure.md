# Story 1.3: Tab Navigation Structure

Status: done

## Story

As a tester,
I want a tab-based navigation with Camera, History, and Settings tabs,
So that I can quickly navigate between the main app sections.

## Acceptance Criteria

1. **Given** the app is launched **When** the tester views the main screen **Then** a bottom tab bar displays three tabs: Camera, History, Settings
2. **And** Camera tab is the default/initial tab (app opens to camera screen per UX6)
3. **And** each tab displays its corresponding screen placeholder
4. **And** tab icons visually indicate the active tab
5. **And** tab switching is instant (< 100ms per NFR5)
6. **And** navigation state persists correctly when switching tabs
7. **And** the navigation follows Expo Router file-based routing in `app/(tabs)/`

## Tasks / Subtasks

- [x] Task 1: Rename and restructure tab files (AC: #1, #2, #7)
  - [x] 1.1: Created `app/(tabs)/camera.tsx` with Camera tab content
  - [x] 1.2: Created `app/(tabs)/history.tsx` (History tab placeholder)
  - [x] 1.3: Created `app/(tabs)/settings.tsx` (Settings tab placeholder)
  - [x] 1.4: Updated `app/(tabs)/_layout.tsx` to configure three tabs with correct order
  - [x] 1.5: Deleted old `app/(tabs)/two.tsx` file
- [x] Task 2: Configure Camera tab as default (AC: #2)
  - [x] 2.1: Used redirect index pattern (more reliable than initialRouteName)
  - [x] 2.2: Created `app/(tabs)/index.tsx` that redirects to camera tab
  - [x] 2.3: Verified app opens directly to Camera tab on launch
- [x] Task 3: Add tab bar icons (AC: #4)
  - [x] 3.1: Used `@expo/vector-icons` Ionicons for tab icons
  - [x] 3.2: Configured active/inactive icon colors using theme
  - [x] 3.3: Added icons: camera-outline, time-outline, settings-outline
- [x] Task 4: Style tab bar with theme (AC: #4)
  - [x] 4.1: Applied theme colors to tab bar background
  - [x] 4.2: Configured `tabBarActiveTintColor` and `tabBarInactiveTintColor` from theme
  - [x] 4.3: Added header styling with theme colors
- [x] Task 5: Create placeholder screens with styled components (AC: #3)
  - [x] 5.1: Created Camera screen with Redux integration demo
  - [x] 5.2: Created History screen with empty state design
  - [x] 5.3: Created Settings screen with section outlines (Backend, Device, About)
- [x] Task 6: Verify navigation behavior (AC: #5, #6)
  - [x] 6.1: Tab switching is instant via Expo Router
  - [x] 6.2: Navigation state persists correctly between tab switches
  - [x] 6.3: Deep linking supported via file-based routing
  - [x] 6.4: TypeScript check passed with no errors
  - [x] 6.5: All 49 tests pass with no regressions

## Dev Notes

### Critical Implementation Details

**Current Tab Structure (from create-expo-stack):**
```
app/(tabs)/
├── _layout.tsx    # Tab layout - needs updating
├── index.tsx      # Currently "Tab One" - rename to camera.tsx
└── two.tsx        # Currently "Tab Two" - rename to history.tsx
```

**Target Tab Structure:**
```
app/(tabs)/
├── _layout.tsx    # Tab layout with 3 tabs
├── index.tsx      # Redirect to camera (ensures camera is default)
├── camera.tsx     # Camera tab (main testing screen)
├── history.tsx    # Session history tab
└── settings.tsx   # Settings tab
```

### Expo Router File-Based Routing

Per [docs/architecture.md#Project-Structure]:
- Tab screens live in `app/(tabs)/` directory
- `_layout.tsx` configures the `<Tabs>` navigator
- File names become route names (e.g., `camera.tsx` → `/camera`)
- Use `initialRouteName` or index redirect to set default tab

**Tab Layout Configuration:**
```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'styled-components/native';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide from tab bar (redirect only)
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Index Redirect Pattern

To make Camera the default tab (per UX6: Camera-first interface):

```typescript
// app/(tabs)/index.tsx
import { Redirect } from 'expo-router';

export default function TabIndex() {
  return <Redirect href="/camera" />;
}
```

### UX Requirements

Per [docs/ux-design-specification.md] and [docs/epics.md]:
- **UX6:** Camera-first interface (app opens directly to camera screen)
- **UX7:** Tab-based navigation (Camera/History/Settings tabs)
- **NFR5:** Tab switching < 100ms (instant feel)

### Icon Selection

Using Ionicons from `@expo/vector-icons` (included with Expo):
- **Camera tab:** `camera-outline` / `camera` (filled when active)
- **History tab:** `time-outline` / `time` (filled when active)
- **Settings tab:** `settings-outline` / `settings` (filled when active)

### Theme Integration

Use styled-components theme for consistent styling:
```typescript
const theme = useTheme();
// theme.colors.primary - active tab color
// theme.colors.textSecondary - inactive tab color
// theme.colors.background - tab bar background
// theme.colors.border - tab bar top border
```

### Previous Story Learnings (Story 1.2)

From [docs/sprint-artifacts/1-2-redux-toolkit-styled-components-setup.md]:
- ✅ Theme is available via `useTheme()` hook from styled-components
- ✅ Styled components work correctly with theme
- ✅ `app/_layout.tsx` already wraps app with ThemeProvider
- ✅ Import path aliases `@/` and `~/` both work

### Architecture Compliance

Per [docs/architecture.md]:
- Use Expo Router file-based routing in `app/(tabs)/`
- Tab screens are: `camera.tsx`, `history.tsx`, `settings.tsx`
- Use styled-components with theme for styling
- Follow feature-based component organization

### What This Story Does NOT Include

These are explicitly **deferred to later stories**:
- Camera functionality (Story 2.x)
- Session history list (Story 4.5)
- Settings screen content (Story 3.11)
- Any Redux state changes

This story focuses ONLY on tab navigation structure with placeholder content.

### References

- [Source: docs/architecture.md#Project-Structure] - Tab navigation structure
- [Source: docs/epics.md#Story-1.3] - Original story requirements
- [Source: docs/ux-design-specification.md#UX6] - Camera-first interface
- [Source: docs/ux-design-specification.md#UX7] - Tab-based navigation
- [Expo Router Tabs Documentation](https://docs.expo.dev/router/advanced/tabs/)
- [@expo/vector-icons](https://icons.expo.fyi/)

### Latest Technical Information (December 2025)

**Expo Router v4 (SDK 54):**
- Use `<Tabs>` component from `expo-router`
- `href: null` hides a screen from the tab bar
- `<Redirect>` component for programmatic navigation
- Screen options support standard React Navigation props

**Ionicons in Expo:**
- Included in `@expo/vector-icons` (already installed)
- Import as `import { Ionicons } from '@expo/vector-icons'`
- Use outline variants for inactive, filled for active (optional)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- TypeScript check: `npx tsc --noEmit` - passed with no errors
- Test run: `npm test` - 49 tests passed, 0 failed

### Completion Notes List

1. **Tab Structure Implemented**: Created 3-tab navigation (Camera, History, Settings) following Expo Router file-based routing pattern
2. **Camera-First Interface**: Used `<Redirect href="/camera" />` pattern in index.tsx to ensure Camera tab opens by default (per UX6)
3. **Theme Integration**: Tab bar styled with theme colors for active/inactive states, background, and borders
4. **Ionicons**: Used camera-outline, time-outline, settings-outline icons from @expo/vector-icons
5. **Placeholder Screens**: Each tab has styled placeholder content:
   - Camera: Shows Redux integration demo with device name display and counter
   - History: Empty state with "No sessions yet" message
   - Settings: Section outlines for Backend Configuration, Device Settings, About
6. **No Regressions**: All 49 existing tests continue to pass

### File List

**Created:**
- `app/(tabs)/camera.tsx` - Camera tab screen with Redux demo
- `app/(tabs)/history.tsx` - History tab placeholder screen
- `app/(tabs)/settings.tsx` - Settings tab placeholder screen

**Modified:**
- `app/(tabs)/_layout.tsx` - Updated to configure 3 tabs with icons and theme styling
- `app/(tabs)/index.tsx` - Replaced with redirect to camera tab

**Deleted:**
- `app/(tabs)/two.tsx` - Old "Tab Two" file removed

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-14 | Story created from epics.md and architecture.md | Claude Opus 4.5 |
| 2025-12-14 | Implementation complete - all tasks done, tests passing | Claude Opus 4.5 |
| 2025-12-14 | Code review fixes: removed inline styles, added disabled prop to placeholder button, dynamic version from app.json | Claude Opus 4.5 |
