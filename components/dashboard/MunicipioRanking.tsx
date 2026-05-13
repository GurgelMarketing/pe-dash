import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MUNICIPIOS_JURISDICAO, normalizarMunicipio } from '@/lib/municipios';

interface MunicipioData {
  municipio:  string;
  total:      number;
  concluidas: number;
}

interface Props { data: MunicipioData[] }

export function MunicipioRanking({ data }: Props) {
  // Indexa dados vindos da planilha por nome normalizado
  const dataMap = new Map<string, MunicipioData>();
  for (const d of data) {
    const nome = normalizarMunicipio(d.municipio);
    const existing = dataMap.get(nome);
    if (existing) {
      existing.total      += d.total;
      existing.concluidas += d.concluidas;
    } else {
      dataMap.set(nome, { municipio: nome, total: d.total, concluidas: d.concluidas });
    }
  }

  // Garante todos os 13 municípios, mesmo os com zero empresas
  const lista = MUNICIPIOS_JURISDICAO.map(m => {
    const found = dataMap.get(m.nome);
    return found ?? { municipio: m.nome, total: 0, concluidas: 0 };
  }).sort((a, b) => b.total - a.total);

  const maxTotal = lista[0]?.total ?? 1;

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm text-neutral-300">Municípios da Jurisdição</CardTitle>
        <p className="text-xs text-neutral-500">Agência Ananindeua · {MUNICIPIOS_JURISDICAO.length} municípios</p>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex flex-col gap-2.5">
          {lista.map(m => {
            const pct      = m.total > 0 ? Math.round(m.concluidas / m.total * 100) : 0;
            const barWidth = maxTotal > 0 ? Math.round(m.total / maxTotal * 100) : 0;
            return (
              <div key={m.municipio}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className={`truncate max-w-[60%] ${m.total === 0 ? 'text-neutral-500' : 'text-neutral-200'}`}>
                    {m.municipio}
                  </span>
                  <span className="text-neutral-400 tabular-nums shrink-0 ml-2">
                    {m.total > 0 ? `${m.total} emp · ${pct}% conc.` : 'sem dados'}
                  </span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
