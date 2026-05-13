'use client';

import { usePathname } from 'next/navigation';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/upload':    'Upload de Planilha',
  '/historico': 'Histórico de Snapshots',
};

export function Topbar() {
  const pathname = usePathname();
  const title    = Object.entries(titles).find(([k]) => pathname.startsWith(k))?.[1] ?? 'PE-Dash';

  return (
    <header className="h-14 border-b border-neutral-800 flex items-center px-6 shrink-0">
      <h1 className="text-sm font-semibold text-neutral-200">{title}</h1>
    </header>
  );
}
