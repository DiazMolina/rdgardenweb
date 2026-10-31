import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseServer';
import { defaultTermsConfig } from '@/lib/termsDefaults';
import { cleanPhoneDigits, formatDisplayPhone } from '@/lib/storeContact';
import { 
  FileCheck, 
  ShieldCheck, 
  Leaf, 
  Clock, 
  MessageCircle,
  Scale,
  AlertCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Términos y Condiciones de Compra y Reservas | R&DGARDEN',
  description: 'Conoce los términos y condiciones de compra, reservas botánicas de ejemplares vivos y garantía Arrive Alive en R&D Garden.',
  robots: {
    index: true,
    follow: true,
  },
};

export default async function TerminosCondicionesPage() {
  const supabase = await createClient();

  const { data: settingsData } = await supabase
    .from('site_settings')
    .select('*');

  const settings: Record<string, string> = {};
  settingsData?.forEach(item => {
    settings[item.key] = item.value;
  });

  const masterPhone = settings['contact_phone'] || '+51 997 966 231';
  const cleanMaster = cleanPhoneDigits(masterPhone);
  const formattedMaster = formatDisplayPhone(masterPhone);

  const getSetting = (key: string) => {
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

  const title = getSetting('terms_title');
  const lastUpdated = getSetting('terms_last_updated');
  const intro = getSetting('terms_intro');
  const whatsappUrl = getSetting('terms_contact_whatsapp');

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink font-sans selection:bg-emerald-200">
      <Navbar />

      <main id="contenido" tabIndex={-1} className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full">
        
        {/* BREADCRUMB */}
        <nav className="flex items-center text-xs text-gray-500 mb-8 space-x-2">
          <Link href="/" className="hover:text-accent transition">Inicio</Link>
          <span>/</span>
          <span className="text-gray-400">Legal</span>
          <span>/</span>
          <span className="text-emerald-900 font-semibold">Términos y Condiciones</span>
        </nav>

        {/* CABECERA EDITORIAL */}
        <header className="mb-12 border-b border-line pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-widest mb-4">
            <Scale size={14} /> Marco Legal y Protección al Comprador R&DGARDEN
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-ink mb-4">
            {title}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-light max-w-3xl whitespace-pre-line">
            {intro}
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-gray-400">
            <span>Última actualización: <strong className="text-gray-600 font-medium">{lastUpdated}</strong></span>
            <span>•</span>
            <span>Válido para usuarios en Lima y envíos a todo el Perú</span>
          </div>
        </header>

        {/* TARJETAS RESUMEN DE SEGURIDAD CONTRACTUAL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-surface p-6 rounded-3xl border border-line shadow-sm">
            <Clock className="text-accent mb-3" size={24} />
            <h3 className="font-bold text-sm text-ink mb-1">Reservas con Límite de 24h</h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              El stock se reserva durante 24 horas continuas para coordinar el pago, asegurando la rotación sana de seres vivos.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-3xl border border-line shadow-sm">
            <Leaf className="text-accent mb-3" size={24} />
            <h3 className="font-bold text-sm text-ink mb-1">Garantía Arrive Alive (24h)</h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Empaque térmico y protocolo con video de unboxing para garantizar plantas sanas sin riesgo de disputas infundadas.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-3xl border border-line shadow-sm">
            <ShieldCheck className="text-accent mb-3" size={24} />
            <h3 className="font-bold text-sm text-ink mb-1">Transparencia y Respaldo</h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Reglas claras en precios, medios de pago (Yape, Plin, Transferencias) y límites de responsabilidad comercial.
            </p>
          </div>
        </div>

        {/* ARTÍCULO DE TÉRMINOS Y CONDICIONES */}
        <article className="space-y-10 text-sm text-gray-700 leading-relaxed font-light">

          {/* SECCIÓN 1: USO DE LA PLATAFORMA */}
          <section className="bg-surface p-8 sm:p-10 rounded-3xl border border-line shadow-sm">
            <h2 className="text-xl font-serif font-bold text-ink mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs font-bold">1</span>
              Uso de la Plataforma y Capacidad Legal
            </h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">
              {getSetting('terms_section_platform')}
            </div>
          </section>

          {/* SECCIÓN 2: RESERVAS */}
          <section id="reservas" className="bg-surface p-8 sm:p-10 rounded-3xl border border-line shadow-sm scroll-mt-24">
            <h2 className="text-xl font-serif font-bold text-ink mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs font-bold">2</span>
              Reservas de Especímenes Vivos y Variabilidad Biológica
            </h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">
              {getSetting('terms_section_reservations')}
            </div>
          </section>

          {/* SECCIÓN 3: PRECIOS Y PAGOS */}
          <section className="bg-surface p-8 sm:p-10 rounded-3xl border border-line shadow-sm">
            <h2 className="text-xl font-serif font-bold text-ink mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs font-bold">3</span>
              Precios, Métodos de Pago y Comisiones de Pasarelas Externas
            </h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">
              {getSetting('terms_section_pricing_payments')}
            </div>
          </section>

          {/* SECCIÓN 4: CANCELACIONES */}
          <section className="bg-surface p-8 sm:p-10 rounded-3xl border border-line shadow-sm">
            <h2 className="text-xl font-serif font-bold text-ink mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs font-bold">4</span>
              Cancelaciones, Modificaciones y Retención Fitosanitaria
            </h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">
              {getSetting('terms_section_cancellations')}
            </div>
          </section>

          {/* SECCIÓN 5: DISPONIBILIDAD */}
          <section className="bg-surface p-8 sm:p-10 rounded-3xl border border-line shadow-sm">
            <h2 className="text-xl font-serif font-bold text-ink mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs font-bold">5</span>
              Disponibilidad de Productos y Stock en Tiempo Real
            </h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">
              {getSetting('terms_section_availability')}
            </div>
          </section>

          {/* SECCIÓN 6: GARANTÍA ARRIVE ALIVE */}
          <section id="garantia" className="bg-surface p-8 sm:p-10 rounded-3xl border border-line shadow-sm scroll-mt-24">
            <h2 className="text-xl font-serif font-bold text-ink mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs font-bold">6</span>
              Garantía Arrive Alive y Procedimiento Obligatorio de Reclamos
            </h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">
              {getSetting('terms_section_guarantee_claims')}
            </div>
          </section>

          {/* SECCIÓN 7: ENVÍOS Y COURIERS */}
          <section className="bg-surface p-8 sm:p-10 rounded-3xl border border-line shadow-sm">
            <h2 className="text-xl font-serif font-bold text-ink mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs font-bold">7</span>
              Envíos, Transporte de Terceros y Fuerza Mayor
            </h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">
              {getSetting('terms_section_shipping_liability')}
            </div>
          </section>

          {/* SECCIÓN 8: LIMITACIÓN DE RESPONSABILIDAD */}
          <section className="bg-surface p-8 sm:p-10 rounded-3xl border border-line shadow-sm">
            <h2 className="text-xl font-serif font-bold text-ink mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs font-bold">8</span>
              Limitación General de Responsabilidad
            </h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">
              {getSetting('terms_section_limitation_liability')}
            </div>
          </section>

          {/* SECCIÓN 9: PROPIEDAD INTELECTUAL */}
          <section id="propiedad" className="bg-surface p-8 sm:p-10 rounded-3xl border border-line shadow-sm scroll-mt-24">
            <h2 className="text-xl font-serif font-bold text-ink mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs font-bold">9</span>
              Propiedad Intelectual y Fotografías Botánicas
            </h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">
              {getSetting('terms_section_intellectual_property')}
            </div>
          </section>

          {/* SECCIÓN 10: MODIFICACIONES Y LEY */}
          <section className="bg-surface p-8 sm:p-10 rounded-3xl border border-line shadow-sm">
            <h2 className="text-xl font-serif font-bold text-ink mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs font-bold">10</span>
              Modificaciones y Jurisdicción Aplicable
            </h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">
              {getSetting('terms_section_modifications_law')}
            </div>
          </section>

          {/* SECCIÓN 11: CONTACTO */}
          <section className="bg-gradient-to-br from-[#0F281E] to-[#123627] text-white p-8 sm:p-12 rounded-[2.5rem] shadow-xl">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-2">
                Atención y Consultas
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-4">
                ¿Tienes dudas sobre nuestros Términos y Condiciones?
              </h2>
              <p className="text-emerald-100/80 text-sm font-light mb-8 leading-relaxed">
                Nuestro equipo de atención al coleccionista está listo para ayudarte con tus consultas de pago, reservas o despachos.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-full transition shadow-lg hover:scale-105"
                >
                  <MessageCircle size={18} className="fill-white" />
                  Escribir a WhatsApp
                </a>

                <Link
                  href="/politica-de-privacidad"
                  className="inline-flex items-center justify-center gap-2 bg-surface/10 hover:bg-surface/20 text-white font-semibold text-xs uppercase tracking-widest px-8 py-4 rounded-full transition border border-white/20"
                >
                  Ver Política de Privacidad
                </Link>
              </div>
            </div>
          </section>

        </article>

      </main>

      <Footer />
    </div>
  );
}
