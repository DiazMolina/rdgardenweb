'use server';
import { requireAdmin } from '@/lib/security/admin';
import { validateForm, uuid } from '@/lib/security/validation';


import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addCategory(formData: FormData) {
  await requireAdmin();
  validateForm(formData);
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const image_url = formData.get('image_url') as string;
  const sort_order = parseInt(formData.get('sort_order') as string) || 0;
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const { error } = await supabaseAdmin.from('categories').insert([
    { name, slug, description, image_url, sort_order }
  ]);

  if (error) {
    console.error('Error creando categoría:', error);
    throw new Error('No se pudo crear la categoría');
  }

  revalidatePath('/');
  revalidatePath('/catalogo');
  revalidatePath('/admin');
  revalidatePath('/admin/categories');

  redirect('/admin/categories');
}

export async function updateCategory(id: string, formData: FormData) {
  await requireAdmin();
  validateForm(formData);
  uuid(id);
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const image_url = formData.get('image_url') as string;
  const sort_order = parseInt(formData.get('sort_order') as string) || 0;
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const { error } = await supabaseAdmin
    .from('categories')
    .update({ name, slug, description, image_url, sort_order })
    .eq('id', id);

  if (error) {
    console.error('Error actualizando categoría:', error);
    throw new Error('No se pudo actualizar la categoría');
  }

  revalidatePath('/');
  revalidatePath('/catalogo');
  revalidatePath('/admin');
  revalidatePath('/admin/categories');

  redirect('/admin/categories');
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  uuid(id);
  const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);

  if (error) {
    console.error('Error eliminando categoría:', error);
    throw new Error('No se pudo eliminar la categoría');
  }

  revalidatePath('/');
  revalidatePath('/catalogo');
  revalidatePath('/admin');
  revalidatePath('/admin/categories');
}
