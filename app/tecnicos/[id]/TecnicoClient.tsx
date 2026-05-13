'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calcularProdutividade } from '@/lib/analytics/produtividade';
import type { MetricaTecnico, Snapshot } from '@/types';
import type { MetaProdutividade } from '@/lib/analytics/produtividade';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

const statusConfig = {
  no_prazo:  { label: 'No prazo',  cls: 'bg-emerald-900 text-emerald-300 border-emerald-700' },
  atencao:   { label: 'Atenção',   cls: 'bg-yellow-900 text-yellow-300 border-yellow-700'   },
  critico:   { label: 'Crítico',   cls: 'bg-red-900 text-red-300 border-red-700'            },
  concluido: { label: 'Concluído', cls: 'bg-neutral-800 text-neutral-300 border-neutral-600'},
};

interface EmpresaItem {
  id: string;
  cnpj: string;
  razao_social: string;
  pesquisa: string;
  situacao: string;
  vip: boolean;
  municipio: string;
  modelo: string;
}

interface HistoricoPoint {
  data: string;
  concluidas: number;
  total: number;
  pct: number;
}

interface Props { nome: string }

export function TecnicoClient({ nome }: Props) {
  const [snapshots,   setSnapshots]   = useState<Snapshot[]>([]);
  const [snapshotId,  setSnapshotId]  = useState('');
  const [metrica,     setMetrica]     = useState<MetricaTecnico | null>(null);
  const [prod,        setProd]        = useState<MetaProdutividade | null>(null);
  const [empresas,    setEmpresas]    = useState<EmpresaItem[]>([]);
  const [historico,   setHistorico]   = useState<HistoricoPoint[]>([]);
  const [filtro,      setFiltro]      = useState('');
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    fetch('/api/snapshots')
      .then(r => r.json())
      .then((data: Snapshot[]) => {
        setSnapshots(data);
        if (data.length > 0) setSnapshotId(data[0].id);
      });
  }, []);

  // Série histórica do técnico
  useEffect(() => {
    if (!snapshots.length) return;
    Promise.all(
      snapshots.map(s =>
        fetch(`/api/tecnicos?snapshot_id=${s.id}`)
          .then(r => r.json())
          .then((metricas: MetricaTecnico[]) => {
            const m = metricas.find(t => t.responsavel === nome);
            return m ? {
              data:      new Date(s.record_date + 'T12:00:00').toLocaleDateString('pt-BR'),
              concluidas: m.acordada + m.abordada,
              total:      m.total,
              pct:        m.pct_concluido,
            } : null;
          })
      )
    ).then(results => {
      setHistorico(results.filter(Boolean).reverse() as HistoricoPoint[]);
    });
  }, [snapshots, nome]);

  // Métricas e empresas do snapshot selecionado
  useEffect(() => {
    if (!snapshotId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/tecnicos?snapshot_id=${snapshotId}`).then(r => r.json()),
      fetch(`/api/empresas?snapshot_id=${snapshotId}&responsavel=${encodeURIComponent(nome)}&page=0`).then(r => r.json()),
    ]).then(([metricas, empData]) => {
      const m = (metricas as MetricaTecnico[]).find(t => t.responsavel === nome) ?? null;
      setMetrica(m);
      setProd(m ? calcularProdutividade(m) : null);
      setEmpresas(empData.data ?? []);
      setLoading(false);
    });
  }, [snapshotId, nome]);

  const empresasFiltradas = empresas.filter(e =>
    !filtro ||
    e.razao_social.toLowerCase().includes(filtro.toLowerCase()) ||
    e.cnpj.includes(filtro)
  );

  return (
    <div className="flex flex-col gap-5 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-100">{nome}</h2>
          <p className="text-sm text-neutral-400 mt-0.5">Agente de Pesquisa e Mapeamento</p>
        </div>
        {prod && (
          <Badge className={`text-sm border px-3 py-1 ${statusConfig[prod.status].cls}`}>
            {statusConfig[prod.status].label}
          </Badge>
        )}
      </div>

      {loading ? (
        <p className="text-neutral-500 text-sm">Carregando...</p>
      ) : !metrica ? (
        <p className="text-neutral-500 text-sm">Técnico não encontrado no snapshot selecionado.</p>
      ) : (
        <>
          {/* KPIs individuais */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Carteira total',  value: metrica.total,                         color: 'text-white'      },
              { label: 'Concluídas',      value: metrica.acordada + metrica.abordada,    color: 'text-emerald-400'},
              { label: 'Nada Feito',      value: metrica.nada_feito,                    color: 'text-red-400'    },
              { label: 'Em Andamento',    value: metrica.em_andamento,                  color: 'text-blue-400'   },
              { label: 'Acordadas',       value: metrica.acordada,                      color: 'text-emerald-400'},
              { label: 'Abordadas',       value: metrica.abordada,                      color: 'text-emerald-300'},
              { label: 'VIP',             value: metrica.vip,                           color: 'text-yellow-400' },
              { label: 'Sem contato',     value: metrica.sem_contato,                   color: 'text-orange-400' },
            ].map(c => (
              <Card key={c.label} className="bg-neutral-900 border-neutral-800">
                <CardContent className="p-4">
                  <p className="text-xs text-neutral-400 mb-1">{c.label}</p>
                  <span className={`text-2xl font-bold tabular-nums ${c.color}`}>{c.value}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bloco de produtividade */}
          {prod && (
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-neutral-300">Produtividade Individual</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-neutral-400">Ritmo real / dia</p>
                    <p className="text-lg font-bold text-white tabular-nums">{prod.ritmo_real_por_dia}</p>
                    <p className="text-xs text-neutral-500">meta: {prod.meta_diaria}/dia</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">Déficit acumulado</p>
                    <p className={`text-lg font-bold tabular-nums ${prod.deficit_acumulado > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {prod.deficit_acumulado > 0 ? `+${prod.deficit_acumulado}` : prod.deficit_acumulado}
                    </p>
                    <p className="text-xs text-neutral-500">esperado: {prod.esperado_ate_hoje}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">Projeção final</p>
                    <p className={`text-lg font-bold tabular-nums ${prod.vai_concluir_carteira ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {prod.projecao_final}
                    </p>
                    <p className="text-xs text-neutral-500">de {prod.total_carteira} empresas</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">Ritmo necessário</p>
                    <p className="text-lg font-bold text-white tabular-nums">
                      {isFinite(prod.ritmo_necessario) ? prod.ritmo_necessario : '∞'}
                    </p>
                    <p className="text-xs text-neutral-500">para zerar carteira</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">Dias decorridos</p>
                    <p className="text-lg font-bold text-white tabular-nums">{prod.dias_uteis_decorridos}</p>
                    <p className="text-xs text-neutral-500">dias úteis</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">Dias restantes</p>
                    <p className="text-lg font-bold text-white tabular-nums">{prod.dias_uteis_restantes}</p>
                    <p className="text-xs text-neutral-500">até 25/06/2026</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-neutral-500 mb-1">
                    <span>Progresso da carteira</span>
                    <span>{metrica.pct_concluido}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${metrica.pct_concluido}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gráfico histórico */}
          {historico.length > 1 && (
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-neutral-300">Evolução Histórica</CardTitle>
              </CardHeader>
              <CardContent className="h-52 px-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historico} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="data" tick={{ fill: '#a3a3a3', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#a3a3a3', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: 8 }}
                      labelStyle={{ color: '#e5e5e5' }}
                      itemStyle={{ color: '#a3a3a3' }}
                    />
                    <ReferenceLine y={metrica.total} stroke="#404040" strokeDasharray="4 4" label={{ value: 'Total', fill: '#525252', fontSize: 10 }} />
                    <Line type="monotone" dataKey="concluidas" name="Concluídas" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="pct"        name="% concluído" stroke="#3b82f6" strokeWidth={1.5} dot={false} yAxisId={0} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Tabela de empresas */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm text-neutral-300">Empresas da Carteira</CardTitle>
              <input
                type="text"
                placeholder="Buscar por nome ou CNPJ..."
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
                className="mt-2 w-full max-w-xs bg-neutral-800 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-500"
              />
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-500">
                      <th className="text-left px-4 py-2 font-medium">Empresa</th>
                      <th className="text-left px-3 py-2 font-medium">CNPJ</th>
                      <th className="text-left px-3 py-2 font-medium">Pesquisa</th>
                      <th className="text-left px-3 py-2 font-medium">Município</th>
                      <th className="text-left px-3 py-2 font-medium">Situação</th>
                      <th className="text-left px-4 py-2 font-medium">VIP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empresasFiltradas.slice(0, 100).map(e => (
                      <tr key={e.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                        <td className="px-4 py-2 text-neutral-200 max-w-[220px] truncate">{e.razao_social}</td>
                        <td className="px-3 py-2 text-neutral-400 tabular-nums">{e.cnpj}</td>
                        <td className="px-3 py-2 text-blue-400">{e.pesquisa}</td>
                        <td className="px-3 py-2 text-neutral-400">{e.municipio}</td>
                        <td className="px-3 py-2">
                          <span className={`
                            ${e.situacao === 'Nada Feito'              ? 'text-red-400'    : ''}
                            ${e.situacao === 'Abordagem Em Andamento'  ? 'text-blue-400'   : ''}
                            ${e.situacao === 'Acordada'                ? 'text-emerald-400': ''}
                            ${e.situacao === 'Abordada'                ? 'text-emerald-300': ''}
                          `}>{e.situacao}</span>
                        </td>
                        <td className="px-4 py-2">{e.vip ? <span className="text-yellow-400 font-bold">VIP</span> : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {empresasFiltradas.length > 100 && (
                  <p className="text-xs text-neutral-500 px-4 py-2">
                    Mostrando 100 de {empresasFiltradas.length} resultados. Refine a busca para ver mais.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
