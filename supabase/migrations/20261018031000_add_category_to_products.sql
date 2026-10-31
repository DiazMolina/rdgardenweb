-- Migration: Add category to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Plantas de Interior';
