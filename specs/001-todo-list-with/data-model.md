# Data Model: Todo List Tool

## Core Entities

### Todo
**Purpose**: Represents a single todo item with priority and metadata

**Fields**:
- `id: string` - Unique identifier (UUID v4)
- `text: string` - Todo description/content (1-500 characters)
- `priority: 'low' | 'medium' | 'high'` - Priority level
- `createdAt: Date` - Creation timestamp
- `updatedAt: Date` - Last modification timestamp

**Validation Rules**:
- `text`: Required, non-empty, max 500 characters
- `priority`: Must be one of the three allowed values
- `id`: Must be unique within the database
- `createdAt`: Set automatically on creation, immutable
- `updatedAt`: Updated automatically on any modification

**State Transitions**:
- **Create**: New todo with generated ID and current timestamps
- **Update**: Modify text and/or priority, update `updatedAt`
- **Delete**: Remove from storage permanently

### Priority
**Purpose**: Enumeration for todo importance levels

**Values**:
- `'low'` - Low priority, gray visual indicator
- `'medium'` - Medium priority, yellow visual indicator
- `'high'` - High priority, red visual indicator

**Display Properties**:
- Each priority has associated color scheme for light/dark themes
- Used for filtering and visual categorization
- Default priority for new todos: `'medium'`

## Database Schema (IndexedDB)

### Object Store: `todos`
**Key Path**: `id`
**Auto Increment**: false (using UUID)

**Indexes**:
- `priority` - For filtering by priority level
- `createdAt` - For sorting by creation date
- `updatedAt` - For sorting by modification date

### Database Configuration
```typescript
const DB_NAME = 'DevToolsTodos';
const DB_VERSION = 1;
const STORE_NAME = 'todos';

interface TodoDB extends DBSchema {
  todos: {
    key: string;
    value: Todo;
    indexes: {
      priority: string;
      createdAt: Date;
      updatedAt: Date;
    };
  };
}
```

## Data Operations

### Create Todo
**Input**: `{ text: string, priority: Priority }`
**Output**: `Todo` (with generated ID and timestamps)
**Validation**: Text non-empty, priority valid enum value

### Read Todos
**Input**: Optional filter `{ priority?: Priority }`
**Output**: `Todo[]` (sorted by createdAt descending)
**Behavior**: Returns all todos or filtered by priority

### Update Todo
**Input**: `{ id: string, text?: string, priority?: Priority }`
**Output**: `Todo` (updated entity)
**Validation**: ID exists, at least one field to update

### Delete Todo
**Input**: `{ id: string }`
**Output**: `boolean` (success status)
**Behavior**: Removes todo from storage, returns false if not found

## Data Persistence Strategy

### Storage Layer
- **Primary**: IndexedDB via `idb` library
- **Fallback**: localStorage (if IndexedDB unavailable)
- **Scope**: Per-origin (domain-specific storage)

### Synchronization
- **Immediate**: All operations sync to storage immediately
- **Optimistic**: UI updates before storage confirmation
- **Error Handling**: Revert UI changes if storage fails

### Data Migration
- **Version 1**: Initial schema (current)
- **Future**: Migration strategy for schema changes
- **Backward Compatibility**: Graceful handling of old data formats

## Performance Characteristics

### Expected Load
- **Typical**: 10-50 todos per user
- **Maximum**: 1000 todos (design limit)
- **Operations**: 95% reads, 5% writes

### Query Performance
- **All todos**: O(n) scan, acceptable for <1000 items
- **Filter by priority**: O(n) with index, fast lookup
- **Sort by date**: Index-based, O(log n) + O(k) for results

### Storage Limits
- **IndexedDB**: ~50MB typical browser limit
- **Per todo**: ~100 bytes average (text + metadata)
- **Capacity**: 500,000+ todos theoretical limit
