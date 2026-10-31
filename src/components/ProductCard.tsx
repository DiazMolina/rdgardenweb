'use client';

import React, { useState } from 'react';
import { ShoppingBag, Heart, Eye, Check, Sun, Droplets } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import { useWishlist } from '@/app/context/WishlistContext';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import BotanicalImage from './BotanicalImage';
const QuickViewModal = dynamic(() => import('./QuickViewModal'));

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [added, setAdded] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, defaultSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      category: product.category,
      stock: product.stock,
      description: product.description,
      badge: product.badge,
    });
  };

  return (
    <>
      <div className="product-card group relative flex flex-col bg-white rounded-2xl border border-gray-200/80 overflow-hidden hover:shadow-xl hover:shadow-black/6 hover:-translate-y-1 hover:border-gray-300 transition-all duration-300">

        {/* Imagen del Producto + Overlay de Botones Flotantes */}
        <div className="relative h-64 sm:h-72 overflow-hidden bg-gray-50/70 p-2.5">

          {/* Badges de Estado + Badge Editable */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
            {product.original_price && Number(product.original_price) > Number(product.price) && (
              <span className="bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md shadow-rose-900/20 border border-amber-300/40 w-fit animate-pulse">
                -{Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100)}% OFF
              </span>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                ¡Solo {product.stock}!
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                Agotado
              </span>
            )}
            {product.badge && (
              <span className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md shadow-emerald-900/20 border border-emerald-400/30 w-fit">
                {product.badge}
              </span>
            )}
          </div>

          {/* Botones de Acción Flotantes Lateral */}
          <div className="product-actions absolute top-4 right-4 z-20 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={handleToggleWishlist}
              aria-pressed={isWishlisted}
              aria-label={isWishlisted ? "Quitar de lista de deseos" : "Añadir a lista de deseos"}
              className={`p-2.5 rounded-full shadow-md backdrop-blur-md transition-all cursor-pointer ${
                isWishlisted ? 'bg-rose-500 text-white scale-110' : 'bg-white/95 text-gray-700 hover:bg-emerald-600 hover:text-white'
              }`}
              title={isWishlisted ? "Quitar de lista de deseos" : "Añadir a lista de deseos"}
            >
              <Heart size={16} className={isWishlisted ? 'fill-white' : ''} />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                setIsQuickViewOpen(true);
              }}
              aria-label="Vista rápida del producto"
              className="p-2.5 bg-white/95 hover:bg-emerald-600 text-gray-700 hover:text-white rounded-full shadow-md backdrop-blur-md transition-all cursor-pointer"
              title="Vista Rápida"
            >
              <Eye size={16} />
            </button>
          </div>

          {/* Link a Detalle con Imagen */}
          <Link href={`/producto/${product.id}`} className="block w-full h-full">
            <BotanicalImage
              src={product.image_url || ''}
              width={480} height={480} sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
              alt={product.name}
              className="w-full h-full object-cover rounded-2xl group-hover:scale-108 transition-transform duration-700 ease-out"
            />
          </Link>

          {/* Botón Flotante Inferior "Añadir Rápido" */}
          <div className="product-quick-add absolute bottom-4 left-4 right-4 z-10 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={handleQuickAdd}
              disabled={product.stock === 0}
              className={`w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white shadow-emerald-700/25'
              }`}
            >
              {added ? (
                <>
                  <Check size={14} /> En el Carrito
                </>
              ) : (
                <>
                  <ShoppingBag size={14} /> Añadir Rápido
                </>
              )}
            </button>
          </div>
        </div>

        {/* Información del Producto */}
        <div className="p-5 flex flex-col flex-grow">

          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {product.category || 'Colección botánica'}
          </span>

          <Link href={`/producto/${product.id}`}>
            <h3 className="text-base font-serif font-bold text-gray-900 line-clamp-1 mb-1 hover:text-emerald-700 transition-colors">
              {product.name}
            </h3>
          </Link>

          <p className="text-gray-500 text-xs line-clamp-2 mb-4 flex-grow font-light leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">
                {product.original_price && Number(product.original_price) > Number(product.price) ? 'Oferta' : 'Precio'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-emerald-800 tracking-tight">S/ {Number(product.price).toFixed(2)}</span>
                {product.original_price && Number(product.original_price) > Number(product.price) && (
                  <span className="text-xs font-semibold text-gray-400 line-through">
                    S/ {Number(product.original_price).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                setIsQuickViewOpen(true);
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 uppercase tracking-wider underline underline-offset-4 cursor-pointer transition-colors"
            >
              Ver Opciones
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Vista Rápida */}
      {isQuickViewOpen && <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />}
    </>
  );
}
