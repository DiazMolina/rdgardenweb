import { headers } from 'next/headers';
import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.rdgarden.com'),
  title: {
    template: '%s | R&D Garden',
    default: 'R&D Garden | Innovación en Plantas y Coleccionismo Botánico',
  },
  description: 'Descubre en R&D Garden las plantas de colección más exclusivas, especies raras aclimatadas y los mejores insumos para su cuidado.',
  keywords: ['comprar plantas raras', 'plantas exóticas', 'monstera variegata', 'R&D Garden', 'plantas de interior', 'vivero online boutique', 'macetas de diseño'],
  authors: [{ name: 'R&D Garden' }],
  creator: 'R&D Garden',
  publisher: 'R&D Garden',
  openGraph: {
    title: 'R&D Garden | Innovación en Plantas y Coleccionismo Botánico',
    description: 'Encuentra las plantas más raras, aclimatadas profesionalmente y con garantía de llegada viva.',
    url: 'https://www.rdgarden.com',
    siteName: 'R&D Garden',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'R&D Garden - Colección Botánica Exclusiva',
      },
    ],
    locale: 'es_PE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'R&D Garden | Innovación en Plantas y Coleccionismo Botánico',
    description: 'Encuentra las plantas más raras con garantía de llegada viva a todo el país.',
    images: ['https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get('x-nonce') || undefined;
  return (
    <html lang="es" suppressHydrationWarning>
      <head><script nonce={nonce} dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("rd-theme");document.documentElement.dataset.theme=t==="dark"?"dark":"light"}catch{document.documentElement.dataset.theme="light"}` }} /></head>
      <body className="antialiased bg-white text-ink">
        <a href="#contenido" className="skip-link">Saltar al contenido</a>
        <CartProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}