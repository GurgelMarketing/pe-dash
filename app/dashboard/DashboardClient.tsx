'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { ContadorRegressivo } from '@/components/dashboard/ContadorRegressivo';
import { KpiGrid } from '@/components/dashboard/KpiGrid';
import { ProdutividadePanel } from '@/components/dashboard/ProdutividadePanel';
import { SituacaoChart } from '@/components/dashboard/SituacaoChart';
import { PesquisaChartFull } from '@/components/dashboard/PesquisaChart';
import { AndamentoChart } from '@/components/dashboard/AndamentoChart';
import { MunicipioRanking } from '@/components/dashboard/MunicipioRanking';
import { TecnicoTable } from '@/components/dashboard/TecnicoTable';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { SnapshotSelector } from '@/components/dashboard/SnapshotSelector';
import { ConfiguracaoPanel } from '@/components/dashboard/ConfiguracaoPanel';
import { RelatorioButton } from '@/components/dashboard/RelatorioButton';
import { calcularDelta, calcularDeltaTecnico } from '@/lib/analytics/evolution';
import { gerarInsights } from '@/lib/analytics/insights';
import type { KPIsGlobais, MetricaTecnico, Insight, Snapshot, CampanhaConfig } from '@/types';
import type { MetaProdutividade, ResumoEquipe } from '@/lib/analytics/produtividade';

interface PesquisaData { pesquisa: string; nada_feito: number; em_andamento: number; acordada: number; abordada: number }
interface MunicipioData { municipio: string; total: number; concluidas: number }

export function DashboardClient() {
  const [snapshots,    setSnapshots]    = useState<Snapshot[]>([]);
  const [snapshotId,   setSnapshotId]   = useState<string>('');
  const [campanha,     setCampanha]     = useState<CampanhaConfig | null>(null);
  const campanhaRef = useRef<CampanhaConfig | null>(null);
  const [kpis,         setKpis]         = useState<KPIsGlobais | null>(null);
  const [kpisPrev,     setKpisPrev]     = useState<KPIsGlobais | null>(null);
  const [metricas,     setMetricas]     = useState<MetricaTecnico[]>([]);
  const [metricasPrev, setMetricasPrev] = useState<MetricaTecnico[]>([]);
  const [apms,         setApms]         = useState<MetaProdutividade[]>([]);
  const [resumo,       setResumo]       = useState<ResumoEquipe | null>(null);
  const [pesquisaData, setPesquisaData] = useState<PesquisaData[]>([]);
  const [municipios,   setMunicipios]   = useState<MunicipioData[]>([]);
  const [insights,     setInsights]     = useState<Insight[]>([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    fetch('/api/snapshots')
      .then(r => r.json())
      .then((data: Snapshot[]) => {
        setSnapshots(data);
        if (data.length > 0) setSnapshotId(data[0].id);
      });
    fetch('/api/configuracoes')
      .then(r => r.json())
      .then((cfg: CampanhaConfig) => { setCampanha(cfg); campanhaRef.current = cfg; });
  }, []);

  const loadData = useCallback(async (sid: string) => {
    if (!sid) return;
    setLoading(true);

    const [kpisRes, tecnicosRes, prodRes, empresasRes] = await Promise.all([
      fetch(`/api/kpis?snapshot_id=${sid}`).then(r => r.json()),
      fetch(`/api/tecnicos?snapshot_id=${sid}`).then(r => r.json()),
      fetch(`/api/produtividade?snapshot_id=${sid}`).then(r => r.json()),
      fetch(`/api/empresas?snapshot_id=${sid}&page=0`).then(r => r.json()),
    ]);

    const kpisData:     KPIsGlobais      = kpisRes;
    const metricasData: MetricaTecnico[] = tecnicosRes;

    setKpis(kpisData);
    setMetricas(metricasData);
    setApms(prodRes.apms ?? []);
    setResumo(prodRes.resumo ?? null);

    // Busca snapshot anterior para deltas globais e por técnico
    const snapshotIdx = snapshots.findIndex(s => s.id === sid);
    if (snapshotIdx >= 0 && snapshotIdx < snapshots.length - 1) {
      const prevId = snapshots[snapshotIdx + 1].id;
      const [prevKpis, prevMetricas] = await Promise.all([
        fetch(`/api/kpis?snapshot_id=${prevId}`).then(r => r.json()),
        fetch(`/api/tecnicos?snapshot_id=${prevId}`).then(r => r.json()),
      ]);
      setKpisPrev(prevKpis);
      setMetricasPrev(prevMetricas);
    } else {
      setKpisPrev(null);
      setMetricasPrev([]);
    }

    const empresas: Array<{ pesquisa: string; situacao: string; municipio: string }> =
      empresasRes.data ?? [];

    const pesquisaMap  = new Map<string, PesquisaData>();
    const municipioMap = new Map<string, MunicipioData>();

    for (const e of empresas) {
      const p = e.pesquisa || 'Outros';
      if (!pesquisaMap.has(p)) pesquisaMap.set(p, { pesquisa: p, nada_feito: 0, em_andamento: 0, acordada: 0, abordada: 0 });
      const pd = pesquisaMap.get(p)!;
      if (e.situacao === 'Nada Feito')               pd.nada_feito++;
      else if (e.situacao === 'Abordagem Em Andamento') pd.em_andamento++;
      else if (e.situacao === 'Acordada')            pd.acordada++;
      else if (e.situacao === 'Abordada')            pd.abordada++;

      const m = e.municipio || 'Sem município';
      if (!municipioMap.has(m)) municipioMap.set(m, { municipio: m, total: 0, concluidas: 0 });
      const md = municipioMap.get(m)!;
      md.total++;
      if (['Acordada', 'Abordada'].includes(e.situacao)) md.concluidas++;
    }

    setPesquisaData([...pesquisaMap.values()]);
    setMunicipios([...municipioMap.values()]);

    setInsights(gerarInsights(kpisData, metricasData, prodRes.apms ?? [], campanhaRef.current ?? undefined));
    setLoading(false);
  }, [snapshots]);

  useEffect(() => {
    if (snapshotId) loadData(snapshotId);
  }, [snapshotId, loadData]);

  // Recarrega produtividade quando config muda (para refletir novo período no painel)
  const handleConfigChange = useCallback((cfg: CampanhaConfig) => {
    campanhaRef.current = cfg;
    setCampanha(cfg);
    if (snapshotId) loadData(snapshotId);
  }, [snapshotId, loadData]);

  const delta = kpis && kpisPrev ? calcularDelta(kpis, kpisPrev) : undefined;

  const deltaMetricas = metricas.length > 0 && metricasPrev.length > 0
    ? new Map(
        metricas.map(m => {
          const prev = metricasPrev.find(p => p.responsavel === m.responsavel);
          return [m.responsavel, prev ? calcularDeltaTecnico(m, prev) : undefined] as const;
        })
      )
    : undefined;

  if (!snapshots.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-neutral-400">
        <p className="text-lg font-medium">Nenhum dado disponível.</p>
        <p className="text-sm mt-1">Faça o upload de uma planilha para começar.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <RelatorioButton />
        <SnapshotSelector value={snapshotId} onChange={(id) => id && setSnapshotId(id)} />
      </div>

      <ConfiguracaoPanel config={campanha} onConfigChange={handleConfigChange} />

      <ContadorRegressivo config={campanha} />

      {loading ? (
        <div className="text-neutral-500 text-sm py-8 text-center">Carregando dados...</div>
      ) : kpis ? (
        <>
          <KpiGrid kpis={kpis} delta={delta} />

          {resumo && apms.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Produtividade</h2>
              <ProdutividadePanel apms={apms} resumo={resumo} />
            </section>
          )}

          <section>
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Gráficos</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SituacaoChart kpis={kpis} />
              <PesquisaChartFull data={pesquisaData} />
            </div>
          </section>

          <AndamentoChart metricas={metricas} />

          <section>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <TecnicoTable metricas={metricas} deltaMetricas={deltaMetricas} />
              </div>
              <MunicipioRanking data={municipios} />
            </div>
          </section>

          <InsightsPanel insights={insights} />
        </>
      ) : null}
    </div>
  );
}
