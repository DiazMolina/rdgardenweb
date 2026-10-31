
import { requireAdmin } from '@/lib/security/admin';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { addSlide, deleteSlide, updateSlide } from './actions';
import AdminNav from '@/components/Admin/AdminNav';
import { Plus, Trash2, Images, Save, Sparkles } from 'lucide-react';
import { Suspense } from 'react';

async function CarouselAdminContent() {
  await requireAdmin();
  const { data: slides } = await supabaseAdmin
    .from('hero_slides')
    .select('*')
    .order('sort_order', { ascending: true });

  return (
    <div className="space-y-8">

      {/* FORMULARIO AGREGAR NUEVA DIAPOSITIVA AL CARRUSEL */}
      <div className="bg-surface p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-accent" size={22} />
          <h2 className="text-lg font-bold text-gray-800">
            Añadir Nueva Diapositiva / Slide al Carrusel
          </h2>
        </div>

        <form action={addSlide} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Badge / Etiqueta Superior (ej: "Lotes Limitados")
              </label>
              <input
                type="text"
                name="badge_text"
                className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                placeholder="Ej. Lotes Limitados"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Título Principal (ej: "Monsteras & Aráceas") *
              </label>
              <input
                type="text"
                name="title"
                required
                className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                placeholder="Ej. Monsteras & Aráceas"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Subtítulo Cursiva (ej: "Edición Especial")
              </label>
              <input
                type="text"
                name="subtitle"
                className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                placeholder="Ej. Edición Especial"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Texto del Botón (ej: "Explorar Tienda")
              </label>
              <input
                type="text"
                name="button_text"
                defaultValue="Explorar Tienda"
                className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                placeholder="Ej. Explorar Tienda"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Descripción Completa
            </label>
            <textarea
              name="description"
              rows={2}
              className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600"
              placeholder="Ej. Descubre especies con patrones de variegación únicos y hojas de gran tamaño."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                URL Imagen de Fondo *
              </label>
              <input
                type="url"
                name="image_url"
                required
                className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Orden de Aparición
              </label>
              <input
                type="number"
                name="sort_order"
                defaultValue={1}
                className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#0F281E] hover:bg-emerald-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-md flex justify-center items-center gap-2"
          >
            <Plus size={18} /> Crear Diapositiva
          </button>
        </form>
      </div>

      {/* LISTADO Y EDICIÓN DIRECTA DE CADA SLIDE DEL CARRUSEL */}
      <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Images size={20} className="text-accent" /> Diapositivas en Uso (Haz clic en Guardar para actualizar los textos)
          </h2>
          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-bold">
            Total: {slides?.length || 0}
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {slides?.map((slide) => (
            <div key={slide.id} className="p-6 hover:bg-gray-50/80 transition">

              <form action={async (formData) => {
                'use server';
                await updateSlide(slide.id, formData);
              }} className="space-y-4">

                <div className="flex flex-col lg:flex-row gap-6 items-start">

                  {/* Vista Previa Imagen */}
                  <div className="w-full lg:w-56 h-40 shrink-0 relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-sm">
                    <img
                      src={slide.image_url}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-[#0F281E] text-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                      Posición #{slide.sort_order}
                    </span>
                  </div>

                  {/* Formulario de Edición de Textos */}
                  <div className="flex-1 space-y-4 w-full">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Badge (Ej: "Lotes Limitados")</label>
                        <input
                          type="text"
                          name="badge_text"
                          defaultValue={slide.badge_text || ''}
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Título Principal (Ej: "Monsteras & Aráceas")</label>
                        <input
                          type="text"
                          name="title"
                          defaultValue={slide.title}
                          required
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-serif font-bold text-gray-900 outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Subtítulo (Ej: "Edición Especial")</label>
                        <input
                          type="text"
                          name="subtitle"
                          defaultValue={slide.subtitle || ''}
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-accent outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Texto del Botón (Ej: "Explorar Tienda")</label>
                        <input
                          type="text"
                          name="button_text"
                          defaultValue={slide.button_text || 'Explorar Tienda'}
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Descripción Completa</label>
                      <textarea
                        name="description"
                        rows={2}
                        defaultValue={slide.description || ''}
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs text-gray-600 outline-none focus:border-emerald-600"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">URL Imagen de Fondo</label>
                        <input
                          type="url"
                          name="image_url"
                          defaultValue={slide.image_url}
                          required
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-mono outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Orden de Aparición</label>
                        <input
                          type="number"
                          name="sort_order"
                          defaultValue={slide.sort_order}
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                  </div>

                </div>

                {/* Acciones Guardar / Eliminar */}
                <div className="flex justify-end items-center gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm"
                  >
                    <Save size={16} /> Guardar Cambios
                  </button>

                  <form action={deleteSlide.bind(null, slide.id)}>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold uppercase tracking-wider transition"
                      title="Eliminar Slide"
                    >
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </form>
                </div>

              </form>

            </div>
          ))}

          {(!slides || slides.length === 0) && (
            <div className="p-8 text-center text-gray-500 text-sm">
              No hay imágenes registradas en el carrusel. ¡Agrega una nueva arriba!
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default function AdminCarouselPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <AdminNav />
        <Suspense fallback={<div className="p-12 text-center text-gray-400">Cargando editor del carrusel...</div>}>
          <CarouselAdminContent />
        </Suspense>
      </div>
    </div>
  );
}
