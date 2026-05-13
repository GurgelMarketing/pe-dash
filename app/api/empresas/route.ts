import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const p           = req.nextUrl.searchParams;
  const snapshotId  = p.get('snapshot_id');
  const situacao    = p.get('situacao');
  const responsavel = p.get('responsavel');
  const pesquisa    = p.get('pesquisa');
  const vip         = p.get('vip');
  const q           = p.get('q');
  const page        = parseInt(p.get('page') ?? '0', 10);
  const PAGE_SIZE   = 50;

  const supabase = getSupabaseServerClient();
  let query = supabase
    .from('empresas')
    .select('*', { count: 'exact' })
    .order('razao_social');

  if (snapshotId)  query = query.eq('snapshot_id', snapshotId);
  if (situacao)    query = query.eq('situacao', situacao);
  if (responsavel) query = query.eq('responsavel', responsavel);
  if (pesquisa)    query = query.eq('pesquisa', pesquisa);
  if (vip === 'true') query = query.eq('vip', true);
  if (q)           query = query.or(`razao_social.ilike.%${q}%,cnpj.ilike.%${q}%`);

  query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, count, page, page_size: PAGE_SIZE });
}
