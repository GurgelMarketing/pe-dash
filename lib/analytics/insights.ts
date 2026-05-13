import type { KPIsGlobais, MetricaTecnico, Insight } from '../../types';
import type { MetaProdutividade } from './produtividade';
import { diasUteisRestantes } from '../calendario/diasUteis';
import { CAMPANHA } from '../calendario/diasUteis';

export function gerarInsights(
  kpis: KPIsGlobais,
  metricas: MetricaTecnico[],
  prod: MetaProdutividade[],
): Insight[] {
  const insights: Insight[] = [];
  const diasRestantes = diasUteisRestantes();
  const meta = CAMPANHA.META_DIARIA_APM;

  // ── Insights de Situação ───────────────────────────────────────────────────

  if (kpis.total > 0 && kpis.nada_feito / kpis.total > 0.7) {
    insights.push({
      tipo: 'alert',
      titulo: 'Alta concentração sem abordagem',
      descricao: `${kpis.nada_feito} empresas (${Math.round(kpis.nada_feito / kpis.total * 100)}%) ainda não foram abordadas.`,
      valor: kpis.nada_feito,
    });
  }

  metricas.forEach(m => {
    if (m.pct_concluido < 5 && m.total > 0) {
      insights.push({
        tipo: 'warning',
        titulo: `APM com baixo progresso`,
        descricao: `${m.responsavel} tem apenas ${m.pct_concluido}% de conclusão (${m.acordada + m.abordada} de ${m.total} empresas).`,
      });
    }
  });

  if (kpis.total > 0 && kpis.sem_contato / kpis.total > 0.3) {
    insights.push({
      tipo: 'info',
      titulo: 'Alto índice sem contato',
      descricao: `${kpis.sem_contato} empresas (${Math.round(kpis.sem_contato / kpis.total * 100)}%) não possuem telefone nem e-mail cadastrado.`,
      valor: kpis.sem_contato,
    });
  }

  if (metricas.length >= 2) {
    const cargas = metricas.map(m => m.total);
    const max = Math.max(...cargas);
    const min = Math.min(...cargas);
    if (min > 0 && (max - min) / min > 0.5) {
      const maior = metricas.find(m => m.total === max)!;
      const menor = metricas.find(m => m.total === min)!;
      insights.push({
        tipo: 'warning',
        titulo: 'Desequilíbrio de carteira',
        descricao: `Diferença de mais de 50% entre carteiras: ${maior.responsavel} tem ${max} empresas, ${menor.responsavel} tem ${min}.`,
      });
    }
  }

  const maisEmAndamento = metricas.reduce(
    (acc, m) => (m.em_andamento > acc.em_andamento ? m : acc),
    metricas[0],
  );
  if (maisEmAndamento && maisEmAndamento.em_andamento > 0) {
    insights.push({
      tipo: 'info',
      titulo: 'Gargalo de andamento',
      descricao: `${maisEmAndamento.responsavel} tem ${maisEmAndamento.em_andamento} empresas em andamento — possível gargalo de conversão.`,
    });
  }

  const melhor = metricas.reduce(
    (acc, m) => (m.pct_concluido > acc.pct_concluido ? m : acc),
    metricas[0],
  );
  if (melhor && melhor.pct_concluido > 0) {
    insights.push({
      tipo: 'success',
      titulo: 'Destaque de conclusão',
      descricao: `${melhor.responsavel} lidera com ${melhor.pct_concluido}% de conclusão (${melhor.acordada + melhor.abordada} empresas concluídas).`,
    });
  }

  // ── Insights de Produtividade ──────────────────────────────────────────────

  if (diasRestantes <= 10) {
    insights.push({
      tipo: 'warning',
      titulo: 'Campanha próxima do fim',
      descricao: `Restam apenas ${diasRestantes} dias úteis até o fim das abordagens (25/06/2026).`,
      valor: diasRestantes,
    });
  }

  prod.forEach(p => {
    if (p.ritmo_necessario > meta * 2) {
      insights.push({
        tipo: 'alert',
        titulo: `Ritmo impossível — ${p.responsavel}`,
        descricao: `${p.responsavel} precisaria de ${p.ritmo_necessario.toFixed(1)} abordagens/dia para zerar a carteira. Ritmo atual: ${p.ritmo_real_por_dia}/dia. Intervenção necessária.`,
      });
    } else if (p.deficit_acumulado > meta * 3) {
      insights.push({
        tipo: 'warning',
        titulo: `Déficit acumulado — ${p.responsavel}`,
        descricao: `${p.responsavel} acumula déficit de ${p.deficit_acumulado} abordagens. Deveria ter ${p.esperado_ate_hoje} concluídas; tem ${p.concluidas}.`,
        valor: p.deficit_acumulado,
      });
    } else if (!p.vai_concluir_carteira && diasRestantes <= 15) {
      insights.push({
        tipo: 'alert',
        titulo: `Projeção crítica — ${p.responsavel}`,
        descricao: `Com menos de 15 dias úteis restantes, ${p.responsavel} deve concluir apenas ${p.projecao_final} de ${p.total_carteira} empresas. Faltarão ~${p.total_carteira - p.projecao_final}.`,
      });
    } else if (!p.vai_concluir_carteira) {
      insights.push({
        tipo: 'info',
        titulo: `Projeção abaixo da carteira — ${p.responsavel}`,
        descricao: `No ritmo atual, ${p.responsavel} concluirá ~${p.projecao_final} de ${p.total_carteira} empresas. Sugere-se aumento de ritmo.`,
      });
    }

    if (p.deficit_acumulado < 0) {
      insights.push({
        tipo: 'success',
        titulo: `Adiantado — ${p.responsavel}`,
        descricao: `${p.responsavel} está ${Math.abs(p.deficit_acumulado)} abordagens acima da meta acumulada.`,
        valor: Math.abs(p.deficit_acumulado),
      });
    }
  });

  if (prod.length > 0) {
    const lider = prod.reduce((acc, p) => (p.ritmo_real_por_dia > acc.ritmo_real_por_dia ? p : acc), prod[0]);
    if (lider.ritmo_real_por_dia > 0) {
      insights.push({
        tipo: 'success',
        titulo: 'Líder de produtividade',
        descricao: `${lider.responsavel} lidera com ${lider.ritmo_real_por_dia} abordagens/dia útil.`,
        valor: lider.ritmo_real_por_dia,
      });
    }

    const todosNoPrazo = prod.every(p => p.status === 'no_prazo' || p.status === 'concluido');
    if (todosNoPrazo && prod.length > 0) {
      insights.push({
        tipo: 'success',
        titulo: 'Equipe no prazo',
        descricao: 'Todos os APMs estão dentro da meta de produtividade. Excelente desempenho coletivo!',
      });
    }
  }

  return insights;
}
