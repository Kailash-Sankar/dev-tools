/**
 * useTodos Hook - Todo State Management
 * Provides CRUD operations with optimistic updates and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { Todo, Priority, TodoListState } from '../types';
import { todoStorage } from '../services/todoStorage';

interface UseTodosReturn {
  // State
  todos: Todo[];
  filter: Priority | 'all';
  isLoading: boolean;
  error: string | null;

  // Actions
  setFilter: (filter: Priority | 'all') => void;
  addTodo: (text: string, priority: Priority) => Promise<boolean>;
  updateTodo: (id: string, text?: string, priority?: Priority) => Promise<boolean>;
  deleteTodo: (id: string) => Promise<boolean>;
  refreshTodos: () => Promise<void>;
  clearError: () => void;

  // Computed
  filteredTodos: Todo[];
  todoCounts: Record<Priority | 'all', number>;
}

export const useTodos = (): UseTodosReturn => {
  const [state, setState] = useState<TodoListState>({
    todos: [],
    filter: 'all',
    isLoading: true,
    error: null
  });

  /**
   * Load todos from storage
   */
  const loadTodos = useCallback(async () => {
    console.log('useTodos: Starting to load todos...');
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Add a small delay to ensure IndexedDB is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await todoStorage.getTodos();
      console.log('useTodos: Got response from storage:', response);

      if (response.success && response.todos) {
        console.log('useTodos: Setting', response.todos.length, 'todos in state');
        setState(prev => ({
          ...prev,
          todos: response.todos!,
          isLoading: false
        }));
      } else {
        console.error('useTodos: Failed to load todos:', response.error);
        setState(prev => ({
          ...prev,
          error: response.error || 'Failed to load todos',
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('useTodos: Error loading todos:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load todos',
        isLoading: false
      }));
    }
  }, []);

  /**
   * Initialize todos on mount with retry logic
   */
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    const loadWithRetry = async () => {
      try {
        await loadTodos();
      } catch {
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`useTodos: Retry attempt ${retryCount}/${maxRetries}`);
          setTimeout(loadWithRetry, 1000 * retryCount); // Exponential backoff
        } else {
          console.error('useTodos: Max retries reached, giving up');
        }
      }
    };

    loadWithRetry();

    // Listen for visibility changes to reload data when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('useTodos: Tab became visible, reloading todos...');
        loadTodos();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadTodos]);

  /**
   * Set filter for todos
   */
  const setFilter = useCallback((filter: Priority | 'all') => {
    setState(prev => ({ ...prev, filter }));
  }, []);

  /**
   * Add new todo with optimistic update
   */
  const addTodo = useCallback(async (text: string, priority: Priority): Promise<boolean> => {
    // Optimistic update - create temporary todo
    const tempId = `temp_${Date.now()}`;
    const tempTodo: Todo = {
      id: tempId,
      text: text.trim(),
      priority,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to UI immediately
    setState(prev => ({
      ...prev,
      todos: [tempTodo, ...prev.todos],
      error: null
    }));

    try {
      const response = await todoStorage.createTodo({ text, priority });

      if (response.success && response.todo) {
        // Replace temp todo with real todo
        setState(prev => ({
          ...prev,
          todos: prev.todos.map(todo =>
            todo.id === tempId ? response.todo! : todo
          )
        }));
        return true;
      } else {
        // Remove temp todo and show error
        setState(prev => ({
          ...prev,
          todos: prev.todos.filter(todo => todo.id !== tempId),
          error: response.error || 'Failed to add todo'
        }));
        return false;
      }
    } catch (error) {
      // Remove temp todo and show error
      setState(prev => ({
        ...prev,
        todos: prev.todos.filter(todo => todo.id !== tempId),
        error: error instanceof Error ? error.message : 'Failed to add todo'
      }));
      return false;
    }
  }, []);

  /**
   * Update existing todo with optimistic update
   */
  const updateTodo = useCallback(async (
    id: string,
    text?: string,
    priority?: Priority
  ): Promise<boolean> => {
    // Store original todo for rollback
    const originalTodos = state.todos;
    const todoIndex = originalTodos.findIndex(todo => todo.id === id);

    if (todoIndex === -1) {
      setState(prev => ({ ...prev, error: 'Todo not found' }));
      return false;
    }

    const originalTodo = originalTodos[todoIndex];

    // Optimistic update
    const updatedTodo: Todo = {
      ...originalTodo,
      text: text !== undefined ? text.trim() : originalTodo.text,
      priority: priority !== undefined ? priority : originalTodo.priority,
      updatedAt: new Date()
    };

    setState(prev => ({
      ...prev,
      todos: prev.todos.map(todo => todo.id === id ? updatedTodo : todo),
      error: null
    }));

    try {
      const response = await todoStorage.updateTodo({ id, text, priority });

      if (response.success && response.todo) {
        // Update with server response
        setState(prev => ({
          ...prev,
          todos: prev.todos.map(todo =>
            todo.id === id ? response.todo! : todo
          )
        }));
        return true;
      } else {
        // Rollback optimistic update
        setState(prev => ({
          ...prev,
          todos: originalTodos,
          error: response.error || 'Failed to update todo'
        }));
        return false;
      }
    } catch (error) {
      // Rollback optimistic update
      setState(prev => ({
        ...prev,
        todos: originalTodos,
        error: error instanceof Error ? error.message : 'Failed to update todo'
      }));
      return false;
    }
  }, [state.todos]);

  /**
   * Delete todo with optimistic update
   */
  const deleteTodo = useCallback(async (id: string): Promise<boolean> => {
    // Store original todos for rollback
    const originalTodos = state.todos;
    const todoToDelete = originalTodos.find(todo => todo.id === id);

    if (!todoToDelete) {
      setState(prev => ({ ...prev, error: 'Todo not found' }));
      return false;
    }

    // Optimistic update - remove from UI
    setState(prev => ({
      ...prev,
      todos: prev.todos.filter(todo => todo.id !== id),
      error: null
    }));

    try {
      const response = await todoStorage.deleteTodo({ id });

      if (response.success) {
        return true;
      } else {
        // Rollback - add todo back
        setState(prev => ({
          ...prev,
          todos: originalTodos,
          error: response.error || 'Failed to delete todo'
        }));
        return false;
      }
    } catch (error) {
      // Rollback - add todo back
      setState(prev => ({
        ...prev,
        todos: originalTodos,
        error: error instanceof Error ? error.message : 'Failed to delete todo'
      }));
      return false;
    }
  }, [state.todos]);

  /**
   * Refresh todos from storage
   */
  const refreshTodos = useCallback(async () => {
    await loadTodos();
  }, [loadTodos]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Compute filtered todos based on current filter
   */
  const filteredTodos = state.filter === 'all'
    ? state.todos
    : state.todos.filter(todo => todo.priority === state.filter);

  /**
   * Compute todo counts for each priority level
   */
  const todoCounts: Record<Priority | 'all', number> = {
    all: state.todos.length,
    high: state.todos.filter(todo => todo.priority === 'high').length,
    medium: state.todos.filter(todo => todo.priority === 'medium').length,
    low: state.todos.filter(todo => todo.priority === 'low').length
  };

  return {
    // State
    todos: state.todos,
    filter: state.filter,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    setFilter,
    addTodo,
    updateTodo,
    deleteTodo,
    refreshTodos,
    clearError,

    // Computed
    filteredTodos,
    todoCounts
  };
};

export default useTodos;
