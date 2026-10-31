'use client';

import React from 'react';
import { CheckCircle2, ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';

export default function ToastNotification() {
  const { toast, hideToast, toggleCart } = useCart();

  if (!toast.show || !toast.product) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 animate-fade-in sm:max-w-sm">
      <div className="bg-[#0F281E] text-white p-4 rounded-2xl shadow-2xl border border-emerald-800/60 flex items-center gap-4 relative overflow-hidden">

        {/* Foto miniatura */}
        <img
          src={toast.product.image_url || 'https://via.placeholder.com/100'}
          alt={toast.product.name}
          className="w-14 h-14 object-cover rounded-xl border border-emerald-700/50 shrink-0"
        />

        {/* Detalle */}
        <div className="flex-1 min-w-0" role="status">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-0.5">
            <CheckCircle2 size={14} /> ¡Añadido al Carrito!
          </div>
          <h4 className="font-serif font-bold text-sm text-white truncate">{toast.product.name}</h4>
          <p className="text-xs text-emerald-200/80 mt-0.5">
            S/ {Number(toast.product.price).toFixed(2)} {toast.size ? `• ${toast.size}` : ''}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={() => {
              hideToast();
              toggleCart();
            }}
            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition shadow-md"
            title="Ver Carrito" aria-label="Ver carrito"
          >
            <ShoppingBag size={16} />
          </button>
        </div>

        {/* Cerrar X */}
        <button
          onClick={hideToast} aria-label="Cerrar notificación"
          className="absolute top-2 right-2 text-emerald-300/60 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
