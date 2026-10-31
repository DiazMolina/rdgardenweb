import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/security/admin';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 401 }); }
  const [{ data: products }, { data: orders }] = await Promise.all([
    supabaseAdmin.from('products').select('*').limit(1),
    supabaseAdmin.from('orders').select('*').limit(1),
  ]);
  // Schema diagnostics only; never serialize customer records.
  return NextResponse.json({ productColumns: products?.[0] ? Object.keys(products[0]) : [], orderColumns: orders?.[0] ? Object.keys(orders[0]) : [] }, { headers: { 'Cache-Control': 'no-store' } });
}
