import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseServer';
import { defaultPrivacyConfig } from '@/lib/privacyDefaults';
import { cleanPhoneDigits, formatDisplayPhone } from '@/lib/storeContact';
import { 
  ShieldCheck, 
  Lock, 
  Leaf, 
  Clock, 
  MessageCircle,
  ExternalLink
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidad y Términos de Compra | R&DGARDEN',
  description: 'Conoce cómo en R&DGARDEN protegemos tu información, los términos de reserva de ejemplares botánicos y nuestra garantía de llegada segura Arrive Alive.',
  robots: {
    index: true,
    follow: true,
  },
};

export default async function PoliticaPrivacidadPage() {
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
      : (defaultPrivacyConfig[key] || '');
    return val
      .replace(/51987654321/g, cleanMaster)
      .replace(/51997966231/g, cleanMaster)
      .replace(/\+51\s*987\s*654\s*321/g, formattedMaster)
      .replace(/\+51\s*997\s*966\s*231/g, formattedMaster)
      .replace(/997\s*966\s*231/g, formattedMaster);
  };

  const title = getSetting('privacy_title');
  const lastUpdated = getSetting('privacy_last_updated');
  const intro = getSetting('privacy_intro');
  const whatsappUrl = getSetting('privacy_contact_whatsapp');

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
          <span className="text-emerald-900 font-semibold">Política de Privacidad</span>
        </nav>

        {/* CABECERA EDITORIAL */}
        <header className="mb-12 border-b border-line pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-widest mb-4">
            <ShieldCheck size={14} /> Transparencia y Seguridad R&DGARDEN
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
            <span>Válido para compras y reservas en línea en R&DGARDEN</span>
          </div>
        </header>

        {/* TARJETAS RESUMEN DE BENEFICIOS Y GARANTÍAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-surface p-6 rounded-3xl border border-line shadow-sm">
            <Lock className="text-accent mb-3" size={24} />
            <h3 className="font-bold text-sm text-ink mb-1">Privacidad Absoluta</h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              No vendemos ni compartimos tus datos personales con terceros para fines publicitarios. Cifrado integral con Supabase.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-3xl border border-line shadow-sm">
            <Clock className="text-accent mb-3" size={24} />
            <h3 className="font-bold text-sm text-ink mb-1">Reservas Protegidas</h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Reserva tu planta con tiempo garantizado para coordinar el pago sin que nadie más adquiera tu espécimen seleccionado.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-3xl border border-line shadow-sm">
            <Leaf className="text-accent mb-3" size={24} />
            <h3 className="font-bold text-sm text-ink mb-1">Garantía Arrive Alive</h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Empaque térmico controlado y protocolo de verificación de 24 horas para asegurar que recibas una planta sana y vigorosa.
            </p>
          </div>
        </div>

        {/* CONTENIDO EDITABLE DE POLÍTICAS */}
        <article className="space-y-10 text-sm text-gray-700 leading-relaxed font-light">

          {/* SECCIÓN 1 */}
          <section className="bg-surface p-8 sm:p-10 rounded-3xl border border-line shadow-sm">
            <h2 className="text-xl font-serif font-bold text-ink mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs font-bold">1</span>
              Información que recopilamos
            </h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">
              {getSetting('privacy_section_info')}
            </div>
          </section>

          {/* SECCIÓN 2 */}
          <section className="bg-surface p-8 sm:p-10 rounded-3xl border border-line shadow-sm">
            <h2 className="text-xl font-serif font-bold text-ink mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs font-bold">2</span>
              Cómo usamos tu información (Beneficios y Finalidad)
            </h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">
              {getSetting('privacy_section_usage')}
            </div>
          </section>

          {/* SECCIÓN 3: RESERVAS Y PROTECCIÓN DE LA TIENDA */}
          <section id="reservas" className="bg-surface p-8 sm:p-10 rounded-3xl border border-line shadow-sm scroll-mt-24">
            <h2 className="text-xl font-serif font-bold text-ink mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs font-bold">3</span>
              Términos de Reservas y Protección de Inventario
            </h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">
              {getSetting('privacy_section_reservations')}
            </div>
          </section>

          {/* SECCIÓN 4: GARANTÍA ARRIVE ALIVE */}
          <section id="garantia" className="bg-surface p-8 sm:p-10 rounded-3xl border border-line shadow-sm scroll-mt-24">
            <h2 className="text-xl font-serif font-bold text-ink mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs font-bold">4</span>
              Garantía de Llegada Viva (Arrive Alive) y Reclamos
            </h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">
              {getSetting('privacy_section_guarantee')}
            </div>
          </section>

          {/* SECCIÓN 5: LOGÍSTICA Y TRANSPORTE */}
          <section className="bg-surface p-8 sm:p-10 rounded-3xl border border-line shadow-sm">
            <h2 className="text-xl font-serif font-bold text-ink mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs font-bold">5</span>
              Envíos y Empresas de Transporte
            </h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">
              {getSetting('privacy_section_shipping')}
            </div>
          </section>

          {/* SECCIÓN 6: PAGOS Y AUTENTICACIÓN GOOGLE */}
          <section className="bg-surface p-8 sm:p-10 rounded-3xl border border-line shadow-sm">
            <h2 className="text-xl font-serif font-bold text-ink mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs font-bold">6</span>
              Inicio de Sesión y Seguridad en Pagos
            </h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">
              {getSetting('privacy_section_payments')}
            </div>
          </section>

          {/* SECCIÓN 7: ALMACENAMIENTO SUPABASE Y LOCALSTORAGE */}
          <section className="bg-surface p-8 sm:p-10 rounded-3xl border border-line shadow-sm">
            <h2 className="text-xl font-serif font-bold text-ink mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs font-bold">7</span>
              Almacenamiento de Datos, Supabase y Cookies
            </h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">
              {getSetting('privacy_section_storage')}
            </div>
          </section>

          {/* SECCIÓN 8: PROPIEDAD INTELECTUAL */}
          <section id="propiedad" className="bg-surface p-8 sm:p-10 rounded-3xl border border-line shadow-sm scroll-mt-24">
            <h2 className="text-xl font-serif font-bold text-ink mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs font-bold">8</span>
              Propiedad Intelectual y Fotografías
            </h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">
              {getSetting('privacy_section_intellectual_property')}
            </div>
          </section>

          {/* SECCIÓN 9: DERECHOS ARCO */}
          <section className="bg-surface p-8 sm:p-10 rounded-3xl border border-line shadow-sm">
            <h2 className="text-xl font-serif font-bold text-ink mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs font-bold">9</span>
              Tus Derechos ARCO y Conservación Legal
            </h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">
              {getSetting('privacy_section_arco')}
            </div>
          </section>

          {/* SECCIÓN 10: LIMITACIÓN DE RESPONSABILIDAD Y LEY APLICABLE */}
          <section className="bg-surface p-8 sm:p-10 rounded-3xl border border-line shadow-sm">
            <h2 className="text-xl font-serif font-bold text-ink mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs font-bold">10</span>
              Techo de Responsabilidad y Ley Aplicable
            </h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">
              {getSetting('privacy_section_liability_law')}
            </div>
          </section>

          {/* SECCIÓN 11: CONTACTO */}
          <section className="bg-gradient-to-br from-[#0F281E] to-[#123627] text-white p-8 sm:p-12 rounded-[2.5rem] shadow-xl">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-2">
                Atención al Coleccionista
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-4">
                ¿Tienes preguntas sobre nuestras políticas?
              </h2>
              <p className="text-emerald-100/80 text-sm font-light mb-8 leading-relaxed">
                Estamos a tu disposición para aclarar cualquier duda sobre tus reservas, métodos de pago o el estado de tus plantas.
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
                  href="/terminos-y-condiciones"
                  className="inline-flex items-center justify-center gap-2 bg-surface/10 hover:bg-surface/20 text-white font-semibold text-xs uppercase tracking-widest px-8 py-4 rounded-full transition border border-white/20"
                >
                  Ver Términos y Condiciones
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
