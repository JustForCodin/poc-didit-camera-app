## Before you start working on any project
- Create .gitignore

---

## BMAD Slash Command Execution Rules

**CRITICAL**: When a BMAD slash command is invoked, follow these rules EXACTLY. Do NOT search for files manually. Do NOT use Glob/Grep to find workflow files. The slash command expansion provides all instructions needed.

### General Principles
1. **Read the expanded prompt carefully** - it tells you exactly which file(s) to load
2. **Use the `@` syntax** - `@path/to/file` means "read this file NOW"
3. **Never skip steps** - execute in exact order specified
4. **Never batch operations** - one step at a time, save after each
5. **Halt at menus** - wait for user input when menus are presented

---

### Pattern A: YAML-Based Workflows (workflow.xml engine)

**Commands**: `/bmad:bmm:workflows:dev-story`, `/bmad:bmm:workflows:create-story`, `/bmad:bmm:workflows:sprint-planning`, `/bmad:bmm:workflows:code-review`, `/bmad:bmm:workflows:workflow-init`, `/bmad:bmm:workflows:correct-course`, `/bmad:bmm:workflows:retrospective`, `/bmad:bmm:workflows:workflow-status`, `/bmad:bmm:workflows:document-project`, `/bmad:bmm:workflows:create-excalidraw-*`, `/bmad:bmm:workflows:create-tech-spec`, `/bmad:bmm:workflows:quick-dev`, `/bmad:bmm:workflows:testarch-*`

**Execution**:
1. Read `.bmad/core/tasks/workflow.xml` (the execution engine)
2. Read the specific `workflow.yaml` file mentioned in the command
3. Follow `workflow.xml` instructions to process the yaml config
4. Load config from `.bmad/bmm/config.yaml`
5. Load and execute instruction files as directed by workflow.yaml
6. Save outputs after EACH template-output section

---

### Pattern B: Markdown-Based Workflows (direct execution)

**Commands**: `/bmad:bmm:workflows:create-prd`, `/bmad:bmm:workflows:create-architecture`, `/bmad:bmm:workflows:create-ux-design`, `/bmad:bmm:workflows:create-epics-stories`, `/bmad:bmm:workflows:check-implementation-readiness`, `/bmad:bmm:workflows:create-product-brief`, `/bmad:bmm:workflows:research`, `/bmad:bmm:workflows:generate-project-context`, `/bmad:core:workflows:party-mode`, `/bmad:core:workflows:brainstorming-session`

**Execution**:
1. Read the `workflow.md` file mentioned in the command
2. Load config from `.bmad/bmm/config.yaml` or `.bmad/core/config.yaml`
3. Follow the INITIALIZATION section in workflow.md
4. Load and execute `steps/step-01-init.md` (or first step as specified)
5. Progress through steps sequentially - NEVER load multiple steps at once
6. Update frontmatter `stepsCompleted` after each step
7. Halt at menus and wait for user selection

---

### Pattern C: Agent Activations

**Commands**: `/bmad:bmm:agents:dev`, `/bmad:bmm:agents:pm`, `/bmad:bmm:agents:architect`, `/bmad:bmm:agents:analyst`, `/bmad:bmm:agents:sm`, `/bmad:bmm:agents:tea`, `/bmad:bmm:agents:ux-designer`, `/bmad:bmm:agents:tech-writer`, `/bmad:bmm:agents:quick-flow-solo-dev`, `/bmad:core:agents:bmad-master`

**Execution**:
1. Read the agent file from `.bmad/bmm/agents/{name}.md` or `.bmad/core/agents/{name}.md`
2. Load config from `.bmad/core/config.yaml` to get `{user_name}`, `{communication_language}`
3. **Embody the persona completely** - adopt their name, communication style, principles
4. Display greeting using `{user_name}` from config
5. Present the numbered menu from the agent file
6. **STOP and WAIT** for user input - do NOT auto-execute menu items
7. On user input: execute the selected menu item using the handler type (workflow, exec, action)
8. Stay in character until user selects dismiss/exit

---

### Step-File Architecture Rules (for all workflows)

When a workflow uses step files (`steps/step-01-*.md`, `steps/step-02-*.md`, etc.):

1. **NEVER** load multiple step files simultaneously
2. **ALWAYS** read entire step file before taking any action
3. **NEVER** skip steps or optimize the sequence
4. **ALWAYS** update frontmatter `stepsCompleted` array when completing a step
5. **ALWAYS** halt at menus and wait for user input
6. **NEVER** create mental todo lists from future steps
7. Only proceed to next step when:
   - Current step explicitly directs you to load next step, OR
   - User selects `[C] Continue` from a menu

---

### Error Handling

If a slash command fails or file cannot be found:
1. Report the exact error to the user
2. Do NOT attempt to manually search for alternative files
3. Do NOT improvise or guess file locations
4. Ask user for guidance on how to proceed

---

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