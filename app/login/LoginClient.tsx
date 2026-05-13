'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ALLOWED_DOMAIN = 'ibge.gov.br';

const errorMessages: Record<string, string> = {
  link_invalido:          'Link inválido ou expirado. Solicite um novo.',
  autenticacao_falhou:    'Não foi possível autenticar. Tente novamente.',
  dominio_nao_autorizado: 'Acesso restrito a servidores do IBGE (@ibge.gov.br).',
};

export function LoginClient() {
  const searchParams  = useSearchParams();
  const errorParam    = searchParams.get('error');

  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState<string | null>(
    errorParam ? (errorMessages[errorParam] ?? 'Erro desconhecido.') : null,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim().toLowerCase();

    if (!trimmed.endsWith(`@${ALLOWED_DOMAIN}`)) {
      setError('Acesso restrito a servidores do IBGE. Use seu e-mail @ibge.gov.br.');
      return;
    }

    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (authError) {
      setError('Não foi possível enviar o link. Tente novamente.');
      return;
    }

    setSent(true);
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / título */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">PE-Dash</h1>
          <p className="text-sm text-neutral-400 mt-1">IBGE · Agência Ananindeua</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📬</div>
              <h2 className="text-lg font-semibold text-white mb-2">Verifique seu e-mail</h2>
              <p className="text-sm text-neutral-400">
                Enviamos um link de acesso para{' '}
                <span className="text-neutral-200 font-medium">{email.trim().toLowerCase()}</span>.
              </p>
              <p className="text-xs text-neutral-500 mt-3">
                O link expira em 1 hora. Verifique também a pasta de spam.
              </p>
              <button
                className="mt-6 text-xs text-neutral-500 hover:text-neutral-300 underline"
                onClick={() => { setSent(false); setEmail(''); }}
              >
                Usar outro e-mail
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-white mb-1">Entrar</h2>
              <p className="text-sm text-neutral-400 mb-6">
                Digite seu e-mail institucional IBGE para receber o link de acesso.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-neutral-400 mb-1.5 block">
                    E-mail institucional
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nome.sobrenome@ibge.gov.br"
                    required
                    autoFocus
                    className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder-neutral-500"
                  />
                </div>

                {error && (
                  <div className="bg-red-950/50 border border-red-800 rounded-lg px-3 py-2.5 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40"
                >
                  {loading ? 'Enviando...' : 'Enviar link de acesso'}
                </Button>
              </form>

              <p className="text-xs text-neutral-600 text-center mt-6">
                Acesso restrito a servidores do IBGE
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
