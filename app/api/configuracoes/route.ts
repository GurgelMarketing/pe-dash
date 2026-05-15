import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { CampanhaConfig } from '@/types';

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('configuracoes')
    .select('campanha_inicio, campanha_fim, meta_diaria_apm, feriados_dias_uteis')
    .eq('id', 'campanha')
    .single();

  if (error || !data) {
    return NextResponse.json(
      { campanha_inicio: '2026-04-01', campanha_fim: '2026-06-25', meta_diaria_apm: 8, feriados_dias_uteis: 0 } as CampanhaConfig,
    );
  }
  return NextResponse.json(data as CampanhaConfig);
}

export async function PATCH(req: NextRequest) {
  const body: Partial<CampanhaConfig> = await req.json();
  const { campanha_inicio, campanha_fim, meta_diaria_apm, feriados_dias_uteis } = body;

  if (!campanha_inicio || !campanha_fim || meta_diaria_apm === undefined) {
    return NextResponse.json({ error: 'Campos obrigatórios: campanha_inicio, campanha_fim, meta_diaria_apm' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from('configuracoes')
    .upsert({ id: 'campanha', campanha_inicio, campanha_fim, meta_diaria_apm, feriados_dias_uteis: feriados_dias_uteis ?? 0, updated_at: new Date().toISOString() });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ campanha_inicio, campanha_fim, meta_diaria_apm, feriados_dias_uteis: feriados_dias_uteis ?? 0 } as CampanhaConfig);
}
