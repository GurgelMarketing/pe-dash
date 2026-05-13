'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MetricaTecnico } from '@/types';

interface Props { metricas: MetricaTecnico[] }

function firstName(name: string) {
  return name.split(' ')[0];
}

export function AndamentoChart({ metricas }: Props) {
  const data = metricas.map(m => ({
    name:         firstName(m.responsavel),
    'Nada Feito': m.nada_feito,
    'Andamento':  m.em_andamento,
    'Acordadas':  m.acordada,
    'Abordadas':  m.abordada,
  }));

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm text-neutral-300">Andamento por Técnico (APM)</CardTitle>
      </CardHeader>
      <CardContent className="h-72 px-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="name" tick={{ fill: '#a3a3a3', fontSize: 11 }} />
            <YAxis tick={{ fill: '#a3a3a3', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: 8 }}
              labelStyle={{ color: '#e5e5e5' }}
              itemStyle={{ color: '#a3a3a3' }}
            />
            <Legend formatter={(v) => <span style={{ color: '#a3a3a3', fontSize: 11 }}>{v}</span>} />
            <Bar dataKey="Nada Feito" stackId="a" fill="#ef4444" />
            <Bar dataKey="Andamento"  stackId="a" fill="#3b82f6" />
            <Bar dataKey="Acordadas"  stackId="a" fill="#10b981" />
            <Bar dataKey="Abordadas"  stackId="a" fill="#34d399" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
