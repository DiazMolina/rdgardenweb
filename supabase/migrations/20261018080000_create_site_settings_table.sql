-- Migration: Create site_settings table for global editable texts
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial settings
INSERT INTO public.site_settings (key, value)
VALUES
  ('announcement_bar', '🌍 ENVÍOS A TODO EL PAÍS • EMPAQUE TÉRMICO CERTIFICADO Y GARANTÍA DE LLEGADA VIVA 🌿'),
  ('catalog_title', 'Ejemplares Disponibles'),
  ('catalog_subtitle', 'Cultivadas con nutrición balanceada y parámetros ambientales optimizados.'),
  ('featured_title', 'Colecciones Destacadas'),
  ('featured_subtitle', 'Curaduría Botánica')
ON CONFLICT (key) DO NOTHING;
