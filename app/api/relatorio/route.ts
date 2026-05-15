import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import fs from 'fs';
import path from 'path';
import React from 'react';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { calcularProdutividadeEquipe, resumoEquipe } from '@/lib/analytics/produtividade';
import { gerarInsights } from '@/lib/analytics/insights';
import { RelatorioDocument } from '@/lib/relatorio/pdf';
import type { DadosRelatorio } from '@/lib/relatorio/pdf';
import type { Snapshot, KPIsGlobais, MetricaTecnico, CampanhaConfig } from '@/types';

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();

    // 1. Buscar snapshots (3 mais recentes)
    const { data: snapsRaw, error: snapsErr } = await supabase
      .from('snapshots')
      .select('*')
      .order('record_date', { ascending: false })
      .limit(3);

    if (snapsErr) return NextResponse.json({ error: snapsErr.message }, { status: 500 });

    const snapshots = (snapsRaw ?? []) as Snapshot[];
    if (snapshots.length === 0) {
      return NextResponse.json({ error: 'Nenhum snapshot disponível.' }, { status: 404 });
    }

    // 2. Buscar configurações da campanha
    const { data: cfgRaw } = await supabase
      .from('configuracoes')
      .select('campanha_inicio, campanha_fim, meta_diaria_apm')
      .eq('id', 'campanha')
      .single();

    const cfg: CampanhaConfig = cfgRaw ?? {
      campanha_inicio: '2026-04-01',
      campanha_fim:    '2026-06-25',
      meta_diaria_apm: 8,
    };

    // 3. Buscar KPIs, métricas e produtividade para cada snapshot em paralelo
    const [kpisResults, metricasResults, prodResults] = await Promise.all([
      Promise.all(snapshots.map(s =>
        supabase.from('kpis_por_snapshot').select('*').eq('snapshot_id', s.id).single()
      )),
      Promise.all(snapshots.map(s =>
        supabase.from('metricas_por_tecnico').select('*').eq('snapshot_id', s.id)
      )),
      supabase.from('metricas_por_tecnico').select('*').eq('snapshot_id', snapshots[0].id),
    ]);

    const kpis = kpisResults.map(r => r.data as KPIsGlobais).filter(Boolean);
    const metricas = metricasResults.map(r => (r.data ?? []) as MetricaTecnico[]);
    const metricasAtual = (prodResults.data ?? []) as MetricaTecnico[];

    // 4. Calcular produtividade com a config do banco
    const produtividade = calcularProdutividadeEquipe(metricasAtual, cfg);
    const resumo        = resumoEquipe(produtividade, cfg);

    // 5. Gerar insights
    const insights = gerarInsights(kpis[0] ?? {} as KPIsGlobais, metricasAtual, produtividade, cfg);

    // 6. Montar DadosRelatorio
    const dados: DadosRelatorio = {
      snapshots,
      kpis,
      metricas,
      produtividade,
      resumo,
      insights,
      cfg,
      geradoEm: new Date().toISOString(),
    };

    // 7. Gerar PDF
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(RelatorioDocument, { dados }) as any;
    const buffer = await renderToBuffer(element);

    // 8. Salvar em relatorios/
    const dataStr = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
    const filename = `relatorio_${dataStr}.pdf`;
    const relatoriosDir = path.join(process.cwd(), 'relatorios');

    if (!fs.existsSync(relatoriosDir)) {
      fs.mkdirSync(relatoriosDir, { recursive: true });
    }
    fs.writeFileSync(path.join(relatoriosDir, filename), buffer);

    // 9. Retornar PDF como download (Buffer → Uint8Array para NextResponse)
    const uint8 = new Uint8Array(buffer);
    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length':      String(uint8.byteLength),
      },
    });
  } catch (err) {
    console.error('[relatorio] erro:', err);
    return NextResponse.json({ error: 'Erro ao gerar relatório.' }, { status: 500 });
  }
}
