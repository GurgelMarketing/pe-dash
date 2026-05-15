import type { Snapshot, KPIsGlobais, MetricaTecnico, CampanhaConfig } from '../../types';
import type { MetaProdutividade, ResumoEquipe } from '../analytics/produtividade';

function fmtData(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function fmtNum(n: number): string {
  return n.toLocaleString('pt-BR');
}

function deltaStr(d: number): string {
  if (d > 0) return `+${d}`;
  if (d < 0) return `${d}`;
  return '=';
}

const statusLabels: Record<MetaProdutividade['status'], string> = {
  no_prazo:  'no prazo',
  atencao:   'em atenção',
  critico:   'em situação crítica',
  concluido: 'com carteira concluída',
};

export function narrarEvolucaoGlobal(
  snapshots: Snapshot[],
  kpisPorSnap: KPIsGlobais[],
  cfg: CampanhaConfig,
): string {
  const n = snapshots.length;
  if (n === 0) return 'Sem dados disponíveis para análise.';

  const atual = kpisPorSnap[0];
  const fimLabel = new Date(cfg.campanha_fim + 'T12:00:00').toLocaleDateString('pt-BR');

  const concluidas = atual.acordada + atual.abordada;
  const pct = atual.pct_concluido;

  let evolucao = '';
  if (n >= 2) {
    const anterior = kpisPorSnap[1];
    const deltaConc = concluidas - (anterior.acordada + anterior.abordada);
    const deltaNada = atual.nada_feito - anterior.nada_feito;
    const dataAnterior = fmtData(snapshots[1].record_date);
    const dataAtual = fmtData(snapshots[0].record_date);

    evolucao = ` Em relação a ${dataAnterior}, em ${dataAtual} foram registradas `
      + `${Math.abs(deltaConc)} abordagens ${deltaConc >= 0 ? 'a mais' : 'a menos'}`
      + ` (${deltaStr(deltaConc)}). O estoque de empresas sem abordagem `
      + (deltaNada < 0
        ? `reduziu em ${Math.abs(deltaNada)} unidades`
        : deltaNada > 0
          ? `aumentou em ${deltaNada} unidades`
          : 'permaneceu estável')
      + '.';
  }

  if (n >= 3) {
    const mais_antigo = kpisPorSnap[2];
    const concMaisAntigo = mais_antigo.acordada + mais_antigo.abordada;
    const deltaTotal = concluidas - concMaisAntigo;
    const dataInicio = fmtData(snapshots[n - 1].record_date);
    evolucao += ` Considerando os 3 dias monitorados (a partir de ${dataInicio}), o acumulado de abordagens concluídas variou ${deltaStr(deltaTotal)} unidades.`;
  }

  return `A campanha de Pesquisas Econômicas conta com ${fmtNum(atual.total)} empresas na carteira.`
    + ` Até o momento, ${fmtNum(concluidas)} foram concluídas (${pct}% do total).`
    + evolucao
    + ` O prazo final da campanha é ${fimLabel}.`;
}

export function narrarDesempenhoAPM(
  nome: string,
  metricasPorSnap: MetricaTecnico[],
  prod: MetaProdutividade,
  cfg: CampanhaConfig,
): string {
  if (metricasPorSnap.length === 0) return `Sem dados disponíveis para ${nome}.`;

  const atual = metricasPorSnap[0];
  const concluidas = atual.acordada + atual.abordada;
  const fimLabel = new Date(cfg.campanha_fim + 'T12:00:00').toLocaleDateString('pt-BR');

  // Evolução dos dias
  let evolDias = '';
  if (metricasPorSnap.length >= 2) {
    const diffs = metricasPorSnap.slice(0, -1).map((m, i) => {
      const prev = metricasPorSnap[i + 1];
      return (m.acordada + m.abordada) - (prev.acordada + prev.abordada);
    });
    const partes = diffs.map((d, i) => `${deltaStr(d)} no ${i + 1}º dia`);
    evolDias = ` Nos dias monitorados, o avanço foi: ${partes.join(', ')}.`;
  }

  // Avaliação de ritmo
  const ritmoCmp = prod.ritmo_real_por_dia >= prod.meta_diaria
    ? `acima da meta (${prod.meta_diaria}/dia)`
    : `abaixo da meta de ${prod.meta_diaria}/dia`;

  // Recomendação
  let recomendacao = '';
  if (prod.status === 'critico') {
    recomendacao = `Ação urgente necessária: o ritmo atual (${prod.ritmo_real_por_dia}/dia) `
      + `é insuficiente para zerar a carteira. Priorize as ${atual.em_andamento} `
      + `empresas em andamento e as VIP (${atual.vip}).`;
  } else if (prod.status === 'atencao') {
    recomendacao = `Atenção redobrada: o ritmo precisa aumentar de ${prod.ritmo_real_por_dia} `
      + `para ${prod.ritmo_necessario}/dia para atingir a meta até ${fimLabel}.`;
  } else if (prod.status === 'no_prazo') {
    recomendacao = `Manter o ritmo atual de ${prod.ritmo_real_por_dia}/dia para concluir `
      + `a carteira dentro do prazo. Projeção: ${fmtNum(prod.projecao_final)} empresas concluídas.`;
  } else {
    recomendacao = `Carteira concluída. Verificar se há empresas novas a incorporar.`;
  }

  return `${nome} gerencia uma carteira de ${fmtNum(atual.total)} empresas`
    + ` (${atual.vip} VIP). Até o momento, ${fmtNum(concluidas)} foram concluídas`
    + ` (${atual.pct_concluido}%).`
    + evolDias
    + ` Seu ritmo atual é de ${prod.ritmo_real_por_dia} abordagens/dia útil, ${ritmoCmp}.`
    + ` O déficit acumulado em relação à meta é de ${prod.deficit_acumulado > 0 ? prod.deficit_acumulado : 0} abordagens.`
    + ` ${recomendacao}`;
}

export function narrarEquipe(
  resumo: ResumoEquipe,
  apms: MetaProdutividade[],
  cfg: CampanhaConfig,
): string {
  const total = apms.length;
  if (total === 0) return 'Sem dados de equipe disponíveis.';

  const lider = apms.reduce((a, b) => b.ritmo_real_por_dia > a.ritmo_real_por_dia ? b : a);
  const criticos = apms.filter(p => p.status === 'critico');
  const noPrazo = apms.filter(p => p.status === 'no_prazo' || p.status === 'concluido');
  const fimLabel = new Date(cfg.campanha_fim + 'T12:00:00').toLocaleDateString('pt-BR');

  let texto = `A equipe conta com ${total} APM${total > 1 ? 's' : ''}.`
    + ` O período da campanha tem ${resumo.total_dias_campanha} dias úteis,`
    + ` dos quais ${resumo.dias_decorridos} já se passaram (${resumo.pct_periodo_decorrido}%)`
    + ` e restam ${resumo.dias_restantes} até ${fimLabel}.`
    + ` O ritmo médio da equipe é de ${resumo.media_ritmo_equipe} abordagens/dia`
    + ` (meta coletiva: ${resumo.meta_diaria_equipe}/dia).`;

  if (noPrazo.length > 0) {
    texto += ` ${noPrazo.length} APM${noPrazo.length > 1 ? 's estão' : ' está'} dentro da meta.`;
  }
  if (criticos.length > 0) {
    const nomes = criticos.map(p => p.responsavel.split(' ')[0]).join(', ');
    texto += ` ${criticos.length} APM${criticos.length > 1 ? 's requerem' : ' requer'} atenção imediata: ${nomes}.`;
  }
  if (lider.ritmo_real_por_dia > 0) {
    texto += ` Destaque do período: ${lider.responsavel} com ${lider.ritmo_real_por_dia} abordagens/dia.`;
  }

  return texto;
}

export function narrarConclusao(
  kpisAtual: KPIsGlobais,
  resumo: ResumoEquipe,
  apms: MetaProdutividade[],
  cfg: CampanhaConfig,
): string {
  const concluidas = kpisAtual.acordada + kpisAtual.abordada;
  const pendentes = kpisAtual.total - concluidas;
  const fimLabel = new Date(cfg.campanha_fim + 'T12:00:00').toLocaleDateString('pt-BR');
  const criticos = apms.filter(p => p.status === 'critico').length;
  const projecaoEquipe = apms.reduce((s, p) => s + p.projecao_final, 0);
  const metaEquipe = kpisAtual.total;

  const projecaoOk = projecaoEquipe >= metaEquipe * 0.9;

  return `A campanha apresenta ${kpisAtual.pct_concluido}% de conclusão com ${fmtNum(pendentes)}`
    + ` empresas ainda pendentes. Com ${resumo.dias_restantes} dias úteis até ${fimLabel},`
    + ` a projeção coletiva da equipe é de ${fmtNum(projecaoEquipe)} empresas concluídas`
    + ` (${Math.round(projecaoEquipe / metaEquipe * 100)}% da carteira).`
    + (projecaoOk
      ? ' A equipe está no caminho certo para cumprir a meta da campanha.'
      : ` É necessário elevar o ritmo coletivo para atingir a meta. ${criticos > 0 ? `${criticos} APM${criticos > 1 ? 's necessitam' : ' necessita'} de intervenção imediata.` : ''}`)
    + ' A coordenação deve monitorar diariamente a evolução dos indicadores e ajustar a estratégia conforme necessário.';
}
