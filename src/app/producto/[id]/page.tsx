import { headers } from 'next/headers';
import { safeJson } from '@/lib/security/output';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabaseServer';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Truck, ChevronRight, Leaf, HelpCircle, Sun, Droplets, Thermometer } from 'lucide-react';
import Link from 'next/link';
import AddToCartForm from './AddToCartForm';
import ProductCard from '@/components/ProductCard';
import ProductGallery from '@/components/ProductGallery';
import { Suspense } from 'react';

// --- GENERACIÓN DINÁMICA DE SEO PARA CADA ESPECIE BOTÁNICA ---
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (!product) {
    return {
      title: 'Ejemplar no encontrado',
      description: 'El ejemplar botánico solicitado no se encuentra disponible.',
    };
  }

  const cleanDescription = product.description
    ? product.description.slice(0, 160)
    : `Adquiere ${product.name} en RD Garden. Planta de colección aclimatada con garantía de llegada viva.`;

  return {
    title: `${product.name} | Colección Botánica`,
    description: cleanDescription,
    keywords: [product.name, product.category || 'Plantas de colección', 'RD Garden', 'comprar plantas online'],
    openGraph: {
      title: `${product.name} - RD Garden Store`,
      description: cleanDescription,
      url: `https://www.rdgarden.com/producto/${product.id}`,
      siteName: 'RD Garden',
      images: [
        {
          url: product.image_url || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop',
          width: 800,
          height: 800,
          alt: `Fotografía botánica de ${product.name}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | RD Garden`,
      description: cleanDescription,
      images: [product.image_url || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop'],
    },
  };
}

async function ProductDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const nonce = (await headers()).get('x-nonce') || undefined;
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const supabase = await createClient();

  // Buscar el producto en la BD
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (!product) {
    notFound();
  }

  // Consultar fotos adicionales en site_settings si no están en la tabla
  const { data: extraPhotoSetting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', `product_images_${id}`)
    .single();

  let resolvedImages: string[] = [];
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    resolvedImages = product.images;
  } else if (extraPhotoSetting?.value) {
    try {
      resolvedImages = JSON.parse(extraPhotoSetting.value);
    } catch {}
  }
  if (resolvedImages.length === 0) {
    resolvedImages = [product.image_url || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop'];
  }

  // Consultar teléfono oficial de la tienda en site_settings
  const { data: phoneSetting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'contact_phone')
    .single();

  const storePhone = phoneSetting?.value || '+51 997 966 231';

  // Buscar productos recomendados de la misma categoría o aleatorios
  let { data: relatedProducts } = await supabase
    .from('products')
    .select('*')
    .neq('id', id)
    .eq('category', product.category || 'Plantas de Interior')
    .limit(4);

  if (!relatedProducts || relatedProducts.length < 2) {
    const { data: fallbackProducts } = await supabase
      .from('products')
      .select('*')
      .neq('id', id)
      .limit(4);
    relatedProducts = fallbackProducts;
  }

  // Opciones de tamaño
  const sizes = product.sizes && product.sizes.length > 0
    ? product.sizes
    : ['Standard'];

  // Textos editables con fallbacks
  const careInstructions = product.care_instructions || 'Requiere luz indirecta brillante y humedad moderada a alta (60%+). Regar cuando el primer centímetro de sustrato esté seco al tacto. Sustrato aireado con perlita y corteza de pino.';
  const shippingInfo = product.shipping_info || 'Despachamos de Lunes a Miércoles para evitar demoras en fines de semana. Cada planta se empaca con gel térmico o pañuelo según la estación climática de tu ciudad.';
  const faqText = product.faq || '¿Llegó dañada? Envíanos una foto dentro de las primeras 24 horas tras la entrega y reemplazaremos la planta o te reembolsaremos el 100% sin complicaciones.';

  // Schema JSON-LD de Producto para Google Rich Snippets
  const jsonLdProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: resolvedImages,
    description: product.description || `Planta de colección ${product.name} disponible en RD Garden.`,
    category: product.category || 'Plantas de Interior',
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'PEN',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'RD Garden',
      },
    },
  };

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://www.rdgarden.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.category || 'Catálogo',
        item: `https://www.rdgarden.com/catalogo?category=${encodeURIComponent(product.category || 'Todas')}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `https://www.rdgarden.com/producto/${product.id}`,
      },
    ],
  };

  return (
    <>
      {/* DATOS ESTRUCTURADOS JSON-LD */}
      <script
        nonce={nonce} type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(jsonLdProduct) }}
      />
      <script
        nonce={nonce} type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(jsonLdBreadcrumb) }}
      />

      {/* BREADCRUMB NAVEGACIÓN */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-8 flex-wrap">
        <Link href="/" className="hover:text-ink transition-colors">Inicio</Link>
        <ChevronRight size={12} />
        <Link href={`/catalogo?category=${encodeURIComponent(product.category || 'Plantas de Interior')}`} className="hover:text-ink transition-colors">
          {product.category || 'Plantas'}
        </Link>
        <ChevronRight size={12} />
        <span className="text-gray-900 truncate font-bold">{product.name}</span>
      </nav>

      {/* CONTENEDOR PRINCIPAL DE DETALLE */}
      <div className="bg-white rounded-3xl shadow-xs border border-gray-200/90 overflow-hidden flex flex-col lg:flex-row mb-16">

        {/* GALERÍA DE MÚLTIPLES FOTOS (PLANTA COMPLETA, DETALLE HOJA, RAÍCES/CEPELLÓN) */}
        <div className="lg:w-1/2 p-6 lg:p-10 bg-gray-50/50 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-200/80">
          <ProductGallery
            images={resolvedImages}
            name={product.name}
            stock={product.stock}
            badge={product.badge}
          />
        </div>

        {/* DETALLES Y COMPRA (Derecha) */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-between">

          <div>
            {/* Categoría Tag & Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-emerald-800 bg-emerald-50/80 border border-emerald-200/60 px-2.5 py-0.5 rounded-full font-bold tracking-widest text-[10px] uppercase block">
                {product.category || 'Plantas Exóticas'}
              </span>
              {product.badge && (
                <span className="bg-[#18181b]/85 backdrop-blur-md text-white font-bold tracking-widest text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-white/10">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Nombre del Producto */}
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-gray-900 leading-tight mb-4">
              {product.name}
            </h1>

            {/* FICHA TÉCNICA RÁPIDA (ÍCONOS BOTÁNICOS) */}
            <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-gray-50/80 rounded-2xl border border-gray-200/60">
              <div className="flex flex-col items-center text-center">
                <Sun size={18} className="text-amber-500 mb-1" />
                <span className="text-[10px] text-gray-400 font-bold uppercase">Luz</span>
                <span className="text-xs font-semibold text-gray-800">Indirecta</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Droplets size={18} className="text-blue-500 mb-1" />
                <span className="text-[10px] text-gray-400 font-bold uppercase">Riego</span>
                <span className="text-xs font-semibold text-gray-800">Semanal</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Thermometer size={18} className="text-emerald-600 mb-1" />
                <span className="text-[10px] text-gray-400 font-bold uppercase">Clima</span>
                <span className="text-xs font-semibold text-gray-800">18° - 26°C</span>
              </div>
            </div>

            {/* Precio en Soles */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl sm:text-4xl font-black text-emerald-800 tracking-tight">
                S/ {Number(product.price).toFixed(2)}
              </span>
            </div>

            {/* Descripción Breve */}
            <p className="text-gray-600 text-sm leading-relaxed mb-8 font-light">
              {product.description}
            </p>

            {/* FORMULARIO DE COMPRA & VARIANTES */}
            <AddToCartForm product={product} sizes={sizes} storePhone={storePhone} />
          </div>

          {/* ACORDEÓN / TABS DE INFORMACIÓN TÉCNICA */}
          <div className="mt-12 border-t border-gray-100 pt-8 space-y-4">

            <details className="group border border-gray-200/90 rounded-2xl p-4 bg-white shadow-2xs hover:border-gray-300 transition-colors [&_summary::-webkit-details-marker]:hidden" open>
              <summary className="flex items-center justify-between cursor-pointer font-bold text-xs uppercase tracking-wider text-gray-900">
                <span className="flex items-center gap-2"><Leaf size={16} className="text-emerald-700" /> Detalles & Cuidados</span>
                <span className="transition group-open:rotate-180">
                  <ChevronRight size={16} />
                </span>
              </summary>
              <p className="mt-4 text-xs text-gray-600 leading-relaxed pl-6 whitespace-pre-line font-light">
                {careInstructions}
              </p>
            </details>

            <details className="group border border-gray-200/90 rounded-2xl p-4 bg-white shadow-2xs hover:border-gray-300 transition-colors [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer font-bold text-xs uppercase tracking-wider text-gray-900">
                <span className="flex items-center gap-2"><Truck size={16} className="text-emerald-700" /> Envíos & Empaque Térmico</span>
                <span className="transition group-open:rotate-180">
                  <ChevronRight size={16} />
                </span>
              </summary>
              <p className="mt-4 text-xs text-gray-600 leading-relaxed pl-6 whitespace-pre-line font-light">
                {shippingInfo}
              </p>
            </details>

            <details className="group border border-gray-200/90 rounded-2xl p-4 bg-white shadow-2xs hover:border-gray-300 transition-colors [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer font-bold text-xs uppercase tracking-wider text-gray-900">
                <span className="flex items-center gap-2"><HelpCircle size={16} className="text-emerald-700" /> Preguntas Frecuentes / Garantías</span>
                <span className="transition group-open:rotate-180">
                  <ChevronRight size={16} />
                </span>
              </summary>
              <p className="mt-4 text-xs text-gray-600 leading-relaxed pl-6 whitespace-pre-line font-light">
                {faqText}
              </p>
            </details>

          </div>

        </div>
      </div>

      {/* SECCIÓN DE PRODUCTOS RECOMENDADOS */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-gray-200">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-accent uppercase tracking-widest">Sugerencias</span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-gray-900 mt-1">
              También te pueden interesar
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function ProductDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />

      <main id="contenido" tabIndex={-1} className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <Suspense fallback={
          <div className="bg-surface rounded-[2.5rem] p-12 text-center border border-gray-100">
            <p className="text-gray-500 animate-pulse text-sm">Cargando detalles de la planta...</p>
          </div>
        }>
          <ProductDetailContent params={props.params} />
        </Suspense>
      </main>

      {/* FOOTER R&DGARDEN */}
      <Footer />
    </div>
  );
}
