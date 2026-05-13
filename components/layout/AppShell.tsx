'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const AUTH_PATHS = ['/login', '/auth'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth   = AUTH_PATHS.some(p => pathname.startsWith(p));

  if (isAuth) return <>{children}</>;

  return (
    <>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </>
  );
}
