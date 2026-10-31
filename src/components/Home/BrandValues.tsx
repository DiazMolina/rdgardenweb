'use client';

import React from 'react';
import { Leaf, ShieldCheck, Thermometer, Sparkles } from 'lucide-react';

export default function BrandValues() {
  const values = [
    {
      icon: <Leaf className="text-accent" size={28} />,
      title: 'Aclimatadas en Invernadero',
      description: 'Cada ejemplar pasa semanas de estabilización de humedad y luz antes de ser puesto a la venta.',
    },
    {
      icon: <Thermometer className="text-accent" size={28} />,
      title: 'Empaque Controlado por Clima',
      description: 'Aislamiento multicapa con geles térmicos para proteger las raíces del frío o calor extremo.',
    },
    {
      icon: <ShieldCheck className="text-accent" size={28} />,
      title: 'Garantía de Llegada Viva',
      description: 'Si tu planta sufre algún estrés en el trayecto, te la reemplazamos de inmediato sin costo.',
    },
    {
      icon: <Sparkles className="text-accent" size={28} />,
      title: 'Guía de Cuidado Incluida',
      description: 'Incluimos la ficha técnica física y digital con los requerimientos exactos de tu nueva planta.',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-emerald-50/30 via-white to-emerald-50/20 border-y border-emerald-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3.5 py-1 rounded-full mb-3 inline-block">
            El Estándar RD Garden
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900">
            ¿Por qué elegir nuestros ejemplares?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, i) => (
            <div
              key={i}
              className="bg-white p-7 rounded-2xl border border-emerald-100 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-950/5 hover:-translate-y-1 transition-all duration-300 flex flex-col items-start"
            >
              <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-emerald-100/80 rounded-2xl mb-5 text-emerald-700 border border-emerald-200/60 shadow-2xs">
                {v.icon}
              </div>
              <h3 className="text-base font-serif font-bold text-gray-900 mb-2">{v.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-light">{v.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
