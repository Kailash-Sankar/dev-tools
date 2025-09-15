/**
 * PriorityBadge Component
 * Displays priority level as a colored badge with dark theme support
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Priority } from '../types';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const priorityConfig = {
  high: {
    label: 'High',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800'
  },
  medium: {
    label: 'Medium',
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800'
  },
  low: {
    label: 'Low',
    variant: 'outline' as const,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700'
  }
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  className = ''
}) => {
  const config = priorityConfig[priority];

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className} text-xs font-medium px-2 py-1`}
      aria-label={`Priority: ${config.label}`}
    >
      {config.label}
    </Badge>
  );
};

export default PriorityBadge;
