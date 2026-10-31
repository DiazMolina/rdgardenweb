'use server';
import { requireAdmin } from '@/lib/security/admin';
import { validateForm, uuid, integer } from '@/lib/security/validation';


import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addProduct(formData: FormData) {
  await requireAdmin();
  validateForm(formData);
  const sizesRaw = formData.get('sizes') as string;
  const sizesArray = sizesRaw
    ? sizesRaw.split(',').map(s => s.trim()).filter(Boolean)
    : ['Maceta 4"', 'Maceta 6"', 'Maceta 8"'];

  const mainImageUrl = (formData.get('image_url') as string) || '';
  const leafImageUrl = (formData.get('image_leaf') as string) || '';
  const rootsImageUrl = (formData.get('image_roots') as string) || '';
  const extraImageUrl = (formData.get('image_extra') as string) || '';

  const imagesArray = [mainImageUrl, leafImageUrl, rootsImageUrl, extraImageUrl]
    .map(url => url.trim())
    .filter(Boolean);

  const isPublished = formData.get('is_published') === 'true' || formData.get('is_published') === 'on' || formData.get('is_published') === null;

  const rawOriginalPrice = formData.get('original_price') as string;
  const originalPriceVal = rawOriginalPrice && rawOriginalPrice.trim() !== '' ? parseFloat(rawOriginalPrice) : null;

  const baseData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: parseFloat(formData.get('price') as string),
    stock: parseInt(formData.get('stock') as string),
    image_url: mainImageUrl,
    category: (formData.get('category') as string) || 'Plantas de Interior',
    badge: (formData.get('badge') as string) || 'Exótica',
    sizes: sizesArray,
    care_instructions: formData.get('care_instructions') as string,
    shipping_info: formData.get('shipping_info') as string,
    faq: formData.get('faq') as string,
  };

  // Intentar insertar con las columnas avanzadas
  let insertResult = await supabaseAdmin.from('products').insert([{
    ...baseData,
    images: imagesArray,
    is_published: isPublished
  }]).select('id').single();

  // Si falló por falta de columnas en la tabla, insertar solo los campos base
  if (insertResult.error) {
    console.warn('Aviso insertando con columnas extendidas (reintentando con campos base):', insertResult.error.message);
    insertResult = await supabaseAdmin.from('products').insert([baseData]).select('id').single();
  }

  if (insertResult.error || !insertResult.data) {
    console.error('Error insertando producto:', insertResult.error);
    throw new Error('No se pudo crear el producto');
  }

  const createdId = insertResult.data.id;

  // Guardar fotos extendidas, visibilidad y precio original en site_settings como respaldo asegurado
  const newSettingsToUpsert = [
    {
      key: `product_images_${createdId}`,
      value: JSON.stringify(imagesArray),
      updated_at: new Date().toISOString()
    },
    {
      key: `product_visibility_${createdId}`,
      value: isPublished ? 'true' : 'false',
      updated_at: new Date().toISOString()
    }
  ];

  if (originalPriceVal !== null) {
    newSettingsToUpsert.push({
      key: `product_original_price_${createdId}`,
      value: originalPriceVal.toString(),
      updated_at: new Date().toISOString()
    });
  }

  await supabaseAdmin.from('site_settings').upsert(newSettingsToUpsert);

  revalidatePath('/');
  revalidatePath('/catalogo');
  revalidatePath('/admin');

  redirect('/admin');
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();
  validateForm(formData);
  uuid(id);
  const sizesRaw = formData.get('sizes') as string;
  const sizesArray = sizesRaw
    ? sizesRaw.split(',').map(s => s.trim()).filter(Boolean)
    : ['Maceta 4"', 'Maceta 6"', 'Maceta 8"'];

  const mainImageUrl = (formData.get('image_url') as string) || '';
  const leafImageUrl = (formData.get('image_leaf') as string) || '';
  const rootsImageUrl = (formData.get('image_roots') as string) || '';
  const extraImageUrl = (formData.get('image_extra') as string) || '';

  const imagesArray = [mainImageUrl, leafImageUrl, rootsImageUrl, extraImageUrl]
    .map(url => url.trim())
    .filter(Boolean);

  const isPublished = formData.get('is_published') === 'true' || formData.get('is_published') === 'on';

  const rawOriginalPrice = formData.get('original_price') as string;
  const originalPriceVal = rawOriginalPrice && rawOriginalPrice.trim() !== '' ? parseFloat(rawOriginalPrice) : null;

  const baseData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: parseFloat(formData.get('price') as string),
    stock: parseInt(formData.get('stock') as string),
    image_url: mainImageUrl,
    category: (formData.get('category') as string) || 'Plantas de Interior',
    badge: (formData.get('badge') as string) || 'Exótica',
    sizes: sizesArray,
    care_instructions: formData.get('care_instructions') as string,
    shipping_info: formData.get('shipping_info') as string,
    faq: formData.get('faq') as string,
  };

  // Intentar actualizar con columnas avanzadas
  let updateResult = await supabaseAdmin
    .from('products')
    .update({
      ...baseData,
      images: imagesArray,
      is_published: isPublished
    })
    .eq('id', id);

  // Si falló por falta de columnas en la tabla, actualizar base
  if (updateResult.error) {
    console.warn('Aviso actualizando con columnas extendidas (reintentando con campos base):', updateResult.error.message);
    updateResult = await supabaseAdmin
      .from('products')
      .update(baseData)
      .eq('id', id);
  }

  if (updateResult.error) {
    console.error('Error actualizando producto:', updateResult.error);
    throw new Error('No se pudo actualizar el producto');
  }

  // Guardar siempre respaldo de imágenes, visibilidad y precio original en site_settings
  const settingsToUpsert = [
    {
      key: `product_images_${id}`,
      value: JSON.stringify(imagesArray),
      updated_at: new Date().toISOString()
    },
    {
      key: `product_visibility_${id}`,
      value: isPublished ? 'true' : 'false',
      updated_at: new Date().toISOString()
    }
  ];

  if (originalPriceVal !== null) {
    settingsToUpsert.push({
      key: `product_original_price_${id}`,
      value: originalPriceVal.toString(),
      updated_at: new Date().toISOString()
    });
  }

  await supabaseAdmin.from('site_settings').upsert(settingsToUpsert);

  if (originalPriceVal === null) {
    await supabaseAdmin.from('site_settings').delete().eq('key', `product_original_price_${id}`);
  }

  revalidatePath('/');
  revalidatePath('/catalogo');
  revalidatePath('/admin');
  revalidatePath(`/producto/${id}`);

  redirect('/admin');
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  uuid(id);
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);

  if (error) {
    console.error('Error eliminando producto:', error);
    throw new Error('No se pudo eliminar el producto');
  }

  // Limpiar llaves de site_settings
  await supabaseAdmin.from('site_settings').delete().in('key', [
    `product_images_${id}`,
    `product_visibility_${id}`,
    `product_original_price_${id}`
  ]);

  revalidatePath('/');
  revalidatePath('/catalogo');
  revalidatePath('/admin');
  return { success: true };
}

// Acción Rápida: Actualizar Stock en Línea [+] [-] o número directo
export async function updateProductStock(id: string, newStock: number) {
  await requireAdmin();
  uuid(id);
  integer(newStock);
  const stockVal = Math.max(0, Math.floor(newStock));

  const { error } = await supabaseAdmin
    .from('products')
    .update({ stock: stockVal })
    .eq('id', id);

  if (error) {
    console.error('Error actualizando stock rápido:', error);
    throw new Error('No se pudo actualizar el stock');
  }

  revalidatePath('/');
  revalidatePath('/catalogo');
  revalidatePath('/admin');
  revalidatePath(`/producto/${id}`);

  return { success: true, stock: stockVal };
}

// Acción Rápida: Interruptor de Visibilidad (Publicado / Pausado en Aclimatación)
export async function toggleProductVisibility(id: string, isPublished: boolean) {
  await requireAdmin();
  uuid(id);
  if (typeof isPublished !== "boolean") throw new Error("Visibilidad inválida");
  // Intentar actualizar columna en products
  const { error } = await supabaseAdmin
    .from('products')
    .update({ is_published: isPublished })
    .eq('id', id);

  if (error) {
    console.warn('Aviso al cambiar visibilidad en tabla (usando site_settings):', error.message);
  }

  // Guardar en site_settings como respaldo garantizado
  await supabaseAdmin.from('site_settings').upsert({
    key: `product_visibility_${id}`,
    value: isPublished ? 'true' : 'false',
    updated_at: new Date().toISOString()
  });

  revalidatePath('/');
  revalidatePath('/catalogo');
  revalidatePath('/admin');
  revalidatePath(`/producto/${id}`);

  return { success: true, isPublished };
}
