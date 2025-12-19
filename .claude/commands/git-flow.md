---
description: 'Automate Git flow: create branch, commit, push, and create PR for story completion'
---

# Git Flow Automation

You are a Git automation assistant. Execute the requested Git operation based on user input.

## Available Operations

When invoked, ask the user which operation they want:

1. **story-start** - Create a new feature branch for a story (from main)
2. **story-complete** - Complete a story (commit, push, create PR to main)
3. **pr-status** - Check CI status of a PR and report any failures
4. **hotfix** - Create hotfix branch and PR

## Operation: story-start

For starting work on a new story:

1. **Ensure on main and up-to-date**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create Feature Branch**
   - Branch name format: `feature/[story-id]-[brief-description]`
   - Example: `feature/2-1-camera-permission-handling`
   ```bash
   git checkout -b feature/<story-name>
   ```

3. **Confirm Branch Created**
   ```bash
   git branch --show-current
   ```

## Operation: story-complete

For completing a story (commit, push, create PR):

1. **Verify State**
   ```bash
   git status
   git branch --show-current
   ```
   - Ensure you're on a feature branch, NOT main

2. **Run Tests**
   ```bash
   npm test
   ```
   - If tests fail, stop and report. Do not commit broken code.

3. **Run TypeScript Check**
   ```bash
   npx tsc --noEmit
   ```
   - If type errors, stop and report.

4. **Stage Changes**
   - Review `git status` output
   - Stage relevant files (exclude .env, credentials, build artifacts)

5. **Create Commit**
   - Use conventional commit format from `.claude/CLAUDE.md`
   - Format: `type(scope): description`
   - Include detailed description of changes
   - Include co-authored-by footer

6. **Push to Remote**
   ```bash
   git push -u origin <branch-name>
   ```

7. **Create Pull Request**
   ```bash
   gh pr create --title "<Story Title>" --body "$(cat <<'EOF'
   ## Summary
   <Brief description of what this story implements>

   ## Changes
   - <Key change 1>
   - <Key change 2>
   - <Key change 3>

   ## Test Plan
   - [x] All unit tests pass (`npm test`)
   - [x] TypeScript compiles without errors (`npx tsc --noEmit`)
   - [ ] Manual testing on device/simulator

   ## Story Reference
   - Story file: `docs/sprint-artifacts/<story-file>.md`

   EOF
   )"
   ```

8. **Wait for CI and Check Status**
   ```bash
   # Wait for checks to complete (up to 5 minutes)
   gh pr checks --watch --interval 10
   ```

   - If checks pass: Report success and PR URL
   - If checks fail: Run `gh pr checks` to show failures, then investigate

9. **Report PR URL and CI Status** to user

## Operation: pr-status

For checking CI status of an existing PR:

1. **List Recent PRs (if no PR number provided)**
   ```bash
   gh pr list --state open --limit 10
   ```

2. **Check PR Status**
   ```bash
   # Check specific PR
   gh pr checks <pr-number>

   # Or check current branch's PR
   gh pr checks
   ```

3. **If Checks Failed:**
   - Show which checks failed
   - Get the CI logs:
     ```bash
     gh pr checks --json name,state,conclusion,link
     ```
   - Suggest investigating the failed workflow run

4. **View Failed Check Details**
   ```bash
   # View the workflow run logs
   gh run view <run-id> --log-failed
   ```

5. **Report Summary** to user with:
   - Which checks passed/failed
   - Links to failed check logs
   - Suggestions for fixing (if tests failed, run `npm test` locally)

## Operation: hotfix

For urgent production fixes:

1. **Create Hotfix Branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/<fix-name>
   ```

2. **After fix is implemented, commit and create PR**
   - Follow same commit format
   - Create PR with `gh pr create`

## Branch Naming Convention

From `.claude/CLAUDE.md`:
- `feature/[story-name]` - New features and stories (one branch per story)
- `fix/[issue-name]` - Bug fixes
- `hotfix/[critical-fix]` - Urgent production fixes

**Important:** Each story gets its own feature branch, not one branch per epic.

**Story Branch Examples:**
- `feature/2-1-camera-permission-handling`
- `feature/2-2-camera-preview-component`
- `feature/3-1-backend-picker-ui`

## Commit Message Format

- `feat(scope): description` - New feature
- `fix(scope): description` - Bug fix
- `docs(scope): description` - Documentation only
- `refactor(scope): description` - Code restructuring
- `test(scope): description` - Adding/updating tests
- `chore(scope): description` - Tooling, dependencies, config

## Workflow Summary

```
main ─────────────────────────────────────────────────────────────────────────>
       │                    ↑                    ↑                    ↑
       │                    │                    │                    │
       └─feature/2-1-xxx ──PR──┘                    │                    │
                              └─feature/2-2-xxx ──PR──┘                    │
                                                    └─feature/2-3-xxx ──PR──┘
```

Each story:
1. Branch from main
2. Implement story
3. Create PR to main
4. Wait for CI checks to pass
5. After approval, merge to main
6. Next story branches from updated main

## CI Check Troubleshooting

If CI checks fail:

1. **Tests failing:**
   - Run `npm test` locally to reproduce
   - Fix the failing tests
   - Commit fix and push

2. **TypeScript errors:**
   - Run `npx tsc --noEmit` locally
   - Fix type errors
   - Commit fix and push

3. **Linting errors:**
   - Run `npm run lint` locally (if configured)
   - Fix linting issues
   - Commit fix and push

4. **Build errors:**
   - Check the CI log for specific error
   - Run build locally if possible
   - Fix and push

## Safety Rules

- NEVER force push to main/master
- NEVER skip pre-commit hooks unless explicitly requested
- NEVER commit .env files or credentials
- NEVER work directly on main - always use feature branches
- Always run tests before committing
- Always verify branch before operations
- One PR per story (not per epic)
- Always check CI status after creating PR
