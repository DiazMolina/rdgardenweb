'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { ArrowUpDown, CheckSquare, Square } from 'lucide-react';

export default function CatalogSortAndFilter({
  currentSort,
  inStockOnly,
}: {
  currentSort: string;
  inStockOnly: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (val === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', val);
    }
    params.delete('page'); // Reset pagination
    router.push(`${pathname}?${params.toString()}#catalogo-grid`);
  };

  const toggleInStock = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (inStockOnly) {
      params.delete('inStock');
    } else {
      params.set('inStock', 'true');
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}#catalogo-grid`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 shadow-2xs">

      {/* Toggle Solo Disponibles */}
      <button
        onClick={toggleInStock}
        aria-pressed={inStockOnly}
        className="flex items-center gap-2 text-xs font-semibold tracking-wider text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
      >
        {inStockOnly ? (
          <CheckSquare size={17} className="text-emerald-700 fill-emerald-50" />
        ) : (
          <Square size={17} className="text-gray-300" />
        )}
        <span>Solo mostrar disponibles en stock</span>
      </button>

      {/* Selector de Ordenamiento */}
      <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-gray-700">
        <ArrowUpDown size={15} className="text-gray-400 shrink-0" />
        <span>Ordenar por:</span>
        <select
          aria-label="Ordenar productos"
          value={currentSort || 'newest'}
          onChange={handleSortChange}
          className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 bg-gray-50/80 hover:bg-white focus:bg-white hover:border-gray-400 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none cursor-pointer transition-all"
        >
          <option value="newest">✨ Más Recientes / Novedades</option>
          <option value="price-asc">📈 Precio: Menor a Mayor</option>
          <option value="price-desc">📉 Precio: Mayor a Menor</option>
        </select>
      </div>

    </div>
  );
}
