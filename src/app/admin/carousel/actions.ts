'use server';
import { requireAdmin } from '@/lib/security/admin';
import { validateForm, uuid } from '@/lib/security/validation';


import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addSlide(formData: FormData) {
  await requireAdmin();
  validateForm(formData);
  const data = {
    title: formData.get('title') as string,
    subtitle: formData.get('subtitle') as string,
    description: formData.get('description') as string,
    badge_text: formData.get('badge_text') as string,
    image_url: formData.get('image_url') as string,
    button_text: (formData.get('button_text') as string) || 'Explorar Tienda',
    button_link: (formData.get('button_link') as string) || '#coleccion',
    sort_order: parseInt(formData.get('sort_order') as string) || 0,
  };

  const { error } = await supabaseAdmin.from('hero_slides').insert([data]);

  if (error) {
    console.error('Error creando slide del carrusel:', error);
    throw new Error('No se pudo crear el slide');
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/carousel');

  redirect('/admin/carousel');
}

export async function updateSlide(id: string, formData: FormData) {
  await requireAdmin();
  validateForm(formData);
  uuid(id);
  const data = {
    title: formData.get('title') as string,
    subtitle: formData.get('subtitle') as string,
    description: formData.get('description') as string,
    badge_text: formData.get('badge_text') as string,
    image_url: formData.get('image_url') as string,
    button_text: (formData.get('button_text') as string) || 'Explorar Tienda',
    button_link: (formData.get('button_link') as string) || '#coleccion',
    sort_order: parseInt(formData.get('sort_order') as string) || 0,
  };

  const { error } = await supabaseAdmin
    .from('hero_slides')
    .update(data)
    .eq('id', id);

  if (error) {
    console.error('Error actualizando slide:', error);
    throw new Error('No se pudo actualizar el slide');
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/carousel');

  redirect('/admin/carousel');
}

export async function deleteSlide(id: string) {
  await requireAdmin();
  uuid(id);
  const { error } = await supabaseAdmin.from('hero_slides').delete().eq('id', id);

  if (error) {
    console.error('Error eliminando slide:', error);
    throw new Error('No se pudo eliminar el slide');
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/carousel');
}
