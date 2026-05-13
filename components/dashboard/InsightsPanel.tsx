import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Insight } from '@/types';

const config = {
  alert:   { bar: 'bg-red-500',    bg: 'bg-red-950/40',    border: 'border-red-800',    label: 'bg-red-900 text-red-300',    text: 'CRÍTICO'  },
  warning: { bar: 'bg-yellow-500', bg: 'bg-yellow-950/40', border: 'border-yellow-800', label: 'bg-yellow-900 text-yellow-300', text: 'ALERTA'  },
  info:    { bar: 'bg-blue-500',   bg: 'bg-blue-950/40',   border: 'border-blue-800',   label: 'bg-blue-900 text-blue-300',  text: 'INFO'     },
  success: { bar: 'bg-emerald-500',bg: 'bg-emerald-950/40',border: 'border-emerald-800',label: 'bg-emerald-900 text-emerald-300', text: 'OK' },
};

interface Props { insights: Insight[] }

export function InsightsPanel({ insights }: Props) {
  if (!insights.length) return null;

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm text-neutral-300">Insights Automáticos</CardTitle>
        <p className="text-xs text-neutral-500">{insights.length} alertas gerados</p>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex flex-col gap-2">
          {insights.map((ins, i) => {
            const c = config[ins.tipo];
            return (
              <div key={i} className={`flex gap-3 rounded-lg border p-3 ${c.bg} ${c.border}`}>
                <div className={`w-1 rounded-full shrink-0 ${c.bar}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.label}`}>{c.text}</span>
                    <span className="text-xs font-medium text-neutral-200 truncate">{ins.titulo}</span>
                  </div>
                  <p className="text-xs text-neutral-400">{ins.descricao}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
