'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export default function CategoryFilter({
  currentCategory,
  categories
}: {
  currentCategory: string;
  categories: string[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildUrl = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'Todas') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    // Reiniciar paginación al cambiar categoría
    params.delete('page');
    params.delete('limit');

    const queryStr = params.toString();
    return `${pathname}${queryStr ? `?${queryStr}` : ''}`;
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-8">
      {categories.map((cat) => {
        const isActive = currentCategory === cat;
        return (
          <Link
            key={cat}
            href={buildUrl(cat)}
            aria-current={isActive ? "true" : undefined}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-white border border-emerald-700 shadow-md shadow-emerald-900/20'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-emerald-600 hover:text-emerald-800 hover:bg-emerald-50/50 shadow-2xs'
            }`}
            scroll={false}
          >
            {cat}
          </Link>
        );
      })}
    </div>
  );
}
