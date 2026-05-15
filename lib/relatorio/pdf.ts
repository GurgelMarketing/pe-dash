import PDFDocument from 'pdfkit';
import type { Snapshot, KPIsGlobais, MetricaTecnico, CampanhaConfig, Insight } from '@/types';
import type { MetaProdutividade, ResumoEquipe } from '@/lib/analytics/produtividade';
import { narrarEvolucaoGlobal, narrarDesempenhoAPM, narrarEquipe, narrarConclusao } from './narrativa';

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

// ─── Constants ───────────────────────────────────────────────────────────────

const MARGIN    = 50;
const PAGE_W    = 595.28;
const CONTENT_W = 495;

const C = {
  primary:   '#1e3a5f',
  secondary: '#2d6a9f',
  text:      '#1a1a1a',
  textMid:   '#555555',
  textLight: '#888888',
  success:   '#16a34a',
  warning:   '#d97706',
  critical:  '#dc2626',
  info:      '#2563eb',
  bgLight:   '#f0f4f8',
  bgStripe:  '#f8fafc',
  white:     '#ffffff',
  border:    '#d1d5db',
};

type Doc = InstanceType<typeof PDFDocument>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtData(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function fmtPeriodo(inicio: string, fim: string): string {
  const i = new Date(inicio + 'T12:00:00').toLocaleDateString('pt-BR');
  const f = new Date(fim + 'T12:00:00').toLocaleDateString('pt-BR');
  return `${i} a ${f}`;
}

function statusColor(s: MetaProdutividade['status']): string {
  return ({ no_prazo: C.success, atencao: C.warning, critico: C.critical, concluido: C.info })[s] ?? C.text;
}

function statusLabel(s: MetaProdutividade['status']): string {
  return ({ no_prazo: 'No Prazo', atencao: 'Atencao', critico: 'Critico', concluido: 'Concluido' })[s] ?? s;
}

function insightColor(t: Insight['tipo']): string {
  return ({ alert: C.critical, warning: C.warning, info: C.info, success: C.success })[t] ?? C.text;
}

function checkPage(doc: Doc, neededH: number): void {
  if (doc.y + neededH > doc.page.height - MARGIN - 20) doc.addPage();
}

// ─── Layout primitives ───────────────────────────────────────────────────────

function secaoTitulo(doc: Doc, texto: string): void {
  checkPage(doc, 35);
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(13).fillColor(C.primary).text(texto, MARGIN, doc.y);
  const ly = doc.y + 2;
  doc.moveTo(MARGIN, ly).lineTo(MARGIN + CONTENT_W, ly).strokeColor(C.primary).lineWidth(1).stroke();
  doc.moveDown(0.6);
  doc.font('Helvetica').fontSize(10).fillColor(C.text);
}

function narrativa(doc: Doc, texto: string): void {
  checkPage(doc, 40);
  doc.font('Helvetica').fontSize(9.5).fillColor(C.textMid)
    .text(texto, MARGIN, doc.y, { width: CONTENT_W, align: 'justify' });
  doc.moveDown(0.6);
}

function kpiCard(doc: Doc, x: number, y: number, w: number, h: number, label: string, value: string, color: string): void {
  doc.rect(x, y, w, h).fill(C.bgLight);
  doc.rect(x, y, 3, h).fill(color);
  doc.font('Helvetica-Bold').fontSize(15).fillColor(color)
    .text(value, x + 3, y + 8, { width: w - 6, align: 'center', lineBreak: false });
  doc.font('Helvetica').fontSize(7).fillColor(C.textMid)
    .text(label, x + 3, y + h - 14, { width: w - 6, align: 'center', lineBreak: false });
}

function tabela(doc: Doc, headers: string[], rows: string[][], colWidths: number[]): void {
  const ROW_H    = 16;
  const HEADER_H = 18;

  checkPage(doc, HEADER_H + ROW_H * 2);

  const startY = doc.y;

  // Header row
  doc.rect(MARGIN, startY, CONTENT_W, HEADER_H).fill(C.primary);
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.white);
  let cx = MARGIN;
  for (let i = 0; i < headers.length; i++) {
    const align = i === 0 ? 'left' : 'center';
    const pad   = i === 0 ? 5 : 0;
    doc.text(headers[i], cx + pad, startY + 5,
      { width: colWidths[i] - (i === 0 ? 8 : 4), align, lineBreak: false });
    cx += colWidths[i];
  }

  let rowY = startY + HEADER_H;

  for (let r = 0; r < rows.length; r++) {
    if (rowY + ROW_H > doc.page.height - MARGIN - 20) {
      doc.addPage();
      rowY = MARGIN;
    }
    const bg = r % 2 === 0 ? C.white : C.bgStripe;
    doc.rect(MARGIN, rowY, CONTENT_W, ROW_H).fill(bg);
    doc.rect(MARGIN, rowY, CONTENT_W, ROW_H).strokeColor(C.border).lineWidth(0.3).stroke();

    doc.font('Helvetica').fontSize(8).fillColor(C.text);
    cx = MARGIN;
    for (let c = 0; c < rows[r].length; c++) {
      const align = c === 0 ? 'left' : 'center';
      const pad   = c === 0 ? 5 : 0;
      doc.text(rows[r][c] ?? '', cx + pad, rowY + 5,
        { width: colWidths[c] - (c === 0 ? 8 : 4), align, lineBreak: false });
      cx += colWidths[c];
    }
    rowY += ROW_H;
  }

  doc.y = rowY + 6;
  doc.font('Helvetica').fontSize(10).fillColor(C.text);
}

// ─── Section renderers ───────────────────────────────────────────────────────

function renderCapa(doc: Doc, dados: DadosRelatorio): void {
  const { cfg, snapshots, geradoEm } = dados;

  doc.rect(0, 0, PAGE_W, 175).fill(C.primary);

  doc.font('Helvetica-Bold').fontSize(21).fillColor(C.white)
    .text('IBGE - Agencia Ananindeua', MARGIN, 50, { width: CONTENT_W, align: 'center' });

  doc.font('Helvetica').fontSize(14).fillColor('#a0c4ff')
    .text('Relatorio de Pesquisas Economicas', MARGIN, 83, { width: CONTENT_W, align: 'center' });

  doc.font('Helvetica').fontSize(10).fillColor('#cbd5e1')
    .text(`Periodo: ${fmtPeriodo(cfg.campanha_inicio, cfg.campanha_fim)}`, MARGIN, 115, { width: CONTENT_W, align: 'center' });

  doc.rect(MARGIN, 200, CONTENT_W, 85).fill(C.bgLight);

  doc.font('Helvetica-Bold').fontSize(9).fillColor(C.textMid).text('Gerado em:', MARGIN + 20, 218);
  doc.font('Helvetica').fontSize(9).fillColor(C.text)
    .text(new Date(geradoEm).toLocaleString('pt-BR'), MARGIN + 20, 230);

  if (snapshots.length > 0) {
    doc.font('Helvetica-Bold').fontSize(9).fillColor(C.textMid).text('Snapshot mais recente:', MARGIN + 20, 250);
    doc.font('Helvetica').fontSize(9).fillColor(C.text)
      .text(`${snapshots[0].filename} — ${fmtData(snapshots[0].record_date)}`, MARGIN + 20, 262);

    doc.font('Helvetica-Bold').fontSize(9).fillColor(C.textMid).text('Dias monitorados:', MARGIN + 300, 250);
    doc.font('Helvetica').fontSize(9).fillColor(C.text)
      .text(String(snapshots.length), MARGIN + 300, 262);
  }

  doc.font('Helvetica').fontSize(8).fillColor(C.textLight)
    .text('Documento gerado automaticamente pelo sistema PE-Dash', MARGIN, 320, { width: CONTENT_W, align: 'center' });
}

function renderResumoExecutivo(doc: Doc, dados: DadosRelatorio): void {
  const { snapshots, kpis, cfg } = dados;
  if (kpis.length === 0) return;

  const k = kpis[0];

  doc.addPage();
  secaoTitulo(doc, '1. Resumo Executivo');
  narrativa(doc, narrarEvolucaoGlobal(snapshots, kpis, cfg));

  // KPI cards
  const cW = (CONTENT_W - 10) / 5;
  const cH = 54;
  const cY = doc.y + 4;
  const cards = [
    { label: 'Total de Empresas',  value: String(k.total),                             color: C.secondary },
    { label: 'Concluidas',         value: String(k.acordada + k.abordada),              color: C.success  },
    { label: 'Em Andamento',       value: String(k.em_andamento),                       color: C.warning  },
    { label: 'Nada Feito',         value: String(k.nada_feito),                         color: C.critical },
    { label: '% Concluido',        value: `${k.pct_concluido}%`,                        color: C.info     },
  ];
  for (let i = 0; i < cards.length; i++) {
    kpiCard(doc, MARGIN + i * (cW + 2.5), cY, cW, cH, cards[i].label, cards[i].value, cards[i].color);
  }
  doc.y = cY + cH + 14;

  // Evolution table
  if (snapshots.length >= 1) {
    doc.font('Helvetica-Bold').fontSize(9).fillColor(C.textMid).text('Evolucao por Snapshot', MARGIN, doc.y);
    doc.moveDown(0.3);

    const headers = ['Data',  'Total', 'Nada Feito', 'Em And.', 'Acordadas', 'Abordadas', 'Conc. (%)'];
    const widths  = [70,      60,      75,           65,         75,          75,           75];

    const rows: string[][] = snapshots.map((s, i) => {
      const ki = kpis[i];
      if (!ki) return [fmtData(s.record_date), '-', '-', '-', '-', '-', '-'];
      return [fmtData(s.record_date), String(ki.total), String(ki.nada_feito), String(ki.em_andamento), String(ki.acordada), String(ki.abordada), `${ki.pct_concluido}%`];
    });
    tabela(doc, headers, rows, widths);
  }
}

function renderProdutividade(doc: Doc, dados: DadosRelatorio): void {
  const { produtividade, resumo, cfg } = dados;
  if (produtividade.length === 0) return;

  doc.addPage();
  secaoTitulo(doc, '2. Produtividade da Equipe');
  narrativa(doc, narrarEquipe(resumo, produtividade, cfg));

  doc.font('Helvetica-Bold').fontSize(9).fillColor(C.textMid).text('Desempenho por APM', MARGIN, doc.y);
  doc.moveDown(0.3);

  const headers = ['APM',  'Carteira', 'Concluidas', 'Ritmo/dia', 'Meta/dia', 'Deficit', 'Status'];
  const widths  = [130,    55,          65,            55,           50,         50,          90];

  const rows: string[][] = produtividade.map(p => [
    p.responsavel,
    String(p.total_carteira),
    `${p.concluidas} (${Math.round(p.concluidas / (p.total_carteira || 1) * 100)}%)`,
    String(p.ritmo_real_por_dia),
    String(p.meta_diaria),
    String(Math.max(0, p.deficit_acumulado)),
    statusLabel(p.status),
  ]);
  tabela(doc, headers, rows, widths);

  doc.moveDown(0.4);
  doc.font('Helvetica').fontSize(8.5).fillColor(C.textMid).text(
    `Periodo: ${resumo.total_dias_campanha} dias uteis | Decorridos: ${resumo.dias_decorridos} | Restantes: ${resumo.dias_restantes} | Ritmo medio: ${resumo.media_ritmo_equipe}/dia`,
    MARGIN, doc.y, { width: CONTENT_W },
  );
}

function renderSecaoAPM(doc: Doc, nome: string, dados: DadosRelatorio, idx: number): void {
  const { snapshots, metricas, produtividade, cfg } = dados;

  const prod = produtividade.find(p => p.responsavel === nome);
  if (!prod) return;

  const metricasPorSnap: MetricaTecnico[] = metricas
    .map(snap => snap.find(m => m.responsavel === nome))
    .filter((m): m is MetricaTecnico => m !== undefined);

  if (metricasPorSnap.length === 0) return;

  doc.addPage();

  // APM header banner
  const bannerY = doc.y;
  doc.rect(MARGIN, bannerY, CONTENT_W, 28).fill(C.bgLight);
  doc.rect(MARGIN, bannerY, 4, 28).fill(statusColor(prod.status));
  doc.font('Helvetica-Bold').fontSize(12).fillColor(C.primary)
    .text(`APM ${idx + 1}: ${nome}`, MARGIN + 10, bannerY + 9, { lineBreak: false });
  doc.font('Helvetica').fontSize(8).fillColor(statusColor(prod.status))
    .text(`[${statusLabel(prod.status)}]`, MARGIN + CONTENT_W - 85, bannerY + 11,
      { width: 80, align: 'right', lineBreak: false });
  doc.y = bannerY + 34;

  narrativa(doc, narrarDesempenhoAPM(nome, metricasPorSnap, prod, cfg));

  // Mini KPI cards
  const mk = [
    { label: 'Carteira',    value: String(prod.total_carteira),      color: C.secondary },
    { label: 'Concluidas',  value: String(prod.concluidas),          color: C.success   },
    { label: 'Pendentes',   value: String(prod.pendentes),           color: C.warning   },
    { label: 'Ritmo/dia',   value: `${prod.ritmo_real_por_dia}`,     color: statusColor(prod.status) },
  ];
  const mW = (CONTENT_W - 9) / 4;
  const mH = 44;
  const mY = doc.y + 4;
  for (let i = 0; i < mk.length; i++) {
    kpiCard(doc, MARGIN + i * (mW + 3), mY, mW, mH, mk[i].label, mk[i].value, mk[i].color);
  }
  doc.y = mY + mH + 12;

  // Evolution table
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C.textMid).text('Evolucao do Periodo', MARGIN, doc.y);
  doc.moveDown(0.3);

  const headers = ['Data',  'Total', 'Nada Feito', 'Em And.', 'Acordadas', 'Abordadas', '% Conc.'];
  const widths  = [65,      55,      70,           60,         70,          70,           105];

  const rows: string[][] = metricasPorSnap.map((m, i) => [
    fmtData(snapshots[i]?.record_date ?? ''),
    String(m.total),
    String(m.nada_feito),
    String(m.em_andamento),
    String(m.acordada),
    String(m.abordada),
    `${m.pct_concluido}%`,
  ]);
  tabela(doc, headers, rows, widths);
}

function renderInsights(doc: Doc, dados: DadosRelatorio): void {
  const { insights } = dados;
  if (insights.length === 0) return;

  doc.addPage();
  secaoTitulo(doc, '4. Alertas e Recomendacoes');

  const grupos: Record<string, Insight[]> = {
    alert:   insights.filter(i => i.tipo === 'alert'),
    warning: insights.filter(i => i.tipo === 'warning'),
    info:    insights.filter(i => i.tipo === 'info'),
    success: insights.filter(i => i.tipo === 'success'),
  };
  const labels: Record<string, string> = {
    alert: 'Alertas Criticos', warning: 'Avisos', info: 'Informacoes', success: 'Destaques Positivos',
  };
  const bullets: Record<string, string> = { alert: '!!', warning: '!', info: '>>', success: 'OK' };

  for (const tipo of ['alert', 'warning', 'info', 'success'] as Insight['tipo'][]) {
    const lista = grupos[tipo];
    if (lista.length === 0) continue;

    checkPage(doc, 35);
    doc.font('Helvetica-Bold').fontSize(9).fillColor(insightColor(tipo)).text(labels[tipo], MARGIN, doc.y);
    doc.moveDown(0.25);

    for (const ins of lista) {
      checkPage(doc, 32);
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(insightColor(tipo))
        .text(`${bullets[tipo]} ${ins.titulo}`, MARGIN + 8, doc.y, { lineBreak: false });
      doc.moveDown(0.1);
      doc.font('Helvetica').fontSize(8).fillColor(C.textMid)
        .text(ins.descricao, MARGIN + 18, doc.y, { width: CONTENT_W - 18 });
      if (ins.valor !== undefined) {
        doc.font('Helvetica-Bold').fontSize(8).fillColor(insightColor(tipo))
          .text(`Valor: ${ins.valor}`, MARGIN + 18, doc.y);
      }
      doc.moveDown(0.35);
    }
    doc.moveDown(0.4);
  }
}

function renderConclusao(doc: Doc, dados: DadosRelatorio): void {
  const { kpis, resumo, produtividade, cfg } = dados;
  if (kpis.length === 0) return;

  checkPage(doc, 80);
  secaoTitulo(doc, '5. Conclusao');
  narrativa(doc, narrarConclusao(kpis[0], resumo, produtividade, cfg));
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function gerarPdfBuffer(dados: DadosRelatorio): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: MARGIN, bufferPages: true });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    try {
      renderCapa(doc, dados);
      renderResumoExecutivo(doc, dados);
      renderProdutividade(doc, dados);
      dados.produtividade.forEach((p, idx) => renderSecaoAPM(doc, p.responsavel, dados, idx));
      renderInsights(doc, dados);
      renderConclusao(doc, dados);
    } catch (err) {
      reject(err);
    } finally {
      doc.end();
    }
  });
}
