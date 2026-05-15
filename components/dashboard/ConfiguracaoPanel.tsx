'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { CampanhaConfig } from '@/types';

interface Props {
  config: CampanhaConfig | null;
  onConfigChange: (cfg: CampanhaConfig) => void;
}

export function ConfiguracaoPanel({ config, onConfigChange }: Props) {
  const [inicio,    setInicio]    = useState(config?.campanha_inicio     ?? '');
  const [fim,       setFim]       = useState(config?.campanha_fim        ?? '');
  const [meta,      setMeta]      = useState<number>(config?.meta_diaria_apm     ?? 8);
  const [feriados,  setFeriados]  = useState<number>(config?.feriados_dias_uteis ?? 0);
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState<{ ok: boolean; text: string } | null>(null);

  // Sync fields when parent config loads for the first time
  if (config && !inicio) {
    setInicio(config.campanha_inicio);
    setFim(config.campanha_fim);
    setMeta(config.meta_diaria_apm);
    setFeriados(config.feriados_dias_uteis ?? 0);
  }

  async function handleSave() {
    if (!inicio || !fim || !meta) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/configuracoes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campanha_inicio: inicio, campanha_fim: fim, meta_diaria_apm: meta, feriados_dias_uteis: feriados }),
      });
      if (!res.ok) {
        const err = await res.json();
        setMsg({ ok: false, text: err.error ?? 'Erro ao salvar.' });
      } else {
        const nova: CampanhaConfig = { campanha_inicio: inicio, campanha_fim: fim, meta_diaria_apm: meta, feriados_dias_uteis: feriados };
        onConfigChange(nova);
        setMsg({ ok: true, text: 'Configuração salva.' });
        setTimeout(() => setMsg(null), 3000);
      }
    } catch {
      setMsg({ ok: false, text: 'Erro de conexão.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider w-full mb-0.5">
            Período da Campanha
          </p>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-500">Início</label>
            <input
              type="date"
              value={inicio}
              onChange={e => setInicio(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 rounded px-3 py-1.5 text-sm text-neutral-100 outline-none focus:border-neutral-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-500">Fim</label>
            <input
              type="date"
              value={fim}
              onChange={e => setFim(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 rounded px-3 py-1.5 text-sm text-neutral-100 outline-none focus:border-neutral-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-500">Feriados (dias úteis)</label>
            <input
              type="number"
              min={0}
              max={30}
              value={feriados}
              onChange={e => setFeriados(Math.max(0, parseInt(e.target.value) || 0))}
              className="bg-neutral-800 border border-neutral-700 rounded px-3 py-1.5 text-sm text-neutral-100 outline-none focus:border-neutral-500 w-24"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-500">Meta diária / APM</label>
            <input
              type="number"
              min={1}
              max={50}
              value={meta}
              onChange={e => setMeta(parseInt(e.target.value) || 1)}
              className="bg-neutral-800 border border-neutral-700 rounded px-3 py-1.5 text-sm text-neutral-100 outline-none focus:border-neutral-500 w-24"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !inicio || !fim}
            className="px-4 py-1.5 rounded text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>

          {msg && (
            <span className={`text-xs font-medium ${msg.ok ? 'text-emerald-400' : 'text-red-400'}`}>
              {msg.text}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
