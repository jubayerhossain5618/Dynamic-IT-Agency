import React from 'react';

const ProgressBar = ({ progress = 0, showLabel = true, size = 'md' }) => {
  const safeProgress = Math.min(100, Math.max(0, Number(progress || 0)));

  const heightClass = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-3' : 'h-2.5';
  const barColor =
    safeProgress === 100
      ? 'bg-emerald-500'
      : safeProgress >= 60
      ? 'bg-brand-600'
      : safeProgress >= 30
      ? 'bg-blue-500'
      : 'bg-amber-500';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
          <span className="font-mono text-[11px] uppercase tracking-wider">Milestone Progress</span>
          <span className="font-mono font-bold text-slate-950">{safeProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-200/80 rounded-full overflow-hidden ${heightClass} relative`}>
        <div
          className={`${barColor} ${heightClass} rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
          style={{ width: `${safeProgress}%` }}
        >
          {safeProgress > 0 && safeProgress < 100 && (
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse-flow" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
