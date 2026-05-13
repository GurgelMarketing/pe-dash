import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MetaProdutividade, ResumoEquipe } from '@/lib/analytics/produtividade';

interface Props {
  apms:   MetaProdutividade[];
  resumo: ResumoEquipe;
}

const statusConfig = {
  no_prazo:  { label: 'No prazo',  cls: 'bg-emerald-900 text-emerald-300 border-emerald-700' },
  atencao:   { label: 'Atenção',   cls: 'bg-yellow-900 text-yellow-300 border-yellow-700'   },
  critico:   { label: 'Crítico',   cls: 'bg-red-900 text-red-300 border-red-700'            },
  concluido: { label: 'Concluído', cls: 'bg-neutral-800 text-neutral-300 border-neutral-600'},
};

export function ProdutividadePanel({ apms, resumo }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Resumo equipe */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'No prazo',  value: resumo.apms_no_prazo,  color: 'text-emerald-400' },
          { label: 'Atenção',   value: resumo.apms_atencao,   color: 'text-yellow-400'  },
          { label: 'Crítico',   value: resumo.apms_critico,   color: 'text-red-400'     },
          { label: 'Concluído', value: resumo.apms_concluido, color: 'text-neutral-400' },
        ].map(item => (
          <Card key={item.label} className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4">
              <p className="text-xs text-neutral-400 mb-1">{item.label}</p>
              <span className={`text-2xl font-bold ${item.color}`}>{item.value}</span>
              <span className="text-xs text-neutral-500 ml-1">APMs</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela APMs */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm text-neutral-300">Produtividade por APM</CardTitle>
          <p className="text-xs text-neutral-500">Meta: {resumo.meta_diaria_equipe / (apms.length || 1)} abordagens/APM/dia · Ritmo médio equipe: {resumo.media_ritmo_equipe}/dia</p>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-xs text-neutral-500">
                  <th className="text-left px-4 py-2 font-medium">APM</th>
                  <th className="text-right px-3 py-2 font-medium">Carteira</th>
                  <th className="text-right px-3 py-2 font-medium">Concluídas</th>
                  <th className="text-right px-3 py-2 font-medium">Ritmo/dia</th>
                  <th className="text-right px-3 py-2 font-medium">Meta/dia</th>
                  <th className="text-right px-3 py-2 font-medium">Déficit</th>
                  <th className="text-right px-3 py-2 font-medium">Projeção</th>
                  <th className="text-right px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {apms.map(a => {
                  const cfg = statusConfig[a.status];
                  return (
                    <tr key={a.responsavel} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                      <td className="px-4 py-2.5 font-medium text-neutral-200">{a.responsavel}</td>
                      <td className="px-3 py-2.5 text-right text-neutral-300 tabular-nums">{a.total_carteira}</td>
                      <td className="px-3 py-2.5 text-right text-emerald-400 tabular-nums">{a.concluidas}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        <span className={a.ritmo_real_por_dia >= a.meta_diaria ? 'text-emerald-400' : a.ritmo_real_por_dia >= a.meta_diaria * 0.5 ? 'text-yellow-400' : 'text-red-400'}>
                          {a.ritmo_real_por_dia}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-neutral-500 tabular-nums">{a.meta_diaria}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        <span className={a.deficit_acumulado > 0 ? 'text-red-400' : 'text-emerald-400'}>
                          {a.deficit_acumulado > 0 ? `+${a.deficit_acumulado}` : a.deficit_acumulado}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-neutral-300 tabular-nums">{a.projecao_final}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Badge className={`text-xs border ${cfg.cls}`}>{cfg.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
