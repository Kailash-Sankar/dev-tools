/**
 * EmptyState Component
 * Displays appropriate message when no todos are present
 */

import React from 'react';
import { Priority } from '../types';
import { CheckCircle2, Filter, Plus } from 'lucide-react';

interface EmptyStateProps {
  filter: Priority | 'all';
  onAddTodo?: () => void;
  onClearFilter?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  filter,
  onAddTodo,
  onClearFilter
}) => {
  const isFiltered = filter !== 'all';

  const getEmptyMessage = () => {
    if (isFiltered) {
      return {
        title: `No ${filter} priority todos`,
        description: `You don't have any ${filter} priority todos yet.`,
        icon: Filter,
        action: {
          label: 'Show all todos',
          onClick: onClearFilter
        }
      };
    }

    return {
      title: 'No todos yet',
      description: 'Create your first todo to get started organizing your tasks.',
      icon: CheckCircle2,
      action: {
        label: 'Add your first todo',
        onClick: onAddTodo
      }
    };
  };

  const { title, description, icon: Icon, action } = getEmptyMessage();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {description}
      </p>

      {action.onClick && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          {!isFiltered && <Plus className="h-4 w-4" />}
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
