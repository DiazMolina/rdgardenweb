'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  stock: number;
  selectedSize?: string;
};

export type ToastState = {
  show: boolean;
  product: any;
  size?: string;
};

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  addToCart: (product: any, selectedSize?: string) => void;
  removeFromCart: (id: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number, size?: string) => void;
  toggleCart: () => void;
  cartTotal: number;
  cartCount: number;
  clearCart: () => void;
  toast: ToastState;
  hideToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, product: null });

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('rd-cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing cart", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('rd-cart', JSON.stringify(items));
    }
  }, [items, isMounted]);

  const showNotification = (product: any, size?: string) => {
    setToast({ show: true, product, size });
    setTimeout(() => {
      setToast({ show: false, product: null });
    }, 4000);
  };

  const hideToast = () => {
    setToast({ show: false, product: null });
  };

  const addToCart = (product: any, selectedSize?: string) => {
    setItems(prev => {
      const cartItemId = selectedSize ? `${product.id}-${selectedSize}` : product.id;

      const existing = prev.find(i => (i.selectedSize ? `${i.id}-${i.selectedSize}` : i.id) === cartItemId);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(i => (i.selectedSize ? `${i.id}-${i.selectedSize}` : i.id) === cartItemId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1, selectedSize }];
    });

    showNotification(product, selectedSize);
  };

  const removeFromCart = (id: string, size?: string) => {
    const cartItemId = size ? `${id}-${size}` : id;
    setItems(prev => prev.filter(i => (i.selectedSize ? `${i.id}-${i.selectedSize}` : i.id) !== cartItemId));
  };

  const updateQuantity = (id: string, quantity: number, size?: string) => {
    const cartItemId = size ? `${id}-${size}` : id;

    if (quantity <= 0) {
      removeFromCart(id, size);
      return;
    }
    setItems(prev => {
      return prev.map(i => {
        if ((i.selectedSize ? `${i.id}-${i.selectedSize}` : i.id) === cartItemId) {
          const newQty = quantity > i.stock ? i.stock : quantity;
          return { ...i, quantity: newQty };
        }
        return i;
      });
    });
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const clearCart = () => {
    setItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rd-cart');
    }
  };

  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      isCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      toggleCart,
      cartTotal,
      cartCount,
      clearCart,
      toast,
      hideToast
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
