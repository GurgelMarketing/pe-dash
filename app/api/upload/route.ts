import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { parseCSVText } from '@/lib/parsers/csvParser';
import { parseXLSX } from '@/lib/parsers/xlsxParser';

export async function POST(req: NextRequest) {
  try {
    const formData   = await req.formData();
    const file       = formData.get('file') as File | null;
    const recordDate = formData.get('record_date') as string | null;
    const notes      = formData.get('notes') as string | null;

    if (!file) return NextResponse.json({ error: 'Arquivo não enviado.' }, { status: 400 });
    if (!recordDate) return NextResponse.json({ error: 'Data de referência não informada.' }, { status: 400 });

    const ext = file.name.split('.').pop()?.toLowerCase();
    let rows;

    if (ext === 'csv') {
      const text = await file.text();
      rows = parseCSVText(text);
    } else if (ext === 'xlsx' || ext === 'xls') {
      const buffer = await file.arrayBuffer();
      rows = parseXLSX(buffer);
    } else {
      return NextResponse.json({ error: 'Formato não suportado. Use CSV ou XLSX.' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { data: snapshot, error: snapErr } = await supabase
      .from('snapshots')
      .insert({ filename: file.name, record_date: recordDate, total_rows: rows.length, notes })
      .select('id')
      .single();

    if (snapErr || !snapshot) {
      return NextResponse.json({ error: snapErr?.message ?? 'Erro ao criar snapshot.' }, { status: 500 });
    }

    const empresas = rows.map(r => ({ ...r, snapshot_id: snapshot.id }));

    const BATCH = 500;
    const errors: string[] = [];
    for (let i = 0; i < empresas.length; i += BATCH) {
      const { error } = await supabase.from('empresas').insert(empresas.slice(i, i + BATCH));
      if (error) errors.push(error.message);
    }

    return NextResponse.json({ snapshot_id: snapshot.id, total_rows: rows.length, errors });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
