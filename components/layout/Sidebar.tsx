'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard',  label: 'Dashboard'  },
  { href: '/upload',     label: 'Upload'      },
  { href: '/historico',  label: 'Histórico'   },
];

interface Props {
  open:    boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  return (
    <aside className={cn(
      'fixed inset-y-0 left-0 z-30 w-56 shrink-0 bg-neutral-900 border-r border-neutral-800 flex flex-col gap-1 p-4 transition-transform duration-200',
      open ? 'translate-x-0' : '-translate-x-full',
      'md:relative md:translate-x-0',
    )}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:hidden text-neutral-500 hover:text-neutral-200 transition-colors"
        aria-label="Fechar menu"
      >
        <X size={16} />
      </button>
      <div className="mb-6">
        <span className="text-lg font-bold text-white">PE-Dash</span>
        <p className="text-xs text-neutral-500 mt-0.5">IBGE · Ananindeua</p>
      </div>
      {links.map(l => (
        <Link
          key={l.href}
          href={l.href}
          onClick={onClose}
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
