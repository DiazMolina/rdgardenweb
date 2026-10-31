'use client';

import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, Layers } from 'lucide-react';

interface ProductPhotoInputsProps {
  initialMain?: string;
  initialLeaf?: string;
  initialRoots?: string;
  initialExtra?: string;
}

export default function ProductPhotoInputs({
  initialMain = '',
  initialLeaf = '',
  initialRoots = '',
  initialExtra = ''
}: ProductPhotoInputsProps) {
  const [mainUrl, setMainUrl] = useState(initialMain);
  const [leafUrl, setLeafUrl] = useState(initialLeaf);
  const [rootsUrl, setRootsUrl] = useState(initialRoots);
  const [extraUrl, setExtraUrl] = useState(initialExtra);

  return (
    <div className="space-y-4 bg-gray-50/70 p-5 rounded-2xl border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <Camera size={18} className="text-accent" /> Galería de Fotos por Especie (Botánica de Colección)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Los clientes de plantas exóticas necesitan ver la planta completa, el patrón foliar y la salud de sus raíces antes de comprar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* FOTO 1: PLANTA COMPLETA */}
        <div className="bg-surface p-4 rounded-xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="image_url" className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px]">1</span>
              Foto Principal: Planta Completa en Maceta *
            </label>
            <span className="text-[10px] text-accent font-bold bg-tint px-2 py-0.5 rounded-full">Requerida</span>
          </div>
          <input
            type="url"
            name="image_url"
            id="image_url"
            value={mainUrl}
            onChange={(e) => setMainUrl(e.target.value)}
            required
            placeholder="https://ejemplo.com/planta-completa.jpg"
            className="w-full text-xs p-2.5 border border-gray-200 rounded-lg outline-none focus:border-emerald-600 font-mono"
          />
          {mainUrl ? (
            <div className="h-32 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
              <img src={mainUrl} alt="Vista previa principal" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="h-24 rounded-lg border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 text-xs">
              <ImageIcon size={20} className="mb-1 text-gray-300" />
              Vista previa foto principal
            </div>
          )}
        </div>

        {/* FOTO 2: DETALLE DE HOJA / VARIEGACIÓN */}
        <div className="bg-surface p-4 rounded-xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="image_leaf" className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px]">2</span>
              Foto 2: Detalle de Hoja / Variegación
            </label>
            <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full">Foliar</span>
          </div>
          <input
            type="url"
            name="image_leaf"
            id="image_leaf"
            value={leafUrl}
            onChange={(e) => setLeafUrl(e.target.value)}
            placeholder="https://ejemplo.com/detalle-hoja.jpg"
            className="w-full text-xs p-2.5 border border-gray-200 rounded-lg outline-none focus:border-emerald-600 font-mono"
          />
          {leafUrl ? (
            <div className="h-32 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
              <img src={leafUrl} alt="Vista previa detalle de hoja" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="h-24 rounded-lg border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 text-xs">
              <Sparkles size={20} className="mb-1 text-gray-300" />
              Primer plano de nervaduras / variegación
            </div>
          )}
        </div>

        {/* FOTO 3: ESTADO DE RAÍCES / CEPELLÓN */}
        <div className="bg-surface p-4 rounded-xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="image_roots" className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px]">3</span>
              Foto 3: Raíces / Cepellón & Sustrato
            </label>
            <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full">Sistema Radicular</span>
          </div>
          <input
            type="url"
            name="image_roots"
            id="image_roots"
            value={rootsUrl}
            onChange={(e) => setRootsUrl(e.target.value)}
            placeholder="https://ejemplo.com/raices-sustrato.jpg"
            className="w-full text-xs p-2.5 border border-gray-200 rounded-lg outline-none focus:border-emerald-600 font-mono"
          />
          {rootsUrl ? (
            <div className="h-32 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
              <img src={rootsUrl} alt="Vista previa raíces" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="h-24 rounded-lg border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 text-xs">
              <Layers size={20} className="mb-1 text-gray-300" />
              Salud del cepellón y raíces activas
            </div>
          )}
        </div>

        {/* FOTO 4: PERSPECTIVA ADICIONAL / ESCALA */}
        <div className="bg-surface p-4 rounded-xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="image_extra" className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-gray-500 text-white flex items-center justify-center text-[10px]">4</span>
              Foto 4: Vista Adicional / Escala en Ambiente
            </label>
            <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded-full">Opcional</span>
          </div>
          <input
            type="url"
            name="image_extra"
            id="image_extra"
            value={extraUrl}
            onChange={(e) => setExtraUrl(e.target.value)}
            placeholder="https://ejemplo.com/ambiente-escala.jpg"
            className="w-full text-xs p-2.5 border border-gray-200 rounded-lg outline-none focus:border-emerald-600 font-mono"
          />
          {extraUrl ? (
            <div className="h-32 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
              <img src={extraUrl} alt="Vista previa adicional" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="h-24 rounded-lg border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 text-xs">
              <ImageIcon size={20} className="mb-1 text-gray-300" />
              Perspectiva de tamaño en sala o maceta final
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
