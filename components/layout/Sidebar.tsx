'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard',  label: 'Dashboard'  },
  { href: '/upload',     label: 'Upload'      },
  { href: '/historico',  label: 'Histórico'   },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 bg-neutral-900 border-r border-neutral-800 flex flex-col gap-1 p-4">
      <div className="mb-6">
        <span className="text-lg font-bold text-white">PE-Dash</span>
        <p className="text-xs text-neutral-500 mt-0.5">IBGE · Ananindeua</p>
      </div>
      {links.map(l => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            'px-3 py-2 rounded-md text-sm transition-colors',
            pathname.startsWith(l.href)
              ? 'bg-neutral-700 text-white'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800',
          )}
        >
          {l.label}
        </Link>
      ))}
    </aside>
  );
}
