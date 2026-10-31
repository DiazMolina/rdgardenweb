'use client';

import BotanicalImage from './BotanicalImage';
import React, { useState } from 'react';
import { Sparkles, Layers, Eye, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  name: string;
  stock: number;
  badge?: string;
}

const PHOTO_LABELS = [
  'Planta Completa',
  'Detalle de Hoja',
  'Raíces / Cepellón',
  'Vista en Ambiente'
];

export default function ProductGallery({ images, name, stock, badge }: ProductGalleryProps) {
  // Filtrar URLs vacías o inválidas
  const cleanImages = (images && images.length > 0 ? images : ['https://via.placeholder.com/600'])
    .filter(Boolean);

  const [activeIndex, setActiveIndex] = useState(0);
  const currentImage = cleanImages[activeIndex] || cleanImages[0];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % cleanImages.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + cleanImages.length) % cleanImages.length);
  };

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* CONTENEDOR FOTO PRINCIPAL ACTIVA */}
      <div className="relative w-full aspect-square max-w-lg bg-canvas rounded-3xl overflow-hidden group shadow-sm border border-line flex items-center justify-center">
        
        {/* Badges de Estado */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
          {stock === 0 && (
            <span className="bg-[#193b2d] text-white font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">
              Agotado
            </span>
          )}
          {badge && (
            <span className="bg-[#0F281E] text-emerald-200 font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">
              {badge}
            </span>
          )}
        </div>

        {/* Indicador de Tipo de Fotografía Botánica */}
        <div className="absolute top-4 right-4 z-10 bg-surface/90 backdrop-blur-md text-ink text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs border border-gray-200 pointer-events-none flex items-center gap-1">
          <Eye size={12} className="text-accent" />
          <span>{PHOTO_LABELS[activeIndex] || `Foto ${activeIndex + 1}`}</span>
        </div>

        {/* Imagen Principal con Zoom en Hover */}
        <BotanicalImage
          width={700} height={700} sizes="(max-width: 767px) 100vw, 50vw" preload
          src={currentImage}
          alt={`Fotografía botánica de ${name} - ${PHOTO_LABELS[activeIndex] || ''}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 "
        />

        {/* Flechas de Navegación Rápida si hay más de 1 imagen */}
        {cleanImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Foto anterior"
              className="gallery-arrow absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-surface/80 hover:bg-surface text-gray-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              aria-label="Foto siguiente"
              className="gallery-arrow absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-surface/80 hover:bg-surface text-gray-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* MINIATURAS INTERACTIVAS (SELECTOR DE PERSPECTIVAS BOTÁNICAS) */}
      {cleanImages.length > 1 && (
        <div className="w-full max-w-lg mt-4 grid grid-cols-4 gap-2.5">
          {cleanImages.map((imgUrl, idx) => {
            const isSelected = activeIndex === idx;
            const label = PHOTO_LABELS[idx] || `Foto ${idx + 1}`;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)} aria-pressed={isSelected} aria-label={`Ver foto ${idx + 1} de ${name}`}
                className={`relative flex flex-col items-center p-1 rounded-xl transition-all cursor-pointer border ${
                  isSelected
                    ? 'border-emerald-800 ring-2 ring-emerald-800/30 bg-tint/40 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-surface opacity-70 hover:opacity-100'
                }`}
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <BotanicalImage
                    width={140} height={140} sizes="(max-width: 767px) 22vw, 120px"
                    src={imgUrl}
                    alt={`${name} miniatura ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className={`text-[9px] font-bold tracking-tight mt-1 truncate w-full text-center ${
                  isSelected ? 'text-emerald-900' : 'text-gray-500'
                }`}>
                  {label}
                </span>
                {isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-800 text-white flex items-center justify-center shadow-xs">
                    <Check size={9} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Mensaje de Garantía Visual para Coleccionistas */}
      <div className="w-full max-w-lg mt-4 text-center">
        <p className="text-[11px] text-gray-500 font-light flex items-center justify-center gap-1.5">
          <Sparkles size={12} className="text-accent shrink-0" />
          <span>Fotografías reales del lote en invernadero con sistema radicular verificado.</span>
        </p>
      </div>

    </div>
  );
}
