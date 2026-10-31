'use server';
import { requireAdmin } from '@/lib/security/admin';
import { validateForm } from '@/lib/security/validation';


import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateTermsSettings(formData: FormData) {
  await requireAdmin();
  validateForm(formData);
  const keys = [
    'terms_last_updated',
    'terms_title',
    'terms_intro',
    'terms_section_platform',
    'terms_section_reservations',
    'terms_section_pricing_payments',
    'terms_section_cancellations',
    'terms_section_availability',
    'terms_section_guarantee_claims',
    'terms_section_shipping_liability',
    'terms_section_limitation_liability',
    'terms_section_intellectual_property',
    'terms_section_modifications_law',
    'terms_contact_whatsapp',
    'terms_contact_email',
  ];

  for (const key of keys) {
    const value = formData.get(key) as string;
    if (value !== null && value !== undefined) {
      await supabaseAdmin
        .from('site_settings')
        .upsert({ key, value: value.trim(), updated_at: new Date().toISOString() });
    }
  }

  revalidatePath('/terminos-y-condiciones');
  revalidatePath('/terminos');
  revalidatePath('/admin/terms');
  revalidatePath('/');

  redirect('/admin/terms?saved=true');
}
