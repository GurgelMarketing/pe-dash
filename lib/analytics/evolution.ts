import type { KPIsGlobais, MetricaTecnico } from '../../types';

export function calcularDelta(
  snapshotAtual: KPIsGlobais,
  snapshotAnterior: KPIsGlobais,
): Partial<KPIsGlobais> {
  return {
    total:          snapshotAtual.total - snapshotAnterior.total,
    nada_feito:     snapshotAtual.nada_feito - snapshotAnterior.nada_feito,
    em_andamento:   snapshotAtual.em_andamento - snapshotAnterior.em_andamento,
    acordada:       snapshotAtual.acordada - snapshotAnterior.acordada,
    abordada:       snapshotAtual.abordada - snapshotAnterior.abordada,
    empresas_novas: snapshotAtual.empresas_novas - snapshotAnterior.empresas_novas,
    sem_contato:    snapshotAtual.sem_contato - snapshotAnterior.sem_contato,
    pct_concluido:  parseFloat(
      (snapshotAtual.pct_concluido - snapshotAnterior.pct_concluido).toFixed(1)
    ),
  };
}

export function calcularDeltaTecnico(
  atual: MetricaTecnico,
  anterior: MetricaTecnico,
): Partial<MetricaTecnico> {
  return {
    nada_feito:   atual.nada_feito   - anterior.nada_feito,
    em_andamento: atual.em_andamento - anterior.em_andamento,
    acordada:     atual.acordada     - anterior.acordada,
    abordada:     atual.abordada     - anterior.abordada,
    sem_contato:  atual.sem_contato  - anterior.sem_contato,
  };
}
