import {
  CAMPANHA,
  TOTAL_DIAS_UTEIS_CAMPANHA,
  diasUteisDecorridos,
  diasUteisRestantes,
  diasUteisDecorridosConfig,
  diasUteisRestantesConfig,
  totalDiasUteisConfig,
} from '../calendario/diasUteis';
import type { MetricaTecnico, CampanhaConfig } from '../../types';

export interface MetaProdutividade {
  responsavel: string;
  total_carteira: number;
  concluidas: number;
  dias_uteis_decorridos: number;
  ritmo_real_por_dia: number;
  meta_diaria: number;
  esperado_ate_hoje: number;
  deficit_acumulado: number;
  dias_uteis_restantes: number;
  pendentes: number;
  ritmo_necessario: number;
  projecao_final: number;
  vai_concluir_carteira: boolean;
  status: 'no_prazo' | 'atencao' | 'critico' | 'concluido';
}

export function calcularProdutividade(metrica: MetricaTecnico, cfg?: CampanhaConfig): MetaProdutividade {
  const concluidas     = metrica.acordada + metrica.abordada;
  const total_carteira = metrica.total;
  const dias_dec       = cfg ? diasUteisDecorridosConfig(cfg) : diasUteisDecorridos();
  const dias_rest      = cfg ? diasUteisRestantesConfig(cfg)  : diasUteisRestantes();
  const meta_diaria    = cfg ? cfg.meta_diaria_apm            : CAMPANHA.META_DIARIA_APM;

  const ritmo_real = dias_dec > 0
    ? parseFloat((concluidas / dias_dec).toFixed(2))
    : 0;

  const esperado = dias_dec * meta_diaria;
  const deficit  = esperado - concluidas;

  const pendentes   = total_carteira - concluidas;
  const ritmo_nec   = dias_rest > 0
    ? parseFloat((pendentes / dias_rest).toFixed(2))
    : pendentes > 0 ? Infinity : 0;

  const projecao = Math.round(concluidas + ritmo_real * dias_rest);

  let status: MetaProdutividade['status'];
  if (concluidas >= total_carteira)          status = 'concluido';
  else if (ritmo_real >= meta_diaria)        status = 'no_prazo';
  else if (ritmo_real >= meta_diaria * 0.5) status = 'atencao';
  else                                       status = 'critico';

  return {
    responsavel: metrica.responsavel,
    total_carteira,
    concluidas,
    dias_uteis_decorridos:  dias_dec,
    ritmo_real_por_dia:     ritmo_real,
    meta_diaria,
    esperado_ate_hoje:      esperado,
    deficit_acumulado:      deficit,
    dias_uteis_restantes:   dias_rest,
    pendentes,
    ritmo_necessario:       ritmo_nec,
    projecao_final:         projecao,
    vai_concluir_carteira:  projecao >= total_carteira,
    status,
  };
}

export function calcularProdutividadeEquipe(metricas: MetricaTecnico[], cfg?: CampanhaConfig): MetaProdutividade[] {
  return metricas.map(m => calcularProdutividade(m, cfg));
}

export interface ResumoEquipe {
  total_dias_campanha:   number;
  dias_decorridos:       number;
  dias_restantes:        number;
  pct_periodo_decorrido: number;
  apms_no_prazo:         number;
  apms_atencao:          number;
  apms_critico:          number;
  apms_concluido:        number;
  media_ritmo_equipe:    number;
  meta_diaria_equipe:    number;
}

export function resumoEquipe(prod: MetaProdutividade[], cfg?: CampanhaConfig): ResumoEquipe {
  const dias_dec   = cfg ? diasUteisDecorridosConfig(cfg) : diasUteisDecorridos();
  const dias_rest  = cfg ? diasUteisRestantesConfig(cfg)  : diasUteisRestantes();
  const total_dias = cfg ? totalDiasUteisConfig(cfg)      : TOTAL_DIAS_UTEIS_CAMPANHA;
  const meta       = cfg ? cfg.meta_diaria_apm            : CAMPANHA.META_DIARIA_APM;

  return {
    total_dias_campanha:   total_dias,
    dias_decorridos:       dias_dec,
    dias_restantes:        dias_rest,
    pct_periodo_decorrido: parseFloat((dias_dec / (total_dias || 1) * 100).toFixed(1)),
    apms_no_prazo:         prod.filter(p => p.status === 'no_prazo').length,
    apms_atencao:          prod.filter(p => p.status === 'atencao').length,
    apms_critico:          prod.filter(p => p.status === 'critico').length,
    apms_concluido:        prod.filter(p => p.status === 'concluido').length,
    media_ritmo_equipe:    parseFloat(
      (prod.reduce((s, p) => s + p.ritmo_real_por_dia, 0) / (prod.length || 1)).toFixed(2)
    ),
    meta_diaria_equipe:    prod.length * meta,
  };
}
