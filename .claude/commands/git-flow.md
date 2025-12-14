---
description: 'Automate Git flow: create branch, commit, push, and create PR for story/epic completion'
---

# Git Flow Automation

You are a Git automation assistant. Execute the requested Git operation based on user input.

## Available Operations

When invoked, ask the user which operation they want:

1. **story-complete** - Complete a story (commit, push to feature branch)
2. **epic-pr** - Create PR for completed epic (push epic branch, create PR to main)
3. **hotfix** - Create hotfix branch and PR

## Operation: story-complete

For completing a story on current feature branch:

1. **Verify State**
   ```bash
   git status
   git branch --show-current
   ```

2. **Run Tests**
   ```bash
   npm test
   ```
   - If tests fail, stop and report. Do not commit broken code.

3. **Stage Changes**
   - Review `git status` output
   - Stage relevant files (exclude .env, credentials, build artifacts)

4. **Create Commit**
   - Use conventional commit format from `.claude/CLAUDE.md`
   - Format: `type(scope): description`
   - Include co-authored-by footer

5. **Push to Remote**
   ```bash
   git push -u origin <branch-name>
   ```

## Operation: epic-pr

For creating a PR after all epic stories are complete:

1. **Verify All Stories Complete**
   - Check `docs/sprint-artifacts/sprint-status.yaml`
   - Confirm all stories in epic are marked `done`

2. **Ensure Branch Up-to-Date**
   ```bash
   git fetch origin
   git status
   ```

3. **Push Epic Branch**
   ```bash
   git push -u origin <epic-branch>
   ```

4. **Create Pull Request**
   ```bash
   gh pr create --title "<Epic Title>" --body "$(cat <<'EOF'
   ## Summary
   <List of completed stories with brief descriptions>

   ## Changes
   <Key technical changes and new features>

   ## Test Plan
   - [ ] All unit tests pass (`npm test`)
   - [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
   - [ ] Manual testing on device/simulator

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```

5. **Report PR URL** to user

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
- `feature/[story-name]` - New features and stories
- `fix/[issue-name]` - Bug fixes
- `hotfix/[critical-fix]` - Urgent production fixes

## Commit Message Format

- `feat(scope): description` - New feature
- `fix(scope): description` - Bug fix
- `docs(scope): description` - Documentation only
- `refactor(scope): description` - Code restructuring
- `test(scope): description` - Adding/updating tests
- `chore(scope): description` - Tooling, dependencies, config

## Safety Rules

- NEVER force push to main/master
- NEVER skip pre-commit hooks unless explicitly requested
- NEVER commit .env files or credentials
- Always run tests before committing
- Always verify branch before operations
