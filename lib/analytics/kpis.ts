import type { KPIsGlobais } from '../../types';

export function calcularKPIs(data: Record<string, unknown>): KPIsGlobais {
  return {
    total:          Number(data.total ?? 0),
    total_vip:      Number(data.total_vip ?? 0),
    nada_feito:     Number(data.nada_feito ?? 0),
    em_andamento:   Number(data.em_andamento ?? 0),
    acordada:       Number(data.acordada ?? 0),
    abordada:       Number(data.abordada ?? 0),
    empresas_novas: Number(data.empresas_novas ?? 0),
    sem_contato:    Number(data.sem_contato ?? 0),
    pct_concluido:  Number(data.pct_concluido ?? 0),
  };
}

export function calcularDelta(
  atual: KPIsGlobais,
  anterior: KPIsGlobais,
): Partial<KPIsGlobais> {
  return {
    total:          atual.total - anterior.total,
    nada_feito:     atual.nada_feito - anterior.nada_feito,
    em_andamento:   atual.em_andamento - anterior.em_andamento,
    acordada:       atual.acordada - anterior.acordada,
    abordada:       atual.abordada - anterior.abordada,
    pct_concluido:  parseFloat((atual.pct_concluido - anterior.pct_concluido).toFixed(1)),
  };
}
