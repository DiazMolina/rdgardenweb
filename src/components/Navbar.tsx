'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ShieldCheck, Leaf, X, Plus, Minus, Trash2, ArrowRight, Truck, Store, Home, Heart, Menu, MessageCircle } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import { useWishlist } from '@/app/context/WishlistContext';
import { getStorePhone } from '@/app/checkout/actions';
import LiveSearch from './LiveSearch';
import ToastNotification from './ToastNotification';
import CheckoutModal from './CheckoutModal';
import ThemeToggle from './ThemeToggle';
import { useDialog } from './useDialog';

export default function Navbar() {
  const {
    items,
    isCartOpen,
    toggleCart,
    cartCount,
    cartTotal,
    updateQuantity,
    removeFromCart
  } = useCart();

  const { wishlistCount } = useWishlist();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('https://wa.me/51997966231?text=Hola!%20Deseo%20hacer%20una%20consulta%20sobre%20sus%20plantas');

  useEffect(() => {
    getStorePhone().then((phone) => {
      setWhatsappUrl(`https://wa.me/${phone.clean}?text=Hola!%20Deseo%20hacer%20una%20consulta%20sobre%20sus%20plantas`);
    });
  }, []);

  const menuRef = useDialog(isMobileMenuOpen, () => setIsMobileMenuOpen(false));
  const cartRef = useDialog(isCartOpen, toggleCart);

  const handleProceedToCheckout = () => {
    toggleCart();
    setIsCheckoutOpen(true);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* NOTIFICACIÓN TOAST FLOTANTE */}
      <ToastNotification />

      {/* MODAL DE CHECKOUT / PROCESAR COMPRA */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* NAVBAR (Glassmorphism) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 sm:gap-4">

          {/* Menú Hamburguesa Móvil (< lg) */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-xl transition"
              aria-label="Abrir menú de navegación"
              aria-expanded={isMobileMenuOpen} aria-controls="mobile-navigation"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="hidden sm:block bg-gradient-to-br from-emerald-600 to-emerald-800 p-2 rounded-xl text-white group-hover:from-emerald-500 group-hover:to-emerald-700 transition-all shadow-md shadow-emerald-700/25">
              <Leaf size={20} />
            </div>
            <span className="brand-wordmark text-gray-900">R&D Garden<small className="text-emerald-700 font-bold tracking-widest">Botánica de colección</small></span>
          </Link>

          {/* Enlaces de Navegación Principal (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-emerald-700 transition-colors"
            >
              <Home size={15} className="text-emerald-600" /> Inicio
            </Link>

            <Link
              href="/catalogo"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-emerald-700 transition-colors"
            >
              <Store size={15} className="text-emerald-600" /> Catálogo
            </Link>

            <Link
              href="/deseos"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-emerald-700 transition-colors relative"
            >
              <Heart size={15} className="text-rose-500 fill-rose-100" /> Deseos
              {wishlistCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </nav>

          {/* BUSCADOR INTERACTIVO EN VIVO (Desktop + Botón Móvil) */}
          <div className="flex-1 min-w-0 max-w-md mx-0 sm:mx-4 flex justify-end md:justify-center">
            <LiveSearch />
          </div>

          {/* Acciones del Usuario (Deseos Móvil + Carrito + Admin) */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Botón de Deseos en Móvil */}
            <Link
              href="/deseos"
              className="hidden sm:block lg:hidden relative p-2.5 text-ink hover:text-accent hover:bg-tint rounded-full transition-all"
              aria-label="Ver lista de deseos"
            >
              <Heart size={21} className="text-gray-700 hover:text-red-500" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-white shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <ThemeToggle />
            {/* Carrito */}
            <button
              onClick={toggleCart}
              aria-label="Abrir carrito de compras"
              className="relative p-2.5 text-ink hover:text-accent hover:bg-tint rounded-full transition-all"
            >
              <ShoppingBag size={21} />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-600 text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center rounded-full border border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 hover:text-ink bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-all"
              title="Panel Administrativo"
            >
              <ShieldCheck size={14} className="text-accent" />
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* DRAWER / MENÚ LATERAL MÓVIL */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      <div
        ref={menuRef} id="mobile-navigation" role="dialog" aria-modal={isMobileMenuOpen || undefined} aria-label="Navegación" tabIndex={-1} inert={!isMobileMenuOpen} aria-hidden={!isMobileMenuOpen} style={{ visibility: isMobileMenuOpen ? "visible" : "hidden" }}
        className={`fixed top-0 left-0 h-full w-4/5 max-w-sm bg-surface shadow-2xl z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* Header del Drawer */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-100">
            <Link href="/" onClick={closeMobileMenu} className="flex items-center gap-2">
              <div className="bg-[#18181b] p-1.5 rounded-lg text-white">
                <Leaf size={18} />
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tight">
                R&D Garden
              </span>
            </Link>
            <button
              onClick={closeMobileMenu}
              className="p-2 text-gray-400 hover:text-ink rounded-full"
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          </div>

          {/* Enlaces Principales */}
          <div className="py-6 space-y-4">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 text-sm font-bold text-gray-800 hover:text-accent py-2"
            >
              <Home size={18} className="text-accent" /> Inicio
            </Link>

            <Link
              href="/catalogo"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 text-sm font-bold text-gray-800 hover:text-accent py-2"
            >
              <Store size={18} className="text-accent" /> Catálogo Completo
            </Link>

            <Link
              href="/deseos"
              onClick={closeMobileMenu}
              className="flex items-center justify-between text-sm font-bold text-gray-800 hover:text-accent py-2"
            >
              <span className="flex items-center gap-3">
                <Heart size={18} className="text-red-500 fill-red-100" /> Lista de Deseos
              </span>
              {wishlistCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </div>

          {/* Colecciones Rápidas */}
          <div className="pt-4 border-t border-gray-100">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-3">
              Colecciones
            </span>
            <div className="space-y-2 text-xs">
              <Link
                href="/catalogo?category=Plantas%20de%20Interior"
                onClick={closeMobileMenu}
                className="block text-gray-600 hover:text-accent py-1.5"
              >
                🌿 Plantas de Interior
              </Link>
              <Link
                href="/catalogo?category=Plantas%20de%20Exterior"
                onClick={closeMobileMenu}
                className="block text-gray-600 hover:text-accent py-1.5"
              >
                ☀️ Plantas de Exterior
              </Link>
              <Link
                href="/catalogo?category=Macetas"
                onClick={closeMobileMenu}
                className="block text-gray-600 hover:text-accent py-1.5"
              >
                🏺 Macetas de Colección
              </Link>
              <Link
                href="/catalogo?category=Herramientas"
                onClick={closeMobileMenu}
                className="block text-gray-600 hover:text-accent py-1.5"
              >
                🪴 Herramientas & Sustratos
              </Link>
            </div>
          </div>
        </div>

        {/* Footer del Drawer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider py-3 rounded-2xl shadow-sm hover:bg-[#1ebd59] transition"
          >
            <MessageCircle size={16} /> Consultar por WhatsApp
          </a>

          <Link
            href="/admin"
            onClick={closeMobileMenu}
            className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-600 font-medium py-1"
          >
            <ShieldCheck size={13} /> Acceso Administrativo
          </Link>
        </div>
      </div>

      {/* CARRITO SIDEBAR (SLIDE-OUT) */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleCart}
      />

      <div
        ref={cartRef} role="dialog" aria-modal={isCartOpen || undefined} aria-label="Tu carrito" tabIndex={-1} inert={!isCartOpen} aria-hidden={!isCartOpen} style={{ visibility: isCartOpen ? "visible" : "hidden" }}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-surface shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cabecera Carrito */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-serif font-bold flex items-center gap-2 text-ink">
            <ShoppingBag className="text-accent" size={20} /> Tu Carrito ({cartCount})
          </h2>
          <button
            onClick={toggleCart}
            aria-label="Cerrar carrito"
            className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* INFORMACIÓN DE ENVÍO Y FLETE */}
        <div className="bg-canvas p-3.5 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-700 text-center flex items-center justify-center gap-2">
            <Truck size={16} className="text-accent shrink-0" />
            <span>Los costos de envío por agencia son asumidos por el comprador</span>
          </p>
        </div>

        {/* Lista de Items */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
              <ShoppingBag size={48} className="text-gray-300 mb-4" />
              <p className="text-lg font-serif font-bold text-gray-800">Tu carrito está vacío</p>
              <p className="text-gray-500 text-xs mt-2 max-w-xs">Agrega algunos ejemplares para darle vida a tu hogar.</p>
              <button
                onClick={toggleCart}
                className="mt-6 px-6 py-2.5 bg-emerald-100 text-accent text-xs font-bold uppercase tracking-wider rounded-full hover:bg-emerald-200 transition"
              >
                Seguir explorando
              </button>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={`${item.id}-${item.selectedSize || index}`} className="flex gap-4 items-center bg-canvas p-3.5 rounded-2xl border border-line">
                <img
                  src={item.image_url || 'https://via.placeholder.com/150'}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl shadow-sm border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif font-bold text-sm text-gray-900 truncate">{item.name}</h4>
                  {item.selectedSize && (
                    <span className="text-[10px] text-gray-500 bg-gray-200/80 font-medium px-2 py-0.5 rounded-full inline-block mt-0.5">
                      {item.selectedSize}
                    </span>
                  )}
                  <p className="text-accent font-bold text-sm mt-1">S/ {item.price.toFixed(2)}</p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-surface border border-gray-200 rounded-full px-2.5 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
                        aria-label="Disminuir cantidad"
                        className="text-gray-500 hover:text-ink transition"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                        disabled={item.quantity >= item.stock}
                        aria-label="Aumentar cantidad"
                        className="text-gray-500 hover:text-ink transition disabled:opacity-30"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id, item.selectedSize)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Eliminar"
                      aria-label={`Eliminar ${item.name} del carrito`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total y Checkout */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-surface shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 text-sm font-light">Subtotal ({cartCount} ítems)</span>
              <span className="text-2xl font-black text-gray-900">S/ {cartTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={handleProceedToCheckout}
              className="w-full flex items-center justify-center gap-2 bg-[#18181b] hover:bg-[#27272a] text-white font-bold text-xs uppercase tracking-widest py-4 rounded-2xl transition shadow-xl"
            >
              Proceder al Pago <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
