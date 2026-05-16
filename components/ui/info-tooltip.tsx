'use client';

interface InfoTooltipProps {
  text: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  return (
    <div className="relative group/info shrink-0">
      <button
        type="button"
        className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold bg-neutral-800 border border-neutral-700 text-neutral-500 hover:bg-neutral-700 hover:text-neutral-300 transition-colors cursor-help"
        aria-label="Informação sobre esta métrica"
      >
        i
      </button>
      <div className="absolute right-0 top-6 z-50 w-64 p-3 rounded-lg bg-neutral-800 border border-neutral-700 shadow-xl text-xs text-neutral-300 leading-relaxed invisible opacity-0 group-hover/info:visible group-hover/info:opacity-100 transition-all duration-150 pointer-events-none">
        {text}
      </div>
    </div>
  );
}
