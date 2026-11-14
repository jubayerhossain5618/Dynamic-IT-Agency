import React from 'react';

const ProgressBar = ({ progress = 0, showLabel = true, size = 'md' }) => {
  const safeProgress = Math.min(100, Math.max(0, Number(progress || 0)));

  const heightClass = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-3.5' : 'h-2.5';
  const barColor =
    safeProgress === 100
      ? 'bg-emerald-600'
      : safeProgress >= 60
      ? 'bg-brand-600'
      : safeProgress >= 30
      ? 'bg-blue-600'
      : 'bg-amber-500';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <span>Completion Progress</span>
          <span className="text-slate-900">{safeProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${barColor} ${heightClass} rounded-full transition-all duration-300`}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
