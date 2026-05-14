import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { calcularProdutividadeEquipe, resumoEquipe } from '@/lib/analytics/produtividade';
import type { MetricaTecnico, CampanhaConfig } from '@/types';

export async function GET(req: NextRequest) {
  const supabase   = getSupabaseServerClient();
  const snapshotId = req.nextUrl.searchParams.get('snapshot_id');

  const [metricasResult, configResult] = await Promise.all([
    (() => {
      let q = supabase.from('metricas_por_tecnico').select('*');
      if (snapshotId) q = q.eq('snapshot_id', snapshotId);
      return q;
    })(),
    supabase.from('configuracoes').select('campanha_inicio, campanha_fim, meta_diaria_apm').eq('id', 'campanha').single(),
  ]);

  if (metricasResult.error) return NextResponse.json({ error: metricasResult.error.message }, { status: 500 });

  const metricas = (metricasResult.data ?? []) as MetricaTecnico[];
  const cfg      = (configResult.data ?? undefined) as CampanhaConfig | undefined;
  const prod     = calcularProdutividadeEquipe(metricas, cfg);
  const resumo   = resumoEquipe(prod, cfg);

  return NextResponse.json({ resumo, apms: prod });
}
