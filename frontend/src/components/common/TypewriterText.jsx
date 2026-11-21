import React, { useEffect, useState } from 'react';

const TypewriterText = ({
  text = '',
  speed = 20,
  label = 'STUDIO BRIEF // LIVE STREAM',
  className = '',
}) => {
  const [charIndex, setCharIndex] = useState(0);
  const [cycleKey, setCycleKey] = useState(0);

  useEffect(() => {
    setCharIndex(0);
  }, [text, cycleKey]);

  useEffect(() => {
    if (charIndex >= text.length) return undefined;
    const timer = setTimeout(() => {
      setCharIndex((prev) => prev + 1);
    }, speed);
    return () => clearTimeout(timer);
  }, [charIndex, text, speed]);

  const isComplete = charIndex >= text.length;
  const displayedText = text.slice(0, charIndex);

  return (
    <div
      onClick={() => isComplete && setCycleKey((k) => k + 1)}
      title={isComplete ? 'Click to replay typing animation' : undefined}
      className={`group relative rounded-2xl bg-[#101828]/95 border border-slate-800 hover:border-[#3B82F6]/60 p-5 sm:p-6 shadow-2xl transition-all duration-300 overflow-hidden ${
        isComplete ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Top gradient accent beam */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#2563EB] via-[#60A5FA] to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

      {/* Left vertical electric-blue accent bar */}
      <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-gradient-to-b from-[#2563EB] to-[#60A5FA]" />

      {/* Header status strip */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800/90">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#60A5FA] animate-pulse" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#60A5FA]">
            {label}
          </span>
        </div>
        <span
          className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded border ${
            isComplete
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
              : 'bg-blue-500/15 text-[#60A5FA] border-blue-500/30'
          }`}
        >
          {isComplete ? 'SYNCED' : 'TYPING...'}
        </span>
      </div>

      {/* Zero-layout-shift grid container for typewriter output */}
      <div className="grid text-sm sm:text-[15px] text-slate-200 leading-relaxed font-normal">
        <p
          aria-hidden="true"
          className="invisible col-start-1 row-start-1 select-none pointer-events-none"
        >
          {text}
        </p>
        <p className="col-start-1 row-start-1">
          <span>{displayedText}</span>
          <span
            aria-hidden="true"
            className="inline-block w-2 h-4 align-middle ml-1 bg-[#60A5FA] shadow-sm shadow-blue-400/50 animate-pulse"
          />
        </p>
      </div>
    </div>
  );
};

export default TypewriterText;
