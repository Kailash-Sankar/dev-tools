/**
 * TodoFilter Component
 * Priority filter buttons with todo counts
 */

import React from 'react';
import { Priority, TodoFilterProps } from '../types';
import { Badge } from '@/components/ui/badge';

const filterConfig = {
  all: { label: 'All', className: 'hover:bg-muted' },
  high: { label: 'High', className: 'hover:bg-red-50 dark:hover:bg-red-950' },
  medium: { label: 'Medium', className: 'hover:bg-yellow-50 dark:hover:bg-yellow-950' },
  low: { label: 'Low', className: 'hover:bg-gray-50 dark:hover:bg-gray-900' }
};

export const TodoFilter: React.FC<TodoFilterProps> = ({
  currentFilter,
  onFilterChange,
  todoCounts
}) => {
  const filters: (Priority | 'all')[] = ['all', 'high', 'medium', 'low'];

  return (
    <div className="flex flex-wrap gap-2 p-4 border-b border-border">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 w-full">
        <span>Filter by priority:</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const config = filterConfig[filter];
          const count = todoCounts[filter] || 0;
          const isActive = currentFilter === filter;

          return (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`
                inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
                transition-colors border
                ${isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : `bg-background text-foreground border-border ${config.className}`
                }
              `}
              aria-label={`Filter by ${config.label} priority (${count} todos)`}
            >
              <span>{config.label}</span>
              <Badge
                variant={isActive ? 'secondary' : 'outline'}
                className={`
                  text-xs px-1.5 py-0.5 min-w-[20px] justify-center
                  ${isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20'
                    : 'bg-muted text-muted-foreground border-border'
                  }
                `}
              >
                {count}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TodoFilter;
