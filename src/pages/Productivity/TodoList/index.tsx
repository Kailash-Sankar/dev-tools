/**
 * TodoList - Main Component
 *
 * A comprehensive todo list management tool with the following features:
 * - Create, read, update, and delete todos
 * - Priority levels (high, medium, low) with visual indicators
 * - Filter todos by priority level
 * - Persistent storage using IndexedDB with localStorage fallback
 * - Optimistic UI updates for better user experience
 * - Responsive design with dark theme support
 * - Error handling and graceful degradation
 *
 * @component
 * @example
 * ```tsx
 * import TodoList from './pages/Productivity/TodoList';
 *
 * function App() {
 *   return <TodoList />;
 * }
 * ```
 */

import React, { useState, useCallback } from 'react';
import { Todo, Priority } from './types';
import { useTodos } from './hooks/useTodos';
import { TodoForm } from './components/TodoForm';
import { TodoItem } from './components/TodoItem';
import { TodoFilter } from './components/TodoFilter';
import { EmptyState } from './components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, X } from 'lucide-react';

// Import debug utilities in development
if (process.env.NODE_ENV === 'development') {
  import('./utils/debug');
}

class TodoListErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('TodoList Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            The todo list encountered an error. Please refresh the page to try again.
          </p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

const TodoListContent: React.FC = () => {
  const {
    todos,
    filter,
    isLoading,
    error,
    setFilter,
    addTodo,
    updateTodo,
    deleteTodo,
    refreshTodos,
    clearError,
    filteredTodos,
    todoCounts
  } = useTodos();

  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Handle adding new todo
  const handleAddTodo = useCallback(async (text: string, priority: Priority) => {
    const success = await addTodo(text, priority);
    if (success) {
      setShowAddForm(false);
    }
  }, [addTodo]);

  // Handle editing todo
  const handleEditTodo = useCallback((todo: Todo) => {
    setEditingTodo(todo);
    setShowAddForm(false);
  }, []);

  // Handle updating todo
  const handleUpdateTodo = useCallback(async (text: string, priority: Priority) => {
    if (!editingTodo) return;

    const success = await updateTodo(editingTodo.id, text, priority);
    if (success) {
      setEditingTodo(null);
    }
  }, [editingTodo, updateTodo]);

  // Handle deleting todo
  const handleDeleteTodo = useCallback(async (id: string) => {
    await deleteTodo(id);
  }, [deleteTodo]);

  // Handle canceling edit
  const handleCancelEdit = useCallback(() => {
    setEditingTodo(null);
  }, []);

  // Handle canceling add
  const handleCancelAdd = useCallback(() => {
    setShowAddForm(false);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((newFilter: Priority | 'all') => {
    setFilter(newFilter);
  }, [setFilter]);

  // Handle clearing filter
  const handleClearFilter = useCallback(() => {
    setFilter('all');
  }, [setFilter]);

  // Handle showing add form
  const handleShowAddForm = useCallback(() => {
    setShowAddForm(true);
    setEditingTodo(null);
  }, []);

  const hasAnyTodos = todos.length > 0;
  const hasFilteredTodos = filteredTodos.length > 0;

  return (
    <div className="container mx-auto max-w-4xl p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Todo List</h1>
        <p className="text-muted-foreground">
          Organize your tasks with priority levels and stay productive
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-800 dark:text-red-200 flex-1">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Main Card */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center justify-between">
            <span>Your Todos</span>
            <div className="flex items-center gap-2">
              {hasAnyTodos && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshTodos}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}

              {!showAddForm && !editingTodo && (
                <Button
                  onClick={handleShowAddForm}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  Add Todo
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {/* Add/Edit Form */}
          {(showAddForm || editingTodo) && (
            <TodoForm
              onSubmit={editingTodo ? handleUpdateTodo : handleAddTodo}
              onCancel={editingTodo ? handleCancelEdit : handleCancelAdd}
              initialValues={editingTodo ? {
                text: editingTodo.text,
                priority: editingTodo.priority,
                isEditing: true,
                editingId: editingTodo.id
              } : undefined}
            />
          )}

          {/* Filter */}
          {hasAnyTodos && (
            <TodoFilter
              currentFilter={filter}
              onFilterChange={handleFilterChange}
              todoCounts={todoCounts}
            />
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current" />
                <span>Loading todos...</span>
              </div>
            </div>
          )}

          {/* Todo List */}
          {!isLoading && (
            <>
              {hasFilteredTodos ? (
                <div className="p-4 space-y-3">
                  {filteredTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onEdit={handleEditTodo}
                      onDelete={handleDeleteTodo}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  filter={filter}
                  onAddTodo={handleShowAddForm}
                  onClearFilter={hasAnyTodos ? handleClearFilter : undefined}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Footer Info */}
      {hasAnyTodos && (
        <div className="text-center text-sm text-muted-foreground">
          {todoCounts.all} total todo{todoCounts.all !== 1 ? 's' : ''} •
          Data stored locally in your browser
        </div>
      )}
    </div>
  );
};

export const TodoList: React.FC = () => {
  return (
    <TodoListErrorBoundary>
      <TodoListContent />
    </TodoListErrorBoundary>
  );
};

export default TodoList;
