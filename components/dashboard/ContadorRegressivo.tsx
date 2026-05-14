'use client';

import { useEffect, useState } from 'react';
import {
  diasUteisRestantes, diasUteisDecorridos, TOTAL_DIAS_UTEIS_CAMPANHA,
  estaEmHorarioComercial, CAMPANHA,
  diasUteisRestantesConfig, diasUteisDecorridosConfig, totalDiasUteisConfig,
} from '@/lib/calendario/diasUteis';
import type { CampanhaConfig } from '@/types';

interface Props { config?: CampanhaConfig | null }

export function ContadorRegressivo({ config }: Props) {
  const [restantes,   setRestantes]   = useState(0);
  const [decorridos,  setDecorridos]  = useState(0);
  const [comercial,   setComercial]   = useState(false);

  useEffect(() => {
    function update() {
      if (config) {
        setRestantes(diasUteisRestantesConfig(config));
        setDecorridos(diasUteisDecorridosConfig(config));
      } else {
        setRestantes(diasUteisRestantes());
        setDecorridos(diasUteisDecorridos());
      }
      setComercial(estaEmHorarioComercial());
    }
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [config]);

  const total = config ? totalDiasUteisConfig(config) : TOTAL_DIAS_UTEIS_CAMPANHA;
  const pct   = total > 0 ? Math.round(decorridos / total * 100) : 0;

  const fmtDate = (iso: string) =>
    new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR');
  const periodoLabel = config
    ? `${fmtDate(config.campanha_inicio)} → ${fmtDate(config.campanha_fim)}`
    : `01/04/2026 → ${new Date(CAMPANHA.FIM.getTime() + 12 * 3600000).toLocaleDateString('pt-BR')}`;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-neutral-400 uppercase tracking-wide">Campanha de Abordagens</p>
          <p className="text-xs text-neutral-500 mt-0.5">{periodoLabel}</p>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${comercial ? 'bg-emerald-900 text-emerald-300' : 'bg-neutral-800 text-neutral-400'}`}>
          {comercial ? 'Em horário comercial' : 'Fora do horário comercial'}
        </div>
      </div>

      <div className="flex items-end gap-6">
        <div>
          <p className="text-4xl font-bold text-white tabular-nums">{restantes}</p>
          <p className="text-xs text-neutral-400 mt-0.5">dias úteis restantes</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-neutral-300">{decorridos}<span className="text-neutral-500 text-sm"> / {total}</span></p>
          <p className="text-xs text-neutral-400">dias decorridos</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-neutral-500 mb-1">
          <span>Progresso do período</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full bg-neutral-800 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
