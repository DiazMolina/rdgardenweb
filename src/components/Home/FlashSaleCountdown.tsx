'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function FlashSaleCountdown({
  enabled = false,
  badge = '⚡ Oferta Relámpago de Fin de Semana',
  title = 'Hasta 30% OFF en Colección de Variegadas',
  description = 'Aprovecha precios especiales en ejemplares seleccionados antes de que termine el tiempo. Envío con empaque térmico garantizado a todo el Perú.',
  endDate = '',
  buttonText = 'Ver Plantas en Oferta',
  buttonLink = '/catalogo',
}: {
  enabled?: boolean;
  badge?: string;
  title?: string;
  description?: string;
  endDate?: string;
  buttonText?: string;
  buttonLink?: string;
}) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const calculateTime = () => {
      if (!endDate) {
        // Fallback: 24 horas por defecto
        return { days: 0, hours: 14, minutes: 35, seconds: 22 };
      }

      const target = new Date(endDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    };

    setTimeLeft(calculateTime());

    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!enabled) return null;

  // Si ya venció la fecha límite y no es fallback, se oculta automáticamente
  if (endDate && timeLeft && timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return null;
  }

  const hoursDisplay = timeLeft ? (timeLeft.days * 24 + timeLeft.hours) : 14;
  const minutesDisplay = timeLeft ? timeLeft.minutes : 35;
  const secondsDisplay = timeLeft ? timeLeft.seconds : 22;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div className="bg-gradient-to-r from-[#0F281E] via-[#163829] to-[#0A1C15] text-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-emerald-800/40 relative overflow-hidden">

        {/* Glow ámbar / esmeralda de fondo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-xl text-center md:text-left">
          <span className="inline-flex items-center gap-2 py-1 px-3.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-md">
            <Zap size={14} className="fill-amber-400" /> {badge}
          </span>
          <h3 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4 leading-tight">
            {title}
          </h3>
          <p className="text-emerald-100/80 text-sm sm:text-base font-light leading-relaxed">
            {description}
          </p>
        </div>

        {/* Contador Regresivo */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="flex gap-3 sm:gap-4 text-center">
            {/* Horas */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl min-w-[70px]">
              <span className="text-2xl sm:text-3xl font-black text-amber-300 block">
                {isClient ? String(hoursDisplay).padStart(2, '0') : '--'}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-emerald-200">Horas</span>
            </div>
            <span className="text-2xl font-bold self-center text-amber-300">:</span>
            {/* Minutos */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl min-w-[70px]">
              <span className="text-2xl sm:text-3xl font-black text-amber-300 block">
                {isClient ? String(minutesDisplay).padStart(2, '0') : '--'}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-emerald-200">Mins</span>
            </div>
            <span className="text-2xl font-bold self-center text-amber-300">:</span>
            {/* Segundos */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl min-w-[70px]">
              <span className="text-2xl sm:text-3xl font-black text-amber-300 block">
                {isClient ? String(secondsDisplay).padStart(2, '0') : '--'}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-emerald-200">Segs</span>
            </div>
          </div>

          <Link
            href={buttonLink || '/catalogo'}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-full transition-all shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95"
          >
            {buttonText} <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
}
