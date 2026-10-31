'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PaginationBar({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    const queryStr = params.toString();
    return `${pathname}${queryStr ? `?${queryStr}` : ''}#catalogo-grid`;
  };

  // Generar array de números de página
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-10 border-t border-line">
      <span className="text-xs text-gray-500 font-light">
        Página <strong className="text-gray-900 font-bold">{currentPage}</strong> de <strong className="text-gray-900 font-bold">{totalPages}</strong>
      </span>

      <div className="flex items-center gap-2">
        {/* Botón Anterior */}
        {currentPage > 1 ? (
          <Link
            href={buildPageUrl(currentPage - 1)}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all shadow-2xs cursor-pointer"
            title="Página Anterior"
            scroll={false}
          >
            <ChevronLeft size={16} />
          </Link>
        ) : (
          <button disabled className="p-2.5 rounded-xl border border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed">
            <ChevronLeft size={16} />
          </button>
        )}

        {/* Números de Página */}
        <div className="flex items-center gap-1.5">
          {pages.map((p) => {
            const isActive = p === currentPage;
            return (
              <Link
                key={p}
                href={buildPageUrl(p)}
                className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/25'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/40 shadow-2xs'
                }`}
                scroll={false}
              >
                {p}
              </Link>
            );
          })}
        </div>

        {/* Botón Siguiente */}
        {currentPage < totalPages ? (
          <Link
            href={buildPageUrl(currentPage + 1)}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all shadow-2xs cursor-pointer"
            title="Página Siguiente"
            scroll={false}
          >
            <ChevronRight size={16} />
          </Link>
        ) : (
          <button disabled className="p-2.5 rounded-xl border border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed">
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
