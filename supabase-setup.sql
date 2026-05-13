-- ============================================================
-- PE-Dash — Setup completo do banco (executar no SQL Editor)
-- ============================================================

-- Tabela de snapshots (um por upload diário)
CREATE TABLE IF NOT EXISTS snapshots (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename    TEXT NOT NULL,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  record_date DATE NOT NULL,
  total_rows  INT NOT NULL,
  created_by  TEXT DEFAULT 'sistema',
  notes       TEXT
);

-- Tabela de empresas (linhas da planilha)
CREATE TABLE IF NOT EXISTS empresas (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_id     UUID REFERENCES snapshots(id) ON DELETE CASCADE,
  cnpj            TEXT,
  razao_social    TEXT,
  nome_fantasia   TEXT,
  pesquisa        TEXT,
  situacao        TEXT,
  vip             BOOLEAN DEFAULT FALSE,
  responsavel     TEXT,
  municipio       TEXT,
  modelo          TEXT,
  empresa_nova    BOOLEAN DEFAULT FALSE,
  tem_telefone    BOOLEAN DEFAULT FALSE,
  tem_email       BOOLEAN DEFAULT FALSE,
  cnae            TEXT,
  endereco        TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_empresas_snapshot    ON empresas(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_empresas_responsavel ON empresas(responsavel);
CREATE INDEX IF NOT EXISTS idx_empresas_situacao    ON empresas(situacao);
CREATE INDEX IF NOT EXISTS idx_empresas_pesquisa    ON empresas(pesquisa);
CREATE INDEX IF NOT EXISTS idx_empresas_vip         ON empresas(vip);

-- View: KPIs globais por snapshot
CREATE OR REPLACE VIEW kpis_por_snapshot AS
SELECT
  s.id AS snapshot_id,
  s.record_date,
  s.filename,
  COUNT(e.id) AS total,
  COUNT(e.id) FILTER (WHERE e.vip = TRUE) AS total_vip,
  COUNT(e.id) FILTER (WHERE e.situacao = 'Nada Feito') AS nada_feito,
  COUNT(e.id) FILTER (WHERE e.situacao = 'Abordagem Em Andamento') AS em_andamento,
  COUNT(e.id) FILTER (WHERE e.situacao = 'Acordada') AS acordada,
  COUNT(e.id) FILTER (WHERE e.situacao = 'Abordada') AS abordada,
  COUNT(e.id) FILTER (WHERE e.empresa_nova = TRUE) AS empresas_novas,
  COUNT(e.id) FILTER (WHERE NOT e.tem_telefone AND NOT e.tem_email) AS sem_contato,
  ROUND(
    COUNT(e.id) FILTER (WHERE e.situacao IN ('Acordada','Abordada'))::NUMERIC
    / NULLIF(COUNT(e.id), 0) * 100, 1
  ) AS pct_concluido
FROM snapshots s
LEFT JOIN empresas e ON e.snapshot_id = s.id
GROUP BY s.id, s.record_date, s.filename;

-- View: métricas por técnico (APM) por snapshot
CREATE OR REPLACE VIEW metricas_por_tecnico AS
SELECT
  e.snapshot_id,
  e.responsavel,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE e.vip = TRUE) AS vip,
  COUNT(*) FILTER (WHERE e.situacao = 'Nada Feito') AS nada_feito,
  COUNT(*) FILTER (WHERE e.situacao = 'Abordagem Em Andamento') AS em_andamento,
  COUNT(*) FILTER (WHERE e.situacao = 'Acordada') AS acordada,
  COUNT(*) FILTER (WHERE e.situacao = 'Abordada') AS abordada,
  COUNT(*) FILTER (WHERE e.empresa_nova = TRUE) AS novas,
  COUNT(*) FILTER (WHERE NOT e.tem_telefone AND NOT e.tem_email) AS sem_contato,
  ROUND(
    COUNT(*) FILTER (WHERE e.situacao IN ('Acordada','Abordada'))::NUMERIC
    / NULLIF(COUNT(*), 0) * 100, 1
  ) AS pct_concluido
FROM empresas e
GROUP BY e.snapshot_id, e.responsavel;
