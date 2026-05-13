import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const ALLOWED_DOMAIN = 'ibge.gov.br';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=autenticacao_falhou&detail=${encodeURIComponent('no_code')}`,
    );
  }

  const successResponse = NextResponse.redirect(`${origin}${next}`);
  const errorRedirect   = (detail: string) =>
    NextResponse.redirect(
      `${origin}/login?error=autenticacao_falhou&detail=${encodeURIComponent(detail)}`,
    );

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            successResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return errorRedirect(error.message);
  }

  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email ?? '';

  if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=dominio_nao_autorizado`);
  }

  return successResponse;
}
