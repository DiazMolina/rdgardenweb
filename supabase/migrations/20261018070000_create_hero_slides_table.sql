-- Migration: Create hero_slides table for customizable carousel
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  button_text TEXT DEFAULT 'Explorar Tienda',
  button_link TEXT DEFAULT '#coleccion',
  image_url TEXT NOT NULL,
  badge_text TEXT DEFAULT 'Colección Exclusiva de Plantas Raras',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial slides
INSERT INTO public.hero_slides (title, subtitle, description, image_url, badge_text, sort_order)
VALUES
  ('Tropicales', 'Exóticas y Aclimatadas', 'Ejemplares de colección con raíces fuertes y follaje exuberante. Envíos garantizados directo a tu hogar.', 'https://images.unsplash.com/photo-1545241047-6083a36cb1ce?q=80&w=2000&auto=format&fit=crop', 'Colección Exclusiva de Plantas Raras', 1),
  ('Jardín Botánico', 'Follaje Exuberante', 'Transforma tus espacios con plantas de interior seleccionadas a mano por nuestros expertos.', 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2000&auto=format&fit=crop', 'Calidad Premium Garantizada', 2),
  ('Edición Especial', 'Monsteras & Aráceas', 'Descubre especies con patrones de variegación únicos y hojas de gran tamaño.', 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=2000&auto=format&fit=crop', 'Lotes Limitados', 3);
