# Research: Todo List Tool

## IndexedDB Library Selection

### Decision: Use `idb` library
**Rationale**:
- Lightweight (4.2KB gzipped) vs Dexie.js (17KB gzipped)
- Promise-based wrapper around IndexedDB API
- Maintained by Google Chrome team
- Simple API that matches our basic CRUD needs
- Better tree-shaking support

**Alternatives considered**:
- **Dexie.js**: More features but heavier bundle size, overkill for simple todo storage
- **Native IndexedDB**: Too verbose and callback-heavy for modern React development
- **LocalStorage**: Limited storage size, synchronous API blocks UI

### Installation Command:
```bash
npm install idb
npm install --save-dev @types/idb
```

## Data Model Design

### Decision: Simple flat structure
**Rationale**:
- Todo items are independent entities
- No complex relationships needed
- Easy to query and filter
- Matches functional requirements exactly

**Schema**:
```typescript
interface Todo {
  id: string;           // UUID for unique identification
  text: string;         // Todo description
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;      // For sorting by creation time
  updatedAt: Date;      // For tracking modifications
}
```

**Alternatives considered**:
- **Normalized structure**: Overkill for simple todo app
- **Categories/Projects**: Not in requirements, would add complexity

## State Management Approach

### Decision: React useState + useEffect with custom hook
**Rationale**:
- Follows existing DevTools pattern (no global state except theme)
- Custom hook encapsulates IndexedDB operations
- Component-level state for UI responsiveness
- Automatic persistence on state changes

**Pattern**:
```typescript
const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  // CRUD operations that sync with IndexedDB
  const addTodo = async (text: string, priority: Priority) => { ... };
  const updateTodo = async (id: string, updates: Partial<Todo>) => { ... };
  const deleteTodo = async (id: string) => { ... };

  return { todos, filter, setFilter, addTodo, updateTodo, deleteTodo };
};
```

**Alternatives considered**:
- **Jotai atoms**: Would require global state, against DevTools constitution
- **Context API**: Overkill for single-component tool
- **External state library**: Adds unnecessary dependency

## UI Component Architecture

### Decision: Single page component with sub-components
**Rationale**:
- Matches existing DevTools tool pattern
- Easy to maintain and test
- Clear separation of concerns
- Responsive design with Tailwind CSS

**Component Structure**:
```
TodoList/
├── index.tsx           # Main component with useTodos hook
├── TodoForm.tsx        # Add/edit form with priority selector
├── TodoItem.tsx        # Individual todo with edit/delete actions
├── TodoFilter.tsx      # Priority filter buttons
└── types.ts           # TypeScript interfaces
```

**Alternatives considered**:
- **Single monolithic component**: Hard to maintain and test
- **Over-engineered separation**: Would violate simplicity principle

## Priority Visual Design

### Decision: Colored badges with consistent styling
**Rationale**:
- Uses existing Radix UI Badge component
- Consistent with DevTools design system
- Accessible color choices for dark/light themes
- Clear visual hierarchy

**Color Mapping**:
- **High**: Red badge (urgent, attention-grabbing)
- **Medium**: Yellow/Orange badge (moderate importance)
- **Low**: Gray badge (subtle, lower priority)

**Implementation**:
```typescript
const priorityStyles = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
};
```

## Error Handling Strategy

### Decision: User-friendly error boundaries with fallbacks
**Rationale**:
- IndexedDB can fail in private browsing mode
- Network issues shouldn't break the tool
- Graceful degradation maintains usability

**Approach**:
- Error boundary component wraps todo list
- Fallback to localStorage if IndexedDB unavailable
- User notifications for operation failures
- Retry mechanisms for transient errors

**Alternatives considered**:
- **Silent failures**: Poor user experience
- **Hard crashes**: Breaks entire DevTools app
- **Complex retry logic**: Overengineering for simple tool

## Performance Considerations

### Decision: Optimistic UI updates with background sync
**Rationale**:
- Immediate UI feedback for better UX
- IndexedDB operations are async but fast
- Error handling reverts optimistic changes
- Matches modern web app patterns

**Implementation Strategy**:
1. Update UI state immediately
2. Perform IndexedDB operation in background
3. Revert UI changes if operation fails
4. Show error message to user

## Integration with DevTools App

### Decision: Follow existing tool registration pattern
**Rationale**:
- Consistent with other tools in the app
- Lazy loading for performance
- URL routing for bookmarking
- Navigation integration

**Integration Steps**:
1. Create component in `/src/pages/Productivity/TodoList.tsx`
2. Add lazy import to `App.tsx`
3. Add route to React Router configuration
4. Register in `toolConfig.ts` for navigation menu
5. Add to "Productivity" category (new category)

**URL Structure**: `/todo-list` (following existing pattern)
