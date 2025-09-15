/**
 * TodoItem Component
 * Individual todo item with edit/delete actions
 */

import React, { useState } from 'react';
import { TodoItemProps } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit2, Trash2, Calendar } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { format } from 'date-fns';

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onEdit,
  onDelete
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await onDelete(todo.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    onEdit(todo);
  };

  const formatDate = (date: Date) => {
    try {
      return format(date, 'MMM d, yyyy \'at\' h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const isUpdated = todo.updatedAt.getTime() !== todo.createdAt.getTime();

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Todo Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              <PriorityBadge priority={todo.priority} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground break-words">
                  {todo.text}
                </p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                Created {formatDate(todo.createdAt)}
                {isUpdated && (
                  <span className="ml-1">
                    • Updated {formatDate(todo.updatedAt)}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-8 w-8 p-0 hover:bg-muted"
              aria-label={`Edit todo: ${todo.text}`}
            >
              <Edit2 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
              aria-label={`Delete todo: ${todo.text}`}
            >
              {isDeleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TodoItem;
