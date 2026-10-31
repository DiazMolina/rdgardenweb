'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useDialog } from './useDialog';
import BotanicalImage from './BotanicalImage';

type SearchProduct = { id: string; name: string; category: string; image_url: string; price: number };
export default function LiveSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const dialogRef = useDialog(mobile, () => setMobile(false));
  useEffect(() => {
    const outside = (event: MouseEvent) => { if (!searchRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, []);
  useEffect(() => {
    let cancelled = false;
    const trimmed = query.replace(/[%_\\]/g, '').trim();
    const timer = setTimeout(async () => {
      if (trimmed.length < 2) { setResults([]); setOpen(false); setLoading(false); return; }
      setLoading(true); setFailed(false); setOpen(true);
      try {
        const [{ data, error }, { data: paused, error: settingsError }] = await Promise.all([
          supabase.from('products').select('id,name,category,image_url,price').ilike('name', `%${trimmed}%`).limit(12),
          supabase.from('site_settings').select('key').like('key', 'product_visibility_%').eq('value', 'false'),
        ]);
        if (cancelled) return;
        if (error || settingsError) throw error || settingsError;
        const hidden = new Set((paused || []).map(item => item.key.replace('product_visibility_', '')));
        setResults((data || []).filter(item => (item as { is_published?: boolean }).is_published !== false && !hidden.has(item.id)).slice(0, 6));
      } catch { if (!cancelled) { setResults([]); setFailed(true); } }
      finally { if (!cancelled) setLoading(false); }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query]);
  const close = () => { setOpen(false); setMobile(false); setQuery(''); };
  const input = (mobileInput: boolean) => <form action="/catalogo" role="search" className="flex items-center gap-2 bg-gray-100 border border-line rounded-full px-3 py-2">
    {loading ? <Loader2 size={17} className="animate-spin shrink-0" /> : <Search size={17} className="shrink-0 text-gray-500" />}
    <input type="search" name="q" maxLength={100} aria-label="Buscar plantas por nombre o especie" value={query} onChange={event => { setQuery(event.target.value); setLoading(event.target.value.trim().length >= 2); }} onFocus={() => query.trim().length >= 2 && setOpen(true)} placeholder="Busca tu próxima planta…" className="min-w-0 w-full bg-transparent text-sm outline-none" />
    {query && <button type="button" aria-label="Limpiar búsqueda" onClick={() => setQuery('')} className="p-1"><X size={16} /></button>}
    {mobileInput && <button type="button" aria-label="Cerrar buscador" onClick={close} className="p-2"><X size={20} /></button>}
  </form>;
  const resultList = <div className="bg-surface rounded-xl border border-line shadow-xl overflow-hidden">
    <p role="status" className="p-3 text-xs text-gray-500 border-b border-line">{loading ? 'Buscando…' : failed ? 'No pudimos completar la búsqueda. Intenta nuevamente.' : query.trim().length < 2 ? 'Escribe al menos 2 letras.' : `${results.length} resultados sugeridos`}</p>
    {!loading && !failed && results.map(product => <Link key={product.id} href={`/producto/${product.id}`} onClick={close} className="flex items-center gap-3 p-3 hover:bg-tint border-b border-line">
      <BotanicalImage src={product.image_url || ''} alt={product.name} width={48} height={48} sizes="48px" className="w-12 h-12 rounded-md object-cover shrink-0" />
      <span className="flex-1 min-w-0"><span className="text-[10px] text-accent block">{product.category}</span><span className="font-serif text-sm line-clamp-2">{product.name}</span></span>
      <span className="text-xs font-bold shrink-0">S/ {Number(product.price).toFixed(2)}</span>
    </Link>)}
    {!loading && !failed && results.length === 0 && query.trim().length >= 2 && <p className="p-5 text-sm text-gray-500">No hay coincidencias. Prueba con otro nombre.</p>}
    {query.trim().length >= 2 && <Link href={`/catalogo?q=${encodeURIComponent(query.trim())}`} onClick={close} className="flex items-center justify-between p-4 text-sm text-accent">Ver todos los resultados <ArrowRight size={16} /></Link>}
  </div>;
  return <>
    <button onClick={() => setMobile(true)} aria-label="Abrir buscador" className="md:hidden p-2.5"><Search size={20} /></button>
    <div ref={searchRef} className="relative hidden md:block w-full max-w-xs" onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      {input(false)}
      {open && <div className="absolute top-full mt-2 inset-x-0 z-50">{resultList}</div>}
    </div>
    {mobile && <div className="fixed inset-0 z-50 bg-black/60 p-4 md:hidden"><div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Buscar plantas" tabIndex={-1} className="bg-surface rounded-2xl p-3 max-h-[90dvh] overflow-y-auto space-y-3">{input(true)}{resultList}</div></div>}
  </>;
}
