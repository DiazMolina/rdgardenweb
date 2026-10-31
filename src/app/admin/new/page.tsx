
import { requireAdmin } from '@/lib/security/admin';
import { addProduct } from '../actions';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Suspense } from 'react';
import ProductPhotoInputs from '@/components/Admin/ProductPhotoInputs';

async function NewProductContent() {
  await requireAdmin();
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('name')
    .order('name', { ascending: true });

  return (
    <div className="bg-surface p-8 rounded-xl shadow-sm">
      <form action={addProduct} className="space-y-6">

        {/* Nombre */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="Ej. Aglaonema Green Leopard"
          />
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción Breve</label>
          <textarea
            name="description"
            id="description"
            rows={3}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="Descripción detallada de la planta..."
          ></textarea>
        </div>

        {/* Precios (Oferta y Original), Stock, Categoría, Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-emerald-800 font-bold mb-1">
              Precio Actual (S/)
            </label>
            <input
              type="number"
              step="0.01"
              name="price"
              id="price"
              required
              className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition font-bold"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="original_price" className="block text-sm font-medium text-gray-500 mb-1">
              Precio Antes (Tachado)
            </label>
            <input
              type="number"
              step="0.01"
              name="original_price"
              id="original_price"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition placeholder:text-gray-300"
              placeholder="Opcional (Ej. 85.00)"
            />
          </div>

          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input
              type="number"
              name="stock"
              id="stock"
              required
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Cantidad"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              name="category"
              id="category"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-surface"
            >
              {categories?.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
              {(!categories || categories.length === 0) && (
                <option value="Plantas de Interior">Plantas de Interior</option>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="badge" className="block text-sm font-medium text-gray-700 mb-1">Etiqueta / Badge</label>
            <input
              type="text"
              name="badge"
              id="badge"
              defaultValue="Exótica"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Ej: Exótica, Rara, Nueva"
            />
          </div>
        </div>

        {/* Tamaños y Opciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div>
            <label htmlFor="sizes" className="block text-sm font-medium text-gray-700 mb-1">Opciones / Tamaños (Separados por coma)</label>
            <input
              type="text"
              name="sizes"
              id="sizes"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Ej: Maceta 4, Maceta 6, Maceta 8"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-900 block">Visibilidad en Catálogo</span>
              <span className="text-[11px] text-gray-500">¿Mostrar inmediatamente en la tienda web?</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="is_published" value="true" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* GALERÍA DE MÚLTIPLES FOTOS */}
        <ProductPhotoInputs />

        <hr className="border-gray-100 my-6" />

        {/* SECCIÓN DETALLES AVANZADOS */}
        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Información de la Ficha Técnica</h3>

        <div>
          <label htmlFor="care_instructions" className="block text-sm font-medium text-gray-700 mb-1">🍃 Detalles & Cuidados</label>
          <textarea
            name="care_instructions"
            id="care_instructions"
            rows={3}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="Luz, riego, humedad recomendada..."
          ></textarea>
        </div>

        <div>
          <label htmlFor="shipping_info" className="block text-sm font-medium text-gray-700 mb-1">🚚 Envíos & Empaque Térmico</label>
          <textarea
            name="shipping_info"
            id="shipping_info"
            rows={3}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="Días de despacho y tipo de empaque..."
          ></textarea>
        </div>

        <div>
          <label htmlFor="faq" className="block text-sm font-medium text-gray-700 mb-1">❓ Preguntas Frecuentes / Garantía</label>
          <textarea
            name="faq"
            id="faq"
            rows={3}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="Política de reclamos y reemplazos..."
          ></textarea>
        </div>

        <hr className="border-gray-100 pt-4" />

        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition shadow-md"
        >
          <Save size={20} />
          Guardar Producto
        </button>
      </form>
    </div>
  );
}

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Crear Nuevo Producto</h1>
          <Link href="/admin" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition text-sm">
            <ArrowLeft size={18} /> Volver al panel
          </Link>
        </div>

        <Suspense fallback={<div className="p-12 text-center text-gray-400">Cargando formulario...</div>}>
          <NewProductContent />
        </Suspense>

      </div>
    </div>
  );
}
