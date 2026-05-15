import React from 'react';
import {
  Document, Page, Text, View, StyleSheet,
} from '@react-pdf/renderer';
import type { Snapshot, KPIsGlobais, MetricaTecnico, CampanhaConfig, Insight } from '../../types';
import type { MetaProdutividade, ResumoEquipe } from '../analytics/produtividade';
import {
  narrarEvolucaoGlobal,
  narrarDesempenhoAPM,
  narrarEquipe,
  narrarConclusao,
} from './narrativa';

export interface DadosRelatorio {
  snapshots:     Snapshot[];
  kpis:          KPIsGlobais[];
  metricas:      MetricaTecnico[][];
  produtividade: MetaProdutividade[];
  resumo:        ResumoEquipe;
  insights:      Insight[];
  cfg:           CampanhaConfig;
  geradoEm:      string;
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const C = {
  bg:      '#0a0a0a',
  card:    '#171717',
  border:  '#262626',
  muted:   '#525252',
  text:    '#e5e5e5',
  sub:     '#a3a3a3',
  green:   '#10b981',
  red:     '#f87171',
  yellow:  '#facc15',
  blue:    '#60a5fa',
  orange:  '#fb923c',
  white:   '#ffffff',
};

const s = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    color: C.text,
    fontFamily: 'Helvetica',
    padding: 36,
    fontSize: 9,
  },
  // Capa
  coverPage: {
    backgroundColor: C.bg,
    color: C.text,
    fontFamily: 'Helvetica',
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
  },
  coverTitle: { fontSize: 26, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 8, textAlign: 'center' },
  coverSub:   { fontSize: 13, color: C.sub, marginBottom: 6, textAlign: 'center' },
  coverSmall: { fontSize: 9,  color: C.muted, textAlign: 'center' },
  coverLine:  { width: 60, height: 2, backgroundColor: C.green, marginVertical: 20 },
  // Seções
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 10, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: C.border },
  sectionBody:  { marginBottom: 16 },
  // Narrativa
  narrative: { fontSize: 9, color: C.sub, lineHeight: 1.6, marginBottom: 10 },
  // Tabelas
  tableHeader: { flexDirection: 'row', backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border, paddingVertical: 4, paddingHorizontal: 4 },
  tableRow:    { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.border, paddingVertical: 3, paddingHorizontal: 4 },
  thCell:      { fontSize: 7, color: C.muted, fontFamily: 'Helvetica-Bold' },
  tdCell:      { fontSize: 8, color: C.text },
  // Kpi cards
  kpiRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  kpiBox: { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 4, padding: 8 },
  kpiLabel: { fontSize: 7, color: C.muted, marginBottom: 2 },
  kpiValue: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.white },
  // Status
  badge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3, fontSize: 7 },
  // APM section
  apmHeader: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 4, padding: 8, marginBottom: 6 },
  apmName:   { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 2 },
  // Insights
  insightRow: { flexDirection: 'row', marginBottom: 4, alignItems: 'flex-start' },
  insightIcon:{ fontSize: 8, marginRight: 5, marginTop: 1 },
  insightText:{ fontSize: 8, color: C.sub, flex: 1, lineHeight: 1.5 },
  insightTitle:{ fontFamily: 'Helvetica-Bold', color: C.text },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtData(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtNum(n: number) {
  return n.toLocaleString('pt-BR');
}

function deltaStr(d: number) {
  if (d > 0) return `+${d}`;
  if (d < 0) return `${d}`;
  return '=';
}

function statusColor(st: MetaProdutividade['status']): string {
  if (st === 'no_prazo')  return C.green;
  if (st === 'atencao')   return C.yellow;
  if (st === 'critico')   return C.red;
  return C.muted;
}

function statusLabel(st: MetaProdutividade['status']): string {
  if (st === 'no_prazo')  return 'No prazo';
  if (st === 'atencao')   return 'Atenção';
  if (st === 'critico')   return 'Crítico';
  return 'Concluído';
}

function insightIcon(tipo: Insight['tipo']): string {
  if (tipo === 'alert')   return '⚠';
  if (tipo === 'warning') return '!';
  if (tipo === 'success') return '✓';
  return 'i';
}

function insightColor(tipo: Insight['tipo']): string {
  if (tipo === 'alert')   return C.red;
  if (tipo === 'warning') return C.yellow;
  if (tipo === 'success') return C.green;
  return C.blue;
}

// ── Componentes internos ──────────────────────────────────────────────────────

function Capa({ dados }: { dados: DadosRelatorio }) {
  const inicio = fmtData(dados.cfg.campanha_inicio);
  const fim    = fmtData(dados.cfg.campanha_fim);
  return (
    <Page size="A4" style={s.coverPage}>
      <View style={s.coverInner}>
        <Text style={s.coverSub}>IBGE — Agência Ananindeua</Text>
        <Text style={s.coverTitle}>Pesquisas Econômicas 2026</Text>
        <View style={s.coverLine} />
        <Text style={{ ...s.coverSub, fontSize: 11 }}>Relatório de Acompanhamento</Text>
        <Text style={{ ...s.coverSmall, marginTop: 8 }}>Período da campanha: {inicio} a {fim}</Text>
        <Text style={{ ...s.coverSmall, marginTop: 4 }}>
          Gerado em: {new Date(dados.geradoEm).toLocaleString('pt-BR')}
        </Text>
        {dados.snapshots.length > 0 && (
          <Text style={{ ...s.coverSmall, marginTop: 4 }}>
            Baseado nos {dados.snapshots.length} snapshot{dados.snapshots.length > 1 ? 's' : ''} mais recentes
            (último: {fmtData(dados.snapshots[0].record_date)})
          </Text>
        )}
      </View>
    </Page>
  );
}

function ResumoExecutivo({ dados }: { dados: DadosRelatorio }) {
  const kpis = dados.kpis[0];
  if (!kpis) return null;
  const concluidas = kpis.acordada + kpis.abordada;
  const narrativa = narrarEvolucaoGlobal(dados.snapshots, dados.kpis, dados.cfg);

  return (
    <View style={s.sectionBody}>
      <Text style={s.sectionTitle}>Resumo Executivo</Text>
      <Text style={s.narrative}>{narrativa}</Text>

      {/* KPI cards */}
      <View style={s.kpiRow}>
        {[
          { label: 'Total',       value: fmtNum(kpis.total),       color: C.white  },
          { label: 'Concluídas',  value: fmtNum(concluidas),       color: C.green  },
          { label: 'Nada Feito',  value: fmtNum(kpis.nada_feito),  color: C.red    },
          { label: 'Em Andamento',value: fmtNum(kpis.em_andamento),color: C.blue   },
        ].map(k => (
          <View key={k.label} style={s.kpiBox}>
            <Text style={s.kpiLabel}>{k.label}</Text>
            <Text style={{ ...s.kpiValue, color: k.color }}>{k.value}</Text>
          </View>
        ))}
      </View>
      <View style={s.kpiRow}>
        {[
          { label: 'Acordadas',   value: fmtNum(kpis.acordada),      color: C.green  },
          { label: 'Abordadas',   value: fmtNum(kpis.abordada),      color: C.green  },
          { label: '% Concluído', value: `${kpis.pct_concluido}%`,   color: C.white  },
          { label: 'Sem Contato', value: fmtNum(kpis.sem_contato),   color: C.orange },
        ].map(k => (
          <View key={k.label} style={s.kpiBox}>
            <Text style={s.kpiLabel}>{k.label}</Text>
            <Text style={{ ...s.kpiValue, color: k.color }}>{k.value}</Text>
          </View>
        ))}
      </View>

      {/* Tabela de evolução */}
      {dados.snapshots.length > 1 && (
        <>
          <Text style={{ fontSize: 8, color: C.muted, marginBottom: 4, fontFamily: 'Helvetica-Bold' }}>
            EVOLUÇÃO POR SNAPSHOT
          </Text>
          <View style={s.tableHeader}>
            {['Data', 'Total', 'Concluídas', 'Nada Feito', 'Andamento', '% Concl.', 'Δ Concl.'].map(h => (
              <Text key={h} style={{ ...s.thCell, flex: h === 'Data' ? 1.5 : 1 }}>{h}</Text>
            ))}
          </View>
          {dados.snapshots.map((snap, i) => {
            const k = dados.kpis[i];
            if (!k) return null;
            const conc = k.acordada + k.abordada;
            const prevConc = i < dados.kpis.length - 1
              ? dados.kpis[i + 1].acordada + dados.kpis[i + 1].abordada
              : null;
            return (
              <View key={snap.id} style={s.tableRow}>
                <Text style={{ ...s.tdCell, flex: 1.5 }}>{fmtData(snap.record_date)}</Text>
                <Text style={{ ...s.tdCell, flex: 1 }}>{fmtNum(k.total)}</Text>
                <Text style={{ ...s.tdCell, flex: 1, color: C.green }}>{fmtNum(conc)}</Text>
                <Text style={{ ...s.tdCell, flex: 1, color: C.red }}>{fmtNum(k.nada_feito)}</Text>
                <Text style={{ ...s.tdCell, flex: 1, color: C.blue }}>{fmtNum(k.em_andamento)}</Text>
                <Text style={{ ...s.tdCell, flex: 1 }}>{k.pct_concluido}%</Text>
                <Text style={{ ...s.tdCell, flex: 1, color: prevConc !== null && conc - prevConc >= 0 ? C.green : C.red }}>
                  {prevConc !== null ? deltaStr(conc - prevConc) : '—'}
                </Text>
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}

function ProdutividadeEquipe({ dados }: { dados: DadosRelatorio }) {
  const narrativa = narrarEquipe(dados.resumo, dados.produtividade, dados.cfg);
  const resumo = dados.resumo;

  return (
    <View style={s.sectionBody}>
      <Text style={s.sectionTitle}>Produtividade da Equipe</Text>
      <Text style={s.narrative}>{narrativa}</Text>

      {/* Resumo da equipe */}
      <View style={s.kpiRow}>
        {[
          { label: 'Dias decorridos', value: String(resumo.dias_decorridos), color: C.white },
          { label: 'Dias restantes',  value: String(resumo.dias_restantes),  color: C.blue  },
          { label: 'Ritmo médio',     value: `${resumo.media_ritmo_equipe}/dia`, color: C.green },
          { label: 'Meta equipe',     value: `${resumo.meta_diaria_equipe}/dia`, color: C.sub  },
        ].map(k => (
          <View key={k.label} style={s.kpiBox}>
            <Text style={s.kpiLabel}>{k.label}</Text>
            <Text style={{ ...s.kpiValue, fontSize: 12, color: k.color }}>{k.value}</Text>
          </View>
        ))}
      </View>

      {/* Tabela de APMs */}
      <View style={s.tableHeader}>
        {['APM', 'Carteira', 'Concluídas', 'Ritmo/dia', 'Meta/dia', 'Déficit', 'Projeção', 'Status'].map(h => (
          <Text key={h} style={{ ...s.thCell, flex: h === 'APM' ? 2 : 1 }}>{h}</Text>
        ))}
      </View>
      {dados.produtividade.map(p => (
        <View key={p.responsavel} style={s.tableRow}>
          <Text style={{ ...s.tdCell, flex: 2 }}>{p.responsavel}</Text>
          <Text style={{ ...s.tdCell, flex: 1 }}>{fmtNum(p.total_carteira)}</Text>
          <Text style={{ ...s.tdCell, flex: 1, color: C.green }}>{fmtNum(p.concluidas)}</Text>
          <Text style={{ ...s.tdCell, flex: 1 }}>{p.ritmo_real_por_dia}</Text>
          <Text style={{ ...s.tdCell, flex: 1 }}>{p.meta_diaria}</Text>
          <Text style={{ ...s.tdCell, flex: 1, color: p.deficit_acumulado > 0 ? C.red : C.green }}>
            {deltaStr(-p.deficit_acumulado)}
          </Text>
          <Text style={{ ...s.tdCell, flex: 1 }}>{fmtNum(p.projecao_final)}</Text>
          <Text style={{ ...s.tdCell, flex: 1, color: statusColor(p.status) }}>
            {statusLabel(p.status)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function SecaoAPM({ nome, dados }: { nome: string; dados: DadosRelatorio }) {
  const metricasPorSnap = dados.metricas.map(ms => ms.find(m => m.responsavel === nome)).filter(Boolean) as MetricaTecnico[];
  const prod = dados.produtividade.find(p => p.responsavel === nome);
  if (!prod || metricasPorSnap.length === 0) return null;

  const atual = metricasPorSnap[0];
  const narrativa = narrarDesempenhoAPM(nome, metricasPorSnap, prod, dados.cfg);

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={s.apmHeader}>
        <Text style={s.apmName}>{nome}</Text>
        <Text style={{ fontSize: 8, color: statusColor(prod.status) }}>{statusLabel(prod.status)}</Text>
      </View>
      <Text style={s.narrative}>{narrativa}</Text>

      {/* Tabela dos 3 dias para este APM */}
      {metricasPorSnap.length > 1 && (
        <>
          <View style={s.tableHeader}>
            {['Data', 'Total', 'Concluídas', 'Nada F.', 'Andamento', 'Acordadas', 'Abordadas', 'Δ Conc.'].map(h => (
              <Text key={h} style={{ ...s.thCell, flex: h === 'Data' ? 1.5 : 1 }}>{h}</Text>
            ))}
          </View>
          {metricasPorSnap.map((m, i) => {
            const snap = dados.snapshots[i];
            const conc = m.acordada + m.abordada;
            const prevConc = i < metricasPorSnap.length - 1
              ? metricasPorSnap[i + 1].acordada + metricasPorSnap[i + 1].abordada
              : null;
            return (
              <View key={snap?.id ?? i} style={s.tableRow}>
                <Text style={{ ...s.tdCell, flex: 1.5 }}>{snap ? fmtData(snap.record_date) : '—'}</Text>
                <Text style={{ ...s.tdCell, flex: 1 }}>{m.total}</Text>
                <Text style={{ ...s.tdCell, flex: 1, color: C.green }}>{conc}</Text>
                <Text style={{ ...s.tdCell, flex: 1, color: C.red }}>{m.nada_feito}</Text>
                <Text style={{ ...s.tdCell, flex: 1, color: C.blue }}>{m.em_andamento}</Text>
                <Text style={{ ...s.tdCell, flex: 1 }}>{m.acordada}</Text>
                <Text style={{ ...s.tdCell, flex: 1 }}>{m.abordada}</Text>
                <Text style={{ ...s.tdCell, flex: 1, color: prevConc !== null && conc - prevConc >= 0 ? C.green : C.red }}>
                  {prevConc !== null ? deltaStr(conc - prevConc) : '—'}
                </Text>
              </View>
            );
          })}
        </>
      )}

      {/* Mini KPIs individuais */}
      <View style={{ ...s.kpiRow, marginTop: 6 }}>
        {[
          { label: 'Ritmo real',  value: `${prod.ritmo_real_por_dia}/dia`, color: prod.ritmo_real_por_dia >= prod.meta_diaria ? C.green : C.red },
          { label: 'Déficit',     value: String(prod.deficit_acumulado),   color: prod.deficit_acumulado > 0 ? C.red : C.green },
          { label: 'Projeção',    value: fmtNum(prod.projecao_final),      color: prod.vai_concluir_carteira ? C.green : C.yellow },
          { label: 'VIP',         value: String(atual.vip),                color: C.yellow },
        ].map(k => (
          <View key={k.label} style={s.kpiBox}>
            <Text style={s.kpiLabel}>{k.label}</Text>
            <Text style={{ ...s.kpiValue, fontSize: 11, color: k.color }}>{k.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function InsightsSection({ insights }: { insights: Insight[] }) {
  return (
    <View style={s.sectionBody}>
      <Text style={s.sectionTitle}>Insights e Recomendações</Text>
      {insights.length === 0
        ? <Text style={s.narrative}>Nenhum insight gerado para este período.</Text>
        : insights.map((ins, i) => (
          <View key={i} style={s.insightRow}>
            <Text style={{ ...s.insightIcon, color: insightColor(ins.tipo) }}>{insightIcon(ins.tipo)}</Text>
            <Text style={s.insightText}>
              <Text style={s.insightTitle}>{ins.titulo}: </Text>
              {ins.descricao}
            </Text>
          </View>
        ))
      }
    </View>
  );
}

function Conclusao({ dados }: { dados: DadosRelatorio }) {
  const kpisAtual = dados.kpis[0];
  if (!kpisAtual) return null;
  const narrativa = narrarConclusao(kpisAtual, dados.resumo, dados.produtividade, dados.cfg);

  return (
    <View style={s.sectionBody}>
      <Text style={s.sectionTitle}>Conclusão</Text>
      <Text style={s.narrative}>{narrativa}</Text>
    </View>
  );
}

// ── Documento principal ───────────────────────────────────────────────────────

export function RelatorioDocument({ dados }: { dados: DadosRelatorio }) {
  const nomes = [...new Set(dados.produtividade.map(p => p.responsavel))];

  return (
    <Document title="Relatório de Acompanhamento — Pesquisas Econômicas">
      <Capa dados={dados} />

      {/* Página 2: Resumo + Produtividade */}
      <Page size="A4" style={s.page}>
        <ResumoExecutivo dados={dados} />
        <ProdutividadeEquipe dados={dados} />
      </Page>

      {/* Página(s) por APM */}
      {nomes.map(nome => (
        <Page key={nome} size="A4" style={s.page}>
          <Text style={{ ...s.sectionTitle, fontSize: 10, color: C.muted }}>
            Análise por Técnico (APM)
          </Text>
          <SecaoAPM nome={nome} dados={dados} />
        </Page>
      ))}

      {/* Última página: Insights + Conclusão */}
      <Page size="A4" style={s.page}>
        <InsightsSection insights={dados.insights} />
        <Conclusao dados={dados} />
      </Page>
    </Document>
  );
}
