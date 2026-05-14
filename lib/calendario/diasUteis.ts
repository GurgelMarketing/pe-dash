import { toZonedTime } from 'date-fns-tz';
import { isWeekend, eachDayOfInterval } from 'date-fns';
import type { CampanhaConfig } from '../../types';

export const CAMPANHA = {
  INICIO:           new Date('2026-04-01'),
  FIM:              new Date('2026-06-25'),
  META_DIARIA_APM:  8,
  TIMEZONE:         'America/Sao_Paulo',
  HORARIO_INICIO:   8,
  HORARIO_FIM:      17,
} as const;

export const FERIADOS_2026: Date[] = [
  new Date('2026-04-21'),
  new Date('2026-05-01'),
  new Date('2026-06-11'),
];

export function isDiaUtil(date: Date): boolean {
  if (isWeekend(date)) return false;
  const dateStr = date.toISOString().slice(0, 10);
  return !FERIADOS_2026.some(f => f.toISOString().slice(0, 10) === dateStr);
}

export function contarDiasUteis(inicio: Date, fim: Date): number {
  if (fim < inicio) return 0;
  const dias = eachDayOfInterval({ start: inicio, end: fim });
  return dias.filter(isDiaUtil).length;
}

export function agoraEmBrasilia(): Date {
  return toZonedTime(new Date(), CAMPANHA.TIMEZONE);
}

export function estaEmHorarioComercial(): boolean {
  const agora = agoraEmBrasilia();
  const hora = agora.getHours();
  if (!isDiaUtil(agora)) return false;
  return hora >= CAMPANHA.HORARIO_INICIO && hora < CAMPANHA.HORARIO_FIM;
}

export const TOTAL_DIAS_UTEIS_CAMPANHA = contarDiasUteis(
  CAMPANHA.INICIO,
  CAMPANHA.FIM,
);

export function diasUteisDecorridos(): number {
  const hoje = agoraEmBrasilia();
  if (hoje < CAMPANHA.INICIO) return 0;
  const fim = hoje > CAMPANHA.FIM ? CAMPANHA.FIM : hoje;
  return contarDiasUteis(CAMPANHA.INICIO, fim);
}

export function diasUteisRestantes(): number {
  const hoje = agoraEmBrasilia();
  if (hoje > CAMPANHA.FIM) return 0;
  const inicio = hoje < CAMPANHA.INICIO ? CAMPANHA.INICIO : hoje;
  return contarDiasUteis(inicio, CAMPANHA.FIM);
}

// ── Versões parametrizadas por CampanhaConfig ─────────────────────────────

export function diasUteisDecorridosConfig(cfg: CampanhaConfig): number {
  const hoje   = agoraEmBrasilia();
  const inicio = new Date(cfg.campanha_inicio + 'T12:00:00');
  const fim    = new Date(cfg.campanha_fim    + 'T12:00:00');
  if (hoje < inicio) return 0;
  const cap = hoje > fim ? fim : hoje;
  return contarDiasUteis(inicio, cap);
}

export function diasUteisRestantesConfig(cfg: CampanhaConfig): number {
  const hoje   = agoraEmBrasilia();
  const inicio = new Date(cfg.campanha_inicio + 'T12:00:00');
  const fim    = new Date(cfg.campanha_fim    + 'T12:00:00');
  if (hoje > fim) return 0;
  const cap = hoje < inicio ? inicio : hoje;
  return contarDiasUteis(cap, fim);
}

export function totalDiasUteisConfig(cfg: CampanhaConfig): number {
  return contarDiasUteis(
    new Date(cfg.campanha_inicio + 'T12:00:00'),
    new Date(cfg.campanha_fim    + 'T12:00:00'),
  );
}
