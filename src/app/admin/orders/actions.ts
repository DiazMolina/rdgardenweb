'use server';
import { requireAdmin } from '@/lib/security/admin';
import { uuid, text, ORDER_STATUSES } from '@/lib/security/validation';


import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin();
  uuid(orderId);
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) throw new Error("Estado inválido");
  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error('Error actualizando estado del pedido:', error);
    throw new Error('No se pudo actualizar el estado del pedido');
  }

  revalidatePath('/admin');
  revalidatePath('/admin/orders');
}

export async function updateOrderCourier(orderId: string, courier: string, trackingNumber: string) {
  await requireAdmin();
  uuid(orderId);
  text(courier, 160, false);
  text(trackingNumber, 160, false);
  // Intentar actualizar directamente en la tabla orders
  const { error } = await supabaseAdmin
    .from('orders')
    .update({ courier, tracking_number: trackingNumber })
    .eq('id', orderId);

  // Si las columnas aún no existen en la BD, almacenar en site_settings como respaldo
  if (error) {
    console.warn('Aviso al guardar courier en orders (usando fallback en site_settings):', error.message);
    await supabaseAdmin
      .from('site_settings')
      .upsert({
        key: `order_shipping_${orderId}`,
        value: JSON.stringify({ courier, tracking_number: trackingNumber }),
        updated_at: new Date().toISOString()
      });
  }

  revalidatePath('/admin');
  revalidatePath('/admin/orders');
  return { success: true };
}
