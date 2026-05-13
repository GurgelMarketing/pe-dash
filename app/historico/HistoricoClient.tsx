'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { CAMPANHA } from '@/lib/calendario/diasUteis';
import type { Snapshot } from '@/types';

interface KpiSnapshot {
  snapshot_id:   string;
  record_date:   string;
  filename:      string;
  total:         number;
  nada_feito:    number;
  em_andamento:  number;
  acordada:      number;
  abordada:      number;
  pct_concluido: number;
}

interface ProdSnapshot {
  record_date:        string;
  media_ritmo_equipe: number;
}

export function HistoricoClient() {
  const [snapshots,    setSnapshots]    = useState<Snapshot[]>([]);
  const [kpisSerie,    setKpisSerie]    = useState<KpiSnapshot[]>([]);
  const [prodSerie,    setProdSerie]    = useState<ProdSnapshot[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [deleting,     setDeleting]     = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    const snaps: Snapshot[] = await fetch('/api/snapshots').then(r => r.json());
    setSnapshots(snaps);

    const kpisAll = await Promise.all(
      snaps.map(s =>
        fetch(`/api/kpis?snapshot_id=${s.id}`)
          .then(r => r.json())
          .then((k: KpiSnapshot) => ({ ...k, record_date: s.record_date }))
      )
    );

    const prodAll = await Promise.all(
      snaps.map(s =>
        fetch(`/api/produtividade?snapshot_id=${s.id}`)
          .then(r => r.json())
          .then((p: { resumo: { media_ritmo_equipe: number } }) => ({
            record_date:        s.record_date,
            media_ritmo_equipe: p.resumo?.media_ritmo_equipe ?? 0,
          }))
      )
    );

    const fmt = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');

    setKpisSerie(
      [...kpisAll]
        .reverse()
        .map(k => ({ ...k, record_date: fmt(k.record_date) }))
    );
    setProdSerie(
      [...prodAll]
        .reverse()
        .map(p => ({ ...p, record_date: fmt(p.record_date) }))
    );

    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  async function handleDelete(id: string) {
    if (!confirm('Deletar este snapshot? Esta ação não pode ser desfeita.')) return;
    setDeleting(id);
    await fetch(`/api/snapshots?id=${id}`, { method: 'DELETE' });
    await loadAll();
    setDeleting(null);
  }

  return (
    <div className="flex flex-col gap-5 max-w-5xl">
      <div>
        <h2 className="text-xl font-semibold text-neutral-100">Histórico de Snapshots</h2>
        <p className="text-sm text-neutral-400 mt-0.5">{snapshots.length} upload(s) registrado(s)</p>
      </div>

      {loading ? (
        <p className="text-neutral-500 text-sm">Carregando...</p>
      ) : (
        <>
          {/* Gráfico de evolução de KPIs */}
          {kpisSerie.length > 1 && (
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-neutral-300">Evolução dos KPIs</CardTitle>
              </CardHeader>
              <CardContent className="h-64 px-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={kpisSerie} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="record_date" tick={{ fill: '#a3a3a3', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#a3a3a3', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: 8 }}
                      labelStyle={{ color: '#e5e5e5' }}
                      itemStyle={{ color: '#a3a3a3' }}
                    />
                    <Legend formatter={v => <span style={{ color: '#a3a3a3', fontSize: 11 }}>{v}</span>} />
                    <Line type="monotone" dataKey="nada_feito"   name="Nada Feito"   stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="em_andamento" name="Em Andamento" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="acordada"     name="Acordadas"    stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="abordada"     name="Abordadas"    stroke="#34d399" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Gráfico de produtividade da equipe */}
          {prodSerie.length > 1 && (
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-neutral-300">Ritmo Médio da Equipe vs Meta</CardTitle>
              </CardHeader>
              <CardContent className="h-52 px-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prodSerie} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="record_date" tick={{ fill: '#a3a3a3', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#a3a3a3', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: 8 }}
                      labelStyle={{ color: '#e5e5e5' }}
                      itemStyle={{ color: '#a3a3a3' }}
                    />
                    <ReferenceLine
                      y={CAMPANHA.META_DIARIA_APM}
                      stroke="#facc15"
                      strokeDasharray="4 4"
                      label={{ value: `Meta ${CAMPANHA.META_DIARIA_APM}/dia`, fill: '#facc15', fontSize: 10, position: 'insideTopRight' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="media_ritmo_equipe"
                      name="Ritmo médio equipe"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Lista de snapshots */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm text-neutral-300">Todos os Snapshots</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 text-xs text-neutral-500">
                    <th className="text-left px-4 py-2 font-medium">Data ref.</th>
                    <th className="text-left px-3 py-2 font-medium">Arquivo</th>
                    <th className="text-right px-3 py-2 font-medium">Empresas</th>
                    <th className="text-right px-3 py-2 font-medium">% Concluído</th>
                    <th className="text-left px-3 py-2 font-medium">Upload em</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {snapshots.map(s => {
                    const kpi = kpisSerie.find(k => k.snapshot_id === s.id);
                    return (
                      <tr key={s.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                        <td className="px-4 py-2.5 text-neutral-200 tabular-nums">
                          {new Date(s.record_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-3 py-2.5 text-neutral-400 text-xs max-w-[200px] truncate">{s.filename}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-neutral-300">{s.total_rows}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          <span className="text-emerald-400">{kpi?.pct_concluido ?? '—'}%</span>
                        </td>
                        <td className="px-3 py-2.5 text-neutral-500 text-xs tabular-nums">
                          {new Date(s.upload_date).toLocaleString('pt-BR')}
                        </td>
                        <td className="px-4 py-2.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-400 hover:bg-red-950/30 h-7 text-xs"
                            onClick={() => handleDelete(s.id)}
                            disabled={deleting === s.id}
                          >
                            {deleting === s.id ? 'Deletando...' : 'Deletar'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
