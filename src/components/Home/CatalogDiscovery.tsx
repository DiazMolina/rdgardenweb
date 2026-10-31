'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Tag, X, ArrowRight } from 'lucide-react';

export default function CatalogDiscovery({ badges }: { badges: string[] }) {
  const params = useSearchParams();
  const hasFilters = params.size > 0;

  return (
    <div className="mb-8 p-3 sm:p-4 bg-white border border-gray-200/90 rounded-2xl shadow-xs">
      <form action="/catalogo" role="search" aria-label="Buscar en el catálogo" className="flex flex-col sm:flex-row items-center gap-2.5">
        {['category', 'price', 'sort', 'inStock'].map(key => params.get(key) ? <input key={key} type="hidden" name={key} value={params.get(key)!} /> : null)}
        
        {/* Barra de búsqueda por texto */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <label className="sr-only" htmlFor="catalog-search">Nombre o especie</label>
          <input
            id="catalog-search"
            name="q"
            type="search"
            defaultValue={params.get('q') || ''}
            key={params.get('q')}
            placeholder="Buscar por nombre botánico, especie o tipo..."
            maxLength={100}
            className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm bg-gray-50/80 border border-gray-200 rounded-full text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all"
          />
        </div>

        {/* Filtro de etiquetas / badges */}
        <div className="relative w-full sm:w-auto shrink-0">
          <label className="sr-only" htmlFor="catalog-badge">Etiqueta de colección o rareza</label>
          <div className="relative">
            <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              id="catalog-badge"
              name="badge"
              defaultValue={params.get('badge') || ''}
              key={`badge-${params.get('badge')}`}
              className="w-full sm:w-auto appearance-none pl-9 pr-8 py-2.5 text-xs font-semibold uppercase tracking-wider bg-gray-50/80 border border-gray-200 rounded-full text-gray-700 hover:border-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all cursor-pointer"
            >
              <option value="">Todas las etiquetas</option>
              {badges.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">▼</div>
          </div>
        </div>

        {/* Botón de submit */}
        <button
          type="submit"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-7 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-md shadow-emerald-700/25 cursor-pointer shrink-0"
        >
          <span>Buscar plantas</span>
          <ArrowRight size={13} />
        </button>

        {/* Botón de limpiar filtros */}
        {hasFilters && (
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition px-2 py-1 shrink-0 font-medium"
            title="Restablecer todos los filtros"
          >
            <X size={13} />
            <span>Limpiar</span>
          </Link>
        )}
      </form>
    </div>
  );
}
