'use client';

import React, { useState } from 'react';
import { useCart } from '@/app/context/CartContext';
import { useWishlist } from '@/app/context/WishlistContext';
import { cleanPhoneDigits } from '@/lib/storeContact';
import { Minus, Plus, ShoppingBag, Heart, ShieldCheck, Sparkles, Share2, Check, MessageCircle, Zap } from 'lucide-react';

export default function AddToCartForm({ 
  product, 
  sizes, 
  storePhone 
}: { 
  product: any; 
  sizes: string[]; 
  storePhone?: string; 
}) {
  const { addToCart, toggleCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState(sizes[0] || 'Standard');
  const [localQuantity, setLocalQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < localQuantity; i++) {
      addToCart(product, selectedSize);
    }
    setLocalQuantity(1);
  };

  const handleExpressBuy = () => {
    handleAddToCart();
    toggleCart();
  };

  const handleToggleWishlist = () => {
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

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `¡Hola! Estoy interesado en la planta "${product.name}" de RD Garden (S/ ${Number(product.price).toFixed(2)}). ¿Me podrían compartir fotos del ejemplar exacto disponible para entrega?`
  );

  return (
    <div className="space-y-6">

      {/* Indicador de Stock en Vivo */}
      <div className="flex items-center gap-2 bg-tint border border-emerald-100 text-accent px-4 py-2.5 rounded-2xl w-fit text-xs font-semibold">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>
          {product.stock > 0
            ? `Actualmente ${product.stock} ejemplares en invernadero listos para envío`
            : 'Ejemplar actualmente agotado - Solicítalo por encargo'}
        </span>
      </div>

      {/* Selector de Variante / Tamaño de Maceta */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="font-bold text-gray-900 text-xs uppercase tracking-wider">
            Opción / Tamaño de Maceta:
          </label>
          <span className="text-xs text-gray-400 font-medium">{selectedSize}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)} aria-pressed={selectedSize === size}
              className={`px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${
                selectedSize === size
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/25 ring-2 ring-emerald-700/30'
                  : 'bg-surface border border-gray-200 text-gray-700 hover:border-emerald-600 hover:text-emerald-700'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Selector de Cantidad + Botones CTA */}
      <div className="space-y-3">
        <label className="block font-bold text-gray-900 text-xs uppercase tracking-wider">
          Cantidad:
        </label>

        <div className="flex flex-col sm:flex-row gap-3">

          {/* Controles de incremento */}
          <div className="flex items-center bg-gray-100 border border-gray-200 rounded-full h-14 px-4 w-full sm:w-36 justify-between">
            <button
              onClick={() => setLocalQuantity(Math.max(1, localQuantity - 1))}
              aria-label="Disminuir cantidad"
              className="text-gray-600 hover:text-ink transition p-2"
            >
              <Minus size={16} />
            </button>
            <span className="font-bold text-gray-900 text-base">
              {localQuantity}
            </span>
            <button
              onClick={() => setLocalQuantity(Math.min(product.stock, localQuantity + 1))}
              disabled={localQuantity >= product.stock}
              aria-label="Aumentar cantidad"
              className="text-gray-600 hover:text-ink transition p-2 disabled:opacity-30"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Botón Añadir al Carrito (Principal) */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 flex justify-center items-center gap-2.5 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:to-emerald-500 text-white h-14 rounded-full font-bold text-xs uppercase tracking-widest transition-all shadow-md shadow-emerald-700/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShoppingBag size={18} />
            {product.stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
          </button>
        </div>

        {/* Botón Comprar Ahora Express */}
        <button
          onClick={handleExpressBuy}
          disabled={product.stock === 0}
          className="w-full h-12 border-2 border-emerald-700 hover:bg-emerald-700 text-emerald-800 hover:text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <Zap size={16} /> Comprar Ahora (Ver Carrito)
        </button>

        {/* Botón directo a WhatsApp para atención botánica */}
        <a
          href={`https://wa.me/${cleanPhoneDigits(storePhone)}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-12 bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <MessageCircle size={17} className="fill-white" /> Consultar foto real por WhatsApp
        </a>
      </div>

      {/* Botones Secundarios (Wishlist + Compartir) */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-600 font-medium">
        <button
          onClick={handleToggleWishlist} aria-pressed={isWishlisted}
          className="flex items-center gap-2 hover:text-accent transition-colors"
        >
          <Heart size={18} className={isWishlisted ? 'text-red-500 fill-red-500' : ''} />
          <span>{isWishlisted ? 'En tu lista de deseos' : 'Guardar en Lista de Deseos'}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 hover:text-accent transition-colors"
        >
          {copied ? <Check size={18} className="text-emerald-600" /> : <Share2 size={18} />}
          <span>{copied ? '¡Enlace copiado!' : 'Compartir ejemplar'}</span>
        </button>
      </div>

      {/* Bloque de Garantías */}
      <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-200/70 space-y-3.5">
        <div className="flex items-center gap-3">
          <Sparkles className="text-accent shrink-0" size={18} />
          <div>
            <h5 className="font-bold text-xs uppercase text-gray-900">Control de Raíz & Follaje</h5>
            <p className="text-[11px] text-gray-500 font-light">Cada ejemplar es estabilizado antes de ser enviado a tu hogar.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ShieldCheck className="text-accent shrink-0" size={18} />
          <div>
            <h5 className="font-bold text-xs uppercase text-gray-900">Garantía Arrive Alive (100%)</h5>
            <p className="text-[11px] text-gray-500 font-light">Reemplazo o reembolso si el paquete sufre estrés en el flete.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
