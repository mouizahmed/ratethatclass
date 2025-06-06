import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ReportStatus } from '@/types';

interface StatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusBadgeVariant = (status: ReportStatus) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'resolved':
        return 'success';
      case 'dismissed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Badge variant={getStatusBadgeVariant(status)} className={className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
