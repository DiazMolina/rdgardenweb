
import { requireAdmin } from '@/lib/security/admin';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import AdminNav from '@/components/Admin/AdminNav';
import OrderListClient from './OrderListClient';
import { Suspense } from 'react';

async function AdminOrdersContent() {
  await requireAdmin();
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .order('created_at', { ascending: false });

  // Consultar respaldos de envío en site_settings si existen
  const { data: settings } = await supabaseAdmin
    .from('site_settings')
    .select('*')
    .like('key', 'order_shipping_%');

  const shippingMap: Record<string, { courier?: string; tracking_number?: string }> = {};
  settings?.forEach((s) => {
    const orderId = s.key.replace('order_shipping_', '');
    try {
      shippingMap[orderId] = JSON.parse(s.value);
    } catch {
      // Ignorar si el JSON no es válido
    }
  });

  const mergedOrders = (orders || []).map((o) => {
    const fallback = shippingMap[o.id];
    return {
      ...o,
      courier: o.courier || fallback?.courier || '',
      tracking_number: o.tracking_number || fallback?.tracking_number || '',
    };
  });

  return <OrderListClient orders={mergedOrders} />;
}

export default function AdminOrdersPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <AdminNav />
        <Suspense fallback={<div className="p-12 text-center text-gray-400">Cargando órdenes de compra...</div>}>
          <AdminOrdersContent />
        </Suspense>
      </div>
    </div>
  );
}
