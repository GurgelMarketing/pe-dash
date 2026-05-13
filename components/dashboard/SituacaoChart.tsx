'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { KPIsGlobais } from '@/types';

const COLORS: Record<string, string> = {
  'Nada Feito':             '#ef4444',
  'Em Andamento':           '#3b82f6',
  'Acordadas':              '#10b981',
  'Abordadas':              '#34d399',
};

interface Props { kpis: KPIsGlobais }

export function SituacaoChart({ kpis }: Props) {
  const data = [
    { name: 'Nada Feito',   value: kpis.nada_feito   },
    { name: 'Em Andamento', value: kpis.em_andamento  },
    { name: 'Acordadas',    value: kpis.acordada      },
    { name: 'Abordadas',    value: kpis.abordada      },
  ].filter(d => d.value > 0);

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm text-neutral-300">Situação Geral</CardTitle>
      </CardHeader>
      <CardContent className="h-64 px-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
              {data.map(entry => (
                <Cell key={entry.name} fill={COLORS[entry.name] ?? '#6b7280'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: 8 }}
              labelStyle={{ color: '#e5e5e5' }}
              itemStyle={{ color: '#a3a3a3' }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span style={{ color: '#a3a3a3', fontSize: 12 }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
