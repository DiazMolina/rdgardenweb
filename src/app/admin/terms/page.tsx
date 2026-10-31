
import { requireAdmin } from '@/lib/security/admin';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { updateTermsSettings } from './actions';
import AdminNav from '@/components/Admin/AdminNav';
import { defaultTermsConfig } from '@/lib/termsDefaults';
import { cleanPhoneDigits, formatDisplayPhone } from '@/lib/storeContact';
import { 
  Scale, 
  Save, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Lock, 
  Truck, 
  CreditCard, 
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

async function TermsAdminContent({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const { saved } = await searchParams;

  const { data: settingsData } = await supabaseAdmin
    .from('site_settings')
    .select('*');

  const settings: Record<string, string> = {};
  settingsData?.forEach(item => {
    settings[item.key] = item.value;
  });

  const masterPhone = settings['contact_phone'] || '+51 997 966 231';
  const cleanMaster = cleanPhoneDigits(masterPhone);
  const formattedMaster = formatDisplayPhone(masterPhone);

  const getValue = (key: string) => {
    const val = settings[key] !== undefined && settings[key] !== '' 
      ? settings[key] 
      : (defaultTermsConfig[key] || '');
    return val
      .replace(/51987654321/g, cleanMaster)
      .replace(/51997966231/g, cleanMaster)
      .replace(/\+51\s*987\s*654\s*321/g, formattedMaster)
      .replace(/\+51\s*997\s*966\s*231/g, formattedMaster)
      .replace(/997\s*966\s*231/g, formattedMaster);
  };

  return (
    <div className="bg-surface p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-100 max-w-5xl mx-auto">
      
      {/* SUB-NAV LEGAL (TABS ENTRE TÉRMINOS Y PRIVACIDAD) */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
        <Link
          href="/admin/terms"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#0F281E] text-white shadow-sm"
        >
          <Scale size={15} /> Términos y Condiciones
        </Link>
        <Link
          href="/admin/privacy"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
        >
          <ShieldCheck size={15} /> Política de Privacidad
        </Link>
      </div>

      {/* HEADER DE GESTIÓN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-tint text-accent rounded-2xl">
            <Scale size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Editor de Términos y Condiciones de Compra
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Configura las condiciones de reserva de plantas vivas, límites de 24h, comisiones de pago y garantías
            </p>
          </div>
        </div>

        <Link
          href="/terminos-y-condiciones"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider transition border border-gray-200 shrink-0"
        >
          <ExternalLink size={14} /> Ver en la Tienda
        </Link>
      </div>

      {/* BANNER DE ÉXITO TRAS GUARDAR */}
      {saved === 'true' && (
        <div className="mb-8 p-4 bg-tint border border-emerald-200 text-emerald-900 rounded-2xl flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>¡Los Términos y Condiciones se actualizaron correctamente y están en vivo en la tienda!</span>
        </div>
      )}

      <form action={updateTermsSettings} className="space-y-10">

        {/* 1. CONFIGURACIÓN GENERAL / METADATOS */}
        <section className="bg-canvas p-6 sm:p-8 rounded-2xl border border-line space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
            <FileText size={18} className="text-accent" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900">
              Identidad y Encabezado de los Términos
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                Título Principal
              </label>
              <input
                type="text"
                name="terms_title"
                defaultValue={getValue('terms_title')}
                required
                className="w-full p-3 border border-gray-300 rounded-xl text-xs font-bold outline-none focus:border-emerald-600 bg-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                Fecha / Período Visible de Actualización
              </label>
              <input
                type="text"
                name="terms_last_updated"
                defaultValue={getValue('terms_last_updated')}
                required
                placeholder="Ej. Octubre 2026"
                className="w-full p-3 border border-gray-300 rounded-xl text-xs font-bold outline-none focus:border-emerald-600 bg-surface"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
              Párrafo Introductorio de Aceptación
            </label>
            <textarea
              name="terms_intro"
              rows={3}
              defaultValue={getValue('terms_intro')}
              required
              className="w-full p-3 border border-gray-300 rounded-xl text-xs text-gray-700 outline-none focus:border-emerald-600 bg-surface leading-relaxed"
            ></textarea>
          </div>
        </section>

        {/* 2. SECCIÓN 1: USO DE LA PLATAFORMA */}
        <section className="bg-gray-50/80 p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">1</span>
              Uso de la Plataforma y Mayoría de Edad (18 años)
            </h3>
            <span className="text-[11px] text-gray-400 font-light">Capacidad legal</span>
          </div>
          <p className="text-[11px] text-gray-500">
            Define la mayoría de edad requerida, cobertura geográfica (Lima y Perú) y derecho de cancelación de cuentas ante sospechas.
          </p>
          <textarea
            name="terms_section_platform"
            rows={5}
            defaultValue={getValue('terms_section_platform')}
            required
            className="w-full p-3.5 border border-gray-300 rounded-xl text-xs font-mono text-gray-800 outline-none focus:border-emerald-600 bg-surface leading-relaxed"
          ></textarea>
        </section>

        {/* 3. SECCIÓN 2: RESERVAS Y VARIABILIDAD BIOLÓGICA (PROTECCIÓN TIENDA) */}
        <section className="bg-amber-50/60 p-6 sm:p-8 rounded-2xl border border-amber-200 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px] font-bold">2</span>
              Reservas, Límite de 24 Horas y Variabilidad Biológica
            </h3>
            <span className="text-[11px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full">Protección Tienda</span>
          </div>
          <p className="text-[11px] text-amber-900/80">
            Establece que una reserva NO es venta confirmada, que el cliente tiene 24h para pagar antes de liberar el stock y que variaciones de follaje son naturales.
          </p>
          <textarea
            name="terms_section_reservations"
            rows={7}
            defaultValue={getValue('terms_section_reservations')}
            required
            className="w-full p-3.5 border border-amber-300 rounded-xl text-xs font-mono text-gray-800 outline-none focus:border-amber-600 bg-surface leading-relaxed"
          ></textarea>
        </section>

        {/* 4. SECCIÓN 3: PRECIOS, PAGOS Y COMISIÓN PASARELAS */}
        <section className="bg-gray-50/80 p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">3</span>
              Precios, Métodos de Pago y Comisión de Pasarelas (Link Izipay 5%)
            </h3>
            <span className="text-[11px] text-gray-400 font-light">Financiero</span>
          </div>
          <p className="text-[11px] text-gray-500">
            Precios en S/, métodos de transferencia/Yape, cargo del 5% si eligen pasarela con comisiones, y derecho a subsanar errores tipográficos de precio.
          </p>
          <textarea
            name="terms_section_pricing_payments"
            rows={6}
            defaultValue={getValue('terms_section_pricing_payments')}
            required
            className="w-full p-3.5 border border-gray-300 rounded-xl text-xs font-mono text-gray-800 outline-none focus:border-emerald-600 bg-surface leading-relaxed"
          ></textarea>
        </section>

        {/* 5. SECCIÓN 4: CANCELACIONES Y NO DEVOLUCIONES TRAS EMPAQUE */}
        <section className="bg-amber-50/60 p-6 sm:p-8 rounded-2xl border border-amber-200 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px] font-bold">4</span>
              Cancelaciones, No Devolución tras Empaque y Retención Fitosanitaria
            </h3>
            <span className="text-[11px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full">Protección Tienda</span>
          </div>
          <p className="text-[11px] text-amber-900/80">
            Cancelación libre solo mientras esté "Pendiente". Una vez pagada y acondicionada no hay devolución por mero cambio de opinión (estrés vegetal irreversible).
          </p>
          <textarea
            name="terms_section_cancellations"
            rows={6}
            defaultValue={getValue('terms_section_cancellations')}
            required
            className="w-full p-3.5 border border-amber-300 rounded-xl text-xs font-mono text-gray-800 outline-none focus:border-amber-600 bg-surface leading-relaxed"
          ></textarea>
        </section>

        {/* 6. SECCIÓN 5: DISPONIBILIDAD */}
        <section className="bg-gray-50/80 p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">5</span>
              Disponibilidad de Productos y Stock en Tiempo Real
            </h3>
            <span className="text-[11px] text-gray-400 font-light">Inventario</span>
          </div>
          <textarea
            name="terms_section_availability"
            rows={4}
            defaultValue={getValue('terms_section_availability')}
            required
            className="w-full p-3.5 border border-gray-300 rounded-xl text-xs font-mono text-gray-800 outline-none focus:border-emerald-600 bg-surface leading-relaxed"
          ></textarea>
        </section>

        {/* 7. SECCIÓN 6: GARANTÍA ARRIVE ALIVE (24 HORAS) */}
        <section className="bg-tint/50 p-6 sm:p-8 rounded-2xl border border-emerald-200 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">6</span>
              Garantía Arrive Alive y Requisitos de Reclamo (Límite 24 Horas)
            </h3>
            <span className="text-[11px] text-accent font-bold bg-emerald-100 px-2 py-0.5 rounded-full">Garantía Segura</span>
          </div>
          <p className="text-[11px] text-emerald-900/80">
            Exige video unboxing sin cortes en 24h. Exonera a la tienda de daños por trasplante, sol directo, quemaduras químicas o plagas del hogar del cliente.
          </p>
          <textarea
            name="terms_section_guarantee_claims"
            rows={7}
            defaultValue={getValue('terms_section_guarantee_claims')}
            required
            className="w-full p-3.5 border border-emerald-300 rounded-xl text-xs font-mono text-gray-800 outline-none focus:border-emerald-600 bg-surface leading-relaxed"
          ></textarea>
        </section>

        {/* 8. SECCIÓN 7: ENVÍOS Y COURIERS */}
        <section className="bg-gray-50/80 p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">7</span>
              Envíos, Terceros Couriers y Exclusión por Fuerza Mayor
            </h3>
            <span className="text-[11px] text-gray-400 font-light">Transporte</span>
          </div>
          <textarea
            name="terms_section_shipping_liability"
            rows={5}
            defaultValue={getValue('terms_section_shipping_liability')}
            required
            className="w-full p-3.5 border border-gray-300 rounded-xl text-xs font-mono text-gray-800 outline-none focus:border-emerald-600 bg-surface leading-relaxed"
          ></textarea>
        </section>

        {/* 9. SECCIÓN 8: LIMITACIÓN GENERAL DE RESPONSABILIDAD */}
        <section className="bg-gray-50/80 p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">8</span>
              Limitación General de Responsabilidad y Techo Indemnizatorio
            </h3>
            <span className="text-[11px] text-gray-400 font-light">Responsabilidad</span>
          </div>
          <textarea
            name="terms_section_limitation_liability"
            rows={5}
            defaultValue={getValue('terms_section_limitation_liability')}
            required
            className="w-full p-3.5 border border-gray-300 rounded-xl text-xs font-mono text-gray-800 outline-none focus:border-emerald-600 bg-surface leading-relaxed"
          ></textarea>
        </section>

        {/* 10. SECCIÓN 9: PROPIEDAD INTELECTUAL */}
        <section className="bg-gray-50/80 p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">9</span>
              Propiedad Intelectual y Contenidos de Catálogo
            </h3>
            <span className="text-[11px] text-gray-400 font-light">Derechos Reservados</span>
          </div>
          <textarea
            name="terms_section_intellectual_property"
            rows={5}
            defaultValue={getValue('terms_section_intellectual_property')}
            required
            className="w-full p-3.5 border border-gray-300 rounded-xl text-xs font-mono text-gray-800 outline-none focus:border-emerald-600 bg-surface leading-relaxed"
          ></textarea>
        </section>

        {/* 11. SECCIÓN 10: MODIFICACIONES Y LEY APLICABLE */}
        <section className="bg-gray-50/80 p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">10</span>
              Modificaciones y Ley Aplicable (Lima, Perú)
            </h3>
            <span className="text-[11px] text-gray-400 font-light">Jurisdicción</span>
          </div>
          <textarea
            name="terms_section_modifications_law"
            rows={5}
            defaultValue={getValue('terms_section_modifications_law')}
            required
            className="w-full p-3.5 border border-gray-300 rounded-xl text-xs font-mono text-gray-800 outline-none focus:border-emerald-600 bg-surface leading-relaxed"
          ></textarea>
        </section>

        {/* 12. CANAL DE ATENCIÓN DIRECTA */}
        <section className="bg-canvas p-6 sm:p-8 rounded-2xl border border-line space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900">
              Canal Oficial de Atención y Consultas de Términos
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
              Enlace / Número de WhatsApp Oficial
            </label>
            <input
              type="text"
              name="terms_contact_whatsapp"
              defaultValue={getValue('terms_contact_whatsapp')}
              required
              className="w-full p-3 border border-gray-300 rounded-xl text-xs font-mono outline-none focus:border-emerald-600 bg-surface"
            />
            <p className="text-[11px] text-gray-500 mt-1.5">
              Toda la atención de reservas, consultas de términos y soporte se coordina de manera directa e inmediata por WhatsApp.
            </p>
          </div>
        </section>

        {/* BOTÓN SUBMIT FIJO / DESTACADO */}
        <div className="sticky bottom-6 bg-surface/95 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-xl flex justify-between items-center gap-4">
          <p className="text-xs text-gray-500 font-medium hidden sm:block">
            Los cambios se guardan directamente en Supabase y aplican al instante en la tienda.
          </p>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0F281E] hover:bg-emerald-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-lg flex items-center justify-center gap-2 hover:scale-102"
          >
            <Save size={16} /> Guardar Términos y Condiciones
          </button>
        </div>

      </form>

    </div>
  );
}

export default function AdminTermsPage(props: {
  searchParams: Promise<{ saved?: string }>;
}) {
  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <AdminNav />
        <Suspense fallback={<div className="p-12 text-center text-gray-400">Cargando editor de términos...</div>}>
          <TermsAdminContent searchParams={props.searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
