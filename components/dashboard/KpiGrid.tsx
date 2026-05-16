import { Card, CardContent } from '@/components/ui/card';
import { Delta } from '@/components/ui/delta';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import type { KPIsGlobais } from '@/types';

interface Props {
  kpis:  KPIsGlobais;
  delta?: Partial<KPIsGlobais>;
}

export function KpiGrid({ kpis, delta }: Props) {
  const cards = [
    { label: 'Total',          value: kpis.total,          deltaKey: 'total'          as const, color: 'text-white',        tooltip: 'Total de empresas na carteira da campanha. Cada linha representa um CNPJ a ser abordado. Ex: 1.072 = 1.072 empresas para contatar neste período.'                                                                         },
    { label: 'VIP',            value: kpis.total_vip,      deltaKey: undefined,                  color: 'text-yellow-400',   tooltip: 'Empresas de alta prioridade que devem ser contatadas primeiro, pois têm maior peso no resultado da pesquisa. Ex: 74 VIPs = 74 CNPJs que não podem ficar sem resposta.'                                                   },
    { label: 'Nada Feito',     value: kpis.nada_feito,     deltaKey: 'nada_feito'     as const, color: 'text-red-400',       tooltip: 'Empresas que ainda não receberam nenhuma tentativa de contato. Ex: 782 = 782 empresas aguardando a primeira abordagem do APM responsável.'                                                                               },
    { label: 'Em Andamento',   value: kpis.em_andamento,   deltaKey: 'em_andamento'   as const, color: 'text-blue-400',      tooltip: 'Empresas com contato iniciado, mas sem resposta definitiva ainda. Ex: 132 = 132 empresas em processo de negociação ou aguardando retorno.'                                                                               },
    { label: 'Acordadas',      value: kpis.acordada,       deltaKey: 'acordada'       as const, color: 'text-emerald-400',   tooltip: 'Empresas que confirmaram participação e agendaram a entrevista com o APM. Ex: 139 = 139 questionários agendados ou em vias de coleta.'                                                                                   },
    { label: 'Abordadas',      value: kpis.abordada,       deltaKey: 'abordada'       as const, color: 'text-emerald-300',   tooltip: 'Empresas que já responderam ao questionário — coleta totalmente concluída. Ex: 16 = 16 pesquisas finalizadas e entregues.'                                                                                               },
    { label: 'Empresas Novas', value: kpis.empresas_novas, deltaKey: undefined,                  color: 'text-purple-400',   tooltip: 'CNPJs incorporados à carteira após o início da campanha — empresas recém-abertas ou adicionadas ao universo de pesquisa. Ex: 330 = 330 novos CNPJs incluídos.'                                                          },
    { label: 'Sem Contato',    value: kpis.sem_contato,    deltaKey: 'sem_contato'    as const, color: 'text-orange-400',    tooltip: 'Empresas sem nenhuma via de contato disponível (sem telefone, sem e-mail, sem responsável identificado). Ex: 344 = 344 empresas que exigem busca ativa de dados.' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(c => (
        <Card key={c.label} className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-1">
              <p className="text-xs text-neutral-400">{c.label}</p>
              <InfoTooltip text={c.tooltip} />
            </div>
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
            <div className="flex items-start justify-between mb-1 gap-2">
              <p className="text-xs text-neutral-400">Concluídas (Acordadas + Abordadas)</p>
              <InfoTooltip text="Acordadas + Abordadas — representa o avanço real da campanha. Ex: 155 de 1.072 = 14,5% do trabalho concluído até esta data." />
            </div>
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
