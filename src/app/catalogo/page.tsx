import { catalogFilters, UUID } from '@/lib/security/validation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabaseServer';
import { Leaf, Home } from 'lucide-react';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import CatalogDiscovery from '@/components/Home/CatalogDiscovery';
import CategoryFilter from '@/components/Home/CategoryFilter';
import PriceFilter from '@/components/Home/PriceFilter';
import CatalogSortAndFilter from '@/components/Home/CatalogSortAndFilter';
import PaginationBar from '@/components/PaginationBar';
import AnnouncementBar from '@/components/AnnouncementBar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { cleanPhoneDigits } from '@/lib/storeContact';

export const metadata: Metadata = {
  title: 'Catálogo de Plantas Exóticas & Colección',
  description: 'Explora nuestro catálogo botánico completo: Monsteras, Filodendros, Aglaonemas, macetas de autor y sustratos especiales con despacho garantizado.',
  openGraph: {
    title: 'Catálogo de Plantas Exóticas & Colección | RD Garden',
    description: 'Encuentra ejemplares de colección aclimatados para tu hogar.',
  },
};

const PAGE_SIZE = 24;

// --- SKELETON LOADER ---
function SkeletonLoader() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
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

// --- PRODUCT LIST COMPONENT CON ORDENAMIENTO Y PAGINACIÓN ---
async function ProductList({
  category,
  priceRange,
  search = '',
  badge = '',
  sort = 'newest',
  inStockOnly = false,
  page = 1
}: {
  category?: string;
  priceRange?: string;
  search?: string;
  badge?: string;
  sort?: string;
  inStockOnly?: boolean;
  page?: number;
}) {
  const supabase = await createClient();

  // Consultar respaldos de visibilidad pausada, precios de oferta tachados y teléfono en site_settings
  const { data: generalSettings } = await supabase
    .from('site_settings')
    .select('key, value')
    .or('key.like.product_visibility_%,key.like.product_original_price_%,key.eq.contact_phone');

  const pausedIds = new Set<string>();
  const originalPriceMap: Record<string, number> = {};
  let storePhoneVal = '+51 997 966 231';

  generalSettings?.forEach((s) => {
    if (s.key === 'contact_phone') {
      storePhoneVal = s.value;
    } else if (s.key.startsWith('product_visibility_') && s.value === 'false') {
      const id = s.key.replace('product_visibility_', '');
      if (UUID.test(id)) pausedIds.add(id);
    } else if (s.key.startsWith('product_original_price_')) {
      const id = s.key.replace('product_original_price_', '');
      const val = parseFloat(s.value);
      if (!isNaN(val)) originalPriceMap[id] = val;
    }
  });

  const cleanPhone = cleanPhoneDigits(storePhoneVal);

  const safeSearch = search.replace(/[%_\\]/g, '').trim().slice(0, 100);

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' });

  if (pausedIds.size) query = query.not('id', 'in', `(${Array.from(pausedIds).join(',')})`);
  if (safeSearch) query = query.ilike('name', `%${safeSearch}%`);
  if (badge) query = query.eq('badge', badge);

  // Ordenamiento dinámico
  if (sort === 'price-asc') {
    query = query.order('price', { ascending: true });
  } else if (sort === 'price-desc') {
    query = query.order('price', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  // Filtro por categoría (usando ilike para que sea tolerante a mayúsculas/minúsculas)
  if (category && category !== 'Todas') {
    query = query.ilike('category', category.trim());
  }

  // Filtro por disponibilidad en stock
  if (inStockOnly) {
    query = query.gt('stock', 0);
  }

  // Filtro por rango de precio
  if (priceRange === '0-50') {
    query = query.lte('price', 50);
  } else if (priceRange === '50-150') {
    query = query.gte('price', 50).lte('price', 150);
  } else if (priceRange === '150-plus') {
    query = query.gte('price', 150);
  }

  // Paginación eficiente SQL (Range)
  const start = (page - 1) * PAGE_SIZE;
  const end = page * PAGE_SIZE - 1;
  query = query.range(start, end);

  const { data: rawProducts, count, error } = await query;

  const products = (rawProducts || [])
    .filter((p) => (p as { is_published?: boolean }).is_published !== false)
    .map((p) => ({
      ...p,
      original_price: (p as any).original_price || originalPriceMap[p.id] || null
    }));

  if (error) return <div role="alert" className="catalog-tools text-center"><h2 className="font-serif text-2xl">No pudimos cargar el catálogo</h2><p className="my-4 text-gray-500">Intenta nuevamente en unos momentos.</p><Link href="/catalogo" className="underline">Volver a intentar</Link></div>;

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20 px-4 bg-surface rounded-3xl border border-dashed border-line col-span-full max-w-2xl mx-auto my-8">
        <Leaf className="mx-auto text-emerald-400 mb-4" size={48} />
        <h3 className="text-xl sm:text-2xl font-serif font-normal tracking-tight text-ink">
          No encontramos plantas en esta selección
        </h3>
        <p className="text-gray-500 mt-2 text-sm leading-relaxed">
          Prueba ajustando los filtros o consulta la disponibilidad de esta colección por WhatsApp.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/catalogo"
            className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#18181b] text-white hover:bg-[#27272a] transition shadow-sm"
          >
            Ver Todas las Plantas
          </Link>
          {category && category !== 'Todas' && (
            <a
              href={`https://wa.me/${cleanPhone}?text=Hola!%20Deseo%20consultar%20disponibilidad%20de%20la%20colecci%C3%B3n%20${encodeURIComponent(category)}%20en%20RD%20Garden`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#25D366] text-white hover:bg-[#1ebd59] transition shadow-sm flex items-center gap-1.5"
            >
              Consultar por WhatsApp
            </a>
          )}
        </div>
      </div>
    );
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const startItem = start + 1;
  const endItem = Math.min(start + products.length, totalCount);

  return (
    <div id="catalogo-grid" className="space-y-12">

      {/* INDICADOR DE CANTIDAD MOSTRADA */}
      <div className="flex justify-between items-center text-xs text-gray-500 border-b border-line pb-4">
        <span>
          Mostrando <strong className="text-gray-900 font-bold">{startItem} - {endItem}</strong> de <strong className="text-gray-900 font-bold">{totalCount}</strong> plantas
        </span>
        <span className="font-semibold text-accent uppercase tracking-wider">
          Página {page} de {totalPages}
        </span>
      </div>

      {/* GRID DE PRODUCTOS DEL CATÁLOGO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* BARRA DE PAGINACIÓN NUMÉRICA */}
      <PaginationBar currentPage={page} totalPages={totalPages} />

    </div>
  );
}

// --- CATALOG CONTENT COMPONENT ---
async function CatalogContent({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const { currentCategory, currentPriceRange, currentSort, inStockOnly, currentPage, search, badge } = catalogFilters(resolvedParams);

  const supabase = await createClient();

  const [{ data: dbCategories }, { data: productCats }] = await Promise.all([
    supabase.from('categories').select('name').order('sort_order', { ascending: true }),
    supabase.from('products').select('category, badge'),
  ]);

  const dynamicCategoriesSet = new Set<string>();

  dbCategories?.forEach(c => {
    if (c.name && c.name.trim()) dynamicCategoriesSet.add(c.name.trim());
  });

  productCats?.forEach(p => {
    if (p.category && p.category.trim()) dynamicCategoriesSet.add(p.category.trim());
  });

  // Si no hay categorías en BD, cargar catálogo base por defecto
  if (dynamicCategoriesSet.size === 0) {
    ['Plantas de Interior', 'Plantas de Exterior', 'Macetas', 'Herramientas'].forEach(c => dynamicCategoriesSet.add(c));
  }

  // Asegurar que si la URL solicita una categoría específica (ej: Cactus), aparezca siempre en la barra
  if (currentCategory && currentCategory !== 'Todas') {
    dynamicCategoriesSet.add(currentCategory.trim());
  }

  const categories = ['Todas', ...Array.from(dynamicCategoriesSet)];
  const badges = Array.from(new Set<string>((productCats || []).map(p => p.badge).filter(Boolean))).sort();
  if (badge && !badges.includes(badge)) badges.push(badge);

  return (
    <>
      <CatalogDiscovery badges={badges} />
      {/* FILTROS DE CATEGORÍA DINÁMICOS */}
      <CategoryFilter currentCategory={currentCategory} categories={categories} />

      {/* FILTRO DE RANGO DE PRECIO */}
      <PriceFilter currentCategory={currentCategory} currentPriceRange={currentPriceRange} />

      {/* BARRA DE ORDENAMIENTO Y STOCK */}
      <CatalogSortAndFilter currentSort={currentSort} inStockOnly={inStockOnly} />

      {/* LISTA DE PRODUCTOS CON PAGINACIÓN Y ORDEN */}
      <Suspense fallback={<SkeletonLoader />} key={`${currentCategory}-${currentPriceRange}-${currentSort}-${inStockOnly}-${currentPage}-${search}-${badge}`}>
        <ProductList
          search={search}
          badge={badge}
          category={currentCategory}
          priceRange={currentPriceRange}
          sort={currentSort}
          inStockOnly={inStockOnly}
          page={currentPage}
        />
      </Suspense>
    </>
  );
}

// --- PÁGINA INDEPENDIENTE DE CATÁLOGO GENERAL ---
type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function StandaloneCatalogPage(props: PageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-emerald-200 text-ink">

      {/* CINTA DE ANUNCIOS SUPERIOR EDITABLE */}
      <Suspense fallback={<div className="bg-[#0F281E] text-emerald-100 py-2.5 text-center text-xs">Cargando...</div>}>
        <AnnouncementBar />
      </Suspense>

      {/* NAVBAR */}
      <Navbar />

      <main id="contenido" tabIndex={-1} className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">

        {/* CABECERA EDITORIAL Y BREADCRUMB */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            <Link href="/" className="hover:text-ink transition-colors flex items-center gap-1">
              <Home size={14} /> Inicio
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-bold">Catálogo General</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-normal tracking-tight text-gray-900 mb-4">
            Catálogo Completo
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-sm font-light leading-relaxed">
            Explora nuestra colección botánica completa. Filtra por especie, categoría o rango de precio para encontrar el ejemplar perfecto para tu hogar.
          </p>
        </div>

        {/* CONTENIDO DEL CATÁLOGO */}
        <Suspense fallback={<SkeletonLoader />}>
          <CatalogContent searchParams={props.searchParams} />
        </Suspense>

      </main>

      {/* FOOTER R&DGARDEN */}
      <Footer />

    </div>
  );
}
