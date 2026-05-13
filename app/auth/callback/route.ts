import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_DOMAIN = 'ibge.gov.br';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=link_invalido`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll:  () => cookieStore.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          ),
      },
    },
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=autenticacao_falhou`);
  }

  // Garante domínio @ibge.gov.br mesmo que alguém tente via link direto
  const email = data.user.email ?? '';
  if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=dominio_nao_autorizado`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
