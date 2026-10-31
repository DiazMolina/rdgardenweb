
import { requireAdmin } from '@/lib/security/admin';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { updateSiteSettings } from './actions';
import AdminNav from '@/components/Admin/AdminNav';
import { 
  Settings, 
  Save, 
  Type, 
  MessageSquare, 
  MessageCircle, 
  PackageCheck, 
  QrCode, 
  Building2, 
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { Suspense } from 'react';

async function SettingsAdminContent() {
  await requireAdmin();
  const { data: settingsData } = await supabaseAdmin
    .from('site_settings')
    .select('*');

  // Convert Array of Key-Value to an Object
  const settings: Record<string, string> = {};
  settingsData?.forEach(item => {
    settings[item.key] = item.value;
  });

  return (
    <div className="bg-surface p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 max-w-4xl mx-auto">

      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2">
          <Settings className="text-accent" size={24} />
          <div>
            <h2 className="text-xl font-bold text-gray-800">Editor de Textos y Configuración Global</h2>
            <p className="text-xs text-gray-500">Ajusta métodos de pago (Yape, Plin, Transferencia), WhatsApp y catálogo</p>
          </div>
        </div>

        <a
          href="/admin/privacy"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-tint text-accent hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold uppercase tracking-wider transition"
        >
          Editar Políticas & Legal →
        </a>
      </div>

      <form action={updateSiteSettings} className="space-y-8">

        {/* SECCIÓN PRINCIPAL: TELÉFONO Y WHATSAPP OFICIAL DE TODA LA WEB */}
        <div className="space-y-4 bg-tint/80 p-6 rounded-2xl border-2 border-emerald-300 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-3">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-ink flex items-center gap-2">
                <Smartphone size={20} className="text-accent" /> Teléfono y WhatsApp Oficial de Toda la Web
              </h3>
              <p className="text-xs text-emerald-900/80 mt-1">
                Este número rige en <strong>toda la web</strong>: botón de consultas en el Navbar, ficha de cada planta, catálogo, recepción y checkout de pedidos por WhatsApp (+51...) y avisos legales.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full shrink-0 w-fit">
              Centralizado
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">
                Número Telefónico / Celular WhatsApp *
              </label>
              <input
                type="text"
                name="contact_phone"
                defaultValue={settings['contact_phone'] || '+51 997 966 231'}
                placeholder="+51 997 966 231"
                required
                className="w-full p-3 border-2 border-emerald-300 focus:border-emerald-700 rounded-xl text-sm font-bold font-mono outline-none bg-surface text-gray-900"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Puedes ingresarlo como <code>997966231</code> o <code>+51 997 966 231</code>. El sistema lo formateará automáticamente en toda la web.
              </p>
            </div>

            <div className="bg-surface/90 p-4 rounded-xl border border-emerald-200 text-xs text-gray-600 flex flex-col justify-center space-y-1.5">
              <span className="font-bold text-ink flex items-center gap-1.5 text-xs">
                <CheckCircle2 size={15} className="text-accent" /> Cobertura automática garantizada:
              </span>
              <ul className="text-[11px] list-disc list-inside space-y-1 text-gray-600">
                <li>Botón &quot;Consultar por WhatsApp&quot; en menú Navbar</li>
                <li>Botón &quot;Consultar foto real por WhatsApp&quot; en cada planta</li>
                <li>Apertura automática de chat y envío de órdenes en el Checkout</li>
                <li>Recepción de vouchers y confirmaciones de pago</li>
                <li>Teléfono oficial citado en Políticas y Términos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* SECCIÓN MÉTODOS DE PAGO PERÚ (ACTIVAR / DESACTIVAR & EDITAR) */}
        <div className="space-y-6 bg-slate-50/80 p-6 rounded-2xl border border-slate-200">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <QrCode size={20} className="text-accent" /> Configuración de Métodos de Pago en Tienda
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Activa o desactiva qué opciones de pago ven tus clientes en el Checkout y edita sus números de celular o cuentas bancarias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* TARJETA YAPE */}
            <div className="bg-surface p-5 rounded-2xl border-2 border-purple-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-black text-base text-[#742284] flex items-center gap-1.5">
                  <Smartphone size={18} /> YAPE
                </span>
                <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Billetera</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  Estado en Tienda
                </label>
                <select
                  name="payment_yape_enabled"
                  defaultValue={settings['payment_yape_enabled'] !== 'false' ? 'true' : 'false'}
                  className="w-full p-2.5 border border-purple-200 rounded-xl text-xs font-bold outline-none focus:border-purple-600 bg-surface cursor-pointer"
                >
                  <option value="true">✅ Activo (Visible en Checkout)</option>
                  <option value="false">❌ Desactivado (Ocultar)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  Número de Celular Yape
                </label>
                <input
                  type="text"
                  name="payment_yape_number"
                  defaultValue={settings['payment_yape_number'] || settings['contact_phone'] || '997 966 231'}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-purple-600 bg-surface"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  Titular / A Nombre de
                </label>
                <input
                  type="text"
                  name="payment_yape_name"
                  defaultValue={settings['payment_yape_name'] || 'RD Garden'}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-purple-600 bg-surface"
                />
              </div>
            </div>

            {/* TARJETA PLIN */}
            <div className="bg-surface p-5 rounded-2xl border-2 border-cyan-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-black text-base text-[#00A4D3] flex items-center gap-1.5">
                  <Smartphone size={18} /> PLIN
                </span>
                <span className="text-[10px] font-bold bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full">Billetera</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  Estado en Tienda
                </label>
                <select
                  name="payment_plin_enabled"
                  defaultValue={settings['payment_plin_enabled'] !== 'false' ? 'true' : 'false'}
                  className="w-full p-2.5 border border-cyan-200 rounded-xl text-xs font-bold outline-none focus:border-cyan-600 bg-surface cursor-pointer"
                >
                  <option value="true">✅ Activo (Visible en Checkout)</option>
                  <option value="false">❌ Desactivado (Ocultar)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  Número de Celular Plin
                </label>
                <input
                  type="text"
                  name="payment_plin_number"
                  defaultValue={settings['payment_plin_number'] || settings['contact_phone'] || '997 966 231'}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-cyan-600 bg-surface"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  Bancos Asociados
                </label>
                <input
                  type="text"
                  name="payment_plin_banks"
                  defaultValue={settings['payment_plin_banks'] || 'Interbank / Scotiabank / BBVA'}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-cyan-600 bg-surface"
                />
              </div>
            </div>

            {/* TARJETA TRANSFERENCIA BANCARIA */}
            <div className="bg-surface p-5 rounded-2xl border-2 border-emerald-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-ink flex items-center gap-1.5">
                  <Building2 size={18} className="text-accent" /> Transferencia
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-accent px-2 py-0.5 rounded-full">Bancos</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  Estado en Tienda
                </label>
                <select
                  name="payment_transfer_enabled"
                  defaultValue={settings['payment_transfer_enabled'] !== 'false' ? 'true' : 'false'}
                  className="w-full p-2.5 border border-emerald-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600 bg-surface cursor-pointer"
                >
                  <option value="true">✅ Activo (Visible en Checkout)</option>
                  <option value="false">❌ Desactivado (Ocultar)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  Nombre de Bancos / Título
                </label>
                <input
                  type="text"
                  name="payment_transfer_title"
                  defaultValue={settings['payment_transfer_title'] || 'BCP / BBVA / Interbank'}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600 bg-surface"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  Cuentas, CCI y Detalles
                </label>
                <input
                  type="text"
                  name="payment_transfer_details"
                  defaultValue={settings['payment_transfer_details'] || 'Transferencia Directa o CCI (Cuentas en Soles)'}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 bg-surface"
                />
              </div>
            </div>

          </div>
        </div>

        {/* SECCIÓN COSTO DE EMBALAJE (ACTIVAR / DESACTIVAR + COSTO) */}
        <div className="space-y-4 bg-amber-50/60 p-6 rounded-2xl border border-amber-100">
          <h3 className="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-2">
            <PackageCheck size={18} className="text-amber-700" /> Configuración de Costo de Embalaje Térmico
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Estado del Costo de Embalaje
              </label>
              <select
                name="packaging_fee_enabled"
                defaultValue={settings['packaging_fee_enabled'] || 'false'}
                className="w-full p-3 border border-amber-200 rounded-xl text-xs font-bold outline-none focus:border-amber-600 bg-surface cursor-pointer"
              >
                <option value="false">❌ Desactivado (Sin costo de embalaje)</option>
                <option value="true">✅ Activado (Cobrar embalaje por planta)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Costo de Embalaje por Planta (S/)
              </label>
              <input
                type="number"
                step="0.50"
                name="packaging_fee_per_item"
                defaultValue={settings['packaging_fee_per_item'] || '3.00'}
                className="w-full p-3 border border-amber-200 rounded-xl text-xs font-bold outline-none focus:border-amber-600 bg-surface"
                placeholder="Ej. 3.00"
              />
            </div>
          </div>
          <p className="text-[11px] text-amber-800/80 italic">
            Al estar activado, el sistema multiplicará este costo por el número total de plantas compradas en el checkout.
          </p>
        </div>

        {/* SECCIÓN 1: CINTA DE ANUNCIOS SUPERIOR */}
        <div className="space-y-4 bg-gray-50/80 p-6 rounded-2xl border border-gray-100">
          <h3 className="font-bold text-xs uppercase tracking-wider text-accent flex items-center gap-2">
            <MessageSquare size={16} /> Cinta de Anuncios Superior (Top Bar)
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Texto de la Barra Superior
            </label>
            <input
              type="text"
              name="announcement_bar"
              defaultValue={settings['announcement_bar'] || '🌍 ENVÍOS A TODO EL PAÍS • EMPAQUE TÉRMICO CERTIFICADO Y GARANTÍA DE LLEGADA VIVA 🌿'}
              className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 bg-surface"
            />
          </div>
        </div>

        {/* SECCIÓN 2: ENLACE Y COMUNIDAD DE WHATSAPP (GRUPO VIP) */}
        <div className="space-y-4 bg-tint/50 p-6 rounded-2xl border border-emerald-100">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-accent flex items-center gap-2">
              <MessageCircle size={16} className="text-[#25D366]" /> Banner Comunidad de WhatsApp (Grupo VIP)
            </h3>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 bg-surface px-3 py-1.5 rounded-xl border border-emerald-200">
              <input
                type="hidden"
                name="whatsapp_community_enabled"
                value="false"
              />
              <input
                type="checkbox"
                name="whatsapp_community_enabled"
                value="true"
                defaultChecked={settings['whatsapp_community_enabled'] !== 'false'}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
              <span>Mostrar Banner en Inicio</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Etiqueta / Badge Superior
              </label>
              <input
                type="text"
                name="whatsapp_community_badge"
                defaultValue={settings['whatsapp_community_badge'] || 'Grupo VIP de Plant Lovers'}
                required
                placeholder="Ej. Grupo VIP de Plant Lovers"
                className="w-full p-3 border border-emerald-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600 bg-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Título del Banner
              </label>
              <input
                type="text"
                name="whatsapp_community_title"
                defaultValue={settings['whatsapp_community_title'] || 'Comunidad Exclusiva en WhatsApp'}
                required
                placeholder="Ej. Comunidad Exclusiva en WhatsApp"
                className="w-full p-3 border border-emerald-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600 bg-surface"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Descripción / Mensaje de Invitación
            </label>
            <textarea
              name="whatsapp_community_description"
              rows={3}
              defaultValue={settings['whatsapp_community_description'] || 'Recibe primero las fotos de los nuevos lotes de plantas raras recién llegadas al invernadero, resuelve dudas de cultivo y comparte fotos de tus ejemplares.'}
              required
              placeholder="Descripción atractiva para unirse al grupo..."
              className="w-full p-3 border border-emerald-200 rounded-xl text-xs outline-none focus:border-emerald-600 bg-surface leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Enlace de WhatsApp o Grupo
              </label>
              <input
                type="text"
                name="whatsapp_link"
                defaultValue={(settings['whatsapp_link'] || '').replace('51987654321', '51997966231') || 'https://wa.me/51997966231?text=Hola!%20Me%20gustar%C3%ADa%20unirme%20a%20la%20comunidad%20de%20plantas%20de%20RD%20Garden'}
                required
                placeholder="https://wa.me/... o https://chat.whatsapp.com/..."
                className="w-full p-3 border border-emerald-200 rounded-xl text-xs font-mono outline-none focus:border-emerald-600 bg-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Texto del Botón de WhatsApp
              </label>
              <input
                type="text"
                name="whatsapp_button_text"
                defaultValue={settings['whatsapp_button_text'] || 'Únete a nuestra comunidad en WhatsApp'}
                required
                placeholder="Ej. Únete a nuestra comunidad en WhatsApp"
                className="w-full p-3 border border-emerald-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600 bg-surface"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: TÍTULOS DEL CATÁLOGO DE PRODUCTOS */}
        <div className="space-y-4 bg-gray-50/80 p-6 rounded-2xl border border-gray-100">
          <h3 className="font-bold text-xs uppercase tracking-wider text-accent flex items-center gap-2">
            <Type size={16} /> Sección del Catálogo General de Productos
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Título Principal del Catálogo
            </label>
            <input
              type="text"
              name="catalog_title"
              defaultValue={settings['catalog_title'] || 'Ejemplares Disponibles'}
              required
              className="w-full p-3 border border-gray-200 rounded-xl text-xs font-serif font-bold outline-none focus:border-emerald-600 bg-surface"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Subtítulo / Descripción del Catálogo
            </label>
            <textarea
              name="catalog_subtitle"
              rows={2}
              defaultValue={settings['catalog_subtitle'] || 'Cultivadas con nutrición balanceada y parámetros ambientales optimizados.'}
              className="w-full p-3 border border-gray-200 rounded-xl text-xs text-gray-600 outline-none focus:border-emerald-600 bg-surface"
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-[#0F281E] hover:bg-emerald-900 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition shadow-xl flex justify-center items-center gap-2 cursor-pointer"
        >
          <Save size={18} /> Guardar Todos los Ajustes
        </button>

      </form>

    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <AdminNav />
        <Suspense fallback={<div className="p-12 text-center text-gray-400">Cargando editor de ajustes...</div>}>
          <SettingsAdminContent />
        </Suspense>
      </div>
    </div>
  );
}
