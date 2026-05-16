'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type React from 'react';

interface InfoTooltipProps {
  text: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  const [open,    setOpen]    = useState(false);
  const [style,   setStyle]   = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const handleOpen = useCallback(() => {
    if (!btnRef.current) return;
    const r  = btnRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Vertical: abaixo por padrão; acima se perto do rodapé — sem transform
    const spaceBelow = vh - r.bottom;
    const posY: React.CSSProperties = spaceBelow > 180
      ? { top:    r.bottom + 6 }
      : { bottom: vh - r.top + 6 };

    // Horizontal: abre para a esquerda por padrão (borda direita alinhada com o botão).
    // Inverte só se não há espaço suficiente à esquerda.
    const tooltipWidth = 288; // w-72
    const posX: React.CSSProperties = r.right >= tooltipWidth + 8
      ? { right: vw - r.right }
      : { left:  Math.max(8, r.left) };

    setStyle({ position: 'fixed', ...posY, ...posX });
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

      {mounted && open && createPortal(
        <div
          style={style}
          className="z-[9999] w-72 max-w-[min(18rem,90vw)] p-3.5 rounded-xl bg-neutral-800 border border-neutral-700 shadow-2xl text-xs text-neutral-200 leading-relaxed pointer-events-none"
        >
          {text}
        </div>,
        document.body
      )}
    </div>
  );
}
