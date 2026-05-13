import type { KPIsGlobais } from '../../types';

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
