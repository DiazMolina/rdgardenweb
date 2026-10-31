
import { requireAdmin } from '@/lib/security/admin';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Link from 'next/link';
import { addCategory, deleteCategory, updateCategory } from './actions';
import { Plus, Trash2, Home, ArrowLeft, Layers, Image as ImageIcon, Save, ArrowUpDown } from 'lucide-react';
import { Suspense } from 'react';

async function CategoriesAdminContent() {
  await requireAdmin();
  // Obtener categorías ordenadas por sort_order de forma ascendente
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* FORMULARIO CREAR CATEGORÍA */}
      <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1 h-fit">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={20} className="text-accent" /> Nueva Categoría
        </h2>

        <form action={addCategory} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre *</label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600"
              placeholder="Ej: Plantas Exóticas"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-bold text-gray-700 uppercase mb-1">Descripción Breve</label>
            <textarea
              name="description"
              id="description"
              rows={2}
              className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600"
              placeholder="Pequeño resumen..."
            ></textarea>
          </div>

          <div>
            <label htmlFor="image_url" className="block text-xs font-bold text-gray-700 uppercase mb-1">URL Imagen de Banner</label>
            <input
              type="url"
              name="image_url"
              id="image_url"
              className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600"
              placeholder="https://ejemplo.com/banner.jpg"
            />
          </div>

          <div>
            <label htmlFor="sort_order" className="block text-xs font-bold text-gray-700 uppercase mb-1">Orden de Aparición (1, 2, 3...)</label>
            <input
              type="number"
              name="sort_order"
              id="sort_order"
              defaultValue={1}
              className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#0F281E] hover:bg-emerald-900 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition shadow-md flex justify-center items-center gap-2"
          >
            <Plus size={18} /> Crear Categoría
          </button>
        </form>
      </div>

      {/* LISTA Y EDICIÓN/ORDENAMIENTO DE CATEGORÍAS */}
      <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ArrowUpDown size={18} className="text-accent" />
            <h2 className="text-lg font-bold text-gray-800">Categorías y Orden de Aparición</h2>
          </div>
          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-bold">
            Total: {categories?.length || 0}
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {categories?.map((cat) => (
            <div key={cat.id} className="p-6 hover:bg-gray-50/80 transition">

              <form action={async (formData) => {
                'use server';
                await updateCategory(cat.id, formData);
              }} className="space-y-4">

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">

                  {/* Imagen Preview */}
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 shrink-0">
                      <ImageIcon size={20} />
                    </div>
                  )}

                  {/* Campos Editables Inline */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-0.5">Nombre</label>
                        <input
                          type="text"
                          name="name"
                          defaultValue={cat.name}
                          required
                          className="w-full p-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-0.5">Orden (1, 2, 3...)</label>
                        <input
                          type="number"
                          name="sort_order"
                          defaultValue={cat.sort_order || 0}
                          className="w-full p-2 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-900 bg-tint/50 outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="description"
                        defaultValue={cat.description || ''}
                        className="w-full p-2 border border-gray-200 rounded-lg text-xs text-gray-600 outline-none focus:border-emerald-600"
                        placeholder="Descripción"
                      />

                      <input
                        type="url"
                        name="image_url"
                        defaultValue={cat.image_url || ''}
                        className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono outline-none focus:border-emerald-600"
                        placeholder="URL Imagen"
                      />
                    </div>
                  </div>

                </div>

                {/* Acciones Guardar / Eliminar */}
                <div className="flex justify-end items-center gap-3 pt-2 border-t border-gray-100">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-sm"
                  >
                    <Save size={14} /> Guardar Orden
                  </button>

                  <button
                    type="submit"
                    formAction={deleteCategory.bind(null, cat.id)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold uppercase tracking-wider transition"
                    title="Eliminar categoría"
                  >
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>

              </form>

            </div>
          ))}

          {categories?.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm">
              No hay categorías registradas. ¡Crea una nueva a la izquierda!
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default function CategoriesAdminPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header Admin */}
        <div className="flex justify-between items-center bg-surface p-6 rounded-2xl shadow-sm mb-8 border border-gray-100">
          <div className="flex items-center gap-3">
            <Layers className="text-gray-800" size={28} />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Categorías y Ordenamiento</h1>
              <p className="text-xs text-gray-500">Define el orden en el que aparecerán las colecciones en toda la tienda</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-green-600 px-4 py-2 bg-gray-50 rounded-lg transition text-xs font-bold uppercase tracking-wider">
              <ArrowLeft size={16} /> Volver a Productos
            </Link>
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-green-600 px-4 py-2 bg-gray-50 rounded-lg transition text-xs font-bold uppercase tracking-wider">
              <Home size={16} /> Ver Tienda
            </Link>
          </div>
        </div>

        <Suspense fallback={<div className="p-12 text-center text-gray-400">Cargando categorías...</div>}>
          <CategoriesAdminContent />
        </Suspense>

      </div>
    </div>
  );
}
