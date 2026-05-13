import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Delta } from '@/components/ui/delta';
import type { MetricaTecnico } from '@/types';

interface Props {
  metricas: MetricaTecnico[];
  deltaMetricas?: Map<string, Partial<MetricaTecnico> | undefined>;
}

export function TecnicoTable({ metricas, deltaMetricas }: Props) {
  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm text-neutral-300">Métricas por Técnico (APM)</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-xs text-neutral-500">
                <th className="text-left px-4 py-2 font-medium">APM</th>
                <th className="text-right px-3 py-2 font-medium">Total</th>
                <th className="text-right px-3 py-2 font-medium">VIP</th>
                <th className="text-right px-3 py-2 font-medium">Nada Feito</th>
                <th className="text-right px-3 py-2 font-medium">Andamento</th>
                <th className="text-right px-3 py-2 font-medium">Acordadas</th>
                <th className="text-right px-3 py-2 font-medium">Abordadas</th>
                <th className="text-right px-3 py-2 font-medium">Novas</th>
                <th className="px-4 py-2 font-medium">Progresso</th>
              </tr>
            </thead>
            <tbody>
              {metricas.map(m => (
                <tr key={m.responsavel} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                  <td className="px-4 py-2.5 font-medium">
                    <Link
                      href={`/tecnicos/${encodeURIComponent(m.responsavel)}`}
                      className="text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      {m.responsavel}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-neutral-300">{m.total}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-yellow-400">{m.vip}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="tabular-nums text-red-400">{m.nada_feito}</span>
                    <Delta value={deltaMetricas?.get(m.responsavel)?.nada_feito} />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="tabular-nums text-blue-400">{m.em_andamento}</span>
                    <Delta value={deltaMetricas?.get(m.responsavel)?.em_andamento} />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="tabular-nums text-emerald-400">{m.acordada}</span>
                    <Delta value={deltaMetricas?.get(m.responsavel)?.acordada} />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="tabular-nums text-emerald-300">{m.abordada}</span>
                    <Delta value={deltaMetricas?.get(m.responsavel)?.abordada} />
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-purple-400">{m.novas}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <div className="flex-1 bg-neutral-800 rounded-full h-1.5">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${m.pct_concluido}%` }}
                        />
                      </div>
                      <Badge variant="outline" className="text-xs border-neutral-700 text-neutral-400 tabular-nums w-12 justify-center">
                        {m.pct_concluido}%
                      </Badge>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
