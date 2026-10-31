import { Metadata } from 'next';
import { createClient } from '@/lib/supabaseServer';
import { Home, ArrowRight, Leaf } from 'lucide-react';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import AnnouncementBar from '@/components/AnnouncementBar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import WishlistClientView from './WishlistClientView';

export const metadata: Metadata = {
  title: 'Mi Lista de Deseos',
  description: 'Revisa y gestiona tus plantas de colección favoritas guardadas en RD Garden.',
};

async function SuggestedProducts() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .limit(4);

  if (!products || products.length === 0) return null;

  return (
    <div className="border-t border-line pt-12 mt-16">
      <div className="text-center mb-8">
        <span className="text-xs font-bold text-accent uppercase tracking-widest block mb-1">Inspiración</span>
        <h2 className="text-2xl font-serif font-bold text-ink">Ejemplares Sugeridos para ti</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 bg-[#18181b] hover:bg-[#27272a] text-white font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-full transition shadow-lg hover:scale-105"
        >
          Explorar Todo el Catálogo <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

function WishlistContent() {
  return (
    <div className="space-y-12">
      <WishlistClientView />
      <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100 rounded-2xl"></div>}>
        <SuggestedProducts />
      </Suspense>
    </div>
  );
}

export default function WishlistPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-emerald-200 text-ink">
      <Suspense fallback={<div className="bg-[#0F281E] text-emerald-100 py-2.5 text-center text-xs">Cargando...</div>}>
        <AnnouncementBar />
      </Suspense>

      <Navbar />

      <main id="contenido" tabIndex={-1} className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            <Link href="/" className="hover:text-ink transition-colors flex items-center gap-1">
              <Home size={14} /> Inicio
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-bold">Lista de Deseos</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-ink mb-4">
            Lista de Deseos
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-sm font-light leading-relaxed">
            Guarda tus plantas exóticas preferidas para comprarlas más tarde o compartir tu lista con otros amantes de la botánica.
          </p>
        </div>

        <Suspense fallback={<div className="p-12 text-center text-gray-400">Cargando lista de deseos...</div>}>
          <WishlistContent />
        </Suspense>
      </main>

      {/* FOOTER R&DGARDEN */}
      <Footer />
    </div>
  );
}
