export function Delta({ value }: { value?: number }) {
  if (value === undefined || value === 0) return null;
  const pos = value > 0;
  return (
    <span className={`text-xs font-medium ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
      {pos ? '↑' : '↓'}{Math.abs(value)}
    </span>
  );
}
