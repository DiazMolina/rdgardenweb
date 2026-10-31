-- schema.sql
-- Ejecuta este script en el SQL Editor de Supabase para inicializar R&D Garden

-- 1. Tabla: Categorias
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabla: Productos (La Publicación)
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  descripcion TEXT,
  imagen_principal VARCHAR(500),
  categoria_id UUID REFERENCES categorias(id),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabla: Variantes (Las opciones de Tamaño y Color con foto)
CREATE TABLE variantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  sku VARCHAR(100) UNIQUE NOT NULL,
  tamano VARCHAR(100) NOT NULL,
  color VARCHAR(100) NOT NULL,
  precio_regular DECIMAL(10, 2) NOT NULL,
  precio_oferta DECIMAL(10, 2),
  oferta_inicio TIMESTAMP WITH TIME ZONE,
  oferta_fin TIMESTAMP WITH TIME ZONE,
  stock INTEGER NOT NULL DEFAULT 0,
  imagen_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);