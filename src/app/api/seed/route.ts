import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/security/admin';
import { faker } from '@faker-js/faker';

export async function GET() {
  return NextResponse.json({ error: 'Método no permitido' }, { status: 405, headers: { Allow: 'POST' } });
}

export async function POST(request: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 401 }); }
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) return NextResponse.json({ error: 'Origen inválido' }, { status: 403 });
  const databaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://invalid.invalid').hostname;
  if (process.env.NODE_ENV !== 'development' || process.env.ENABLE_LOCAL_SEED !== 'true' || !['localhost', '127.0.0.1', '[::1]'].includes(databaseHost)) {
    return NextResponse.json({ error: 'Operación disponible únicamente con base local de desarrollo' }, { status: 403 });
  }
  // Verificamos que la URL esté configurada correctamente
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('tu-proyecto')) {
    return NextResponse.json(
      { error: 'Por favor, actualiza NEXT_PUBLIC_SUPABASE_URL en el archivo .env.local con tu URL real.' },
      { status: 400 }
    );
  }

  const categorias = ['Plantas de Interior', 'Plantas de Exterior', 'Macetas', 'Herramientas'];

  try {
    // Generamos 20 productos aleatorios usando Faker
    const fakeProducts = Array.from({ length: 20 }).map(() => ({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      stock: faker.number.int({ min: 0, max: 100 }),
      image_url: faker.image.urlPicsumPhotos(),
      category: faker.helpers.arrayElement(categorias),
    }));

    // Insertamos en la base de datos usando nuestro cliente Admin (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(fakeProducts)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '¡Datos generados e insertados exitosamente!',
      count: data.length,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'No se pudieron generar los datos locales' },
      { status: 500 }
    );
  }
}
