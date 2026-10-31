'use server';
import { requireAdmin } from '@/lib/security/admin';
import { validateForm } from '@/lib/security/validation';


import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updatePrivacySettings(formData: FormData) {
  await requireAdmin();
  validateForm(formData);
  const keys = [
    'privacy_last_updated',
    'privacy_title',
    'privacy_intro',
    'privacy_section_info',
    'privacy_section_usage',
    'privacy_section_reservations',
    'privacy_section_guarantee',
    'privacy_section_shipping',
    'privacy_section_payments',
    'privacy_section_storage',
    'privacy_section_intellectual_property',
    'privacy_section_arco',
    'privacy_section_liability_law',
    'privacy_contact_whatsapp',
    'privacy_contact_email',
  ];

  for (const key of keys) {
    const value = formData.get(key) as string;
    if (value !== null && value !== undefined) {
      await supabaseAdmin
        .from('site_settings')
        .upsert({ key, value: value.trim(), updated_at: new Date().toISOString() });
    }
  }

  revalidatePath('/politica-de-privacidad');
  revalidatePath('/privacidad');
  revalidatePath('/admin/privacy');
  revalidatePath('/');

  redirect('/admin/privacy?saved=true');
}
