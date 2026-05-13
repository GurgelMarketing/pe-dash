import Papa from 'papaparse';
import { normalizeRow } from './normalizer';
import type { EmpresaRow } from '../../types';

export async function parseCSV(file: File): Promise<EmpresaRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = (results.data as Record<string, unknown>[]).map(normalizeRow);
        resolve(rows);
      },
      error: reject,
    });
  });
}

export function parseCSVText(text: string): EmpresaRow[] {
  const results = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: true,
  });
  return results.data.map(normalizeRow);
}
