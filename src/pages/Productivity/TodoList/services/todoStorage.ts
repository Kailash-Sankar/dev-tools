/**
 * Todo Storage Service - IndexedDB Implementation
 * Handles all CRUD operations for todos with localStorage fallback
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import {
  Todo,
  Priority,
  CreateTodoRequest,
  CreateTodoResponse,
  UpdateTodoRequest,
  UpdateTodoResponse,
  DeleteTodoRequest,
  DeleteTodoResponse,
  GetTodosRequest,
  GetTodosResponse,
  TodoOperations,
  TODO_VALIDATION,
  DB_CONFIG
} from '../types';

// IndexedDB Schema
interface TodoDBSchema extends DBSchema {
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

class TodoStorageService implements TodoOperations {
  private db: IDBPDatabase<TodoDBSchema> | null = null;
  private isIndexedDBAvailable = true;
  private readonly storageKey = 'devtools-todos';

  constructor() {
    this.initializeDatabase();
  }

  /**
   * Initialize IndexedDB database with fallback detection
   */
  private async initializeDatabase(): Promise<void> {
    try {
      this.db = await openDB<TodoDBSchema>(DB_CONFIG.DB_NAME, DB_CONFIG.DB_VERSION, {
        upgrade(db) {
          // Create todos object store
          const store = db.createObjectStore('todos', { keyPath: 'id' });

          // Create indexes for efficient querying
          store.createIndex('priority', 'priority');
          store.createIndex('createdAt', 'createdAt');
          store.createIndex('updatedAt', 'updatedAt');
        },
      });
    } catch (error) {
      console.warn('IndexedDB not available, falling back to localStorage:', error);
      this.isIndexedDBAvailable = false;
    }
  }

  /**
   * Generate unique ID for todos
   */
  private generateId(): string {
    return `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate todo text input
   */
  private validateTodoText(text: string): { isValid: boolean; error?: string } {
    if (!text || text.trim().length < TODO_VALIDATION.TEXT_MIN_LENGTH) {
      return { isValid: false, error: 'Todo text cannot be empty' };
    }
    if (text.length > TODO_VALIDATION.TEXT_MAX_LENGTH) {
      return { isValid: false, error: `Todo text cannot exceed ${TODO_VALIDATION.TEXT_MAX_LENGTH} characters` };
    }
    return { isValid: true };
  }

  /**
   * Validate priority value
   */
  private validatePriority(priority: Priority): { isValid: boolean; error?: string } {
    if (!TODO_VALIDATION.VALID_PRIORITIES.includes(priority)) {
      return { isValid: false, error: 'Invalid priority level' };
    }
    return { isValid: true };
  }

  /**
   * LocalStorage fallback methods
   */
  private getFromLocalStorage(): Todo[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];

      const todos = JSON.parse(data);
      // Convert date strings back to Date objects
      return todos.map((todo: Todo & { createdAt: string; updatedAt: string }) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt)
      }));
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  private saveToLocalStorage(todos: Todo[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(todos));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw new Error('Failed to save todos');
    }
  }

  /**
   * Create a new todo item
   */
  async createTodo(request: CreateTodoRequest): Promise<CreateTodoResponse> {
    try {
      // Validate input
      const textValidation = this.validateTodoText(request.text);
      if (!textValidation.isValid) {
        return { success: false, error: textValidation.error };
      }

      const priorityValidation = this.validatePriority(request.priority);
      if (!priorityValidation.isValid) {
        return { success: false, error: priorityValidation.error };
      }

      // Create todo object
      const now = new Date();
      const todo: Todo = {
        id: this.generateId(),
        text: request.text.trim(),
        priority: request.priority,
        createdAt: now,
        updatedAt: now
      };

      // Save to storage
      if (this.isIndexedDBAvailable && this.db) {
        await this.db.add('todos', todo);
      } else {
        const todos = this.getFromLocalStorage();
        todos.push(todo);
        this.saveToLocalStorage(todos);
      }

      return { success: true, todo };
    } catch (error) {
      console.error('Error creating todo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create todo'
      };
    }
  }

  /**
   * Get all todos, optionally filtered by priority
   */
  async getTodos(request?: GetTodosRequest): Promise<GetTodosResponse> {
    try {
      let todos: Todo[];

      if (this.isIndexedDBAvailable && this.db) {
        // Get from IndexedDB
        if (request?.filter && request.filter !== 'all') {
          // Use index for efficient filtering
          todos = await this.db.getAllFromIndex('todos', 'priority', request.filter);
        } else {
          todos = await this.db.getAll('todos');
        }
      } else {
        // Get from localStorage
        todos = this.getFromLocalStorage();
        if (request?.filter && request.filter !== 'all') {
          todos = todos.filter(todo => todo.priority === request.filter);
        }
      }

      // Sort by creation date (newest first)
      todos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return { success: true, todos };
    } catch (error) {
      console.error('Error getting todos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get todos'
      };
    }
  }

  /**
   * Update an existing todo
   */
  async updateTodo(request: UpdateTodoRequest): Promise<UpdateTodoResponse> {
    try {
      // Validate input
      if (request.text !== undefined) {
        const textValidation = this.validateTodoText(request.text);
        if (!textValidation.isValid) {
          return { success: false, error: textValidation.error };
        }
      }

      if (request.priority !== undefined) {
        const priorityValidation = this.validatePriority(request.priority);
        if (!priorityValidation.isValid) {
          return { success: false, error: priorityValidation.error };
        }
      }

      let todo: Todo | undefined;

      if (this.isIndexedDBAvailable && this.db) {
        // Get existing todo from IndexedDB
        todo = await this.db.get('todos', request.id);
        if (!todo) {
          return { success: false, error: 'Todo not found' };
        }

        // Update fields
        const updatedTodo: Todo = {
          ...todo,
          text: request.text !== undefined ? request.text.trim() : todo.text,
          priority: request.priority !== undefined ? request.priority : todo.priority,
          updatedAt: new Date()
        };

        await this.db.put('todos', updatedTodo);
        todo = updatedTodo;
      } else {
        // Update in localStorage
        const todos = this.getFromLocalStorage();
        const todoIndex = todos.findIndex(t => t.id === request.id);

        if (todoIndex === -1) {
          return { success: false, error: 'Todo not found' };
        }

        const updatedTodo: Todo = {
          ...todos[todoIndex],
          text: request.text !== undefined ? request.text.trim() : todos[todoIndex].text,
          priority: request.priority !== undefined ? request.priority : todos[todoIndex].priority,
          updatedAt: new Date()
        };

        todos[todoIndex] = updatedTodo;
        this.saveToLocalStorage(todos);
        todo = updatedTodo;
      }

      return { success: true, todo };
    } catch (error) {
      console.error('Error updating todo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update todo'
      };
    }
  }

  /**
   * Delete a todo by ID
   */
  async deleteTodo(request: DeleteTodoRequest): Promise<DeleteTodoResponse> {
    try {
      if (this.isIndexedDBAvailable && this.db) {
        // Check if todo exists
        const todo = await this.db.get('todos', request.id);
        if (!todo) {
          return { success: false, error: 'Todo not found' };
        }

        await this.db.delete('todos', request.id);
      } else {
        // Delete from localStorage
        const todos = this.getFromLocalStorage();
        const todoIndex = todos.findIndex(t => t.id === request.id);

        if (todoIndex === -1) {
          return { success: false, error: 'Todo not found' };
        }

        todos.splice(todoIndex, 1);
        this.saveToLocalStorage(todos);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting todo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete todo'
      };
    }
  }

  /**
   * Get storage info for debugging
   */
  getStorageInfo(): { type: 'indexeddb' | 'localstorage'; available: boolean } {
    return {
      type: this.isIndexedDBAvailable ? 'indexeddb' : 'localstorage',
      available: this.isIndexedDBAvailable || typeof Storage !== 'undefined'
    };
  }
}

// Export singleton instance
export const todoStorage = new TodoStorageService();
export default todoStorage;
