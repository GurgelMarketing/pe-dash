'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { EmailOtpType } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const ALLOWED_DOMAIN = 'ibge.gov.br';

export function CallbackClient() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase   = getSupabaseBrowserClient();
    const code       = searchParams.get('code');
    const token_hash = searchParams.get('token_hash');
    const type       = (searchParams.get('type') ?? 'email') as EmailOtpType;
    const next       = searchParams.get('next') ?? '/dashboard';

    function redirectError(detail: string) {
      router.replace(
        `/login?error=autenticacao_falhou&detail=${encodeURIComponent(detail)}`,
      );
    }

    async function validateAndRedirect() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { redirectError('no_user'); return; }

      const email = user.email ?? '';
      if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
        await supabase.auth.signOut();
        router.replace('/login?error=dominio_nao_autorizado');
        return;
      }
      router.replace(next);
    }

    async function complete() {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) { redirectError(error.message); return; }
        await validateAndRedirect();

      } else if (token_hash) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type });
        if (error) { redirectError(error.message); return; }
        await validateAndRedirect();

      } else {
        // Fluxo implícito: #access_token=xxx detectado via detectSessionInUrl
        await new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, 4000);
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event) => {
              if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                clearTimeout(timer);
                subscription.unsubscribe();
                resolve();
              }
            },
          );
        });
        await validateAndRedirect();
      }
    }

    complete();
  }, [router, searchParams]);

  return (
    <div className="fixed inset-0 bg-neutral-950 flex items-center justify-center">
      <p className="text-neutral-400 text-sm">Autenticando...</p>
    </div>
  );
}
