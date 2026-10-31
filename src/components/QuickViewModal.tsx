'use client';

import React, { useState } from 'react';
import { X, ShoppingBag, Heart, Minus, Plus, ShieldCheck, Check } from 'lucide-react';
import { useDialog } from './useDialog';
import { useCart } from '@/app/context/CartContext';

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
}: {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { addToCart } = useCart();
  const sizes = product?.sizes && product.sizes.length > 0 ? product.sizes : ['Standard'];
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const dialogRef = useDialog(isOpen, onClose);

  if (!isOpen || !product) return null;

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize);
    }
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        ref={dialogRef} role="dialog" aria-modal="true" aria-label={`Vista rápida: ${product.name}`} tabIndex={-1}
        className="relative bg-surface rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose} aria-label="Cerrar vista rápida"
          className="absolute top-4 right-4 z-10 p-2 bg-surface/80 hover:bg-gray-100 rounded-full text-gray-500 hover:text-ink transition-colors"
        >
          <X size={20} />
        </button>

        {/* Imagen */}
        <div className="md:w-1/2 bg-gray-50 p-6 flex items-center justify-center relative">
          <img
            src={product.image_url || 'https://via.placeholder.com/400'}
            alt={product.name}
            className="w-full max-h-80 object-cover rounded-2xl shadow-sm"
          />
          {product.stock <= 5 && product.stock > 0 && (
            <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow">
              ¡Solo {product.stock} disponibles!
            </span>
          )}
        </div>

        {/* Info y Formulario */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block mb-1">
              {product.category || 'Plantas Exóticas'}
            </span>
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">{product.name}</h3>
            <p className="text-2xl font-black text-emerald-800 mb-4">S/ {Number(product.price).toFixed(2)}</p>
            <p className="text-xs text-gray-500 line-clamp-3 mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Selector de Tamaño */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Tamaño de maceta:
              </label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)} aria-pressed={selectedSize === s}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedSize === s
                        ? 'border-emerald-700 bg-emerald-700 text-white shadow-sm'
                        : 'border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-700 bg-surface'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Cantidad */}
            <div className="mb-6 flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Cantidad:</span>
              <div className="flex items-center border border-gray-200 rounded-full px-3 py-1 bg-gray-50">
                <button
                  aria-label="Disminuir cantidad"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 text-gray-500 hover:text-ink"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                <button
                  aria-label="Aumentar cantidad"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-1 text-gray-500 hover:text-ink disabled:opacity-30"
                  disabled={quantity >= product.stock}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Botón Añadir */}
          <button
            onClick={handleAdd}
            disabled={product.stock <= 0 || added}
            className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white shadow-emerald-700/20 active:scale-[0.98]'
            }`}
          >
            {added ? (
              <>
                <Check size={18} /> ¡Añadido al carrito!
              </>
            ) : (
              <>
                <ShoppingBag size={18} /> Añadir al Carrito
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
