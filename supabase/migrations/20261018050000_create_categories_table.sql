-- Migration: Create categories table and seed default data
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial categories
INSERT INTO public.categories (name, slug, description, image_url)
VALUES
  ('Plantas de Interior', 'plantas-de-interior', 'Monsteras, Filodendros y plantas para sombra', 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=800&auto=format&fit=crop'),
  ('Plantas de Exterior', 'plantas-de-exterior', 'Aglaonemas, palmeras y plantas resistentes al sol', 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=800&auto=format&fit=crop'),
  ('Macetas', 'macetas', 'Macetas de cerámica, barro y diseño moderno', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop'),
  ('Herramientas', 'herramientas', 'Accesorios, sustratos y herramientas de jardinería', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop')
ON CONFLICT (name) DO NOTHING;
