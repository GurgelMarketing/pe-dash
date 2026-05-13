import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase   = getSupabaseServerClient();
  const snapshotId = req.nextUrl.searchParams.get('snapshot_id');

  let query = supabase.from('metricas_por_tecnico').select('*');
  if (snapshotId) query = query.eq('snapshot_id', snapshotId);

  const { data, error } = await query.order('total', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
