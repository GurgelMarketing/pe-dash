import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_DOMAIN = 'ibge.gov.br';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const token_hash = searchParams.get('token_hash');
  const type       = searchParams.get('type') as 'magiclink' | 'email' | null;
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

  let authError: Error | null = null;
  let user: { email?: string } | null = null;

  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });
    authError = error;
    user      = data.user ?? null;
  } else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    authError = error;
    user      = data.user ?? null;
  }

  if (authError || !user) {
    return NextResponse.redirect(`${origin}/login?error=autenticacao_falhou`);
  }

  const email = user.email ?? '';
  if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=dominio_nao_autorizado`);
  }

  return response;
}
