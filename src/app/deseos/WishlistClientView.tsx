'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/app/context/WishlistContext';
import { useCart } from '@/app/context/CartContext';

export default function WishlistClientView() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product: any) => {
    addToCart(product);
  };

  if (wishlist.length === 0) {
    return (
      <div className="bg-surface p-10 sm:p-14 rounded-3xl border border-line text-center max-w-xl mx-auto shadow-sm">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
          <Heart size={30} className="fill-red-100" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-ink">Tu lista de deseos está vacía</h2>
        <p className="text-gray-500 text-xs sm:text-sm mt-3 font-light leading-relaxed max-w-md mx-auto">
          ¿Encontraste una Monstera exótica o un ejemplar que te robó el corazón? Haz clic en el ícono del corazón en cualquier planta para guardarla aquí.
        </p>
        <div className="mt-8">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 bg-[#18181b] hover:bg-[#27272a] text-white font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-full transition shadow-lg hover:scale-105"
          >
            Explorar Catálogo <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Barra de cabecera con contador y acción para limpiar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-line">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Tus Ejemplares Guardados
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-ink mt-0.5">
            {wishlist.length} {wishlist.length === 1 ? 'planta reservada' : 'plantas reservadas'} en tu lista
          </h2>
        </div>

        <button
          onClick={clearWishlist}
          className="text-xs font-semibold text-gray-400 hover:text-red-600 transition underline underline-offset-4 self-start sm:self-auto"
        >
          Vaciar lista de deseos
        </button>
      </div>

      {/* Grid de productos de la wishlist real */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <div
            key={item.id}
            className="group bg-surface rounded-3xl border border-line overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300"
          >
            {/* Foto del producto */}
            <div className="relative h-60 bg-canvas p-3 overflow-hidden">
              <Link href={`/producto/${item.id}`} className="block w-full h-full">
                <img
                  src={item.image_url || 'https://via.placeholder.com/400x400'}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              {/* Botón quitar de deseos */}
              <button
                onClick={() => removeFromWishlist(item.id)}
                aria-label={`Eliminar ${item.name} de la lista`}
                className="absolute top-5 right-5 p-2 bg-surface/90 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full shadow-md transition"
                title="Quitar de la lista"
              >
                <Trash2 size={16} />
              </button>

              {item.badge && (
                <span className="absolute top-5 left-5 bg-[#18181b]/85 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm border border-white/10">
                  {item.badge}
                </span>
              )}
            </div>

            {/* Información y acciones */}
            <div className="p-5 flex flex-col flex-grow">
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest block mb-1">
                {item.category || 'Planta de Colección'}
              </span>

              <Link href={`/producto/${item.id}`}>
                <h3 className="font-serif font-bold text-base text-ink hover:text-accent transition line-clamp-1 mb-2">
                  {item.name}
                </h3>
              </Link>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                <span className="text-lg font-black text-emerald-800">S/ {Number(item.price).toFixed(2)}</span>

                <button
                  onClick={() => handleMoveToCart(item)}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-full transition-all shadow-md shadow-emerald-700/20 hover:scale-105 active:scale-95"
                >
                  <ShoppingBag size={14} /> Mover al Carrito
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
