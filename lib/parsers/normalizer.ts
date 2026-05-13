import type { EmpresaRow } from '../../types';

type MappedRow = { [K in keyof EmpresaRow]?: unknown };

const COLUMN_MAP: Record<string, keyof EmpresaRow> = {
  'cnpj': 'cnpj', 'Cnpj': 'cnpj', 'CNPJ': 'cnpj',
  'RazaoSocial': 'razao_social', 'Razao Social': 'razao_social', 'razao_social': 'razao_social',
  'NomeFantasia': 'nome_fantasia', 'Nome Fantasia': 'nome_fantasia',
  'Pesquisa': 'pesquisa', 'pesquisa': 'pesquisa',
  'Situacao': 'situacao', 'Situação': 'situacao', 'situacao': 'situacao',
  'Vip': 'vip', 'vip': 'vip', 'VIP': 'vip',
  'NomeResponsavelAbordagem': 'responsavel', 'Responsavel': 'responsavel', 'responsavel': 'responsavel',
  'Municipio': 'municipio', 'Município': 'municipio', 'municipio': 'municipio',
  'Endereco': 'endereco', 'Endereço': 'endereco', 'endereco': 'endereco',
  'EmpresaNova': 'empresa_nova', 'Empresa Nova': 'empresa_nova', 'empresa_nova': 'empresa_nova',
  'Modelo': 'modelo', 'modelo': 'modelo',
  'CNAE': 'cnae', 'cnae': 'cnae',
  'TelefoneContato': 'tem_telefone', 'Telefone': 'tem_telefone',
  'EmailContato': 'tem_email', 'Email': 'tem_email',
};

export function normalizeRow(raw: Record<string, unknown>): EmpresaRow {
  const mapped: MappedRow = {};
  for (const [key, value] of Object.entries(raw)) {
    const normalKey = COLUMN_MAP[key];
    if (normalKey) mapped[normalKey] = value;
  }
  if (!mapped.municipio && mapped.endereco) {
    const m = String(mapped.endereco).match(/- ([^-]+) - PA/);
    if (m) mapped.municipio = m[1].trim();
  }
  return {
    cnpj:         String(mapped.cnpj || ''),
    razao_social: String(mapped.razao_social || ''),
    nome_fantasia: mapped.nome_fantasia ? String(mapped.nome_fantasia) : undefined,
    pesquisa:     String(mapped.pesquisa || '').trim(),
    situacao:     String(mapped.situacao || '').trim(),
    vip:          String(mapped.vip || '').toLowerCase() === 'sim' || mapped.vip === true,
    responsavel:  String(mapped.responsavel || '').trim(),
    municipio:    String(mapped.municipio || '').trim(),
    modelo:       String(mapped.modelo || '').trim(),
    empresa_nova: String(mapped.empresa_nova || '').toLowerCase() === 'sim',
    tem_telefone: Boolean(mapped.tem_telefone && String(mapped.tem_telefone).trim()),
    tem_email:    Boolean(mapped.tem_email && String(mapped.tem_email).trim()),
    cnae:         String(mapped.cnae || '').trim(),
    endereco:     String(mapped.endereco || '').trim(),
  };
}
