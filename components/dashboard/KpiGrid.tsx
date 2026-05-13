import { Card, CardContent } from '@/components/ui/card';
import { Delta } from '@/components/ui/delta';
import type { KPIsGlobais } from '@/types';

interface Props {
  kpis:  KPIsGlobais;
  delta?: Partial<KPIsGlobais>;
}

export function KpiGrid({ kpis, delta }: Props) {
  const cards = [
    { label: 'Total',          value: kpis.total,          deltaKey: 'total'          as const, color: 'text-white'         },
    { label: 'VIP',            value: kpis.total_vip,      deltaKey: undefined,                  color: 'text-yellow-400'    },
    { label: 'Nada Feito',     value: kpis.nada_feito,     deltaKey: 'nada_feito'     as const, color: 'text-red-400'        },
    { label: 'Em Andamento',   value: kpis.em_andamento,   deltaKey: 'em_andamento'   as const, color: 'text-blue-400'       },
    { label: 'Acordadas',      value: kpis.acordada,       deltaKey: 'acordada'       as const, color: 'text-emerald-400'    },
    { label: 'Abordadas',      value: kpis.abordada,       deltaKey: 'abordada'       as const, color: 'text-emerald-300'    },
    { label: 'Empresas Novas', value: kpis.empresas_novas, deltaKey: undefined,                  color: 'text-purple-400'    },
    { label: 'Sem Contato',    value: kpis.sem_contato,    deltaKey: 'sem_contato'    as const, color: 'text-orange-400'     },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(c => (
        <Card key={c.label} className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4">
            <p className="text-xs text-neutral-400 mb-1">{c.label}</p>
            <div className="flex items-end justify-between">
              <span className={`text-2xl font-bold tabular-nums ${c.color}`}>{c.value}</span>
              {c.deltaKey && <Delta value={delta?.[c.deltaKey] as number | undefined} />}
            </div>
          </CardContent>
        </Card>
      ))}
      <Card className="bg-neutral-900 border-neutral-800 col-span-2 sm:col-span-4">
        <CardContent className="p-4 flex items-center gap-4">
          <div>
            <p className="text-xs text-neutral-400 mb-1">Concluídas (Acordadas + Abordadas)</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-emerald-400 tabular-nums">
                {kpis.acordada + kpis.abordada}
              </span>
              <span className="text-sm text-neutral-400 mb-0.5">/ {kpis.total}</span>
              <Delta value={delta?.acordada !== undefined && delta?.abordada !== undefined
                ? (delta.acordada ?? 0) + (delta.abordada ?? 0)
                : undefined}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs text-neutral-500 mb-1">
              <span>% concluído</span>
              <span>{kpis.pct_concluido}%</span>
            </div>
            <div className="w-full bg-neutral-800 rounded-full h-3">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all"
                style={{ width: `${kpis.pct_concluido}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
