'use client';

import React from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';

export default function TestimonialsSection({
  whatsappLink,
  buttonText,
}: {
  whatsappLink?: string;
  buttonText?: string;
}) {
  const defaultLink = "https://wa.me/51997966231?text=Hola!%20Me%20gustar%C3%ADa%20unirme%20a%20la%20comunidad%20de%20plantas%20de%20RD%20Garden";
  const defaultText = "Únete a nuestra comunidad en WhatsApp";

  const link = whatsappLink || defaultLink;
  const label = buttonText || defaultText;

  return (
    <section className="py-20 bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#022c22] text-white relative overflow-hidden">
      {/* Iluminación verde suave de fondo */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* BANNER COMUNIDAD DE WHATSAPP */}
        <div className="bg-gradient-to-r from-black/30 to-black/10 border border-white/20 p-8 sm:p-12 rounded-[2.5rem] backdrop-blur-md text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles size={14} /> Grupo VIP de Plant Lovers
          </div>

          <h3 className="text-2xl sm:text-4xl font-serif font-bold text-white mb-4">
            Comunidad Exclusiva en WhatsApp
          </h3>

          <p className="text-neutral-300 text-sm sm:text-base font-light max-w-xl mx-auto mb-8 leading-relaxed">
            Recibe primero las fotos de los nuevos lotes de plantas raras recién llegadas al invernadero, resuelve dudas de cultivo y comparte fotos de tus ejemplares.
          </p>

          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-full transition-all shadow-xl hover:scale-105"
          >
            <MessageCircle size={20} className="fill-white shrink-0" />
            {label}
          </a>
        </div>

      </div>
    </section>
  );
}
