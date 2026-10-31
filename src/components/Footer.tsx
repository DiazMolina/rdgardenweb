import Link from 'next/link';
import { Leaf, ShieldCheck, Heart, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 border-b border-gray-100 pb-16">
          
          {/* IDENTIDAD DE MARCA */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group inline-flex">
              <Leaf size={24} className="text-gray-900 group-hover:rotate-12 transition-transform" />
              <span className="brand-wordmark text-gray-900">
                R&D Garden
              </span>
            </Link>
            <p className="text-gray-500 max-w-sm text-sm leading-relaxed font-light mb-6">
              Vivero boutique especializado en la aclimatación y preservación de plantas tropicales raras, ejemplares de colección y piezas botánicas singulares.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50/80 border border-emerald-200/60 px-3 py-1.5 rounded-full">
              <ShieldCheck size={15} />
              <span>Garantía de Llegada Segura a Nivel Nacional</span>
            </div>
          </div>

          {/* NAVEGACIÓN */}
          <div>
            <h4 className="font-bold text-ink text-xs uppercase tracking-widest mb-4">
              Navegación
            </h4>
            <ul className="space-y-3 text-gray-500 text-sm font-light">
              <li>
                <Link href="/" className="hover:text-accent transition">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="hover:text-accent transition">
                  Catálogo Completo
                </Link>
              </li>
              <li>
                <Link href="/deseos" className="hover:text-accent transition flex items-center gap-1.5">
                  Lista de Deseos
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-accent transition text-xs text-gray-400">
                  Panel Administrativo
                </Link>
              </li>
            </ul>
          </div>

          {/* COMPROMISO & LEGAL */}
          <div>
            <h4 className="font-bold text-ink text-xs uppercase tracking-widest mb-4">
              Políticas y Legal
            </h4>
            <ul className="space-y-3 text-gray-500 text-sm font-light">
              <li>
                <Link href="/terminos-y-condiciones" className="hover:text-accent font-medium text-ink transition flex items-center gap-1">
                  Términos y Condiciones <ArrowRight size={13} />
                </Link>
              </li>
              <li>
                <Link href="/politica-de-privacidad" className="hover:text-accent font-medium text-ink transition flex items-center gap-1">
                  Política de Privacidad <ArrowRight size={13} />
                </Link>
              </li>
              <li>
                <Link href="/terminos-y-condiciones#reservas" className="hover:text-accent transition">
                  Términos de Reservas (24h)
                </Link>
              </li>
              <li>
                <Link href="/terminos-y-condiciones#garantia" className="hover:text-accent transition">
                  Garantía Arrive Alive
                </Link>
              </li>
              <li>
                <Link href="/terminos-y-condiciones#propiedad" className="hover:text-accent transition">
                  Propiedad Intelectual
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* PARTE INFERIOR & MÉTODOS DE PAGO */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-400 text-xs">
          <p>© {new Date().getFullYear()} R&DGARDEN Store. Todos los derechos reservados.</p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400 mr-2">Pagos protegidos:</span>
            <div className="px-2 h-6 bg-purple-50 rounded flex items-center justify-center text-[10px] font-black text-[#742284] border border-purple-200">
              YAPE
            </div>
            <div className="px-2 h-6 bg-cyan-50 rounded flex items-center justify-center text-[10px] font-black text-[#00A4D3] border border-cyan-200">
              PLIN
            </div>
            <div className="px-2.5 h-6 bg-tint rounded flex items-center justify-center text-[10px] font-bold text-accent border border-emerald-200">
              BCP / BBVA / TRANSFERENCIA
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
