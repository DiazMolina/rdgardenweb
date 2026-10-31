'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function FlashSaleCountdown() {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 35, seconds: 22 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div className="bg-gradient-to-r from-[#122C20] via-[#1a3d2c] to-[#0f241a] text-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-emerald-900/50 relative overflow-hidden">

        {/* Glow de fondo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-xl text-center md:text-left">
          <span className="inline-flex items-center gap-2 py-1 px-3.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-md">
            <Sparkles size={14} /> Oferta Especial de la Semana
          </span>
          <h3 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
            30% OFF en Colección de Variegadas
          </h3>
          <p className="text-emerald-100/80 text-sm sm:text-base font-light">
            Aprovecha el descuento por tiempo limitado en plantas con patrones de variegación raros. Envío térmico garantizado.
          </p>
        </div>

        {/* Contador Regresivo */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="flex gap-3 sm:gap-4 text-center">
            <div className="bg-surface/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl min-w-[70px]">
              <span className="text-2xl sm:text-3xl font-black text-white block">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-emerald-200">Horas</span>
            </div>
            <span className="text-2xl font-bold self-center text-emerald-300">:</span>
            <div className="bg-surface/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl min-w-[70px]">
              <span className="text-2xl sm:text-3xl font-black text-white block">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-emerald-200">Mins</span>
            </div>
            <span className="text-2xl font-bold self-center text-emerald-300">:</span>
            <div className="bg-surface/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl min-w-[70px]">
              <span className="text-2xl sm:text-3xl font-black text-white block">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-emerald-200">Segs</span>
            </div>
          </div>

          <a
            href="#coleccion"
            className="inline-flex items-center gap-2 bg-surface text-[#122C20] font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-full hover:bg-tint transition-all shadow-lg hover:scale-105"
          >
            Aprovechar Oferta <ArrowRight size={16} />
          </a>
        </div>

      </div>
    </div>
  );
}
