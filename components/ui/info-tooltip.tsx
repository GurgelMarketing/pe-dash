'use client';

import { useState, useRef, useCallback } from 'react';
import type React from 'react';

interface InfoTooltipProps {
  text: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  const [open, setOpen]   = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const btnRef            = useRef<HTMLButtonElement>(null);

  const handleOpen = useCallback(() => {
    if (!btnRef.current) return;
    const r  = btnRef.current.getBoundingClientRect();
    const vw = window.innerWidth;

    const spaceBelow = window.innerHeight - r.bottom;
    const top        = spaceBelow > 180 ? r.bottom + 6 : r.top - 6;
    const translateY = spaceBelow > 180 ? '0' : '-100%';

    const rightSpace = vw - r.right;
    setStyle(
      rightSpace < 260
        ? { position: 'fixed', top, left: r.left,        transform: `translateY(${translateY})` }
        : { position: 'fixed', top, right: rightSpace,   transform: `translateY(${translateY})` }
    );
    setOpen(true);
  }, []);

  return (
    <div className="shrink-0">
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={handleOpen}
        onMouseLeave={() => setOpen(false)}
        onFocus={handleOpen}
        onBlur={() => setOpen(false)}
        className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold bg-neutral-800 border border-neutral-700 text-neutral-500 hover:bg-neutral-700 hover:text-neutral-300 transition-colors cursor-help"
        aria-label="Informação sobre esta métrica"
      >
        i
      </button>

      {open && (
        <div
          style={style}
          className="z-[9999] w-72 max-w-[min(18rem,90vw)] p-3.5 rounded-xl bg-neutral-800 border border-neutral-700 shadow-2xl text-xs text-neutral-200 leading-relaxed pointer-events-none"
        >
          {text}
        </div>
      )}
    </div>
  );
}
