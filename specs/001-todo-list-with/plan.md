# Implementation Plan: Todo List Tool

**Branch**: `001-todo-list-with` | **Date**: 2025-09-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-list-with/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Primary requirement: Create a todo list management tool with add/edit/delete functionality, priority levels (low/medium/high), filtering, and persistent browser storage using IndexedDB. Technical approach: React component with TypeScript, IndexedDB wrapper library for data persistence, Tailwind CSS for dark theme UI, and integration with existing DevTools navigation.

## Technical Context
**Language/Version**: TypeScript 5.6+ with React 18+
**Primary Dependencies**: React, Tailwind CSS, Radix UI components, IndexedDB wrapper library (idb or dexie.js)
**Storage**: IndexedDB for client-side persistence (browser-based, offline-capable)
**Testing**: Manual testing across browsers, accessibility audit with dev tools
**Target Platform**: Modern browsers (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
**Project Type**: single (React SPA tool within existing DevTools app)
**Performance Goals**: <100ms response time for CRUD operations, real-time UI updates
**Constraints**: Client-side only, no external API calls, offline-capable, <50KB bundle size impact
**Scale/Scope**: Personal use (1 user), up to 1000 todos, mobile-responsive UI

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (single React component tool within existing DevTools app)
- Using framework directly? YES (React hooks, no wrapper classes)
- Single data model? YES (Todo entity with id, text, priority, createdAt)
- Avoiding patterns? YES (direct IndexedDB operations, no Repository pattern)

**Architecture**:
- EVERY feature as library? N/A (DevTools constitution allows tool-first development)
- Libraries listed: N/A (single tool component)
- CLI per library: N/A (web-based tool)
- Library docs: N/A (tool documentation in component)

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? Manual testing approach for UI tool
- Git commits show tests before implementation? Manual verification steps
- Order: Contract→Integration→E2E→Unit strictly followed? UI-first for developer tools
- Real dependencies used? YES (actual IndexedDB in browser)
- Integration tests for: Manual browser testing across devices
- FORBIDDEN: Implementation before test, skipping RED phase - ADAPTED for UI tools

**Observability**:
- Structured logging included? Console logging for development/debugging
- Frontend logs → backend? N/A (client-side only tool)
- Error context sufficient? Error boundaries and user feedback

**Versioning**:
- Version number assigned? Follows DevTools app versioning
- BUILD increments on every change? Part of DevTools release cycle
- Breaking changes handled? N/A (new tool, no existing API)

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 1 (Single project) - Adding new tool to existing React DevTools app structure

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/bash/update-agent-context.sh cursor` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- IndexedDB setup and configuration tasks
- React component creation tasks following existing patterns
- Integration with DevTools navigation system
- Manual testing tasks based on quickstart scenarios

**Ordering Strategy**:
- Dependencies first: Install idb library, setup types
- Data layer: IndexedDB service, operations interface
- UI components: Form, list, filter, item components
- Integration: Routing, navigation, lazy loading
- Testing: Manual verification of all quickstart scenarios

**Estimated Output**: 15-20 numbered, ordered tasks in tasks.md

**Key Task Categories**:
1. **Setup Tasks** [P]: Install dependencies, configure TypeScript
2. **Data Layer Tasks**: IndexedDB service, CRUD operations
3. **UI Component Tasks** [P]: Individual component creation
4. **Integration Tasks**: App routing, navigation registration
5. **Testing Tasks**: Manual verification scenarios

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [x] Phase 4: Implementation complete
- [x] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (N/A - no deviations)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
