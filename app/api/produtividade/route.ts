import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { calcularProdutividadeEquipe, resumoEquipe } from '@/lib/analytics/produtividade';
import type { MetricaTecnico } from '@/types';

export async function GET(req: NextRequest) {
  const supabase   = getSupabaseServerClient();
  const snapshotId = req.nextUrl.searchParams.get('snapshot_id');

  let query = supabase.from('metricas_por_tecnico').select('*');
  if (snapshotId) query = query.eq('snapshot_id', snapshotId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const metricas = (data ?? []) as MetricaTecnico[];
  const prod     = calcularProdutividadeEquipe(metricas);
  const resumo   = resumoEquipe(prod);

  return NextResponse.json({ resumo, apms: prod });
}
