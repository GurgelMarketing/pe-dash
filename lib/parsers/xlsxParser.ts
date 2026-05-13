import * as XLSX from 'xlsx';
import { normalizeRow } from './normalizer';
import type { EmpresaRow } from '../../types';

export function parseXLSX(buffer: ArrayBuffer): EmpresaRow[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet    = workbook.Sheets[workbook.SheetNames[0]];
  const raw      = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  return raw.map(normalizeRow);
}

export async function parseXLSXFile(file: File): Promise<EmpresaRow[]> {
  const buffer = await file.arrayBuffer();
  return parseXLSX(buffer);
}
