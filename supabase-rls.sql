-- ============================================================
-- PE-Dash — RLS para usuários autenticados (ETAPA 7)
-- Executar no Supabase SQL Editor após configurar Auth
-- ============================================================

-- Ativar RLS nas tabelas
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas  ENABLE ROW LEVEL SECURITY;

-- Políticas para snapshots: apenas usuários autenticados com @ibge.gov.br
CREATE POLICY "ibge_select" ON snapshots
  FOR SELECT TO authenticated
  USING (
    right(auth.jwt() ->> 'email', 12) = 'ibge.gov.br'
  );

CREATE POLICY "ibge_insert" ON snapshots
  FOR INSERT TO authenticated
  WITH CHECK (
    right(auth.jwt() ->> 'email', 12) = 'ibge.gov.br'
  );

CREATE POLICY "ibge_delete" ON snapshots
  FOR DELETE TO authenticated
  USING (
    right(auth.jwt() ->> 'email', 12) = 'ibge.gov.br'
  );

-- Políticas para empresas
CREATE POLICY "ibge_select" ON empresas
  FOR SELECT TO authenticated
  USING (
    right(auth.jwt() ->> 'email', 12) = 'ibge.gov.br'
  );

CREATE POLICY "ibge_insert" ON empresas
  FOR INSERT TO authenticated
  WITH CHECK (
    right(auth.jwt() ->> 'email', 12) = 'ibge.gov.br'
  );

CREATE POLICY "ibge_delete" ON empresas
  FOR DELETE TO authenticated
  USING (
    right(auth.jwt() ->> 'email', 12) = 'ibge.gov.br'
  );
