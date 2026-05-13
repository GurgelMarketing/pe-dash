export type Situacao =
  | 'Nada Feito'
  | 'Abordagem Em Andamento'
  | 'Acordada'
  | 'Abordada'
  | 'Fac'
  | string;

export type Pesquisa = 'PAS' | 'PAC' | 'PIA' | 'PAIC' | string;

export interface EmpresaRow {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  pesquisa: Pesquisa;
  situacao: Situacao;
  vip: boolean;
  responsavel: string;
  municipio: string;
  modelo?: string;
  empresa_nova: boolean;
  tem_telefone: boolean;
  tem_email: boolean;
  cnae?: string;
  endereco?: string;
}

export interface Snapshot {
  id: string;
  filename: string;
  upload_date: string;
  record_date: string;
  total_rows: number;
  notes?: string;
}

export interface KPIsGlobais {
  total: number;
  total_vip: number;
  nada_feito: number;
  em_andamento: number;
  acordada: number;
  abordada: number;
  empresas_novas: number;
  sem_contato: number;
  pct_concluido: number;
}

export interface MetricaTecnico {
  responsavel: string;
  total: number;
  vip: number;
  nada_feito: number;
  em_andamento: number;
  acordada: number;
  abordada: number;
  novas: number;
  sem_contato: number;
  pct_concluido: number;
}

export interface Insight {
  tipo: 'alert' | 'warning' | 'info' | 'success';
  titulo: string;
  descricao: string;
  valor?: string | number;
}

export interface CampanhaConfig {
  inicio: Date;
  fim: Date;
  metaDiariaApm: number;
  timezone: string;
  horarioInicio: number;
  horarioFim: number;
}

export type { MetaProdutividade, ResumoEquipe } from '../lib/analytics/produtividade';
