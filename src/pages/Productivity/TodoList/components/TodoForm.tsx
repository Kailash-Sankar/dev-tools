/**
 * TodoForm Component
 * Form for adding and editing todos with validation
 */

import React, { useState, useEffect } from 'react';
import { Priority, TodoFormProps, TODO_VALIDATION } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, X } from 'lucide-react';

export const TodoForm: React.FC<TodoFormProps> = ({
  onSubmit,
  onCancel,
  initialValues
}) => {
  const [text, setText] = useState(initialValues?.text || '');
  const [priority, setPriority] = useState<Priority>(
    initialValues?.priority || TODO_VALIDATION.DEFAULT_PRIORITY
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = initialValues?.isEditing || false;

  // Update form when initial values change
  useEffect(() => {
    if (initialValues) {
      setText(initialValues.text || '');
      setPriority(initialValues.priority || TODO_VALIDATION.DEFAULT_PRIORITY);
    }
  }, [initialValues]);

  const validateForm = (): string | null => {
    const trimmedText = text.trim();

    if (trimmedText.length < TODO_VALIDATION.TEXT_MIN_LENGTH) {
      return 'Todo text cannot be empty';
    }

    if (trimmedText.length > TODO_VALIDATION.TEXT_MAX_LENGTH) {
      return `Todo text cannot exceed ${TODO_VALIDATION.TEXT_MAX_LENGTH} characters`;
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(text.trim(), priority);

      // Reset form if not editing
      if (!isEditing) {
        setText('');
        setPriority(TODO_VALIDATION.DEFAULT_PRIORITY);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save todo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (isEditing) {
      // Reset to initial values
      setText(initialValues?.text || '');
      setPriority(initialValues?.priority || TODO_VALIDATION.DEFAULT_PRIORITY);
      setError(null);
    } else {
      // Clear form
      setText('');
      setPriority(TODO_VALIDATION.DEFAULT_PRIORITY);
      setError(null);
    }
  };

  const characterCount = text.length;
  const isNearLimit = characterCount > TODO_VALIDATION.TEXT_MAX_LENGTH * 0.8;
  const isOverLimit = characterCount > TODO_VALIDATION.TEXT_MAX_LENGTH;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border-b border-border">
      <div className="space-y-2">
        <Label htmlFor="todo-text" className="text-sm font-medium">
          {isEditing ? 'Edit todo' : 'Add new todo'}
        </Label>

        <div className="space-y-1">
          <Input
            id="todo-text"
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Enter your todo..."
            className={`
              ${isOverLimit ? 'border-red-500 focus:border-red-500' : ''}
              ${error ? 'border-red-500 focus:border-red-500' : ''}
            `}
            disabled={isSubmitting}
            maxLength={TODO_VALIDATION.TEXT_MAX_LENGTH + 50} // Allow typing beyond limit for UX
            aria-describedby={error ? 'todo-error' : 'todo-count'}
          />

          <div className="flex justify-between items-center text-xs">
            <span
              id="todo-count"
              className={`
                ${isNearLimit ? (isOverLimit ? 'text-red-500' : 'text-yellow-600') : 'text-muted-foreground'}
              `}
            >
              {characterCount}/{TODO_VALIDATION.TEXT_MAX_LENGTH}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="todo-priority" className="text-sm font-medium">
          Priority
        </Label>

        <Select
          value={priority}
          onValueChange={(value: Priority) => setPriority(value)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="todo-priority" className="w-full">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div
          id="todo-error"
          className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-2 rounded-md"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isSubmitting || isOverLimit || !text.trim()}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          ) : isEditing ? (
            <Save className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Todo'}
        </Button>

        {(isEditing || onCancel) && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default TodoForm;
