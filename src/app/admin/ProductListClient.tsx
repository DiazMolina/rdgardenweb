'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteProduct, updateProductStock, toggleProductVisibility } from './actions';
import { Trash2, Pencil, Search, Filter, Plus, Minus, Eye, EyeOff, Check, Loader2 } from 'lucide-react';

export default function ProductListClient({ products: initialProducts }: { products: any[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [visibilityFilter, setVisibilityFilter] = useState<'Todas' | 'Publicados' | 'Pausados'>('Todas');

  // Control de estado de guardado por cada producto
  const [updatingStock, setUpdatingStock] = useState<Record<string, boolean>>({});
  const [updatingVisibility, setUpdatingVisibility] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sincronizar estado cuando initialProducts se actualice desde el servidor
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // Obtener lista de categorías únicas para el filtro
  const categoriesList = ['Todas', ...Array.from(new Set(products.map(p => p.category || 'Plantas de Interior')))];

  // Filtrado dinámico
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || (p.category || 'Plantas de Interior') === selectedCategory;
    
    const isPub = p.is_published !== false;
    const matchesVisibility = visibilityFilter === 'Todas' || 
                              (visibilityFilter === 'Publicados' && isPub) || 
                              (visibilityFilter === 'Pausados' && !isPub);

    return matchesSearch && matchesCategory && matchesVisibility;
  });

  // Manejo de cambio de stock rápido (+ / - / input)
  const handleStockChange = async (productId: string, newStock: number) => {
    const validStock = Math.max(0, newStock);
    
    // Optimistic update
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: validStock } : p));
    setUpdatingStock(prev => ({ ...prev, [productId]: true }));

    try {
      await updateProductStock(productId, validStock);
    } catch (err) {
      console.error('Error actualizando stock:', err);
      alert('Error al actualizar el stock en la base de datos.');
    } finally {
      setUpdatingStock(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Manejo de alternar visibilidad (Publicado / Pausado)
  const handleToggleVisibility = async (productId: string, currentPublished: boolean) => {
    const nextState = !currentPublished;

    // Optimistic update
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_published: nextState } : p));
    setUpdatingVisibility(prev => ({ ...prev, [productId]: true }));

    try {
      await toggleProductVisibility(productId, nextState);
    } catch (err) {
      console.error('Error actualizando visibilidad:', err);
      alert('Error al cambiar la visibilidad.');
    } finally {
      setUpdatingVisibility(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Manejo de eliminación automática e instantánea (optimistic update)
  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente "${productName}"?`)) {
      return;
    }

    const previousProducts = products;
    // Eliminación optimista: desaparece al instante de la tabla sin esperar recarga manual
    setProducts(prev => prev.filter(p => p.id !== productId));
    setDeletingId(productId);

    try {
      await deleteProduct(productId);
      router.refresh();
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      alert('Error: no se pudo eliminar el producto de la base de datos.');
      // Revertir si ocurrió un error en el servidor
      setProducts(previousProducts);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-surface rounded-2xl shadow-sm overflow-hidden border border-gray-100">

      {/* BARRA DE BÚSQUEDA Y FILTROS RÁPIDOS EN ADMIN */}
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">

        {/* Buscador de productos */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o especie..."
            className="w-full pl-10 pr-4 py-2 bg-surface border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600"
          />
        </div>

        {/* Filtros por Categoría y por Visibilidad */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Filtro Visibilidad */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-bold text-gray-600">
            {(['Todas', 'Publicados', 'Pausados'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setVisibilityFilter(tab)}
                className={`px-3 py-1 rounded-lg transition ${
                  visibilityFilter === tab
                    ? 'bg-surface text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Filtro por Categoría */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-surface outline-none cursor-pointer"
            >
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-bold shrink-0">
            {filteredProducts.length} de {products.length}
          </span>
        </div>

      </div>

      {/* TABLA DE PRODUCTOS CON EDICIÓN DE STOCK EN LÍNEA & INTERRUPTOR DE VISIBILIDAD */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold">Producto</th>
              <th className="p-4 font-semibold">Categoría</th>
              <th className="p-4 font-semibold">Precio</th>
              <th className="p-4 font-semibold text-center">Stock en Línea [+][-]</th>
              <th className="p-4 font-semibold text-center">Visibilidad Catálogo</th>
              <th className="p-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((product) => {
              const isPublished = product.is_published !== false;
              const isStockLoading = updatingStock[product.id];
              const isVisLoading = updatingVisibility[product.id];

              return (
                <tr key={product.id} className={`hover:bg-gray-50/80 transition ${!isPublished ? 'bg-amber-50/30' : ''}`}>
                  
                  {/* Foto y Nombre */}
                  <td className="p-4 flex items-center gap-4">
                    <img
                      src={product.image_url || 'https://via.placeholder.com/100'}
                      alt={product.name}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800 text-sm">{product.name}</p>
                        {product.badge && (
                          <span className="bg-[#0F281E] text-emerald-200 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate max-w-xs">{product.description}</p>
                    </div>
                  </td>

                  {/* Categoría */}
                  <td className="p-4 text-xs font-medium text-gray-500">
                    <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                      {product.category || 'Plantas de Interior'}
                    </span>
                  </td>

                  {/* Precio en Soles */}
                  <td className="p-4 font-bold text-gray-900 text-sm">
                    S/ {Number(product.price).toFixed(2)}
                  </td>

                  {/* CONTROL RÁPIDO DE STOCK EN LÍNEA */}
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center justify-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-200 shadow-2xs">
                      
                      {/* Botón Decrementar [-] */}
                      <button
                        type="button"
                        onClick={() => handleStockChange(product.id, product.stock - 1)}
                        disabled={product.stock <= 0 || isStockLoading}
                        aria-label={`Disminuir stock de ${product.name}`}
                        className="w-7 h-7 flex items-center justify-center bg-surface hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-surface text-gray-700 font-bold rounded-lg border border-gray-200 transition cursor-pointer shadow-xs"
                        title="Reducir stock en 1"
                      >
                        <Minus size={13} />
                      </button>

                      {/* Input Numérico Directo */}
                      <input
                        type="number"
                        min="0"
                        value={product.stock}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) {
                            handleStockChange(product.id, val);
                          }
                        }}
                        className="w-12 text-center text-xs font-mono font-bold text-gray-900 bg-surface py-1 px-1 rounded-md border border-gray-200 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        title="Editar stock directamente"
                      />

                      {/* Botón Incrementar [+] */}
                      <button
                        type="button"
                        onClick={() => handleStockChange(product.id, product.stock + 1)}
                        disabled={isStockLoading}
                        aria-label={`Aumentar stock de ${product.name}`}
                        className="w-7 h-7 flex items-center justify-center bg-surface hover:bg-gray-200 text-gray-700 font-bold rounded-lg border border-gray-200 transition cursor-pointer shadow-xs"
                        title="Aumentar stock en 1"
                      >
                        <Plus size={13} />
                      </button>

                      {/* Badge de Estado de Stock */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ml-1 ${
                        product.stock > 10 ? 'bg-emerald-100 text-accent' :
                        product.stock > 0 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 0 ? `${product.stock} un.` : 'Agotado'}
                      </span>
                    </div>
                  </td>

                  {/* INTERRUPTOR DE VISIBILIDAD (PUBLICADO / PAUSADO EN ACLIMATACIÓN) */}
                  <td className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(product.id, isPublished)}
                      disabled={isVisLoading}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                        isPublished
                          ? 'bg-emerald-100 hover:bg-emerald-200 text-accent border border-emerald-200'
                          : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200'
                      }`}
                      title={isPublished ? 'Haz clic para pausar (ocultar de la tienda durante aclimatación o propagación)' : 'Haz clic para publicar en el catálogo de la tienda'}
                    >
                      {isVisLoading ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : isPublished ? (
                        <Eye size={13} className="text-accent" />
                      ) : (
                        <EyeOff size={13} className="text-amber-700" />
                      )}
                      <span>{isPublished ? 'Publicado' : 'Pausado (Aclim.)'}</span>
                    </button>
                  </td>

                  {/* Acciones */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/edit/${product.id}`}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition"
                        title="Editar Ficha Completa & Fotos"
                      >
                        <Pencil size={18} />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        disabled={deletingId === product.id}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition cursor-pointer disabled:opacity-40"
                        title="Eliminar producto"
                      >
                        {deletingId === product.id ? (
                          <Loader2 size={18} className="animate-spin text-red-500" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
            
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500 text-sm">
                  No hay productos que coincidan con la búsqueda o filtro seleccionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
