'use server';

import { requireAdmin } from '@/lib/security/admin';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function uploadProductImageAction(formData: FormData) {
  await requireAdmin();

  const file = formData.get('file') as File | null;
  if (!file) {
    return { success: false, error: 'No se envió ningún archivo' };
  }

  // Validación de tipo MIME
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
  if (!allowedMimes.includes(file.type)) {
    return { success: false, error: 'Formato no soportado. Usa JPG, PNG o WebP.' };
  }

  // Validación de tamaño (Máximo 10 MB)
  if (file.size > 10 * 1024 * 1024) {
    return { success: false, error: 'El archivo supera el límite de 10 MB.' };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generar nombre de archivo único
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanExt = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'].includes(ext) ? ext : 'jpg';
    const filePath = `plant-${timestamp}-${randomStr}.${cleanExt}`;

    const { data, error } = await supabaseAdmin.storage
      .from('products')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error('Error subiendo imagen a Supabase Storage:', error);
      return { success: false, error: 'No se pudo subir la imagen al almacenamiento de Supabase.' };
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('products')
      .getPublicUrl(filePath);

    return { success: true, url: publicUrlData.publicUrl };
  } catch (err: any) {
    console.error('Error procesando imagen:', err);
    return { success: false, error: err.message || 'Error inesperado al subir la imagen' };
  }
}
