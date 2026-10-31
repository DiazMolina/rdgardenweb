'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { DollarSign } from 'lucide-react';

export default function PriceFilter({
  currentCategory,
  currentPriceRange
}: {
  currentCategory: string;
  currentPriceRange: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const priceRanges = [
    { label: 'Todos los precios', value: 'all' },
    { label: 'Hasta S/ 50', value: '0-50' },
    { label: 'S/ 50 - S/ 150', value: '50-150' },
    { label: 'Más de S/ 150', value: '150-plus' },
  ];

  const buildUrl = (rangeVal: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (rangeVal === 'all') {
      params.delete('price');
    } else {
      params.set('price', rangeVal);
    }
    // Reiniciar paginación al cambiar rango de precio
    params.delete('page');
    params.delete('limit');

    const queryStr = params.toString();
    return `${pathname}${queryStr ? `?${queryStr}` : ''}`;
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-10 bg-white p-2.5 rounded-2xl border border-gray-200/80 w-fit mx-auto shadow-xs">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 border-r border-gray-200 mr-1">
        <DollarSign size={14} className="text-gray-400" />
        <span>Precio:</span>
      </div>

      {priceRanges.map((range) => {
        const isActive = (currentPriceRange || 'all') === range.value;
        return (
          <Link
            key={range.value}
            href={buildUrl(range.value)}
            aria-current={isActive ? "true" : undefined}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isActive
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-emerald-50/60 text-emerald-900 hover:bg-emerald-100/80 hover:text-emerald-950 border border-emerald-200/60'
            }`}
            scroll={false}
          >
            {range.label}
          </Link>
        );
      })}
    </div>
  );
}
