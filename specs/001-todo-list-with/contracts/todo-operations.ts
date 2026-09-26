/**
 * Todo List Tool - Operation Contracts
 * Defines the interface for all todo CRUD operations
 */

export interface Todo {
  id: string;
  text: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export type Priority = Todo['priority'];

export interface CreateTodoRequest {
  text: string;
  priority: Priority;
}

export interface CreateTodoResponse {
  success: boolean;
  todo?: Todo;
  error?: string;
}

export interface UpdateTodoRequest {
  id: string;
  text?: string;
  priority?: Priority;
}

export interface UpdateTodoResponse {
  success: boolean;
  todo?: Todo;
  error?: string;
}

export interface DeleteTodoRequest {
  id: string;
}

export interface DeleteTodoResponse {
  success: boolean;
  error?: string;
}

export interface GetTodosRequest {
  filter?: Priority | 'all';
}

export interface GetTodosResponse {
  success: boolean;
  todos?: Todo[];
  error?: string;
}

/**
 * Todo Operations Interface
 * All operations return promises for async IndexedDB operations
 */
export interface TodoOperations {
  /**
   * Create a new todo item
   * @param request - Todo text and priority
   * @returns Promise resolving to created todo or error
   */
  createTodo(request: CreateTodoRequest): Promise<CreateTodoResponse>;

  /**
   * Get all todos, optionally filtered by priority
   * @param request - Optional priority filter
   * @returns Promise resolving to todo list or error
   */
  getTodos(request?: GetTodosRequest): Promise<GetTodosResponse>;

  /**
   * Update an existing todo
   * @param request - Todo ID and fields to update
   * @returns Promise resolving to updated todo or error
   */
  updateTodo(request: UpdateTodoRequest): Promise<UpdateTodoResponse>;

  /**
   * Delete a todo by ID
   * @param request - Todo ID to delete
   * @returns Promise resolving to success status or error
   */
  deleteTodo(request: DeleteTodoRequest): Promise<DeleteTodoResponse>;
}

/**
 * Error Types for Todo Operations
 */
export enum TodoErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  STORAGE_ERROR = 'STORAGE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface TodoError {
  type: TodoErrorType;
  message: string;
  details?: unknown;
}

/**
 * Validation Rules
 */
export const TODO_VALIDATION = {
  TEXT_MIN_LENGTH: 1,
  TEXT_MAX_LENGTH: 500,
  VALID_PRIORITIES: ['low', 'medium', 'high'] as const,
  DEFAULT_PRIORITY: 'medium' as Priority
} as const;

/**
 * UI State Contracts
 */
export interface TodoListState {
  todos: Todo[];
  filter: Priority | 'all';
  isLoading: boolean;
  error: string | null;
}

export interface TodoFormState {
  text: string;
  priority: Priority;
  isEditing: boolean;
  editingId: string | null;
}

/**
 * Component Props Contracts
 */
export interface TodoItemProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export interface TodoFormProps {
  onSubmit: (text: string, priority: Priority) => void;
  onCancel?: () => void;
  initialValues?: Partial<TodoFormState>;
}

export interface TodoFilterProps {
  currentFilter: Priority | 'all';
  onFilterChange: (filter: Priority | 'all') => void;
  todoCounts: Record<Priority | 'all', number>;
}
