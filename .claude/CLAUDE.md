## Before you start working on any project
- Create .gitignore

## Git Commit Policy
- After completing any development work (stories, features, fixes), create a git commit with a descriptive message
- Follow conventional commit format: type(scope): description
- Always run tests before committing
- Include relevant files and exclude temporary/build artifacts

## Git Workflow (Simplified Git Flow)
**Branch Strategy:**
- **main**: Production-ready code, protected branch
- **feature/[story-name]**: New features and stories (branch from main)
- **fix/[issue-name]**: Bug fixes (branch from main)
- **hotfix/[critical-fix]**: Urgent production fixes (branch from main)

**Development Process:**
1. Create feature branch from main: `git checkout -b feature/camera-recording`
2. Commit work with descriptive messages following conventional format
3. Push branch and create pull request when ready
4. After code review and approval, merge to main
5. Delete feature branch after successful merge

**Commit Message Format:**
- `feat(scope): description` - New feature
- `fix(scope): description` - Bug fix
- `docs(scope): description` - Documentation only
- `refactor(scope): description` - Code restructuring
- `test(scope): description` - Adding/updating tests
- `chore(scope): description` - Tooling, dependencies, config

**Examples:**
- `feat(camera): add frame capture with configurable interval`
- `fix(backend): resolve authentication token expiry handling`
- `docs(api): update DiditCamera integration guide`