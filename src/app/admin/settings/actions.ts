'use server';
import { requireAdmin } from '@/lib/security/admin';
import { validateForm } from '@/lib/security/validation';


import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateSiteSettings(formData: FormData) {
  await requireAdmin();
  validateForm(formData);
  const keys = [
    'contact_phone',
    'announcement_bar',
    'catalog_title',
    'catalog_subtitle',
    'featured_title',
    'featured_subtitle',
    'whatsapp_link',
    'whatsapp_button_text',
    'whatsapp_community_enabled',
    'whatsapp_community_badge',
    'whatsapp_community_title',
    'whatsapp_community_description',
    'packaging_fee_enabled',
    'packaging_fee_per_item',
    'payment_yape_enabled',
    'payment_yape_number',
    'payment_yape_name',
    'payment_plin_enabled',
    'payment_plin_number',
    'payment_plin_banks',
    'payment_transfer_enabled',
    'payment_transfer_title',
    'payment_transfer_details'
  ];

  for (const key of keys) {
    const value = formData.get(key) as string;
    if (value !== null) {
      await supabaseAdmin
        .from('site_settings')
        .upsert({ key, value: value.trim(), updated_at: new Date().toISOString() });
    }
  }

  revalidatePath('/');
  revalidatePath('/catalogo');
  revalidatePath('/admin');
  revalidatePath('/admin/settings');
  revalidatePath('/terminos-y-condiciones');
  revalidatePath('/politica-de-privacidad');

  redirect('/admin/settings');
}
