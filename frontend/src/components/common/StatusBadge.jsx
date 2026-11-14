import React from 'react';
import { STATUS_CONFIG } from '../../utils/formatters';

const StatusBadge = ({ status, className = '' }) => {
  const key = (status || 'pending').toLowerCase();
  const config = STATUS_CONFIG[key] || {
    label: status ? status.replace(/_/g, ' ') : 'Unknown',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
