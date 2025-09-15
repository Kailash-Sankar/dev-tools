# Tasks: Todo List Tool

**Input**: Design documents from `/specs/001-todo-list-with/`
**Prerequisites**: plan.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓)

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Tech stack: React 18+, TypeScript, IndexedDB via idb library
   → Structure: Single project, React SPA tool
2. Load design documents:
   → data-model.md: Todo entity with CRUD operations
   → contracts/: TodoOperations interface with request/response types
   → research.md: idb library selection, component architecture
3. Generate tasks by category:
   → Setup: Install dependencies, TypeScript configuration
   → Data Layer: IndexedDB service, CRUD operations
   → UI Components: Form, list, filter, item components
   → Integration: DevTools app routing and navigation
   → Testing: Manual verification scenarios
4. Apply task rules:
   → Different components = mark [P] for parallel
   → Same file = sequential (no [P])
   → Data layer before UI components
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness: All contracts implemented, all components created
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/` at repository root (existing DevTools app structure)
- All paths relative to `/Users/ksankar/Projects/dev-tools/`

## Phase 3.1: Setup & Dependencies
- [ ] **T001** Install idb library: `npm install idb && npm install --save-dev @types/idb`
- [ ] **T002** [P] Create TypeScript types file at `src/pages/Productivity/TodoList/types.ts`
- [ ] **T003** [P] Create directory structure: `src/pages/Productivity/TodoList/`

## Phase 3.2: Data Layer (IndexedDB Service)
- [ ] **T004** Create IndexedDB service at `src/pages/Productivity/TodoList/services/todoStorage.ts` with database setup
- [ ] **T005** Implement createTodo operation in `src/pages/Productivity/TodoList/services/todoStorage.ts`
- [ ] **T006** Implement getTodos operation with filtering in `src/pages/Productivity/TodoList/services/todoStorage.ts`
- [ ] **T007** Implement updateTodo operation in `src/pages/Productivity/TodoList/services/todoStorage.ts`
- [ ] **T008** Implement deleteTodo operation in `src/pages/Productivity/TodoList/services/todoStorage.ts`
- [ ] **T009** Add localStorage fallback for private browsing in `src/pages/Productivity/TodoList/services/todoStorage.ts`

## Phase 3.3: Custom Hooks
- [ ] **T010** Create useTodos hook at `src/pages/Productivity/TodoList/hooks/useTodos.ts` with state management
- [ ] **T011** Implement CRUD operations in useTodos hook with optimistic updates
- [ ] **T012** Add error handling and loading states to useTodos hook

## Phase 3.4: UI Components (Can run in parallel after data layer)
- [ ] **T013** [P] Create TodoForm component at `src/pages/Productivity/TodoList/components/TodoForm.tsx`
- [ ] **T014** [P] Create TodoItem component at `src/pages/Productivity/TodoList/components/TodoItem.tsx`
- [ ] **T015** [P] Create TodoFilter component at `src/pages/Productivity/TodoList/components/TodoFilter.tsx`
- [ ] **T016** [P] Create PriorityBadge component at `src/pages/Productivity/TodoList/components/PriorityBadge.tsx`
- [ ] **T017** [P] Create EmptyState component at `src/pages/Productivity/TodoList/components/EmptyState.tsx`

## Phase 3.5: Main Component & Integration
- [ ] **T018** Create main TodoList component at `src/pages/Productivity/TodoList/index.tsx`
- [ ] **T019** Integrate all sub-components in main TodoList component
- [ ] **T020** Add error boundary wrapper to TodoList component
- [ ] **T021** Implement responsive design and dark theme compatibility

## Phase 3.6: DevTools App Integration
- [ ] **T022** Add lazy import for TodoList in `src/App.tsx`
- [ ] **T023** Add route `/todo-list` to React Router in `src/App.tsx`
- [ ] **T024** Register todo list tool in `src/layout/toolConfig.ts`
- [ ] **T025** Update navigation menu with "Productivity" category if needed

## Phase 3.7: Validation & Testing
- [ ] **T026** [P] Manual test: Create new todo (Scenario 1 from quickstart.md)
- [ ] **T027** [P] Manual test: Edit existing todo (Scenario 2 from quickstart.md)
- [ ] **T028** [P] Manual test: Filter by priority (Scenario 3 from quickstart.md)
- [ ] **T029** [P] Manual test: Delete todo (Scenario 4 from quickstart.md)
- [ ] **T030** [P] Manual test: Data persistence across browser sessions (Scenario 5 from quickstart.md)
- [ ] **T031** [P] Manual test: Empty state handling (Scenario 6 from quickstart.md)
- [ ] **T032** [P] Manual test: Input validation (Scenario 7 from quickstart.md)
- [ ] **T033** [P] Manual test: Mobile responsiveness (Scenario 8 from quickstart.md)
- [ ] **T034** [P] Manual test: Dark theme compatibility (Scenario 9 from quickstart.md)
- [ ] **T035** [P] Manual test: Error handling and fallbacks (Scenario 10 from quickstart.md)

## Phase 3.8: Polish & Performance
- [ ] **T036** [P] Add JSDoc documentation to all components and hooks
- [ ] **T037** [P] Verify TypeScript compilation with no errors
- [ ] **T038** [P] Run ESLint and fix any violations
- [ ] **T039** [P] Test accessibility with browser dev tools (WCAG 2.1 AA)
- [ ] **T040** Performance audit: Verify <100ms CRUD operations and <50KB bundle impact

## Dependencies
```
Setup (T001-T003) → Data Layer (T004-T009) → Hooks (T010-T012) → UI Components (T013-T017) → Integration (T018-T025) → Testing (T026-T035) → Polish (T036-T040)

Specific dependencies:
- T004 blocks T005-T009 (database setup before operations)
- T010 requires T004-T009 (hooks need storage service)
- T013-T017 require T002 (components need types)
- T018-T021 require T010-T017 (main component needs hooks and sub-components)
- T022-T025 require T018 (app integration needs main component)
- T026-T035 require T022-T025 (testing needs full integration)
```

## Parallel Execution Examples

### Phase 3.1 Setup (All parallel):
```bash
# T001-T003 can run together:
npm install idb && npm install --save-dev @types/idb
mkdir -p src/pages/Productivity/TodoList/{components,hooks,services}
# Create types.ts file
```

### Phase 3.4 UI Components (All parallel after T002, T010-T012):
```bash
# T013-T017 can run together:
Task: "Create TodoForm component at src/pages/Productivity/TodoList/components/TodoForm.tsx"
Task: "Create TodoItem component at src/pages/Productivity/TodoList/components/TodoItem.tsx"
Task: "Create TodoFilter component at src/pages/Productivity/TodoList/components/TodoFilter.tsx"
Task: "Create PriorityBadge component at src/pages/Productivity/TodoList/components/PriorityBadge.tsx"
Task: "Create EmptyState component at src/pages/Productivity/TodoList/components/EmptyState.tsx"
```

### Phase 3.7 Testing (All parallel after T025):
```bash
# T026-T035 can run together:
Task: "Manual test: Create new todo (Scenario 1 from quickstart.md)"
Task: "Manual test: Edit existing todo (Scenario 2 from quickstart.md)"
Task: "Manual test: Filter by priority (Scenario 3 from quickstart.md)"
# ... and so on for all test scenarios
```

### Phase 3.8 Polish (All parallel after T035):
```bash
# T036-T040 can run together:
Task: "Add JSDoc documentation to all components and hooks"
Task: "Verify TypeScript compilation with no errors"
Task: "Run ESLint and fix any violations"
Task: "Test accessibility with browser dev tools"
Task: "Performance audit: Verify <100ms CRUD operations"
```

## Implementation Notes
- **[P] tasks** = different files, no dependencies between them
- **Sequential tasks** = same file modifications or dependent operations
- **TDD Adaptation**: For UI tools, manual testing scenarios replace unit tests
- **Error Handling**: Each component should handle errors gracefully
- **Performance**: Optimize for <100ms response times and minimal bundle impact
- **Accessibility**: Ensure WCAG 2.1 AA compliance throughout

## File Structure After Completion
```
src/pages/Productivity/TodoList/
├── index.tsx                 # Main TodoList component (T018-T021)
├── types.ts                  # TypeScript interfaces (T002)
├── components/
│   ├── TodoForm.tsx         # Add/edit form (T013)
│   ├── TodoItem.tsx         # Individual todo item (T014)
│   ├── TodoFilter.tsx       # Priority filter buttons (T015)
│   ├── PriorityBadge.tsx    # Priority visual indicator (T016)
│   └── EmptyState.tsx       # Empty list state (T017)
├── hooks/
│   └── useTodos.ts          # Todo state management (T010-T012)
└── services/
    └── todoStorage.ts       # IndexedDB operations (T004-T009)
```

## Validation Checklist
*GATE: Checked before task completion*

- [x] All contracts have corresponding implementations (TodoOperations interface → todoStorage.ts)
- [x] All entities have service layer (Todo entity → todoStorage.ts + useTodos.ts)
- [x] All UI components created for complete functionality
- [x] Parallel tasks are truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Manual testing covers all quickstart scenarios
- [x] Integration follows existing DevTools patterns

**Total Tasks**: 40 tasks
**Estimated Time**: 6-8 hours for experienced React developer
**Parallel Opportunities**: 18 tasks can run in parallel across 4 phases
