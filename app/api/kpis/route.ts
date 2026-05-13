import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase    = getSupabaseServerClient();
  const snapshotId  = req.nextUrl.searchParams.get('snapshot_id');

  let query = supabase.from('kpis_por_snapshot').select('*');

  if (snapshotId) {
    query = query.eq('snapshot_id', snapshotId);
  } else {
    query = query.order('record_date', { ascending: false }).limit(1);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return NextResponse.json({ error: 'Nenhum dado encontrado.' }, { status: 404 });
  return NextResponse.json(row);
}
