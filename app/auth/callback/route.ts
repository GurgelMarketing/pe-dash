import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';

const ALLOWED_DOMAIN = 'ibge.gov.br';

async function tryVerifyOtp(
  supabase: ReturnType<typeof createServerClient>,
  token_hash: string,
  type: EmailOtpType,
) {
  const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });
  return { data, error };
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const token_hash = searchParams.get('token_hash');
  const type       = (searchParams.get('type') ?? 'email') as EmailOtpType;
  const code       = searchParams.get('code');
  const next       = searchParams.get('next') ?? '/dashboard';

  if (!token_hash && !code) {
    return NextResponse.redirect(`${origin}/login?error=link_invalido`);
  }

  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          ),
      },
    },
  );

  let authError: unknown = null;
  let user: { email?: string } | null = null;

  if (token_hash) {
    // Tentativa 1: tipo da URL (email ou magiclink)
    let result = await tryVerifyOtp(supabase, token_hash, type);

    // Tentativa 2: tipo alternativo como fallback
    if (result.error) {
      const fallback = type === 'email' ? 'magiclink' : 'email';
      result = await tryVerifyOtp(supabase, token_hash, fallback as EmailOtpType);
    }

    authError = result.error;
    user      = result.data.session?.user ?? result.data.user ?? null;

  } else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    authError = error;
    user      = data.session?.user ?? data.user ?? null;
  }

  if (authError || !user) {
    const detail = authError instanceof Error
      ? authError.message
      : (authError as { message?: string })?.message ?? 'sem_detalhe';
    return NextResponse.redirect(
      `${origin}/login?error=autenticacao_falhou&detail=${encodeURIComponent(detail)}`,
    );
  }

  const email = user.email ?? '';
  if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=dominio_nao_autorizado`);
  }

  return response;
}
