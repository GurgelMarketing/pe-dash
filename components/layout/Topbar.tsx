'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/upload':    'Upload de Planilha',
  '/historico': 'Histórico de Snapshots',
  '/tecnicos':  'Técnico',
};

export function Topbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const title    = Object.entries(titles).find(([k]) => pathname.startsWith(k))?.[1] ?? 'PE-Dash';
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then((res: Awaited<ReturnType<typeof supabase.auth.getUser>>) => {
      setEmail(res.data.user?.email ?? null);
    });
  }, []);

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  // Nome abreviado: "andre.gurgel@ibge.gov.br" → "Andre Gurgel"
  function formatName(e: string) {
    const local = e.split('@')[0];
    return local.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  }

  return (
    <header className="h-14 border-b border-neutral-800 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-sm font-semibold text-neutral-200">{title}</h1>
      {email && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400 hidden sm:block">
            {formatName(email)}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs text-neutral-500 hover:text-neutral-300 border border-neutral-700 hover:border-neutral-500 rounded px-2.5 py-1 transition-colors"
          >
            Sair
          </button>
        </div>
      )}
    </header>
  );
}
