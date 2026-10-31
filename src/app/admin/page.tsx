
import { requireAdmin } from '@/lib/security/admin';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import AdminNav from '@/components/Admin/AdminNav';
import ProductListClient from './ProductListClient';
import { 
  Package, 
  AlertTriangle, 
  ShoppingBag, 
  TrendingUp, 
  Clock, 
  Sprout, 
  Sparkles, 
  ArrowUpRight,
  Flame,
  Layers
} from 'lucide-react';
import { Suspense } from 'react';
import Link from 'next/link';

async function AdminDashboardContent() {
  await requireAdmin();
  const [{ data: rawProducts }, { data: orders }, { data: orderItems }, { data: visibilitySettings }] = await Promise.all([
    supabaseAdmin.from('products').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('orders').select('*'),
    supabaseAdmin.from('order_items').select('*'),
    supabaseAdmin.from('site_settings').select('*').like('key', 'product_visibility_%'),
  ]);

  // Mapear visibilidad de site_settings
  const visibilityMap: Record<string, boolean> = {};
  visibilitySettings?.forEach(s => {
    const id = s.key.replace('product_visibility_', '');
    visibilityMap[id] = s.value === 'true';
  });

  const products = (rawProducts || []).map(p => ({
    ...p,
    is_published: p.is_published !== undefined ? p.is_published : (visibilityMap[p.id] !== undefined ? visibilityMap[p.id] : true)
  }));

  // Métricas generales
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= 5).length;
  const pendingOrders = orders?.filter(o => o.status === 'Pendiente').length || 0;
  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

  // --- REPORTE 1: TOP 5 ESPECIES MÁS VENDIDAS ---
  const salesMap: Record<string, { id?: string; name: string; units: number; revenue: number; image?: string; category?: string }> = {};

  orderItems?.forEach(item => {
    const key = item.product_id || item.product_name;
    if (!salesMap[key]) {
      salesMap[key] = {
        id: item.product_id,
        name: item.product_name,
        units: 0,
        revenue: 0,
        image: ''
      };
    }
    salesMap[key].units += Number(item.quantity) || 1;
    salesMap[key].revenue += (Number(item.quantity) || 1) * (Number(item.price) || 0);
  });

  // Vincular datos botánicos desde products
  Object.values(salesMap).forEach(entry => {
    const prod = products.find(p => p.id === entry.id || p.name.toLowerCase() === entry.name.toLowerCase());
    if (prod) {
      entry.image = prod.image_url;
      entry.category = prod.category;
    }
  });

  const topSellingPlants = Object.values(salesMap)
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  const maxSoldUnits = Math.max(...topSellingPlants.map(p => p.units), 1);

  // --- REPORTE 2: ESPECIES CON MAYOR TIEMPO EN STOCK (BAJA ROTACIÓN) ---
  const now = Date.now();
  const oldestStockPlants = products
    .filter(p => Number(p.stock) > 0)
    .map(p => {
      const createdTime = p.created_at ? new Date(p.created_at).getTime() : now;
      const daysInStock = Math.max(1, Math.floor((now - createdTime) / (1000 * 60 * 60 * 24)));
      return {
        ...p,
        daysInStock
      };
    })
    .sort((a, b) => b.daysInStock - a.daysInStock)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      
      {/* BARRA DE MÉTRICAS DEL PANEL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-tint text-accent rounded-xl">
            <Package size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Total Especies</span>
            <span className="text-2xl font-black text-gray-900">{totalProducts}</span>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Alerta Stock Bajo (≤5)</span>
            <span className="text-2xl font-black text-red-600 font-mono">{lowStockProducts}</span>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ShoppingBag size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Pedidos Pendientes</span>
            <span className="text-2xl font-black text-amber-600 font-mono">{pendingOrders}</span>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Ingresos Acumulados</span>
            <span className="text-2xl font-black text-gray-900">S/ {totalRevenue.toFixed(2)}</span>
          </div>
        </div>

      </div>

      {/* SECCIÓN DE INTELIGENCIA DE NEGOCIO & PLANIFICACIÓN BOTÁNICA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* TARJETA 1: TOP 5 PLANTAS MÁS VENDIDAS & ROTACIÓN */}
        <div className="bg-surface p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                  <Flame size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Top 5 Especies Más Vendidas</h3>
                  <p className="text-xs text-gray-400">Mayor rotación y demanda comercial en la tienda</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-tint text-accent px-3 py-1 rounded-full">
                Planificar Propagación
              </span>
            </div>

            <div className="space-y-4">
              {topSellingPlants.length === 0 && <p className="py-8 text-sm text-gray-500">Aún no hay ventas registradas.</p>}
              {topSellingPlants.map((plant, index) => {
                const percentage = Math.round((plant.units / maxSoldUnits) * 100);
                const rankBadge = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;

                return (
                  <div key={index} className="p-3.5 rounded-2xl bg-canvas border border-line space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-gray-700 w-5 text-center">{rankBadge}</span>
                        <img
                          src={plant.image || 'https://via.placeholder.com/80'}
                          alt={plant.name}
                          className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-bold text-gray-900 text-xs">{plant.name}</p>
                          <span className="text-[10px] text-gray-400 font-semibold">{plant.category || 'Colección'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-accent text-xs block">{plant.units} vendidos</span>
                        <span className="text-[10px] text-gray-500 font-medium">S/ {plant.revenue.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Barra de progreso de rotación */}
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-700 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    {/* Recomendación horticultural */}
                    <div className="flex items-center justify-between text-[10px] pt-1 text-emerald-900">
                      <span className="flex items-center gap-1 font-semibold">
                        <Sprout size={12} className="text-accent" />
                        {index < 2 ? '🔥 Alta Demanda: Multiplicar esquejes en invernadero' : '🌿 Demanda Estable: Mantener lote aclimatado'}
                      </span>
                      {plant.id && (
                        <Link 
                          href={`/producto/${plant.id}`} 
                          target="_blank"
                          className="text-gray-400 hover:text-accent transition flex items-center gap-0.5"
                        >
                          Ver <ArrowUpRight size={11} />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 bg-tint/50 p-3 rounded-xl text-[11px] text-ink flex items-start gap-2">
            <Sparkles size={14} className="text-accent shrink-0 mt-0.5" />
            <p>
              <strong>Estrategia de Vivero:</strong> Las especies con mayor índice de rotación deben contar con al menos 15-20 ejemplares en fase de enraizamiento para evitar quiebres de inventario.
            </p>
          </div>
        </div>

        {/* TARJETA 2: ESPECIES CON MAYOR TIEMPO EN STOCK (BAJA ROTACIÓN) */}
        <div className="bg-surface p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Mayor Tiempo en Stock</h3>
                  <p className="text-xs text-gray-400">Identificación de ejemplares con baja rotación</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 px-3 py-1 rounded-full">
                Alerta de Inventario
              </span>
            </div>

            <div className="space-y-4">
              {oldestStockPlants.map((plant, index) => {
                const isOverdue = plant.daysInStock >= 20;

                return (
                  <div key={plant.id} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={plant.image_url || 'https://via.placeholder.com/80'}
                          alt={plant.name}
                          className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-bold text-gray-900 text-xs">{plant.name}</p>
                          <span className="text-[10px] text-gray-400 font-semibold">{plant.category || 'Plantas'}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md font-mono ${
                          isOverdue ? 'bg-amber-100 text-amber-900' : 'bg-gray-200 text-gray-800'
                        }`}>
                          {plant.daysInStock} días en catálogo
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold block mt-0.5">
                          Stock: {plant.stock} un. • S/ {Number(plant.price).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Recomendación de acción comercial */}
                    <div className="flex items-center justify-between text-[10px] pt-1 text-gray-600">
                      <span className="flex items-center gap-1 font-medium text-amber-950">
                        <Layers size={12} className="text-amber-700" />
                        {isOverdue 
                          ? '⚠️ Sugerencia: Promocionar en Banner o incluir en combo de inicio'
                          : '🌱 Crecimiento en invernadero: Mantener ficha fotográfica actualizada'}
                      </span>
                      <Link 
                        href={`/admin/edit/${plant.id}`} 
                        className="text-blue-600 hover:text-blue-800 font-bold transition flex items-center gap-0.5"
                      >
                        Ajustar <ArrowUpRight size={11} />
                      </Link>
                    </div>
                  </div>
                );
              })}

              {oldestStockPlants.length === 0 && (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No hay productos con stock activo actualmente.
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 bg-amber-50/50 p-3 rounded-xl text-[11px] text-amber-950 flex items-start gap-2">
            <AlertTriangle size={14} className="text-amber-700 shrink-0 mt-0.5" />
            <p>
              <strong>Recomendación de Inventario:</strong> Los ejemplares con más de 30 días en stock pueden beneficiarse de una actualización de fotos mostrando su nuevo follaje o una etiqueta "Oferta Especial".
            </p>
          </div>
        </div>

      </div>

      {/* TABLA CLIENTE CON BUSCADOR, STOCK EN LÍNEA, VISIBILIDAD Y FILTROS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Catálogo Completo de Ejemplares</h2>
            <p className="text-xs text-gray-500">Ajusta el stock rápidamente con [+] [-] o pausa plantas en aclimatación.</p>
          </div>
          <Link
            href="/admin/new"
            className="bg-[#0F281E] hover:bg-emerald-950 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            + Nuevo Producto
          </Link>
        </div>

        <ProductListClient products={products} />
      </div>

    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <AdminNav />
        <Suspense fallback={<div className="p-12 text-center text-gray-400">Cargando métricas y catálogo...</div>}>
          <AdminDashboardContent />
        </Suspense>
      </div>
    </div>
  );
}
