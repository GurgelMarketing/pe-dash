import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('snapshots')
    .select('id, filename, record_date, upload_date, total_rows, notes')
    .order('record_date', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id obrigatório.' }, { status: 400 });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from('snapshots').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
