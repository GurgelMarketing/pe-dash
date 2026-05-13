'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MetricaTecnico } from '@/types';

interface Props { metricas: MetricaTecnico[] }

// Agrupa metricas (que são por técnico) por pesquisa a partir dos dados brutos de empresas
// Esta versão simplificada usa as métricas por técnico para montar a distribuição
export function PesquisaChart({ metricas: _ }: Props) {
  // O componente recebe dados via prop pesquisaData vindos do dashboard
  return null;
}

interface PesquisaData {
  pesquisa: string;
  nada_feito: number;
  em_andamento: number;
  acordada: number;
  abordada: number;
}

interface PesquisaChartFullProps { data: PesquisaData[] }

export function PesquisaChartFull({ data }: PesquisaChartFullProps) {
  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm text-neutral-300">Situação por Pesquisa</CardTitle>
      </CardHeader>
      <CardContent className="h-64 px-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="pesquisa" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
            <YAxis tick={{ fill: '#a3a3a3', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: 8 }}
              labelStyle={{ color: '#e5e5e5' }}
              itemStyle={{ color: '#a3a3a3' }}
            />
            <Legend formatter={(v) => <span style={{ color: '#a3a3a3', fontSize: 11 }}>{v}</span>} />
            <Bar dataKey="nada_feito"   name="Nada Feito"   stackId="a" fill="#ef4444" />
            <Bar dataKey="em_andamento" name="Em Andamento" stackId="a" fill="#3b82f6" />
            <Bar dataKey="acordada"     name="Acordadas"    stackId="a" fill="#10b981" />
            <Bar dataKey="abordada"     name="Abordadas"    stackId="a" fill="#34d399" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
