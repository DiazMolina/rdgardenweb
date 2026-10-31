'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { validateOrder } from '@/lib/security/validation';
import { rateLimit } from '@/lib/security/rateLimit';
import { revalidatePath } from 'next/cache';

export async function getPackagingSettings() {
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('*')
    .in('key', ['packaging_fee_enabled', 'packaging_fee_per_item']);

  const settings: Record<string, string> = {};
  data?.forEach(i => {
    settings[i.key] = i.value;
  });

  return {
    enabled: settings['packaging_fee_enabled'] === 'true',
    feePerItem: parseFloat(settings['packaging_fee_per_item'] || '3.00'),
  };
}

import { cleanPhoneDigits, formatDisplayPhone, DEFAULT_STORE_PHONE } from '@/lib/storeContact';

export async function getStorePhone() {
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', 'contact_phone')
    .single();

  const rawPhone = data?.value || DEFAULT_STORE_PHONE;
  return {
    raw: rawPhone,
    clean: cleanPhoneDigits(rawPhone),
    formatted: formatDisplayPhone(rawPhone),
  };
}

export async function getPaymentSettings() {
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('*')
    .or('key.like.payment_%,key.eq.contact_phone');

  const settings: Record<string, string> = {};
  data?.forEach(i => {
    settings[i.key] = i.value;
  });

  const masterPhone = settings['contact_phone'] || DEFAULT_STORE_PHONE;
  const cleanMaster = cleanPhoneDigits(masterPhone);
  const formattedMaster = formatDisplayPhone(masterPhone);

  return {
    storePhone: {
      raw: masterPhone,
      clean: cleanMaster,
      formatted: formattedMaster,
    },
    yape: {
      enabled: settings['payment_yape_enabled'] !== 'false',
      number: settings['payment_yape_number'] || formattedMaster,
      name: settings['payment_yape_name'] || 'RD Garden',
    },
    plin: {
      enabled: settings['payment_plin_enabled'] !== 'false',
      number: settings['payment_plin_number'] || formattedMaster,
      banks: settings['payment_plin_banks'] || 'Interbank / Scotiabank / BBVA',
    },
    transfer: {
      enabled: settings['payment_transfer_enabled'] !== 'false',
      title: settings['payment_transfer_title'] || 'BCP / BBVA / Interbank',
      details: settings['payment_transfer_details'] || 'Transferencia Directa o CCI (Cuentas en Soles)',
    },
  };
}

type CheckoutResult = {
  success: boolean;
  error?: string;
  orderId?: string;
  totalAmount?: number;
  subtotal?: number;
  packagingFee?: number;
  items?: Array<{ id: string; name: string; price: number; quantity: number; selectedSize: string }>;
};

export async function submitOrder(orderData: unknown, items: unknown, requestId: string): Promise<CheckoutResult> {
  try {
    const fingerprint = await rateLimit('checkout', 20);
    const input = validateOrder(orderData, items, requestId);
    // One database transaction: canonical pricing, stock locks, idempotency and inserts.
    // No fallback to the old non-atomic path when the migration is absent.
    const { data, error } = await supabaseAdmin.rpc('secure_checkout', {
      p_request_id: input.requestId, p_fingerprint: fingerprint,
      p_customer: input.customer, p_items: input.items, p_payment_method: input.payment,
    });
    if (error || !data) return { success: false, error: 'No se pudo reservar el pedido. Revisa disponibilidad e inténtalo nuevamente.' };
    revalidatePath('/');
    revalidatePath('/catalogo');
    revalidatePath('/admin');
    revalidatePath('/admin/orders');
    return { success: true, orderId: data.orderId, totalAmount: Number(data.totalAmount), subtotal: Number(data.subtotal),
      packagingFee: Number(data.packagingFee), items: data.items };
  } catch {
    return { success: false, error: 'No se pudo procesar el pedido. Verifica tus datos o inténtalo más tarde.' };
  }
}
