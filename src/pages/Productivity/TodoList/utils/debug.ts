/**
 * Debug utilities for TodoList persistence issues
 */

import { todoStorage } from '../services/todoStorage';

export const debugTodoStorage = {
  /**
   * Check storage status and capabilities
   */
  async checkStorageStatus() {
    console.log('=== TodoList Storage Debug ===');

    // Check IndexedDB availability
    const hasIndexedDB = 'indexedDB' in window;
    console.log('IndexedDB available:', hasIndexedDB);

    // Check localStorage availability
    const hasLocalStorage = 'localStorage' in window;
    console.log('localStorage available:', hasLocalStorage);

    // Get storage info from service
    const storageInfo = todoStorage.getStorageInfo();
    console.log('Storage service info:', storageInfo);

    // Try to get todos
    try {
      const response = await todoStorage.getTodos();
      console.log('Current todos response:', response);
    } catch (error) {
      console.error('Error getting todos:', error);
    }

    console.log('=== End Debug ===');
  },

  /**
   * Test creating and retrieving a todo
   */
  async testCreateAndRetrieve() {
    console.log('=== Testing Create and Retrieve ===');

    try {
      // Create test todo
      const testTodo = {
        text: `Test todo ${Date.now()}`,
        priority: 'medium' as const
      };

      console.log('Creating test todo:', testTodo);
      const createResponse = await todoStorage.createTodo(testTodo);
      console.log('Create response:', createResponse);

      if (createResponse.success) {
        // Retrieve todos
        console.log('Retrieving todos...');
        const getResponse = await todoStorage.getTodos();
        console.log('Get response:', getResponse);

        // Clean up - delete the test todo
        if (createResponse.todo) {
          console.log('Cleaning up test todo...');
          const deleteResponse = await todoStorage.deleteTodo({ id: createResponse.todo.id });
          console.log('Delete response:', deleteResponse);
        }
      }
    } catch (error) {
      console.error('Test failed:', error);
    }

    console.log('=== End Test ===');
  },

  /**
   * Clear all todos (for debugging)
   */
  async clearAllTodos() {
    console.log('=== Clearing All Todos ===');

    try {
      const response = await todoStorage.getTodos();
      if (response.success && response.todos) {
        console.log(`Found ${response.todos.length} todos to delete`);

        for (const todo of response.todos) {
          await todoStorage.deleteTodo({ id: todo.id });
          console.log(`Deleted todo: ${todo.text}`);
        }

        console.log('All todos cleared');
      }
    } catch (error) {
      console.error('Error clearing todos:', error);
    }

    console.log('=== End Clear ===');
  }
};

// Make debug utilities available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugTodoStorage = debugTodoStorage;
}
