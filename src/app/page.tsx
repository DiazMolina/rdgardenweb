import { headers } from 'next/headers';
import { safeJson } from '@/lib/security/output';
import { createClient } from '@/lib/supabaseServer';
import { Leaf, ArrowRight } from 'lucide-react';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import HeroCarousel from '@/components/Home/HeroCarousel';
import TestimonialsSection from '@/components/Home/TestimonialsSection';
import AnnouncementBar from '@/components/AnnouncementBar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import BotanicalImage from '@/components/BotanicalImage';
import { cleanPhoneDigits } from '@/lib/storeContact';

// --- SKELETON LOADER ---
function SkeletonLoader() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="bg-surface rounded-3xl p-4 border border-line shadow-sm animate-pulse">
          <div className="w-full h-64 bg-gray-200 rounded-2xl mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="flex justify-between items-center mt-6">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded-full w-10"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- HERO CAROUSEL WRAPPER ---
async function HeroCarouselWrapper() {
  const supabase = await createClient();

  const { data: slides } = await supabase
    .from('hero_slides')
    .select('*')
    .order('sort_order', { ascending: true });

  return <HeroCarousel slides={slides || []} />;
}

// --- TESTIMONIALS & WHATSAPP WRAPPER ---
async function TestimonialsWrapper() {
  const supabase = await createClient();

  const { data: settingsData } = await supabase
    .from('site_settings')
    .select('*');

  const settings: Record<string, string> = {};
  settingsData?.forEach(item => {
    settings[item.key] = item.value;
  });

  const masterPhone = settings['contact_phone'] || '+51 997 966 231';
  const cleanPhone = cleanPhoneDigits(masterPhone);

  let whatsappLink = settings['whatsapp_link'] || '';
  if (!whatsappLink || whatsappLink.includes('987654321') || whatsappLink.includes('51997966231')) {
    whatsappLink = `https://wa.me/${cleanPhone}?text=Hola!%20Me%20gustar%C3%ADa%20unirme%20a%20la%20comunidad%20de%20plantas%20de%20RD%20Garden`;
  } else if (whatsappLink.includes('wa.me/')) {
    whatsappLink = whatsappLink.replace(/wa\.me\/\d+/, `wa.me/${cleanPhone}`);
  }

  const isCommunityEnabled = settings['whatsapp_community_enabled'] !== 'false';

  return (
    <TestimonialsSection
      enabled={isCommunityEnabled}
      whatsappLink={whatsappLink}
      buttonText={settings['whatsapp_button_text']}
      badge={settings['whatsapp_community_badge']}
      title={settings['whatsapp_community_title']}
      description={settings['whatsapp_community_description']}
    />
  );
}

// --- HOME CATEGORIES WRAPPER (ORDENADAS SEGÚN EL PANEL ADMIN) ---
async function HomeCategoriesWrapper() {
  const supabase = await createClient();

  // Consultar categorías ordenadas por sort_order ASC
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  const defaultCategories = [
    {
      name: 'Plantas de Interior',
      description: 'Monsteras, Filodendros y plantas para sombra',
      image_url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Plantas de Exterior',
      description: 'Aglaonemas, palmeras y plantas resistentes al sol',
      image_url: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Macetas',
      description: 'Macetas de cerámica, barro y diseño moderno',
      image_url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Herramientas',
      description: 'Accesorios, sustratos y herramientas de jardinería',
      image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop',
    },
  ];

  const activeCategories = categories && categories.length > 0 ? categories : defaultCategories;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-[11px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-50/90 border border-emerald-200/60 px-3.5 py-1 rounded-full mb-3 inline-block">
          Curaduría Botánica
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-gray-900">
          Nuestras Colecciones
        </h2>
        <p className="text-gray-500 mt-3 text-sm font-light">
          Selecciona una colección para explorar los ejemplares disponibles.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {activeCategories.map((cat) => (
          <Link
            key={cat.name}
            href={`/catalogo?category=${encodeURIComponent(cat.name)}`}
            className="relative h-96 rounded-2xl overflow-hidden group cursor-pointer shadow-xs border border-gray-200/80 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 transition-all duration-500 block"
          >
            <BotanicalImage
              src={cat.image_url || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=800&auto=format&fit=crop'}
              alt={cat.name}
              fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>
            <div className="absolute bottom-8 left-6 right-6 text-white">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block mb-1">Colección</span>
              <h3 className="text-xl font-serif font-bold leading-tight">{cat.name}</h3>
              {cat.description && (
                <p className="text-xs text-neutral-300 line-clamp-1 mt-1 font-light">
                  {cat.description}
                </p>
              )}
              <span className="inline-flex items-center text-xs font-semibold text-white/90 group-hover:text-emerald-300 mt-3 transition-colors">
                Explorar Colección <ArrowRight size={14} className="ml-1.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// --- PRODUCT LIST COMPONENT ---
async function HomeProductPreview() {
  const supabase = await createClient();

  const [{ data: rawProducts, error }, { data: pausedSettings }] = await Promise.all([
    supabase.from('products').select('*').order('created_at', { ascending: false }).limit(16),
    supabase.from('site_settings').select('key').like('key', 'product_visibility_%').eq('value', 'false'),
  ]);

  const pausedIds = new Set(
    pausedSettings?.map((s) => s.key.replace('product_visibility_', '')) || []
  );

  const products = (rawProducts || [])
    .filter((p) => p.is_published !== false && !pausedIds.has(p.id))
    .slice(0, 8);

  if (error) return <section className="max-w-7xl mx-auto px-6 pb-20"><div role="status" className="catalog-tools text-center"><h2 className="font-serif text-2xl">El catálogo no está disponible en este momento</h2><p className="mt-3 text-gray-500 text-sm">Vuelve a intentarlo en unos momentos para ver los ejemplares disponibles.</p><Link href="/catalogo" className="inline-block mt-5 underline underline-offset-4 text-accent">Ir al catálogo</Link></div></section>;
  if (!products || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      {/* Cabecera con enlace a la derecha */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4 border-b border-gray-200/80 pb-6">
        <div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50/90 border border-emerald-200/60 uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3">Lo Más Nuevo</span>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-gray-900">
            Últimas Adiciones
          </h2>
          <p className="text-gray-500 mt-2 max-w-xl text-sm font-light">
            Novedades recién llegadas e inspeccionadas de nuestro invernadero.
          </p>
        </div>

        <Link
          href="/catalogo"
          className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-emerald-700 hover:text-emerald-900 underline underline-offset-8 transition-colors shrink-0"
        >
          Ver Catálogo Completo <ArrowRight size={16} className="ml-2" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="text-center pt-4">
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-bold text-xs uppercase tracking-widest px-9 py-4 rounded-full transition-all shadow-xl shadow-emerald-700/25 hover:scale-105"
        >
          Explorar Todo el Catálogo <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

// --- PÁGINA PRINCIPAL / INICIO ---
export default async function Home() {
  const nonce = (await headers()).get('x-nonce') || undefined;
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-emerald-200 text-ink">

      {/* CINTA DE ANUNCIOS SUPERIOR EDITABLE */}
      <Suspense fallback={<div className="bg-[#0F281E] text-emerald-100 py-2.5 text-center text-xs">Cargando...</div>}>
        <AnnouncementBar />
      </Suspense>

      {/* DATOS ESTRUCTURADOS JSON-LD PARA GOOGLE (SEO) */}
      <script
        nonce={nonce} type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJson({
            '@context': 'https://schema.org',
            '@type': 'OnlineStore',
            name: 'RD Garden',
            url: 'https://www.rdgarden.com',
            logo: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop',
            description: 'Vivero boutique especializado en plantas de colección raras, tropicales aclimatadas y macetas de diseño.',
            priceRange: '$$',
            paymentAccepted: 'Transferencia Bancaria, Yape, Plin',
            currenciesAccepted: 'PEN',
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Colección Botánica',
              itemListElement: [
                { '@type': 'OfferCatalog', name: 'Plantas de Interior' },
                { '@type': 'OfferCatalog', name: 'Plantas de Exterior' },
                { '@type': 'OfferCatalog', name: 'Macetas' },
                { '@type': 'OfferCatalog', name: 'Herramientas' },
              ],
            },
          }),
        }}
      />

      {/* NAVBAR */}
      <Navbar />

      <main id="contenido" tabIndex={-1} className="flex-1">

        {/* HERO CAROUSEL EDITORIAL DINÁMICO */}
        <Suspense fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
            <div className="w-full h-[920px] md:h-[610px] bg-[#122C20] rounded-[2rem] animate-pulse"></div>
          </div>
        }>
          <HeroCarouselWrapper />
        </Suspense>

        {/* 4 COLECCIONES DESTACADAS CON IMAGEN */}
        <Suspense fallback={<div className="h-64 animate-pulse"></div>}>
          <HomeCategoriesWrapper />
        </Suspense>

        {/* VISTA PREVIA DE ÚLTIMAS ADICIONES */}
        <Suspense fallback={<SkeletonLoader />}>
          <HomeProductPreview />
        </Suspense>

        {/* TESTIMONIOS REALES Y COMUNIDAD WHATSAPP */}
        <Suspense fallback={<div className="h-48 bg-[#0F281E] animate-pulse"></div>}>
          <TestimonialsWrapper />
        </Suspense>

      </main>

      {/* FOOTER R&DGARDEN */}
      <Footer />

    </div>
  );
}
