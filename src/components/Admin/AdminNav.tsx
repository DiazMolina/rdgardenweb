'use client';

import React from 'react';
import { logout } from '@/app/login/actions';
import ThemeToggle from '../ThemeToggle';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, ShoppingBag, Layers, Home, Plus, Images, Settings, ShieldCheck } from 'lucide-react';

export default function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: 'Productos', icon: <Package size={18} /> },
    { href: '/admin/orders', label: 'Pedidos / Órdenes', icon: <ShoppingBag size={18} /> },
    { href: '/admin/categories', label: 'Categorías', icon: <Layers size={18} /> },
    { href: '/admin/carousel', label: 'Banner Carrusel', icon: <Images size={18} /> },
    { href: '/admin/settings', label: 'Textos & Ajustes', icon: <Settings size={18} /> },
    { href: '/admin/privacy', label: 'Políticas & Legal', icon: <ShieldCheck size={18} /> },
  ];

  return (
    <div className="flex flex-wrap justify-between items-center bg-surface p-6 rounded-2xl shadow-sm mb-8 border border-gray-100 gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-[#0F281E] text-white shadow-md'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-3"><ThemeToggle /><form action={logout}><button className="text-xs underline p-2">Cerrar sesión</button></form>
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-600 hover:text-accent px-4 py-2.5 bg-gray-50 rounded-xl transition text-xs font-bold uppercase tracking-wider"
        >
          <Home size={16} /> Ir a la Tienda
        </Link>
        <Link
          href="/admin/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition shadow-md text-xs font-bold uppercase tracking-wider"
        >
          <Plus size={16} /> Nuevo Producto
        </Link>
      </div>
    </div>
  );
}
